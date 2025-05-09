import React, { useEffect, useState } from "react";
import { Product, ProductExtra, Stock } from "interfaces";
import { getExtras, sortExtras } from "utils/getExtras";
import { useAppDispatch, useAppSelector } from "hooks/useRedux";
import { selectCurrency } from "redux/slices/currency";
import { useMutation, useQuery } from "react-query";
import cartService from "services/cart";
import {
  clearUserCart,
  selectUserCart,
  updateUserCart,
} from "redux/slices/userCart";
import useModal from "hooks/useModal";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import productService from "services/product";
import { useTranslation } from "react-i18next";
import { error, info } from "components/alert/toast";
import { useRestaurant } from 'contexts/restaurant/restaurant.context';
import useShopWorkingSchedule from "hooks/useShopWorkingSchedule";
import { ShopWorkingDays } from 'interfaces';

const CartReplaceModal = dynamic(() => import("components/clearCartModal/cartReplacePrompt"), {
  ssr: false
});
const ProductUI = dynamic(() => import("./productUI"), {
  ssr: false
});
const AddonsForm = dynamic(() => import("components/extrasForm/addonsForm"), {
  ssr: false
});

type SuccessResponse<T> = {
  data: T;
  message: string;
  status: boolean;
  timestamp: string;
};

type Props = {
  handleClose: () => void;
  uuid: string;
  initialData?: SuccessResponse<Product>;
};

type ShowExtrasType = {
  extras: Array<ProductExtra[]>;
  stock: Stock;
};

type SelectedAddon = {
  id: string;
  quantity: number;
};

export default function ProtectedProductSingle({ handleClose, uuid, initialData }: Props) {
  const { t } = useTranslation();
  const [counter, setCounter] = useState(1);
  const [extras, setExtras] = useState<any[]>([]);
  const [stock, setStock] = useState<any[]>([]);
  const [showExtras, setShowExtras] = useState<ShowExtrasType>({
    extras: [],
    stock: {
      id: 0,
      quantity: 1,
      price: 0,
    },
  });
  const [extrasIds, setExtrasIds] = useState<any[]>([]);
  const [addons, setAddons] = useState<Product[]>([]);
  const dispatch = useAppDispatch();
  const currency = useAppSelector(selectCurrency);
  const cart = useAppSelector(selectUserCart);
  const [openPrompt, handleOpenPrompt, handleClosePrompt] = useModal();
  const { query } = useRouter();
  const shopId = Number(query.id);
  const { restaurant } = useRestaurant();
  const { isShopClosed } = useShopWorkingSchedule(restaurant);
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([]);

  const { data } = useQuery(
    ["product", uuid, currency],
    () => productService.getById(uuid, { currency_id: currency?.id }),
    {
      enabled: Boolean(uuid) && Boolean(currency?.id),
      initialData: initialData,
    }
  );

  const { isLoading, mutate } = useMutation({
    mutationFn: (data: any) => cartService.insert(data),
    onSuccess: (data) => {
      dispatch(updateUserCart(data.data));
      handleClose();
    },
    onError: (err) => {
      console.log("err => ", err);
      error(t("try.again"));
    },
  });

  const { isLoading: isLoadingClearCart, mutate: mutateClearCart } =
    useMutation({
      mutationFn: (data: any) => cartService.delete(data),
      onSuccess: () => {
        dispatch(clearUserCart());
        storeCart();
        handleClosePrompt();
      },
    });

  useEffect(() => {
    if (data?.data) {
      setCounter(data.data.min_qty || 1);
      const myData = sortExtras(data.data);
      setExtras(myData.extras);
      setStock(myData.stock);
      setShowExtras(getExtras("", myData.extras, myData.stock));
      getExtras("", myData.extras, myData.stock).extras?.forEach((element) => {
        setExtrasIds((prev) => [...prev, element[0]]);
      });
    }
  }, [data]);

  const handleExtrasClick = (e: any) => {
    setSelectedAddons([]);
    const index = extrasIds.findIndex(
      (item) => item.extra_group_id === e.extra_group_id
    );
    let array = extrasIds;
    if (index > -1) array = array.slice(0, index);
    array.push(e);
    const nextIds = array.map((item) => item.id).join(",");
    var extrasData = getExtras(
      nextIds,
      extras,
      stock.map((item) => ({ ...item }))
    );
    setShowExtras(extrasData);
    extrasData.extras?.forEach((element) => {
      const index = extrasIds.findIndex((item) =>
        element[0].extra_group_id != e.extra_group_id
          ? item.extra_group_id === element[0].extra_group_id
          : item.extra_group_id === e.extra_group_id
      );
      if (element[0].level >= e.level) {
        var itemData =
          element[0].extra_group_id != e.extra_group_id ? element[0] : e;
        if (index == -1) array.push(itemData);
        else {
          array[index] = itemData;
        }
      }
    });
    setExtrasIds(array);
  };

  function addCounter() {
    setCounter((prev) => prev + 1);
  }

  function reduceCounter() {
    setCounter((prev) => prev - 1);
  }

  const handleAddToCart = async () => {
    if (!restaurant) {
      error(t('shop.not.found'));
      return;
    }

    if (isShopClosed) {
      error(t('shop.closed'));
      return;
    }

    if (!checkIsAbleToAddProduct()) {
      handleOpenPrompt();
      return;
    }
    storeCart();
  }

  function getAddonQuantity(stock_id?: number) {
    const addon = addons.find((el) => el.stock?.id === stock_id);
    if (addon) {
      return addon.stock?.quantity;
    } else {
      return 0;
    }
  }

  function storeCart() {
    if (!shopId) {
      error(t('shop.id.required'));
      return;
    }

    if (!currency?.id) {
      error(t('currency.required'));
      return;
    }

    if (!showExtras.stock.id) {
      error(t('stock.not.found'));
      return;
    }

    const defaultAddons = showExtras.stock.addons?.filter((item) => !!item.product) || [];
    const products: {
      stock_id?: number;
      quantity?: number;
      parent_id: number;
    }[] = [];

    defaultAddons.forEach((item) => {
      const quantity = getAddonQuantity(item.product?.stock?.id);
      if (quantity && quantity > 0) {
        products.push({
          stock_id: item.product?.stock?.id,
          quantity: quantity,
          parent_id: showExtras.stock.id,
        });
      }
    });

    // Validate main product quantity
    if (counter <= 0) {
      error(t('quantity.must.be.greater.than.zero'));
      return;
    }

    const body = {
      shop_id: shopId,
      currency_id: currency.id,
      rate: currency.rate,
      products: [
        {
          stock_id: showExtras.stock.id,
          quantity: counter,
        },
        ...products,
      ],
    };

    console.log('Sending cart data:', body);
    mutate(body);
  }

  function checkIsAbleToAddProduct() {
    let isActiveCart: boolean;
    isActiveCart = cart.shop_id === 0 || cart.shop_id === shopId;
    return isActiveCart;
  }

  function handleClearCart() {
    const ids = [cart.id];
    mutateClearCart({ ids });
  }

  function handleAddonClick(list: Product[]) {
    setAddons(list);
  }

  function calculateTotalPrice() {
    const addonPrice = addons.reduce(
      (total, item) =>
        (total +=
          Number(item.stock?.total_price) * Number(item.stock?.quantity)),
      0
    );
    return addonPrice + Number(showExtras.stock.total_price) * counter;
  }

  return (
    <div>
      <ProductUI
        data={data?.data || {}}
        loading={!!data}
        stock={showExtras.stock}
        extras={showExtras.extras}
        counter={counter}
        addCounter={addCounter}
        reduceCounter={reduceCounter}
        handleExtrasClick={handleExtrasClick}
        handleAddToCart={handleAddToCart}
        loadingBtn={isLoading}
        totalPrice={calculateTotalPrice()}
        extrasIds={extrasIds}
      >
        <AddonsForm
          data={showExtras.stock.addons || []}
          handleAddonClick={handleAddonClick}
          quantity={counter}
          selectedAddons={selectedAddons}
          onSelectAddon={setSelectedAddons}
        />
      </ProductUI>
      <CartReplaceModal
        open={openPrompt}
        handleClose={handleClosePrompt}
        onSubmit={handleClearCart}
        loading={isLoadingClearCart}
      />
    </div>
  );
}
