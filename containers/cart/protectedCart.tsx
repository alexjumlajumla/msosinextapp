import React from "react";
import cls from "./cart.module.scss";
import CartServices from "components/cartServices/cartServices";
import CartTotal from "components/cartTotal/cartTotal";
import EmptyCart from "components/emptyCart/emptyCart";
import { IShop, UserCart } from "interfaces";
import { CartStockWithProducts } from "interfaces/cart.interface";
import ProtectedCartProduct from "components/cartProduct/protectedCartProduct";
import ProtectedCartHeader from "components/cartHeader/protectedCartHeader";
import { useQuery } from "react-query";
import cartService from "services/cart";
import Loading from "components/loader/loading";
import { useAppDispatch, useAppSelector } from "hooks/useRedux";
import {
  clearUserCart,
  selectUserCart,
  updateUserCart,
} from "redux/slices/userCart";
import { selectCurrency } from "redux/slices/currency";

// Update type guard with simpler validation
function isValidCartProduct(item: any): item is UserCart & {
  id: number;
  user_id: number;
  cart_id: number;
  cartDetails: CartStockWithProducts[];
} {
  return Boolean(
    item?.id &&
    item?.user_id &&
    item?.cart_id &&
    Array.isArray(item?.cartDetails)
  );
}

type Props = {
  shop: IShop;
};

export default function ProtectedCart({ shop }: Props) {
  const cart = useAppSelector(selectUserCart);
  const dispatch = useAppDispatch();
  const isEmpty = !cart?.user_carts?.some((item) => item.cartDetails.length);
  const currency = useAppSelector(selectCurrency);

  const { isLoading } = useQuery(
    ["cart", currency?.id],
    () => cartService.get({ currency_id: currency?.id }),
    {
      onSuccess: (data) => dispatch(updateUserCart(data.data)),
      onError: () => dispatch(clearUserCart()),
      retry: false,
      refetchInterval: cart.group ? 5000 : false,
      refetchOnWindowFocus: Boolean(cart.group),
      staleTime: 0,
    }
  );

  return (
    <div className={cls.wrapper}>
      <div className={cls.body}>
        {cart?.user_carts?.map((item) => {
          if (!isValidCartProduct(item)) return null;
          
          return (
            <React.Fragment key={`user-${item.id}`}>
              <ProtectedCartHeader
                data={item}
                isOwner={item.user_id === cart?.owner_id}
              />
              {item.cartDetails.map((el) => (
                <ProtectedCartProduct
                  key={`cart-${el.id}-${el.quantity}`}
                  data={el}
                  cartId={item.cart_id}
                  disabled={item.user_id !== cart?.owner_id}
                />
              ))}
            </React.Fragment>
          );
        })}
        {isEmpty && !isLoading && (
          <div className={cls.empty}>
            <EmptyCart />
          </div>
        )}
      </div>
      {!isEmpty && <CartServices data={shop} />}
      {!isEmpty && cart?.total_price !== undefined && (
        <CartTotal totalPrice={cart.total_price} data={shop} />
      )}
      {isLoading && <Loading />}
    </div>
  );
}
