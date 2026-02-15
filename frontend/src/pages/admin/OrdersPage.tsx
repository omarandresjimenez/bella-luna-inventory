import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Grid,
  Divider,
  IconButton,
  Collapse,
  TablePagination,
} from '@mui/material';
import { useState } from 'react';
import { useAdminOrders, useUpdateOrderStatus } from '../../hooks/useAdmin';
import type { Order, OrderStatus } from '../../types';
import { formatCurrency, sanitizeText } from '../../utils/formatters';
import { ChevronDown, ChevronUp, MapPin, User, CreditCard, Package } from 'lucide-react';

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
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  
  const { data: response, isLoading, error } = useAdminOrders({
    status: statusFilter || undefined,
    page: page + 1,
    limit,
  });
  
  const orders = response?.orders || [];
  const pagination = response?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };
  
  const { mutate: updateStatus } = useUpdateOrderStatus();

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateStatus({ id: orderId, status: newStatus });
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Error al cargar pedidos</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Pedidos
      </Typography>

      <FormControl sx={{ mb: 2, minWidth: 200 }} size="small">
        <InputLabel>Filtrar por estado</InputLabel>
        <Select
          value={statusFilter}
          label="Filtrar por estado"
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <MenuItem value="">Todos</MenuItem>
          {Object.entries(statusLabels).map(([key, label]) => (
            <MenuItem key={key} value={key}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {orders?.length === 0 ? (
          <Card>
            <CardContent>
              <Typography color="text.secondary" align="center">
                No hay pedidos para mostrar
              </Typography>
            </CardContent>
          </Card>
        ) : (
          orders?.map((order: Order) => (
            <Card key={order.id} sx={{ overflow: 'visible' }}>
              <CardContent>
                {/* Order Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {order.orderNumber}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(order.createdAt).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Chip
                      label={statusLabels[order.status]}
                      color={statusColors[order.status]}
                      size="medium"
                    />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {formatCurrency(order.total)}
                    </Typography>
                    <IconButton onClick={() => toggleExpand(order.id)} size="small">
                      {expandedOrder === order.id ? <ChevronUp /> : <ChevronDown />}
                    </IconButton>
                  </Box>
                </Box>

                {/* Quick Info */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <User size={16} />
                      <Typography variant="body2">
                        <strong>{order.customer?.firstName} {order.customer?.lastName}</strong>
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {order.customer?.email}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Package size={16} />
                      <Typography variant="body2">
                        <strong>{order.items?.length || 0} producto(s)</strong>
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Cambiar estado</InputLabel>
                      <Select
                        value={order.status}
                        label="Cambiar estado"
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      >
                        {Object.entries(statusLabels).map(([key, label]) => (
                          <MenuItem key={key} value={key}>
                            {label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {/* Expanded Details */}
                <Collapse in={expandedOrder === order.id} timeout="auto" unmountOnExit>
                  <Divider sx={{ my: 2 }} />
                  
                  <Grid container spacing={3}>
                    {/* Shipping Address */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Box
                              sx={{
                                bgcolor: 'action.hover',
                                p: 1,
                                borderRadius: '8px',
                                display: 'flex',
                              }}
                            >
                              <MapPin size={20} />
                            </Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              Dirección de Envío
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                            {order.shippingAddress?.street}<br />
                            {order.shippingAddress?.city}, {order.shippingAddress?.state}<br />
                            {order.shippingAddress?.zipCode}
                          </Typography>
                          <Chip
                            label={order.deliveryType === 'HOME_DELIVERY' ? 'Envío a domicilio' : 'Recoger en tienda'}
                            size="small"
                            color="secondary"
                            sx={{ mt: 1.5 }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Payment Info */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Box
                              sx={{
                                bgcolor: 'action.hover',
                                p: 1,
                                borderRadius: '8px',
                                display: 'flex',
                              }}
                            >
                              <CreditCard size={20} />
                            </Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              Información de Pago
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Método:</strong>{' '}
                            {order.paymentMethod === 'CASH_ON_DELIVERY'
                              ? 'Pago contra entrega'
                              : 'Pago en tienda'}
                          </Typography>
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Subtotal: {formatCurrency(order.subtotal || 0)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Envío: {formatCurrency(order.deliveryFee || 0)}
                            </Typography>
                            {order.discount > 0 && (
                              <Typography variant="body2" color="error.main">
                                Descuento: -{formatCurrency(order.discount)}
                              </Typography>
                            )}
                            <Typography variant="body1" sx={{ fontWeight: 700, mt: 1 }}>
                              Total: {formatCurrency(order.total)}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Customer Notes */}
                    {order.customerNotes && (
                      <Grid size={12}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                              Notas del Cliente
                            </Typography>
                            <Box 
                              sx={{ 
                                p: 1.5, 
                                bgcolor: 'grey.50', 
                                borderRadius: '4px',
                                border: '1px solid',
                                borderColor: 'divider',
                              }}
                            >
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ 
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word',
                                  fontFamily: 'monospace',
                                  fontSize: '0.813rem',
                                }}
                              >
                                {sanitizeText(order.customerNotes)}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}

                    {/* Order Items */}
                    <Grid size={12}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                        Productos
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Producto</TableCell>
                              <TableCell>Variante</TableCell>
                              <TableCell align="center">Cantidad</TableCell>
                              <TableCell align="right">Precio Unit.</TableCell>
                              <TableCell align="right">Total</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {order.items?.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>
                                  <Box display="flex" alignItems="center" gap={1}>
                                    {item.imageUrl && (
                                      <Box
                                        component="img"
                                        src={item.imageUrl}
                                        alt={item.productName}
                                        sx={{
                                          width: 40,
                                          height: 40,
                                          objectFit: 'cover',
                                          borderRadius: 1,
                                          border: '1px solid',
                                          borderColor: 'divider',
                                        }}
                                      />
                                    )}
                                    <Box>
                                      <Typography variant="body2">{item.productName || 'N/A'}</Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        SKU: {item.productSku}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </TableCell>
                                <TableCell>{item.variantName || 'N/A'}</TableCell>
                                <TableCell align="center">{item.quantity}</TableCell>
                                <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                                <TableCell align="right">{formatCurrency(item.totalPrice)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </Grid>
                </Collapse>
              </CardContent>
            </Card>
          ))
        )}
      </Box>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <TablePagination
          component="div"
          count={pagination.total}
          rowsPerPage={limit}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setLimit(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        />
      </Box>
    </Box>
  );
}
