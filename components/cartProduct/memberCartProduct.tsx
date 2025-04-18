import React, { useState } from "react";
import { CartStockWithProducts } from "interfaces/cart.interface";
import { useAppDispatch, useAppSelector } from "hooks/useRedux";
import useDebounce from "hooks/useDebounce";
import { useMutation, useQuery } from "react-query";
import cartService from "services/cart";
import CartProductUI from "./cartProductUI";
import { selectCurrency } from "redux/slices/currency";
import { useShop } from "contexts/shop/shop.context";

interface Props {
  data: CartStockWithProducts;
  cartId: number;
  disabled?: boolean;
}

export default function MemberCartProduct({ data, cartId, disabled }: Props): JSX.Element {
  const [quantity, setQuantity] = useState(data.quantity);
  const debouncedQuantity = useDebounce(quantity, 400);
  const dispatch = useAppDispatch();
  const currency = useAppSelector(selectCurrency);
  const { member } = useShop();

  const { refetch: refetchCart, isLoading: isCartLoading } = useQuery(
    ["cart", member?.cart_id, currency?.id],
    () =>
      cartService.guestGet(member?.cart_id || 0, {
        shop_id: member?.shop_id,
        user_cart_uuid: member?.uuid,
        currency_id: currency?.id,
      }),
    {
      enabled: false,
    }
  );

  interface CartProduct {
    stock_id: number;
    quantity: number;
    parent_id?: number;
  }

  interface MemberInsertProductBody {
    shop_id: number;
    products: CartProduct[];
    cart_id: number;
    user_cart_uuid: string;
  }

  const { mutate: storeProduct, isLoading } = useMutation({
    mutationFn: (data: MemberInsertProductBody) => cartService.insertGuest(data),
    onSuccess: () => {
      refetchCart();
    },
  });

  const { mutate: deleteProducts, isLoading: isDeleteLoading } = useMutation({
    mutationFn: (data: any) => cartService.deleteGuestProducts(data),
    onSuccess: () => {
      refetchCart();
    },
  });

  function addProduct() {
    if (disabled) return;
    
    const body: MemberInsertProductBody = {
      shop_id: member?.shop_id || 0,
      products: [
        {
          stock_id: data.stock.id,
          quantity: quantity + 1,
        },
      ],
      cart_id: cartId,
      user_cart_uuid: member?.uuid || '',
    };

    if (data.addons?.length) {
      data.addons.forEach((addon) => {
        if (addon?.stock?.id) {
          body.products.push({
            stock_id: addon.stock.id,
            quantity: addon.quantity || 0,
            parent_id: data.stock.id,
          });
        }
      });
    }

    if (!data.bonus) {
      setQuantity((prev) => prev + 1);
      storeProduct(body);
    }
  }

  function reduceProduct() {
    if (disabled) return;

    const body: MemberInsertProductBody = {
      shop_id: member?.shop_id || 0,
      products: [
        {
          stock_id: data.stock.id,
          quantity: quantity - 1,
        },
      ],
      cart_id: cartId,
      user_cart_uuid: member?.uuid || '',
    };

    if (data.addons?.length) {
      data.addons.forEach((addon) => {
        if (addon?.stock?.id) {
            body.products.push({
            stock_id: addon.stock.id,
            quantity: addon.quantity || 0,
            parent_id: data.stock.id,
            } as CartProduct);
        }
      });
    }

    if (!data.bonus) {
      setQuantity((prev) => prev - 1);
      if (quantity === 1) {
        deleteProducts({ ids: [data.id] });
      } else {
        storeProduct(body);
      }
    }
  }

  return (
    <CartProductUI
      data={data}
      loading={isLoading || isCartLoading || isDeleteLoading}
      addProduct={addProduct}
      reduceProduct={reduceProduct}
      quantity={quantity}
      disabled={disabled}
    />
  );
}

