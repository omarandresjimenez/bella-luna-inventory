import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Link as MuiLink,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useCustomerAuth } from '../../hooks/useCustomerAuth';
import { getUserFriendlyErrorMessage } from '../../utils/validationMessages';
import { 
  validateEmail, 
  validatePassword, 
  validateName, 
  validatePhone, 
  validatePasswordMatch,
  type ValidationError 
} from '../../utils/validation';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useCustomerAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const errors: ValidationError[] = [];

    // Validate firstName
    const firstNameError = validateName(formData.firstName, 'nombre');
    if (firstNameError) {
      errors.push({ field: 'firstName', message: firstNameError });
    }

    // Validate lastName
    const lastNameError = validateName(formData.lastName, 'apellido');
    if (lastNameError) {
      errors.push({ field: 'lastName', message: lastNameError });
    }

    // Validate email
    const emailError = validateEmail(formData.email);
    if (emailError) {
      errors.push({ field: 'email', message: emailError });
    }

    // Validate phone
    const phoneError = validatePhone(formData.phone);
    if (phoneError) {
      errors.push({ field: 'phone', message: phoneError });
    }

    // Validate password
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      errors.push({ field: 'password', message: passwordError });
    }

    // Validate password match
    const confirmPasswordError = validatePasswordMatch(formData.password, formData.confirmPassword);
    if (confirmPasswordError) {
      errors.push({ field: 'confirmPassword', message: confirmPasswordError });
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationErrors([]);

    // Client-side validation
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });
      navigate('/');
    } catch (err: unknown) {
      const errorMessage = getUserFriendlyErrorMessage(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear validation error for this field when user starts typing
    setValidationErrors(prev => prev.filter(err => err.field !== name));
  };

  const getFieldError = (field: string): string | undefined => {
    return validationErrors.find(e => e.field === field)?.message;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        py: { xs: 2, sm: 0 }
      }}
    >
      <Paper elevation={3} sx={{ p: { xs: 3, sm: 4 }, width: '100%', maxWidth: 400, mx: { xs: 2, sm: 'auto' }, borderRadius: 4 }}>
        <Typography variant="h4" gutterBottom textAlign="center" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          Crear Cuenta
        </Typography>

        {/* Server Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Nombre"
            name="firstName"
            margin="normal"
            value={formData.firstName}
            onChange={handleChange}
            error={!!getFieldError('firstName')}
            helperText={getFieldError('firstName')}
            required
            InputProps={{ sx: { borderRadius: 2 } }}
          />
          <TextField
            fullWidth
            label="Apellido"
            name="lastName"
            margin="normal"
            value={formData.lastName}
            onChange={handleChange}
            error={!!getFieldError('lastName')}
            helperText={getFieldError('lastName')}
            required
            InputProps={{ sx: { borderRadius: 2 } }}
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            margin="normal"
            value={formData.email}
            onChange={handleChange}
            error={!!getFieldError('email')}
            helperText={getFieldError('email')}
            required
            InputProps={{ sx: { borderRadius: 2 } }}
          />
          <TextField
            fullWidth
            label="Teléfono"
            name="phone"
            margin="normal"
            value={formData.phone}
            onChange={handleChange}
            error={!!getFieldError('phone')}
            helperText={getFieldError('phone') || 'Mínimo 10 dígitos'}
            required
            InputProps={{ sx: { borderRadius: 2 } }}
          />
          <TextField
            fullWidth
            label="Contraseña"
            name="password"
            type="password"
            margin="normal"
            value={formData.password}
            onChange={handleChange}
            error={!!getFieldError('password')}
            helperText={getFieldError('password')}
            required
            InputProps={{ sx: { borderRadius: 2 } }}
          />
          <TextField
            fullWidth
            label="Confirmar Contraseña"
            name="confirmPassword"
            type="password"
            margin="normal"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={!!getFieldError('confirmPassword')}
            helperText={getFieldError('confirmPassword')}
            required
            InputProps={{ sx: { borderRadius: 2 } }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: { xs: 2.5, sm: 3 }, py: { xs: 1, sm: 1.5 }, fontSize: { xs: '0.9rem', sm: '1rem' } }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={20} /> : 'Registrar'}
          </Button>
        </Box>

        <Box textAlign="center" mt={{ xs: 1.5, sm: 2 }}>
          <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
            ¿Ya tienes cuenta?{' '}
            <MuiLink component={Link} to="/login" sx={{ fontWeight: 600 }}>
              Inicia sesión
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
