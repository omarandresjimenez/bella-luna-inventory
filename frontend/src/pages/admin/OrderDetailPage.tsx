import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ArrowLeft, MapPin, User, CreditCard, Package, Calendar } from 'lucide-react';
import type { Order, OrderStatus } from '../../types';
import { formatCurrency, sanitizeText } from '../../utils/formatters';
import { useUpdateOrderStatus } from '../../hooks/useAdmin';

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

export default function AdminOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['admin-order', orderId],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch order');
      const json = await response.json();
      return json.data as Order;
    },
    enabled: !!orderId,
  });

  const { mutate: updateStatus, isPending: isUpdating } = useUpdateOrderStatus();

  const handleStatusChange = () => {
    if (newStatus && order) {
      updateStatus(
        { id: order.id, status: newStatus },
        {
          onSuccess: () => {
            setNewStatus('');
          },
        }
      );
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Box>
        <Button
          startIcon={<ArrowLeft size={20} />}
          onClick={() => navigate('/admin/orders')}
          sx={{ mb: 2 }}
        >
          Volver a Pedidos
        </Button>
        <Alert severity="error">No se pudo cargar el pedido</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowLeft size={20} />}
            onClick={() => navigate('/admin/orders')}
            variant="text"
          >
            Volver
          </Button>
          <Typography variant="h4">
            Pedido #{order.orderNumber}
          </Typography>
        </Box>
        <Chip label={statusLabels[order.status]} color={statusColors[order.status]} />
      </Box>

      <Grid container spacing={3}>
        {/* Order Info */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Información del Pedido
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Calendar size={20} color="#1976d2" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Fecha
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {new Date(order.createdAt).toLocaleDateString('es-CO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CreditCard size={20} color="#1976d2" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Total
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formatCurrency(order.total)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {order.paymentMethod && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <CreditCard size={20} color="#1976d2" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Método de Pago
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Contra Entrega' : order.paymentMethod}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}

                {order.deliveryType && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Package size={20} color="#1976d2" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Tipo de Entrega
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {order.deliveryType === 'HOME_DELIVERY' ? 'Domicilio' : order.deliveryType}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Items */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Artículos
              </Typography>
              <Divider sx={{ my: 2 }} />

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Producto</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>
                        Cantidad
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        Precio Unitario
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        Subtotal
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.items?.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {sanitizeText(item.productName || 'Producto')}
                          </Typography>
                          {item.variantName && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              {sanitizeText(item.variantName)}
                            </Typography>
                          )}
                          {item.productSku && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                              SKU: {sanitizeText(item.productSku)}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">{item.quantity}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">{formatCurrency(item.unitPrice)}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatCurrency(item.totalPrice)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Subtotal:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, minWidth: 100, textAlign: 'right' }}>
                  {formatCurrency(order.subtotal || 0)}
                </Typography>
              </Box>

              {order.deliveryFee && order.deliveryFee > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Envío:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, minWidth: 100, textAlign: 'right' }}>
                    {formatCurrency(order.deliveryFee)}
                  </Typography>
                </Box>
              )}

              {order.discount && order.discount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Descuento:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, minWidth: 100, textAlign: 'right' }}>
                    -{formatCurrency(order.discount)}
                  </Typography>
                </Box>
              )}

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 1,
                  mt: 1,
                  pt: 1,
                  borderTop: '2px solid #eee',
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Total:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, minWidth: 100, textAlign: 'right' }}>
                  {formatCurrency(order.total)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Customer Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Cliente
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <User size={20} color="#1976d2" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Nombre
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {sanitizeText(
                      `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim()
                    )}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CreditCard size={20} color="#1976d2" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, wordBreak: 'break-all' }}>
                    {order.customer?.email}
                  </Typography>
                </Box>
              </Box>

              {order.customer?.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Package size={20} color="#1976d2" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Teléfono
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {sanitizeText(order.customer.phone)}
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Status Management */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estado del Pedido
              </Typography>
              <Divider sx={{ my: 2 }} />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Nuevo estado</InputLabel>
                <Select
                  value={newStatus}
                  label="Nuevo estado"
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                >
                  <MenuItem value="">-- Seleccionar --</MenuItem>
                  {(Object.keys(statusLabels) as OrderStatus[]).map((status) => (
                    <MenuItem key={status} value={status}>
                      {statusLabels[status]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                fullWidth
                variant="contained"
                onClick={handleStatusChange}
                disabled={!newStatus || isUpdating}
              >
                {isUpdating ? 'Actualizando...' : 'Actualizar Estado'}
              </Button>
            </CardContent>
          </Card>

          {/* Delivery Info */}
          {order.shippingAddress && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Dirección de Envío
                </Typography>
                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <MapPin size={20} color="#1976d2" sx={{ mt: 0.5, flexShrink: 0 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {sanitizeText(order.shippingAddress.street)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {sanitizeText(order.shippingAddress.city)}, {sanitizeText(order.shippingAddress.state)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {sanitizeText(order.shippingAddress.zipCode)}, {sanitizeText(order.shippingAddress.country)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
