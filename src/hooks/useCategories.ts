import { useQuery } from '@apollo/client';
import { GET_CATEGORIES, GET_CATEGORY } from '../lib/queries';
import { CategoriesResponse, CategoryResponse, Category } from '../types';

export const useCategories = () => {
  const { data, loading, error } = useQuery<CategoriesResponse>(GET_CATEGORIES, {
    errorPolicy: 'all',
  });

  const categories: Category[] = data?.categories || [];

  return {
    categories,
    loading,
    error: error ? (error.message || 'Failed to fetch categories') : null,
  };
};

export const useCategory = (id: string) => {
  const { data, loading, error } = useQuery<CategoryResponse>(GET_CATEGORY, {
    variables: { id },
    skip: !id,
    errorPolicy: 'all',
  });

  return {
    category: data?.category || null,
    loading,
    error: error ? (error.message || 'Failed to fetch category') : null,
  };
};

