import { Paginate, IShop, SuccessResponse, ShopReview, IBookingShop, IBranch } from "interfaces";
import request from "./request";

const shopService = {
  getAll: (params: string): Promise<Paginate<IShop>> =>
    request.get(`/rest/shops/paginate?${params}`),
  getAllBooking: (params: string): Promise<Paginate<IShop>> =>
    request.get(`/rest/booking/shops/paginate?${params}`),
  getAllRestaurants: (params: string): Promise<Paginate<IBookingShop>> =>
    request.get(`/rest/shops/paginate?type=restaurant&${params}`),
  getAllShops: (params: string): Promise<Paginate<IShop>> =>
    request.get(`/rest/shops/paginate?type=shop&include=location,distance&${params}`),
  getById: (id: number, params?: any): Promise<SuccessResponse<IShop>> =>
    request.get(`/rest/shops/${id}`, { params }),
  getRecommended: (params?: any): Promise<Paginate<IShop>> =>
    request.get(`/rest/shops/recommended`, { 
      params: {
        ...params,
        include: 'location,distance,translations,delivery_time,price,rating',
        type: 'shop',
        perPage: 4,
        open: 1,
        random: Math.random()
      }
    }),
  getNewShops: (params?: any): Promise<Paginate<IShop>> => {
    // Calculate date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const formattedDate = sevenDaysAgo.toISOString().split('T')[0];

    return request.get(`/rest/shops/paginate`, {
      params: {
        ...params,
        include: 'location,distance',
        sort: 'desc',
        column: 'created_at',
        perPage: 10,
        created_from: formattedDate,
        random: Math.random()
      }
    });
  },
  getTopRated: (params?: any): Promise<Paginate<IShop>> =>
    request.get(`/rest/shops/paginate`, {
      params: {
        ...params,
        include: 'location,distance',
        sort: 'desc',
        column: 'rating_avg',
        perPage: 10,
        rating_from: 4.5,
        random: Math.random()
      }
    }),
  search: (params: any): Promise<Paginate<IShop>> =>
    request.get(`/rest/shops/search`, { params }),
  getAllTags: (params?: any) => request.get(`/rest/shops-takes`, { params }),
  getAveragePrices: (params?: any) =>
    request.get(`/rest/products-avg-prices`, { params }),
  create: (data: any) => request.post(`/dashboard/user/shops`, data),
  checkZone: (params?: any) =>
    request.get(`/rest/shop/delivery-zone/check/distance`, {
      params: {
        ...params,
        include: 'location,distance'
      }
    }),
  checkZoneById: (id: number, params?: any) =>
    request.get(`/rest/shop/${id}/delivery-zone/check/distance`, { params }),
  getByIdReviews: (id: number, params?: any): Promise<Paginate<ShopReview>> =>
    request.get(`/rest/shops/${id}/reviews`, { params }),
  getAllBranches: (params?: any):Promise<Paginate<IBranch>> => request.get(`/rest/branches`, {params}),
  getWholesaleShops: (params?: any): Promise<Paginate<IShop>> =>
    request.get(`/rest/shops/paginate`, {
      params: {
        ...params,
        include: 'location,distance',
        has_min_amount: 1,
        sort: 'asc',
        column: 'min_amount',
        perPage: 12
      }
    })
};

export default shopService;
