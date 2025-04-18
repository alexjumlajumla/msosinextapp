import React from "react";
import { Order } from "interfaces";
import cls from "./orderListItem.module.scss";
import CheckDoubleLineIcon from "remixicon-react/CheckDoubleLineIcon";
import CloseCircleLineIcon from "remixicon-react/CloseCircleLineIcon";
import ShopLogoBackground from "components/shopLogoBackground/shopLogoBackground";
import Link from "next/link";
import ArrowRightSLineIcon from "remixicon-react/ArrowRightSLineIcon";
import Loader4LineIcon from "remixicon-react/Loader4LineIcon";
import PinDistanceLineIcon from "remixicon-react/PinDistanceLineIcon";
import Price from "components/price/price";
import dayjs from "dayjs";

type Props = {
  data: Order;
  active: boolean;
};

export default function OrderListItem({ data, active }: Props) {
  return (
    <Link href={`/orders/${data.id}`} className={cls.wrapper}>
      <div className={cls.flex}>
        <div className={`${cls.badge} ${active ? cls.active : ""}`}>
          {active ? (
            <Loader4LineIcon />
          ) : data.status === "delivered" ? (
            <CheckDoubleLineIcon />
          ) : (
            <CloseCircleLineIcon />
          )}
        </div>
        <ShopLogoBackground data={data.shop} size="small" />
        <div className={cls.naming}>
          <h3 className={cls.title}>{data.shop.translation?.title}</h3>
          {active && data.location && (
            <div className={cls.distancePill}>
              <PinDistanceLineIcon size={16} />
              <span>
                {Math.round(
                  getDistance(
                    Number(data.location?.latitude),
                    Number(data.location?.longitude),
                    Number(data.shop.location?.latitude),
                    Number(data.shop.location?.longitude)
                  )
                )}
                km
              </span>
            </div>
          )}
          <p className={cls.text}>{data.shop.translation?.description}</p>
        </div>
      </div>
      <div className={cls.actions}>
        <div className={cls.orderInfo}>
          <h5 className={cls.price}>
            <Price number={data.total_price} symbol={data.currency?.symbol} />
          </h5>
          <p className={cls.text}>
            {dayjs(data.created_at).format("DD MMM, HH:mm")}
          </p>
        </div>
        <ArrowRightSLineIcon />
      </div>
    </Link>
  );
}

function getDistance(lat1?: number, lon1?: number, lat2?: number, lon2?: number) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180);
}
