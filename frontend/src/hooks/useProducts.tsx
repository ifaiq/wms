import { useQuery } from 'react-query';
import { ProductService } from 'src/services';

const productService = new ProductService();

const useGetProducts = (params: ISearchProducts) =>
  useQuery(
    ['subLocationProducts', params],
    () => {
      const {
        name,
        sku,
        currentPage,
        pageSize,
        locationId,
        subLocationId,
        isInitialCount
      } = params;

      if ((subLocationId && (name || sku)) || (locationId && isInitialCount)) {
        return productService.fetchProducts(
          isInitialCount
            ? { name, sku, currentPage, pageSize, locationId }
            : { name, sku, currentPage, pageSize, locationId, subLocationId }
        );
      }
    },
    { keepPreviousData: false, staleTime: 60000, cacheTime: 100 }
  );

const useGetProductsForPO = (params: ISearchProducts) =>
  useQuery(
    ['products', params],
    () => {
      if (params.locationId && (params.name || params.sku)) {
        return productService.fetchProducts(params);
      }
    },
    { keepPreviousData: true, staleTime: 60000 }
  );

export { useGetProducts, useGetProductsForPO };
