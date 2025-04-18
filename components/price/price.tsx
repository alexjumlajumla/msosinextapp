import React, { useMemo } from "react";
import { useAppSelector } from "hooks/useRedux";
import { selectCurrency } from "redux/slices/currency";
import dynamic from "next/dynamic";

interface PriceProps {
  number?: number;
  symbol?: string;
  translation?: boolean;
  old?: boolean;
  minus?: boolean;
  plus?: boolean;  // Add this line
}

const Price = ({ 
  number = 0, 
  symbol, 
  translation = true, 
  old = false,
  minus = false,
  plus = false
}: PriceProps) => {
  const currency = useAppSelector(selectCurrency);
  const displaySymbol = symbol || currency?.symbol || "$";

  const formattedPrice = useMemo(() => {
    if (typeof number !== 'number') return '0.00';
    const value = translation 
      ? (number * (currency?.rate || 1))
      : number;
    return minus ? (-value).toFixed(2) : value.toFixed(2);
  }, [number, translation, currency?.rate, minus]);

  return (
    <span className={`price-text ${old ? 'old-price' : ''}`}>
      {plus && '+'}{displaySymbol} {formattedPrice}
    </span>
  );
};

// Export as client component
export default dynamic(() => Promise.resolve(Price), {
  ssr: false
});
