//@ts-nocheck
import React from "react";
import SEO from "components/seo";
import CheckoutContainer from "containers/checkout/checkout";
import CheckoutDelivery from "containers/checkoutDelivery/checkoutDelivery";
import CheckoutProducts from "containers/checkoutProducts/checkoutProducts";
import { GetServerSideProps } from "next";
import { dehydrate, QueryClient, useQuery } from "react-query";
import shopService from "services/shop";
import { useRouter } from "next/router";
import cartService from "services/cart";
import { useAppDispatch, useAppSelector } from "hooks/useRedux";
import { updateUserCart } from "redux/slices/userCart";
import { useTranslation } from "react-i18next";
import getLanguage from "utils/getLanguage";
import { selectCurrency } from "redux/slices/currency";
import dynamic from "next/dynamic";
import useModal from "hooks/useModal";
import { useMediaQuery } from "@mui/material";
import useShopWorkingSchedule from "hooks/useShopWorkingSchedule";
import { error } from "components/alert/toast";
import { IShop } from "interfaces";

const ModalContainer = dynamic(() => import("containers/modal/modal"), {
  ssr: false
});
const MobileDrawer = dynamic(() => import("containers/drawer/mobileDrawer"), {
  ssr: false
});
const EditPhone = dynamic(() => import("components/editPhone/editPhone"), {
  ssr: false
});

type Props = {
  initialData: {
    shop: IShop;
  };
};

export default function Checkout({ initialData }: Props) {
  const { i18n, t } = useTranslation();
  const locale = i18n.language;
  const { query, back } = useRouter();
  const shopId = Number(query.id);
  const dispatch = useAppDispatch();
  const currency = useAppSelector(selectCurrency);
  const [phoneModal, handleOpenPhone, handleClosePhone] = useModal();
  const isDesktop = useMediaQuery("(min-width:1140px)");

  const { data } = useQuery(
    ["shop", shopId, locale],
    () => shopService.getById(shopId),
    {
      initialData: { data: initialData.shop },
      enabled: !!shopId && !!locale
    }
  );

  const { isShopClosed } = useShopWorkingSchedule(data?.data);

  React.useEffect(() => {
    if (isShopClosed) {
      error(t("shop.closed"));
      back();
    }
  }, [isShopClosed, back, t]);

  const { isLoading } = useQuery(
    ["cart", currency?.id],
    () => cartService.get({ currency_id: currency?.id }),
    {
      onSuccess: (data) => {
        dispatch(updateUserCart(data.data));
        if (
          data.data.user_carts.flatMap((cart) => cart.cartDetails).length === 0
        ) {
          back();
        }
      },
      staleTime: 0,
      refetchOnWindowFocus: true,
      enabled: !!currency?.id
    }
  );

  if (isShopClosed) {
    return null;
  }

  return (
    <>
      <SEO />
      <CheckoutContainer onPhoneVerify={handleOpenPhone} data={data?.data}>
        <CheckoutDelivery />
        <CheckoutProducts loading={isLoading} />
      </CheckoutContainer>
      {isDesktop ? (
        <ModalContainer open={phoneModal} onClose={handleClosePhone}>
          <EditPhone handleClose={handleClosePhone} />
        </ModalContainer>
      ) : (
        <MobileDrawer open={phoneModal} onClose={handleClosePhone}>
          <EditPhone handleClose={handleClosePhone} />
        </MobileDrawer>
      )}
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  query,
  req,
  res
}) => {
  const queryClient = new QueryClient();
  const shopId = Number(query.id);
  const locale = getLanguage(req.cookies?.locale);

  try {
    const shopData = await shopService.getById(shopId);
    
    // Check if shop is closed on server side
    const today = new Date().getDay().toString();
    const isShopClosed = !shopData.data.open || shopData.data.shop_working_days?.find(
      (item) => item.day === today
    )?.disabled;

    if (isShopClosed) {
      return {
        redirect: {
          destination: `/shop/${shopId}`,
          permanent: false,
        },
      };
    }

    await queryClient.prefetchQuery(["shop", shopId, locale], () => shopData);

    return {
      props: {
        initialData: {
          shop: shopData.data
        },
        dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
      },
    };
  } catch (error) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
};
