export interface Translation {
  title: string;
  description?: string;
}

export interface Unit {
  translation: {
    title: string;
  };
}

export interface Product {
  id: number;
  img: string;
  translation: Translation;
  interval: number;
  unit: Unit | null;
  shop_id?: number;
}

export interface Stock {
  id: number;
  price: number;
  quantity: number;
  product?: Product;
  discount: number;  // Make discount required and explicitly typed
  total_price?: number;
}

export interface Addon {
  id: number;
  price?: number;
  quantity?: number;
  translation?: Translation;
  stock?: Stock;
  extras?: { value: string }[];
}

export interface CartItem {
  id: number;
  stock: Stock & {
    product?: Product;
  };
  quantity: number;
  shop_id: number;
  extras: Array<{ value: string }>;
  addons?: CartItem[];
}

export interface CartProduct {
  stock_id: number;
  quantity: number;
  parent_id?: number;  // Make parent_id optional but explicitly typed
}

export interface CartProductDetails extends Omit<CartItem, 'addons'> {
  img: string;
  translation: {
    title: string;
    description?: string;
    locale?: string;
  };
  interval: number;
  unit: Unit | null;
  stock: {
    id: number;
    price: number;
    quantity: number;
    discount: number; // Make discount required here too
    product: Product;
  };
  addons: CartProductDetails[];
}

export interface CartStockWithProducts {
  id: number;
  stock: {
    id: number;
    price: number;
    quantity: number;
    discount: number;
    product: {
      id: number;
      max_qty: number;
      min_qty: number;
      img: string;
      interval: number;
      translation: {
        locale: string;
        title: string;
        description: string;
      };
      unit: {
        translation: {
          title: string;
          locale: string;
          description: string;
        };
      };
    };
  };
  quantity: number;
  price: number;
  addons?: CartStockWithProducts[]; // This is the key change - making addons self-referential
  bonus?: boolean;
}

export interface UserCartDetails {
  id: number;
  name: string;
  user_id: number;
  uuid: string;
  cartDetails: CartStockWithProducts[];
  status?: boolean;
  cart_id?: number;
}

export interface CartType {
  items: CartItem[];
  shopId: number;
  totalPrice: number;
  totalQuantity: number;
  group?: boolean;
  owner_id?: number;
  id?: number;
  shop_id?: number;
  total_price: number;
  receipt_discount?: number;
  user_carts?: UserCartDetails[];
}

export interface MemberInsertProductBody {
  shop_id: number;
  products: CartProduct[];  // Use the CartProduct interface
  cart_id: number;
  user_cart_uuid: string;
}