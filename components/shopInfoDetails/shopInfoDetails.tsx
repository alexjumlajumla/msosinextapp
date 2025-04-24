import { IShop } from "interfaces";
import React from "react";
import cls from "./shopInfoDetails.module.scss";
import Map from "components/map/map";
import CloseFillIcon from "remixicon-react/CloseFillIcon";
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
      <div className={cls.wrapper}>
        <div className={cls.item}>
          <strong>{t("name")}</strong>
          <span>{data?.translation?.title}</span>
        </div>
        <div className={cls.item}>
          <strong>{t("phone")}</strong>
          <span>{data?.phone}</span>
        </div>
        <div className={cls.item}>
          <strong>{t("address")}</strong>
          <div className={cls.row}>
            <span>{data?.translation?.title}</span>
            <button className={cls.copyBtn} onClick={copyToClipBoard}>
              {t("copy")}
            </button>
          </div>
        </div>
      </div>
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
  );
}
