import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ProductsPage from '../../pages/admin/ProductsPage';
import CategoriesPage from '../../pages/admin/CategoriesPage';
import OrdersPage from '../../pages/admin/OrdersPage';
import { AuthProvider } from '../../contexts/AuthContext';
import { adminApi } from '../../services/adminApi';
import * as adminApiModule from '../../services/adminApi';
import { mockProduct, mockCategory, mockOrder, mockUser } from '../mocks/data';
import { createMockResponse } from '../mocks/utils';

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
          <AuthProvider>
            {ui}
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('Admin Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'test-token');
  });

  describe('ProductsPage', () => {
    it('should display products list', async () => {
      const getProductsMock = vi.spyOn(adminApi, 'getProducts').mockResolvedValue(
        createMockResponse([mockProduct])
      );

      renderWithProviders(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByText('Wireless Headphones')).toBeInTheDocument();
      });

      expect(screen.getByText('PROD-001')).toBeInTheDocument();
      expect(screen.getByText('$99.99')).toBeInTheDocument();
    });

    it('should filter products by search', async () => {
      vi.spyOn(adminApi, 'getProducts').mockResolvedValue(
        createMockResponse([mockProduct])
      );

      renderWithProviders(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByText('Wireless Headphones')).toBeInTheDocument();
      });

      const searchInput = screen.getByLabelText('Buscar productos');
      fireEvent.change(searchInput, { target: { value: 'wireless' } });

      // Should filter the displayed products
      expect(screen.getByText('Wireless Headphones')).toBeInTheDocument();
    });

    it('should delete a product', async () => {
      const deleteMock = vi.spyOn(adminApi, 'deleteProduct').mockResolvedValue(
        createMockResponse(undefined)
      );
      vi.spyOn(adminApi, 'getProducts').mockResolvedValue(
        createMockResponse([mockProduct])
      );

      renderWithProviders(<ProductsPage />);

      await waitFor(() => {
        expect(screen.getByText('Wireless Headphones')).toBeInTheDocument();
      });

      // Click delete button
      const deleteButton = screen.getByRole('button', { name: /eliminar/i });
      fireEvent.click(deleteButton);

      // Confirm deletion in dialog
      await waitFor(() => {
        expect(screen.getByText('Confirmar eliminación')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Eliminar'));

      await waitFor(() => {
        expect(deleteMock).toHaveBeenCalledWith(mockProduct.id);
      });
    });
  });

  describe('CategoriesPage', () => {
    it('should display categories list', async () => {
      vi.spyOn(adminApi, 'getCategories').mockResolvedValue(
        createMockResponse([mockCategory])
      );

      renderWithProviders(<CategoriesPage />);

      await waitFor(() => {
        expect(screen.getByText('Electronics')).toBeInTheDocument();
      });

      expect(screen.getByText('Electronic devices and accessories')).toBeInTheDocument();
    });

    it('should create a new category', async () => {
      const createMock = vi.spyOn(adminApi, 'createCategory').mockResolvedValue(
        createMockResponse({ ...mockCategory, id: '2', name: 'New Category', slug: 'new-category' })
      );
      vi.spyOn(adminApi, 'getCategories').mockResolvedValue(
        createMockResponse([mockCategory])
      );

      renderWithProviders(<CategoriesPage />);

      await waitFor(() => {
        expect(screen.getByText('Electronics')).toBeInTheDocument();
      });

      // Click new category button
      fireEvent.click(screen.getByText('Nueva Categoría'));

      // Fill form
      await waitFor(() => {
        expect(screen.getByText('Nueva Categoría')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText('Nombre'), {
        target: { value: 'New Category' },
      });
      fireEvent.change(screen.getByLabelText('Slug'), {
        target: { value: 'new-category' },
      });

      fireEvent.click(screen.getByText('Guardar'));

      await waitFor(() => {
        expect(createMock).toHaveBeenCalledWith({
          name: 'New Category',
          slug: 'new-category',
          description: '',
        });
      });
    });
  });

  describe('OrdersPage', () => {
    it('should display orders list', async () => {
      vi.spyOn(adminApi, 'getOrders').mockResolvedValue(
        createMockResponse([mockOrder])
      );

      renderWithProviders(<OrdersPage />);

      await waitFor(() => {
        expect(screen.getByText('ORD-001')).toBeInTheDocument();
      });

      expect(screen.getByText('Pendiente')).toBeInTheDocument();
      expect(screen.getByText('$204.98')).toBeInTheDocument();
    });

    it('should filter orders by status', async () => {
      vi.spyOn(adminApi, 'getOrders').mockResolvedValue(
        createMockResponse([mockOrder])
      );

      renderWithProviders(<OrdersPage />);

      await waitFor(() => {
        expect(screen.getByText('ORD-001')).toBeInTheDocument();
      });

      // Select status filter
      const statusSelect = screen.getByLabelText('Filtrar por estado');
      fireEvent.mouseDown(statusSelect);
      
      await waitFor(() => {
        expect(screen.getByText('Pendiente')).toBeInTheDocument();
      });
    });

    it('should update order status', async () => {
      const updateStatusMock = vi.spyOn(adminApi, 'updateOrderStatus').mockResolvedValue(
        createMockResponse({ ...mockOrder, status: 'CONFIRMED' })
      );
      vi.spyOn(adminApi, 'getOrders').mockResolvedValue(
        createMockResponse([mockOrder])
      );

      renderWithProviders(<OrdersPage />);

      await waitFor(() => {
        expect(screen.getByText('ORD-001')).toBeInTheDocument();
      });

      // Change status
      const statusSelect = screen.getAllByRole('combobox')[1]; // Second select is the action select
      fireEvent.mouseDown(statusSelect);

      await waitFor(() => {
        expect(screen.getByText('Confirmado')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Confirmado'));

      await waitFor(() => {
        expect(updateStatusMock).toHaveBeenCalledWith(
          'order1',
          { status: 'CONFIRMED' }
        );
      });
    });
  });
});
