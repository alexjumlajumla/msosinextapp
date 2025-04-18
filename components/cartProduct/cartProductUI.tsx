import React from "react";
import cls from "./cartProduct.module.scss";
import Badge from "components/badge/badge";
import Loading from "components/loader/loading";
import Price from "components/price/price";
import { CartProduct } from "interfaces/cartProduct.interface";
import AddFillIcon from "remixicon-react/AddFillIcon";
import SubtractFillIcon from "remixicon-react/SubtractFillIcon";
import getImage from "utils/getImage";
import FallbackImage from "components/fallbackImage/fallbackImage";

interface CartProductUIProps {
  data: CartProduct;
  loading: boolean;
  addProduct: () => void;
  reduceProduct: () => void;
  quantity: number;
  disabled?: boolean;
}

export default function CartProductUI({
  data,
  loading,
  addProduct,
  reduceProduct,
  quantity,
  disabled,
}: CartProductUIProps) {
  const isReduceDisabled = quantity < 1 || data.bonus || disabled;
  const isAddDisabled =
    !(data.stock?.quantity > quantity) ||
    data.bonus ||
    disabled ||
    data.stock.product.max_qty === quantity;

  const totalPrice =
    (data.stock.price || 0) * quantity -
    ((data.stock.discount || 0) * quantity) +
    (data.addons?.reduce(
      (acc, item) =>
        acc + ((item?.stock?.price || 0) * (item?.quantity || 1)),
      0
    ) || 0);

  return (
    <div className={cls.wrapper}>
      <div className={cls.block}>
        <h6 className={cls.title}>
          {data.stock?.product?.translation?.title}{" "}
          {data.stock?.extras?.length
            ? data.stock.extras.map((item, idx) => (
                <span key={"extra" + idx}>({item.value})</span>
              ))
            : ""}
        </h6>
        <p className={cls.description}>
          {data.addons
            ?.map(
              (item) =>
                item.stock?.product?.translation?.title +
                " x " +
                item.quantity * (item.stock?.product?.interval || 1),
            )
            .join(", ")}
        </p>
        <div className={cls.actions}>
          <div className={cls.counter}>
            <button
              type="button"
              className={`${cls.counterBtn} ${
                isReduceDisabled ? cls.disabled : ""
              }`}
              disabled={isReduceDisabled}
              onClick={reduceProduct}
            >
              <SubtractFillIcon />
            </button>
            <div className={cls.count}>
              {quantity * (data?.stock?.product?.interval || 1)}{" "}
              <span className={cls.unit}>
                {data?.stock?.product?.unit?.translation?.title}
              </span>
            </div>
            <button
              type="button"
              className={`${cls.counterBtn} ${
                isAddDisabled ? cls.disabled : ""
              }`}
              disabled={isAddDisabled}
              onClick={addProduct}
            >
              <AddFillIcon />
            </button>
          </div>
          <div className={cls.price}>
            {!!data.discount && (
              <div className={cls.oldPrice}>
                <Price number={data?.price} old />
              </div>
            )}
            <Price number={totalPrice} />
          </div>
        </div>
      </div>
      <div className={cls.imageWrapper}>
        <FallbackImage
          fill
          src={getImage(data.stock?.product?.img)}
          alt={data.stock?.product?.translation?.title}
          sizes="320px"
          quality={90}
        />
        {data.bonus && (
          <span className={cls.bonus}>
            <Badge type="bonus" variant="circle" />
          </span>
        )}
      </div>

      {loading && <Loading />}
    </div>
  );
}
