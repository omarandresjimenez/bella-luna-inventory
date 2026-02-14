import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/formatters';
import {
  Typography,
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  Container,
  Paper,
  Grid,
  StepConnector,
  stepConnectorClasses,
  styled,
} from '@mui/material';
import { useCart, useCreateOrder, useAddresses, useCreateAddress } from '../../hooks/useCustomer';
import { useCustomerAuth } from '../../hooks/useCustomerAuth';
import type { Address } from '../../types';
import { publicApi } from '../../services/publicApi';
import { useQuery } from '@tanstack/react-query';

// Custom styled stepper connector
const QontoConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 20,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: theme.palette.primary.main,
      borderWidth: 3,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: theme.palette.divider,
    borderTopWidth: 3,
    borderRadius: 1,
  },
}));

const QontoStepIconRoot = styled('div')<{ ownerState: { active?: boolean; completed?: boolean } }>(
  ({ theme, ownerState }) => ({
    color: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#eaeaf0',
    display: 'flex',
    height: 56,
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    borderRadius: '50%',
    fontSize: 24,
    backgroundColor: theme.palette.background.default,
    border: `2px solid ${theme.palette.divider}`,
    ...(ownerState.active && {
      borderColor: theme.palette.primary.main,
      color: 'white',
      backgroundColor: theme.palette.primary.light,
      boxShadow: `0 0 0 4px ${theme.palette.primary.light}80`,
    }),
    ...(ownerState.completed && {
      borderColor: theme.palette.primary.main,
      color: 'white',
      backgroundColor: theme.palette.primary.main,
    }),
  })
);

function QontoStepIcon(props: any) {
  const { active, completed, className } = props;
  return (
    <QontoStepIconRoot ownerState={{ active, completed }} className={className}>
      {completed ? '✓' : props.icon}
    </QontoStepIconRoot>
  );
}

const addressSchema = z.object({
  street: z.string().min(1, 'La calle es requerida').min(3, 'Debe tener al menos 3 caracteres'),
  city: z.string().min(1, 'La ciudad es requerida').min(2, 'Debe tener al menos 2 caracteres'),
  state: z.string().min(1, 'El estado/provincia es requerido').min(2, 'Debe tener al menos 2 caracteres'),
  zipCode: z.string().min(1, 'El código postal es requerido').min(3, 'Debe tener al menos 3 caracteres'),
  isDefault: z.boolean().default(false),
});

type AddressFormData = z.infer<typeof addressSchema>;

const steps = ['Dirección de Envío', 'Método de Entrega', 'Método de Pago', 'Confirmar Pedido'];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { refreshCart } = useCustomerAuth();
  const [activeStep, setActiveStep] = useState(0);
  const { data: cart } = useCart();
  const { data: addresses } = useAddresses();
  const { mutate: createOrder, isPending } = useCreateOrder();
  const { mutate: createAddress, isPending: isCreatingAddress } = useCreateAddress();
  const { data: storeSettingsResponse } = useQuery({
    queryKey: ['storeSettings'],
    queryFn: () => publicApi.getStoreSettings(),
  });
  const storeSettings = storeSettingsResponse?.data?.data;

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [deliveryType, setDeliveryType] = useState<'HOME_DELIVERY' | 'STORE_PICKUP'>('HOME_DELIVERY');
  const [paymentMethod, setPaymentMethod] = useState<'CASH_ON_DELIVERY' | 'STORE_PAYMENT'>('CASH_ON_DELIVERY');
  const [customerNotes, setCustomerNotes] = useState('');
  
  // Calculate shipping fee based on delivery type
  const shippingFee = deliveryType === 'HOME_DELIVERY' ? (storeSettings?.deliveryFee || 0) : 0;
  const totalAmount = (cart?.subtotal || 0) + shippingFee;
  
  // New address form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    isDefault: false,
  });
  const [addressErrors, setAddressErrors] = useState<Partial<Record<keyof AddressFormData, string>>>({});

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep((prev) => prev + 1);
      // Scroll to top when moving to next step
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    // Scroll to top when going back
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = () => {
    if (!selectedAddress) return;

    createOrder(
      {
        addressId: selectedAddress.id,
        deliveryType,
        paymentMethod,
        customerNotes: customerNotes || undefined,
      } as any,
      {
        onSuccess: async () => {
          // Refresh cart to ensure it's cleared
          await refreshCart();
          navigate('/orders');
        },
      }
    );
  };

  const handleCreateAddress = () => {
    try {
      // Validate using Zod schema
      const validatedData = addressSchema.parse(newAddress);
      setAddressErrors({});

      createAddress(validatedData as Omit<Address, 'id'>, {
        onSuccess: (createdAddress) => {
          setSelectedAddress(createdAddress);
          setShowAddressForm(false);
          setNewAddress({
            street: '',
            city: '',
            state: '',
            zipCode: '',
            isDefault: false,
          });
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convert Zod errors to a map
        const errorMap: Partial<Record<keyof AddressFormData, string>> = {};
        (error as any).issues?.forEach((err: any) => {
          const path = err.path[0] as keyof AddressFormData;
          errorMap[path] = err.message;
        });
        setAddressErrors(errorMap);
      }
    }
  };

  if (!cart?.items || cart.items.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Tu carrito está vacío. <Button component="a" href="/">Ir a la tienda</Button>
      </Alert>
    );
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Selecciona una dirección de envío
            </Typography>
            
            {/* Show address list if exists */}
            {addresses && addresses.length > 0 ? (
              <>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                  {addresses.map((address) => (
                    <motion.div
                      key={address.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card
                        sx={{
                          cursor: 'pointer',
                          border: selectedAddress?.id === address.id ? '2px solid' : '1px solid',
                          borderColor: selectedAddress?.id === address.id ? 'primary.main' : 'divider',
                          transition: 'all 0.3s ease',
                          bgcolor: selectedAddress?.id === address.id ? 'primary.light' : 'background.paper',
                          '&:hover': {
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            transform: 'translateY(-2px)',
                          },
                        }}
                        onClick={() => setSelectedAddress(address)}
                      >
                        <CardContent sx={{ p: 2.5 }}>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Radio
                              checked={selectedAddress?.id === address.id}
                              onChange={() => setSelectedAddress(address)}
                            />
                            <Box flex={1}>
                              <Typography sx={{ 
                                fontWeight: 700, 
                                mb: 0.5,
                                color: selectedAddress?.id === address.id ? 'white' : 'inherit'
                              }}>
                                {address.street}
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                color: selectedAddress?.id === address.id ? 'rgba(255, 255, 255, 0.8)' : 'text.secondary'
                              }}>
                                {address.city}, {address.state} {address.zipCode}
                              </Typography>
                              {address.isDefault && (
                                <Typography variant="caption" sx={{ 
                                  color: selectedAddress?.id === address.id ? 'white' : 'primary.main',
                                  fontWeight: 600, 
                                  display: 'block', 
                                  mt: 1 
                                }}>
                                  ⭐ Dirección predeterminada
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </Box>

                {!showAddressForm && (
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    onClick={() => setShowAddressForm(true)}
                    sx={{ mt: 2, mb: 2, py: 1.5, fontWeight: 600 }}
                  >
                    + Agregar Nueva Dirección
                  </Button>
                )}
                {!selectedAddress && (
                  <Alert severity="warning">Por favor selecciona una dirección</Alert>
                )}
              </>
            ) : (
              <>
                <Alert severity="info" sx={{ mb: 3 }}>
                  No tienes direcciones registradas. Por favor agrega una para continuar.
                </Alert>
                {!showAddressForm && (
                  <Button 
                    variant="contained" 
                    fullWidth 
                    onClick={() => setShowAddressForm(true)}
                    sx={{ py: 1.5, fontWeight: 600 }}
                  >
                    + Agregar Nueva Dirección
                  </Button>
                )}
              </>
            )}

            {/* New Address Form */}
            {showAddressForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Divider sx={{ my: 4 }} />
                <Card sx={{ mt: 3, p: 3.5, bgcolor: 'grey.50', border: '2px dashed', borderColor: 'divider' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                    Agregar Nueva Dirección
                  </Typography>
                  <TextField
                    fullWidth
                    label="Calle"
                    placeholder="Ej: Calle Principal 123"
                    value={newAddress.street}
                    onChange={(e) => {
                      setNewAddress({ ...newAddress, street: e.target.value });
                      setAddressErrors({ ...addressErrors, street: '' });
                    }}
                    error={!!addressErrors.street}
                    helperText={addressErrors.street}
                    sx={{ mb: 2.5 }}
                    disabled={isCreatingAddress}
                  />
                  <TextField
                    fullWidth
                    label="Ciudad"
                    placeholder="Ej: Madrid"
                    value={newAddress.city}
                    onChange={(e) => {
                      setNewAddress({ ...newAddress, city: e.target.value });
                      setAddressErrors({ ...addressErrors, city: '' });
                    }}
                    error={!!addressErrors.city}
                    helperText={addressErrors.city}
                    sx={{ mb: 2.5 }}
                    disabled={isCreatingAddress}
                  />
                  <TextField
                    fullWidth
                    label="Estado/Provincia"
                    placeholder="Ej: Madrid"
                    value={newAddress.state}
                    onChange={(e) => {
                      setNewAddress({ ...newAddress, state: e.target.value });
                      setAddressErrors({ ...addressErrors, state: '' });
                    }}
                    error={!!addressErrors.state}
                    helperText={addressErrors.state}
                    sx={{ mb: 2.5 }}
                    disabled={isCreatingAddress}
                  />
                  <TextField
                    fullWidth
                    label="Código Postal"
                    placeholder="Ej: 28001"
                    value={newAddress.zipCode}
                    onChange={(e) => {
                      setNewAddress({ ...newAddress, zipCode: e.target.value });
                      setAddressErrors({ ...addressErrors, zipCode: '' });
                    }}
                    error={!!addressErrors.zipCode}
                    helperText={addressErrors.zipCode}
                    sx={{ mb: 2.5 }}
                    disabled={isCreatingAddress}
                  />
                <FormControlLabel
                  control={
                    <Radio
                      checked={newAddress.isDefault}
                      onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                      disabled={isCreatingAddress}
                    />
                  }
                  label="Establecer como dirección predeterminada"
                  sx={{ mb: 2 }}
                />
                <Box display="flex" gap={2}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleCreateAddress}
                    disabled={isCreatingAddress}
                  >
                    {isCreatingAddress ? <CircularProgress size={20} /> : 'Guardar Dirección'}
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                      setShowAddressForm(false);
                      setNewAddress({
                        street: '',
                        city: '',
                        state: '',
                        zipCode: '',
                        isDefault: false,
                      });
                      setAddressErrors({});
                    }}
                    disabled={isCreatingAddress}
                  >
                    Cancelar
                  </Button>
                </Box>
              </Card>
              </motion.div>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Método de entrega
            </Typography>
            <FormControl component="fieldset" sx={{ width: '100%' }}>
              <RadioGroup
                value={deliveryType}
                onChange={(e) => setDeliveryType(e.target.value as 'HOME_DELIVERY' | 'STORE_PICKUP')}
              >
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                  <Card sx={{ mb: 2, border: '2px solid', borderColor: deliveryType === 'HOME_DELIVERY' ? 'primary.main' : 'divider', transition: 'all 0.3s' }}>
                    <CardContent sx={{ pb: 1.5 }}>
                      <FormControlLabel
                        value="HOME_DELIVERY"
                        control={<Radio />}
                        label={
                          <Box>
                            <Typography sx={{ fontWeight: 700 }}>Entrega a domicilio</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Recibe tu pedido en la dirección indicada
                            </Typography>
                          </Box>
                        }
                      />
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2, delay: 0.1 }}>
                  <Card sx={{ mb: 2, border: '2px solid', borderColor: deliveryType === 'STORE_PICKUP' ? 'primary.main' : 'divider', transition: 'all 0.3s' }}>
                    <CardContent sx={{ pb: 1.5 }}>
                      <FormControlLabel
                        value="STORE_PICKUP"
                        control={<Radio />}
                        label={
                          <Box>
                            <Typography sx={{ fontWeight: 700 }}>Recoger en tienda</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Recoge tu pedido en nuestro local
                            </Typography>
                          </Box>
                        }
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              </RadioGroup>
            </FormControl>

            <Typography variant="h6" sx={{ fontWeight: 700, mt: 4, mb: 3 }}>
              Notas adicionales (opcional)
            </Typography>
            <TextField
              label="Agregue un mensaje especial para su pedido"
              placeholder="Ej: Envolver como regalo, instrucciones especiales..."
              multiline
              rows={4}
              fullWidth
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                }
              }}
            />
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Método de pago
            </Typography>
            <FormControl component="fieldset" sx={{ width: '100%' }}>
              <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as 'CASH_ON_DELIVERY' | 'STORE_PAYMENT')}
              >
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                  <Card sx={{ mb: 2, border: '2px solid', borderColor: paymentMethod === 'CASH_ON_DELIVERY' ? 'primary.main' : 'divider', transition: 'all 0.3s' }}>
                    <CardContent sx={{ pb: 1.5 }}>
                      <FormControlLabel
                        value="CASH_ON_DELIVERY"
                        control={<Radio />}
                        label={
                          <Box>
                            <Typography sx={{ fontWeight: 700 }}>Pago contra entrega</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Paga cuando recibas tu pedido
                            </Typography>
                          </Box>
                        }
                      />
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2, delay: 0.1 }}>
                  <Card sx={{ mb: 2, border: '2px solid', borderColor: paymentMethod === 'STORE_PAYMENT' ? 'primary.main' : 'divider', transition: 'all 0.3s' }}>
                    <CardContent sx={{ pb: 1.5 }}>
                      <FormControlLabel
                        value="STORE_PAYMENT"
                        control={<Radio />}
                        label={
                          <Box>
                            <Typography sx={{ fontWeight: 700 }}>Pago en tienda</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Paga al recoger tu pedido en nuestro local
                            </Typography>
                          </Box>
                        }
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              </RadioGroup>
            </FormControl>

            <Alert severity="info" sx={{ mt: 3 }}>
              Recibirás una confirmación de tu pedido por correo electrónico
            </Alert>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Confirma tu pedido
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Dirección */}
              <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
                <CardContent sx={{ pb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                    📍 Dirección de Entrega
                  </Typography>
                  <Typography variant="body2">{selectedAddress?.street}</Typography>
                  <Typography variant="body2">{selectedAddress?.city}, {selectedAddress?.state} {selectedAddress?.zipCode}</Typography>
                </CardContent>
              </Card>

              {/* Método de Entrega */}
              <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
                <CardContent sx={{ pb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                    🚚 Método de Entrega
                  </Typography>
                  <Typography variant="body2">
                    {deliveryType === 'HOME_DELIVERY' ? 'Entrega a domicilio' : 'Recoger en tienda'}
                  </Typography>
                </CardContent>
              </Card>

              {/* Método de Pago */}
              <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
                <CardContent sx={{ pb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                    💳 Método de Pago
                  </Typography>
                  <Typography variant="body2">
                    {paymentMethod === 'CASH_ON_DELIVERY' ? 'Pago contra entrega' : 'Pago en tienda'}
                  </Typography>
                </CardContent>
              </Card>

              {/* Notas */}
              {customerNotes && (
                <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', bgcolor: 'grey.50' }}>
                  <CardContent sx={{ pb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                      📝 Notas Especiales
                    </Typography>
                    <Typography variant="body2">{customerNotes}</Typography>
                  </CardContent>
                </Card>
              )}
            </Box>

            <Alert severity="success" sx={{ mt: 3 }}>
              ✓ Todos tus datos están listos. ¡Haz clic en confirmar para completar tu pedido!
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 6 }}>
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
            Finalizar Compra
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Completa estos pasos para confirmar tu pedido
          </Typography>
        </Box>

        {/* Stepper with custom styling */}
        <Paper elevation={0} sx={{ p: 4, mb: 6, borderRadius: '16px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
          <Stepper 
            activeStep={activeStep} 
            connector={<QontoConnector />}
            sx={{
              '& .MuiStep-root': {
                pb: 1,
              }
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel StepIconComponent={QontoStepIcon}>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    {label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Content Grid */}
        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid sx={{ width: { xs: '100%', md: 'calc(66.666% - 12px)' } }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Paper 
                elevation={0}
                sx={{ 
                  p: 4, 
                  borderRadius: '16px', 
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  minHeight: '400px'
                }}
              >
                {renderStepContent()}
              </Paper>
            </motion.div>
          </Grid>

          {/* Order Summary Sidebar */}
          <Grid sx={{ width: { xs: '100%', md: 'calc(33.333% - 12px)' } }}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 3.5,
                  borderRadius: '16px',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  position: 'sticky',
                  top: 20,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
                  Resumen del Pedido
                </Typography>

                <Box sx={{ mb: 3, maxHeight: '250px', overflowY: 'auto' }}>
                  {cart?.items?.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Box 
                        display="flex" 
                        justifyContent="space-between" 
                        alignItems="center"
                        sx={{ 
                          mb: 2, 
                          pb: 2, 
                          borderBottom: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <Box flex={1}>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {item.productName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            x{item.quantity} @ {formatCurrency(item.unitPrice)}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 80, textAlign: 'right' }}>
                          {formatCurrency(item.totalPrice)}
                        </Typography>
                      </Box>
                    </motion.div>
                  ))}
                </Box>

                <Divider sx={{ my: 2.5 }} />

                <Box sx={{ mb: 2 }}>
                  <Box display="flex" justifyContent="space-between" sx={{ mb: 1.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Subtotal
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatCurrency(cart?.subtotal || 0)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Envío
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: shippingFee === 0 ? 'success.main' : 'inherit' }}>
                      {shippingFee === 0 ? 'Gratis' : formatCurrency(shippingFee)}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2.5 }} />

                <Box display="flex" justifyContent="space-between" sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Total
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
                    {formatCurrency(totalAmount)}
                  </Typography>
                </Box>

                <Alert severity="info" sx={{ fontSize: '0.85rem' }}>
                  Paso {activeStep + 1} de {steps.length}
                </Alert>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Box display="flex" justifyContent="space-between" gap={2} sx={{ mt: 6 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={handleBack}
              disabled={activeStep === 0}
              sx={{
                py: 1.5,
                fontWeight: 600,
                fontSize: '0.95rem',
                textTransform: 'none',
                borderRadius: '10px',
                minWidth: '150px',
              }}
            >
              ← Atrás
            </Button>
            <Box flex={1} />
            <Button
              variant="contained"
              size="large"
              onClick={handleNext}
              disabled={isPending || (activeStep === 0 && !selectedAddress)}
              sx={{
                py: 1.5,
                fontWeight: 700,
                fontSize: '0.95rem',
                textTransform: 'none',
                borderRadius: '10px',
                minWidth: '200px',
              }}
            >
              {isPending ? (
                <CircularProgress size={20} />
              ) : activeStep === steps.length - 1 ? (
                'Confirmar Pedido →'
              ) : (
                'Siguiente →'
              )}
            </Button>
          </Box>
        </motion.div>
      </Box>
    </Container>
  );
}
