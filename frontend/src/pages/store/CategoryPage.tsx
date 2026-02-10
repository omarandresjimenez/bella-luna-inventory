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

  const { data: category, isLoading: categoryLoading } = useCategory(slug || '');
  const { data: products, isLoading: productsLoading, error } = useProductsByCategory(
    slug || '',
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

      {!productsLoading && products?.length === 0 && (
        <Alert severity="info">No se encontraron productos en esta categoría</Alert>
      )}
    </Box>
  );
}
