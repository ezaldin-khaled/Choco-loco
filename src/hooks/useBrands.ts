import { useQuery } from '@apollo/client';
import { GET_BRANDS, GET_BRAND } from '../lib/queries';
import { BrandsResponse, BrandResponse, Brand } from '../types';

export const useBrands = () => {
  const { data, loading, error } = useQuery<BrandsResponse>(GET_BRANDS, {
    errorPolicy: 'all',
  });

  const brands: Brand[] = data?.brands || [];

  return {
    brands,
    loading,
    error: error ? (error.message || 'Failed to fetch brands') : null,
  };
};

export const useBrand = (id?: string, slug?: string) => {
  const { data, loading, error } = useQuery<BrandResponse>(GET_BRAND, {
    variables: { id, slug },
    skip: !id && !slug,
    errorPolicy: 'all',
  });

  return {
    brand: data?.brand || null,
    loading,
    error: error ? (error.message || 'Failed to fetch brand') : null,
  };
};

