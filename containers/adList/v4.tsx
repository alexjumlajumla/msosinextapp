/* eslint-disable @next/next/no-img-element */
import React from "react";
import cls from "./v4.module.scss";
import { Skeleton } from "@mui/material";
import { Banner } from "interfaces";
import Link from "next/link";
import { useTranslation } from "react-i18next";

type Props = {
  data?: Banner[];
  loading: boolean;
  title?: string;
};

export default function AdList({ data, loading, title }: Props) {
  const { t } = useTranslation();
  
  if (!loading && data?.length === 0) return null;
  
  return (
    <div className="container">
      {title && (
        <div className={cls.header}>
          <h2 className={cls.title}>{title}</h2>
          <Link href="/ads" className={cls.link}>
            {t("see.all")}
          </Link>
        </div>
      )}
      <div className={cls.grid}>
        {loading
          ? Array.from(Array(6).keys()).map((item) => (
              <Skeleton
                variant="rectangular"
                className={cls.gridItem}
                key={item}
              />
            ))
          : data?.map((item) => (
              <Link
                className={`${cls.gridItem}`}
                key={item.id}
                href={`/ads/${item.id}`}
              >
                <div>
                  <img src={item.img} alt="banner" />
                </div>
              </Link>
            ))}
      </div>
    </div>
  );
}
