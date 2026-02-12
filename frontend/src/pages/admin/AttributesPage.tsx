import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AddCircle as AddCircleIcon,
} from '@mui/icons-material';
import {
  useAdminAttributes,
  useCreateAttribute,
  useUpdateAttribute,
  useDeleteAttribute,
  useAddAttributeValue,
  useRemoveAttributeValue,
} from '../../hooks/useAdmin';
import type { Attribute } from '../../types';

interface AttributeFormData {
  name: string;
  displayName: string;
  type: 'TEXT' | 'COLOR_HEX' | 'NUMBER';
  sortOrder: number;
}

interface AttributeValueFormData {
  value: string;
  displayValue: string;
  colorHex?: string;
  sortOrder: number;
}

const initialFormData: AttributeFormData = {
  name: '',
  displayName: '',
  type: 'TEXT',
  sortOrder: 0,
};

const initialValueFormData: AttributeValueFormData = {
  value: '',
  displayValue: '',
  colorHex: '#000000',
  sortOrder: 0,
};

export default function AttributesPage() {
  const { data: attributes, isLoading } = useAdminAttributes();
  const createAttribute = useCreateAttribute();
  const updateAttribute = useUpdateAttribute();
  const deleteAttribute = useDeleteAttribute();
  const addAttributeValue = useAddAttributeValue();
  const removeAttributeValue = useRemoveAttributeValue();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isValuesOpen, setIsValuesOpen] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<Attribute | null>(null);
  const [formData, setFormData] = useState<AttributeFormData>(initialFormData);
  const [valueFormData, setValueFormData] = useState<AttributeValueFormData>(initialValueFormData);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleOpenForm = (attribute?: Attribute) => {
    if (attribute) {
      setFormData({
        name: attribute.name,
        displayName: attribute.displayName,
        type: attribute.type,
        sortOrder: attribute.sortOrder,
      });
      setSelectedAttribute(attribute);
      setIsEditing(true);
    } else {
      setFormData(initialFormData);
      setSelectedAttribute(null);
      setIsEditing(false);
    }
    setError('');
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setFormData(initialFormData);
    setSelectedAttribute(null);
    setIsEditing(false);
    setError('');
  };

  const handleOpenValues = (attribute: Attribute) => {
    setSelectedAttribute(attribute);
    setValueFormData(initialValueFormData);
    setError('');
    setIsValuesOpen(true);
  };

  const handleCloseValues = () => {
    setIsValuesOpen(false);
    setSelectedAttribute(null);
    setValueFormData(initialValueFormData);
    setError('');
  };

  const handleSubmit = async () => {
    try {
      if (isEditing && selectedAttribute) {
        await updateAttribute.mutateAsync({
          id: selectedAttribute.id,
          data: formData,
        });
      } else {
        await createAttribute.mutateAsync(formData);
      }
      handleCloseForm();
    } catch (err: any) {
      setError(err?.message || 'Error al guardar el atributo');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este atributo?')) {
      try {
        await deleteAttribute.mutateAsync(id);
      } catch (err: any) {
        alert(err?.message || 'Error al eliminar el atributo');
      }
    }
  };

  const handleAddValue = async () => {
    if (!selectedAttribute) return;
    
    try {
      await addAttributeValue.mutateAsync({
        attributeId: selectedAttribute.id,
        data: valueFormData,
      });
      setValueFormData(initialValueFormData);
    } catch (err: any) {
      setError(err?.message || 'Error al agregar el valor');
    }
  };

  const handleRemoveValue = async (valueId: string) => {
    if (window.confirm('¿Estás seguro de eliminar este valor?')) {
      try {
        await removeAttributeValue.mutateAsync(valueId);
      } catch (err: any) {
        alert(err?.message || 'Error al eliminar el valor');
      }
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Atributos de Productos</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
        >
          Nuevo Atributo
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Nombre de Visualización</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Valores</TableCell>
              <TableCell>Orden</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attributes?.map((attribute) => (
              <TableRow key={attribute.id}>
                <TableCell>{attribute.name}</TableCell>
                <TableCell>{attribute.displayName}</TableCell>
                <TableCell>
                  <Chip
                    label={attribute.type}
                    size="small"
                    color={attribute.type === 'COLOR_HEX' ? 'primary' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">
                      {attribute.values?.length || 0} valores
                    </Typography>
                    <Tooltip title="Gestionar valores">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenValues(attribute)}
                      >
                        <AddCircleIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell>{attribute.sortOrder}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpenForm(attribute)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(attribute.id)} size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {attributes?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No hay atributos registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Attribute Form Dialog */}
      <Dialog open={isFormOpen} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isEditing ? 'Editar Atributo' : 'Nuevo Atributo'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Nombre (interno)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            helperText="Solo letras, números y guiones bajos"
          />
          <TextField
            fullWidth
            label="Nombre de Visualización"
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Tipo</InputLabel>
            <Select
              value={formData.type}
              label="Tipo"
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'TEXT' | 'COLOR_HEX' | 'NUMBER' })}
            >
              <MenuItem value="TEXT">Texto</MenuItem>
              <MenuItem value="COLOR_HEX">Color</MenuItem>
              <MenuItem value="NUMBER">Número</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Orden"
            type="number"
            value={formData.sortOrder}
            onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name || !formData.displayName}
          >
            {isEditing ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Values Management Dialog */}
      <Dialog open={isValuesOpen} onClose={handleCloseValues} maxWidth="sm" fullWidth>
        <DialogTitle>
          Valores de: {selectedAttribute?.displayName}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {/* Add Value Form */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Agregar Nuevo Valor
            </Typography>
            <TextField
              fullWidth
              label="Valor (interno)"
              value={valueFormData.value}
              onChange={(e) => setValueFormData({ ...valueFormData, value: e.target.value })}
              margin="dense"
              size="small"
            />
            <TextField
              fullWidth
              label="Nombre de Visualización"
              value={valueFormData.displayValue}
              onChange={(e) => setValueFormData({ ...valueFormData, displayValue: e.target.value })}
              margin="dense"
              size="small"
            />
            {selectedAttribute?.type === 'COLOR_HEX' && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" display="block" gutterBottom>
                  Color
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <input
                    type="color"
                    value={valueFormData.colorHex}
                    onChange={(e) => setValueFormData({ ...valueFormData, colorHex: e.target.value })}
                    style={{ width: 50, height: 36, border: 'none', borderRadius: 4, cursor: 'pointer' }}
                  />
                  <TextField
                    size="small"
                    value={valueFormData.colorHex}
                    onChange={(e) => setValueFormData({ ...valueFormData, colorHex: e.target.value })}
                    placeholder="#000000"
                    sx={{ flex: 1 }}
                  />
                </Box>
              </Box>
            )}
            <TextField
              fullWidth
              label="Orden"
              type="number"
              value={valueFormData.sortOrder}
              onChange={(e) => setValueFormData({ ...valueFormData, sortOrder: parseInt(e.target.value) || 0 })}
              margin="dense"
              size="small"
            />
            <Button
              variant="contained"
              size="small"
              onClick={handleAddValue}
              disabled={!valueFormData.value}
              sx={{ mt: 1 }}
            >
              Agregar Valor
            </Button>
          </Box>

          {/* Values List */}
          <Typography variant="subtitle2" gutterBottom>
            Valores Existentes
          </Typography>
          <List dense>
            {selectedAttribute?.values?.map((value) => (
              <ListItem
                key={value.id}
                sx={{
                  bgcolor: 'background.paper',
                  mb: 0.5,
                  borderRadius: 1,
                }}
              >
                {selectedAttribute.type === 'COLOR_HEX' && value.colorHex && (
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      bgcolor: value.colorHex,
                      borderRadius: '50%',
                      mr: 1,
                      border: '1px solid grey.300',
                    }}
                  />
                )}
                <ListItemText
                  primary={value.displayValue || value.value}
                  secondary={`Valor: ${value.value} | Orden: ${value.sortOrder}`}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    size="small"
                    color="error"
                    onClick={() => handleRemoveValue(value.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {selectedAttribute?.values?.length === 0 && (
              <ListItem>
                <ListItemText primary="No hay valores registrados" />
              </ListItem>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseValues}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
