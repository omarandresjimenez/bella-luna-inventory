import { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Stack,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import {
  Add,
  Remove,
  Delete,
  ShoppingCart,
  Receipt,
  Search,
} from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { posApi } from '../../services/posApi';
import publicApi from '../../services/publicApi';
import type { POSSaleItem, POSSale } from '../../types/pos';
import { useProducts } from '../../hooks/useProducts';
import { formatCurrency } from '../../utils/formatters';
import OrderDetailsModal from '../../components/admin/OrderDetailsModal';

export default function POSPage() {
  const [cart, setCart] = useState<POSSaleItem[]>([]);
  const [notes, setNotes] = useState('');
  const [paymentType, setPaymentType] = useState<'CASH' | 'CARD' | 'CHECK'>('CASH');
  const [searchValue, setSearchValue] = useState<string>('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [orderDetailsModalOpen, setOrderDetailsModalOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState<POSSale | null>(null);

  const queryClient = useQueryClient();

  // Fetch products for search only if searchValue has more than 2 characters
  const { data: productsData, isLoading } = useProducts({
    search: searchValue.length > 2 ? searchValue : undefined,
  });

  // Debug: log the products data
  useEffect(() => {
    if (searchValue.length > 2) {
      console.log('Search value:', searchValue);
      console.log('Products data:', productsData);
      if (Array.isArray(productsData) && productsData.length > 0) {
        console.log('First product:', productsData[0]);
        console.log('First product variants:', productsData[0].variants);
      }
    }
  }, [productsData, searchValue]);

  // Create sale mutation
  const createSaleMutation = useMutation({
    mutationFn: posApi.createSale,
    onSuccess: (data) => {
      setSnackbar({
        open: true,
        message: `Venta completada! #${data.saleNumber}`,
        severity: 'success',
      });
      // Store order and open modal
      setLastOrder(data);
      setOrderDetailsModalOpen(true);
      
      // Clear cart
      setCart([]);
      setNotes('');
      setPaymentType('CASH');

      // Invalidate report queries to update in real-time
      queryClient.invalidateQueries({ queryKey: ['pos-sales-stats'] });
      queryClient.invalidateQueries({ queryKey: ['pos-sales-over-time'] });
      queryClient.invalidateQueries({ queryKey: ['pos-sales-by-staff'] });
      queryClient.invalidateQueries({ queryKey: ['pos-top-products'] });
      
      // Invalidate products to refresh stock
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al crear venta',
        severity: 'error',
      });
    },
  });

  // Add item to cart
  const addToCart = (variant: any, product: any) => {
    // Use variant if available, otherwise use product
    const itemVariant = variant || product;
    const variantId = itemVariant?.id;
    
    const existingItem = cart.find((item) => item.variantId === variantId);

    // Extract variant name from attributeValues structure
    let variantLabel = 'Default';
    if (itemVariant?.attributeValues && Array.isArray(itemVariant.attributeValues)) {
      variantLabel = itemVariant.attributeValues
        .map((av: any) => av.attributeValue?.displayValue || av.attributeValue?.value)
        .filter(Boolean)
        .join(' / ');
    } else if (itemVariant?.attributes && Array.isArray(itemVariant.attributes)) {
      // Fallback for old structure
      variantLabel = (itemVariant.attributes as any[])
        .map((attr: any) => attr.value)
        .join(' / ');
    } else if (itemVariant?.name) {
      variantLabel = itemVariant.name;
    }

    if (existingItem) {
      // Update quantity
      setCart(
        cart.map((item) =>
          item.variantId === variantId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      // Add new item
      const newItem: POSSaleItem = {
        variantId: variantId,
        productName: product.name,
        variantName: variantLabel,
        productSku: itemVariant.sku,
        imageUrl: product.images?.[0]?.url || null,
        quantity: 1,
        unitPrice: Number(itemVariant.price || product.basePrice || 0),
      };
      setCart([...cart, newItem]);
    }
    setSearchValue(''); // Clear search after adding
  };

  // Update quantity
  const updateQuantity = (variantId: string | undefined, delta: number) => {
    setCart(
      cart
        .map((item) =>
          item.variantId === variantId
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Remove item
  const removeItem = (variantId: string | undefined) => {
    setCart(cart.filter((item) => item.variantId !== variantId));
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const total = subtotal;

  // Handle checkout
  const handleCheckout = () => {
    if (cart.length === 0) {
      setSnackbar({
        open: true,
        message: 'El carrito está vacío',
        severity: 'error',
      });
      return;
    }

    createSaleMutation.mutate({
      items: cart,
      notes: notes.trim() || undefined,
      paymentType,
    });
  };

  // Prepare autocomplete options - just use product names
  const productOptions: Array<{ label: string; product: any }> =
    searchValue.length > 2 && Array.isArray(productsData) && productsData.length > 0
      ? productsData.map((product: any) => ({
          label: `${product.name} (${product.sku})`,
          product,
        }))
      : [];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Punto de Venta
      </Typography>

      <Stack spacing={3}>
        {/* Product Search and Cart */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {/* Product Search */}
          <Box sx={{ flex: 1 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  <Search sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Buscar Producto
                </Typography>

                <Autocomplete
                  value={null}
                  inputValue={searchValue}
                  onInputChange={(_, value) => setSearchValue(value)}
                  onChange={async (_, value) => {
                    if (value?.product?.slug) {
                      try {
                        // Fetch full product with variants
                        const response = await publicApi.getProductBySlug(value.product.slug);
                        const fullProduct = response.data.data;
                        console.log('Full product with variants:', fullProduct);
                        
                        // If product has variants, show dialog
                        if (fullProduct.variants && fullProduct.variants.length > 0) {
                          setSelectedProduct(fullProduct);
                          setSelectedVariantId(fullProduct.variants[0].id); // Select first variant by default
                          setVariantDialogOpen(true);
                        } else {
                          // If no variants, add product as is
                          addToCart(null, fullProduct);
                        }
                      } catch (error) {
                        console.error('Error fetching product:', error);
                        setSnackbar({
                          open: true,
                          message: 'Error al cargar el producto',
                          severity: 'error',
                        });
                      }
                    }
                  }}
                  options={productOptions}
                  loading={isLoading && searchValue.length > 2}
                  noOptionsText={searchValue.length <= 2 ? 'Escribe al menos 3 caracteres' : 'No se encontraron productos'}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Buscar por nombre o SKU"
                      placeholder="Escribe al menos 3 caracteres..."
                      fullWidth
                    />
                  )}
                />

                <Box sx={{ mt: 3 }}>
                  <Alert severity="info">
                    Busca productos por nombre, variante o SKU. Agrega productos al carrito para procesar la venta.
                  </Alert>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Cart */}
          <Box sx={{ flex: 1 }}>
            <Card>
              <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                <ShoppingCart sx={{ mr: 1, verticalAlign: 'middle' }} />
                Carrito ({cart.length} items)
              </Typography>

              {cart.length === 0 ? (
                <Alert severity="warning">El carrito está vacío</Alert>
              ) : (
                <Stack spacing={2}>
                  {cart.map((item) => (
                    <Box
                      key={item.variantId}
                      sx={{
                        p: 2,
                        bgcolor: 'grey.50',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" fontWeight={600}>
                          {item.productName}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                          <Typography variant="body2" sx={{ 
                            bgcolor: 'primary.main', 
                            color: 'primary.contrastText',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            fontWeight: 600,
                            fontSize: '0.85rem'
                          }}>
                            {item.variantName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ py: 0.5 }}>
                            SKU: {item.productSku}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="primary" fontWeight={600}>
                          {formatCurrency(item.unitPrice)} x {item.quantity} = {formatCurrency(item.unitPrice * item.quantity)}
                        </Typography>
                      </Box>

                      <Stack direction="row" alignItems="center" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.variantId, -1)}
                          disabled={item.quantity <= 1}
                        >
                          <Remove />
                        </IconButton>
                        <Typography sx={{ minWidth: 30, textAlign: 'center' }}>
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.variantId, 1)}
                        >
                          <Add />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeItem(item.variantId)}
                        >
                          <Delete />
                        </IconButton>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}

              <Divider sx={{ my: 3 }} />

              {/* Totals */}
              <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="body1">Subtotal:</Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {formatCurrency(subtotal)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="h6" fontWeight={700}>
                    Total:
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="primary">
                    {formatCurrency(total)}
                  </Typography>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Box>
        </Stack>

        {/* Checkout */}
        <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                <Receipt sx={{ mr: 1, verticalAlign: 'middle' }} />
                Finalizar Venta
              </Typography>

              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                  <FormControl fullWidth>
                    <InputLabel>Método de Pago</InputLabel>
                    <Select
                      value={paymentType}
                      onChange={(e) => setPaymentType(e.target.value as any)}
                      label="Método de Pago"
                    >
                      <MenuItem value="CASH">Efectivo</MenuItem>
                      <MenuItem value="CARD">Tarjeta</MenuItem>
                      <MenuItem value="CHECK">Cheque</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="Notas (opcional)"
                    multiline
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notas adicionales para esta venta..."
                  />
                </Stack>

                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || createSaleMutation.isPending}
                  sx={{ py: 2, fontSize: '1.1rem' }}
                >
                  {createSaleMutation.isPending ? 'Procesando...' : 'Confirmar Venta'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
      </Stack>

      {/* Variant Selection Dialog */}
      <Dialog open={variantDialogOpen} onClose={() => setVariantDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Seleccionar Variante</DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {selectedProduct.name}
              </Typography>
              
              <FormControl fullWidth>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Variantes disponibles:
                </Typography>
                <RadioGroup
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {selectedProduct.variants?.map((variant: any) => {
                      // Get variant label from attributeValues
                      const variantLabel = variant.attributeValues?.length > 0
                        ? variant.attributeValues
                            .map((av: any) => av.attributeValue?.displayValue || av.attributeValue?.value)
                            .join(' / ')
                        : 'Default';
                      return (
                        <FormControlLabel
                          key={variant.id}
                          value={variant.id}
                          control={<Radio />}
                          label={`${variantLabel} - ${formatCurrency(variant.price)}`}
                        />
                      );
                    })}
                  </Box>
                </RadioGroup>
              </FormControl>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVariantDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={() => {
              const variant = selectedProduct?.variants?.find((v: any) => v.id === selectedVariantId);
              if (variant) {
                addToCart(variant, selectedProduct);
                setVariantDialogOpen(false);
                setSelectedProduct(null);
                setSelectedVariantId('');
              }
            }}
            variant="contained"
          >
            Agregar al Carrito
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Order Details Modal */}
      <OrderDetailsModal
        open={orderDetailsModalOpen}
        order={lastOrder}
        onClose={() => setOrderDetailsModalOpen(false)}
      />
    </Container>
  );
}
