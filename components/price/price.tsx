import React, { useMemo, useState, useEffect } from "react";
import { useAppSelector } from "hooks/useRedux";
import { selectCurrency } from "redux/slices/currency";
import dynamic from "next/dynamic";
import { numberToPrice } from "utils/numberToPrice";

interface PriceProps {
  number?: number;
  symbol?: string;
  translation?: boolean;
  old?: boolean;
  minus?: boolean;
  plus?: boolean;
}

const Price = ({ 
  number = 0, 
  symbol, 
  translation = true, 
  old = false,
  minus = false,
  plus = false
}: PriceProps) => {
  const [formattedPrice, setFormattedPrice] = useState('0.00');
  const currency = useAppSelector(selectCurrency);
  const displaySymbol = symbol || currency?.symbol || "$";

  useEffect(() => {
    if (typeof number !== 'number') {
      setFormattedPrice('0.00');
      return;
    }
    const value = translation 
      ? (number * (currency?.rate || 1))
      : number;
    const finalValue = minus ? -value : value;
    setFormattedPrice(numberToPrice(finalValue, 2));
  }, [number, translation, currency?.rate, minus]);

  return (
    <span suppressHydrationWarning className={`price-text ${old ? 'old-price' : ''}`}>
      {plus && '+'}{displaySymbol} {formattedPrice}
    </span>
  );
};

// Export as client component
export default dynamic(() => Promise.resolve(Price), {
  ssr: false,
  loading: () => <span className="price-text">...</span>
});
