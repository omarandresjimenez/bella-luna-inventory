import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import LoginPage from '../../pages/store/LoginPage';
import { CustomerAuthProvider } from '../../contexts/CustomerAuthContext';
import * as authApi from '../../services/authApi';
import { mockCustomer, createMockResponse } from '../mocks/data';

const theme = createTheme();

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
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

describe('Customer Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render login form', () => {
    renderWithProviders(<LoginPage />);
    
    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('should show validation error for empty fields', async () => {
    renderWithProviders(<LoginPage />);
    
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    fireEvent.click(submitButton);
    
    // HTML5 validation should prevent submission
    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toBeInvalid();
    });
  });

  it('should handle successful login', async () => {
    const mockLogin = vi.spyOn(authApi, 'customerLogin').mockResolvedValue(
      createMockResponse({ customer: mockCustomer, token: 'test-token' })
    );

    renderWithProviders(<LoginPage />);
    
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'customer@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'password123' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'customer@example.com',
        password: 'password123',
      });
    });
  });

  it('should display error message on login failure', async () => {
    vi.spyOn(authApi, 'customerLogin').mockRejectedValue({
      response: {
        data: {
          error: {
            message: 'Invalid credentials',
          },
        },
      },
    });

    renderWithProviders(<LoginPage />);
    
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'wrongpassword' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});
