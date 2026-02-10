import { useContext } from 'react';
import { CustomerAuthContext } from '../contexts/CustomerAuthContext';

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
};
