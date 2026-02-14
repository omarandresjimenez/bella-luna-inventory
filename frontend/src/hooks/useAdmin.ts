import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminApi from '../services/adminApi';
import type { StoreSettings, UserRole } from '../types';

const QUERY_KEYS = {
  adminProducts: 'adminProducts',
  adminProduct: (id: string) => ['adminProduct', id],
  adminCategories: 'adminCategories',
  adminCategory: (id: string) => ['adminCategory', id],
  adminAttributes: 'adminAttributes',
  adminOrders: 'adminOrders',
  adminOrder: (id: string) => ['adminOrder', id],
  adminUsers: 'adminUsers',
  adminUser: (id: string) => ['adminUser', id],
  adminCustomers: 'adminCustomers',
  adminCustomer: (id: string) => ['adminCustomer', id],
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
      isActive?: boolean;
      isFeatured?: boolean;
      categoryIds: string[];
      attributeIds?: string[];
      attributes?: Array<{ attributeId: string; value?: string }>;
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
        attributes: Array<{ attributeId: string; value?: string }>;
        isActive?: boolean;
        isFeatured?: boolean;
      }>;
    }) => {
      const response = await adminApi.updateProduct(id, data);
      console.log('[useUpdateProduct] Raw response:', response);
      console.log('[useUpdateProduct] response.data:', response.data);
      console.log('[useUpdateProduct] response.data.data:', response.data.data);
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate both queries
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.adminProducts] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminProduct(variables.id) });
      
      // Also directly set the new data in cache to ensure immediate availability
      queryClient.setQueryData(QUERY_KEYS.adminProduct(variables.id), data);
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

export function useUpdateAttribute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{
        name: string;
        displayName: string;
        type: 'TEXT' | 'COLOR_HEX' | 'NUMBER';
        sortOrder?: number;
      }>;
    }) => {
      const response = await adminApi.updateAttribute(id, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.adminAttributes] });
    },
  });
}

export function useDeleteAttribute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await adminApi.deleteAttribute(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.adminAttributes] });
    },
  });
}

// Attribute Values
export function useAddAttributeValue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      attributeId,
      data,
    }: {
      attributeId: string;
      data: {
        value: string;
        displayValue?: string;
        colorHex?: string;
        sortOrder?: number;
      };
    }) => {
      const response = await adminApi.addAttributeValue(attributeId, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.adminAttributes] });
    },
  });
}

export function useRemoveAttributeValue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (valueId: string) => {
      await adminApi.removeAttributeValue(valueId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.adminAttributes] });
    },
  });
}

// Product Variants
export function useProductVariants(productId: string) {
  return useQuery({
    queryKey: ['adminProductVariants', productId],
    queryFn: async () => {
      const response = await adminApi.getProductVariants(productId);
      return response.data.data;
    },
    enabled: !!productId,
  });
}

export function useCreateVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      data,
    }: {
      productId: string;
      data: {
        variantSku?: string;
        cost?: number;
        price?: number;
        stock: number;
        isActive?: boolean;
        attributeValueIds: string[];
      };
    }) => {
      const response = await adminApi.createVariant(productId, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminProductVariants', variables.productId] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminProduct(variables.productId) });
    },
  });
}

export function useUpdateVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      variantId,
      productId: _productId,
      data,
    }: {
      variantId: string;
      productId: string;
      data: Partial<{
        variantSku?: string;
        cost?: number;
        price?: number;
        stock: number;
        isActive?: boolean;
        attributeValueIds: string[];
      }>;
    }) => {
      const response = await adminApi.updateVariant(variantId, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminProductVariants', variables.productId] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminProduct(variables.productId) });
    },
  });
}

export function useDeleteVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      variantId,
      productId: _productId,
    }: {
      variantId: string;
      productId: string;
    }) => {
      await adminApi.deleteVariant(variantId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminProductVariants', variables.productId] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminProduct(variables.productId) });
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
      // Response structure: { success: true, data: { orders: Order[], pagination: {...} } }
      return response.data.data;
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

// Users
export function useAdminUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
}) {
  return useQuery({
    queryKey: [QUERY_KEYS.adminUsers, params],
    queryFn: async () => {
      const response = await adminApi.getUsers(params);
      return response.data.data;
    },
  });
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.adminUser(id),
    queryFn: async () => {
      const response = await adminApi.getUserById(id);
      return response.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role: UserRole;
      isActive?: boolean;
    }) => {
      const response = await adminApi.createUser(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.adminUsers] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role: UserRole;
        isActive: boolean;
      }>;
    }) => {
      const response = await adminApi.updateUser(id, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.adminUsers] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminUser(variables.id) });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await adminApi.deleteUser(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.adminUsers] });
    },
  });
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await adminApi.toggleUserStatus(id);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.adminUsers] });
    },
  });
}

export function useUsersStats() {
  return useQuery({
    queryKey: ['usersStats'],
    queryFn: async () => {
      const response = await adminApi.getUsersStats();
      return response.data.data;
    },
  });
}

// Customers
export function useAdminCustomers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  isVerified?: boolean;
  hasOrders?: boolean;
}) {
  return useQuery({
    queryKey: [QUERY_KEYS.adminCustomers, params],
    queryFn: async () => {
      const response = await adminApi.getCustomers(params);
      return response.data.data;
    },
  });
}

export function useAdminCustomer(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.adminCustomer(id),
    queryFn: async () => {
      const response = await adminApi.getCustomerById(id);
      return response.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone: string;
      birthDate?: string;
      isVerified?: boolean;
    }) => {
      const response = await adminApi.createCustomer(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.adminCustomers] });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone: string;
        birthDate: string;
        isVerified: boolean;
      }>;
    }) => {
      const response = await adminApi.updateCustomer(id, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.adminCustomers] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminCustomer(variables.id) });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await adminApi.deleteCustomer(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.adminCustomers] });
    },
  });
}

export function useToggleCustomerVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await adminApi.toggleCustomerVerification(id);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.adminCustomers] });
    },
  });
}

export function useCustomersStats() {
  return useQuery({
    queryKey: ['customersStats'],
    queryFn: async () => {
      const response = await adminApi.getCustomersStats();
      return response.data.data;
    },
  });
}

export function useRecentCustomers(limit?: number) {
  return useQuery({
    queryKey: ['recentCustomers', limit],
    queryFn: async () => {
      const response = await adminApi.getRecentCustomers(limit);
      return response.data.data;
    },
  });
}
