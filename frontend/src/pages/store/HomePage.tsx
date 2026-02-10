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
  Container,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useFeaturedProducts, useCategories } from '../../hooks/useProducts';
import type { Product, Category } from '../../types';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function HomePage() {
  const { data: featuredProducts, isLoading: productsLoading, error: productsError } = useFeaturedProducts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          borderRadius: 4,
          overflow: 'hidden',
          mb: 8,
          mt: 2,
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h2"
            sx={{
              mb: 2,
              fontWeight: 800,
              fontSize: { xs: '2.5rem', md: '4rem' },
              textShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}
          >
            Bella Luna
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              opacity: 0.9,
              fontWeight: 400,
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            Elegancia y calidad en cada detalle. Descubre nuestra colección exclusiva.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            component={Link}
            to="/category/all"
            endIcon={<ArrowForwardIcon />}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              borderRadius: '50px'
            }}
          >
            Explorar Colección
          </Button>
        </Container>
      </Box>

      {/* Categories Section */}
      <Box sx={{ mb: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Categorías
          </Typography>
        </Box>

        {categoriesLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {categories?.map((category: Category) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={category.id}>
                <Card
                  component={Link}
                  to={`/category/${category.slug}`}
                  sx={{
                    textDecoration: 'none',
                    position: 'relative',
                    height: '160px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    overflow: 'hidden',
                    '&:hover .bg-image': { transform: 'scale(1.1)' }
                  }}
                >
                  <Box
                    className="bg-image"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: category.imageUrl ? `url(${category.imageUrl})` : 'linear-gradient(135deg, #E2E8F0 0%, #CBD5E1 100%)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      transition: 'transform 0.4s ease-out',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '70%',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                    }}
                  />
                  <CardContent sx={{ position: 'relative', zIndex: 1, color: 'white' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {category.name}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Featured Products Section */}
      <Box sx={{ mb: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Productos Destacados
          </Typography>
          <Button component={Link} to="/category/all" color="primary">
            Ver todos
          </Button>
        </Box>

        {productsError && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
            Error al cargar productos
          </Alert>
        )}

        {productsLoading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {featuredProducts?.map((product: Product) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ position: 'relative' }}>
                    {product.discountPercent > 0 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          bgcolor: 'error.main',
                          color: 'white',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          zIndex: 2,
                        }}
                      >
                        -{product.discountPercent}%
                      </Box>
                    )}
                    <Link to={`/product/${product.slug}`}>
                      <CardMedia
                        component="img"
                        height="260"
                        image={(product.images && product.images.length > 0) ? product.images[0].mediumUrl : 'https://via.placeholder.com/300x400?text=No+Image'}
                        alt={product.name}
                        sx={{ objectFit: 'cover' }}
                      />
                    </Link>
                  </Box>
                  <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                      {product.brand || 'Colección'}
                    </Typography>
                    <Typography
                      variant="h6"
                      component={Link}
                      to={`/product/${product.slug}`}
                      sx={{
                        textDecoration: 'none',
                        color: 'text.primary',
                        display: 'block',
                        mb: 1,
                        fontSize: '1rem',
                        fontWeight: 600,
                        '&:hover': { color: 'secondary.main' }
                      }}
                    >
                      {product.name}
                    </Typography>

                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                        ${product.finalPrice}
                      </Typography>
                      {product.discountPercent > 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                          ${product.basePrice}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      component={Link}
                      to={`/product/${product.slug}`}
                      sx={{ borderRadius: 2 }}
                    >
                      Detalles
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
}
