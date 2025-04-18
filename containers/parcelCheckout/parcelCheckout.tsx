import React, { useState } from "react";
import cls from "./parcelCheckout.module.scss";
import dayjs from "dayjs";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import { useAuth } from "contexts/auth/auth.context";
import { useSettings } from "contexts/settings/settings.context";
import { Grid, useMediaQuery, CircularProgress } from "@mui/material";
import { useMutation, useQuery } from "react-query";
import { error as showError } from "components/alert/toast";
import { useRouter } from "next/router";
import ShopForm from "components/shopForm/shopForm";
import Unauthorized from "components/unauthorized/unauthorized";
import parcelService from "services/parcel";
import { ParcelFormValues, ParcelType } from "interfaces/parcel.interface";
import { useAppSelector } from "hooks/useRedux";
import { selectCurrency } from "redux/slices/currency";
import paymentService from "services/payment";
import { EXTERNAL_PAYMENTS } from "constants/constants";
import { AxiosError } from 'axios';
import { PaymentPayload, PaymentList, PaymentResponse } from 'interfaces/payment.interface';
import { ErrorBoundary } from 'react-error-boundary';
import ParcelSenderForm from "components/parcelForm/parcelForm";

const defaultLocation = {
  latitude: "0",
  longitude: "0"
};

// Add this helper function
const validateLocation = (location: string | undefined) => {
  if (!location) return defaultLocation;
  const [lat, lng] = location.split(",");
  return {
    latitude: lat || defaultLocation.latitude,
    longitude: lng || defaultLocation.longitude,
  };
};

type Props = {
  children: any;
};

export default function ParcelCheckoutContainer({ children }: Props) {
  const { t } = useTranslation();
  const isDesktop = useMediaQuery("(min-width:1140px)");
  const { isAuthenticated, user } = useAuth();
  const { address, location } = useSettings();
  const latlng = location;
  const { push } = useRouter();
  const currency = useAppSelector(selectCurrency);
  const [selectedType, setSelectedType] = useState<ParcelType | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectType = (value: ParcelType) => {
    setSelectedType(value);
  };

  const { data: payments } = useQuery<PaymentList>("payments", () =>
    paymentService.getAll(),
  );

  const defaultLocation = {
    latitude: "0",
    longitude: "0"
  };

  const initialLocation = validateLocation(latlng);

  const formik = useFormik<ParcelFormValues>({
      initialValues: {
        currency_id: currency?.id || 0,
        rate: currency?.rate || 0,
        type_id: "",
        phone_from: user?.phone || "",
        username_from: [user?.firstname, user?.lastname].join(" "),
        location_from: {
          latitude: initialLocation.latitude,
          longitude: initialLocation.longitude,
        },
        address_from: address || "",
        house_from: "",
        stage_from: "",
        room_from: "",
        phone_to: "",
        username_to: "",
        location_to: {
          latitude: initialLocation.latitude,
          longitude: (Number(initialLocation.longitude) + 0.01).toString(),
        },
        address_to: address || "",
        house_to: "",
        stage_to: "",
        room_to: "",
        delivery_date: dayjs().add(1, "day").format("YYYY-MM-DD"),
        delivery_time: "13:00",
        note: "",
        images: [],
        payment_type_id: undefined,
        description: "",
        qr_value: "",
        instructions: "",
        notify: false,
      },
      onSubmit: async (values: Partial<ParcelFormValues>) => {
        try {
          setIsSubmitting(true);
          const body: ParcelFormValues = {
            currency_id: currency?.id ?? 0,
            type_id: values.type_id || "",
            rate: currency?.rate ?? 0,
            phone_from: values.phone_from || "",
            username_from: values.username_from || "",
            location_from: values.location_from || { latitude: "", longitude: "" },
            address_from: values.address_from || "",
            house_from: values.house_from || "",
            stage_from: values.stage_from || "",
            room_from: values.room_from || "",
            phone_to: values.phone_to || "",
            username_to: values.username_to || "",
            location_to: values.location_to || { latitude: "", longitude: "" },
            address_to: values.address_to || "",
            house_to: values.house_to || "",
            stage_to: values.stage_to || "",
            room_to: values.room_to || "",
            delivery_date: values.delivery_date || "",
            delivery_time: values.delivery_time || "",
            note: values.note || "",
            images: values.images || [],
            payment_type_id: values.payment_type_id || 0,
            description: values.description || "",
            qr_value: values.qr_value || "",
            instructions: values.instructions || "",
            notify: Boolean(values.notify)
          };
          mutate(body);
        } finally {
          setIsSubmitting(false);
        }
      },
    validate: (values: Partial<ParcelFormValues>) => {
      const errors: Partial<ParcelFormValues> = {};
      const re = /^[\+]?[0-9\b]+$/;
      if (!values.type_id) {
        errors.type_id = t("required");
      }
      if (!values.payment_type_id) {
        errors.payment_type_id = t("required");
      }
      if (!values.phone_from) {
        errors.phone_from = t("required");
      } else if (!re.test(values.phone_from)) {
        errors.phone_from = t("invalid");
      }
      if (!values.username_from) {
        errors.username_from = t("required");
      }
      if (!values.address_from) {
        errors.address_from = t("required");
      }
      if (!values.phone_to) {
        errors.phone_to = t("required");
      } else if (!re.test(values.phone_to)) {
        errors.phone_to = t("invalid");
      }
      if (!values.username_to) {
        errors.username_to = t("required");
      }
      if (!values.address_to) {
        errors.address_to = t("required");
      }
      if (!values.delivery_date) {
        errors.delivery_date = t("required");
      }
      if (!values.delivery_time) {
        errors.delivery_time = t("required");
      }
      return errors;
    },
  });

  const { isLoading, mutate } = useMutation({
    mutationFn: (data: ParcelFormValues) => parcelService.create(data),
    onSuccess: (response) => {
      const paymentId = formik.values.payment_type_id;
      if (!paymentId) {
        showError(t("please.select.payment.method"));
        return;
      }
      
      const payload: PaymentPayload = {
        id: response.data.id,
        payment: { payment_sys_id: paymentId },
      };
      
      const paymentType = payments?.data.find((item) => item.id === paymentId)?.tag;
      
      if (EXTERNAL_PAYMENTS.includes(paymentType || "")) {
        externalPay({
          name: paymentType || '',
          data: { parcel_id: payload.id },
        });
      } else {
        transactionCreate(payload);
      }
    },
    onError: (err: AxiosError<any>) => {
      showError(err.response?.data?.message || t("error.400"));
    },
  });
  const { isLoading: isLoadingTransaction, mutate: transactionCreate } =
    useMutation({
      mutationFn: (data: PaymentPayload) =>
        paymentService.parcelTransaction(data.id, data.payment),
      onSuccess: (data: PaymentResponse) => {
        push(`/parcels/${data.data.id}`);
      },
      onError: (err: AxiosError<{message: string}>) => {
        showError(err.response?.data?.message || t("error.400"));
      },
    });

  const { isLoading: externalPayLoading, mutate: externalPay } = useMutation({
    mutationFn: (payload: { name: string; data: { parcel_id: number } }) =>
      paymentService.payExternal(payload.name, payload.data),
    onSuccess: (data: PaymentResponse) => {
      window.location.replace(data.data.data.url);
    },
    onError: (err: AxiosError<{message: string}>) => {
      showError(err.response?.data?.message || t("error.400"));
    },
  });

  return (
    <ErrorBoundary
      fallback={<div className={cls.error}>{t("something.went.wrong")}</div>}
      onError={(error) => {
        console.error("Parcel Checkout Error:", error);
        showError(t("error.400"));
      }}
    >
      <div className={cls.root}>
        <div className={cls.container}>
          <div className="container">
            <div className={cls.header}>
              <h1 className={cls.title}>{t("door.to.door.delivery")}</h1>
            </div>
          </div>
        </div>
        <div className="container">
          {payments?.data ? (
            <form className={cls.wrapper} onSubmit={formik.handleSubmit}>
              <Grid container spacing={isDesktop ? 4 : 1}>
                {isAuthenticated ? (
                  <>
                    {React.Children.map(children, (child) => {
                      return React.cloneElement(child, {
                        formik,
                        loading: isLoading || isLoadingTransaction || externalPayLoading || isSubmitting,
                        selectedType,
                        handleSelectType,
                      });
                    })}
                    {isAuthenticated && formik ? (
                      <ParcelSenderForm formik={formik} />
                    ) : null}
                  </>
                ) : (
                  <ShopForm xs={12} md={8}>
                    <Unauthorized text={t("sign.in.parcel.order")} />
                  </ShopForm>
                )}
              </Grid>
            </form>
          ) : (
            <div className={cls.loading}>
              <CircularProgress size={24} />
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
