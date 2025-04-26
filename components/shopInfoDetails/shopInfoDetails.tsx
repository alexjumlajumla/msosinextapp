import { IShop } from "interfaces";
import React from "react";
import cls from "./shopInfoDetails.module.scss";
import Map from "components/map/map";
import CloseFillIcon from "remixicon-react/CloseFillIcon";
import FileCopyLineIcon from "remixicon-react/FileCopyLineIcon";
import StoreLineIcon from "remixicon-react/StoreLineIcon";
import PhoneLineIcon from "remixicon-react/PhoneLineIcon";
import MapPinLineIcon from "remixicon-react/MapPinLineIcon";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

type Props = {
  data?: IShop;
  onClose?: () => void;
};

export default function ShopInfoDetails({ data, onClose }: Props) {
  const { t } = useTranslation();

  const copyToClipBoard = async () => {
    try {
      await navigator.clipboard.writeText(data?.translation?.title || "");
      toast.success(t("copied"));
    } catch (err) {
      toast.error("Failed to copy!");
    }
  };

  return (
    <div className={cls.container}>
      <button className={cls.closeBtn} onClick={onClose}>
        <CloseFillIcon />
      </button>
      
      <div className={cls.header}>
        <StoreLineIcon className={cls.headerIcon} />
        <h2 className={cls.headerTitle}>{t("shop.info")}</h2>
      </div>

      <div className={cls.wrapper}>
        <div className={cls.item}>
          <div className={cls.itemHeader}>
            <StoreLineIcon className={cls.icon} />
            <strong>{t("name")}</strong>
          </div>
          <span className={cls.itemContent}>{data?.translation?.title}</span>
        </div>

        <div className={cls.item}>
          <div className={cls.itemHeader}>
            <PhoneLineIcon className={cls.icon} />
            <strong>{t("phone")}</strong>
          </div>
          <span className={cls.itemContent}>{data?.phone}</span>
        </div>

        <div className={cls.item}>
          <div className={cls.itemHeader}>
            <MapPinLineIcon className={cls.icon} />
            <strong>{t("address")}</strong>
          </div>
          <div className={cls.addressRow}>
            <span className={cls.itemContent}>{data?.translation?.title}</span>
            <button className={cls.copyBtn} onClick={copyToClipBoard}>
              <FileCopyLineIcon />
              <span>{t("copy")}</span>
            </button>
          </div>
        </div>
      </div>

      <div className={cls.mapContainer}>
        <h3 className={cls.mapTitle}>{t("location")}</h3>
        <div className={cls.map}>
          {data?.location && (
            <Map
              location={{
                lat: Number(data.location.latitude),
                lng: Number(data.location.longitude),
              }}
              readOnly
            />
          )}
        </div>
      </div>
    </div>
  );
}
