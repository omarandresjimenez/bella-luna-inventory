import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Link as MuiLink,
} from '@mui/material';
import { Link } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import authApi from '../../services/authApi';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verificando tu email...');

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Enlace de verificación inválido. El token no fue proporcionado.');
      return;
    }

    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await authApi.verifyEmailWithToken(verificationToken);
      
      if (response.data.success) {
        setStatus('success');
        setMessage('¡Tu email ha sido verificado exitosamente! Ya puedes iniciar sesión.');
        
        // Store the token if provided
        if (response.data.data?.token) {
          localStorage.setItem('customerToken', response.data.data.token);
        }
        
        // Redirect to home after 3 seconds if token was provided
        if (response.data.data?.token) {
          setTimeout(() => {
            navigate('/');
          }, 3000);
        }
      } else {
        setStatus('error');
        setMessage(response.data.message || 'No se pudo verificar tu email. El enlace puede haber expirado.');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(
        error.response?.data?.message || 
        'Error al verificar tu email. Por favor intenta nuevamente o solicita un nuevo enlace.'
      );
    }
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
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 3, sm: 4 }, 
          width: '100%', 
          maxWidth: 450, 
          mx: { xs: 2, sm: 'auto' }, 
          borderRadius: 4,
          textAlign: 'center'
        }}
      >
        {status === 'loading' && (
          <>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Verificando tu email
            </Typography>
            <Typography color="text.secondary">
              {message}
            </Typography>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircleIcon 
              color="success" 
              sx={{ fontSize: 80, mb: 2 }} 
            />
            <Typography variant="h4" gutterBottom color="success.main">
              ¡Verificación Exitosa!
            </Typography>
            <Typography color="text.secondary" paragraph>
              {message}
            </Typography>
            <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
              Tu cuenta ha sido activada correctamente.
            </Alert>
            <Button
              component={Link}
              to="/"
              variant="contained"
              size="large"
              fullWidth
              sx={{ mt: 2 }}
            >
              Ir a la tienda
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <ErrorIcon 
              color="error" 
              sx={{ fontSize: 80, mb: 2 }} 
            />
            <Typography variant="h4" gutterBottom color="error">
              Verificación Fallida
            </Typography>
            <Typography color="text.secondary" paragraph>
              {message}
            </Typography>
            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
              El enlace puede haber expirado (válido por 24 horas) o ya fue utilizado.
            </Alert>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
              <Button
                component={Link}
                to="/login"
                variant="contained"
                size="large"
                fullWidth
              >
                Iniciar Sesión
              </Button>
              <Button
                component={Link}
                to="/register"
                variant="outlined"
                size="large"
                fullWidth
              >
                Crear nueva cuenta
              </Button>
            </Box>
          </>
        )}

        <Box mt={3}>
          <Typography variant="body2" color="text.secondary">
            ¿Necesitas ayuda?{' '}
            <MuiLink component={Link} to="/contact" sx={{ fontWeight: 600 }}>
              Contáctanos
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
