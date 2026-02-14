import { useParams, Navigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Card,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Container,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Package, MapPin, CreditCard, Calendar, ArrowLeft, Printer } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useOrder } from '../../hooks/useCustomer';
import { Link } from 'react-router-dom';
import PageBreadcrumb from '../../components/store/PageBreadcrumb';
import type { OrderItem } from '../../types';

const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PREPARING: 'info',
  READY_FOR_PICKUP: 'primary',
  OUT_FOR_DELIVERY: 'secondary',
  DELIVERED: 'success',
  CANCELLED: 'error',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  PREPARING: 'Preparando',
  READY_FOR_PICKUP: 'Listo para recoger',
  OUT_FOR_DELIVERY: 'En camino',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: order, isLoading, error } = useOrder(orderId || '');

  if (!orderId) {
    return <Navigate to="/orders" replace />;
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          Error al cargar los detalles del pedido
        </Alert>
        <Button
          component={Link}
          to="/orders"
          startIcon={<ArrowLeft size={20} />}
          variant="outlined"
        >
          Volver a mis pedidos
        </Button>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 4 }}>
          Pedido no encontrado
        </Alert>
        <Button
          component={Link}
          to="/orders"
          startIcon={<ArrowLeft size={20} />}
          variant="outlined"
        >
          Volver a mis pedidos
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageBreadcrumb 
        items={[
          { label: 'Mis Pedidos', href: '/orders' },
          { label: `Pedido #${order.orderNumber}` }
        ]} 
      />

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
                Pedido #{order.orderNumber}
              </Typography>
              <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                <Box display="flex" alignItems="center" gap={1}>
                  <Calendar size={16} style={{ opacity: 0.6 }} />
                  <Typography variant="body2" color="text.secondary">
                    {new Date(order.createdAt).toLocaleDateString('es-CO', { 
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </Box>
                <Chip
                  label={statusLabels[order.status]}
                  color={statusColors[order.status]}
                  sx={{ fontWeight: 700 }}
                />
              </Box>
            </Box>
            <Box display="flex" gap={2}>
              <Button
                component={Link}
                to="/orders"
                startIcon={<ArrowLeft size={20} />}
                variant="outlined"
              >
                Volver
              </Button>
              <Button
                variant="outlined"
                startIcon={<Printer size={20} />}
                onClick={() => window.print()}
              >
                Imprimir
              </Button>
            </Box>
          </Box>
        </motion.div>
      </Box>

      <Grid container spacing={3}>
        {/* Order Summary */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card sx={{ p: 3, borderRadius: '16px', mb: 3 }}>
              <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                <Box sx={{ 
                  bgcolor: 'primary.main', 
                  p: 1, 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <Package size={20} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Productos ({order.items.length})
                </Typography>
              </Box>

              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '12px' }}>
                <Table>
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Producto</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Cantidad</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Precio Unit.</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.items.map((item: OrderItem) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {item.productName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.variantName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={`x${item.quantity}`} 
                            size="small"
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {formatCurrency(item.unitPrice)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {formatCurrency(item.totalPrice)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Order Totals */}
              <Box sx={{ mt: 3, p: 3, bgcolor: 'grey.50', borderRadius: '12px' }}>
                <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Subtotal:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatCurrency(order.subtotal)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Envío:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {order.deliveryFee === 0 ? 'Gratis' : formatCurrency(order.deliveryFee)}
                  </Typography>
                </Box>
                {order.discount > 0 && (
                  <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Descuento:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                      -{formatCurrency(order.discount)}
                    </Typography>
                  </Box>
                )}
                <Divider sx={{ my: 1.5 }} />
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Total:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
                    {formatCurrency(order.total)}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </motion.div>

          {/* Customer Notes */}
          {order.customerNotes && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card sx={{ p: 3, borderRadius: '16px' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Notas del Pedido
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.customerNotes}
                </Typography>
              </Card>
            </motion.div>
          )}
        </Grid>

        {/* Order Info Sidebar */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {/* Shipping Address */}
            <Card sx={{ p: 3, borderRadius: '16px', mb: 3 }}>
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <Box sx={{ 
                  bgcolor: 'action.hover', 
                  p: 1, 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <MapPin size={20} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Dirección de Envío
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, mb: 2 }}>
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state}<br />
                {order.shippingAddress.zipCode}
              </Typography>
              <Chip 
                label={order.deliveryType === 'HOME_DELIVERY' ? 'Envío a domicilio' : 'Recoger en tienda'}
                color="secondary"
                sx={{ fontWeight: 600 }}
              />
            </Card>

            {/* Payment Info */}
            <Card sx={{ p: 3, borderRadius: '16px', mb: 3 }}>
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <Box sx={{ 
                  bgcolor: 'action.hover', 
                  p: 1, 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CreditCard size={20} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Información de Pago
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Método de pago:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Pago contra entrega' : 'Pago en tienda'}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Estado de pago:
                </Typography>
                <Chip 
                  label={order.paymentStatus === 'PAID' ? 'Pagado' : 'Pendiente'}
                  size="small"
                  color={order.paymentStatus === 'PAID' ? 'success' : 'warning'}
                />
              </Box>
            </Card>

            {/* Order Timeline */}
            <Card sx={{ p: 3, borderRadius: '16px' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Estado del Pedido
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                {[
                  { status: 'PENDING', label: 'Pedido recibido', completed: true },
                  { status: 'CONFIRMED', label: 'Pedido confirmado', completed: ['CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status) },
                  { status: 'PREPARING', label: 'En preparación', completed: ['PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status) },
                  { status: 'READY_FOR_PICKUP', label: 'Listo para entrega', completed: ['READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status) },
                  { status: 'DELIVERED', label: 'Entregado', completed: order.status === 'DELIVERED' },
                ].map((step) => (
                  <Box key={step.status} display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: step.completed ? 'success.main' : 'grey.300',
                        border: step.completed ? 'none' : '2px solid',
                        borderColor: 'grey.400',
                      }}
                    />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: step.completed ? 600 : 400,
                        color: step.completed ? 'text.primary' : 'text.secondary'
                      }}
                    >
                      {step.label}
                    </Typography>
                    {order.status === 'CANCELLED' && step.status === 'PENDING' && (
                      <Chip label="Cancelado" size="small" color="error" sx={{ ml: 'auto' }} />
                    )}
                  </Box>
                ))}
              </Box>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  );
}
