import React from "react";
import MapPinLineIcon from "remixicon-react/MapPinLineIcon";
import cls from "./distancePill.module.scss";

interface Props {
  distance?: number;
  className?: string;
}

export default function DistancePill({ distance, className = "" }: Props) {
  if (typeof distance !== "number") return null;

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  return (
    <div className={`${cls.wrapper} ${className}`}>
      <MapPinLineIcon size={16} />
      <span>{formatDistance(distance)}</span>
    </div>
  );
} 