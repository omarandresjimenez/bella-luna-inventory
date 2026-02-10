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
} from '@mui/material';
import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Heart,
  Share2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  Star
} from 'lucide-react';
import { useProduct } from '../../hooks/useProducts';
import { useAddToCart } from '../../hooks/useCustomer';
import { useCustomerAuth } from '../../hooks/useCustomerAuth';
import { MotionWrapper } from '../../components/store/MotionWrapper';
import { GlassContainer } from '../../components/shared/GlassContainer';
import type { ProductVariant, VariantAttributeValueItem } from '../../types';
import PageBreadcrumb from '../../components/store/PageBreadcrumb';

export default function ProductPage() {
  const theme = useTheme();
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, error } = useProduct(slug || '');
  const { mutate: addToCart, isPending: isAddingToCart, isError: addToCartError, error: cartError } = useAddToCart();
  const { refreshCart } = useCustomerAuth();

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

  const handleAddToCart = () => {
    if (currentVariant) {
      addToCart(
        { variantId: currentVariant.id, quantity },
        {
          onSuccess: () => {
            setSnackbarMessage(`${product.name} agregado al carrito`);
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            setQuantity(1); // Reset quantity
            refreshCart(); // Refresh cart in context
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
    }
  };

  // Group attributes by name
  const attributesMap = new Map<string, Map<string, VariantAttributeValueItem>>();
  if (product.variants) {
    product.variants.forEach((variant) => {
      if (variant.attributeValues) {
        variant.attributeValues.forEach(({ attributeValue }) => {
          const attrName = attributeValue.attribute.displayName;
          if (!attributesMap.has(attrName)) {
            attributesMap.set(attrName, new Map());
          }
          // Use ID as key to avoid duplicates
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
    <Box sx={{ pb: 15 }}>
      <Container maxWidth="xl">
        <Box sx={{ pt: 2, pb: 4 }}>
          <PageBreadcrumb items={breadcrumbItems} />
        </Box>

        <Grid container spacing={8}>
          {/* Gallery Section */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack direction={{ xs: 'column-reverse', lg: 'row' }} spacing={3}>
              {/* Thumbnails */}
              <Stack
                direction={{ xs: 'row', lg: 'column' }}
                spacing={2}
                sx={{
                  overflowX: 'auto',
                  pb: { xs: 2, lg: 0 },
                  minWidth: { lg: '100px' }
                }}
              >
                {product.images?.map((img, idx) => (
                  <Box
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '16px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: activeImage === idx ? 'secondary.main' : 'transparent',
                      transition: 'all 0.3s ease',
                      flexShrink: 0
                    }}
                  >
                    <img src={img.thumbnailUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                ))}
              </Stack>

              {/* Main Image */}
              <MotionWrapper style={{ flexGrow: 1 }}>
                <Box sx={{ position: 'relative', borderRadius: '40px', overflow: 'hidden', bgcolor: 'hsla(0, 0%, 0%, 0.02)' }}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeImage}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      style={{ height: '700px' }}
                    >
                      <img
                        src={product.images?.[activeImage]?.largeUrl || 'https://via.placeholder.com/1000x1200?text=No+Image'}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </motion.div>
                  </AnimatePresence>

                  {product.discountPercent > 0 && (
                    <GlassContainer sx={{ position: 'absolute', top: 30, left: 30, px: 2, py: 1, borderRadius: '14px' }}>
                      <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 800 }}>-{product.discountPercent}%</Typography>
                    </GlassContainer>
                  )}

                  {currentVariant?.stock === 0 && (
                    <GlassContainer sx={{ position: 'absolute', top: 30, left: 30, px: 2.5, py: 1.5, borderRadius: '14px', backdropFilter: 'blur(24px) saturate(180%)', background: 'hsla(0, 100%, 70%, 0.7)' }}>
                      <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 800, letterSpacing: '0.05em' }}>No disponible</Typography>
                    </GlassContainer>
                  )}

                  <IconButton sx={{ position: 'absolute', top: 30, right: 30, bgcolor: 'white', '&:hover': { bgcolor: 'secondary.main', color: 'white' } }}>
                    <Heart size={22} />
                  </IconButton>
                </Box>
              </MotionWrapper>
            </Stack>
          </Grid>

          {/* Info Section */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ position: 'sticky', top: 120 }}>
              <MotionWrapper delay={0.1}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 700, letterSpacing: '0.2em' }}>
                    {product.brand || 'Luxury Collection'}
                  </Typography>
                  <Divider sx={{ width: 40, borderColor: 'secondary.main', opacity: 0.3 }} />
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Star size={14} fill="#EAB308" stroke="none" />
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>4.9</Typography>
                    <Typography variant="caption" color="text.secondary">(120 reseñas)</Typography>
                  </Stack>
                </Stack>

                <Typography variant="h3" sx={{ mb: 3, lineHeight: 1.2 }}>{product.name}</Typography>

                <Stack direction="row" spacing={3} alignItems="flex-end" sx={{ mb: 4 }}>
                  <Typography variant="h3" sx={{ fontWeight: 800 }}>${currentPrice}</Typography>
                  {product.discountPercent > 0 && (
                    <Typography variant="h5" color="text.secondary" sx={{ textDecoration: 'line-through', mb: 0.5, opacity: 0.6 }}>
                      ${product.basePrice}
                    </Typography>
                  )}
                </Stack>

                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 5, fontSize: '1.05rem' }}>
                  {product.description}
                </Typography>

                <Divider sx={{ mb: 5, opacity: 0.5 }} />

                {/* Attributes */}
                {Array.from(attributesMap.entries()).map(([attrName, valuesMap]) => (
                  <Box key={attrName} sx={{ mb: 4 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {attrName}
                    </Typography>
                    <Stack direction="row" spacing={1.5} flexWrap="wrap">
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
                              borderRadius: '12px',
                              border: '2px solid',
                              borderColor: isSelected ? 'secondary.main' : 'hsla(0, 0%, 0%, 0.05)',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              minWidth: 50,
                              textAlign: 'center',
                              '&:hover': { borderColor: isSelected ? 'secondary.main' : 'primary.light' }
                            }}
                          >
                            {value.colorHex ? (
                              <Box sx={{ width: 34, height: 34, borderRadius: '8px', bgcolor: value.colorHex, mx: 'auto' }} />
                            ) : (
                              <Typography variant="body2" sx={{ px: 2, py: 0.5, fontWeight: isSelected ? 700 : 400 }}>
                                {value.displayValue || value.value}
                              </Typography>
                            )}
                          </Box>
                        );
                      })}
                    </Stack>
                  </Box>
                ))}

                {/* Quantity & Actions */}
                <Stack direction="row" spacing={3} sx={{ mt: 6 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    sx={{
                      bgcolor: 'hsla(0, 0%, 0%, 0.03)',
                      borderRadius: '50px',
                      px: 2, py: 1
                    }}
                  >
                    <IconButton size="small" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus size={16} /></IconButton>
                    <Typography sx={{ width: 40, textAlign: 'center', fontWeight: 700 }}>{quantity}</Typography>
                    <IconButton size="small" onClick={() => setQuantity(q => q + 1)}><Plus size={16} /></IconButton>
                  </Stack>

                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<ShoppingBag size={20} />}
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || !currentVariant || (currentVariant.stock !== undefined && currentVariant.stock === 0)}
                    sx={{ borderRadius: '50px', py: 2 }}
                  >
                    {isAddingToCart 
                      ? 'Procesando...' 
                      : currentVariant?.stock === 0 
                        ? 'Sin Stock' 
                        : 'Añadir al Carrito'
                    }
                  </Button>
                </Stack>

                {/* Value Props */}
                <Grid container spacing={2} sx={{ mt: 8 }}>
                  <Grid size={{ xs: 6 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Truck size={18} color={theme.palette.secondary.main} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>Envió Express Gratis</Typography>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <ShieldCheck size={18} color={theme.palette.secondary.main} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>Pago 100% Seguro</Typography>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <RotateCcw size={18} color={theme.palette.secondary.main} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>30 Días de Garantía</Typography>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Share2 size={18} color={theme.palette.secondary.main} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>Compartir con amigos</Typography>
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
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%', borderRadius: '12px' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
