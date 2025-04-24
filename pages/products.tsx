import React, { useCallback, useEffect, useRef } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { dehydrate, QueryClient, useInfiniteQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import productService from 'services/product';
import { useAppSelector } from 'hooks/useRedux';
import { selectCurrency } from 'redux/slices/currency';
import ProductList from 'containers/productList/productList';
import SEO from 'components/seo';
import Empty from 'components/empty/empty';
import Loader from 'components/loader/loader';
import { Product } from 'interfaces';

const PER_PAGE = 12;

export default function Products() {
  const { t } = useTranslation();
  const { query } = useRouter();
  const currency = useAppSelector(selectCurrency);
  const loader = useRef(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery(
    ['products', query.brand, currency?.id],
    ({ pageParam = 1 }) =>
      productService.getAll({
        brand_id: query.brand,
        currency_id: currency?.id,
        perPage: PER_PAGE,
        page: pageParam,
        include: 'stock',
      }),
    {
      enabled: !!query.brand,
      getNextPageParam: (lastPage) => {
        if (lastPage.meta.current_page < lastPage.meta.last_page) {
          return lastPage.meta.current_page + 1;
        }
        return undefined;
      },
    }
  );

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage]
  );

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: '20px',
      threshold: 0,
    };

    const observer = new IntersectionObserver(handleObserver, option);
    if (loader.current) observer.observe(loader.current);

    return () => {
      if (loader.current) observer.disconnect();
    };
  }, [handleObserver]);

  if (isLoading) {
    return <Loader />;
  }

  const allProducts = data?.pages?.reduce<Product[]>((acc, page) => {
    const productsWithStock = page.data.map(product => ({
      ...product,
      stock: product.stocks?.[0]
    }));
    return [...acc, ...productsWithStock];
  }, []) || [];

  if (!allProducts.length) {
    return <Empty text={t('no.products.found')} />;
  }

  return (
    <>
      <SEO title={t('products')} />
      <div className="container">
        <ProductList
          title={t('products')}
          products={allProducts}
          loading={isLoading}
        />
        {isFetchingNextPage && <Loader />}
        <div ref={loader} />
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const queryClient = new QueryClient();
  const { brand, currency_id } = context.query;

  if (brand) {
    try {
      await queryClient.prefetchInfiniteQuery(
        ['products', brand, currency_id || null],
        async ({ pageParam = 1 }) => {
          const data = await productService.getAll({
            brand_id: brand,
            currency_id: currency_id || null,
            perPage: PER_PAGE,
            page: pageParam,
            include: 'stock',
          });
          return {
            ...data,
            pageParams: [pageParam],
          };
        },
        {
          getNextPageParam: (lastPage) => {
            if (lastPage.meta.current_page < lastPage.meta.last_page) {
              return lastPage.meta.current_page + 1;
            }
            return null; // Use null instead of undefined
          },
        }
      );
    } catch (error) {
      console.error('Error prefetching products:', error);
    }
  }

  // Ensure the dehydrated state is serializable
  const dehydratedState = JSON.parse(JSON.stringify(dehydrate(queryClient)));

  return {
    props: {
      dehydratedState,
    },
  };
}; 