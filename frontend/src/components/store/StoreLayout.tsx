import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
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
  Stack,
  styled,
} from '@mui/material';
import {
  ShoppingBag,
  User,
  ChevronDown,
  LayoutGrid,
  Search,
  Instagram,
  Facebook,
  Twitter
} from 'lucide-react';
import { useCustomerAuth } from '../../hooks/useCustomerAuth';
import { useCategories } from '../../hooks/useProducts';

const NavButton = styled(Button)<{ component?: any; to?: string }>(() => ({
  color: 'inherit',
  fontSize: '0.9rem',
  fontWeight: 500,
  padding: '8px 16px',
  '&:hover': {
    backgroundColor: 'hsla(0, 0%, 0%, 0.05)',
  },
}));

export default function StoreLayout() {
  const { customer, isAuthenticated, logout, cart } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [categoriesAnchorEl, setCategoriesAnchorEl] = useState<null | HTMLElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const { data: categories } = useCategories();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCategoriesMenu = (event: React.MouseEvent<HTMLElement>) => {
    setCategoriesAnchorEl(event.currentTarget);
  };

  const handleCategoriesClose = () => {
    setCategoriesAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    handleClose();
    navigate('/');
  };

  const cartItemCount = cart?.items?.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0) || 0;

  const isHomePage = location.pathname === '/';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          background: isScrolled || !isHomePage
            ? 'hsla(0, 0%, 100%, 0.9)'
            : 'linear-gradient(to bottom, hsla(222, 47%, 13%, 0.5) 0%, transparent 100%)',
          backdropFilter: isScrolled || !isHomePage ? 'blur(20px) saturate(180%)' : 'none',
          boxShadow: isScrolled ? '0 1px 10px hsla(222, 47%, 11%, 0.05)' : 'none',
          borderBottom: isScrolled || !isHomePage ? '1px solid hsla(222, 47%, 11%, 0.05)' : 'none',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          pt: isScrolled ? 0 : 1,
          color: 'white',
          ...(isScrolled || !isHomePage ? { color: 'primary.main' } : {}),
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 0, sm: 0 } }}>
            {/* Logo */}
            <Typography
              variant="h4"
              component={Link}
              to="/"
              sx={{
                fontFamily: '"Cormorant Garamond", serif',
                fontWeight: 600,
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                fontSize: { xs: '1.5rem', md: '2rem' }
              }}
            >
              <Box sx={{
                bgcolor: 'secondary.main',
                width: 10,
                height: 10,
                borderRadius: '50%',
                boxShadow: '0 0 15px hsla(14, 46%, 66%, 0.5)'
              }} />
              Bella Luna
            </Typography>

            {/* Desktop Navigation */}
            <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
              <NavButton component={Link} to="/">Inicio</NavButton>

              <NavButton
                onClick={handleCategoriesMenu}
                endIcon={<ChevronDown size={14} />}
                startIcon={<LayoutGrid size={18} />}
              >
                Categorías
              </NavButton>

              <Menu
                anchorEl={categoriesAnchorEl}
                open={Boolean(categoriesAnchorEl)}
                onClose={handleCategoriesClose}
                disableScrollLock
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    minWidth: 260,
                    p: 1,
                    borderRadius: '20px',
                    boxShadow: '0 20px 40px hsla(222, 47%, 11%, 0.1)',
                    border: '1px solid hsla(222, 47%, 11%, 0.05)'
                  }
                }}
              >
                <MenuItem
                  component={Link}
                  to="/category/all"
                  onClick={handleCategoriesClose}
                  sx={{ borderRadius: '12px', fontWeight: 600, mb: 0.5 }}
                >
                  Explorar todo el catálogo
                </MenuItem>
                <Box sx={{ borderTop: '1px solid hsla(222, 47%, 11%, 0.05)', my: 1, mx: 1 }} />
                {categories?.map((category) => (
                  <MenuItem
                    key={category.id}
                    component={Link}
                    to={`/category/${category.slug}`}
                    onClick={handleCategoriesClose}
                    sx={{ borderRadius: '12px' }}
                  >
                    {category.name}
                  </MenuItem>
                ))}
              </Menu>
            </Stack>

            {/* Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1.5 } }}>
              <IconButton color="inherit">
                <Search size={22} />
              </IconButton>

              <IconButton color="inherit" component={Link} to="/cart">
                <Badge
                  badgeContent={cartItemCount}
                  color="secondary"
                  sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', height: 18, minWidth: 18 } }}
                >
                  <ShoppingBag size={22} />
                </Badge>
              </IconButton>

              {isAuthenticated ? (
                <>
                  <IconButton color="inherit" onClick={handleMenu}>
                    <User size={22} />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    disableScrollLock
                    PaperProps={{
                      sx: { mt: 1.5, minWidth: 200, p: 1, borderRadius: '20px', boxShadow: '0 20px 40px hsla(222, 47%, 11%, 0.1)' }
                    }}
                  >
                    <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid hsla(222, 47%, 11%, 0.05)', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {customer?.firstName} {customer?.lastName}
                      </Typography>
                    </Box>
                    <MenuItem component={Link} to="/orders" onClick={handleClose} sx={{ borderRadius: '12px' }}>
                      Mis Pedidos
                    </MenuItem>
                    <MenuItem onClick={handleLogout} sx={{ borderRadius: '12px', color: 'error.main' }}>Cerrar Sesión</MenuItem>
                  </Menu>
                </>
              ) : (
                <Button
                  variant="contained"
                  color="secondary"
                  component={Link}
                  to="/login"
                  sx={{
                    borderRadius: '50px',
                    px: { xs: 2.5, sm: 4 },
                    fontSize: '0.8rem',
                    letterSpacing: '0.1em'
                  }}
                >
                  Unirse
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, pt: isHomePage ? 0 : { xs: 8, md: 10 } }}>
        <Outlet />
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          pt: 10,
          pb: 6,
          mt: 8,
          borderTop: '1px solid hsla(222, 47%, 11%, 0.05)',
          bgcolor: 'hsl(0, 0%, 100%)'
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={6}
            justifyContent="space-between"
            sx={{ mb: 8 }}
          >
            <Box sx={{ maxWidth: 300 }}>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontWeight: 600,
                  mb: 2.5,
                  fontSize: '1.8rem'
                }}
              >
                Bella Luna
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                Elegancia y calidad en cada detalle. Descubre nuestra colección exclusiva diseñada para resaltar tu belleza natural.
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <IconButton size="small" sx={{ bgcolor: 'hsla(222, 47%, 11%, 0.03)' }}><Instagram size={18} /></IconButton>
                <IconButton size="small" sx={{ bgcolor: 'hsla(222, 47%, 11%, 0.03)' }}><Facebook size={18} /></IconButton>
                <IconButton size="small" sx={{ bgcolor: 'hsla(222, 47%, 11%, 0.03)' }}><Twitter size={18} /></IconButton>
              </Stack>
            </Box>

            <Stack direction="row" spacing={{ xs: 6, sm: 12 }}>
              <Stack spacing={2}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Tienda</Typography>
                <Link to="/category/all" style={{ textDecoration: 'none', color: 'inherit', fontSize: '0.875rem' }}>Catálogo</Link>
                <Link to="/category/maquillaje" style={{ textDecoration: 'none', color: 'inherit', fontSize: '0.875rem' }}>Maquillaje</Link>
                <Link to="/category/skincare" style={{ textDecoration: 'none', color: 'inherit', fontSize: '0.875rem' }}>Skincare</Link>
              </Stack>
              <Stack spacing={2}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Cuenta</Typography>
                <Link to="/login" style={{ textDecoration: 'none', color: 'inherit', fontSize: '0.875rem' }}>Ingresar</Link>
                <Link to="/register" style={{ textDecoration: 'none', color: 'inherit', fontSize: '0.875rem' }}>Registrarse</Link>
                <Link to="/orders" style={{ textDecoration: 'none', color: 'inherit', fontSize: '0.875rem' }}>Mis Pedidos</Link>
              </Stack>
            </Stack>
          </Stack>

          <Box sx={{ pt: 4, borderTop: '1px solid hsla(222, 47%, 11%, 0.05)', textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              © 2026 Bella Luna Luxury Beauty. Todos los derechos reservados.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
