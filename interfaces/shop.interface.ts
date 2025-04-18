export interface ShopFormType {
  title: {
    [key: string]: string;
  };
  phone: string;
  images: string[];
  description: {
    [key: string]: string;
  };
  min_amount: string;
  tax: string;
  categories: number[];
  tags: number[];
  documents: File[];
  delivery_time_type: string;
  delivery_time_from: string;
  delivery_time_to: string;
  price: string;
  price_per_km: string;
  address: {
    [key: string]: string;
  };
  location: string;
}