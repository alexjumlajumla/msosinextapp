import React, { useState } from "react";
import { CartStockWithProducts, InsertProductBody } from "interfaces";
import { useAppDispatch, useAppSelector } from "hooks/useRedux";
import useDebounce from "hooks/useDebounce";
import useDidUpdate from "hooks/useDidUpdate";
import { useMutation, useQuery } from "react-query";
import cartService from "services/cart";
import { selectCurrency } from "redux/slices/currency";
import { useRouter } from "next/router";
import { clearUserCart, updateUserCart } from "redux/slices/userCart";
import CartProductUI from "./cartProductUI";
import useModal from "hooks/useModal";
import CartReplaceModal from "components/clearCartModal/cartReplacePrompt";

type Props = {
  data: CartStockWithProducts;
  cartId: number;
  disabled?: boolean;
};

function validateAndGetProduct(data: CartStockWithProducts): CartStockWithProducts | null {
  if (!data?.stock?.id || !data?.stock?.product || typeof data.id !== 'number') {
    return null;
  }

  return {
    ...data,
    id: Number(data.id),
    stock: {
      ...data.stock,
      discount: data.stock.discount ?? 0,
      total_price: data.stock.total_price ?? data.stock.price ?? 0,
      quantity: Math.max(data.stock.quantity ?? 0, 0),
      product: {
        ...data.stock.product,
        max_qty: Math.max(data.stock.product.max_qty ?? 1000, 1),
        min_qty: Math.max(data.stock.product.min_qty ?? 1, 1),
      }
    },
    quantity: Math.max(data.quantity ?? 0, 0),
  };
}

// Update the transform function to match CartProductUI's expected props
function transformToCartProductUI(data: CartStockWithProducts) {
  return {
    ...data,
    id: Number(data.id),
    stock: {
      ...data.stock,
      discount: data.stock.discount ?? 0,
      price: data.stock.price ?? 0,
      total_price: data.stock.total_price ?? data.stock.price ?? 0,
      quantity: Math.max(data.stock.quantity ?? 0, 0),
      product: {
        ...data.stock.product,
        translation: data.stock.product.translation ?? { title: '' },
        interval: data.stock.product.interval ?? 1,
        unit: data.stock.product.unit ?? { 
          translation: { 
            title: '',
            locale: '',
            description: '' 
          } 
        },
        max_qty: Math.max(data.stock.product.max_qty ?? 1000, 1),
        min_qty: Math.max(data.stock.product.min_qty ?? 1, 1),
        shop_id: data.stock.product.shop_id ?? 0
      }
    },
    bonus: data.bonus ?? false,
    quantity: Math.max(data.quantity ?? 0, 0),
    addons: data.addons?.map(addon => ({
      ...addon,
      quantity: addon.quantity ?? 0,
      stock: {
        ...addon.stock,
        price: addon.stock?.price ?? 0,
        quantity: addon.stock?.quantity ?? 0,
        discount: addon.stock?.discount ?? 0,
        product: {
          ...addon.stock?.product,
          translation: addon.stock?.product?.translation ?? { title: '' },
          interval: addon.stock?.product?.interval ?? 1
        }
      }
    })) ?? []
  };
}

export default function ProtectedCartProduct({
  data,
  cartId,
  disabled,
}: Props) {
  const [quantity, setQuantity] = useState(data.quantity);
  const debouncedQuantity = useDebounce(quantity, 400);
  const currency = useAppSelector(selectCurrency);
  const dispatch = useAppDispatch();
  const { query } = useRouter();
  const shopId = Number(query.id);
  const [openPrompt, handleOpenPrompt, handleClosePrompt] = useModal();

  const { refetch, isLoading: isCartLoading } = useQuery(
    ["cart", currency?.id],
    () => cartService.get({ currency_id: currency?.id }),
    {
      onSuccess: (data) => dispatch(updateUserCart(data.data)),
      enabled: false,
    }
  );

  const { mutate: storeProduct, isLoading } = useMutation({
    mutationFn: (data: any) => cartService.insert(data),
    onSuccess: (data) => {
      dispatch(updateUserCart(data.data));
    },
    onError: () => {
      handleClearCart();
    },
  });

  const { mutate: deleteProducts, isLoading: isDeleteLoading } = useMutation({
    mutationFn: (data: any) => cartService.deleteCartProducts(data),
    onSuccess: () => refetch(),
  });

  const { isLoading: isLoadingClearCart, mutate: mutateClearCart } =
    useMutation({
      mutationFn: (data: any) => cartService.delete(data),
      onSuccess: () => {
        dispatch(clearUserCart());
      },
    });

  function handleProductUpdate(product: CartStockWithProducts, newQuantity: number) {
    const validatedProduct = validateAndGetProduct(product);
    if (!validatedProduct) return;

    if (newQuantity === 0) {
      deleteFromCart(validatedProduct);
    } else {
      storeProductToCart(validatedProduct, newQuantity);
    }
  }

  function addProduct() {
    if (!checkIsAbleToAddProduct()) {
      handleOpenPrompt();
      return;
    }

    const validatedProduct = validateAndGetProduct(data);
    if (!validatedProduct) return;

    const maxQty = validatedProduct.stock.product.max_qty ?? 1000;
    if (quantity < maxQty && validatedProduct.stock.quantity > quantity) {
      const newQuantity = Math.min(quantity + 1, maxQty);
      setQuantity(newQuantity);
      handleProductUpdate(validatedProduct, newQuantity);
    }
  }

  function reduceProduct() {
    if (!checkIsAbleToAddProduct()) {
      handleOpenPrompt();
      return;
    }

    const validatedProduct = validateAndGetProduct(data);
    if (!validatedProduct) return;

    const minQty = validatedProduct.stock.product.min_qty ?? 1;
    const newQuantity = quantity <= minQty ? 0 : Math.max(quantity - 1, minQty);
    setQuantity(newQuantity);
    handleProductUpdate(validatedProduct, newQuantity);
  }

  useDidUpdate(() => {
    if (debouncedQuantity) {
      const validatedProduct = validateAndGetProduct(data);
      if (validatedProduct) {
        storeProductToCart(validatedProduct, debouncedQuantity);
      }
    } else {
      const validatedProduct = validateAndGetProduct(data);
      if (validatedProduct) {
        deleteFromCart(validatedProduct);
      }
    }
  }, [debouncedQuantity]);

  function storeProductToCart(product: CartStockWithProducts, quantity: number) {
    const body: InsertProductBody = {
      shop_id: shopId,
      currency_id: currency?.id,
      rate: currency?.rate,
      products: [
        {
          stock_id: product.stock.id,
          quantity: Math.max(quantity, 0),
        },
      ],
    };

    if (product.addons?.length) {
      const validAddons = product.addons.filter(addon => addon?.stock?.id);
      validAddons.forEach((addon) => {
        body.products.push({
          stock_id: addon.stock.id,
          quantity: Math.max(addon.quantity ?? 0, 0),
          parent_id: product.stock.id,
        });
      });
    }

    if (!product.bonus) {
      storeProduct(body);
    }
  }

  function deleteFromCart(product: CartStockWithProducts) {
    const validAddons = product.addons
      ?.filter(item => item?.stock?.id)
      .map(item => item.stock.id) ?? [];
      
    deleteProducts({ ids: [product.id, ...validAddons] });
  }

  function handleClearCart() {
    const ids = [cartId];
    mutateClearCart({ ids });
  }

  function checkIsAbleToAddProduct() {
    let isActiveCart: boolean;
    isActiveCart =
      data.stock.product.shop_id === 0 || data.stock.product.shop_id === shopId;
    return isActiveCart;
  }

  return (
    <>
      {(() => {
        const validatedProduct = validateAndGetProduct(data);
        if (!validatedProduct) return null;
        
        const transformedData = transformToCartProductUI(validatedProduct) as any; // temporary fix until we update interfaces
        return (
          <CartProductUI
            data={transformedData}
            loading={isLoading || isCartLoading || isDeleteLoading || isLoadingClearCart}
            addProduct={addProduct}
            reduceProduct={reduceProduct}
            quantity={quantity}
            disabled={disabled}
          />
        );
      })()}
      <CartReplaceModal
        open={openPrompt}
        handleClose={handleClosePrompt}
        onSubmit={handleClearCart}
        loading={isLoadingClearCart}
      />
    </>
  );
}
