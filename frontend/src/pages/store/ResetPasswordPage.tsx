import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { validatePassword, type ValidationError } from '../../utils/validation';
import authApi from '../../services/authApi';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Token de recuperación inválido o no proporcionado');
        setIsValidatingToken(false);
        return;
      }

      try {
        const response = await authApi.validateResetToken(token);
        if (response.data.data.valid) {
          setTokenValid(true);
          setEmail(response.data.data.email || '');
        } else {
          setError('El enlace de recuperación es inválido o ha expirado');
        }
      } catch (err) {
        setError('El enlace de recuperación es inválido o ha expirado');
      } finally {
        setIsValidatingToken(false);
      }
    };

    validateToken();
  }, [token]);

  const validateForm = (): boolean => {
    const errors: ValidationError[] = [];

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      errors.push({ field: 'password', message: passwordError });
    }

    // Validate confirm password
    if (password !== confirmPassword) {
      errors.push({ field: 'confirmPassword', message: 'Las contraseñas no coinciden' });
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

    if (!token) {
      setError('Token no válido');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.resetPassword(token, password);
      if (response.data.data.success) {
        setSuccess(true);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.data.data.message || 'Error al restablecer contraseña');
      }
    } catch (err: unknown) {
      setError('Error al restablecer la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldError = (field: string): string | undefined => {
    return validationErrors.find(e => e.field === field)?.message;
  };

  // Show loading state while validating token
  if (isValidatingToken) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Show error if token is invalid
  if (!tokenValid) {
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
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              <MuiLink
                component={Link}
                to="/forgot-password"
                sx={{
                  fontWeight: 700,
                  color: 'secondary.main',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Solicitar un nuevo enlace
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

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
            Nueva Contraseña
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            {email ? `Restableciendo contraseña para ${email}` : 'Ingresa tu nueva contraseña'}
          </Typography>
        </Box>

        {/* Success Message */}
        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              ¡Contraseña restablecida!
            </Typography>
            <Typography variant="body2">
              Tu contraseña ha sido actualizada correctamente. Redirigiendo al login...
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
              label="Nueva contraseña"
              type="password"
              margin="normal"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setValidationErrors(prev => prev.filter(err => err.field !== 'password'));
              }}
              error={!!getFieldError('password')}
              helperText={getFieldError('password') || 'Mínimo 8 caracteres'}
              required
              InputProps={{ sx: { borderRadius: 2 } }}
            />
            <TextField
              fullWidth
              label="Confirmar contraseña"
              type="password"
              margin="normal"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setValidationErrors(prev => prev.filter(err => err.field !== 'confirmPassword'));
              }}
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
              {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Restablecer contraseña'}
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
