import { Paginate, Payment } from "interfaces";
import request from "./request";

const paymentService = {
  createTransaction: (id: number, data: any) =>
    request.post(`payments/order/${id}/transactions`, data),
  getAll: (params?: any): Promise<Paginate<Payment>> =>
    request.get(`rest/payments`, { params }),
  payExternal: (type: string, params: any) => {
    console.log('Processing external payment:', { type, params });
    if (type === 'selcom') {
      console.log('Processing Selcom payment with params:', params);
      return request.get(`dashboard/user/order-${type}-process`, {
        params: {
          ...params,
          payment_type: 'selcom'
        }
      });
    }
    return request.get(`dashboard/user/order-${type}-process`, { params });
  },
  parcelTransaction: (id: number, data: any) => {
    console.log('Creating parcel transaction:', { id, data });
    if (data?.payment?.payment_sys_id) {
      const payment = {
        ...data.payment,
        payment_type: 'selcom'
      };
      return request.post(`payments/parcel-order/${id}/transactions`, { payment });
    }
    return request.post(`payments/parcel-order/${id}/transactions`, data);
  },
};

export default paymentService;
