import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import HomePage from '../../pages/store/HomePage';
import ProductPage from '../../pages/store/ProductPage';
import { CustomerAuthProvider } from '../../contexts/CustomerAuthContext';
import * as publicApi from '../../services/publicApi';
import { mockProduct, mockCategory, createMockResponse } from '../mocks/data';

const theme = createTheme();

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 0,
    },
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  const testQueryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testQueryClient}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <CustomerAuthProvider>
            {ui}
          </CustomerAuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('Product Browsing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('HomePage', () => {
    it('should display featured products', async () => {
      vi.spyOn(publicApi, 'getFeaturedProducts').mockResolvedValue(
        createMockResponse([mockProduct])
      );
      vi.spyOn(publicApi, 'getCategories').mockResolvedValue(
        createMockResponse([mockCategory])
      );

      renderWithProviders(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText('Wireless Headphones')).toBeInTheDocument();
      });

      expect(screen.getByText('Productos Destacados')).toBeInTheDocument();
    });

    it('should display categories', async () => {
      vi.spyOn(publicApi, 'getFeaturedProducts').mockResolvedValue(
        createMockResponse([mockProduct])
      );
      vi.spyOn(publicApi, 'getCategories').mockResolvedValue(
        createMockResponse([mockCategory])
      );

      renderWithProviders(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText('Electronics')).toBeInTheDocument();
      });
    });

    it('should show loading state', () => {
      vi.spyOn(publicApi, 'getFeaturedProducts').mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );
      vi.spyOn(publicApi, 'getCategories').mockResolvedValue(
        createMockResponse([mockCategory])
      );

      renderWithProviders(<HomePage />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('ProductPage', () => {
    it('should display product details', async () => {
      vi.spyOn(publicApi, 'getProductBySlug').mockResolvedValue(
        createMockResponse(mockProduct)
      );

      renderWithProviders(<ProductPage />);

      await waitFor(() => {
        expect(screen.getByText('Wireless Headphones')).toBeInTheDocument();
      });

      expect(screen.getByText('TechBrand')).toBeInTheDocument();
      expect(screen.getByText('$99.99')).toBeInTheDocument();
    });

    it('should allow adding to cart', async () => {
      vi.spyOn(publicApi, 'getProductBySlug').mockResolvedValue(
        createMockResponse(mockProduct)
      );

      renderWithProviders(<ProductPage />);

      await waitFor(() => {
        expect(screen.getByText('Agregar al Carrito')).toBeInTheDocument();
      });

      const addButton = screen.getByText('Agregar al Carrito');
      expect(addButton).toBeInTheDocument();
    });

    it('should show error when product not found', async () => {
      vi.spyOn(publicApi, 'getProductBySlug').mockRejectedValue(
        new Error('Product not found')
      );

      renderWithProviders(<ProductPage />);

      await waitFor(() => {
        expect(screen.getByText('Producto no encontrado')).toBeInTheDocument();
      });
    });
  });

  describe('CategoryPage', () => {
    it('should display products in category', async () => {
      vi.spyOn(publicApi, 'getCategoryBySlug').mockResolvedValue(
        createMockResponse(mockCategory)
      );
      vi.spyOn(publicApi, 'getProductsByCategory').mockResolvedValue(
        createMockResponse([mockProduct])
      );

      renderWithProviders(<CategoryPage />);

      await waitFor(() => {
        expect(screen.getByText('Electronics')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Wireless Headphones')).toBeInTheDocument();
      });
    });

    it('should allow filtering products', async () => {
      vi.spyOn(publicApi, 'getCategoryBySlug').mockResolvedValue(
        createMockResponse(mockCategory)
      );
      vi.spyOn(publicApi, 'getProductsByCategory').mockResolvedValue(
        createMockResponse([mockProduct])
      );

      renderWithProviders(<CategoryPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('Buscar')).toBeInTheDocument();
      });

      const searchInput = screen.getByLabelText('Buscar');
      fireEvent.change(searchInput, { target: { value: 'headphones' } });

      // Should trigger API call with search param
      await waitFor(() => {
        expect(publicApi.getProductsByCategory).toHaveBeenCalledWith(
          'electronics',
          expect.objectContaining({ search: 'headphones' })
        );
      });
    });
  });
});
