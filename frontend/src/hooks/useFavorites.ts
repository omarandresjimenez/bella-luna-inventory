import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import customerApi from '../services/customerApi';
import { useCustomerAuth } from './useCustomerAuth';

const QUERY_KEYS = {
  favorites: 'favorites',
  favoriteProductIds: 'favoriteProductIds',
  isFavorite: (productId: string) => ['isFavorite', productId],
};

// Get all favorites
export function useFavorites() {
  const { isAuthenticated } = useCustomerAuth();
  
  return useQuery({
    queryKey: [QUERY_KEYS.favorites],
    queryFn: async () => {
      const response = await customerApi.getFavorites();
      return response.data.data;
    },
    enabled: isAuthenticated,
    retry: false,
  });
}

// Get favorite product IDs (for quick lookup)
export function useFavoriteProductIds() {
  const { isAuthenticated } = useCustomerAuth();
  
  return useQuery({
    queryKey: [QUERY_KEYS.favoriteProductIds],
    queryFn: async () => {
      const response = await customerApi.getFavoriteProductIds();
      return response.data.data.productIds;
    },
    enabled: isAuthenticated,
    retry: false,
  });
}

// Check if specific product is favorited
export function useIsFavorite(productId: string) {
  const { isAuthenticated } = useCustomerAuth();
  
  return useQuery({
    queryKey: QUERY_KEYS.isFavorite(productId),
    queryFn: async () => {
      const response = await customerApi.checkIsFavorite(productId);
      return response.data.data.isFavorite;
    },
    enabled: !!productId && isAuthenticated,
    retry: false,
  });
}

// Add to favorites
export function useAddToFavorites() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const response = await customerApi.addToFavorites(productId);
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate favorites queries
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.favorites] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.favoriteProductIds] });
    },
  });
}

// Remove from favorites
export function useRemoveFromFavorites() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const response = await customerApi.removeFromFavorites(productId);
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate favorites queries
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.favorites] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.favoriteProductIds] });
    },
  });
}

// Toggle favorite (add or remove)
export function useToggleFavorite() {
  const addMutation = useAddToFavorites();
  const removeMutation = useRemoveFromFavorites();

  const toggle = async (productId: string, isCurrentlyFavorite: boolean) => {
    if (isCurrentlyFavorite) {
      return removeMutation.mutateAsync(productId);
    } else {
      return addMutation.mutateAsync(productId);
    }
  };

  return {
    toggle,
    isPending: addMutation.isPending || removeMutation.isPending,
  };
}
