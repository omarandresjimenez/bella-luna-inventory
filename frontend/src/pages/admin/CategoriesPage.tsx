import { useState } from 'react';
import {
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Paper,
  Tooltip,
  Avatar,
  TablePagination,
} from '@mui/material';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { useAdminCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, useUploadCategoryImage, useDeleteCategoryImage } from '../../hooks/useAdmin';
import ImageUpload from '../../components/admin/ImageUpload';
import type { Category } from '../../types';

export default function CategoriesPage() {
  const { data: allCategories, isLoading, error } = useAdminCategories();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  
  // Paginate client-side for categories
  const categories = allCategories || [];
  const total = categories.length;
  const paginatedCategories = categories.slice(page * limit, (page + 1) * limit);
  
  const { mutate: createCategory } = useCreateCategory();
  const { mutate: updateCategory } = useUpdateCategory();
  const { mutate: deleteCategory } = useDeleteCategory();
  const { mutate: uploadImage, isPending: isUploading } = useUploadCategoryImage();
  const { mutate: deleteImage } = useDeleteCategoryImage();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Image management state
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', slug: '', description: '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = () => {
    if (editingCategory) {
      updateCategory({ id: editingCategory.id, data: formData });
    } else {
      createCategory(formData as { name: string; slug: string; description: string });
    }
    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteId) {
      deleteCategory(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  // Image management functions
  const handleOpenImageDialog = (category: Category) => {
    setSelectedCategory(category);
    setImageDialogOpen(true);
    setSelectedFiles([]);
    setUploadProgress(0);
  };

  const handleCloseImageDialog = () => {
    setImageDialogOpen(false);
    setSelectedCategory(null);
    setSelectedFiles([]);
    setUploadProgress(0);
  };

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadImage = () => {
    if (selectedCategory && selectedFiles.length > 0) {
      setUploadProgress(0);
      uploadImage(
        { categoryId: selectedCategory.id, file: selectedFiles[0] },
        {
          onSuccess: () => {
            setSelectedFiles([]);
            setUploadProgress(100);
            setTimeout(() => setUploadProgress(0), 1000);
          },
        }
      );
    }
  };

  const handleDeleteImage = () => {
    if (selectedCategory) {
      deleteImage(selectedCategory.id);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Error al cargar categorías</Alert>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Categorías</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nueva Categoría
        </Button>
      </Box>

      <List>
        {paginatedCategories?.map((category) => (
          <ListItem
            key={category.id}
            secondaryAction={
              <Box>
                <Tooltip title="Gestionar imagen">
                  <IconButton 
                    edge="end" 
                    color={category.imageUrl ? "success" : "default"}
                    onClick={() => handleOpenImageDialog(category)}
                  >
                    <ImageIcon />
                  </IconButton>
                </Tooltip>
                <IconButton edge="end" onClick={() => handleOpenDialog(category)}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => handleDelete(category.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            }
          >
            {category.imageUrl ? (
              <Avatar
                src={category.imageUrl}
                alt={category.name}
                sx={{ mr: 2, width: 56, height: 56 }}
                variant="rounded"
              />
            ) : (
              <Avatar
                sx={{ mr: 2, width: 56, height: 56, bgcolor: 'grey.200' }}
                variant="rounded"
              >
                <ImageIcon color="disabled" />
              </Avatar>
            )}
            <ListItemText
              primary={category.name}
              secondary={category.description}
            />
          </ListItem>
        ))}
      </List>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <TablePagination
          component="div"
          count={total}
          rowsPerPage={limit}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setLimit(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        />
      </Box>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nombre"
            margin="normal"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            fullWidth
            label="Slug"
            margin="normal"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          />
          <TextField
            fullWidth
            label="Descripción"
            margin="normal"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Management Dialog */}
      <Dialog 
        open={imageDialogOpen} 
        onClose={handleCloseImageDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Gestionar Imagen - {selectedCategory?.name}
        </DialogTitle>
        <DialogContent>
          {/* Current Image Display */}
          {selectedCategory?.imageUrl ? (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Imagen actual
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <img
                  src={selectedCategory.imageUrl}
                  alt={selectedCategory.name}
                  style={{
                    maxWidth: '100%',
                    maxHeight: 200,
                    objectFit: 'cover',
                    borderRadius: 8,
                  }}
                />
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<DeleteSweepIcon />}
                  onClick={handleDeleteImage}
                  sx={{ mt: 2 }}
                >
                  Eliminar imagen
                </Button>
              </Paper>
            </Box>
          ) : (
            <Alert severity="info" sx={{ mb: 3 }}>
              Esta categoría no tiene imagen. Sube una imagen para representarla.
            </Alert>
          )}

          {/* Upload New Image */}
          <Typography variant="subtitle2" gutterBottom>
            {selectedCategory?.imageUrl ? 'Cambiar imagen' : 'Subir nueva imagen'}
          </Typography>
          <ImageUpload
            selectedFiles={selectedFiles}
            onFilesSelected={handleFilesSelected}
            onRemoveFile={handleRemoveFile}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            maxFiles={1}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImageDialog}>
            Cerrar
          </Button>
          <Button
            variant="contained"
            onClick={handleUploadImage}
            disabled={selectedFiles.length === 0 || isUploading}
          >
            {isUploading ? 'Subiendo...' : 'Subir imagen'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Category Confirmation */}
      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Eliminar Categoría"
        message="¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        isDangerous={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
        isLoading={false}
      />
    </Box>
  );
}
