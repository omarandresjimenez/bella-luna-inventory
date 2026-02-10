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
} from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useProductsByCategory, useCategory } from '../../hooks/useProducts';
import type { Product } from '../../types';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [sortBy, setSortBy] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');

  const isAll = slug === 'all';
  const { data: category, isLoading: categoryLoading } = useCategory(isAll ? '' : (slug || ''));
  const { data: products, isLoading: productsLoading, error } = useProductsByCategory(
    isAll ? '' : (slug || ''),
    {
      sortBy,
      search: searchQuery || undefined,
    }
  );

  if (categoryLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {category?.name || 'Productos'}
      </Typography>
      {category?.description && (
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {category.description}
        </Typography>
      )}

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          label="Buscar"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Ordenar por</InputLabel>
          <Select value={sortBy} label="Ordenar por" onChange={(e) => setSortBy(e.target.value)}>
            <MenuItem value="name">Nombre</MenuItem>
            <MenuItem value="price">Precio</MenuItem>
            <MenuItem value="createdAt">Más recientes</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
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
          {products?.map((product: Product) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Link to={`/product/${product.slug}`}>
                  <CardMedia
                    component="img"
                    height="240"
                    image={(product.images && product.images.length > 0) ? product.images[0].mediumUrl : 'https://via.placeholder.com/300x400?text=No+Image'}
                    alt={product.name}
                    sx={{ objectFit: 'cover' }}
                  />
                </Link>
                <CardContent sx={{ flexGrow: 1 }}>
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
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ mt: 2, borderRadius: 2 }}
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

      {!productsLoading && products?.length === 0 && (
        <Alert severity="info">No se encontraron productos en esta categoría</Alert>
      )}
    </Box>
  );
}
