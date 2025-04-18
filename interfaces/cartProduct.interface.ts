interface Translation {
  locale: string;
  title: string;
  description: string;
}

interface UnitTranslation {
  title: string;
  locale: string;
  description: string;
}

interface ProductUnit {
  translation: UnitTranslation;
}

interface BaseProduct {
  id: number;
  max_qty: number;
  min_qty: number;
  img: string;
  interval: number;
  translation: Translation;
  unit: ProductUnit;
}

interface Stock {
  id: number;
  price: number;
  quantity: number;
  discount: number;
  extras?: Array<{ value: string }>;
  product: BaseProduct;
}

export interface CartProduct {
  id: number;
  stock: {
    id: number;
    price: number;
    quantity: number;
    discount: number;
    extras?: Array<{ value: string }>;
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
  discount?: number;
  addons?: CartProduct[];
  bonus?: boolean;
}