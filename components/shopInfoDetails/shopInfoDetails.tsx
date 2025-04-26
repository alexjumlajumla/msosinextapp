import { IShop } from "interfaces";
import React from "react";
import cls from "./shopInfoDetails.module.scss";
import Map from "components/map/map";
import { RiCloseFill, RiFileCopyLine, RiStoreLine, RiPhoneLine, RiMapPinLine } from "@remixicon/react";
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
        <RiCloseFill />
      </button>
      
      <div className={cls.header}>
        <RiStoreLine className={cls.headerIcon} />
        <h2 className={cls.headerTitle}>{t("shop.info")}</h2>
      </div>

      <div className={cls.wrapper}>
        <div className={cls.item}>
          <div className={cls.itemHeader}>
            <RiStoreLine className={cls.icon} />
            <strong>{t("name")}</strong>
          </div>
          <span className={cls.itemContent}>{data?.translation?.title}</span>
        </div>

        <div className={cls.item}>
          <div className={cls.itemHeader}>
            <RiPhoneLine className={cls.icon} />
            <strong>{t("phone")}</strong>
          </div>
          <span className={cls.itemContent}>{data?.phone}</span>
        </div>

        <div className={cls.item}>
          <div className={cls.itemHeader}>
            <RiMapPinLine className={cls.icon} />
            <strong>{t("address")}</strong>
          </div>
          <div className={cls.addressRow}>
            <span className={cls.itemContent}>{data?.translation?.title}</span>
            <button className={cls.copyBtn} onClick={copyToClipBoard}>
              <RiFileCopyLine />
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
