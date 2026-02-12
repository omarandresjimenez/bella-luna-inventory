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
import { validateEmail, validatePassword, type ValidationError } from '../../utils/validation';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useCustomerAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const errors: ValidationError[] = [];

    // Validate email
    const emailError = validateEmail(email);
    if (emailError) {
      errors.push({ field: 'email', message: emailError });
    }

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      errors.push({ field: 'password', message: passwordError });
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
      await login(email, password);
      console.log('Login successful, navigating to home...');
      navigate('/');
    } catch (err: unknown) {
      const errorMessage = getUserFriendlyErrorMessage(err);
      setError(errorMessage);
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
            Bienvenido
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Inicia sesión para continuar
          </Typography>
        </Box>

        {/* Server Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

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
          <TextField
            fullWidth
            label="Contraseña"
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setValidationErrors(prev => prev.filter(err => err.field !== 'password'));
            }}
            error={!!getFieldError('password')}
            helperText={getFieldError('password')}
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
            {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Inicia Sesión'}
          </Button>
        </Box>

        <Box textAlign="center" mt={4}>
          <Typography variant="body2" color="text.secondary">
            ¿No tienes cuenta?{' '}
            <MuiLink
              component={Link}
              to="/register"
              sx={{
                fontWeight: 700,
                color: 'secondary.main',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Regístrate ahora
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
