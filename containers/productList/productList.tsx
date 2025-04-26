import React from "react";
import { Product } from "interfaces";
import { Skeleton } from "@mui/material";
import ProductCard from "components/productCard/productCard";
import { useAppDispatch } from "hooks/useRedux";
import { setProduct } from "redux/slices/product";
import { useRouter } from "next/router";
import styles from "./productList.module.scss";

type Props = {
  title?: string;
  products: Product[];
  loading?: boolean;
  uuid?: string;
};

export default function ProductList({ loading, products = [], title, uuid }: Props) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleOpen = (event: any, data: Product) => {
    dispatch(setProduct(data));
    router.push(`/products/${data.id}`);
  };

  return (
    <div 
      className={styles.wrapper} 
      id={uuid} 
      data-section={uuid}
    >
      {title && (
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
        </div>
      )}
      <div className={styles.productGrid}>
        {loading ? (
          Array.from({ length: 8 }).map((_, idx) => (
            <Skeleton
              key={`product-skeleton-${idx}`}
              variant="rectangular"
              className={styles.skeleton}
              width={280}
              height={320}
            />
          ))
        ) : (
          products.map((product) => (
            product && (
              <div 
                key={`product-${product.id || Math.random()}`} 
                className={styles.productCard}
              >
                <ProductCard 
                  data={product} 
                  handleOpen={(e) => handleOpen(e, product)} 
                />
              </div>
            )
          ))
        )}
      </div>
    </div>
  );
}
