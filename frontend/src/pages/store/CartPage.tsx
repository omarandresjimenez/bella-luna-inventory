import {
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  IconButton,
  Divider,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Link, useNavigate } from 'react-router-dom';
import { useCart, useUpdateCartItem, useRemoveCartItem } from '../../hooks/useCustomer';
import { useCustomerAuth } from '../../hooks/useCustomerAuth';
import PageBreadcrumb from '../../components/store/PageBreadcrumb';

export default function CartPage() {
  const { data: cart, isLoading } = useCart();
  const { mutate: updateItem } = useUpdateCartItem();
  const { mutate: removeItem } = useRemoveCartItem();
  const { isAuthenticated, refreshCart } = useCustomerAuth();
  const navigate = useNavigate();

  const handleUpdateItem = (itemId: string, quantity: number) => {
    updateItem(
      { itemId, quantity },
      {
        onSuccess: () => {
          refreshCart(); // Refresh cart in context
        },
      }
    );
  };

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId, {
      onSuccess: () => {
        refreshCart(); // Refresh cart in context
      },
    });
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <Box>
        <PageBreadcrumb items={[{ label: 'Carrito' }]} />
        <Box textAlign="center" py={4}>
          <Typography variant="h5" gutterBottom>
            Tu carrito está vacío
          </Typography>
          <Button variant="contained" component={Link} to="/" sx={{ mt: 2 }}>
            Continuar Comprando
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <PageBreadcrumb items={[{ label: 'Carrito' }]} />
      <Typography variant="h4" gutterBottom>
        Carrito de Compras
      </Typography>

      {cart.items.map((item) => (
        <Card key={item.id} sx={{ mb: 2, overflow: 'hidden' }}>
          <CardContent sx={{ p: '16px !important' }}>
            <Box display="flex" alignItems="center" gap={3}>
              {/* Product Thumbnail */}
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: 2,
                  bgcolor: 'grey.100',
                  overflow: 'hidden',
                  flexShrink: 0
                }}
              >
                <img
                  src={item.imageUrl || 'https://via.placeholder.com/100?text=No+Image'}
                  alt={item.productName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>

              <Box flex={1}>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                  {item.productName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {item.variantName}
                </Typography>
                <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                  ${item.unitPrice} c/u
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1}>
                <IconButton
                  size="small"
                  onClick={() => handleUpdateItem(item.id, Math.max(1, item.quantity - 1))}
                  disabled={item.quantity <= 1}
                  sx={{ border: '1px solid', borderColor: 'divider' }}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <Typography sx={{ minWidth: 30, textAlign: 'center', fontWeight: 600 }}>
                  {item.quantity}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleUpdateItem(item.id, item.quantity + 1)}
                  sx={{ border: '1px solid', borderColor: 'divider' }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>

              <Typography variant="h6" sx={{ minWidth: 100, textAlign: 'right', fontWeight: 700 }}>
                ${item.totalPrice.toFixed(2)}
              </Typography>

              <IconButton color="error" onClick={() => handleRemoveItem(item.id)} sx={{ ml: 1 }}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      ))}

      <Divider sx={{ my: 3 }} />

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">
          Total: ${cart.subtotal.toFixed(2)}
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate(isAuthenticated ? '/checkout' : '/login')}
        >
          {isAuthenticated ? 'Proceder al Pago' : 'Iniciar Sesión para Continuar'}
        </Button>
      </Box>
    </Box>
  );
}
