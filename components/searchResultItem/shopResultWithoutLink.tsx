import { IBookingShop, IShop } from "interfaces";
import React from "react";
import cls from "./shopResultWithoutLink.module.scss";
import ShopLogoBackground from "components/shopLogoBackground/shopLogoBackground";
import { useTranslation } from "react-i18next";
import getShortTimeType from "utils/getShortTimeType";
import useShopBookingSchedule from "hooks/useShopBookingSchedule";

interface Props {
  data: IBookingShop;
  onClickItem?: (data: IBookingShop) => void;
}

const convertToShop = (bookingShop: IBookingShop): IShop => ({
  ...bookingShop,
  verify: Number(bookingShop.verify),
  delivery_time: bookingShop.delivery_time ? {
    from: Number(bookingShop.delivery_time.from),
    to: Number(bookingShop.delivery_time.to),
    type: bookingShop.delivery_time.type
  } : undefined
});

export default function ShopResultWithoutLinkItem({ data, onClickItem }: Props) {
  const { t } = useTranslation();
  const { workingSchedule, isShopClosed } = useShopBookingSchedule(data);

  const handleClick = () => {
    if (!onClickItem) return;
    onClickItem(data);
  };

  return (
    <div className={cls.wrapper}>
      <button
        className={cls.flex}
        onClick={handleClick}
        style={{ width: "100%" }}
      >
        <ShopLogoBackground data={convertToShop(data)} />
        <div className={cls.naming}>
          <h3 className={cls.title}>{data.translation?.title}</h3>
          <p className={cls.text}>
            {data.delivery_time?.from} - {data.delivery_time?.to}{" "}
            {t(getShortTimeType(data.delivery_time?.type))}
          </p>
        </div>
      </button>
    </div>
  );
}
