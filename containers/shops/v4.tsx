import dynamic from "next/dynamic";
import { useInfiniteQuery, useQuery } from "react-query";
import shopService from "services/shop";
import { useCallback, useEffect, useMemo, useRef } from "react";
import useUserLocation from "hooks/useUserLocation";
import useLocale from "hooks/useLocale";
import qs from "qs";
import { useAppSelector } from "hooks/useRedux";
import { selectCurrency } from "redux/slices/currency";
import { useRouter } from "next/router";

const Loader = dynamic(() => import("components/loader/loader"));
const Empty = dynamic(() => import("components/empty/empty"));
const ShopList = dynamic(() => import("containers/shopList/v4"));
const FooterMenu = dynamic(() => import("containers/footerMenu/footerMenu"));

const PER_PAGE = 12;
type FilterType = "popular" | "recomended" | "new" | "top-rated" | "wholesale";

export default function ShopsPage() {
  const { t, locale } = useLocale();
  const loader = useRef(null);
  const location = useUserLocation();
  const currency = useAppSelector(selectCurrency);
  const { query } = useRouter();
  const filter = query?.filter as FilterType;

  const queryParams = useMemo(() => {
    const params: Record<string, any> = {
      page: 1,
      perPage: PER_PAGE,
      address: location,
      currency_id: currency?.id,
      include: 'location,distance',
      verify: query?.verify,
      search: query?.search,
      category_id: query?.category,
      type: query?.type,
    };

    // Add additional filters based on the filter type
    switch (filter) {
      case "popular":
        params.open = 1;
        break;
      case "new":
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        params.created_from = sevenDaysAgo.toISOString().split('T')[0];
        params.sort = 'desc';
        params.column = 'created_at';
        break;
      case "top-rated":
        params.sort = 'desc';
        params.column = 'rating_avg';
        params.rating_from = 4.5;
        break;
      case "wholesale":
        params.has_min_amount = 1;
        params.sort = 'asc';
        params.column = 'min_amount';
        break;
    }

    return params;
  }, [filter, location, currency?.id, query]);

  const {
    data: shopData,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery(
    ["shopsPaginate", locale, location, currency, filter, query],
    ({ pageParam = 1 }) => {
      const params = {
        ...queryParams,
        page: pageParam,
      };
      
      switch (filter) {
        case "recomended":
          return shopService.getRecommended(params);
        case "new":
          return shopService.getNewShops(params);
        case "top-rated":
          return shopService.getTopRated(params);
        case "wholesale":
          return shopService.getWholesaleShops(params);
        default:
          return shopService.getAll(qs.stringify(params));
      }
    },
    {
      getNextPageParam: (lastPage: any) => {
        if (lastPage.meta.current_page < lastPage.meta.last_page) {
          return lastPage.meta.current_page + 1;
        }
        return undefined;
      },
    }
  );

  const shops = useMemo(() => {
    return shopData?.pages?.flatMap((item) => item.data) || [];
  }, [shopData]);

  const handleObserver = useCallback(
    (entries: any) => {
      const target = entries[0];
      if (target.isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage]
  );

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "20px",
      threshold: 0,
    };
    const observer = new IntersectionObserver(handleObserver, option);
    if (loader.current) observer.observe(loader.current);
  }, [handleObserver]);

  if (error) {
    console.log("error => ", error);
  }

  function getTitle(type: FilterType) {
    switch (type) {
      case "popular":
        return t("popular.near.you");
      case "recomended":
        return t("daily.offers");
      case "new":
        return t("new.shops");
      case "top-rated":
        return t("top.rated.shops");
      case "wholesale":
        return t("wholesale.shops");
      default:
        return t("all");
    }
  }

  return (
    <div className="bg-white">
      <ShopList
        title={getTitle(filter)}
        shops={shops}
        loading={isLoading && !isFetchingNextPage}
      />
      {isFetchingNextPage && <Loader />}
      <div ref={loader} />

      {!shops.length && !isLoading && <Empty text={t("no.shops")} />}
      <FooterMenu />
    </div>
  );
}
