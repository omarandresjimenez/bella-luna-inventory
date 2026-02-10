import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminApi from '../services/adminApi';
import type { StoreSettings } from '../types';

const QUERY_KEYS = {
  adminProducts: 'adminProducts',
  adminProduct: (id: string) => ['adminProduct', id],
  adminCategories: 'adminCategories',
  adminCategory: (id: string) => ['adminCategory', id],
  adminAttributes: 'adminAttributes',
  adminOrders: 'adminOrders',
  adminOrder: (id: string) => ['adminOrder', id],
  storeSettings: 'storeSettings',
};

// Products
export function useAdminProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}) {
  return useQuery({
    queryKey: [QUERY_KEYS.adminProducts, params],
    queryFn: async () => {
      const response = await adminApi.getProducts(params);
      return response.data.data;
    },
  });
}

export function useAdminProduct(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.adminProduct(id),
    queryFn: async () => {
      const response = await adminApi.getProductById(id);
      return response.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      sku: string;
      name: string;
      description?: string;
      brand?: string;
      baseCost: number;
      basePrice: number;
      discountPercent?: number;
      trackStock?: boolean;
      categoryIds: string[];
      attributeIds: string[];
    }) => {
      const response = await adminApi.createProduct(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.adminProducts] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{
        sku: string;
        name: string;
        description?: string;
        brand?: string;
        baseCost: number;
        basePrice: number;
        discountPercent?: number;
        trackStock?: boolean;
        categoryIds: string[];
        attributeIds: string[];
        isActive?: boolean;
        isFeatured?: boolean;
      }>;
    }) => {
      const response = await adminApi.updateProduct(id, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.adminProducts] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminProduct(variables.id) });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await adminApi.deleteProduct(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.adminProducts] });
    },
  });
}

// Product Images
export function useUploadProductImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      files,
      variantId,
    }: {
      productId: string;
      files: File[];
      variantId?: string;
    }) => {
      const response = await adminApi.uploadProductImages(productId, files, variantId);
      return response.data.images;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.adminProducts] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminProduct(variables.productId) });
    },
  });
}

export function useDeleteProductImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      imageId,
    }: {
      productId: string;
      imageId: string;
    }) => {
      await adminApi.deleteProductImage(productId, imageId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.adminProducts] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminProduct(variables.productId) });
    },
  });
}

export function useSetPrimaryImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      imageId,
    }: {
      productId: string;
      imageId: string;
    }) => {
      await adminApi.setPrimaryImage(productId, imageId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.adminProducts] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminProduct(variables.productId) });
    },
  });
}

// Category Images
export function useUploadCategoryImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      categoryId,
      file,
    }: {
      categoryId: string;
      file: File;
    }) => {
      const response = await adminApi.uploadCategoryImage(categoryId, file);
      return response.data.imageUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.adminCategories] });
    },
  });
}

export function useDeleteCategoryImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      await adminApi.deleteCategoryImage(categoryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.adminCategories] });
    },
  });
}

// Categories
export function useAdminCategories() {
  return useQuery({
    queryKey: [QUERY_KEYS.adminCategories],
    queryFn: async () => {
      const response = await adminApi.getCategories();
      return response.data.data;
    },
  });
}

export function useAdminCategory(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.adminCategory(id),
    queryFn: async () => {
      const response = await adminApi.getCategoryById(id);
      return response.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      slug: string;
      description?: string;
      parentId?: string;
      imageUrl?: string;
      isFeatured?: boolean;
      sortOrder?: number;
    }) => {
      const response = await adminApi.createCategory(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.adminCategories] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{
        name: string;
        slug: string;
        description?: string;
        parentId?: string;
        imageUrl?: string;
        isFeatured?: boolean;
        isActive?: boolean;
        sortOrder?: number;
      }>;
    }) => {
      const response = await adminApi.updateCategory(id, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.adminCategories] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await adminApi.deleteCategory(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.adminCategories] });
    },
  });
}

// Attributes
export function useAdminAttributes() {
  return useQuery({
    queryKey: [QUERY_KEYS.adminAttributes],
    queryFn: async () => {
      const response = await adminApi.getAttributes();
      return response.data.data;
    },
  });
}

export function useCreateAttribute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      displayName: string;
      type: 'TEXT' | 'COLOR_HEX' | 'NUMBER';
      sortOrder?: number;
    }) => {
      const response = await adminApi.createAttribute(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.adminAttributes] });
    },
  });
}

// Orders
export function useAdminOrders(params?: {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: [QUERY_KEYS.adminOrders, params],
    queryFn: async () => {
      const response = await adminApi.getOrders(params);
      return response.data.data.orders;
    },
  });
}

export function useAdminOrder(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.adminOrder(id),
    queryFn: async () => {
      const response = await adminApi.getOrderById(id);
      return response.data.data;
    },
    enabled: !!id,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      adminNotes,
    }: {
      id: string;
      status: string;
      adminNotes?: string;
    }) => {
      const response = await adminApi.updateOrderStatus(id, { status, adminNotes });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.adminOrders] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminOrder(variables.id) });
    },
  });
}

// Store Settings
export function useStoreSettings() {
  return useQuery({
    queryKey: [QUERY_KEYS.storeSettings],
    queryFn: async () => {
      const response = await adminApi.getStoreSettings();
      return response.data.data;
    },
  });
}

export function useUpdateStoreSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<StoreSettings>) => {
      const response = await adminApi.updateStoreSettings(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.storeSettings] });
    },
  });
}
