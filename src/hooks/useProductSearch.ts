import { useState, useEffect } from 'react';
import { useLazyQuery } from '@apollo/client';
import { SEARCH_PRODUCTS } from '../lib/queries';

interface SearchProduct {
  id: string;
  name: string;
  sku: string;
  slug: string;
  retailPrice: string;
  inStock: boolean;
  brand: {
    id: string;
    name: string;
    slug: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  images: Array<{
    image: string;
    isPrimary: boolean;
  }>;
  inventory: {
    availableQuantity: number;
    isInStock: boolean;
  };
}

interface SearchProductsResponse {
  searchProducts: SearchProduct[];
}

export const useProductSearch = (debounceMs: number = 300) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  const [searchProducts, { data, loading, error }] = useLazyQuery<SearchProductsResponse>(
    SEARCH_PRODUCTS,
    {
      fetchPolicy: 'network-only', // Always fetch fresh results
    }
  );

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchQuery, debounceMs]);

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length >= 2) {
      searchProducts({
        variables: {
          query: debouncedQuery,
          limit: 10,
        },
      });
    }
  }, [debouncedQuery, searchProducts]);

  return {
    searchQuery,
    setSearchQuery,
    results: data?.searchProducts || [],
    loading,
    error,
  };
};

