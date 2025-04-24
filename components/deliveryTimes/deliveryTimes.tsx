import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import RadioInput from "components/inputs/radioInput";
import cls from "./deliveryTimes.module.scss";
import PrimaryButton from "components/button/primaryButton";
import dayjs from "dayjs";
import SecondaryButton from "components/button/secondaryButton";
import { WEEK } from "constants/weekdays";
import getTimeSlots from "utils/getTimeSlots";
import getWeekDay from "utils/getWeekDay";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Navigation } from "swiper";
import { useMediaQuery } from "@mui/material";
import { FormikProps } from "formik";

type IDeliveryTime = {
  date: string;
  time: string;
};

interface Props {
  handleClose: () => void;
  handleChangeDeliverySchedule: (data: IDeliveryTime) => void;
  formik?: FormikProps<any>;
  onSelectDeliveryTime?: (time: string) => void;
}

export default function DeliveryTimes({
  handleChangeDeliverySchedule,
  handleClose,
  formik,
  onSelectDeliveryTime,
}: Props) {
  const { t } = useTranslation();
  const isDesktop = useMediaQuery("(min-width:1140px)");
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [dayIndex, setDayIndex] = useState(0);
  const [list, setList] = useState<string[]>([]);

  const renderTimes = useCallback(() => {
    // Generate time slots from 8 AM to 8 PM
    const slots = getTimeSlots("08:00", "20:00", dayIndex === 0);
    setList(slots);
    setSelectedValue(null);
  }, [dayIndex]);

  useEffect(() => {
    renderTimes();
  }, [renderTimes]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(event.target.value);
  };

  const controlProps = (item: string) => ({
    checked: selectedValue === item,
    onChange: handleChange,
    value: item,
    id: item,
    name: "delivery_time",
    inputProps: { "aria-label": item },
  });

  const clearValue = () => setSelectedValue(null);

  const submit = () => {
    if (!selectedValue) {
      return;
    }
    const date = dayjs().add(dayIndex, "day").format("YYYY-MM-DD");
    handleChangeDeliverySchedule({ time: selectedValue, date });
  };

  function renderDay(index: number) {
    const day = dayjs().add(index, "day");
    return {
      day,
      weekDay: getWeekDay(day),
    };
  }

  return (
    <div className={cls.wrapper}>
      <div className={cls.header}>
        <h2 className={cls.title}>{t("select.delivery.time")}</h2>
      </div>
      <div className={cls.tabs}>
        <Swiper
          spaceBetween={16}
          slidesPerView="auto"
          navigation={isDesktop}
          modules={[Navigation, A11y]}
          className="tab-swiper"
          allowTouchMove={!isDesktop}
        >
          {WEEK.slice(0, 7).map((day, idx) => (
            <SwiperSlide key={day}>
              <button
                type="button"
                className={`${cls.tab} ${dayIndex === idx ? cls.active : ""}`}
                onClick={() => setDayIndex(idx)}
              >
                <span className={cls.text}>{renderDay(idx).weekDay}</span>
                <p className={cls.subText}>
                  {renderDay(idx).day.format("MMM DD")}
                </p>
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div className={cls.body}>
        {list.map((item) => (
          <div key={item} className={cls.row}>
            <RadioInput {...controlProps(item)} />
            <label className={cls.label} htmlFor={item}>
              <span className={cls.text}>{item}</span>
            </label>
          </div>
        ))}
      </div>
      <div className={cls.footer}>
        <div className={cls.action}>
          <PrimaryButton onClick={submit}>{t("save")}</PrimaryButton>
        </div>
        <div className={cls.action}>
          <SecondaryButton onClick={clearValue}>{t("clear")}</SecondaryButton>
        </div>
      </div>
    </div>
  );
}
