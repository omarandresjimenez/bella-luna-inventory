/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useCallback, type ReactNode } from 'react';
import type { Customer, Cart } from '../types';
import authApi from '../services/authApi';
import customerApi from '../services/customerApi';

export interface CustomerAuthContextType {
  customer: Customer | null;
  cart: Cart | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    birthDate?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshCart: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Define refreshCart first
  const refreshCart = useCallback(async () => {
    try {
      const response = await customerApi.getCart();
      setCart(response.data.data);
    } catch {
      setCart(null);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('customerToken');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const [customerResponse, cartResponse] = await Promise.all([
        authApi.getCustomerMe(),
        customerApi.getCart(),
      ]);
      setCustomer(customerResponse.data.data);
      setCart(cartResponse.data.data);
    } catch {
      localStorage.removeItem('customerToken');
      setCustomer(null);
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.customerLogin({ email, password });
    const { customer, token } = response.data.data;
    localStorage.setItem('customerToken', token);
    setCustomer(customer);
    await refreshCart();
  }, [refreshCart]);

  const register = useCallback(async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    birthDate?: string;
  }) => {
    const response = await authApi.customerRegister(data);
    const { customer, token } = response.data.data;
    localStorage.setItem('customerToken', token);
    setCustomer(customer);
    await refreshCart();
  }, [refreshCart]);

  const logout = useCallback(async () => {
    try {
      await authApi.customerLogout();
    } finally {
      localStorage.removeItem('customerToken');
      setCustomer(null);
      setCart(null);
    }
  }, []);

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        cart,
        isAuthenticated: !!customer,
        isLoading,
        login,
        register,
        logout,
        refreshCart,
        checkAuth,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}
