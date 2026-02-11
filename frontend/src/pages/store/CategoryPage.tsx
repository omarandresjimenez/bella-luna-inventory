import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  CircularProgress,
  Alert,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Container,
  Stack,
  IconButton,
  Divider,
} from '@mui/material';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Heart, Search, Filter } from 'lucide-react';
import { useProductsByCategory, useCategory } from '../../hooks/useProducts';
import { useFavoriteProductIds, useAddToFavorites, useRemoveFromFavorites } from '../../hooks/useFavorites';
import { useCustomerAuth } from '../../hooks/useCustomerAuth';
import type { Product } from '../../types';
import PageBreadcrumb from '../../components/store/PageBreadcrumb';
import { MotionWrapper } from '../../components/store/MotionWrapper';
import { GlassContainer } from '../../components/shared/GlassContainer';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');

  const isAll = slug === 'all';
  const { data: category, isLoading: categoryLoading } = useCategory(isAll ? '' : (slug || ''));
  const { data: products, isLoading: productsLoading, error } = useProductsByCategory(
    isAll ? '' : (slug || ''),
    {
      sortBy,
      search: searchQuery || undefined,
    }
  );

  const { isAuthenticated } = useCustomerAuth();
  const { data: favoriteProductIds } = useFavoriteProductIds();
  const addToFavorites = useAddToFavorites();
  const removeFromFavorites = useRemoveFromFavorites();

  const handleFavoriteClick = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const isFavorite = favoriteProductIds?.includes(productId) || false;
    if (isFavorite) {
      removeFromFavorites.mutate(productId);
    } else {
      addToFavorites.mutate(productId);
    }
  };

  if (categoryLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  const breadcrumbItems = [
    { label: category?.name || 'Todos los Productos' },
  ];

  const categoryTitle = category?.name || 'Nuestra Colección';
  const categoryDescription = category?.description || 'Descubre lo mejor en belleza y cuidado personal seleccionado exclusivamente para ti.';
  const categoryImage = category?.imageUrl || 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&q=80&w=2000';

  return (
    <Box sx={{ pb: 15 }}>
      {/* Category Hero Header */}
      <Box sx={{
        position: 'relative',
        height: '400px',
        mb: 8,
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden'
      }}>
        <Box sx={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `url(${categoryImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(to right, hsla(222, 47%, 13%, 0.9) 0%, hsla(222, 47%, 13%, 0.4) 60%, transparent 100%)',
          }
        }} />
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, color: 'white' }}>
          <MotionWrapper>
            <PageBreadcrumb items={breadcrumbItems} sx={{ mb: 4, '& .MuiBreadcrumbs-li, & .MuiBreadcrumbs-separator': { color: 'hsla(0, 0%, 100%, 0.7)' } }} />
            <Typography variant="h1" sx={{ color: 'white', mb: 2, fontSize: { xs: '3rem', md: '4rem' } }}>
              {categoryTitle}
            </Typography>
            <Typography variant="h6" sx={{ color: 'hsla(0, 0%, 100%, 0.8)', maxWidth: '600px', fontWeight: 300, lineHeight: 1.6 }}>
              {categoryDescription}
            </Typography>
          </MotionWrapper>
        </Container>
      </Box>

      <Container maxWidth="xl">
        {/* Modern Filters Section */}
        <MotionWrapper delay={0.2}>
          <GlassContainer sx={{
            p: 3,
            mb: 6,
            borderRadius: '24px',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', md: 'auto' }, alignItems: 'center' }}>
              <Filter size={20} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Filtrar por</Typography>
              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
              <TextField
                placeholder="Buscar productos..."
                variant="standard"
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search size={16} style={{ marginRight: 8, opacity: 0.5 }} />,
                  disableUnderline: true,
                }}
                sx={{
                  bgcolor: 'hsla(0, 0%, 0%, 0.04)',
                  px: 2, py: 1,
                  borderRadius: '12px',
                  minWidth: { md: 300 }
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'space-between', md: 'flex-end' }, alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {products?.length || 0} Productos encontrados
              </Typography>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel sx={{ fontSize: '0.8rem' }}>Ordenar por</InputLabel>
                <Select
                  value={sortBy}
                  label="Ordenar por"
                  onChange={(e) => setSortBy(e.target.value)}
                  sx={{ borderRadius: '12px', bgcolor: 'white' }}
                >
                  <MenuItem value="name">Alfabeto (A-Z)</MenuItem>
                  <MenuItem value="price">Precio (Más bajo)</MenuItem>
                  <MenuItem value="createdAt">Novedades</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </GlassContainer>
        </MotionWrapper>

        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: '16px' }}>
            Hubo un error al cargar la colección. Por favor inténtalo de nuevo.
          </Alert>
        )}

        {productsLoading ? (
          <Box display="flex" justifyContent="center" py={12}>
            <CircularProgress color="secondary" />
          </Box>
        ) : (
          <Grid container spacing={4}>
            {products?.map((product: Product, index: number) => {
              const isFavorite = favoriteProductIds?.includes(product.id) || false;
              return (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
                  <MotionWrapper delay={index * 0.05}>
                    <Card sx={{
                      height: '100%',
                      p: 1.5,
                      borderRadius: '32px',
                      background: 'white',
                      transition: 'transform 0.3s ease',
                      '&:hover': { transform: 'translateY(-8px)' }
                    }}>
                      <Box sx={{ position: 'relative', height: '280px', borderRadius: '24px', overflow: 'hidden' }}>
                        {product.discountPercent > 0 && (
                          <GlassContainer sx={{
                            position: 'absolute', top: 12, left: 12, zIndex: 2,
                            px: 1.5, py: 0.5, borderRadius: '10px'
                          }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'error.main' }}>
                              -{product.discountPercent}%
                            </Typography>
                          </GlassContainer>
                        )}
                        <IconButton
                          onClick={(e) => handleFavoriteClick(e, product.id)}
                          sx={{
                            position: 'absolute', top: 12, right: 12, zIndex: 2,
                            bgcolor: 'white',
                            color: isFavorite ? 'error.main' : 'inherit',
                            '&:hover': { bgcolor: 'secondary.main', color: 'white' }
                          }}
                        >
                          <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
                        </IconButton>
                        <Link to={`/product/${product.slug}`}>
                          <CardMedia
                            component="img"
                            image={(product.images && product.images.length > 0) ? product.images[0].mediumUrl : 'https://via.placeholder.com/600x800?text=No+Image'}
                            alt={product.name}
                            sx={{ height: '100%', objectFit: 'cover' }}
                          />
                        </Link>
                      </Box>
                      <CardContent sx={{ px: 2, pt: 3, pb: 2 }}>
                        <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                          {product.brand || 'Colección'}
                        </Typography>
                        <Typography
                          variant="h6"
                          component={Link}
                          to={`/product/${product.slug}`}
                          sx={{
                            textDecoration: 'none',
                            color: 'primary.main',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            mb: 1.5,
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            '&:hover': { color: 'secondary.main' }
                          }}
                        >
                          {product.name}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            ${product.finalPrice}
                          </Typography>
                          {product.discountPercent > 0 && (
                            <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary', opacity: 0.6 }}>
                              ${product.basePrice}
                            </Typography>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </MotionWrapper>
                </Grid>
              );
            })}
          </Grid>
        )}

        {!productsLoading && products?.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>No se encontraron matches</Typography>
            <Typography color="text.secondary">Intenta ajustar tus filtros o buscar algo diferente.</Typography>
            <Button variant="text" onClick={() => setSearchQuery('')} sx={{ mt: 2 }}>Ver todo el catálogo</Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}
