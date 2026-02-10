import {
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  IconButton,
  TextField,
  Divider,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Link, useNavigate } from 'react-router-dom';
import { useCart, useUpdateCartItem, useRemoveCartItem } from '../../hooks/useCustomer';
import { useCustomerAuth } from '../../hooks/useCustomerAuth';

export default function CartPage() {
  const { data: cart, isLoading } = useCart();
  const { mutate: updateItem } = useUpdateCartItem();
  const { mutate: removeItem } = useRemoveCartItem();
  const { isAuthenticated } = useCustomerAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h5" gutterBottom>
          Tu carrito está vacío
        </Typography>
        <Button variant="contained" component={Link} to="/" sx={{ mt: 2 }}>
          Continuar Comprando
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Carrito de Compras
      </Typography>

      {cart.items.map((item) => (
        <Card key={item.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <Box flex={1}>
                <Typography variant="h6">
                  {item.variant.product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.variant.attributeValues.map(av => 
                    `${av.attributeValue.attribute.displayName}: ${av.attributeValue.displayValue || av.attributeValue.value}`
                  ).join(', ')}
                </Typography>
                <Typography variant="body2" color="primary">
                  ${item.unitPrice} c/u
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1}>
                <IconButton
                  size="small"
                  onClick={() => updateItem({ itemId: item.id, quantity: Math.max(1, item.quantity - 1) })}
                  disabled={item.quantity <= 1}
                >
                  <RemoveIcon />
                </IconButton>
                <TextField
                  size="small"
                  value={item.quantity}
                  inputProps={{ readOnly: true, style: { textAlign: 'center', width: 40 } }}
                />
                <IconButton
                  size="small"
                  onClick={() => updateItem({ itemId: item.id, quantity: item.quantity + 1 })}
                  disabled={item.quantity >= item.variant.stock}
                >
                  <AddIcon />
                </IconButton>
              </Box>

              <Typography variant="h6" sx={{ minWidth: 100, textAlign: 'right' }}>
                ${(item.unitPrice * item.quantity).toFixed(2)}
              </Typography>

              <IconButton color="error" onClick={() => removeItem(item.id)}>
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
