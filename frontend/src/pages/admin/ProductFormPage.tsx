import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Paper,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAdminProduct, useAdminCategories, useCreateProduct, useUpdateProduct } from '../../hooks/useAdmin';
import type { Category } from '../../types';

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const { data: product, isLoading: productLoading } = useAdminProduct(id || '');
  const { data: categories, isLoading: categoriesLoading } = useAdminCategories();
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    brand: '',
    baseCost: 0,
    basePrice: 0,
    discountPercent: 0,
    trackStock: true,
    isActive: true,
    categoryIds: [] as string[],
    attributeIds: [] as string[],
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing && product) {
      setFormData({
        sku: product.sku,
        name: product.name,
        description: product.description || '',
        brand: product.brand || '',
        baseCost: product.baseCost,
        basePrice: product.basePrice,
        discountPercent: product.discountPercent || 0,
        trackStock: product.trackStock,
        isActive: product.isActive,
        categoryIds: product.categories?.map(c => c.category.id) || [],
        attributeIds: product.attributes?.map(a => a.attribute.id) || [],
      });
    }
  }, [isEditing, product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isEditing && id) {
        await updateProduct({ id, data: formData });
      } else {
        await createProduct(formData);
      }
      navigate('/admin/products');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      setError(error.response?.data?.error?.message || 'Error al guardar producto');
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (productLoading || categoriesLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/products')}
          sx={{ mr: 2 }}
        >
          Volver
        </Button>
        <Typography variant="h4">
          {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="SKU"
                value={formData.sku}
                onChange={(e) => handleChange('sku', e.target.value)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Nombre"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Descripción"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Marca"
                value={formData.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Costo Base"
                type="number"
                value={formData.baseCost}
                onChange={(e) => handleChange('baseCost', Number(e.target.value))}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Precio Base"
                type="number"
                value={formData.basePrice}
                onChange={(e) => handleChange('basePrice', Number(e.target.value))}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Descuento (%)"
                type="number"
                value={formData.discountPercent}
                onChange={(e) => handleChange('discountPercent', Number(e.target.value))}
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Categorías</InputLabel>
                <Select
                  multiple
                  value={formData.categoryIds}
                  onChange={(e) => handleChange('categoryIds', e.target.value)}
                  label="Categorías"
                >
                  {categories?.map((category: Category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.trackStock}
                    onChange={(e) => handleChange('trackStock', e.target.checked)}
                  />
                }
                label="Controlar Stock"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => handleChange('isActive', e.target.checked)}
                  />
                }
                label="Activo"
              />
            </Grid>
          </Grid>

          <Box display="flex" gap={2} mt={3}>
            <Button
              type="submit"
              variant="contained"
              disabled={isCreating || isUpdating}
            >
              {isCreating || isUpdating ? (
                <CircularProgress size={24} />
              ) : isEditing ? (
                'Actualizar'
              ) : (
                'Crear'
              )}
            </Button>
            <Button
              type="button"
              onClick={() => navigate('/admin/products')}
            >
              Cancelar
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}