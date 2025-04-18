import { createSlice } from "@reduxjs/toolkit";
import { CartProduct } from "interfaces";
import { CartType, Addon } from "interfaces/cart.interface"; // Import Addon type
import { RootState } from "redux/store";

const initialState: CartType = {
  items: [],
  shopId: 0,
  totalPrice: 0,
  totalQuantity: 0,
  total_price: 0, // Add the required property
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action) {
      const { payload } = action;
      const existingIndex = state.items.findIndex(
        (item) =>
          item?.stock?.id === payload?.stock?.id &&
          item?.addons?.length === payload?.addons?.length &&
          item?.addons?.every((addon) =>
            payload?.addons?.find(
              (pAddon: Addon) => // Changed from any
                pAddon?.stock?.id === addon?.stock?.id &&
                pAddon?.quantity === addon?.quantity,
            ),
          ),
      );
      if (existingIndex >= 0) {
        state.items[existingIndex].quantity += payload.quantity;
      } else {
        state.items.push(payload);
      }
    },
    setToCart(state, action) {
      const { payload } = action;
      const existingIndex = state.items.findIndex(
        (item) =>
          item?.stock?.id === payload?.stock?.id &&
          item?.addons?.length === payload?.addons?.length &&
          item?.addons?.every((addon) =>
            payload?.addons?.find(
              (pAddon: Addon) => // Changed from any
                pAddon?.stock?.id === addon?.stock?.id &&
                pAddon?.quantity === addon?.quantity,
            ),
          ),
      );
      if (existingIndex >= 0) {
        state.items[existingIndex] = payload;
      } else {
        state.items.push(payload);
      }
    },
    reduceCartItem(state, action) {
      const { payload } = action;
      const itemIndex = state.items.findIndex(
        (item) =>
          item?.stock?.id === payload?.stock?.id &&
          item?.addons?.length === payload?.addons?.length &&
          item?.addons?.every((addon) =>
            payload?.addons?.find(
              (pAddon: Addon) => // Changed from any
                pAddon?.stock?.id === addon?.stock?.id &&
                pAddon?.quantity === addon?.quantity,
            ),
          ),
      );

      if (state.items[itemIndex].quantity > 1) {
        state.items[itemIndex].quantity -= 1;
      }
    },
    removeFromCart(state, action) {
      const { payload } = action;
      state.items = state.items.filter(
        (item) =>
          !(
            item?.stock?.id === payload?.stock?.id &&
            item?.addons?.length === payload?.addons?.length &&
            item?.addons?.every((addon) =>
              payload?.addons?.find(
                (pAddon: Addon) => // Changed from any
                  pAddon?.stock?.id === addon?.stock?.id &&
                  pAddon?.quantity === addon?.quantity,
              ),
            )
          ),
      );
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  clearCart,
  reduceCartItem,
  setToCart,
} = cartSlice.actions;

export const selectCart = (state: RootState) => state.cart;
export const selectTotalPrice = (state: RootState) => state.cart.totalPrice;

export default cartSlice.reducer;
