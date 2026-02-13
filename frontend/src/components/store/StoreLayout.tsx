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
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
} from '@mui/material';
import {
  ShoppingBag,
  User,
  Heart,
  ChevronDown,
  LayoutGrid,
  Search,
  Instagram,
  Facebook,
  Twitter,
  Menu as MenuIcon,
  X,
  LogOut,
} from 'lucide-react';
import { useCustomerAuth } from '../../hooks/useCustomerAuth';
import { useCategories } from '../../hooks/useProducts';
import { useCart } from '../../hooks/useCustomer';

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
  const { customer, isAuthenticated, logout, cart: contextCart } = useCustomerAuth();
  const { data: cartData } = useCart();
  const cart = isAuthenticated ? contextCart : cartData;
  
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [categoriesAnchorEl, setCategoriesAnchorEl] = useState<null | HTMLElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    setMobileMenuOpen(false);
    navigate('/');
  };

  const cartItemCount = cart?.items?.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0) || 0;

  const isHomePage = location.pathname === '/';

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          background: isScrolled || !isHomePage
            ? 'hsla(0, 0%, 100%, 0.95)'
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
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 0, sm: 0 }, minHeight: { xs: 64, md: 72 } }}>
            {/* Mobile Menu Button */}
            <IconButton
              color="inherit"
              onClick={toggleMobileMenu}
              sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}
            >
              <MenuIcon size={24} />
            </IconButton>

            {/* Logo */}
            <Box
              component={Link}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                backgroundColor: isScrolled || !isHomePage 
                  ? 'transparent' 
                  : 'rgba(255, 255, 255, 0.95)',
                padding: { xs: '4px 12px', md: '6px 16px' },
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                flexShrink: 0,
              }}
            >
              <Box
                component="img"
                src="/logo.png"
                alt="Bella Luna"
                sx={{
                  height: { xs: '36px', sm: '40px', md: '50px' },
                  width: 'auto',
                  display: 'block',
                }}
              />
            </Box>

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
                  <Box key={category.id}>
                    <MenuItem
                      component={Link}
                      to={`/category/${category.slug}`}
                      onClick={handleCategoriesClose}
                      sx={{ borderRadius: '12px', fontWeight: 600, color: 'primary.main' }}
                    >
                      {category.name}
                    </MenuItem>
                    {category.children && category.children.length > 0 && (
                      <Box sx={{ pl: 2 }}>
                        {category.children.map((child: any) => (
                          <MenuItem
                            key={child.id}
                            component={Link}
                            to={`/category/${child.slug}`}
                            onClick={handleCategoriesClose}
                            sx={{ 
                              borderRadius: '12px', 
                              fontSize: '0.875rem',
                              color: 'text.secondary',
                              pl: 3
                            }}
                          >
                            {child.name}
                          </MenuItem>
                        ))}
                      </Box>
                    )}
                  </Box>
                ))}
              </Menu>
            </Stack>

            {/* Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1.5 } }}>
              <IconButton color="inherit" sx={{ display: { xs: 'none', sm: 'flex' } }}>
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

              {/* Desktop User Menu */}
              <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
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
                      <MenuItem component={Link} to="/favorites" onClick={handleClose} sx={{ borderRadius: '12px' }}>
                        <Heart size={16} style={{ marginRight: 8 }} />
                        Mis Favoritos
                      </MenuItem>
                      <MenuItem component={Link} to="/orders" onClick={handleClose} sx={{ borderRadius: '12px' }}>
                        <ShoppingBag size={16} style={{ marginRight: 8 }} />
                        Mis Pedidos
                      </MenuItem>
                      <MenuItem component={Link} to="/profile" onClick={handleClose} sx={{ borderRadius: '12px' }}>
                        <User size={16} style={{ marginRight: 8 }} />
                        Mi Perfil
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

              {/* Mobile Search - shown only on mobile */}
              <IconButton color="inherit" sx={{ display: { xs: 'flex', sm: 'none' } }}>
                <Search size={20} />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer Menu */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={closeMobileMenu}
        PaperProps={{
          sx: {
            width: '85%',
            maxWidth: '320px',
            bgcolor: 'background.paper',
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box
            component="img"
            src="/logo.png"
            alt="Bella Luna"
            sx={{ height: '40px', width: 'auto' }}
          />
          <IconButton onClick={closeMobileMenu}>
            <X size={24} />
          </IconButton>
        </Box>
        
        <Divider />
        
        {isAuthenticated && (
          <Box sx={{ p: 2, bgcolor: 'hsla(222, 47%, 13%, 0.03)' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              {customer?.firstName} {customer?.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {customer?.email}
            </Typography>
          </Box>
        )}

        <List sx={{ pt: 1 }}>
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/" onClick={closeMobileMenu}>
              <ListItemText primary="Inicio" />
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/category/all" onClick={closeMobileMenu}>
              <ListItemText primary="Todos los Productos" />
            </ListItemButton>
          </ListItem>

          <Divider sx={{ my: 1 }} />
          
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Categorías
            </Typography>
          </Box>
          
          {categories?.map((category) => (
            <Box key={category.id}>
              <ListItem disablePadding>
                <ListItemButton 
                  component={Link} 
                  to={`/category/${category.slug}`} 
                  onClick={closeMobileMenu}
                  sx={{ pl: 2, fontWeight: 600 }}
                >
                  <ListItemText primary={category.name} primaryTypographyProps={{ fontWeight: 600 }} />
                </ListItemButton>
              </ListItem>
              {category.children && category.children.length > 0 && (
                category.children.map((child: any) => (
                  <ListItem key={child.id} disablePadding>
                    <ListItemButton 
                      component={Link} 
                      to={`/category/${child.slug}`} 
                      onClick={closeMobileMenu}
                      sx={{ pl: 5 }}
                    >
                      <ListItemText 
                        primary={child.name} 
                        primaryTypographyProps={{ 
                          fontSize: '0.875rem',
                          color: 'text.secondary'
                        }} 
                      />
                    </ListItemButton>
                  </ListItem>
                ))
              )}
            </Box>
          ))}

          <Divider sx={{ my: 1 }} />

          {isAuthenticated ? (
            <>
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/favorites" onClick={closeMobileMenu}>
                  <Heart size={18} style={{ marginRight: 12 }} />
                  <ListItemText primary="Mis Favoritos" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/orders" onClick={closeMobileMenu}>
                  <ShoppingBag size={18} style={{ marginRight: 12 }} />
                  <ListItemText primary="Mis Pedidos" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <LogOut size={18} style={{ marginRight: 12 }} />
                  <ListItemText primary="Cerrar Sesión" />
                </ListItemButton>
              </ListItem>
            </>
          ) : (
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/login" onClick={closeMobileMenu}>
                <User size={18} style={{ marginRight: 12 }} />
                <ListItemText primary="Iniciar Sesión" />
              </ListItemButton>
            </ListItem>
          )}
        </List>
      </Drawer>

      {/* Spacer for fixed AppBar */}
      <Box sx={{ height: { xs: 64, md: 80 } }} />

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: { xs: 4, md: 8 }, mt: 'auto' }}>
        <Container maxWidth="xl">
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={{ xs: 3, md: 4 }}>
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Box
                component="img"
                src="/logo.png"
                alt="Bella Luna"
                sx={{
                  height: { xs: '40px', md: '50px' },
                  width: 'auto',
                  mb: 2,
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  padding: '8px 16px',
                  borderRadius: '8px',
                }}
              />
              <Typography variant="body2" sx={{ opacity: 0.7, maxWidth: 300, fontSize: { xs: '0.875rem', md: '1rem' } }}>
                Belleza y cuidado personal seleccionado exclusivamente para ti.
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <IconButton sx={{ color: 'white', '&:hover': { color: 'secondary.main' } }}>
                <Instagram size={20} />
              </IconButton>
              <IconButton sx={{ color: 'white', '&:hover': { color: 'secondary.main' } }}>
                <Facebook size={20} />
              </IconButton>
              <IconButton sx={{ color: 'white', '&:hover': { color: 'secondary.main' } }}>
                <Twitter size={20} />
              </IconButton>
            </Stack>
          </Stack>
          <Box sx={{ borderTop: '1px solid hsla(0, 0%, 100%, 0.1)', mt: { xs: 4, md: 6 }, pt: { xs: 3, md: 4 }, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ opacity: 0.5 }}>
              © 2026 Bella Luna. Todos los derechos reservados.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
