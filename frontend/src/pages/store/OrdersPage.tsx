import { useState } from 'react';
import {
  Typography,
  Box,
  Card,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Divider,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Container,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Package, MapPin, CreditCard, Calendar, ChevronDown, X, Eye } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useOrders } from '../../hooks/useCustomer';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../../services/publicApi';
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
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Fetch product details when modal opens
  const { data: productResponse, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['product', selectedProductId],
    queryFn: () => publicApi.getProductById(selectedProductId!),
    enabled: !!selectedProductId,
  });

  const selectedProduct = productResponse?.data?.data;

  const handleCloseModal = () => {
    setSelectedProductId(null);
  };

  const handleProductClick = async (productId: string) => {
    setSelectedProductId(productId);
  };

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
      <Box sx={{ py: 4 }}>
        <PageBreadcrumb items={[{ label: 'Mis Pedidos' }]} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card sx={{ 
            p: 6, 
            textAlign: 'center',
            borderRadius: '16px',
            border: '2px dashed',
            borderColor: 'divider'
          }}>
            <Package size={64} style={{ margin: '0 auto', opacity: 0.3 }} />
            <Typography variant="h5" sx={{ mt: 3, mb: 1, fontWeight: 700 }}>
              No tienes pedidos aún
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Comienza a explorar nuestros productos y realiza tu primer pedido
            </Typography>
            <Button variant="contained" size="large" href="/">
              Ir a la Tienda
            </Button>
          </Card>
        </motion.div>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageBreadcrumb items={[{ label: 'Mis Pedidos' }]} />
      
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
          Mis Pedidos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Historial completo de tus compras
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {orders.map((order: Order, index: number) => (
          <Grid size={12} key={order.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Accordion
                expanded={expandedOrder === order.id}
                onChange={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                sx={{
                  borderRadius: '16px !important',
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:before': { display: 'none' },
                  boxShadow: expandedOrder === order.id ? '0 8px 24px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.06)',
                  transition: 'all 0.3s ease',
                }}
              >
                <AccordionSummary
                  expandIcon={<ChevronDown />}
                  sx={{
                    py: 2,
                    px: 3,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    {/* Order Number & Status */}
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                          PEDIDO
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          #{order.orderNumber}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Date */}
                    <Grid size={{ xs: 6, sm: 6, md: 2 }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Calendar size={16} style={{ opacity: 0.6 }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            FECHA
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {new Date(order.createdAt).toLocaleDateString('es-CO', { 
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {/* Status */}
                    <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                          ESTADO
                        </Typography>
                        <Chip
                          label={statusLabels[order.status]}
                          color={statusColors[order.status]}
                          size="small"
                          sx={{ fontWeight: 700 }}
                        />
                      </Box>
                    </Grid>

                    {/* Total */}
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                          TOTAL
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
                          {formatCurrency(order.total)}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Items count */}
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Package size={16} style={{ opacity: 0.6 }} />
                        <Typography variant="body2" color="text.secondary">
                          {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </AccordionSummary>

                <AccordionDetails sx={{ p: 0 }}>
                  <Divider />
                  
                  {/* Order Details */}
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      {/* Shipping Address */}
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Card variant="outlined" sx={{ p: 2.5, borderRadius: '12px' }}>
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
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                              Dirección de Envío
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                            {order.shippingAddress.street}<br />
                            {order.shippingAddress.city}, {order.shippingAddress.state}<br />
                            {order.shippingAddress.zipCode}
                          </Typography>
                          <Chip 
                            label={order.deliveryType === 'HOME_DELIVERY' ? 'Envío a domicilio' : 'Recoger en tienda'}
                            size="small"
                            color="secondary"
                            sx={{ mt: 1.5 }}
                          />
                        </Card>
                      </Grid>

                      {/* Payment Info */}
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Card variant="outlined" sx={{ p: 2.5, borderRadius: '12px' }}>
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
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
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
                          <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Estado de pago:
                            </Typography>
                            <Chip 
                              label={order.paymentStatus === 'PAID' ? 'Pagado' : 'Pendiente'}
                              size="small"
                              color={order.paymentStatus === 'PAID' ? 'success' : 'warning'}
                            />
                          </Box>
                          <Divider sx={{ my: 1.5 }} />
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">
                              Subtotal:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {formatCurrency(order.subtotal)}
                            </Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">
                              Envío:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {order.deliveryFee === 0 ? 'Gratis' : formatCurrency(order.deliveryFee)}
                            </Typography>
                          </Box>
                          {order.discount > 0 && (
                            <Box display="flex" justifyContent="space-between">
                              <Typography variant="body2" color="text.secondary">
                                Descuento:
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                                -{formatCurrency(order.discount)}
                              </Typography>
                            </Box>
                          )}
                        </Card>
                      </Grid>

                      {/* Customer Notes */}
                      {order.customerNotes && (
                        <Grid size={12}>
                          <Card variant="outlined" sx={{ p: 2.5, borderRadius: '12px', bgcolor: 'grey.50' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                              Notas del cliente
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {order.customerNotes}
                            </Typography>
                          </Card>
                        </Grid>
                      )}
                    </Grid>

                    {/* Products Table */}
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                        Productos del Pedido
                      </Typography>
                      <TableContainer 
                        component={Paper} 
                        variant="outlined" 
                        sx={{ 
                          borderRadius: '12px',
                          overflow: 'hidden'
                        }}
                      >
                        <Table>
                          <TableHead sx={{ bgcolor: 'grey.50' }}>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700 }}>Producto</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 700 }}>Cantidad</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 700 }}>Precio Unit.</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 700 }}>Total</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 700 }}>Ver detalle</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {order.items.map((item) => (
                              <TableRow 
                                key={item.id}
                                sx={{
                                  '&:hover': {
                                    bgcolor: 'action.hover',
                                  },
                                }}
                              >
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
                                <TableCell align="center">
                                  <IconButton
                                    size="small"
                                    onClick={() => item.variant?.productId && handleProductClick(item.variant.productId)}
                                    disabled={!item.variant?.productId}
                                    sx={{
                                      bgcolor: 'action.hover',
                                      '&:hover': {
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                      },
                                    }}
                                  >
                                    <Eye size={16} />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Product Details Modal */}
      <Dialog
        open={!!selectedProductId}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle sx={{ p: 3, pb: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Detalles del Producto
            </Typography>
            <IconButton onClick={handleCloseModal} size="small">
              <X />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: 3 }}>
          {isLoadingProduct ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : selectedProduct ? (
            <Grid container spacing={3}>
              {/* Product Image */}
              <Grid size={{ xs: 12, md: 5 }}>
                <Box
                  sx={{
                    width: '100%',
                    paddingTop: '100%',
                    position: 'relative',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    bgcolor: 'grey.100',
                  }}
                >
                  <img
                    src={selectedProduct.images?.[0]?.largeUrl || 'https://via.placeholder.com/400?text=No+Image'}
                    alt={selectedProduct.name}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
              </Grid>

              {/* Product Info */}
              <Grid size={{ xs: 12, md: 7 }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    {selectedProduct.name}
                  </Typography>
                  
                  {selectedProduct.brand && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Marca: <strong>{selectedProduct.brand}</strong>
                    </Typography>
                  )}

                  <Box display="flex" gap={2} alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      {formatCurrency(selectedProduct.finalPrice)}
                    </Typography>
                    {selectedProduct.discountPercent > 0 && (
                      <>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            textDecoration: 'line-through',
                            color: 'text.secondary'
                          }}
                        >
                          {formatCurrency(selectedProduct.basePrice)}
                        </Typography>
                        <Chip 
                          label={`-${Math.round(selectedProduct.discountPercent)}%`}
                          color="error"
                          size="small"
                        />
                      </>
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Description */}
                  {selectedProduct.description && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                        Descripción
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                        {selectedProduct.description}
                      </Typography>
                    </Box>
                  )}

                  {/* Variants */}
                  {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                        Variantes Disponibles
                      </Typography>
                      <Box display="flex" flexDirection="column" gap={1}>
                        {selectedProduct.variants.map((variant) => (
                          <Card
                            key={variant.id}
                            variant="outlined"
                            sx={{
                              p: 1.5,
                              borderRadius: '8px',
                            }}
                          >
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                  {variant.attributeValues.map((av) => av.attributeValue.displayValue || av.attributeValue.value).join(' - ')}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ID: {variant.id}
                                </Typography>
                              </Box>
                              <Box display="flex" alignItems="center" gap={1.5}>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {formatCurrency(variant.price || 0)}
                                </Typography>
                              </Box>
                            </Box>
                          </Card>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Product Info */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                      Información del Producto
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={1}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          SKU:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {selectedProduct.sku}
                        </Typography>
                      </Box>
                      {selectedProduct.categories && selectedProduct.categories.length > 0 && (
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Categoría:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {selectedProduct.categories[0]?.category?.name || 'Sin categoría'}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          ) : (
            <Alert severity="warning">
              No se pudo cargar la información del producto
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={handleCloseModal} variant="outlined" size="large">
            Cerrar
          </Button>
          {selectedProduct && (
            <Button
              variant="contained"
              size="large"
              href={`/product/${selectedProduct.slug}`}
              sx={{ minWidth: 150 }}
            >
              Ver en Tienda
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
}
