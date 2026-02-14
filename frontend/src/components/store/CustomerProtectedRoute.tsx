import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '../../hooks/useCustomerAuth';
import { CircularProgress, Box } from '@mui/material';

export default function CustomerProtectedRoute() {
  const { isAuthenticated, isLoading } = useCustomerAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
