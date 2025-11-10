import { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS, GET_PRODUCT } from '../lib/queries';
import { ProductsResponse, ProductResponse, Product } from '../types';

export const useProducts = (options?: {
  category?: string;
  brand?: string;
  featured?: boolean;
  search?: string;
  limit?: number;
}) => {
  const variables: any = {};
  
  if (options?.limit) variables.limit = options.limit;
  if (options?.category) variables.category = options.category;
  if (options?.brand) variables.brand = options.brand;
  if (options?.featured !== undefined) variables.featured = options.featured;
  if (options?.search) variables.search = options.search;
  
  // Default limit if none provided
  if (!variables.limit) variables.limit = 100;

  const { data, loading, error } = useQuery<ProductsResponse>(GET_PRODUCTS, {
    variables,
    errorPolicy: 'all',
  });

  useEffect(() => {
    if (error) {
      console.error('Products query error:', error);
      console.error('GraphQL Errors:', error.graphQLErrors);
      console.error('Network Error:', error.networkError);
      if (error.networkError) {
        console.error('Network Error Details:', {
          message: error.networkError.message,
          statusCode: (error.networkError as any).statusCode,
          response: (error.networkError as any).result,
        });
      }
    }
  }, [error]);

  const products: Product[] = data?.products || [];

  return {
    products,
    loading,
    error: error ? (error.message || 'Failed to fetch products') : null,
  };
};

export const useProduct = (id: string) => {
  const productId = parseInt(id, 10);
  const { data, loading, error } = useQuery<ProductResponse>(GET_PRODUCT, {
    variables: { id: productId },
    skip: !id || isNaN(productId),
    errorPolicy: 'all',
  });

  return {
    product: data?.product || null,
    loading,
    error: error ? (error.message || 'Failed to fetch product') : null,
  };
};

