import React from "react";
import { CartProduct } from "interfaces";
import cls from "./cartProduct.module.scss";
import SubtractFillIcon from "remixicon-react/SubtractFillIcon";
import AddFillIcon from "remixicon-react/AddFillIcon";
import getImage from "utils/getImage";
import Price from "components/price/price";
import { useAppDispatch } from "hooks/useRedux";
import {
  addToCart,
  clearCart,
  reduceCartItem,
  removeFromCart,
} from "redux/slices/cart";
import FallbackImage from "components/fallbackImage/fallbackImage";
import { useRouter } from "next/router";
import useModal from "hooks/useModal";
import CartReplaceModal from "components/clearCartModal/cartReplacePrompt";

type Props = {
  data: CartProduct;
};

export default function CartItem({ data }: Props) {
  const dispatch = useAppDispatch();
  const { query } = useRouter();
  const shopId = Number(query.id);
  const [openPrompt, handleOpenPrompt, handleClosePrompt] = useModal();

  function addProduct() {
    if (!checkIsAbleToAddProduct()) {
      handleOpenPrompt();
      return;
    }
    dispatch(addToCart({ ...data, quantity: 1 }));
  }

  function reduceProduct() {
    if (!checkIsAbleToAddProduct()) {
      handleOpenPrompt();
      return;
    }
    if (data.quantity === 1) {
      dispatch(removeFromCart(data));
    } else {
      dispatch(reduceCartItem(data));
    }
  }

  function handleReplaceCart() {
    dispatch(clearCart());
    dispatch(addToCart({ ...data, quantity: 1 }));
    handleClosePrompt();
  }

  function checkIsAbleToAddProduct() {
    let isActiveCart: boolean;
    isActiveCart = data.shop_id === 0 || data.shop_id === shopId;
    return isActiveCart;
  }

  const totalPrice =
    data.stock.price * data.quantity +
    data.addons.reduce(
      (acc, item) => acc + (item?.stock?.price ?? 0) * (item?.quantity ?? 1),
      0,
    );
    // Removed discount calculation due to type error: (data?.stock?.discount ?? 0) * (data?.quantity ?? 0);
    // Ensure the 'discount' property exists on 'data.stock' type or update the calculation logic.

  return (
    <>
      <div className={cls.wrapper}>
        <div className={cls.block}>
          <h6 className={cls.title}>
            {data.translation?.title}{" "}
            {data.extras.length > 0 ? `(${data.extras.join(", ")})` : ""}
          </h6>
          <p className={cls.description}>
            {data.addons
              ?.map(
                (item) =>
                  item.translation?.title +
                  " x " +
                  item.quantity * (item.stock?.product?.interval || 1),
              )
              .join(", ")}
          </p>
          <div className={cls.actions}>
            <div className={cls.counter}>
              <button
                type="button"
                className={cls.counterBtn}
                onClick={reduceProduct}
              >
                <SubtractFillIcon />
              </button>
              <div className={cls.count}>
                {data.quantity * (data?.interval || 1)}
                <span className={cls.unit}>
                  {data?.unit?.translation?.title}
                </span>
              </div>
              <button
                type="button"
                className={`${cls.counterBtn} ${
                  data.stock.quantity > data.quantity ? "" : cls.disabled
                }`}
                disabled={!(data.stock.quantity > data.quantity)}
                onClick={addProduct}
              >
                <AddFillIcon />
              </button>
            </div>
            <div className={cls.price}>
              {/* {!!data?.stock?.discount && (
                <span className={cls.oldPrice}>
                  <Price
                    number={
                      data?.stock?.price * data.quantity * (data?.interval || 1)
                    }
                    old
                  />
                </span>
              )} */}
              <Price number={totalPrice} />
            </div>
          </div>
        </div>
        <div className={cls.imageWrapper}>
          <FallbackImage
            fill
            src={getImage(data.img)}
            alt={data.translation?.title}
            sizes="320px"
            quality={90}
          />
        </div>
      </div>
      <CartReplaceModal
        open={openPrompt}
        handleClose={handleClosePrompt}
        onSubmit={handleReplaceCart}
      />
    </>
  );
}
