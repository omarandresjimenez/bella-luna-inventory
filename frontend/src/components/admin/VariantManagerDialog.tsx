import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  Alert,
  Switch,
  FormControlLabel,
  Tooltip,
  Divider,
} from '@mui/material';
import ConfirmDialog from '../shared/ConfirmDialog';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import {
  useProductVariants,
  useCreateVariant,
  useUpdateVariant,
  useDeleteVariant,
} from '../../hooks/useAdmin';
import type { ProductVariant, Attribute } from '../../types';

interface VariantManagerDialogProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  productPrice: number;
  selectedAttributeIds: string[];
  attributes: Attribute[];
}

interface VariantFormData {
  variantSku: string;
  price: string;
  stock: string;
  isActive: boolean;
  selectedValues: Record<string, string>; // attributeId -> attributeValueId
}

const initialFormData: VariantFormData = {
  variantSku: '',
  price: '',
  stock: '0',
  isActive: true,
  selectedValues: {},
};

export default function VariantManagerDialog({
  open,
  onClose,
  productId,
  productPrice,
  selectedAttributeIds,
  attributes,
}: VariantManagerDialogProps) {
  const { data: variants } = useProductVariants(productId);
  const createVariant = useCreateVariant();
  const updateVariant = useUpdateVariant();
  const deleteVariant = useDeleteVariant();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [formData, setFormData] = useState<VariantFormData>(initialFormData);
  const [error, setError] = useState('');
  const [confirmDeleteVariant, setConfirmDeleteVariant] = useState<ProductVariant | null>(null);

  // Filter only the selected attributes that have values
  const variantAttributes = attributes.filter(
    (attr: Attribute) => selectedAttributeIds.includes(attr.id) && attr.values && attr.values.length > 0
  );

  useEffect(() => {
    if (editingVariant) {
      const selectedValues: Record<string, string> = {};
      editingVariant.attributeValues?.forEach((av) => {
        selectedValues[av.attributeValue.attribute.id] = av.attributeValue.id;
      });

      setFormData({
        variantSku: editingVariant.variantSku || '',
        price: editingVariant.price?.toString() || '',
        stock: editingVariant.stock.toString(),
        isActive: editingVariant.isActive,
        selectedValues,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [editingVariant]);

  const handleOpenForm = (variant?: ProductVariant) => {
    if (variant) {
      setEditingVariant(variant);
    } else {
      setEditingVariant(null);
      setFormData(initialFormData);
    }
    setError('');
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingVariant(null);
    setFormData(initialFormData);
    setError('');
  };

  const handleSubmit = async () => {
    try {
      const attributeValueIds = Object.values(formData.selectedValues).filter(Boolean);
      
      if (attributeValueIds.length === 0) {
        setError('Debes seleccionar al menos un valor de atributo');
        return;
      }

      const data = {
        variantSku: formData.variantSku || undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        stock: parseInt(formData.stock) || 0,
        isActive: formData.isActive,
        attributeValueIds,
      };

      if (editingVariant) {
        await updateVariant.mutateAsync({
          variantId: editingVariant.id,
          productId,
          data,
        });
      } else {
        await createVariant.mutateAsync({
          productId,
          data,
        });
      }

      handleCloseForm();
    } catch (err: any) {
      setError(err?.message || 'Error al guardar la variante');
    }
  };

  const handleDelete = async (variant: ProductVariant) => {
    setConfirmDeleteVariant(variant);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteVariant) return;
    try {
      await deleteVariant.mutateAsync({
        variantId: confirmDeleteVariant.id,
        productId,
      });
      setConfirmDeleteVariant(null);
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar la variante');
      setConfirmDeleteVariant(null);
    }
  };

  const handleAttributeValueChange = (attributeId: string, valueId: string) => {
    setFormData({
      ...formData,
      selectedValues: {
        ...formData.selectedValues,
        [attributeId]: valueId,
      },
    });
  };

  const renderAttributeSelectors = () => {
    return variantAttributes.map((attr) => (
      <FormControl key={attr.id} fullWidth margin="normal">
        <InputLabel>{attr.displayName}</InputLabel>
        <Select
          value={formData.selectedValues[attr.id] || ''}
          label={attr.displayName}
          onChange={(e) => handleAttributeValueChange(attr.id, e.target.value)}
          renderValue={(selected) => {
            const value = attr.values?.find((v) => v.id === selected);
            if (!value) return '';
            
            if (attr.type === 'COLOR_HEX' && value.colorHex) {
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      bgcolor: value.colorHex,
                      borderRadius: '50%',
                      border: '1px solid grey.300',
                    }}
                  />
                  {value.displayValue || value.value}
                </Box>
              );
            }
            return value.displayValue || value.value;
          }}
        >
          {attr.values?.map((value) => (
            <MenuItem key={value.id} value={value.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {attr.type === 'COLOR_HEX' && value.colorHex && (
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      bgcolor: value.colorHex,
                      borderRadius: '50%',
                      border: '1px solid grey.300',
                    }}
                  />
                )}
                {value.displayValue || value.value}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    ));
  };

  // Generate a readable variant name from attribute values
  const getVariantName = (variant: ProductVariant): string => {
    if (!variant.attributeValues || variant.attributeValues.length === 0) {
      return 'Variante sin atributos';
    }

    // Build name like "Red - Small" or "Rojo - 30ml"
    return variant.attributeValues
      .map((av) => av.attributeValue.displayValue || av.attributeValue.value)
      .join(' - ');
  };

  const getVariantDisplay = (variant: ProductVariant) => {
    if (!variant.attributeValues || variant.attributeValues.length === 0) {
      return 'Sin atributos';
    }

    return variant.attributeValues.map((av) => {
      const attr = av.attributeValue.attribute;
      const value = av.attributeValue;
      
      if (attr.type === 'COLOR_HEX' && value.colorHex) {
        return (
          <Tooltip key={av.attributeValue.id} title={value.displayValue || value.value}>
            <Box
              sx={{
                width: 20,
                height: 20,
                bgcolor: value.colorHex,
                borderRadius: '50%',
                border: '1px solid grey.300',
                display: 'inline-block',
                mr: 0.5,
              }}
            />
          </Tooltip>
        );
      }
      return (
        <Chip
          key={av.attributeValue.id}
          label={value.displayValue || value.value}
          size="small"
          sx={{ mr: 0.5 }}
        />
      );
    });
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Gestión de Variantes</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenForm()}
              size="small"
            >
              Nueva Variante
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {variantAttributes.length === 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              No hay atributos con valores definidos. Crea atributos y sus valores primero.
            </Alert>
          )}

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Variante</TableCell>
                  <TableCell>Atributos</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Precio</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {variants?.map((variant) => (
                  <TableRow key={variant.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {getVariantName(variant)}
                      </Typography>
                    </TableCell>
                    <TableCell>{getVariantDisplay(variant)}</TableCell>
                    <TableCell>{variant.variantSku || '-'}</TableCell>
                    <TableCell>
                      {variant.price ? (
                        <Typography color="primary" fontWeight="medium">
                          ${variant.price}
                        </Typography>
                      ) : (
                        <Typography color="text.secondary">
                          ${productPrice} (base)
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{variant.stock}</TableCell>
                    <TableCell>
                      <Chip
                        label={variant.isActive ? 'Activo' : 'Inactivo'}
                        color={variant.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenForm(variant)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(variant)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {variants?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary" sx={{ py: 2 }}>
                        No hay variantes registradas para este producto
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Variant Form Dialog */}
      <Dialog
        open={isFormOpen}
        onClose={handleCloseForm}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingVariant 
            ? `Editar: ${getVariantName(editingVariant)}` 
            : 'Nueva Variante'
          }
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
            Atributos de la Variante
          </Typography>
          {renderAttributeSelectors()}

          <Divider sx={{ my: 2 }} />

          <TextField
            fullWidth
            label="SKU de Variante (opcional)"
            value={formData.variantSku}
            onChange={(e) => setFormData({ ...formData, variantSku: e.target.value })}
            margin="normal"
            helperText="Código único para esta variante"
          />

          <TextField
            fullWidth
            label="Precio (opcional)"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            margin="normal"
            helperText={`Precio base del producto: $${productPrice}. Déjalo vacío para usar el precio base.`}
          />

          <TextField
            fullWidth
            label="Stock"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            margin="normal"
            required
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
            }
            label="Activo"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={Object.keys(formData.selectedValues).length === 0}
          >
            {editingVariant ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Variant Confirmation */}
      <ConfirmDialog
        open={confirmDeleteVariant !== null}
        title="Eliminar Variante"
        message="¿Estás seguro de que deseas eliminar esta variante del producto?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        isDangerous={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteVariant(null)}
        isLoading={deleteVariant.isPending}
      />
    </>
  );
}
