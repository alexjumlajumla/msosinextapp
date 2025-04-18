import React from "react";
import cls from "./cart.module.scss";
import CartHeader from "components/cartHeader/cartHeader";
import CartProductComponent from "components/cartProduct/cartProduct";
import CartServices from "components/cartServices/cartServices";
import CartTotal from "components/cartTotal/cartTotal";
import { useAppSelector } from "hooks/useRedux";
import { selectCart, selectTotalPrice } from "redux/slices/cart";
import EmptyCart from "components/emptyCart/emptyCart";
// Import target CartProduct type from index and alias source types if needed
import { IShop, CartProduct as IndexCartProduct, Translation as IndexTranslation } from "interfaces";
// Keep source CartItem type
import { CartItem } from "interfaces/cart.interface";

type Props = {
  shop: IShop;
};

// Helper to ensure translation conforms to IndexTranslation
const ensureIndexTranslation = (translation: any): IndexTranslation => {
  // Ensure locale exists, provide default. Also handle potential missing description.
  return {
    locale: translation?.locale || 'en', // Default locale
    title: translation?.title || '',     // Default title
    description: translation?.description || '', // Default description
    // Add other required fields from IndexTranslation if necessary, with defaults
  };
};

export default function CartContainer({ shop }: Props) {
  const cart = useAppSelector(selectCart);
  const cartItems = cart?.items || [];
  const totalPrice = useAppSelector(selectTotalPrice);

  return (
    <div className={cls.container}>
      <div className={cls.header}>
        <CartHeader />
        {cartItems.map((item: CartItem) => {
          if (!item.stock.product) return null;

          const cartProduct: IndexCartProduct = {
            id: item.id,
            quantity: item.quantity,
            shop_id: item.shop_id,
            img: item.stock.product.img || '',
            translation: ensureIndexTranslation(item.stock.product.translation),
            interval: item.stock.product.interval || 0,
            unit: item.stock.product.unit ? {
              translation: {
                locale: 'en',
                title: item.stock.product.unit.translation.title,
                description: ''
              }
            } : null,
            extras: item.extras || [],
            stock: {
              ...item.stock,
              product: {
                id: item.stock.product.id,
                img: item.stock.product.img || '',
                translation: ensureIndexTranslation(item.stock.product.translation),
                interval: item.stock.product.interval || 0,
                unit: item.stock.product.unit ? {
                  translation: {
                    locale: 'en',
                    title: item.stock.product.unit.translation.title,
                    description: ''
                  }
                } : null
              }
            },
            addons: item.addons?.filter(addon => addon.stock?.product).map(addon => {
              const addonProduct = addon.stock.product!;
              return {
                id: addon.id,
                quantity: addon.quantity,
                shop_id: addon.shop_id,
                img: addonProduct.img || '',
                translation: ensureIndexTranslation(addonProduct.translation),
                interval: addonProduct.interval || 0,
                unit: addonProduct.unit ? {
                  translation: {
                    locale: 'en',
                    title: addonProduct.unit.translation.title,
                    description: ''
                  }
                } : null,
                extras: addon.extras || [],
                stock: {
                  ...addon.stock,
                  product: {
                    id: addonProduct.id,
                    img: addonProduct.img || '',
                    translation: ensureIndexTranslation(addonProduct.translation),
                    interval: addonProduct.interval || 0,
                    unit: addonProduct.unit ? {
                      translation: {
                        locale: 'en',
                        title: addonProduct.unit.translation.title,
                        description: ''
                      }
                    } : null
                  }
                },
                addons: []
              };
            }) || []
          };

          return <CartProductComponent key={item.stock.id} data={cartProduct} />;
        })}
        {cartItems.length < 1 && (
          <div className={cls.empty}>
            <EmptyCart />
          </div>
        )}
      </div>
      {cartItems.length > 0 && <CartServices data={shop} />}
      {cartItems.length > 0 && (
        <CartTotal totalPrice={totalPrice} data={shop} />
      )}
    </div>
  );
}
