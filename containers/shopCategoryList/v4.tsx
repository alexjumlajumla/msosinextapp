import { Skeleton } from "@mui/material";
import CategoryCard from "components/categoryCard/v4";
import { Category } from "interfaces";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
// Change import path to match banner component
import { Navigation, Autoplay } from "swiper"; // Changed from 'swiper/modules' to 'swiper'
import cls from "./v4.module.scss";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";

type Props = {
  data?: Category[];
  loading: boolean;
  parent?: string; // This indicates if we're showing subcategories
};

export default function ShopCategoryList({ data = [], loading, parent }: Props) {
  const { t } = useTranslation();

  if (!loading && (!data || data.length === 0)) return null;

  // Configure Swiper differently based on whether this is main categories or subcategories
  const swiperConfig = parent
    ? {
        // Subcategories config - no autoplay
        modules: [Navigation],
        navigation: {
          prevEl: `.${cls.categorySwiperBtnPrev}`,
          nextEl: `.${cls.categorySwiperBtnNext}`,
          disabledClass: cls.swiperBtnDisabled,
        },
        loop: data.length >= 10,
        slidesPerView: "auto" as const,
        spaceBetween: 20,
        className: cls.slider,
        observer: true,
        observeParents: true,
      }
    : {
        // Main categories config - with autoplay
        modules: [Navigation, Autoplay],
        navigation: {
          prevEl: `.${cls.categorySwiperBtnPrev}`,
          nextEl: `.${cls.categorySwiperBtnNext}`,
          disabledClass: cls.swiperBtnDisabled,
        },
        autoplay: {
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        },
        loop: data.length >= 10,
        slidesPerView: "auto" as const,
        spaceBetween: 20,
        className: cls.slider,
        observer: true,
        observeParents: true,
      };

  return (
    <div className={`container ${cls.sliderContainer}`}>
      <Swiper {...swiperConfig}>
        {!!parent && (
          <SwiperSlide className={cls.slideItem}>
            <Link href={`/shop-category/${parent}`} shallow>
              <div className={cls.allCard}>
                <span className={cls.text}>{t("all")}</span>
              </div>
            </Link>
          </SwiperSlide>
        )}
        {loading
          ? Array.from(Array(10).keys()).map((item) => (
              <SwiperSlide className={cls.slideItem} key={`shimmer-${item}`}>
                <Skeleton variant="rectangular" className={cls.shimmer} />
              </SwiperSlide>
            ))
          : data.map((category) => (
              <SwiperSlide className={cls.slideItem} key={category.id}>
                <CategoryCard data={category} parent={parent} />
              </SwiperSlide>
            ))}
      </Swiper>

      {/* Only show navigation buttons if we have items */}
      {(loading || data.length > 0) && (
        <>
          <button
            className={`${cls.categorySwiperBtn} ${cls.categorySwiperBtnPrev}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"
              />
            </svg>
          </button>
          <button
            className={`${cls.categorySwiperBtn} ${cls.categorySwiperBtnNext}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"
              />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
