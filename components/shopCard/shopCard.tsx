import React from "react";
import { IShop } from "interfaces";
import cls from "./shopCard.module.scss";
import Link from "next/link";
import ShopLogo from "components/shopLogo/shopLogo";
import RunFillIcon from "remixicon-react/RunFillIcon";
import StarSmileFillIcon from "remixicon-react/StarSmileFillIcon";
import MapPinLineIcon from "remixicon-react/MapPinLineIcon";
import getImage from "utils/getImage";
import BonusCaption from "components/bonusCaption/bonusCaption";
import ShopBadges from "containers/shopBadges/shopBadges";
import FallbackImage from "components/fallbackImage/fallbackImage";
import useLocale from "hooks/useLocale";
import getShortTimeType from "utils/getShortTimeType";
import useShopWorkingSchedule from "hooks/useShopWorkingSchedule";
import VerifiedComponent from "components/verifiedComponent/verifiedComponent";
import DistancePill from "components/distancePill/distancePill";

type Props = {
  data: IShop;
};

export default function ShopCard({ data }: Props) {
  const { t } = useLocale();
  const { isShopClosed } = useShopWorkingSchedule(data);

  const formatDistance = (distance?: number) => {
    if (typeof distance !== 'number') return null;
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  const distanceText = formatDistance(data.distance);

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
        <DistancePill distance={data.distance} />
      </div>
      <div className={cls.body}>
        <div className={cls.shopLogo}>
          <ShopLogo data={data} />
        </div>
        <ShopBadges data={data} />
        <h3 className={cls.title}>
          {data.translation?.title}
          {data?.verify === 1 && <VerifiedComponent />}
        </h3>
        <p className={cls.text}>
          {data.bonus ? (
            <BonusCaption data={data.bonus} />
          ) : (
            data.translation?.description
          )}
        </p>
      </div>
      <div className={cls.footer}>
        <div className={cls.flex}>
          <span className={cls.greenDot} />
          <RunFillIcon />
          <span className={cls.text}>
            {data.delivery_time?.from}-{data.delivery_time?.to}{" "}
            {t(getShortTimeType(data.delivery_time?.type))}
          </span>
        </div>
        <span className={cls.dot} />
        <div className={cls.flex}>
          <StarSmileFillIcon className={cls.ratingIcon} />
          <span className={cls.text}>{data.rating_avg?.toFixed(1) || 0}</span>
        </div>
      </div>
    </Link>
  );
}
