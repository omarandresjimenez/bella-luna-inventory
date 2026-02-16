import { useQuery } from '@tanstack/react-query';
import publicApi from '../services/publicApi';

const QUERY_KEYS = {
  categories: 'categories',
  category: (slug: string) => ['category', slug],
  products: 'products',
  product: (slug: string) => ['product', slug],
  featuredProducts: 'featuredProducts',
};

// Categories
export function useCategories() {
  return useQuery({
    queryKey: [QUERY_KEYS.categories],
    queryFn: async () => {
      const response = await publicApi.getCategories();
      return response.data.data;
    },
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: QUERY_KEYS.category(slug),
    queryFn: async () => {
      const response = await publicApi.getCategoryBySlug(slug);
      return response.data.data;
    },
    enabled: !!slug,
  });
}

// Products
export function useProducts(params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  isFeatured?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  return useQuery({
    queryKey: [QUERY_KEYS.products, params],
    queryFn: async () => {
      const response = await publicApi.getProducts(params);
      // API returns: { success: true, data: { products: [...], pagination: {...} } }
      // axios wraps it as: response.data = { success: true, data: {...} }
      const apiData = response.data.data;
      return Array.isArray(apiData) ? apiData : (apiData as any).products || apiData;
    },
    enabled: params?.search ? params.search.length > 2 : true,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: [QUERY_KEYS.featuredProducts],
    queryFn: async () => {
      const response = await publicApi.getFeaturedProducts();
      return response.data.data;
    },
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: QUERY_KEYS.product(slug),
    queryFn: async () => {
      const response = await publicApi.getProductBySlug(slug);
      return response.data.data;
    },
    enabled: !!slug,
  });
}

export function useProductsByCategory(
  categorySlug: string,
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    brand?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
) {
  return useQuery({
    queryKey: ['productsByCategory', categorySlug, params],
    queryFn: async () => {
      const response = await publicApi.getProductsByCategory(categorySlug, params);
      // Handle both legacy array and new paginated object
      const data = response.data.data;
      return Array.isArray(data) ? data : (data as any).products;
    },
    enabled: true, // Allow fetching all products if slug is empty
  });
}
