import React, { useMemo } from "react";
import { IShop } from "interfaces";
import cls from "./v4.module.scss";
import Link from "next/link";
import getImage from "utils/getImage";
import ShopBadges from "containers/shopBadges/v4";
import FallbackImage from "components/fallbackImage/fallbackImage";
import useLocale from "hooks/useLocale";
import getShortTimeType from "utils/getShortTimeType";
import Price from "components/price/price";
import useShopWorkingSchedule from "hooks/useShopWorkingSchedule";
import VerifiedComponent from "components/verifiedComponent/verifiedComponent";
import { getDistance } from "utils/getDistance";
import PinDistanceLineIcon from "remixicon-react/PinDistanceLineIcon";
import useUserLocation from "hooks/useUserLocation";

type Props = {
  data: IShop;
  loading?: boolean;
};

export default function ShopCard({ data, loading }: Props) {
  const { t } = useLocale();
  const { isShopClosed } = useShopWorkingSchedule(data);
  const location = useUserLocation();

  const distance = useMemo(() => {
    return getDistance(
      Number(location?.latitude),
      Number(location?.longitude),
      Number(data?.location?.latitude),
      Number(data?.location?.longitude)
    );
  }, [location, data?.location]);

  return (
    <Link
      href={`/shop/${data.id}`}
      className={`${cls.wrapper} ${
        !data.open || isShopClosed ? cls.closed : ""
      }`}
    >
      <div className={cls.header}>
        {(!data.open || isShopClosed) && (
          <div className={cls.closedText}>{t("closed")}</div>
        )}
        <FallbackImage
          fill
          src={getImage(data.background_img)}
          alt={data.translation?.title}
          sizes="400px"
        />
      </div>
      <div className={cls.body}>
        <div className={cls.content}>
          <h3 className={cls.title}>
            {data.translation?.title}
            {data?.verify === 1 && <VerifiedComponent />}
          </h3>
          <div className={cls.flex}>
            <span className={cls.text}>
              <Price number={data.price} /> {t("delivery.fee")}
            </span>

            <span className={cls.dot} />
            <span className={cls.text}>
              {data.delivery_time?.from}-{data.delivery_time?.to}{" "}
              {t(getShortTimeType(data.delivery_time?.type))}
            </span>
          </div>
        </div>
        <div className={cls.rating}>{data.rating_avg?.toFixed(1) || 0}</div>
      </div>
      <div className={cls.footer}>
        <ShopBadges data={data} />
      </div>
      {distance > 0 && (
        <div className={cls.distancePill}>
          <PinDistanceLineIcon size={16} />
          <span>{distance.toFixed(1)} km</span>
        </div>
      )}
    </Link>
  );
}
