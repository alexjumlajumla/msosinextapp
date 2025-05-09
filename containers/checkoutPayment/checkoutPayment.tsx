import React, { useMemo, useState } from "react";
import PrimaryButton from "components/button/primaryButton";
import BankCardLineIcon from "remixicon-react/BankCardLineIcon";
import Coupon3LineIcon from "remixicon-react/Coupon3LineIcon";
import HandCoinLineIcon from "remixicon-react/HandCoinLineIcon";
import cls from "./checkoutPayment.module.scss";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "@mui/material";
import dynamic from "next/dynamic";
import useModal from "hooks/useModal";
import { useAppSelector } from "hooks/useRedux";
import { selectUserCart } from "redux/slices/userCart";
import { useQuery } from "react-query";
import orderService from "services/order";
import Price from "components/price/price";
import Loading from "components/loader/loading";
import { IShop, OrderFormValues, Payment, Location, Currency } from "interfaces";
import { FormikProps } from "formik";
import { DoubleCheckIcon } from "components/icons";
import Coupon from "components/coupon/coupon";
import PaymentMethod from "components/paymentMethod/paymentMethod";
import { useAuth } from "contexts/auth/auth.context";
import { warning, error } from "components/alert/toast";
import { selectCurrency } from "redux/slices/currency";
import { useSettings } from "contexts/settings/settings.context";
import TipWithoutPayment from "components/tip/tipWithoutPayment";
import ModalContainer from "../modal/modal";

const DrawerContainer = dynamic(() => import("containers/drawer/drawer"));
const MobileDrawer = dynamic(() => import("containers/drawer/mobileDrawer"));

interface Props {
  formik: FormikProps<OrderFormValues>;
  loading?: boolean;
  payments: Payment[];
  onPhoneVerify: () => void;
  shop?: IShop;
}

type OrderType = {
  bonus_shop: any;
  coupon_price: number;
  delivery_fee: number;
  price: number;
  total_discount: number;
  total_price: number;
  total_shop_tax: number;
  total_tax: number;
  service_fee: number;
  tips: number;
} | {
  bonus_shop?: undefined;
  coupon_price?: undefined;
  delivery_fee?: undefined;
  price?: undefined;
  total_discount?: undefined;
  total_price?: undefined;
  total_shop_tax?: undefined;
  total_tax?: undefined;
  service_fee?: undefined;
  tips?: undefined;
};

type CalculatePayload = {
  address: Location | null;
  type: 'delivery' | 'pickup' | undefined;
  coupon: string | undefined;
  currency_id: number | undefined;
  tips: number | undefined;
};

export default function CheckoutPayment({
  formik,
  loading = false,
  payments = [],
  onPhoneVerify,
  shop,
}: Props) {
  const { t } = useTranslation();
  const isDesktop = useMediaQuery("(min-width:1140px)");
  const { user } = useAuth();
  const [
    paymentMethodDrawer,
    handleOpenPaymentMethod,
    handleClosePaymentMethod,
  ] = useModal();
  const [promoDrawer, handleOpenPromo, handleClosePromo] = useModal();
  const [openTip, handleOpenTip, handleCloseTip] = useModal();
  const cart = useAppSelector(selectUserCart);
  const currency = useAppSelector(selectCurrency) as Currency;
  const defaultCurrency = useAppSelector(
    (state) => state.currency.defaultCurrency,
  );
  const [order, setOrder] = useState<OrderType>({});
  const [calculateError, setCalculateError] = useState<null | boolean>(null);
  const { coupon, location, delivery_type, payment_type, tips } = formik.values;
  const { settings } = useSettings();

  const payload: CalculatePayload = useMemo(
    () => ({
      address: location || null,
      type: delivery_type,
      coupon,
      currency_id: currency?.id,
      tips: tips || undefined,
    }),
    [location, delivery_type, coupon, currency, tips],
  );

  const { isLoading } = useQuery(
    ["calculate", payload, cart],
    () => {
      if (!cart.id) throw new Error("Cart ID is required");
      return orderService.calculate(cart.id, payload);
    },
    {
      onSuccess: (data) => {
        setOrder(data.data);
        setCalculateError(false);
      },
      onError: (err: any) => {
        setCalculateError(true);
        error(err.data?.message);
      },
      staleTime: 0,
      enabled: !!cart.id,
    },
  );

  function handleOrderCreate() {
    console.log("checkout");
    const shopMinAmount = typeof shop?.min_amount === 'string' ? parseFloat(shop.min_amount) : (shop?.min_amount || 1);
    const localShopMinPrice =
      ((currency?.rate || 1) * shopMinAmount) /
      (defaultCurrency?.rate || 1);
    if (!user?.phone && settings?.before_order_phone_required === "1") {
      onPhoneVerify();
      return;
    }
    if (payment_type?.tag === "wallet") {
      if (Number(order.total_price) > Number(user.wallet?.price)) {
        warning(t("insufficient.wallet.balance"));
        return;
      }
    }
    if (
      shop &&
      shop?.min_amount &&
      defaultCurrency &&
      currency &&
      localShopMinPrice >= Number(order.price)
    ) {
      warning(
        <span>
          {t("your.order.did.not.reach.min.amount.min.amount.is")}{" "}
          <Price number={localShopMinPrice} />
        </span>,
      );
      return;
    }
    formik.handleSubmit();
  }

  const handleAddTips = (number: number) => {
    formik.setFieldValue("tips", number);
    handleCloseTip();
  };

  return (
    <div className={cls.card}>
      <div className={cls.cardHeader}>
        <h3 className={cls.title}>{t("payment")}</h3>
        <div className={cls.flex}>
          <div className={cls.flexItem}>
            <BankCardLineIcon />
            <span className={cls.text}>
              {payment_type ? (
                <span style={{ textTransform: "capitalize" }}>
                  {t(payment_type?.tag)}
                </span>
              ) : (
                t("payment.method")
              )}
            </span>
          </div>
          <button className={cls.action} onClick={handleOpenPaymentMethod}>
            {t("edit")}
          </button>
        </div>
        <div className={cls.flex}>
          <div className={cls.flexItem}>
            <Coupon3LineIcon />
            <span className={cls.text}>
              {coupon ? (
                <span className={cls.coupon}>
                  {coupon} <DoubleCheckIcon />
                </span>
              ) : (
                t("promo.code")
              )}
            </span>
          </div>
          <button className={cls.action} onClick={handleOpenPromo}>
            {t("enter")}
          </button>
        </div>
        <div className={cls.flex}>
          <div className={cls.flexItem}>
            <HandCoinLineIcon />
            <span className={cls.text}>
              {order?.tips ? (
                <span style={{ textTransform: "capitalize" }}>
                  <Price number={order?.tips} symbol={currency?.symbol} />
                </span>
              ) : (
                t("tip")
              )}
            </span>
          </div>
          <button className={cls.action} onClick={handleOpenTip}>
            {t("enter")}
          </button>
        </div>
      </div>
      <div className={cls.cardBody}>
        <div className={cls.block}>
          <div className={cls.row}>
            <div className={cls.item}>{t("subtotal")}</div>
            <div className={cls.item}>
              <Price number={order.price} />
            </div>
          </div>
          <div className={cls.row}>
            <div className={cls.item}>{t("delivery.price")}</div>
            <div className={cls.item}>
              <Price number={order.delivery_fee} />
            </div>
          </div>
          <div className={cls.row}>
            <div className={cls.item}>{t("total.tax")}</div>
            <div className={cls.item}>
              <Price number={order.total_tax} />
            </div>
          </div>
          <div className={cls.row}>
            <div className={cls.item}>{t("discount")}</div>
            <div className={cls.item}>
              <Price number={order.total_discount} minus />
            </div>
          </div>
          {coupon ? (
            <div className={cls.row}>
              <div className={cls.item}>{t("promo.code")}</div>
              <div className={cls.item}>
                <Price number={order.coupon_price} minus />
              </div>
            </div>
          ) : (
            ""
          )}
          <div className={cls.row}>
            <div className={cls.item}>{t("service.fee")}</div>
            <div className={cls.item}>
              <Price number={order.service_fee} />
            </div>
          </div>
          <div className={cls.row}>
            <div className={cls.item}>{t("tips")}</div>
            <div className={cls.item}>
              <Price number={order?.tips} />
            </div>
          </div>
        </div>
        <div className={cls.cardFooter}>
          <div className={cls.btnWrapper}>
            <PrimaryButton
              type="submit"
              onClick={handleOrderCreate}
              loading={loading}
              disabled={isLoading || !!calculateError}
            >
              {t("continue.payment")}
            </PrimaryButton>
          </div>
          <div className={cls.priceBlock}>
            <p className={cls.text}>{t("total")}</p>
            <div className={cls.price}>
              <Price number={order.total_price} />
            </div>
          </div>
        </div>
      </div>

      {isLoading && <Loading />}

      {isDesktop ? (
        <DrawerContainer
          open={paymentMethodDrawer}
          onClose={handleClosePaymentMethod}
          title={t("payment.method")}
        >
          <PaymentMethod
            value={formik.values.payment_type?.tag}
            list={payments}
            handleClose={handleClosePaymentMethod}
            onSubmit={(tag) => {
              const payment = payments?.find((item) => item.tag === tag);
              formik.setFieldValue("payment_type", payment);
              formik.setFieldValue("total_price", order.total_price);
              handleClosePaymentMethod();
            }}
          />
        </DrawerContainer>
      ) : (
        <MobileDrawer
          open={paymentMethodDrawer}
          onClose={handleClosePaymentMethod}
          title={t("payment.method")}
        >
          <PaymentMethod
            value={formik.values.payment_type?.tag}
            list={payments}
            handleClose={handleClosePaymentMethod}
            onSubmit={(tag) => {
              const payment = payments?.find((item) => item.tag === tag);
              formik.setFieldValue("payment_type", payment);
              formik.setFieldValue("total_price", order.total_price);
              handleClosePaymentMethod();
            }}
          />
        </MobileDrawer>
      )}
      {isDesktop ? (
        <DrawerContainer
          open={promoDrawer}
          onClose={handleClosePromo}
          title={t("add.promocode")}
        >
          <Coupon formik={formik} handleClose={handleClosePromo} />
        </DrawerContainer>
      ) : (
        <MobileDrawer
          open={promoDrawer}
          onClose={handleClosePromo}
          title={t("add.promocode")}
        >
          <Coupon formik={formik} handleClose={handleClosePromo} />
        </MobileDrawer>
      )}
      {isDesktop ? (
        <ModalContainer open={openTip} onClose={handleCloseTip}>
          <TipWithoutPayment
            totalPrice={order?.total_price ?? 0}
            currency={currency}
            handleAddTips={handleAddTips}
          />
        </ModalContainer>
      ) : (
        <MobileDrawer open={openTip} onClose={handleCloseTip}>
          <TipWithoutPayment
            totalPrice={order?.total_price ?? 0}
            currency={currency}
            handleAddTips={handleAddTips}
          />
        </MobileDrawer>
      )}
    </div>
  );
}
