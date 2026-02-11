import {
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { formatCurrency } from '../../utils/formatters';
import { useOrders } from '../../hooks/useCustomer';
import type { Order, OrderStatus } from '../../types';
import PageBreadcrumb from '../../components/store/PageBreadcrumb';

const statusColors: Record<OrderStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PREPARING: 'info',
  READY_FOR_PICKUP: 'primary',
  OUT_FOR_DELIVERY: 'secondary',
  DELIVERED: 'success',
  CANCELLED: 'error',
};

const statusLabels: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  PREPARING: 'Preparando',
  READY_FOR_PICKUP: 'Listo para recoger',
  OUT_FOR_DELIVERY: 'En camino',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

export default function OrdersPage() {
  const { data: orders, isLoading, error } = useOrders();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Error al cargar los pedidos
      </Alert>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Box>
        <PageBreadcrumb items={[{ label: 'Mis Pedidos' }]} />
        <Alert severity="info">
          No tienes pedidos aún
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <PageBreadcrumb items={[{ label: 'Mis Pedidos' }]} />
      <Typography variant="h4" gutterBottom>
        Mis Pedidos
      </Typography>

      {orders.map((order: Order) => (
        <Card key={order.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Pedido #{order.orderNumber}
              </Typography>
              <Chip
                label={statusLabels[order.status]}
                color={statusColors[order.status]}
              />
            </Box>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              Fecha: {new Date(order.createdAt).toLocaleDateString('es-CO')}
            </Typography>

            <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell align="right">Precio</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.productName}
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          {item.variantName}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{formatCurrency(item.totalPrice)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={2} align="right">
                      <strong>Total</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>{formatCurrency(order.total)}</strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
