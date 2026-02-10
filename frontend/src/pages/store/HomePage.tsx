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
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useFeaturedProducts, useCategories } from '../../hooks/useProducts';
import type { Product, Category } from '../../types';

export default function HomePage() {
  const { data: featuredProducts, isLoading: productsLoading, error: productsError } = useFeaturedProducts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          px: 4,
          textAlign: 'center',
          mb: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h2" gutterBottom>
          Bella Luna
        </Typography>
        <Typography variant="h5" gutterBottom>
          Tu tienda de confianza
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          component={Link}
          to="/category/all"
          sx={{ mt: 2 }}
        >
          Ver Productos
        </Button>
      </Box>

      {/* Categories */}
      <Typography variant="h4" gutterBottom>
        Categorías
      </Typography>
      {categoriesLoading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {categories?.map((category: Category) => (
            <Grid size={{ xs: 6, sm: 4, md: 3 }} key={category.id}>
              <Card component={Link} to={`/category/${category.slug}`} sx={{ textDecoration: 'none' }}>
                {category.imageUrl && (
                  <CardMedia
                    component="img"
                    height="140"
                    image={category.imageUrl}
                    alt={category.name}
                  />
                )}
                <CardContent>
                  <Typography variant="h6" noWrap>
                    {category.name}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Featured Products */}
      <Typography variant="h4" gutterBottom>
        Productos Destacados
      </Typography>
      {productsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error al cargar productos
        </Alert>
      )}
      {productsLoading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {featuredProducts?.map((product: Product) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
              <Card>
                {product.images[0] && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.images[0].mediumUrl}
                    alt={product.name}
                  />
                )}
                <CardContent>
                  <Typography variant="h6" noWrap gutterBottom>
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {product.brand}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" color="primary">
                      ${product.finalPrice}
                    </Typography>
                    {product.discountPercent > 0 && (
                      <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                        ${product.basePrice}
                      </Typography>
                    )}
                  </Box>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ mt: 2 }}
                    component={Link}
                    to={`/product/${product.slug}`}
                  >
                    Ver Detalle
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
