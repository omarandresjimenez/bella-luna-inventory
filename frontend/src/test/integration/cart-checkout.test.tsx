import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CartPage from '../../pages/store/CartPage';
import CheckoutPage from '../../pages/store/CheckoutPage';
import { CustomerAuthProvider } from '../../contexts/CustomerAuthContext';
import * as customerApi from '../../services/customerApi';
import { mockCart, mockOrder, mockCustomer, createMockResponse } from '../mocks/data';

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

describe('Cart and Checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('CartPage', () => {
    it('should display empty cart message', async () => {
      vi.spyOn(customerApi, 'getCart').mockResolvedValue(
        createMockResponse({ id: 'cart1', items: [], subtotal: 0, itemCount: 0 })
      );

      renderWithProviders(<CartPage />);

      await waitFor(() => {
        expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument();
      });

      expect(screen.getByText('Continuar Comprando')).toBeInTheDocument();
    });

    it('should display cart items', async () => {
      vi.spyOn(customerApi, 'getCart').mockResolvedValue(
        createMockResponse(mockCart)
      );

      renderWithProviders(<CartPage />);

      await waitFor(() => {
        expect(screen.getByText('Wireless Headphones')).toBeInTheDocument();
      });

      expect(screen.getByText('Carrito de Compras')).toBeInTheDocument();
      expect(screen.getByText('$199.98')).toBeInTheDocument(); // Total
    });

    it('should update item quantity', async () => {
      const updateCartMock = vi.spyOn(customerApi, 'updateCartItem').mockResolvedValue(
        createMockResponse(mockCart)
      );
      vi.spyOn(customerApi, 'getCart').mockResolvedValue(
        createMockResponse(mockCart)
      );

      renderWithProviders(<CartPage />);

      await waitFor(() => {
        expect(screen.getByText('Wireless Headphones')).toBeInTheDocument();
      });

      // Find and click increase button
      const increaseButtons = screen.getAllByRole('button', { name: '' });
      const increaseButton = increaseButtons.find(btn => 
        btn.querySelector('svg[data-testid="AddIcon"]')
      );
      
      if (increaseButton) {
        fireEvent.click(increaseButton);
        
        await waitFor(() => {
          expect(updateCartMock).toHaveBeenCalled();
        });
      }
    });

    it('should remove item from cart', async () => {
      const removeItemMock = vi.spyOn(customerApi, 'removeCartItem').mockResolvedValue(
        createMockResponse({ ...mockCart, items: [], subtotal: 0, itemCount: 0 })
      );
      vi.spyOn(customerApi, 'getCart').mockResolvedValue(
        createMockResponse(mockCart)
      );

      renderWithProviders(<CartPage />);

      await waitFor(() => {
        expect(screen.getByText('Wireless Headphones')).toBeInTheDocument();
      });

      // Find delete button
      const deleteButton = screen.getByRole('button', { name: /eliminar/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(removeItemMock).toHaveBeenCalledWith('item1');
      });
    });
  });

  describe('CheckoutPage', () => {
    beforeEach(() => {
      // Mock authenticated customer
      localStorage.setItem('customerToken', 'test-token');
    });

    it('should display checkout steps', async () => {
      vi.spyOn(customerApi, 'getCart').mockResolvedValue(
        createMockResponse(mockCart)
      );
      vi.spyOn(customerApi, 'getAddresses').mockResolvedValue(
        createMockResponse([mockOrder.shippingAddress])
      );

      renderWithProviders(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByText('Checkout')).toBeInTheDocument();
      });

      // Check stepper
      expect(screen.getByText('Dirección de Envío')).toBeInTheDocument();
      expect(screen.getByText('Método de Entrega')).toBeInTheDocument();
      expect(screen.getByText('Método de Pago')).toBeInTheDocument();
      expect(screen.getByText('Confirmar Pedido')).toBeInTheDocument();
    });

    it('should complete checkout flow', async () => {
      const createOrderMock = vi.spyOn(customerApi, 'createOrder').mockResolvedValue(
        createMockResponse(mockOrder)
      );
      vi.spyOn(customerApi, 'getCart').mockResolvedValue(
        createMockResponse(mockCart)
      );
      vi.spyOn(customerApi, 'getAddresses').mockResolvedValue(
        createMockResponse([mockOrder.shippingAddress])
      );

      renderWithProviders(<CheckoutPage />);

      await waitFor(() => {
        expect(screen.getByText('Selecciona una dirección de envío')).toBeInTheDocument();
      });

      // Select address
      const addressCard = screen.getByText('123 Main St').closest('.MuiCard-root');
      if (addressCard) {
        fireEvent.click(addressCard);
      }

      // Click next
      fireEvent.click(screen.getByText('Siguiente'));

      // Select delivery method
      await waitFor(() => {
        expect(screen.getByText('Método de entrega')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText('Envío a domicilio'));
      fireEvent.click(screen.getByText('Siguiente'));

      // Select payment method
      await waitFor(() => {
        expect(screen.getByText('Método de pago')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText('Pago contra entrega'));
      fireEvent.click(screen.getByText('Siguiente'));

      // Confirm order
      await waitFor(() => {
        expect(screen.getByText('Resumen del Pedido')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Confirmar Pedido'));

      await waitFor(() => {
        expect(createOrderMock).toHaveBeenCalled();
      });
    });
  });
});
