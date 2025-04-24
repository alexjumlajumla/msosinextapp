import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery, useQuery } from "react-query";
import categoryService from "services/category";
import cls from "./homev4.module.scss";
import bannerService from "services/banner";
import { useTranslation } from "react-i18next";
import shopService from "services/shop";
import qs from "qs";
import { EveryDay, Flash, Gift } from "components/icons";
import AnnouncementList from "containers/announcementList/announcementList";
import storyService from "services/story";
import useUserLocation from "hooks/useUserLocation";
import Loader from "components/loader/loader";
import Link from "next/link";
import { useSettings } from "contexts/settings/settings.context";
import { Category } from "interfaces";
import { rotateArrayInChunks } from "utils/array";
import ParcelCard from "components/parcelCard/v2";

const BrandSection = dynamic(() => import("components/brandSection/brandSection"), {
  ssr: false
});

const announcements = [
  {
    title: "door.to.door.delivery",
    button: "we.work.for.you",
    color: "yellow",
    img: "/images/v4-announcement1.png",
    icon: <EveryDay />,
  },
  {
    title: "discount.for.first.order",
    button: "for.all.buyers",
    color: "blue",
    img: "/images/v4-announcement2.png",
    icon: <Gift />,
  },
  {
    title: "delivery.in.time",
    button: "until.date",
    color: "pink",
    img: "/images/v4-announcement3.png",
    icon: <Flash />,
  },
];

const ShopCategoryList = dynamic(
  () => import("containers/shopCategoryList/v4"),
);
const BannerList = dynamic(() => import("containers/banner/v4"));
const StoryList = dynamic(() => import("containers/storyList/v4"));
const ShopList = dynamic(() => import("containers/shopList/v4"));
const AdList = dynamic(() => import("containers/adList/v4"));

export default function Homev4() {
  const loader = useRef(null);
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const { location: userLocation } = useSettings();
  const { settings } = useSettings();
  const activeParcel = Number(settings?.active_parcel) === 1;

  const { data: shopCategoryListResult, isLoading: shopCategoryLoading } = useQuery(
    ["shopcategory", locale],
    () => categoryService.getAllShopCategories({ perPage: 100, type: 'shop' }),
  );

  const categories = useMemo(() => {
    if (!shopCategoryListResult?.data) return [];
    
    // Remove duplicates and sort by input order
    const uniqueCategories = Array.from(
      new Map(shopCategoryListResult.data.map(item => [item.id, item])).values()
    );
    
    return uniqueCategories.sort((a, b) => (a.input || 0) - (b.input || 0));
  }, [shopCategoryListResult?.data]);

  const { data: banners, isLoading: bannerLoading } = useQuery(
    ["banners", locale],
    () => bannerService.getAll(),
  );
  const { data: stories, isLoading: isStoriesLoading } = useQuery(
    ["stories", locale, userLocation],
    () => storyService.getAll({ address: userLocation }),
  );
  const { data: ads, isLoading: adListLoading } = useQuery(
    ["ads", locale, userLocation],
    () => bannerService.getAllAds({ perPage: 6, address: userLocation }),
  );

  // Debug log
  console.log('User location from settings:', userLocation);

  // Parse location string into lat/lng
  const locationParams = useMemo(() => {
    if (!userLocation) return {};
    const [latitude, longitude] = userLocation.split(',').map(Number);
    
    // Debug log
    console.log('Parsed location params:', { latitude, longitude });
    
    if (isNaN(latitude) || isNaN(longitude)) return {};
    return { latitude, longitude };
  }, [userLocation]);

  const { data: shops, isLoading: isShopLoading } = useQuery(
    ["shops", locale, userLocation],
    () => {
      const params = {
        open: 1,
        ...locationParams,
        include: 'location,distance'
      };
      console.log('Shop query params:', params);
      return shopService.getRecommended(params);
    },
    {
      onSuccess: (data) => {
        console.log('Recommended shops response:', data);
      }
    }
  );

  const { data: topRatedShops, isLoading: isTopRatedLoading } = useQuery(
    ["topRatedShops", locale, userLocation],
    () => {
      const params = {
        open: 1,
        ...locationParams,
      };
      return shopService.getTopRated(params);
    }
  );

  const {
    data: nearbyShops,
    isLoading: nearByShopsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    ["nearbyshops", locale, userLocation],
    ({ pageParam = 1 }) => {
      const params = {
        page: pageParam,
        ...locationParams,
        open: 1,
        include: 'location,distance',
        sort: 'asc',
        column: 'distance',
        perPage: 24 // Increase page size to ensure better sorting
      };
      console.log('Nearby shops query params:', params);
      return shopService.getAllShops(qs.stringify(params));
    },
    {
      getNextPageParam: (lastPage: any) => {
        if (lastPage.meta.current_page < lastPage.meta.last_page) {
          return lastPage.meta.current_page + 1;
        }
        return undefined;
      },
      onSuccess: (data) => {
        console.log('Nearby shops response:', data);
      }
    },
  );

  // Flatten and ensure precise distance-based sorting
  const nearbyShopList = useMemo(() => {
    const shops = nearbyShops?.pages?.flatMap((item) => item.data) || [];
    
    // Convert all distances to meters for consistent comparison
    return shops.sort((a, b) => {
      const distanceA = typeof a.distance === 'number' ? a.distance : Infinity;
      const distanceB = typeof b.distance === 'number' ? b.distance : Infinity;
      
      // Convert to meters if in kilometers (assuming distances > 1 are in km)
      const metersA = distanceA > 1 ? distanceA * 1000 : distanceA * 1000;
      const metersB = distanceB > 1 ? distanceB * 1000 : distanceB * 1000;
      
      return metersA - metersB;
    });
  }, [nearbyShops?.pages]);

  const handleObserver = useCallback((entries: any) => {
    const target = entries[0];
    if (target.isIntersecting && hasNextPage) {
      fetchNextPage();
    }
  }, []);

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "20px",
      threshold: 0,
    };
    const observer = new IntersectionObserver(handleObserver, option);
    if (loader.current) observer.observe(loader.current);
  }, [handleObserver]);

  // Process recommended shops with rotation
  const processedRecommendedShops = useMemo(() => {
    if (!shops?.data) return [];
    return rotateArrayInChunks(shops.data);
  }, [shops?.data]);

  // Process top rated shops with rotation
  const processedTopRatedShops = useMemo(() => {
    if (!topRatedShops?.data) return [];
    return rotateArrayInChunks(topRatedShops.data);
  }, [topRatedShops?.data]);

  return (
    <div className={cls.container}>
      <div className={cls.wrapper}>
        <div className={cls.header}>
          <ShopCategoryList data={categories} loading={shopCategoryLoading} />
          <BannerList data={banners?.data} loading={bannerLoading} />
          <BrandSection />
          {activeParcel && <ParcelCard />}
          {Array.isArray(stories) && stories.length > 0 && (
            <StoryList data={stories} loading={isStoriesLoading} />
          )}
          {shops?.data && shops.data.length > 0 && (
            <ShopList 
              title={t("recommended")} 
              shops={shops.data} 
              loading={isShopLoading}
              link="/shop?filter=recommended" 
            />
          )}
          {ads?.data && ads.data.length > 0 && (
            <AdList data={ads.data} loading={adListLoading} />
          )}
          {topRatedShops?.data && topRatedShops.data.length > 0 && (
            <ShopList
              title={t("top.rated")}
              shops={topRatedShops.data}
              loading={isTopRatedLoading}
              link="/shop?sort=desc&column=rating_avg"
            />
          )}
          {Array.isArray(nearbyShopList) && nearbyShopList.length > 0 && (
            <ShopList
              title={t("nearby.shops")}
              shops={nearbyShopList}
              loading={nearByShopsLoading}
              link="/shop?sort=asc&column=distance"
            />
          )}
        </div>
      </div>
      <div ref={loader} style={{ height: 50 }}>
        {isFetchingNextPage && <Loader />}
      </div>
    </div>
  );
}
