import {
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  IconButton,
  Divider,
  CircularProgress,
  Container,
  Paper,
  Grid,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/formatters';
import { useCart, useUpdateCartItem, useRemoveCartItem } from '../../hooks/useCustomer';
import { useFeaturedProducts } from '../../hooks/useProducts';
import { useCustomerAuth } from '../../hooks/useCustomerAuth';
import PageBreadcrumb from '../../components/store/PageBreadcrumb';

export default function CartPage() {
  const { data: cart, isLoading } = useCart();
  const { data: relatedProducts } = useFeaturedProducts();
  const { mutate: updateItem } = useUpdateCartItem();
  const { mutate: removeItem } = useRemoveCartItem();
  const { isAuthenticated, refreshCart } = useCustomerAuth();
  const navigate = useNavigate();
  
  // Track loading state per item
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());

  const handleUpdateItem = (itemId: string, quantity: number) => {
    console.log('📝 [CartPage] handleUpdateItem called:', { itemId, quantity });
    setLoadingItems(prev => new Set(prev).add(itemId));
    
    updateItem(
      { itemId, quantity },
      {
        onSuccess: () => {
          console.log('📝 [CartPage] Update success, refreshing cart context');
          setLoadingItems(prev => {
            const updated = new Set(prev);
            updated.delete(itemId);
            return updated;
          });
          refreshCart(); // Refresh cart in context
        },
        onError: () => {
          setLoadingItems(prev => {
            const updated = new Set(prev);
            updated.delete(itemId);
            return updated;
          });
        },
      }
    );
  };

  const handleRemoveItem = (itemId: string) => {
    console.log('🗑️ [CartPage] handleRemoveItem called:', { itemId });
    setLoadingItems(prev => new Set(prev).add(itemId));
    
    removeItem(itemId, {
      onSuccess: () => {
        console.log('🗑️ [CartPage] Remove success, refreshing cart context');
        setLoadingItems(prev => {
          const updated = new Set(prev);
          updated.delete(itemId);
          return updated;
        });
        refreshCart(); // Refresh cart in context
      },
      onError: () => {
        setLoadingItems(prev => {
          const updated = new Set(prev);
          updated.delete(itemId);
          return updated;
        });
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
      <Container maxWidth="lg">
        <Box sx={{ py: 8 }}>
          <PageBreadcrumb items={[{ label: 'Carrito' }]} />
          <Box textAlign="center" py={8}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
              Tu carrito está vacío
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Explora nuestros productos y añade tus favoritos
            </Typography>
            <Button variant="contained" component={Link} to="/" size="large">
              Continuar Comprando
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <PageBreadcrumb items={[{ label: 'Carrito de Compras' }]} />
        
        {/* Header */}
        <Box sx={{ mb: 4, md: { mb: 6 } }}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em', fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' } }}>
            Carrito de Compras
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
            {cart.items.length} {cart.items.length === 1 ? 'producto' : 'productos'}
          </Typography>
        </Box>

        {/* Cart Items Grid */}
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 4, md: 6 } }}>
          <Grid sx={{ width: { xs: '100%', md: 'calc(66.666% - 12px)' } }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2, md: 2.5 } }}>
              {cart.items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card 
                    sx={{ 
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: { xs: '0 4px 12px rgba(0,0,0,0.1)', md: '0 8px 24px rgba(0,0,0,0.12)' },
                        transform: { xs: 'none', md: 'translateY(-4px)' },
                      },
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} gap={{ xs: 2, sm: 2.5, md: 3 }}>
                        {/* Product Thumbnail */}
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          style={{
                            borderRadius: '12px',
                            overflow: 'hidden',
                            flexShrink: 0,
                          }}
                        >
                          <Box
                            sx={{
                              width: { xs: 80, sm: 90, md: 100 },
                              height: { xs: 80, sm: 90, md: 100 },
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
                        </motion.div>

                        {/* Product Info */}
                        <Box flex={1} minWidth={0}>
                          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.15rem' }, mb: 0.5 }}>
                            {item.productName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                            {item.variantName}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600, fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                            {formatCurrency(item.unitPrice)} c/u
                          </Typography>
                        </Box>

                        {/* Quantity Controls and Price - Stack on mobile */}
                        <Box display="flex" flexDirection={{ xs: 'row', sm: 'column', md: 'row' }} alignItems="center" gap={{ xs: 1, sm: 1.5, md: 2 }} justifyContent={{ xs: 'space-between', sm: 'center', md: 'flex-end' }} width={{ xs: '100%', sm: 'auto' }}>
                          {loadingItems.has(item.id) && (
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                          )}
                          <Paper
                            variant="outlined"
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              gap: 0.5,
                              p: 0.5,
                              borderRadius: '8px',
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() => handleUpdateItem(item.id, Math.max(1, item.quantity - 1))}
                              disabled={item.quantity <= 1 || loadingItems.has(item.id)}
                              sx={{ '&:disabled': { opacity: 0.5 } }}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                            <Typography sx={{ minWidth: 35, textAlign: 'center', fontWeight: 700, fontSize: { xs: '0.85rem', md: '0.95rem' } }}>
                              {item.quantity}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleUpdateItem(item.id, item.quantity + 1)}
                              disabled={loadingItems.has(item.id)}
                              sx={{ '&:disabled': { opacity: 0.5 } }}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Paper>

                          {/* Total Price */}
                          <Typography variant="h6" sx={{ minWidth: { xs: 'auto', md: 110 }, textAlign: { xs: 'right', md: 'right' }, fontWeight: 800, fontSize: { xs: '1rem', md: '1.2rem' } }}>
                            {formatCurrency(item.totalPrice)}
                          </Typography>

                          {/* Delete Button */}
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <IconButton 
                              color="error" 
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={loadingItems.has(item.id)}
                              sx={{ 
                                ml: 0,
                                '&:disabled': { opacity: 0.5 }
                              }}
                            >
                              {loadingItems.has(item.id) ? (
                                <CircularProgress size={20} />
                              ) : (
                                <DeleteIcon />
                              )}
                            </IconButton>
                          </motion.div>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Box>
          </Grid>

          {/* Order Summary Sidebar */}
          <Grid sx={{ width: { xs: '100%', md: 'calc(33.333% - 12px)' } }}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3, md: 3.5 },
                  borderRadius: '16px',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  position: { xs: 'static', md: 'sticky' },
                  top: 20,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, fontSize: { xs: '1rem', md: '1.1rem' } }}>
                  Resumen del Pedido
                </Typography>

                <Box sx={{ mb: 2.5 }}>
                  <Box display="flex" justifyContent="space-between" sx={{ mb: 1.5 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', md: '0.95rem' } }}>
                      Subtotal
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', md: '0.95rem' } }}>
                      {formatCurrency(cart.subtotal)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" sx={{ mb: 1.5 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', md: '0.95rem' } }}>
                      Envío
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main', fontSize: { xs: '0.875rem', md: '0.95rem' } }}>
                      Gratis
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2.5 }} />

                <Box display="flex" justifyContent="space-between" sx={{ mb: 3.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: '1rem', md: '1.1rem' } }}>
                    Total
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', fontSize: { xs: '1.1rem', md: '1.3rem' } }}>
                    {formatCurrency(cart.subtotal)}
                  </Typography>
                </Box>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={() => navigate(isAuthenticated ? '/checkout' : '/login')}
                    sx={{
                      py: { xs: 1.25, md: 1.5 },
                      fontWeight: 700,
                      fontSize: { xs: '0.9rem', md: '1rem' },
                      textTransform: 'none',
                      borderRadius: '10px',
                    }}
                  >
                    {isAuthenticated ? 'Proceder al Pago' : 'Iniciar Sesión'}
                  </Button>
                </motion.div>

                <Button
                  variant="outlined"
                  fullWidth
                  component={Link}
                  to="/"
                  sx={{
                    mt: 1.5,
                    py: { xs: 1.25, md: 1.5 },
                    fontWeight: 600,
                    fontSize: { xs: '0.85rem', md: '0.95rem' },
                    textTransform: 'none',
                    borderRadius: '10px',
                  }}
                >
                  Continuar Comprando
                </Button>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>

        {/* Related Products Section */}
        {relatedProducts && relatedProducts.length > 0 && (() => {
          // Filter out products that are already in the cart
          const cartProductNames = new Set(cart.items.map(item => item.productName));
          const filteredProducts = relatedProducts.filter(product => {
            // Check if this product is already in the cart by comparing product names
            return !cartProductNames.has(product.name);
          });

          // Only show the section if there are products to display after filtering
          if (filteredProducts.length === 0) return null;

          return (
            <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Divider sx={{ my: 6 }} />
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5, letterSpacing: '-0.01em' }}>
                Productos Relacionados
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Otros clientes también compraron estos productos
              </Typography>
            </Box>

            <Grid container spacing={2}>
              {filteredProducts.slice(0, 4).map((product, index) => (
                <Box sx={{ width: { xs: '50%', sm: '50%', md: '25%' } }} key={product.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                  >
                    <Card
                      sx={{
                        cursor: 'pointer',
                        height: '100%',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        },
                      }}
                      onClick={() => navigate(`/product/${product.slug}`)}
                    >
                      {/* Product Image */}
                      <Box
                        sx={{
                          position: 'relative',
                          overflow: 'hidden',
                          paddingTop: '100%',
                          bgcolor: 'grey.100',
                        }}
                      >
                        <img
                          src={product.images?.[0]?.thumbnailUrl || 'https://via.placeholder.com/300?text=No+Image'}
                          alt={product.name}
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

                      <CardContent sx={{ p: 1.5 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            mb: 0.5,
                          }}
                        >
                          {product.name}
                        </Typography>

                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.9rem',
                              color: 'primary.main',
                            }}
                          >
                            {formatCurrency(product.finalPrice)}
                          </Typography>

                          {product.discountPercent > 0 && (
                            <Typography
                              variant="caption"
                              sx={{
                                bgcolor: 'error.light',
                                color: 'error.dark',
                                px: 1,
                                py: 0.25,
                                borderRadius: '4px',
                                fontWeight: 700,
                                fontSize: '0.7rem',
                              }}
                            >
                              -{Math.round(product.discountPercent)}%
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Box>
              ))}
            </Grid>
          </motion.div>
          );
        })()}
      </Box>
    </Container>
  );
}
