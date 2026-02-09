import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, Product, CreateProductData } from '../services/api';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await apiService.getProducts();
      return response.data;
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await apiService.getProduct(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductData) => apiService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateProductData> }) =>
      apiService.updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useLowStockProducts = () => {
  return useQuery({
    queryKey: ['products', 'low-stock'],
    queryFn: async () => {
      const response = await apiService.getLowStockProducts();
      return response.data;
    },
  });
};

export const useHealthCheck = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await apiService.healthCheck();
      return response;
    },
    refetchInterval: 30000, // Check every 30 seconds
  });
};
