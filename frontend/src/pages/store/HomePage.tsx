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
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Star, Heart } from 'lucide-react';
import { useCategories, useFeaturedProducts } from '../../hooks/useProducts';
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
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80&w=2000",
  },
  {
    title: "Brillo Infinito",
    subtitle: "Maquillaje de alta gama para resaltar tu luz interior en cada momento.",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=2000",
  }
];

export default function HomePage() {
  const { data: featuredProducts, isLoading: productsLoading } = useFeaturedProducts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Hero Section with Swiper */}
      <Box sx={{ position: 'relative', height: { xs: '70vh', md: '90vh' }, mb: 12 }}>
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
                      <Typography variant="overline" sx={{ letterSpacing: '0.4em', mb: 2, display: 'block', color: 'secondary.light', fontWeight: 700 }}>
                        Colección Exclusiva 2026
                      </Typography>
                      <Typography variant="h1" sx={{ mb: 3, lineHeight: 1.1, fontSize: { xs: '3rem', md: '4.5rem' } }}>
                        {slide.title}
                      </Typography>
                      <Typography variant="h5" sx={{ mb: 5, opacity: 0.95, lineHeight: 1.6, fontWeight: 300 }}>
                        {slide.subtitle}
                      </Typography>
                      <Stack direction="row" spacing={3}>
                        <Button
                          variant="contained"
                          color="secondary"
                          size="large"
                          component={Link}
                          to="/category/all"
                          endIcon={<ArrowRight />}
                          sx={{
                            px: 5,
                            py: 2,
                            borderRadius: '50px',
                            boxShadow: '0 10px 20px -5px hsla(20, 31%, 55%, 0.5)'
                          }}
                        >
                          Explorar Ahora
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
            <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 600, letterSpacing: '0.2em' }}>
              Nuestras Líneas
            </Typography>
            <Typography variant="h2" sx={{ mt: 1 }}>Experiencias de Belleza</Typography>
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
                      height: '450px',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      p: 3,
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
                      <Typography variant="h4" sx={{ mb: 1 }}>{category.name}</Typography>
                      <Button variant="text" color="inherit" sx={{ p: 0, letterSpacing: '0.1em', fontSize: '0.75rem', opacity: 0.8 }}>
                        Ver Colección <ArrowRight size={14} style={{ marginLeft: 8 }} />
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
                <Typography variant="h2" sx={{ mt: 1 }}>Favoritos de la Luna</Typography>
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
              {featuredProducts?.map((product: Product, index: number) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
                  <MotionWrapper delay={index * 0.1}>
                    <Card sx={{
                      height: '100%',
                      p: 1.5,
                      borderRadius: '40px',
                      background: 'white',
                    }}>
                      <Box sx={{ position: 'relative', height: '320px', borderRadius: '32px', overflow: 'hidden' }}>
                        {product.discountPercent > 0 && (
                          <GlassContainer sx={{
                            position: 'absolute', top: 16, left: 16, zIndex: 2,
                            px: 1.5, py: 0.5, borderRadius: '12px'
                          }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'error.main' }}>
                              -{product.discountPercent}%
                            </Typography>
                          </GlassContainer>
                        )}
                        <IconButton
                          sx={{
                            position: 'absolute', top: 16, right: 16, zIndex: 2,
                            bgcolor: 'white', '&:hover': { bgcolor: 'secondary.main', color: 'white' }
                          }}
                        >
                          <Heart size={18} />
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
                      <CardContent sx={{ px: 2, pt: 3 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                          <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                            {product.brand || 'Luxury'}
                          </Typography>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <Star size={12} fill="#EAB308" stroke="none" />
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>4.9</Typography>
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
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            mb: 2,
                            fontSize: '1.25rem',
                            fontWeight: 600,
                          }}
                        >
                          {product.name}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Typography variant="h5" sx={{ fontWeight: 800 }}>
                            ${product.finalPrice}
                          </Typography>
                          {product.discountPercent > 0 && (
                            <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary', opacity: 0.6 }}>
                              ${product.basePrice}
                            </Typography>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </MotionWrapper>
                </Grid>
              ))}
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
              <Typography variant="h2" sx={{ mt: 2, mb: 4 }}>Belleza con Propósito</Typography>
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
    </Box>
  );
}
