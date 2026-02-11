import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  CircularProgress,
  Button,
  Container,
  Stack,
  IconButton,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useFavorites, useRemoveFromFavorites } from '../../hooks/useFavorites';
import { MotionWrapper } from '../../components/store/MotionWrapper';
import { GlassContainer } from '../../components/shared/GlassContainer';
import type { FavoriteItem } from '../../types';
import PageBreadcrumb from '../../components/store/PageBreadcrumb';

export default function FavoritesPage() {
  const { data: favorites, isLoading } = useFavorites();
  const removeFromFavorites = useRemoveFromFavorites();

  const handleRemoveFavorite = (productId: string) => {
    removeFromFavorites.mutate(productId);
  };

  const breadcrumbItems = [
    { label: 'Mis Favoritos' },
  ];

  return (
    <Box sx={{ pb: 15 }}>
      <Container maxWidth="xl">
        <Box sx={{ pt: 4, pb: 6 }}>
          <PageBreadcrumb items={breadcrumbItems} />
          
          <MotionWrapper>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 600, letterSpacing: '0.2em' }}>
                Tus Productos Preferidos
              </Typography>
              <Typography variant="h2" sx={{ mt: 1 }}>Mis Favoritos</Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mt: 2, maxWidth: 600, mx: 'auto' }}>
                Guarda tus productos favoritos para encontrarlos fácilmente más tarde. Haz clic en el corazón para eliminar un producto de tu lista.
              </Typography>
            </Box>
          </MotionWrapper>
        </Box>

        {isLoading ? (
          <Box display="flex" justifyContent="center" py={12}>
            <CircularProgress color="secondary" />
          </Box>
        ) : favorites?.items && favorites.items.length > 0 ? (
          <Grid container spacing={4}>
            {favorites.items.map((item: FavoriteItem, index: number) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={item.id}>
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
                      {item.discountPercent > 0 && (
                        <GlassContainer sx={{
                          position: 'absolute', top: 12, left: 12, zIndex: 2,
                          px: 1.5, py: 0.5, borderRadius: '10px'
                        }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: 'error.main' }}>
                            -{item.discountPercent}%
                          </Typography>
                        </GlassContainer>
                      )}
                      <IconButton
                        onClick={() => handleRemoveFavorite(item.productId)}
                        sx={{
                          position: 'absolute', top: 12, right: 12, zIndex: 2,
                          bgcolor: 'error.main',
                          color: 'white',
                          '&:hover': { bgcolor: 'error.dark' }
                        }}
                      >
                        <Heart size={16} fill="currentColor" />
                      </IconButton>
                      <Link to={`/product/${item.slug}`}>
                        <CardMedia
                          component="img"
                          image={item.imageUrl || 'https://via.placeholder.com/600x800?text=No+Image'}
                          alt={item.name}
                          sx={{ height: '100%', objectFit: 'cover' }}
                        />
                      </Link>
                    </Box>
                    <CardContent sx={{ px: 2, pt: 3, pb: 2 }}>
                      <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                        {item.brand || 'Colección'}
                      </Typography>
                      <Typography
                        variant="h6"
                        component={Link}
                        to={`/product/${item.slug}`}
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
                        {item.name}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                          ${item.finalPrice}
                        </Typography>
                        {item.discountPercent > 0 && (
                          <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary', opacity: 0.6 }}>
                            ${item.basePrice}
                          </Typography>
                        )}
                      </Stack>
                      <Button
                        variant="contained"
                        color="secondary"
                        fullWidth
                        size="small"
                        component={Link}
                        to={`/product/${item.slug}`}
                        startIcon={<ShoppingBag size={16} />}
                        sx={{ mt: 2, borderRadius: '50px' }}
                      >
                        Ver Producto
                      </Button>
                    </CardContent>
                  </Card>
                </MotionWrapper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <Box sx={{ mb: 4 }}>
              <Heart size={64} style={{ opacity: 0.3, margin: '0 auto' }} />
            </Box>
            <Typography variant="h5" sx={{ mb: 2 }}>No tienes favoritos aún</Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
              Explora nuestro catálogo y guarda tus productos preferidos para encontrarlos fácilmente.
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              component={Link}
              to="/category/all"
              startIcon={<ShoppingBag size={18} />}
              sx={{ borderRadius: '50px', px: 4, py: 1.5 }}
            >
              Explorar Productos
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}
