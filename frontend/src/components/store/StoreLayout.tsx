import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  IconButton,
  Badge,
  Button,
  Menu,
  MenuItem,
  alpha,
  useScrollTrigger,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useCustomerAuth } from '../../hooks/useCustomerAuth';

function ElevationScroll(props: { children: React.ReactElement }) {
  const { children } = props;
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
    style: {
      backgroundColor: trigger ? alpha('#FFFFFF', 0.95) : alpha('#FFFFFF', 0.8),
      backdropFilter: 'blur(12px)',
      transition: 'all 0.3s ease-in-out',
      ...children.props.style,
    },
  } as React.HTMLAttributes<HTMLDivElement>);
}

export default function StoreLayout() {
  const { customer, isAuthenticated, logout, cart } = useCustomerAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    handleClose();
    navigate('/');
  };

  const cartItemCount = cart?.items?.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0) || 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <ElevationScroll>
        <AppBar position="sticky" color="inherit">
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Typography
              variant="h5"
              component={Link}
              to="/"
              sx={{
                fontWeight: 800,
                textDecoration: 'none',
                color: 'primary.main',
                letterSpacing: '-0.02em',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Box sx={{ bgcolor: 'secondary.main', width: 12, height: 12, borderRadius: '50%' }} />
              Bella Luna
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                color="inherit"
                component={Link}
                to="/"
                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
              >
                Inicio
              </Button>

              <IconButton color="inherit" component={Link} to="/cart">
                <Badge badgeContent={cartItemCount} color="secondary">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>

              {isAuthenticated ? (
                <>
                  <IconButton color="inherit" onClick={handleMenu}>
                    <AccountCircleIcon />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    PaperProps={{
                      sx: { mt: 1.5, minWidth: 180, borderRadius: 2, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }
                    }}
                  >
                    <Box sx={{ px: 2, py: 1, borderBottom: '1px solid #eee' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {customer?.firstName} {customer?.lastName}
                      </Typography>
                    </Box>
                    <MenuItem component={Link} to="/orders" onClick={handleClose}>
                      Mis Pedidos
                    </MenuItem>
                    <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>Cerrar Sesión</MenuItem>
                  </Menu>
                </>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/login"
                  sx={{ borderRadius: '50px', px: 3 }}
                >
                  Regístrate
                </Button>
              )}
            </Box>
          </Toolbar>
        </AppBar>
      </ElevationScroll>

      <Container maxWidth="lg" sx={{ flexGrow: 1, py: 6 }}>
        <Outlet />
      </Container>

      <Box component="footer" sx={{ py: 6, mt: 8, borderTop: '1px solid #E2E8F0', bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Bella Luna
          </Typography>
          <Typography variant="body2" color="text.secondary">
            © 2026 Bella Luna. Todos los derechos reservados.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
