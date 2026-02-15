import { useState } from 'react';
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
import { validateEmail, type ValidationError } from '../../utils/validation';
import authApi from '../../services/authApi';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const errors: ValidationError[] = [];

    // Validate email
    const emailError = validateEmail(email);
    if (emailError) {
      errors.push({ field: 'email', message: emailError });
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setValidationErrors([]);

    // Client-side validation
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.forgotPassword(email);
      if (response.data.success) {
        setSuccess(true);
      } else {
        setError(response.data.data.message || 'Error al enviar el correo');
      }
    } catch (err: unknown) {
      setError('Error al enviar el correo de recuperación');
    } finally {
      setIsLoading(false);
    }
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
        minHeight: '80vh',
        background: 'radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.05) 0%, transparent 100%)',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4, md: 5 },
          width: '100%',
          maxWidth: 440,
          mx: { xs: 2, sm: 'auto' },
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'grey.200',
          boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: { xs: 3, sm: 4 } }}>
          <Box
            sx={{
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 },
              bgcolor: 'primary.main',
              borderRadius: 2,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              fontWeight: 800,
              mb: 2,
              boxShadow: '0 10px 20px rgba(15, 23, 42, 0.2)'
            }}
          >
            B
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 1, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
            Recuperar Contraseña
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
          </Typography>
        </Box>

        {/* Success Message */}
        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              ¡Correo enviado!
            </Typography>
            <Typography variant="body2">
              Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña. Por favor revisa tu bandeja de entrada.
            </Typography>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {!success && (
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Correo electrónico"
              type="email"
              margin="normal"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setValidationErrors(prev => prev.filter(err => err.field !== 'email'));
              }}
              error={!!getFieldError('email')}
              helperText={getFieldError('email')}
              required
              InputProps={{ sx: { borderRadius: 2 } }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{
                mt: { xs: 3, sm: 4 },
                py: { xs: 1, sm: 1.5 },
                borderRadius: 2,
                fontSize: { xs: '0.9rem', sm: '1rem' },
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: '0 10px 20px rgba(15, 23, 42, 0.15)',
                '&:hover': {
                  boxShadow: '0 15px 30px rgba(15, 23, 42, 0.2)',
                }
              }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Enviar enlace de recuperación'}
            </Button>
          </Box>
        )}

        <Box textAlign="center" mt={4}>
          <Typography variant="body2" color="text.secondary">
            ¿Recordaste tu contraseña?{' '}
            <MuiLink
              component={Link}
              to="/login"
              sx={{
                fontWeight: 700,
                color: 'secondary.main',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Inicia sesión
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
