import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Tooltip,
  TablePagination,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useAdminProducts, useDeleteProduct, useUploadProductImages, useDeleteProductImage, useSetPrimaryImage } from '../../hooks/useAdmin';
import ImageUpload from '../../components/admin/ImageUpload';
import { getFrontendEnv } from '../../config/env';
import type { Product } from '../../types';

export default function ProductsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(0); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);
  
  const { data: responseData, isLoading, error } = useAdminProducts({
    page: page + 1,
    limit,
    search: debouncedSearch || undefined,
  });
  
  const products = responseData?.products || [];
  const totalProducts = responseData?.pagination?.total || 0;
  
  const { mutate: deleteProduct } = useDeleteProduct();
  const { mutate: uploadImages, isPending: isUploading } = useUploadProductImages();
  const { mutate: deleteImage } = useDeleteProductImage();
  const { mutate: setPrimary } = useSetPrimaryImage();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  // Image management
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  // Image management functions
  const handleOpenImageDialog = (product: Product) => {
    setSelectedProduct(product);
    setImageDialogOpen(true);
    setSelectedFiles([]);
  };

  const handleCloseImageDialog = () => {
    setImageDialogOpen(false);
    setSelectedProduct(null);
    setSelectedFiles([]);
    setUploadProgress(0);
  };

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadImages = () => {
    if (selectedProduct && selectedFiles.length > 0) {
      setUploadProgress(0);
      uploadImages(
        { productId: selectedProduct.id, files: selectedFiles },
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

  const handleDeleteImage = (imageId: string) => {
    if (selectedProduct) {
      deleteImage({ productId: selectedProduct.id, imageId });
    }
  };

  const handleSetPrimary = (imageId: string) => {
    if (selectedProduct) {
      setPrimary({ productId: selectedProduct.id, imageId });
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const env = getFrontendEnv();
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      const response = await fetch(`${env.VITE_API_URL}/admin/products/export/csv`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/csv',
        },
      });

      if (!response.ok) {
        await response.text();
        throw new Error('Error al descargar CSV');
      }

      // Check content type
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('text/csv')) {
        throw new Error('El servidor no devolvió un archivo CSV');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `productos-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Error al descargar el CSV');
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
    return <Alert severity="error">Error al cargar productos</Alert>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Productos</Typography>
        <Box display="flex" gap={2}>
          <Button 
            variant="outlined" 
            startIcon={<FileDownloadIcon />}
            onClick={handleDownloadCSV}
          >
            Descargar CSV
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/products/new')}
          >
            Nuevo Producto
          </Button>
        </Box>
      </Box>

      <TextField
        label="Buscar productos"
        variant="outlined"
        size="small"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="SKU, nombre o marca..."
        sx={{ mb: 2, minWidth: 300 }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>SKU</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Marca</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products?.map((product: Product) => (
              <TableRow key={product.id}>
                <TableCell>{product.sku}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.brand || '-'}</TableCell>
                <TableCell>${product.basePrice}</TableCell>
                <TableCell>
                  <Chip
                    label={product.isActive ? 'Activo' : 'Inactivo'}
                    color={product.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Gestionar imágenes">
                    <IconButton 
                      size="small" 
                      color="info"
                      onClick={() => handleOpenImageDialog(product)}
                    >
                      <ImageIcon />
                    </IconButton>
                  </Tooltip>
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteClick(product)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalProducts}
          rowsPerPage={limit}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setLimit(parseInt(event.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        />
      </TableContainer>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          ¿Estás seguro de que deseas eliminar el producto "{productToDelete?.name}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Management Dialog */}
      <Dialog 
        open={imageDialogOpen} 
        onClose={handleCloseImageDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Gestionar Imágenes - {selectedProduct?.name}
        </DialogTitle>
        <DialogContent>
          {/* Existing Images */}
          {selectedProduct && selectedProduct.images && selectedProduct.images.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom>
                Imágenes existentes
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {selectedProduct.images.map((image) => (
                  <Paper
                    key={image.id}
                    variant="outlined"
                    sx={{
                      position: 'relative',
                      p: 1,
                      width: 120,
                    }}
                  >
                    <img
                      src={image.thumbnailUrl}
                      alt={image.altText || 'Product'}
                      style={{
                        width: '100%',
                        height: 100,
                        objectFit: 'cover',
                        borderRadius: 4,
                      }}
                    />
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                      <Tooltip title={image.isPrimary ? "Imagen principal" : "Establecer como principal"}>
                        <IconButton
                          size="small"
                          onClick={() => handleSetPrimary(image.id)}
                          color={image.isPrimary ? "primary" : "default"}
                        >
                          {image.isPrimary ? <StarIcon /> : <StarBorderIcon />}
                        </IconButton>
                      </Tooltip>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteImage(image.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Box>
          )}

          {/* Upload New Images */}
          <Typography variant="subtitle1" gutterBottom>
            Subir nuevas imágenes
          </Typography>
          <ImageUpload
            selectedFiles={selectedFiles}
            onFilesSelected={handleFilesSelected}
            onRemoveFile={handleRemoveFile}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImageDialog}>
            Cerrar
          </Button>
          <Button
            variant="contained"
            onClick={handleUploadImages}
            disabled={selectedFiles.length === 0 || isUploading}
          >
            {isUploading ? 'Subiendo...' : `Subir ${selectedFiles.length} imagen(es)`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
