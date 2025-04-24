import request from "./request";
import { Paginate, SuccessResponse } from "interfaces";
import {
  Parcel,
  ParcelFormValues,
  ParcelType,
} from "interfaces/parcel.interface";
import { AxiosResponse } from 'axios';

type ParcelPrice = {
  price: number;
};

const parcelService = {
  getAll: (params?: string): Promise<Paginate<Parcel>> =>
    request.get(`dashboard/user/parcel-orders?${params}`),
  getAllTypes: (params?: any): Promise<Paginate<ParcelType>> =>
    request.get(`rest/parcel-order/types`, { params }),
  getById: (id: number, params?: any): Promise<SuccessResponse<Parcel>> =>
    request.get(`dashboard/user/parcel-orders/${id}`, { params }),
  create: (data: ParcelFormValues): Promise<SuccessResponse<Parcel>> => {
    // Format the data before sending
    const formattedData = {
      ...data,
      currency_id: Number(data.currency_id),
      type_id: String(data.type_id),
      rate: Number(data.rate),
      payment_type_id: Number(data.payment_type_id),
      // Ensure phone numbers are properly formatted
      phone_from: data.phone_from.startsWith('+') ? data.phone_from.slice(1) : data.phone_from,
      phone_to: data.phone_to.startsWith('+') ? data.phone_to.slice(1) : data.phone_to,
      // Ensure location coordinates are strings
      location_from: {
        latitude: String(data.location_from.latitude),
        longitude: String(data.location_from.longitude),
        address: data.address_from
      },
      location_to: {
        latitude: String(data.location_to.latitude),
        longitude: String(data.location_to.longitude),
        address: data.address_to
      },
      // Ensure all required fields are present
      delivery_date: data.delivery_date,
      delivery_time: data.delivery_time,
      username_from: data.username_from || '',
      username_to: data.username_to || '',
      note: data.note || '',
      description: data.description || '',
      instructions: data.instructions || '',
      notify: Boolean(data.notify)
    };
    
    console.log('Sending formatted parcel data:', formattedData);
    return request.post(`dashboard/user/parcel-orders`, formattedData);
  },
  calculate: (params: {
    address_from: { latitude: string; longitude: string };
    address_to: { latitude: string; longitude: string };
    type_id: string | number;
    currency_id?: number;
  }): Promise<SuccessResponse<ParcelPrice>> =>
    request.get(`rest/parcel-order/calculate-price`, { params }),
  cancel: (id: number) =>
    request.post(
      `dashboard/user/parcel-orders/${id}/status/change?status=canceled`
    ),
  review: (id: number, data: any) =>
    request.post(`dashboard/user/parcel-orders/deliveryman-review/${id}`, data),
};

export default parcelService;
