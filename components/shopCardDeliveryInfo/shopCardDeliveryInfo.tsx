import React from "react";
import cls from "./shopCardDeliveryInfo.module.scss";
import useLocale from "hooks/useLocale";
import getShortTimeType from "utils/getShortTimeType";

type ShopDeliveryTime = {
  from: number;
  to: number;
  type: string;
};

type Props = {
  data?: ShopDeliveryTime;
};

export default function ShopCardDeliveryInfo({ data }: Props) {
  const { t } = useLocale();

  if (!data) return null;

  return (
    <div className={cls.wrapper}>
      <span className={cls.text}>
        {data.from}-{data.to} {t(getShortTimeType(data.type))}
      </span>
    </div>
  );
}
