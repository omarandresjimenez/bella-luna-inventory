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
  Chip,
  IconButton,
  Tabs,
  Tab,
  AlertTitle,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { 
  useAdminProduct, 
  useAdminCategories, 
  useAdminAttributes,
  useCreateProduct, 
  useUpdateProduct 
} from '../../hooks/useAdmin';
import VariantManagerDialog from '../../components/admin/VariantManagerDialog';
import type { Category, Attribute } from '../../types';

interface ProductAttribute {
  attributeId: string;
  value: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [activeTab, setActiveTab] = useState(0);

  const { data: product, isLoading: productLoading } = useAdminProduct(id || '');
  const { data: categories, isLoading: categoriesLoading } = useAdminCategories();
  const { data: attributes, isLoading: attributesLoading } = useAdminAttributes();
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
    stock: 0,  // Stock for products without variants
    isActive: true,
    categoryIds: [] as string[],
    staticAttributes: [] as ProductAttribute[],
    variantAttributeIds: [] as string[],
  });

  const [isVariantManagerOpen, setIsVariantManagerOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Only initialize once when product data first loads
    // Don't re-initialize when variant manager closes (would overwrite local changes)
    if (isEditing && product && !isInitialized) {
      // Separate static attributes from variant attributes
      const staticAttrs: ProductAttribute[] = [];
      const variantAttrIds: string[] = [];

      product.attributes?.forEach((attr) => {
        if (attr.value) {
          // Has a value = static attribute
          staticAttrs.push({
            attributeId: attr.attribute.id,
            value: attr.value,
          });
        } else {
          // No value = variant attribute
          variantAttrIds.push(attr.attribute.id);
        }
      });

      setFormData({
        sku: product.sku,
        name: product.name,
        description: product.description || '',
        brand: product.brand || '',
        baseCost: product.baseCost,
        basePrice: product.basePrice,
        discountPercent: product.discountPercent || 0,
        trackStock: product.trackStock,
        stock: product.stock || 0,
        isActive: product.isActive,
        categoryIds: product.categories?.map(c => c.category.id) || [],
        staticAttributes: staticAttrs,
        variantAttributeIds: variantAttrIds,
      });
      
      setIsInitialized(true);
    }
  }, [isEditing, product, isInitialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Combine static and variant attributes for the API
      const combinedAttributes = [
        ...formData.staticAttributes.map(attr => ({
          attributeId: attr.attributeId,
          value: attr.value,
        })),
        ...formData.variantAttributeIds.map(attrId => ({
          attributeId: attrId,
          value: undefined, // Variant attributes don't have values at product level
        })),
      ];

      const submitData: any = {
        sku: formData.sku,
        name: formData.name,
        description: formData.description,
        brand: formData.brand,
        baseCost: formData.baseCost,
        basePrice: formData.basePrice,
        discountPercent: formData.discountPercent,
        trackStock: formData.trackStock,
        stock: formData.stock,  // Stock for products without variants
        isActive: formData.isActive,
        categoryIds: formData.categoryIds,
        attributes: combinedAttributes,
      };

      if (isEditing && id) {
        const result = await updateProduct({ id, data: submitData });
        
        // Optimistic update: immediately update form state with returned data
        // This prevents the UI from losing data while waiting for cache refetch
        if ((result as any)?.attributes) {
          const staticAttrs: ProductAttribute[] = [];
          const variantAttrIds: string[] = [];

          (result as any).attributes.forEach((attr: any) => {
            if (attr.value) {
              staticAttrs.push({
                attributeId: attr.attribute.id,
                value: attr.value,
              });
            } else {
              variantAttrIds.push(attr.attribute.id);
            }
          });

          // Update form data immediately with fresh attributes
          setFormData((prev) => ({
            ...prev,
            staticAttributes: staticAttrs,
            variantAttributeIds: variantAttrIds,
          }));

          setSuccess('Producto actualizado exitosamente');
        }
      } else {
        await createProduct(submitData);
        navigate('/admin/products');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      setError(error.response?.data?.error?.message || 'Error al guardar producto');
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddStaticAttribute = (attributeId: string) => {
    if (!formData.staticAttributes.find(pa => pa.attributeId === attributeId)) {
      setFormData({
        ...formData,
        staticAttributes: [...formData.staticAttributes, { attributeId, value: '' }],
      });
    }
  };

  const handleRemoveStaticAttribute = (attributeId: string) => {
    setFormData({
      ...formData,
      staticAttributes: formData.staticAttributes.filter(pa => pa.attributeId !== attributeId),
    });
  };

  const handleStaticAttributeValueChange = (attributeId: string, value: string) => {
    setFormData({
      ...formData,
      staticAttributes: formData.staticAttributes.map(pa => 
        pa.attributeId === attributeId ? { ...pa, value } : pa
      ),
    });
  };

  const handleToggleVariantAttribute = (attributeId: string) => {
    const isSelected = formData.variantAttributeIds.includes(attributeId);
    if (isSelected) {
      setFormData({
        ...formData,
        variantAttributeIds: formData.variantAttributeIds.filter(id => id !== attributeId),
      });
    } else {
      setFormData({
        ...formData,
        variantAttributeIds: [...formData.variantAttributeIds, attributeId],
      });
    }
  };

  const getAttributeName = (attributeId: string) => {
    const attr = attributes?.find(a => a.id === attributeId);
    return attr?.displayName || attr?.name || attributeId;
  };

  const getAttributeType = (attributeId: string) => {
    const attr = attributes?.find(a => a.id === attributeId);
    return attr?.type || 'TEXT';
  };

  // Filter attributes that have values defined (can be used for variants)
  const variantCapableAttributes = attributes?.filter(
    (attr) => attr.values && attr.values.length > 0
  ) || [];

  // Filter attributes for static info (TEXT type recommended)
  const staticAttributes = attributes?.filter(
    (attr) => !formData.variantAttributeIds.includes(attr.id)
  ) || [];

  if (productLoading || categoriesLoading || attributesLoading) {
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

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Información Básica" />
          <Tab label="Atributos" />
          {isEditing && <Tab label="Variantes" />}
        </Tabs>

        <form onSubmit={handleSubmit}>
          {/* Tab 1: Basic Information */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="SKU"
                  value={formData.sku}
                  onChange={(e) => handleChange('sku', e.target.value)}
                  required
                  helperText="Código único del producto"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Nombre del Producto"
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
                  helperText="Describe las características principales del producto"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Marca"
                  value={formData.brand}
                  onChange={(e) => handleChange('brand', e.target.value)}
                  helperText="Marca o fabricante del producto"
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
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((value) => {
                          const cat = categories?.find((c: Category) => c.id === value);
                          return <Chip key={value} label={cat?.name || value} size="small" />;
                        })}
                      </Box>
                    )}
                  >
                    {categories?.map((category: Category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Costo Base"
                  type="number"
                  value={formData.baseCost}
                  onChange={(e) => handleChange('baseCost', Number(e.target.value))}
                  required
                  helperText="Precio de compra"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Precio Base"
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) => handleChange('basePrice', Number(e.target.value))}
                  required
                  helperText="Precio de venta al público"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
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
              {/* Stock field for products without variants */}
              {formData.trackStock && formData.variantAttributeIds.length === 0 && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => handleChange('stock', Number(e.target.value))}
                    inputProps={{ min: 0 }}
                    helperText="Stock para productos sin variantes"
                  />
                </Grid>
              )}
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => handleChange('isActive', e.target.checked)}
                    />
                  }
                  label="Producto Activo"
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button
                type="button"
                variant="outlined"
                onClick={() => setActiveTab(1)}
              >
                Siguiente: Atributos
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isCreating || isUpdating}
              >
                {isCreating || isUpdating ? (
                  <CircularProgress size={24} />
                ) : isEditing ? (
                  'Guardar Cambios'
                ) : (
                  'Crear Producto'
                )}
              </Button>
            </Box>
          </TabPanel>

          {/* Tab 2: Attributes */}
          <TabPanel value={activeTab} index={1}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <AlertTitle>Tipos de Atributos</AlertTitle>
              <strong>Información del Producto:</strong> Datos estáticos como material, origen, etc.<br />
              <strong>Atributos de Variante:</strong> Opciones que el cliente puede elegir como color, tamaño, etc.
            </Alert>

            <Grid container spacing={4}>
              {/* Static Product Info Attributes */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h6" gutterBottom>
                  Información del Producto
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Estos atributos se muestran como información estática en la página del producto.
                </Typography>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Agregar Información</InputLabel>
                  <Select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddStaticAttribute(e.target.value);
                      }
                    }}
                    label="Agregar Información"
                  >
                    <MenuItem value="">
                      <em>Seleccionar atributo...</em>
                    </MenuItem>
                    {staticAttributes.map((attr: Attribute) => (
                      <MenuItem key={attr.id} value={attr.id}>
                        {attr.displayName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {formData.staticAttributes.length > 0 && (
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    {formData.staticAttributes.map((pa) => (
                      <Box key={pa.attributeId} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                          fullWidth
                          label={getAttributeName(pa.attributeId)}
                          value={pa.value}
                          onChange={(e) => handleStaticAttributeValueChange(pa.attributeId, e.target.value)}
                          placeholder={`Ej: ${getAttributeType(pa.attributeId) === 'COLOR_HEX' ? '#FF0000' : 'Valor descriptivo'}`}
                          helperText="Este texto se mostrará en la página del producto"
                        />
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveStaticAttribute(pa.attributeId)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}
                  </Paper>
                )}
              </Grid>

              {/* Variant Attributes */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h6" gutterBottom>
                  Atributos de Variante
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Selecciona los atributos que el cliente podrá elegir (color, tamaño, etc.)
                </Typography>

                {variantCapableAttributes.length === 0 ? (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    No hay atributos con valores definidos. Crea atributos con valores primero.
                  </Alert>
                ) : (
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    {variantCapableAttributes.map((attr) => {
                      const isSelected = formData.variantAttributeIds.includes(attr.id);
                      return (
                        <Box
                          key={attr.id}
                          onClick={() => handleToggleVariantAttribute(attr.id)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1.5,
                            mb: 1,
                            borderRadius: 1,
                            cursor: 'pointer',
                            bgcolor: isSelected ? 'primary.light' : 'background.paper',
                            color: isSelected ? 'primary.contrastText' : 'text.primary',
                            border: '1px solid',
                            borderColor: isSelected ? 'primary.main' : 'divider',
                            '&:hover': {
                              bgcolor: isSelected ? 'primary.main' : 'action.hover',
                            },
                          }}
                        >
                          <Box>
                            <Typography variant="body1" fontWeight={isSelected ? 600 : 400}>
                              {attr.displayName}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                              {attr.values?.length || 0} opciones disponibles
                            </Typography>
                          </Box>
                          {isSelected && (
                            <Chip 
                              label="Seleccionado" 
                              size="small" 
                              color="primary"
                              sx={{ bgcolor: 'white', color: 'primary.main' }}
                            />
                          )}
                        </Box>
                      );
                    })}
                  </Paper>
                )}

                {isEditing && formData.variantAttributeIds.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<EditIcon />}
                      onClick={() => setIsVariantManagerOpen(true)}
                    >
                      Gestionar Variantes ({formData.variantAttributeIds.length} atributos seleccionados)
                    </Button>
                  </Box>
                )}
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button
                type="button"
                variant="outlined"
                onClick={() => setActiveTab(0)}
              >
                Anterior: Básico
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isCreating || isUpdating}
              >
                {isCreating || isUpdating ? (
                  <CircularProgress size={24} />
                ) : isEditing ? (
                  'Guardar Cambios'
                ) : (
                  'Crear Producto'
                )}
              </Button>
            </Box>
          </TabPanel>

          {/* Tab 3: Variants (Edit only) */}
          {isEditing && (
            <TabPanel value={activeTab} index={2}>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Gestión de Variantes
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {formData.variantAttributeIds.length > 0 
                    ? `Tienes ${formData.variantAttributeIds.length} atributo(s) de variante seleccionado(s)`
                    : 'No has seleccionado atributos de variante. Ve a la pestaña "Atributos" para seleccionarlos.'
                  }
                </Typography>
                {formData.variantAttributeIds.length > 0 && (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<EditIcon />}
                    onClick={() => setIsVariantManagerOpen(true)}
                  >
                    Abrir Gestor de Variantes
                  </Button>
                )}
              </Box>
            </TabPanel>
          )}
        </form>
      </Paper>

      {/* Variant Manager Dialog */}
      {isEditing && id && (
        <VariantManagerDialog
          open={isVariantManagerOpen}
          onClose={() => setIsVariantManagerOpen(false)}
          productId={id}
          productPrice={formData.basePrice}
          selectedAttributeIds={formData.variantAttributeIds}
          attributes={attributes || []}
        />
      )}
    </Box>
  );
}
