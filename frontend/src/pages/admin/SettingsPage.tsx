import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  InputAdornment,
} from '@mui/material';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/adminApi';
import type { StoreSettings } from '../../types';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch current settings
  const { data: settingsResponse, isLoading } = useQuery({
    queryKey: ['storeSettings'],
    queryFn: () => adminApi.getStoreSettings(),
  });

  // Extract actual settings from ApiResponse wrapper  
  const settings = settingsResponse?.data?.data;

  // Form state - initialize with settings when available
  const [formData, setFormData] = useState<Partial<StoreSettings>>(() => {
    if (settings) {
      return {
        deliveryFee: settings.deliveryFee,
        freeDeliveryThreshold: settings.freeDeliveryThreshold,
        storeName: settings.storeName,
        storeEmail: settings.storeEmail,
        storePhone: settings.storePhone,
        storeAddress: settings.storeAddress,
        whatsappNumber: settings.whatsappNumber,
      };
    }
    return {};
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<StoreSettings>) =>
      adminApi.updateStoreSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeSettings'] });
      setSuccess('Configuración actualizada exitosamente');
      setError(null);
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      const errorMessage = err.response?.data?.message || 'Error al actualizar configuración';
      setError(errorMessage);
      setSuccess(null);
    },
  });

  const handleChange = (field: keyof StoreSettings) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]:
        field === 'deliveryFee' || field === 'freeDeliveryThreshold'
          ? value === ''
            ? undefined
            : Number(value)
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
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
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <SettingsIcon size={32} />
        <Typography variant="h4">Configuración General</Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Shipping Settings */}
          <Grid size={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  🚚 Configuración de Envío
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  El costo de envío se aplicará solo cuando el cliente seleccione "Enviar a domicilio". Si selecciona "Recoger en tienda", el envío será $0.
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Costo de Envío"
                      type="number"
                      value={formData.deliveryFee ?? settings?.deliveryFee ?? 0}
                      onChange={handleChange('deliveryFee')}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      inputProps={{
                        min: 0,
                        step: 0.01,
                      }}
                      helperText="Costo fijo de envío aplicado a todos los pedidos enviados a domicilio"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Umbral de Envío Gratis (Opcional)"
                      type="number"
                      value={formData.freeDeliveryThreshold ?? settings?.freeDeliveryThreshold ?? ''}
                      onChange={handleChange('freeDeliveryThreshold')}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      inputProps={{
                        min: 0,
                        step: 0.01,
                      }}
                      helperText="Si el subtotal supera este valor, el envío es gratis (dejar vacío para desactivar)"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Store Information */}
          <Grid size={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  🏪 Información de la Tienda
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Nombre de la Tienda"
                      value={formData.storeName ?? settings?.storeName ?? ''}
                      onChange={handleChange('storeName')}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Email de la Tienda"
                      type="email"
                      value={formData.storeEmail ?? settings?.storeEmail ?? ''}
                      onChange={handleChange('storeEmail')}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Teléfono de la Tienda"
                      value={formData.storePhone ?? settings?.storePhone ?? ''}
                      onChange={handleChange('storePhone')}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="WhatsApp"
                      value={formData.whatsappNumber ?? settings?.whatsappNumber ?? ''}
                      onChange={handleChange('whatsappNumber')}
                      helperText="Número de WhatsApp con código de país (ej: +573001234567)"
                    />
                  </Grid>

                  <Grid size={12}>
                    <TextField
                      fullWidth
                      label="Dirección de la Tienda"
                      multiline
                      rows={3}
                      value={formData.storeAddress ?? settings?.storeAddress ?? ''}
                      onChange={handleChange('storeAddress')}
                      helperText="Dirección completa para recogida en tienda"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Save Button */}
          <Grid size={12}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={updateMutation.isPending ? <CircularProgress size={20} /> : <Save />}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
