import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  CircularProgress,
  Button,
  Container,
  Stack,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Star, Heart, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { useCategories, useFeaturedProducts } from '../../hooks/useProducts';
import { useFavoriteProductIds, useAddToFavorites, useRemoveFromFavorites } from '../../hooks/useFavorites';
import { useCustomerAuth } from '../../hooks/useCustomerAuth';
import { useAddToCart } from '../../hooks/useCustomer';
import { MotionWrapper } from '../../components/store/MotionWrapper';
import { GlassContainer } from '../../components/shared/GlassContainer';
import type { Category, Product } from '../../types';

// Styles for Swiper
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const HERO_SLIDES = [
  {
    title: "Elegancia Natural",
    subtitle: "Descubre la armonía entre ciencia y naturaleza con nuestra nueva colección de Skincare.",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=75&w=1920&fm=webp",
  },
  {
    title: "Brillo Infinito",
    subtitle: "Maquillaje de alta gama para resaltar tu luz interior en cada momento.",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=75&w=1920&fm=webp",
  },
  {
    title: "Rituales de Spa",
    subtitle: "Transforma tu hogar en un santuario de relajación con nuestros productos exclusivos.",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=75&w=1920&fm=webp",
  },
  {
    title: "Belleza Luminosa",
    subtitle: "Ilumina tu piel con nuestra línea de productos radiantes y revitalizantes.",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=75&w=1920&fm=webp",
  },
  {
    title: "Cuidado Premium",
    subtitle: "Ingredientes de origen natural para resultados excepcionales en tu piel.",
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=75&w=1920&fm=webp",
  }
];

export default function HomePage() {
  const { data: featuredProducts, isLoading: productsLoading } = useFeaturedProducts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
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
      window.location.href = '/login';
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

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Hero Section with Swiper */}
      <Box sx={{ position: 'relative', height: '50vh', mb: 12 }}>
        <Swiper
          modules={[Autoplay, Pagination, EffectFade]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          loop
          style={{ height: '100%' }}
        >
          {HERO_SLIDES.map((slide, index) => (
            <SwiperSlide key={index}>
              <Box sx={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: `url(${slide.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0,
                      background: 'linear-gradient(90deg, hsla(222, 47%, 13%, 0.4) 0%, hsla(222, 47%, 13%, 0.1) 100%)',
                      zIndex: 1
                    }
                  }}
                />
                <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
                  <Box
                    sx={{
                      maxWidth: { xs: '100%', md: '650px' },
                      textAlign: 'left',
                      color: 'white',
                      p: { xs: 4, md: 6 },
                      borderRadius: '40px',
                      background: 'linear-gradient(135deg, hsla(222, 47%, 13%, 0.7) 0%, hsla(222, 47%, 13%, 0.4) 100%)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid hsla(0, 0%, 100%, 0.1)',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Typography variant="overline" sx={{ letterSpacing: { xs: '0.2em', md: '0.4em' }, mb: { xs: 1, md: 2 }, display: 'block', color: 'secondary.light', fontWeight: 700, fontSize: { xs: '0.65rem', md: '0.75rem' } }}>
                        Colección Exclusiva 2026
                      </Typography>
                      <Typography variant="h1" sx={{ mb: { xs: 2, md: 3 }, lineHeight: 1.1, fontSize: { xs: '2rem', sm: '2.5rem', md: '4.5rem' } }}>
                        {slide.title}
                      </Typography>
                      <Typography variant="h5" sx={{ mb: { xs: 3, md: 5 }, opacity: 0.95, lineHeight: 1.6, fontWeight: 300, fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}>
                        {slide.subtitle}
                      </Typography>
                      <Stack direction="row" spacing={3}>
                        <Button
                          variant="contained"
                          color="secondary"
                          size="large"
                          component={Link}
                          to="/category/all"
                          endIcon={<ArrowRight size={18} />}
                          sx={{
                            px: { xs: 3, sm: 5 },
                            py: { xs: 1, sm: 2 },
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                            borderRadius: '50px',
                            boxShadow: '0 10px 20px -5px hsla(20, 31%, 55%, 0.5)'
                          }}
                        >
                          Explorar
                        </Button>
                      </Stack>
                    </motion.div>
                  </Box>
                </Container>
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>

      {/* Categories Modern Grid */}
      <Container maxWidth="xl" sx={{ mb: 15 }}>
        <MotionWrapper>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 600, letterSpacing: '0.2em', fontSize: { xs: '0.7rem', md: '0.75rem' } }}>
              Nuestras Líneas
            </Typography>
            <Typography variant="h2" sx={{ mt: 1, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' } }}>Experiencias de Belleza</Typography>
          </Box>
        </MotionWrapper>

        {categoriesLoading ? (
          <Box display="flex" justifyContent="center" py={4}><CircularProgress color="secondary" /></Box>
        ) : (
          <Grid container spacing={4}>
            {categories?.map((category: Category, index: number) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={category.id}>
                <MotionWrapper delay={index * 0.1}>
                  <Card
                    component={Link}
                    to={`/category/${category.slug}`}
                    sx={{
                      height: { xs: '280px', sm: '350px', md: '450px' },
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      p: { xs: 2, sm: 2.5, md: 3 },
                      textDecoration: 'none',
                      borderRadius: '32px',
                      '&:hover .cat-img': { transform: 'scale(1.1)' },
                      '&:hover .cat-overlay': { opacity: 0.6 }
                    }}
                  >
                    <Box
                      className="cat-img"
                      sx={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundImage: `url(${category.imageUrl || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=1000'})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        transition: 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    />
                    <Box
                      className="cat-overlay"
                      sx={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'linear-gradient(to top, hsla(222, 47%, 13%, 0.9) 0%, transparent 60%)',
                        transition: 'opacity 0.4s ease',
                      }}
                    />
                    <Box sx={{ position: 'relative', zIndex: 1, color: 'white' }}>
                      <Typography variant="h4" sx={{ mb: 1, fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2.125rem' } }}>{category.name}</Typography>
                      <Button variant="text" color="inherit" sx={{ p: 0, letterSpacing: '0.05em', fontSize: { xs: '0.65rem', sm: '0.75rem' }, opacity: 0.8 }}>
                        Ver <ArrowRight size={12} style={{ marginLeft: 4 }} />
                      </Button>
                    </Box>
                  </Card>
                </MotionWrapper>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Featured Products - Luxury Grid */}
      <Box sx={{ bgcolor: 'hsla(222, 47%, 11%, 0.02)', py: 15 }}>
        <Container maxWidth="xl">
          <MotionWrapper>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 8 }}>
              <Box>
                <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 600, letterSpacing: '0.2em' }}>
                  Selección Especial
                </Typography>
                <Typography variant="h2" sx={{ mt: 1, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>Favoritos de la Luna</Typography>
              </Box>
              <Button component={Link} to="/category/all" color="primary" sx={{ mb: 1 }}>
                Ver catálogo completo
              </Button>
            </Box>
          </MotionWrapper>

          {productsLoading ? (
            <Box display="flex" justifyContent="center" py={8}><CircularProgress color="secondary" /></Box>
          ) : (
            <Grid container spacing={5}>
              {featuredProducts?.map((product: Product, index: number) => {
                const isFavorite = favoriteProductIds?.includes(product.id) || false;
                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
                    <MotionWrapper delay={index * 0.1}>
                      <Card sx={{
                        height: '100%',
                        p: 1.5,
                        borderRadius: '40px',
                        background: 'white',
                      }}>
                        <Box sx={{ position: 'relative', height: { xs: '200px', sm: '250px', md: '320px' }, borderRadius: '32px', overflow: 'hidden' }}>
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
                                px: { xs: 2, sm: 3 },
                                py: { xs: 0.75, sm: 1 },
                                borderRadius: '8px',
                                transform: 'rotate(-15deg)',
                              }}>
                                <Typography sx={{ fontWeight: 800, fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }, letterSpacing: '0.1em' }}>
                                  AGOTADO
                                </Typography>
                              </Box>
                            </Box>
                          )}
                          {product.discountPercent > 0 && (
                            <GlassContainer sx={{
                              position: 'absolute', top: { xs: 8, sm: 12, md: 16 }, left: { xs: 8, sm: 12, md: 16 }, zIndex: 2,
                              px: 1, py: 0.25, borderRadius: '8px'
                            }}>
                              <Typography variant="caption" sx={{ fontWeight: 800, color: 'error.main', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                                -{product.discountPercent}%
                              </Typography>
                            </GlassContainer>
                          )}
                          <IconButton
                            onClick={(e) => handleFavoriteClick(e, product.id)}
                            sx={{
                              position: 'absolute', top: { xs: 8, sm: 12, md: 16 }, right: { xs: 8, sm: 12, md: 16 }, zIndex: 2,
                              bgcolor: 'white',
                              width: { xs: 36, sm: 40, md: 44 },
                              height: { xs: 36, sm: 40, md: 44 },
                              color: isFavorite ? 'error.main' : 'inherit',
                              '&:hover': { bgcolor: 'secondary.main', color: 'white' }
                            }}
                          >
                            <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
                          </IconButton>
                          <IconButton
                            onClick={(e) => handleQuickAddToCart(e, product)}
                            disabled={product.inStock === false || isAddingToCart}
                            sx={{
                              position: 'absolute', bottom: { xs: 8, sm: 12, md: 16 }, right: { xs: 8, sm: 12, md: 16 }, zIndex: 2,
                              bgcolor: 'secondary.main',
                              width: { xs: 36, sm: 40, md: 44 },
                              height: { xs: 36, sm: 40, md: 44 },
                              color: 'white',
                              '&:hover': { bgcolor: 'secondary.dark' },
                              '&:disabled': { bgcolor: 'grey.400', color: 'grey.600' }
                            }}
                          >
                            <ShoppingCart size={16} />
                          </IconButton>
                          <Link to={`/product/${product.slug}`}>
                            <CardMedia
                              component="img"
                              image={(product.images && product.images.length > 0) ? product.images[0].mediumUrl : 'https://via.placeholder.com/600x800?text=No+Image'}
                              alt={product.name}
                              sx={{ height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease', '&:hover': { transform: 'scale(1.05)' } }}
                            />
                          </Link>
                        </Box>
                        <CardContent sx={{ px: { xs: 1.5, sm: 2 }, pt: { xs: 2, sm: 3 }, pb: { xs: 1.5, sm: 2 } }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                            <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>
                              {product.brand || 'Luxury'}
                            </Typography>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <Star size={12} fill="#EAB308" stroke="none" />
                              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>4.9</Typography>
                            </Stack>
                          </Stack>
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
                              mb: { xs: 1, sm: 2 },
                              fontSize: { xs: '0.95rem', sm: '1.15rem', md: '1.25rem' },
                              fontWeight: 600,
                              lineHeight: 1.3
                            }}
                          >
                            {product.name}
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="h5" sx={{ fontWeight: 800, fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}>
                              {formatCurrency(product.finalPrice)}
                            </Typography>
                            {product.discountPercent > 0 && (
                              <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary', opacity: 0.6, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                {formatCurrency(product.basePrice)}
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
        </Container>
      </Box>

      {/* Luxury Value Proposition */}
      <Container maxWidth="lg" sx={{ py: 20 }}>
        <Grid container spacing={10} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <MotionWrapper>
              <Box sx={{ position: 'relative' }}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: -20, left: -20, width: '100%', height: '100%',
                    border: '1px solid', borderColor: 'secondary.main',
                    borderRadius: '40px', zIndex: 0
                  }}
                />
                <CardMedia
                  component="img"
                  image="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=1000"
                  sx={{ borderRadius: '40px', position: 'relative', zIndex: 1 }}
                />
              </Box>
            </MotionWrapper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <MotionWrapper delay={0.2}>
              <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 600, letterSpacing: '0.2em' }}>
                Nuestro Compromiso
              </Typography>
              <Typography variant="h2" sx={{ mt: 2, mb: 4, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' } }}>Belleza con Propósito</Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1.1rem', lineHeight: 1.8, mb: 4 }}>
                En Bella Luna, creemos que la belleza es una expresión de bienestar. Seleccionamos cuidadosamente cada producto para garantizar resultados excepcionales sin comprometer la salud de tu piel ni el medio ambiente.
              </Typography>
              <Stack spacing={3}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ p: 1.5, bgcolor: 'secondary.light', borderRadius: '12px', color: 'white' }}><Sparkles size={20} /></Box>
                  <Typography variant="h6">Ingredientes Premium</Typography>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ p: 1.5, bgcolor: 'primary.light', borderRadius: '12px', color: 'white' }}><Star size={20} /></Box>
                  <Typography variant="h6">Resultados Comprobados</Typography>
                </Stack>
              </Stack>
            </MotionWrapper>
          </Grid>
        </Grid>
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
