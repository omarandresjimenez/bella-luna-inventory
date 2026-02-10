import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import { useCart, useCreateOrder, useAddresses } from '../../hooks/useCustomer';
import type { Address } from '../../types';

const steps = ['Dirección de Envío', 'Método de Entrega', 'Método de Pago', 'Confirmar Pedido'];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const { data: cart } = useCart();
  const { data: addresses } = useAddresses();
  const { mutate: createOrder, isPending } = useCreateOrder();

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [deliveryType, setDeliveryType] = useState<'HOME_DELIVERY' | 'STORE_PICKUP'>('HOME_DELIVERY');
  const [paymentMethod, setPaymentMethod] = useState<'CASH_ON_DELIVERY' | 'STORE_PAYMENT'>('CASH_ON_DELIVERY');
  const [customerNotes, setCustomerNotes] = useState('');

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = () => {
    if (!selectedAddress) return;

    createOrder(
      {
        shippingAddress: selectedAddress,
        deliveryType,
        paymentMethod,
        customerNotes: customerNotes || undefined,
      },
      {
        onSuccess: () => {
          navigate('/orders');
        },
      }
    );
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
            <Typography variant="h6" gutterBottom>
              Selecciona una dirección de envío
            </Typography>
            {addresses?.map((address) => (
              <Card
                key={address.id}
                sx={{
                  mb: 2,
                  cursor: 'pointer',
                  border: selectedAddress?.id === address.id ? 2 : 0,
                  borderColor: 'primary.main',
                }}
                onClick={() => setSelectedAddress(address)}
              >
                <CardContent>
                  <Typography>{address.street}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {address.city}, {address.state} {address.zipCode}
                  </Typography>
                  {address.isDefault && (
                    <Typography variant="body2" color="primary">
                      Dirección predeterminada
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))}
            {!selectedAddress && (
              <Alert severity="warning">Por favor selecciona una dirección</Alert>
            )}
          </Box>
        );

      case 1:
        return (
          <FormControl component="fieldset">
            <Typography variant="h6" gutterBottom>
              Método de entrega
            </Typography>
            <RadioGroup
              value={deliveryType}
              onChange={(e) => setDeliveryType(e.target.value as 'HOME_DELIVERY' | 'STORE_PICKUP')}
            >
              <FormControlLabel
                value="HOME_DELIVERY"
                control={<Radio />}
                label="Envío a domicilio"
              />
              <FormControlLabel
                value="STORE_PICKUP"
                control={<Radio />}
                label="Recoger en tienda"
              />
            </RadioGroup>
          </FormControl>
        );

      case 2:
        return (
          <FormControl component="fieldset">
            <Typography variant="h6" gutterBottom>
              Método de pago
            </Typography>
            <RadioGroup
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as 'CASH_ON_DELIVERY' | 'STORE_PAYMENT')}
            >
              <FormControlLabel
                value="CASH_ON_DELIVERY"
                control={<Radio />}
                label="Pago contra entrega"
              />
              <FormControlLabel
                value="STORE_PAYMENT"
                control={<Radio />}
                label="Pago en tienda"
              />
            </RadioGroup>
            <TextField
              label="Notas adicionales (opcional)"
              multiline
              rows={3}
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              sx={{ mt: 2 }}
            />
          </FormControl>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Resumen del Pedido
            </Typography>
            <Card>
              <CardContent>
                {cart.items.map((item) => (
                  <Box key={item.id} display="flex" justifyContent="space-between" mb={1}>
                    <Typography>
                      {item.productName} x {item.quantity}
                    </Typography>
                    <Typography>${item.totalPrice.toFixed(2)}</Typography>
                  </Box>
                ))}
                <Divider sx={{ my: 2 }} />
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h6">Total</Typography>
                  <Typography variant="h6">${cart.subtotal.toFixed(2)}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mb: 4 }}>{renderStepContent()}</Box>

      <Box display="flex" justifyContent="space-between">
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Atrás
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={
            isPending ||
            (activeStep === 0 && !selectedAddress)
          }
        >
          {isPending ? (
            <CircularProgress size={24} />
          ) : activeStep === steps.length - 1 ? (
            'Confirmar Pedido'
          ) : (
            'Siguiente'
          )}
        </Button>
      </Box>
    </Box>
  );
}
