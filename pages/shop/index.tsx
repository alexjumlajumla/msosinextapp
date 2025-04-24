import SEO from "components/seo";
import { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import informationService from "services/information";
import createSettings from "utils/createSettings";
import { getCookie } from "utils/session";
import { useCallback } from "react";
import { useInfiniteQuery } from "react-query";

const uiTypes = {
  "1": dynamic(() => import("containers/shops/shopsPage")),
  "2": dynamic(() => import("containers/shops/v2")),
  "3": dynamic(() => import("containers/shops/v3")),
  "4": dynamic(() => import("containers/shops/v4"))
};

interface ShopApiResponse {
  nextPage: number | null;
  data: any[]; // Replace 'any' with your actual shop data type
}

type PageProps = {
  uiType?: keyof typeof uiTypes;
};

export default function Shops({ uiType = "1" }: PageProps) {
  const Ui = uiTypes[uiType] || uiTypes["1"];

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading
  } = useInfiniteQuery(
    'shops',
    async ({ pageParam = 1 }) => {
      const response = await fetch(`/api/shops?page=${pageParam}`);
      return response.json();
    },
    {
      getNextPageParam: (lastPage: ShopApiResponse) => lastPage.nextPage ?? undefined,
    }
  );

  const handleObserver = useCallback((entries: any) => {
    const target = entries[0];
    if (target.isIntersecting && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage]);

  return (
    <>
      <SEO />
      <Ui />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const settingsData = await informationService.getSettings();
  const obj = createSettings(settingsData?.data);

  return {
    props: {
      uiType: obj?.ui_type,
    },
  };
};
