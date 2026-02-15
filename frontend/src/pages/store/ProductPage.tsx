import {
  Typography,
  Grid,
  Box,
  CircularProgress,
  Alert,
  Button,
  Container,
  Stack,
  IconButton,
  Divider,
  useTheme,
  Snackbar,
  useMediaQuery,
} from '@mui/material';
import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../../utils/formatters';
import {
  ShoppingBag,
  Heart,
  Share2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  Star,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useProduct } from '../../hooks/useProducts';
import { useAddToCart } from '../../hooks/useCustomer';
import { useCustomerAuth } from '../../hooks/useCustomerAuth';
import { useIsFavorite, useAddToFavorites, useRemoveFromFavorites } from '../../hooks/useFavorites';
import { MotionWrapper } from '../../components/store/MotionWrapper';
import { GlassContainer } from '../../components/shared/GlassContainer';
import type { ProductVariant, VariantAttributeValueItem } from '../../types';
import PageBreadcrumb from '../../components/store/PageBreadcrumb';
import { useNavigate } from 'react-router-dom';

export default function ProductPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, error } = useProduct(slug || '');
  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart();
  const { refreshCart, isAuthenticated } = useCustomerAuth();
  const { data: isFavorite } = useIsFavorite(product?.id || '');
  const addToFavorites = useAddToFavorites();
  const removeFromFavorites = useRemoveFromFavorites();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="md" sx={{ py: 10 }}>
        <Alert severity="error" sx={{ borderRadius: '16px' }}>Producto no encontrado</Alert>
        <Button component={Link} to="/" sx={{ mt: 3 }}>Volver al inicio</Button>
      </Container>
    );
  }

  const currentVariant = selectedVariant || (product.variants && product.variants.length > 0 ? product.variants[0] : null);
  const currentPrice = currentVariant?.price || product.finalPrice;

  const canAddToCart = currentVariant !== null || (product.variants && product.variants.length === 0);
  const cartVariantId = currentVariant?.id || product.id;

  const handleFavoriteClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!product) return;

    if (isFavorite) {
      removeFromFavorites.mutate(product.id);
    } else {
      addToFavorites.mutate(product.id);
    }
  };

  const handleAddToCart = () => {
    if (!canAddToCart) return;
    
    const payload = { variantId: cartVariantId, quantity };
    
    addToCart(
      payload,
      {
        onSuccess: () => {
          setSnackbarMessage(`${product.name} agregado al carrito`);
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
          setQuantity(1);
          refreshCart();
        },
        onError: (err) => {
          setSnackbarMessage(
            err instanceof Error 
              ? err.message 
              : 'Error al agregar al carrito. Intenta de nuevo.'
          );
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        },
      }
    );
  };

  const handlePrevImage = () => {
    setActiveImage((prev) => (prev === 0 ? (product.images?.length || 1) - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImage((prev) => (prev === (product.images?.length || 1) - 1 ? 0 : prev + 1));
  };

  const attributesMap = new Map<string, Map<string, VariantAttributeValueItem>>();
  if (product.variants) {
    product.variants.forEach((variant) => {
      if (variant.attributeValues) {
        variant.attributeValues.forEach(({ attributeValue }) => {
          const attrName = attributeValue.attribute.displayName;
          if (!attributesMap.has(attrName)) {
            attributesMap.set(attrName, new Map());
          }
          attributesMap.get(attrName)!.set(attributeValue.id, attributeValue);
        });
      }
    });
  }

  const firstCategory = product.categories?.[0]?.category;
  const breadcrumbItems = [
    ...(firstCategory ? [{ label: firstCategory.name, href: `/category/${firstCategory.slug}` }] : []),
    { label: product.name },
  ];

  return (
    <Box sx={{ pb: { xs: 4, md: 15 } }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ pt: { xs: 1, md: 2 }, pb: { xs: 2, md: 4 } }}>
          <PageBreadcrumb items={breadcrumbItems} />
        </Box>

        <Grid container spacing={{ xs: 3, md: 8 }}>
          {/* Gallery Section */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={{ xs: 2, lg: 3 }}>
              {/* Thumbnails - Hidden on mobile, shown on desktop */}
              {!isMobile && (
                <Stack
                  direction="column"
                  spacing={2}
                  sx={{
                    minWidth: '80px',
                    maxHeight: '500px',
                    overflowY: 'auto',
                  }}
                >
                  {product.images?.map((img, idx) => (
                    <Box
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '12px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: '2px solid',
                        borderColor: activeImage === idx ? 'secondary.main' : 'transparent',
                        transition: 'all 0.3s ease',
                        flexShrink: 0,
                      }}
                    >
                      <img src={img.thumbnailUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Box>
                  ))}
                </Stack>
              )}

              {/* Main Image */}
              <MotionWrapper style={{ flexGrow: 1 }}>
                <Box sx={{ position: 'relative', borderRadius: { xs: '24px', md: '40px' }, overflow: 'hidden', bgcolor: 'hsla(0, 0%, 0%, 0.02)' }}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeImage}
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      style={{ 
                        aspectRatio: '1/1',
                        maxHeight: isMobile ? 'none' : '600px',
                      }}
                    >
                      <img
                        src={product.images?.[activeImage]?.largeUrl || 'https://via.placeholder.com/1000x1000?text=No+Image'}
                        alt={product.name}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'contain',
                          backgroundColor: 'hsla(0, 0%, 0%, 0.02)',
                        }}
                      />
                    </motion.div>
                  </AnimatePresence>

                  {product.discountPercent > 0 && (
                    <GlassContainer sx={{ position: 'absolute', top: { xs: 16, md: 30 }, left: { xs: 16, md: 30 }, px: { xs: 1.5, md: 2 }, py: { xs: 0.5, md: 1 }, borderRadius: '12px' }}>
                      <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 800, fontSize: { xs: '0.875rem', md: '1.25rem' } }}>
                        -{product.discountPercent}%
                      </Typography>
                    </GlassContainer>
                  )}

                  {currentVariant?.stock === 0 && (
                    <GlassContainer sx={{ position: 'absolute', top: { xs: 16, md: 30 }, left: { xs: 16, md: 30 }, px: { xs: 2, md: 2.5 }, py: { xs: 1, md: 1.5 }, borderRadius: '12px', backdropFilter: 'blur(24px) saturate(180%)', background: 'hsla(0, 100%, 70%, 0.7)' }}>
                      <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 800, letterSpacing: '0.05em', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>No disponible</Typography>
                    </GlassContainer>
                  )}

                  <IconButton
                    onClick={handleFavoriteClick}
                    sx={{
                      position: 'absolute', top: { xs: 16, md: 30 }, right: { xs: 16, md: 30 }, bgcolor: 'white',
                      color: isFavorite ? 'error.main' : 'inherit',
                      '&:hover': { bgcolor: 'secondary.main', color: 'white' }
                    }}
                  >
                    <Heart size={isMobile ? 20 : 22} fill={isFavorite ? 'currentColor' : 'none'} />
                  </IconButton>

                  {/* Mobile Image Navigation Arrows */}
                  {isMobile && product.images && product.images.length > 1 && (
                    <>
                      <IconButton
                        onClick={handlePrevImage}
                        sx={{
                          position: 'absolute',
                          left: 8,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          bgcolor: 'rgba(255,255,255,0.9)',
                          '&:hover': { bgcolor: 'white' },
                        }}
                      >
                        <ChevronLeft size={24} />
                      </IconButton>
                      <IconButton
                        onClick={handleNextImage}
                        sx={{
                          position: 'absolute',
                          right: 8,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          bgcolor: 'rgba(255,255,255,0.9)',
                          '&:hover': { bgcolor: 'white' },
                        }}
                      >
                        <ChevronRight size={24} />
                      </IconButton>
                    </>
                  )}

                  {/* Mobile Image Dots Indicator */}
                  {isMobile && product.images && product.images.length > 1 && (
                    <Stack 
                      direction="row" 
                      spacing={1} 
                      justifyContent="center"
                      sx={{
                        position: 'absolute',
                        bottom: 16,
                        left: 0,
                        right: 0,
                      }}
                    >
                      {product.images.map((_, idx) => (
                        <Box
                          key={idx}
                          onClick={() => setActiveImage(idx)}
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: activeImage === idx ? 'secondary.main' : 'rgba(255,255,255,0.7)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                          }}
                        />
                      ))}
                    </Stack>
                  )}
                </Box>
              </MotionWrapper>
            </Stack>

            {/* Mobile Thumbnails Row */}
            {isMobile && product.images && product.images.length > 1 && (
              <Stack
                direction="row"
                spacing={1.5}
                sx={{
                  overflowX: 'auto',
                  pb: 1,
                  mt: 2,
                  '&::-webkit-scrollbar': { display: 'none' },
                }}
              >
                {product.images.map((img, idx) => (
                  <Box
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '10px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: activeImage === idx ? 'secondary.main' : 'transparent',
                      transition: 'all 0.3s ease',
                      flexShrink: 0,
                    }}
                  >
                    <img src={img.thumbnailUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                ))}
              </Stack>
            )}
          </Grid>

          {/* Info Section */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ position: { md: 'sticky' }, top: { md: 100 } }}>
              <MotionWrapper delay={0.1}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: { xs: 1.5, md: 2 } }}>
                  <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 700, letterSpacing: '0.2em', fontSize: { xs: '0.65rem', md: '0.75rem' } }}>
                    {product.brand || 'Luxury Collection'}
                  </Typography>
                  <Divider sx={{ width: 24, md: 40, borderColor: 'secondary.main', opacity: 0.3 }} />
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Star size={14} fill="#EAB308" stroke="none" />
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>4.9</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'inline' } }}>(120 reseñas)</Typography>
                  </Stack>
                </Stack>

                <Typography variant="h3" sx={{ mb: { xs: 2, md: 3 }, lineHeight: 1.2, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
                  {product.name}
                </Typography>

                <Stack direction="row" spacing={2} alignItems="flex-end" sx={{ mb: { xs: 2, md: 4 } }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' } }}>
                    {formatCurrency(currentPrice)}
                  </Typography>
                  {product.discountPercent > 0 && (
                    <Typography variant="h5" color="text.secondary" sx={{ textDecoration: 'line-through', mb: 0.5, opacity: 0.6, fontSize: { xs: '1rem', md: '1.5rem' } }}>
                      {formatCurrency(product.basePrice)}
                    </Typography>
                  )}
                </Stack>

                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7, mb: { xs: 3, md: 5 }, fontSize: { xs: '0.9375rem', md: '1.05rem' } }}>
                  {product.description}
                </Typography>

                {/* Static Product Attributes (Info with values) */}
                {product.attributes && product.attributes.filter(attr => attr.value).length > 0 && (
                  <Box sx={{ mb: { xs: 3, md: 4 } }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: { xs: '0.75rem', md: '0.875rem' }, color: 'secondary.main' }}>
                      Características
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {product.attributes
                        .filter(attr => attr.value && attr.attribute)
                        .map((attr) => (
                          <Box key={attr.id || attr.attribute.id} sx={{ display: 'flex', alignItems: 'baseline' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 120, color: 'text.primary' }}>
                              {attr.attribute.displayName}:
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {attr.value}
                            </Typography>
                          </Box>
                        ))}
                    </Box>
                    <Divider sx={{ mt: { xs: 3, md: 4 }, opacity: 0.5 }} />
                  </Box>
                )}

                {/* Variant Attributes */}
                {Array.from(attributesMap.entries()).map(([attrName, valuesMap]) => (
                  <Box key={attrName} sx={{ mb: { xs: 3, md: 4 } }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: { xs: 1.5, md: 2 }, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                      {attrName}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {Array.from(valuesMap.values()).map((value) => {
                        const isSelected = currentVariant?.attributeValues?.some(av => av.attributeValue.id === value.id) || false;
                        return (
                          <Box
                            key={value.id}
                            onClick={() => {
                              const variant = product.variants?.find(v => v.attributeValues?.some(av => av.attributeValue.id === value.id));
                              if (variant) setSelectedVariant(variant);
                            }}
                            sx={{
                              p: 0.5,
                              borderRadius: '10px',
                              border: '2px solid',
                              borderColor: isSelected ? 'secondary.main' : 'hsla(0, 0%, 0%, 0.05)',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              minWidth: 44,
                              textAlign: 'center',
                              mb: 1,
                              '&:hover': { borderColor: isSelected ? 'secondary.main' : 'primary.light' }
                            }}
                          >
                            {value.colorHex ? (
                              <Box sx={{ width: 28, height: 28, borderRadius: '6px', bgcolor: value.colorHex, mx: 'auto' }} />
                            ) : (
                              <Typography variant="body2" sx={{ px: 1.5, py: 0.5, fontWeight: isSelected ? 700 : 400, fontSize: { xs: '0.8125rem', md: '0.875rem' } }}>
                                {value.displayValue || value.value}
                              </Typography>
                            )}
                          </Box>
                        );
                      })}
                    </Stack>
                  </Box>
                ))}

                {/* Selected Variant Display */}
                {currentVariant && product.variants && product.variants.length > 0 && (
                  <Box sx={{ mb: { xs: 3, md: 4 }, p: 2, bgcolor: 'hsla(0, 0%, 0%, 0.03)', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                      Variante seleccionada:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {currentVariant.attributeValues?.map(av => av.attributeValue.displayValue || av.attributeValue.value).join(' - ')}
                    </Typography>
                  </Box>
                )}

                {/* Quantity & Actions */}
                <Stack 
                  direction="row" 
                  spacing={{ xs: 1.5, md: 3 }} 
                  sx={{ mt: { xs: 3, md: 6 } }}
                  alignItems="center"
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    sx={{
                      bgcolor: 'hsla(0, 0%, 0%, 0.03)',
                      borderRadius: '50px',
                      px: { xs: 1.5, md: 2 }, 
                      py: { xs: 0.5, md: 1 },
                      flexShrink: 0,
                    }}
                  >
                    <IconButton size="small" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus size={16} /></IconButton>
                    <Typography sx={{ width: { xs: 32, md: 40 }, textAlign: 'center', fontWeight: 700 }}>{quantity}</Typography>
                    <IconButton size="small" onClick={() => setQuantity(q => q + 1)}><Plus size={16} /></IconButton>
                  </Stack>

                  {/* Desktop Button with text */}
                  {!isMobile && (
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      startIcon={<ShoppingBag size={20} />}
                      onClick={handleAddToCart}
                      disabled={isAddingToCart || !canAddToCart || (currentVariant ? currentVariant.stock === 0 : (product.stock !== undefined && product.stock <= 0))}
                      sx={{ borderRadius: '50px', py: 2 }}
                    >
                      {isAddingToCart 
                        ? 'Procesando...' 
                        : (currentVariant ? currentVariant.stock === 0 : (product.stock !== undefined && product.stock <= 0))
                          ? 'Sin Stock' 
                          : 'Añadir al Carrito'
                      }
                    </Button>
                  )}

                  {/* Mobile Button - Icon only */}
                  {isMobile && (
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      onClick={handleAddToCart}
                      disabled={isAddingToCart || !canAddToCart || (currentVariant ? currentVariant.stock === 0 : (product.stock !== undefined && product.stock <= 0))}
                      sx={{ 
                        borderRadius: '50px', 
                        py: 1.5,
                        minHeight: 48,
                      }}
                    >
                      {isAddingToCart ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (currentVariant ? currentVariant.stock === 0 : (product.stock !== undefined && product.stock <= 0)) ? (
                        <Typography variant="button" sx={{ fontSize: '0.875rem' }}>Sin Stock</Typography>
                      ) : (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <ShoppingBag size={22} />
                          <Typography variant="button" sx={{ fontSize: '0.9375rem', fontWeight: 600 }}>
                            Añadir
                          </Typography>
                        </Stack>
                      )}
                    </Button>
                  )}
                </Stack>

                {/* Value Props */}
                <Grid container spacing={{ xs: 1.5, md: 2 }} sx={{ mt: { xs: 4, md: 8 } }}>
                  <Grid size={{ xs: 6 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Truck size={16} color={theme.palette.secondary.main} />
                      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: { xs: '0.7rem', md: '0.75rem' } }}>Envió Express Gratis</Typography>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <ShieldCheck size={16} color={theme.palette.secondary.main} />
                      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: { xs: '0.7rem', md: '0.75rem' } }}>Pago 100% Seguro</Typography>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <RotateCcw size={16} color={theme.palette.secondary.main} />
                      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: { xs: '0.7rem', md: '0.75rem' } }}>30 Días de Garantía</Typography>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Share2 size={16} color={theme.palette.secondary.main} />
                      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: { xs: '0.7rem', md: '0.75rem' } }}>Compartir</Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </MotionWrapper>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: 16, md: 24 } }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%', borderRadius: '12px' }}
        >
          {snackbarSeverity === 'success' ? (
            <Box>
              {snackbarMessage}.{' '}
              <Button
                component={Link}
                to="/cart"
                size="small"
                sx={{
                  color: 'inherit',
                  textDecoration: 'underline',
                  fontWeight: 700,
                  textTransform: 'none',
                  minWidth: 'auto',
                  p: 0,
                  '&:hover': {
                    textDecoration: 'underline',
                    background: 'transparent',
                  },
                }}
              >
                Ver carrito
              </Button>
            </Box>
          ) : (
            snackbarMessage
          )}
        </Alert>
      </Snackbar>
    </Box>
  );
}
