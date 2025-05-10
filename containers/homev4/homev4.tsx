import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery, useQuery } from "react-query";
import categoryService from "services/category";
import cls from "./homev4.module.scss";
import bannerService from "services/banner";
import { useTranslation } from "react-i18next";
import shopService from "services/shop";
import qs from "qs";
import storyService from "services/story";
import useUserLocation from "hooks/useUserLocation";
import { useSettings } from "contexts/settings/settings.context";
import { Category } from "interfaces";

const CategoryContainer = dynamic(() => import("containers/category/category"));
const BannerContainer = dynamic(() => import("containers/banner/v2"));
const ParcelCard = dynamic(() => import("components/parcelCard/v2"));
const StoreList = dynamic(() => import("containers/storeList/v2"));
const NewsContainer = dynamic(() => import("containers/newsContainer/newsContainer"));
const ShopListSlider = dynamic(() => import("containers/shopList/shopListSliderV2"));

const PER_PAGE = 12;

export default function Homev4() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const location = useUserLocation();
  const { settings } = useSettings();
  const activeParcel = Number(settings?.active_parcel) === 1;

  const { data: shopCategories, isLoading: isCategoriesLoading } = useQuery(
    ["shopCategories", locale],
    () => categoryService.getAllShopCategories({ perPage: 10 }),
  );

  const { data: stories, isLoading: isStoriesLoading } = useQuery(
    ["stories", locale],
    () => storyService.getAll(),
  );

  const { data: banners, isLoading: isBannerLoading } = useQuery(
    ["banners", locale],
    () => bannerService.getAll(),
  );

  const { data: shops, isLoading: isShopLoading } = useQuery(
    ["favoriteBrands", location, locale],
    () =>
      shopService.getAll(
        qs.stringify({
          perPage: PER_PAGE,
          verify: 1,
        }),
      ),
  );

  const { data: popularShops } = useQuery(
    ["popularShops", location, locale],
    () =>
      shopService.getAll(
        qs.stringify({
          perPage: PER_PAGE,
          address: location,
          open: 1,
        }),
      ),
  );

  const { data: recommendedShops } = useQuery(
    ["recommendedShops", locale, location],
    () =>
      shopService.getRecommended({
        address: location,
      }),
  );

  const { data: ads, isLoading: isAdsLoading } = useQuery(["ads", locale], () =>
    bannerService.getAllAds(),
  );

  return (
    <>
      <CategoryContainer
        categories={shopCategories?.data?.sort((a, b) => a?.input - b?.input)}
        loading={isCategoriesLoading}
        hasNextPage={
          Number(shopCategories?.meta?.total) >
          Number(shopCategories?.data?.length)
        }
      />
      <BannerContainer
        stories={stories || []}
        banners={banners?.data || []}
        loadingStory={isStoriesLoading}
        loadingBanner={isBannerLoading}
        bannerCount={banners?.meta?.total}
      />
      {activeParcel && <ParcelCard />}
      <StoreList
        title={t("favorite.brands")}
        shops={shops?.data || []}
        loading={isShopLoading}
      />
      {!!popularShops?.data?.length && (
        <ShopListSlider
          title={t("popular.near.you")}
          shops={popularShops?.data || []}
          type="popular"
        />
      )}
      {!!recommendedShops?.data?.length && (
        <ShopListSlider
          title={t("daily.offers")}
          shops={recommendedShops?.data || []}
          type="recomended"
        />
      )}
      <NewsContainer />
    </>
  );
}
