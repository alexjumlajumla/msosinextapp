import React, { useEffect, useMemo, useState } from "react";
import cls from "./checkout.module.scss";
import { IShop, OrderFormValues, Payment } from "interfaces";
import PrimaryButton from "components/button/primaryButton";
import CheckoutPayment from "containers/checkoutPayment/checkoutPayment";
import PhoneInputWithVerification from "components/inputs/phoneInputWithVerification";
import ShopLogoBackground from "components/shopLogoBackground/shopLogoBackground";
import { useFormik } from "formik";
import { useSettings } from "contexts/settings/settings.context";
import orderService from "services/order";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useRouter } from "next/router";
import { useAppSelector } from "hooks/useRedux";
import { selectCurrency } from "redux/slices/currency";
import { selectUserCart } from "redux/slices/userCart";
import BonusCaption from "components/bonusCaption/bonusCaption";
import paymentService from "services/payment";
import { error, success, warning } from "components/alert/toast";
import { useTranslation } from "react-i18next";
import useShopWorkingSchedule from "hooks/useShopWorkingSchedule";
import getFirstValidDate from "utils/getFirstValidDate";
import { selectOrder } from "redux/slices/order";
import { EXTERNAL_PAYMENTS } from "constants/constants";
import { useAuth } from "contexts/auth/auth.context";
import Script from "next/script";

type Props = {
  data: IShop;
  children: any;
  onPhoneVerify: () => void;
};

export default function CheckoutContainer({
  data,
  children,
  onPhoneVerify,
}: Props) {
  const router = useRouter();
  const { t } = useTranslation();
  const { address, location } = useSettings();
  const latlng = location;
  const { user } = useAuth();
  const { replace } = useRouter();
  const currency = useAppSelector(selectCurrency);
  const cart = useAppSelector(selectUserCart);
  const { order } = useAppSelector(selectOrder);
  const { isOpen } = useShopWorkingSchedule(data);
  const queryClient = useQueryClient();
  const [payFastUrl, setPayFastUrl] = useState("");

  const isUsingCustomPhoneSignIn =
    process.env.NEXT_PUBLIC_CUSTOM_PHONE_SINGUP === "true";

  const { data: payments } = useQuery("payments", () =>
    paymentService.getAll(),
  );

  const { paymentType, paymentTypes } = useMemo(() => {
    return {
      paymentType:
        payments?.data?.find((item: Payment) => item.tag === "cash") ||
        payments?.data?.[0],
      paymentTypes: payments?.data || [],
    };
  }, [payments]);

  useEffect(() => {
    if (paymentType) {
      formik.setFieldValue("payment_type", paymentType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payments]);

  const formik = useFormik({
    initialValues: {
      coupon: undefined,
      location: {
        latitude: latlng?.split(",")[0],
        longitude: latlng?.split(",")[1],
      },
      address: {
        address,
        office: "",
        house: "",
        floor: "",
      },
      delivery_date: order.delivery_date || getFirstValidDate(data).date,
      delivery_time: order.delivery_time || getFirstValidDate(data).time,
      delivery_type: "delivery",
      note: undefined,
      payment_type: paymentType,
      for_someone: false,
      username: undefined,
      phone: isUsingCustomPhoneSignIn ? user.phone : undefined,
      notes: {},
      tips: undefined,
    },
    // enableReinitialize: true,
    onSubmit: (values: OrderFormValues) => {
      const trimmedPhone = values.phone?.replace(/[^0-9]/g, "");
      if (!values.payment_type) {
        warning(t("choose.payment.method"));
        return;
      }
      if (!isOpen) {
        warning(t("shop.closed"));
        return;
      }
      if (isUsingCustomPhoneSignIn && !trimmedPhone) {
        warning(t("phone.invalid"));
        return;
      }
      if (values.for_someone) {
        if (!values.username || !values.phone) {
          warning(t("user.details.empty"));
          return;
        }
        if (!trimmedPhone) {
          warning(t("phone.invalid"));
          return;
        }
      }
      const notes = Object.keys(values.notes).reduce((acc: any, key) => {
        const value = values.notes[key]?.trim()?.length
          ? values.notes[key]
          : undefined;
        if (value) {
          acc[key] = value;
        }
        return acc;
      }, {});
      const payload: any = {
        ...values,
        currency_id: currency?.id,
        rate: currency?.rate,
        shop_id: data.id,
        cart_id: cart.id,
        payment_type: undefined,
        for_someone: undefined,
        total_price: order.total_price,
        phone: values.for_someone
          ? trimmedPhone
          : isUsingCustomPhoneSignIn
            ? trimmedPhone
            : user?.phone,
        username: values.for_someone ? values.username : undefined,
        delivery_time: values.delivery_time?.split(" - ")?.at(0),
        coupon:
          values?.coupon && values.coupon.length > 0
            ? values?.coupon
            : undefined,
        note: values?.note && values?.note?.length ? values?.note : undefined,
        notes,
        tips: values?.tips,
      };
      if (EXTERNAL_PAYMENTS.includes(formik.values.payment_type?.tag || "")) {
        externalPay({
          name: formik.values.payment_type?.tag,
          data: payload,
        });
      } else {
        payload.payment_id = values.payment_type?.id;
        createOrder(payload);
      }
    },
    validate: () => {
      return {} as OrderFormValues;
    },
  });

  const { isLoading, mutate: createOrder } = useMutation({
    mutationFn: (data: any) => orderService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["profile"], { exact: false });
      queryClient.invalidateQueries(["cart"], { exact: false });
      replace(`/orders/${data.data.id}`);
    },
    onError: (err: any) => {
      error(err?.data?.message);
    },
  });

  const { isLoading: externalPayLoading, mutate: externalPay } = useMutation({
    mutationFn: (payload: any) =>
      paymentService.payExternal(payload.name, payload.data),
    onSuccess: (data, payload) => {
      if (payload.name === "pay-fast") {
        if (data?.data?.data?.sandbox) {
          setPayFastUrl(
            `https://sandbox.payfast.co.za/onsite/engine.js/?uuid=${data?.data?.data?.uuid}`,
          );
        } else {
          setPayFastUrl(
            `https://www.payfast.co.za/onsite/engine.js/?uuid=${data?.data?.data?.uuid}`,
          );
        }
      } else {
        window.location.replace(data.data.data.url);
      }
    },
    onError: (err: any) => {
      error(err?.data?.message);
    },
  });

  useEffect(() => {
    if (payFastUrl) {
      const script = document.createElement("script");
      script.src = payFastUrl;
      script.async = true;
      script.onload = () => {
        // @ts-ignore
        if (window.payfast_do_onsite_payment) {
          // @ts-ignore
          window.payfast_do_onsite_payment(
            {
              uuid: payFastUrl.split("uuid=")[1],
            },
            (result: boolean) => {
              if (result) {
                success(t("payment.success"));
              } else {
                error(t("payment.failed"));
              }
              setTimeout(() => router.replace("/orders"), 5000);
            },
          );
        }
      };
      document.body.appendChild(script);
      setPayFastUrl("");
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [payFastUrl]);

  return (
    <>
      <div className={cls.root}>
        <div className={cls.container}>
          <div className="container">
            <div className={cls.header}>
              <ShopLogoBackground data={data} />
              <div className={cls.shop}>
                <h1 className={cls.title}>{data?.translation?.title}</h1>
                <p className={cls.text}>
                  {data?.bonus ? (
                    <BonusCaption data={data?.bonus} />
                  ) : (
                    data?.translation?.description
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <section className={cls.wrapper}>
            <main className={cls.body}>
              {React.Children.map(children, (child) => {
                return React.cloneElement(child, {
                  data,
                  formik,
                  onPhoneVerify,
                });
              })}
            </main>
            <aside className={cls.aside}>
              <CheckoutPayment
                formik={formik}
                shop={data}
                loading={isLoading || externalPayLoading}
                payments={paymentTypes}
                onPhoneVerify={onPhoneVerify}
              />
            </aside>
          </section>
        </div>
      </div>
    </>
  );
}

interface VerificationProps {
  onClose: () => void;
  onSuccess: (phone: string) => void;
}

function PhoneVerification({ onClose, onSuccess }: VerificationProps) {
  const { t } = useTranslation();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleVerify = async () => {
    try {
      setLoading(true);
      await verifyPhone(phone);
      setVerified(true);
      onSuccess(phone);
      onClose();
    } catch (err) {
      error(t("phone.verification.failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cls.verificationCard}>
      <div className={cls.header}>
        <h3 className={cls.title}>{t("verify.phone")}</h3>
        <p className={cls.subtitle}>{t("verify.phone.description")}</p>
      </div>
      
      <div className={cls.form}>
        <PhoneInputWithVerification
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onVerify={handleVerify}
          verified={verified}
          disabled={loading}
          error={loading}
        />
      </div>

      <div className={cls.actions}>
        <PrimaryButton
          onClick={handleVerify}
          loading={loading}
          disabled={!phone || verified}
        >
          {verified ? t("verified") : t("verify")}
        </PrimaryButton>
      </div>
    </div>
  );
}

async function verifyPhone(phone: string): Promise<void> {
  if (!phone || phone.length < 10) {
    throw new Error("Invalid phone number");
  }

  try {
    // Simulate API call to verify phone number
    const response = await fetch('/api/verify-phone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone }),
    });

    if (!response.ok) {
      throw new Error('Verification failed');
    }

    // If we get here, verification was successful
    return;
  } catch (error) {
    // Re-throw any errors to be handled by the caller
    throw new Error('Phone verification failed');
  }
}

