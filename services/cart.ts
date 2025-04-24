import { CartType, SuccessResponse } from "interfaces";
import request from "./request";

const cartService = {
  guestStore: (data?: any): Promise<SuccessResponse<CartType>> =>
    request.post(`/rest/cart`, data),
  guestGet: (id: number, params?: any): Promise<SuccessResponse<CartType>> =>
    request.get(`/rest/cart/${id}`, { params }),
  store: (data?: any): Promise<SuccessResponse<CartType>> =>
    request.post(`/dashboard/user/cart`, data),
  get: async ({ currency_id }: { currency_id?: number }) => {
    try {
      console.log('Fetching cart with currency:', currency_id);
      const response = await request.get('/dashboard/user/cart', {
        params: { currency_id }
      });
      console.log('Cart fetch response:', response.data);
      return {
        data: response.data,
        message: 'Success',
        timestamp: new Date().toISOString(),
        status: true
      };
    } catch (error: any) {
      console.error('Cart fetch error:', error);
      // Return a more structured error response
      return { 
        data: { user_carts: [] },
        message: error.response?.data?.message || 'Error fetching cart',
        timestamp: new Date().toISOString(),
        status: false,
        error: {
          code: error.response?.status,
          details: error.response?.data
        }
      };
    }
  },
  deleteCartProducts: (data: any) =>
    request.delete(`/dashboard/user/cart/product/delete`, {
      data,
    }),
  delete: (data: any) =>
    request.delete(`/dashboard/user/cart/delete`, {
      data,
    }),
  insert: async (data: any): Promise<SuccessResponse<CartType>> => {
    try {
      // Enhanced validation
      if (!data) {
        throw new Error('Cart data is required');
      }
      
      if (!data.shop_id) {
        throw new Error('shop_id is required');
      }

      if (!data.products || !Array.isArray(data.products) || data.products.length === 0) {
        throw new Error('products array is required and must not be empty');
      }
      
      // Enhanced product validation
      data.products.forEach((product: any, index: number) => {
        if (!product) {
          throw new Error(`Product at index ${index} is invalid`);
        }
        
        if (!product.stock_id) {
          throw new Error(`stock_id is required for product at index ${index}`);
        }

        if (typeof product.quantity !== 'number') {
          throw new Error(`quantity must be a number for product at index ${index}`);
        }

        if (product.quantity <= 0) {
          throw new Error(`quantity must be greater than 0 for product at index ${index}`);
        }

        if (product.parent_id && typeof product.parent_id !== 'number') {
          throw new Error(`parent_id must be a number for product at index ${index}`);
        }
      });

      console.log('Inserting cart with data:', JSON.stringify(data, null, 2));
      
      const response = await request.post(`/dashboard/user/cart/insert-product`, data);
      console.log('Cart insert response:', JSON.stringify(response.data, null, 2));
      
      return {
        data: response.data,
        message: 'Success',
        timestamp: new Date().toISOString(),
        status: true
      };
    } catch (error: any) {
      console.error('Cart insert error:', error);
      
      // Enhanced error handling
      const errorMessage = error.response?.data?.message || error.message || 'Error inserting cart';
      const errorResponse: SuccessResponse<CartType> = {
        data: {
          items: [],
          shopId: 0,
          total_price: 0,
          user_carts: [],
          id: 0,
          shop_id: 0
        },
        message: errorMessage,
        timestamp: new Date().toISOString(),
        status: false
      };

      throw errorResponse;
    }
  },
  open: (data: any) => request.post(`/dashboard/user/cart/open`, data),
  setGroup: (id: number) =>
    request.post(`/dashboard/user/cart/set-group/${id}`),
  guestLeave: (params?: any) =>
    request.delete(`/rest/cart/member/delete`, { params }),
  join: (data: any) => request.post(`/rest/cart/open`, data),
  statusChange: (uuid: string, data: any) =>
    request.post(`/rest/cart/status/${uuid}`, data),
  deleteGuestProducts: (data: any) =>
    request.delete(`/rest/cart/product/delete`, {
      data,
    }),
  deleteGuest: (params: any) =>
    request.delete(`/dashboard/user/cart/member/delete`, { params }),
  insertGuest: (data: any): Promise<SuccessResponse<CartType>> =>
    request.post(`/rest/cart/insert-product`, data),
};

export default cartService;
