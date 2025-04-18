import { createSlice } from "@reduxjs/toolkit";
import { CartType } from "interfaces/cart.interface"; // Update import path
import { RootState } from "redux/store";

type UserCartType = {
  userCart: CartType;
  indicatorVisible?: boolean;
  error?: string | null;
  loading: boolean;
};

const initialState: UserCartType = {
  userCart: {
    items: [],
    shopId: 0,
    totalPrice: 0,
    totalQuantity: 0,
    group: false,
    owner_id: 0,
    receipt_discount: 0,  // Add this line with default value
    total_price: 0,  // Add required property from CartType interface
    user_carts: [
      {
        id: 0,
        name: "",
        user_id: 1,
        uuid: "",
        cartDetails: [],
      },
    ],
  },
  indicatorVisible: false,
  error: null,
  loading: false
};

const userCartSlice = createSlice({
  name: "userCart",
  initialState,
  reducers: {
    updateUserCart(state, action) {
      try {
        const { payload } = action;
        if (!payload) throw new Error('Invalid cart data');
        state.userCart = payload;
        state.indicatorVisible = true;
        state.error = null;
      } catch (err) {
        state.error = err instanceof Error ? err.message : 'Failed to update cart';
        state.indicatorVisible = false;
      }
    },
    updateGroupStatus(state, action) {
      try {
        const { payload } = action;
        if (!payload?.id) throw new Error('Invalid group data');
        state.userCart.group = !state.userCart.group;
        state.userCart.id = payload.id;
        state.userCart.owner_id = payload.owner_id;
        state.indicatorVisible = true;
        state.error = null;
      } catch (err) {
        state.error = err instanceof Error ? err.message : 'Failed to update group status';
      }
    },
    clearUserCart(state) {
      state.userCart = initialState.userCart;
      state.indicatorVisible = false;
      state.error = null;
    },
    updateIndicatorState(state, action) {
      state.indicatorVisible = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    }
  },
});

export const { 
  updateUserCart, 
  updateGroupStatus, 
  clearUserCart, 
  updateIndicatorState,
  setError,
  setLoading 
} = userCartSlice.actions;

// Selectors
export const selectUserCart = (state: RootState) => state.userCart.userCart;
export const selectCartError = (state: RootState) => state.userCart.error;
export const selectCartLoading = (state: RootState) => state.userCart.loading;
export const selectCartIndicator = (state: RootState) => state.userCart.indicatorVisible;

export default userCartSlice.reducer;
