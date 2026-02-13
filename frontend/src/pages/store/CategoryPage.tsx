import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  CircularProgress,
  Alert,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Container,
  Stack,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
  Snackbar,
} from '@mui/material';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Heart, Search, Filter, SlidersHorizontal, ShoppingCart } from 'lucide-react';
import { useProductsByCategory, useCategory } from '../../hooks/useProducts';
import { useFavoriteProductIds, useAddToFavorites, useRemoveFromFavorites } from '../../hooks/useFavorites';
import { useCustomerAuth } from '../../hooks/useCustomerAuth';
import { useAddToCart } from '../../hooks/useCustomer';
import type { Product } from '../../types';
import PageBreadcrumb from '../../components/store/PageBreadcrumb';
import { MotionWrapper } from '../../components/store/MotionWrapper';
import { GlassContainer } from '../../components/shared/GlassContainer';

export default function CategoryPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const isAll = slug === 'all';
  const { data: category, isLoading: categoryLoading } = useCategory(isAll ? '' : (slug || ''));
  const { data: products, isLoading: productsLoading, error } = useProductsByCategory(
    isAll ? '' : (slug || ''),
    {
      sortBy,
      search: searchQuery || undefined,
    }
  );

  const { isAuthenticated, refreshCart } = useCustomerAuth();
  const { data: favoriteProductIds } = useFavoriteProductIds();
  const addToFavorites = useAddToFavorites();
  const removeFromFavorites = useRemoveFromFavorites();
  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleFavoriteClick = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const isFavorite = favoriteProductIds?.includes(productId) || false;
    if (isFavorite) {
      removeFromFavorites.mutate(productId);
    } else {
      addToFavorites.mutate(productId);
    }
  };

  const handleQuickAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // For products with variants, use the first variant
    // For products without variants, use the product ID
    const variantId = product.variants && product.variants.length > 0 
      ? product.variants[0].id 
      : product.id;

    addToCart(
      { variantId, quantity: 1 },
      {
        onSuccess: () => {
          setSnackbarMessage(`${product.name} agregado al carrito`);
          setSnackbarOpen(true);
          refreshCart();
        },
        onError: (err) => {
          setSnackbarMessage(
            err instanceof Error 
              ? err.message 
              : 'Error al agregar al carrito'
          );
          setSnackbarOpen(true);
        },
      }
    );
  };

  if (categoryLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  const breadcrumbItems = [
    { label: category?.name || 'Todos los Productos' },
  ];

  const categoryTitle = category?.name || 'Nuestra Colección';
  const categoryDescription = category?.description || 'Descubre lo mejor en belleza y cuidado personal seleccionado exclusivamente para ti.';
  const categoryImage = category?.imageUrl || 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&q=80&w=2000';

  return (
    <Box sx={{ pb: { xs: 4, md: 15 } }}>
      {/* Category Hero Header */}
      <Box sx={{
        position: 'relative',
        height: { xs: '280px', sm: '350px', md: '400px' },
        mb: { xs: 4, md: 8 },
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden'
      }}>
        <Box sx={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `url(${categoryImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(to right, hsla(222, 47%, 13%, 0.9) 0%, hsla(222, 47%, 13%, 0.5) 60%, transparent 100%)',
          }
        }} />
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, color: 'white', px: { xs: 2, sm: 3, md: 4 } }}>
          <MotionWrapper>
            <PageBreadcrumb items={breadcrumbItems} sx={{ mb: { xs: 2, md: 4 }, '& .MuiBreadcrumbs-li, & .MuiBreadcrumbs-separator': { color: 'hsla(0, 0%, 100%, 0.7)' } }} />
            <Typography variant="h1" sx={{ color: 'white', mb: { xs: 1.5, md: 2 }, fontSize: { xs: '2rem', sm: '2.5rem', md: '4rem' }, lineHeight: 1.2 }}>
              {categoryTitle}
            </Typography>
            <Typography variant="h6" sx={{ color: 'hsla(0, 0%, 100%, 0.8)', maxWidth: '600px', fontWeight: 300, lineHeight: 1.6, fontSize: { xs: '0.9375rem', md: '1.25rem' } }}>
              {categoryDescription}
            </Typography>
          </MotionWrapper>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Mobile Filter Toggle */}
        {isMobile && (
          <Box sx={{ mb: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<SlidersHorizontal size={18} />}
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              sx={{ 
                borderRadius: '12px', 
                py: 1.5,
                justifyContent: 'space-between',
                px: 2,
              }}
            >
              <span>Filtrar y Ordenar</span>
              <Typography variant="caption" color="text.secondary">
                {products?.length || 0} productos
              </Typography>
            </Button>
          </Box>
        )}

        {/* Filters Section */}
        <MotionWrapper delay={0.2}>
          <GlassContainer sx={{
            p: { xs: 2, md: 3 },
            mb: { xs: 4, md: 6 },
            borderRadius: { xs: '16px', md: '24px' },
            display: showMobileFilters || !isMobile ? 'flex' : 'none',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 2, md: 3 },
            alignItems: { xs: 'stretch', md: 'center' },
            justifyContent: 'space-between'
          }}>
            <Box sx={{ display: 'flex', gap: { xs: 1.5, md: 2 }, width: { xs: '100%', md: 'auto' }, alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
                <Filter size={18} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>Filtrar</Typography>
                {!isMobile && <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />}
              </Box>
              <TextField
                placeholder="Buscar productos..."
                variant="outlined"
                size="small"
                fullWidth={isMobile}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search size={16} style={{ marginRight: 8, opacity: 0.5 }} />,
                }}
                sx={{
                  bgcolor: 'hsla(0, 0%, 0%, 0.04)',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '& fieldset': { border: 'none' },
                  },
                  minWidth: { md: 300 }
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: { xs: 1.5, md: 2 }, width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'space-between', md: 'flex-end' }, alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' } }}>
              {!isMobile && (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {products?.length || 0} Productos
                </Typography>
              )}
              <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
                <InputLabel sx={{ fontSize: '0.8rem' }}>Ordenar por</InputLabel>
                <Select
                  value={sortBy}
                  label="Ordenar por"
                  onChange={(e) => setSortBy(e.target.value)}
                  sx={{ borderRadius: '12px', bgcolor: 'white' }}
                >
                  <MenuItem value="name">Alfabeto (A-Z)</MenuItem>
                  <MenuItem value="price">Precio (Más bajo)</MenuItem>
                  <MenuItem value="createdAt">Novedades</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </GlassContainer>
        </MotionWrapper>

        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: '16px' }}>
            Hubo un error al cargar la colección. Por favor inténtalo de nuevo.
          </Alert>
        )}

        {productsLoading ? (
          <Box display="flex" justifyContent="center" py={12}>
            <CircularProgress color="secondary" />
          </Box>
        ) : (
          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
            {products?.map((product: Product, index: number) => {
              const isFavorite = favoriteProductIds?.includes(product.id) || false;
              return (
                <Grid size={{ xs: 6, sm: 6, md: 4, lg: 3 }} key={product.id}>
                  <MotionWrapper delay={index * 0.03}>
                    <Card sx={{
                      height: '100%',
                      p: { xs: 1, sm: 1.5 },
                      borderRadius: { xs: '20px', md: '32px' },
                      background: 'white',
                      transition: 'transform 0.3s ease',
                      '&:hover': { transform: { xs: 'none', md: 'translateY(-8px)' } }
                    }}>
                      <Box sx={{ position: 'relative', height: { xs: '160px', sm: '220px', md: '280px' }, borderRadius: { xs: '14px', md: '24px' }, overflow: 'hidden' }}>
                        {/* Out of Stock Badge */}
                        {product.inStock === false && (
                          <Box sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            bgcolor: 'rgba(0, 0, 0, 0.5)',
                            zIndex: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <Box sx={{
                              bgcolor: 'error.main',
                              color: 'white',
                              px: { xs: 1.5, sm: 2, md: 3 },
                              py: { xs: 0.5, sm: 0.75, md: 1 },
                              borderRadius: '8px',
                              transform: 'rotate(-15deg)',
                            }}>
                              <Typography sx={{ fontWeight: 800, fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.875rem' }, letterSpacing: '0.1em' }}>
                                AGOTADO
                              </Typography>
                            </Box>
                          </Box>
                        )}
                        {product.discountPercent > 0 && (
                          <GlassContainer sx={{
                            position: 'absolute', top: { xs: 8, md: 12 }, left: { xs: 8, md: 12 }, zIndex: 2,
                            px: { xs: 1, md: 1.5 }, py: { xs: 0.25, md: 0.5 }, borderRadius: '8px'
                          }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'error.main', fontSize: { xs: '0.65rem', md: '0.75rem' } }}>
                              -{product.discountPercent}%
                            </Typography>
                          </GlassContainer>
                        )}
                        <IconButton
                          onClick={(e) => handleFavoriteClick(e, product.id)}
                          sx={{
                            position: 'absolute', top: { xs: 6, md: 12 }, right: { xs: 6, md: 12 }, zIndex: 2,
                            bgcolor: 'white',
                            width: { xs: 32, md: 40 },
                            height: { xs: 32, md: 40 },
                            color: isFavorite ? 'error.main' : 'inherit',
                            '&:hover': { bgcolor: 'secondary.main', color: 'white' }
                          }}
                        >
                          <Heart size={isMobile ? 14 : 16} fill={isFavorite ? 'currentColor' : 'none'} />
                        </IconButton>
                        <IconButton
                          onClick={(e) => handleQuickAddToCart(e, product)}
                          disabled={product.inStock === false || isAddingToCart}
                          sx={{
                            position: 'absolute', bottom: { xs: 6, md: 12 }, right: { xs: 6, md: 12 }, zIndex: 2,
                            bgcolor: 'secondary.main',
                            width: { xs: 32, md: 40 },
                            height: { xs: 32, md: 40 },
                            color: 'white',
                            '&:hover': { bgcolor: 'secondary.dark' },
                            '&:disabled': { bgcolor: 'grey.400', color: 'grey.600' }
                          }}
                        >
                          <ShoppingCart size={isMobile ? 14 : 16} />
                        </IconButton>
                        <Link to={`/product/${product.slug}`} style={{ display: 'block', height: '100%' }}>
                          <CardMedia
                            component="img"
                            image={(product.images && product.images.length > 0) ? product.images[0].mediumUrl : 'https://via.placeholder.com/600x800?text=No+Image'}
                            alt={product.name}
                            sx={{ height: '100%', objectFit: 'cover' }}
                          />
                        </Link>
                      </Box>
                      <CardContent sx={{ px: { xs: 1, sm: 2 }, pt: { xs: 1.5, sm: 3 }, pb: { xs: 1, sm: 2 } }}>
                        <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', mb: 0.5, fontSize: { xs: '0.6rem', md: '0.75rem' } }}>
                          {product.brand || 'Colección'}
                        </Typography>
                        <Typography
                          variant="h6"
                          component={Link}
                          to={`/product/${product.slug}`}
                          sx={{
                            textDecoration: 'none',
                            color: 'primary.main',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            mb: { xs: 0.75, sm: 1.5 },
                            fontSize: { xs: '0.8125rem', sm: '1rem', md: '1.1rem' },
                            fontWeight: 600,
                            lineHeight: 1.3,
                            minHeight: { xs: '2.4em', md: 'auto' },
                            '&:hover': { color: 'secondary.main' }
                          }}
                        >
                          {product.name}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: '0.9375rem', sm: '1.1rem', md: '1.25rem' } }}>
                            ${product.finalPrice}
                          </Typography>
                          {product.discountPercent > 0 && (
                            <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary', opacity: 0.6, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                              ${product.basePrice}
                            </Typography>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </MotionWrapper>
                </Grid>
              );
            })}
          </Grid>
        )}

        {!productsLoading && products?.length === 0 && (
          <Box sx={{ textAlign: 'center', py: { xs: 6, md: 10 } }}>
            <Typography variant="h5" sx={{ mb: 2, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>No se encontraron productos</Typography>
            <Typography color="text.secondary" sx={{ fontSize: { xs: '0.9375rem', md: '1rem' } }}>Intenta ajustar tus filtros o buscar algo diferente.</Typography>
            <Button variant="text" onClick={() => setSearchQuery('')} sx={{ mt: 2 }}>Ver todo el catálogo</Button>
          </Box>
        )}
      </Container>

      {/* Snackbar for quick add to cart */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%', borderRadius: '12px' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
