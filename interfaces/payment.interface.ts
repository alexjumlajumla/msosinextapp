export interface PaymentPayload {
  id: number;
  payment: {
    payment_sys_id: number;
  };
}

export interface PaymentList {
  data: Array<{
    id: number;
    tag: string;
  }>;
}

export interface PaymentResponse {
  data: {
    id: number;
    data: {
      url: string;
    };
  };
}