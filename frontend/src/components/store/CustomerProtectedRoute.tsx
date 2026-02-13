import { Navigate, Outlet } from 'react-router-dom';
import { useCustomerAuth } from '../../hooks/useCustomerAuth';
import { CircularProgress, Box } from '@mui/material';

export default function CustomerProtectedRoute() {
  const { isAuthenticated, isLoading, customer } = useCustomerAuth();

  console.log('[CustomerProtectedRoute] isAuthenticated:', isAuthenticated, 'isLoading:', isLoading, 'customer:', customer);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
