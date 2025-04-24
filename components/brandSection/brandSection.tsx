import React from 'react';
import { IBrand, Paginate } from 'interfaces';
import { useQuery } from 'react-query';
import brandService from 'services/brand';
import Link from 'next/link';
import styles from './brandSection.module.scss';
import { Skeleton } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface Props {
  title?: string;
  className?: string;
}

export default function BrandSection({ title, className }: Props) {
  const { t } = useTranslation();
  const defaultTitle = t('popular.brands', 'Popular Brands');

  const { data: brandData, isLoading, error } = useQuery(['brands'], () =>
    brandService.getAll({ perPage: 8, page: 1 })
  );

  if (error) {
    console.error('Error fetching brands:', error);
    return null;
  }

  if (isLoading) {
    return (
      <section className={`container ${styles.wrapper} ${className || ''}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title || defaultTitle}</h2>
          <Link href="/brands" className={styles.link}>
            {t('see.all')}
          </Link>
        </div>
        <div className={styles.grid}>
          {[...Array(8)].map((_, idx) => (
            <div key={idx} className={styles.brandCard}>
              <Skeleton variant="circular" width={120} height={120} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!brandData?.data?.length) {
    return null;
  }

  return (
    <section className={`container ${styles.wrapper} ${className || ''}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title || defaultTitle}</h2>
        <Link href="/brands" className={styles.link}>
          {t('see.all')}
        </Link>
      </div>
      <div className={styles.grid}>
        {brandData.data.slice(0, 8).map((brand) => (
          <Link
            href={`/products?brand=${brand.id}`}
            key={brand.id}
            className={styles.brandCard}
          >
            <div className={styles.imageWrapper}>
              <img
                src={brand.img}
                alt={brand.title}
                className={styles.brandImage}
              />
            </div>
            <p className={styles.brandTitle}>{brand.title}</p>
            <span className={styles.productCount}>
              {brand.products_count} {t('products', 'products')}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
} 