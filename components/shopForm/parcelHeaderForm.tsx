import React from "react";
import { useTranslation } from "react-i18next";
import cls from "./shopForm.module.scss";
import { FormikProps } from "formik";
import { ParcelFormValues, ParcelType } from "interfaces/parcel.interface";
import useLocale from "hooks/useLocale";
import { Grid, useMediaQuery } from "@mui/material";
import OrderMap from "containers/orderMap/orderMap";
import { Order } from "interfaces";
import dynamic from "next/dynamic";
import dayjs from "dayjs";
import useModal from "hooks/useModal";
import SelectInput from "components/inputs/selectInput";
import DeliveryTimes from "components/deliveryTimes/deliveryTimes";

const ModalContainer = dynamic(() => import("containers/modal/modal"));
const MobileDrawer = dynamic(() => import("containers/drawer/mobileDrawer"));

interface Props {
  formik: FormikProps<ParcelFormValues>;
  children?: React.ReactNode;
  handleSelectType: (type: ParcelType) => void;
}

export default function ParcelHeaderForm({ formik, children, handleSelectType }: Props) {
  const { t } = useTranslation();
  const [isVisible, handleOpen, handleClose] = useModal();
  const { locale } = useLocale();
  const isDesktop = useMediaQuery("(min-width:900px)");

  const defaultLocation = {
    latitude: "0",
    longitude: "0"
  };

  const location_from = formik?.values?.location_from || defaultLocation;
  const location_to = formik?.values?.location_to || defaultLocation;

  const handleDeliveryScheduleChange = (e: any) => {
    formik.setFieldValue("delivery_date", e.target.value);
  };

  const handleDeliveryTimeSelect = (time: string) => {
    formik.setFieldValue("delivery_time", time);
    handleClose();
  };

  const handleChangeDeliverySchedule = (data: { date: string; time: string }) => {
    formik.setFieldValue("delivery_date", data.date);
    formik.setFieldValue("delivery_time", data.time);
    handleClose();
  };

  const renderDeliveryTime = () => {
    const { delivery_date, delivery_time } = formik.values;
    if (!delivery_date || !delivery_time) {
      return t("select.delivery.time");
    }
    const isToday = dayjs(delivery_date).isSame(dayjs(), 'day');
    const isTomorrow = dayjs(delivery_date).isSame(dayjs().add(1, 'day'), 'day');
    const day = isToday ? t("today") : isTomorrow ? t("tomorrow") : dayjs(delivery_date).format("ddd, MMM DD");
    return `${day}, ${delivery_time}`;
  };

  const formatDeliveryTime = () => {
    if (!formik.values.delivery_date || !formik.values.delivery_time) {
      return "";
    }
    const date = dayjs(formik.values.delivery_date).format("DD.MM.YYYY");
    return `${date} ${formik.values.delivery_time}`;
  };

  const deliveryTimeOptions = [
    {
      label: formatDeliveryTime() || t("choose.delivery.time"),
      value: formatDeliveryTime() || "",
    },
  ];

  return (
    <div className={cls.container}>
      {isDesktop && (
        <div className={cls.map}>
          <OrderMap
            fullHeight
            drawLine
            data={
              {
                location: location_from,
                shop: {
                  id: 0,
                  logo_img: "/images/finish.png",
                  location: location_to,
                  translation: {
                    title: "Finish",
                    locale: "en",
                    description: "",
                  },
                  price: 0,
                  open: true,
                },
              } as Order
            }
          />
        </div>
      )}
      <div className={cls.heading}>
        <strong className={cls.title}>{t("door.to.door.delivery")}</strong>
        <span className={cls.desc}>
          {t("door.to.door.delivery.description")}
        </span>
      </div>
      <div className={cls.wrapper}>
        {React.Children.map(children, (child) => {
          return React.cloneElement(child as React.ReactElement, {
            formik,
            handleSelectType,
          });
        })}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <button
              type="button"
              className={cls.deliveryTimeBtn}
              onClick={handleOpen}
            >
              {formik.values.delivery_date ? (
                <span>
                  {dayjs(formik.values.delivery_date).format("DD.MM.YYYY")}
                  {formik.values.delivery_time && ` ${formik.values.delivery_time}`}
                </span>
              ) : (
                t("select.delivery.time")
              )}
            </button>
          </Grid>
        </Grid>
      </div>

      <ModalContainer open={isVisible} onClose={handleClose}>
        <DeliveryTimes
          handleClose={handleClose}
          handleChangeDeliverySchedule={handleChangeDeliverySchedule}
          formik={formik}
          onSelectDeliveryTime={(time) => handleDeliveryTimeSelect(time)}
        />
      </ModalContainer>
    </div>
  );
}
