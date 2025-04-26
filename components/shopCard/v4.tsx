import React from "react";
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
import PinDistanceLineIcon from "remixicon-react/PinDistanceLineIcon";
import { getDistance } from "utils/getDistance";
import useUserLocation from "hooks/useUserLocation";

type Props = {
  data: IShop;
  loading?: boolean;
};

export default function ShopCard({ data, loading }: Props) {
  const { t } = useLocale();
  const { isShopClosed } = useShopWorkingSchedule(data);
  const userLocation = useUserLocation();

  // Debug logging for all relevant data
  React.useEffect(() => {
    if (data) {
      console.group('ShopCard Data Debug');
      console.log('Full shop data:', data);
      console.log('Distance:', data.distance);
      console.log('Location:', data.location);
      console.log('Min amount:', data.min_amount);
      console.log('Price:', data.price);
      console.log('Delivery time:', data.delivery_time);
      console.log('User location:', userLocation);
      console.groupEnd();
    }
  }, [data, userLocation]);

  const renderDistance = () => {
    // If API provides distance directly, use it
    if (data.distance !== undefined && data.distance !== null) {
      const distance = Number(data.distance);
      if (isNaN(distance)) {
        console.warn('Invalid distance value:', data.distance);
        return null;
      }

      const text = distance < 1 
        ? `${(distance * 1000).toFixed(0)}m`
        : `${distance.toFixed(1)}km`;

      return (
        <div className={cls.badge}>
          <PinDistanceLineIcon size={16} />
          <span>{text}</span>
        </div>
      );
    }

    // Check if we have all required location data
    if (!userLocation?.latitude || !userLocation?.longitude || !data.location?.latitude || !data.location?.longitude) {
      console.warn('Missing location data:', {
        userLocation,
        shopLocation: data.location
      });
      return null;
    }
    
    const distance = getDistance(
      userLocation.latitude,
      userLocation.longitude,
      Number(data.location.latitude),
      Number(data.location.longitude)
    );

    if (!distance) {
      console.warn('Could not calculate distance');
      return null;
    }
    
    const text = distance < 1 
      ? `${(distance * 1000).toFixed(0)}m`
      : `${distance.toFixed(1)}km`;

    return (
      <div className={cls.badge}>
        <PinDistanceLineIcon size={16} />
        <span>{text}</span>
      </div>
    );
  };

  // Ensure min_amount is properly handled
  const minAmount = React.useMemo(() => {
    if (data.min_amount === undefined || data.min_amount === null) return 0;
    const amount = Number(data.min_amount);
    return isNaN(amount) ? 0 : amount;
  }, [data.min_amount]);

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
        {renderDistance()}
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
          {minAmount > 0 && (
            <div className={cls.minAmount}>
              {t("min.amount")}: <Price number={minAmount} />
            </div>
          )}
        </div>
        <div className={cls.rating}>{data.rating_avg?.toFixed(1) || 0}</div>
      </div>
      <div className={cls.footer}>
        <ShopBadges data={data} />
      </div>
    </Link>
  );
}
