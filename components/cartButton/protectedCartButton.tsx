import React from "react";
import cls from "./cartButton.module.scss";
import Link from "next/link";
import ShoppingBag3LineIcon from "remixicon-react/ShoppingBag3LineIcon";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "hooks/useRedux";
import {
  clearUserCart,
  selectUserCart,
  updateIndicatorState,
  updateUserCart,
} from "redux/slices/userCart";
import { useQuery } from "react-query";
import cartService from "services/cart";
import Price from "components/price/price";
import { selectCurrency } from "redux/slices/currency";
import shopService from "services/shop";
import { useSettings } from "contexts/settings/settings.context";

export default function ProtectedCartButton() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const cart = useAppSelector(selectUserCart);
  const cartIndicatorVisible = useAppSelector(state => state.userCart.indicatorVisible);
  const cartItems = cart?.user_carts?.flatMap((item) => item.cartDetails) || [];
  const currency = useAppSelector(selectCurrency);
  const { location } = useSettings();

  // Get the shop_id from cart, fallback to undefined if not available
  const shopId = cart?.shop_id;

  useQuery(
    ["cart", currency?.id],
    () => cartService.get({ currency_id: currency?.id }),
    {
      onSuccess: (data) => {
        console.log('Cart fetch success:', data);
        if (data.data?.user_carts?.length) {
          dispatch(updateUserCart(data.data));
          dispatch(updateIndicatorState(true));
        } else {
          dispatch(clearUserCart());
          dispatch(updateIndicatorState(false));
        }
      },
      onError: (error) => {
        console.error('Cart fetch error:', error);
        dispatch(clearUserCart());
        dispatch(updateIndicatorState(false));
      },
      retry: false,
      refetchInterval: 5000, // Refresh every 5 seconds
    }
  );

  const locationArray = typeof location === 'string' ? location.split(',') : [];

  useQuery(
    ["shopZone", location],
    () =>
      shopService.checkZoneById(shopId || 0, {
        address: { 
          latitude: locationArray[0] || '', 
          longitude: locationArray[1] || '' 
        },
      }),
    {
      onError: () => dispatch(updateIndicatorState(false)),
      onSuccess: () => {
        if (cartItems.length > 0) {
          dispatch(updateIndicatorState(true));
        }
      },
      enabled: !!cartItems.length && !!location && !!shopId,
    }
  );

  // Only render cart button if we have items and the cart is visible
  if (cartItems.length > 0 && cartIndicatorVisible && shopId) {
    return (
      <div className={cls.cartBtnWrapper}>
        <Link href={`/shop/${shopId}`} className={cls.cartBtn}>
          <ShoppingBag3LineIcon />
          <div className={cls.text}>
            <span>{t("order")}</span>{" "}
            <span className={cls.price}>
              <Price number={cart.total_price || 0} />
            </span>
          </div>
        </Link>
      </div>
    );
  }

  return null;
}
