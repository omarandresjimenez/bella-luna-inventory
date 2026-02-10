import { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Paper,
  Chip,
  LinearProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';

interface ImageUploadProps {
  onFilesSelected: (files: File[]) => void;
  selectedFiles: File[];
  onRemoveFile: (index: number) => void;
  isUploading?: boolean;
  uploadProgress?: number;
  maxFiles?: number;
  maxFileSizeMB?: number;
  acceptedTypes?: string[];
}

export default function ImageUpload({
  onFilesSelected,
  selectedFiles,
  onRemoveFile,
  isUploading = false,
  uploadProgress = 0,
  maxFiles = 10,
  maxFileSizeMB = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Tipo de archivo no válido. Solo se permiten: ${acceptedTypes.map(t => t.replace('image/', '.')).join(', ')}`;
    }
    if (file.size > maxFileSizeMB * 1024 * 1024) {
      return `Archivo demasiado grande. Máximo ${maxFileSizeMB}MB`;
    }
    return null;
  };

  const handleFiles = useCallback((files: FileList | null) => {
    setError(null);
    
    if (!files || files.length === 0) return;

    if (selectedFiles.length + files.length > maxFiles) {
      setError(`Máximo ${maxFiles} imágenes permitidas`);
      return;
    }

    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach((file) => {
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setError(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  }, [selectedFiles.length, maxFiles, maxFileSizeMB, acceptedTypes, onFilesSelected]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = ''; // Reset input
  }, [handleFiles]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Box>
      {/* Drop Zone */}
      <Paper
        variant="outlined"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          p: 4,
          textAlign: 'center',
          border: '2px dashed',
          borderColor: isDragging ? 'primary.main' : 'divider',
          bgcolor: isDragging ? 'primary.50' : 'background.paper',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'primary.50',
          },
        }}
        onClick={() => document.getElementById('image-upload-input')?.click()}
      >
        <input
          id="image-upload-input"
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleInputChange}
          style={{ display: 'none' }}
          disabled={isUploading}
        />
        
        <CloudUploadIcon 
          sx={{ 
            fontSize: 48, 
            color: isDragging ? 'primary.main' : 'text.secondary',
            mb: 2,
          }} 
        />
        
        <Typography variant="h6" gutterBottom>
          Arrastra imágenes aquí
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          o haz clic para seleccionar archivos
        </Typography>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Chip size="small" label={`Máx. ${maxFiles} archivos`} variant="outlined" />
          <Chip size="small" label={`Máx. ${maxFileSizeMB}MB por archivo`} variant="outlined" />
          <Chip size="small" label={acceptedTypes.map(t => t.replace('image/', '.').toUpperCase()).join(', ')} variant="outlined" />
        </Box>
      </Paper>

      {/* Error Message */}
      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Subiendo... {uploadProgress}%
          </Typography>
        </Box>
      )}

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && !isUploading && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Archivos seleccionados ({selectedFiles.length})
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {selectedFiles.map((file, index) => (
              <Paper
                key={index}
                variant="outlined"
                sx={{
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: 1,
                    bgcolor: 'grey.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  {file.type.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                    />
                  ) : (
                    <ImageIcon color="action" />
                  )}
                </Box>
                
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" noWrap title={file.name}>
                    {file.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(file.size)}
                  </Typography>
                </Box>
                
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFile(index);
                  }}
                  disabled={isUploading}
                >
                  <DeleteIcon />
                </IconButton>
              </Paper>
            ))}
          </Box>
          
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => selectedFiles.forEach((_, i) => onRemoveFile(i))}
            sx={{ mt: 2 }}
            disabled={isUploading}
          >
            Limpiar todo
          </Button>
        </Box>
      )}
    </Box>
  );
}
