import React from "react";
import cls from "./shopCardDeliveryInfo.module.scss";
import useLocale from "hooks/useLocale";
import getShortTimeType from "utils/getShortTimeType";

type ShopDeliveryTime = {
  from: string | number;
  to: string | number;
  type: string;
};

type Props = {
  data?: ShopDeliveryTime;
};

export default function ShopCardDeliveryInfo({ data }: Props) {
  const { t } = useLocale();

  if (!data) return null;

  const fromValue = typeof data.from === 'string' ? parseInt(data.from, 10) : data.from;
  const toValue = typeof data.to === 'string' ? parseInt(data.to, 10) : data.to;

  return (
    <div className={cls.wrapper}>
      <span className={cls.text}>
        {fromValue}-{toValue} {t(getShortTimeType(data.type))}
      </span>
    </div>
  );
}
