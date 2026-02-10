import { Typography, Grid, Card, CardContent, Box, CircularProgress } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CategoryIcon from '@mui/icons-material/Category';
import { useAdminProducts, useAdminOrders, useAdminCategories } from '../../hooks/useAdmin';

export default function DashboardPage() {
  const { data: products, isLoading: productsLoading } = useAdminProducts();
  const { data: orders, isLoading: ordersLoading } = useAdminOrders();
  const { data: categories, isLoading: categoriesLoading } = useAdminCategories();

  const stats = [
    {
      title: 'Total Productos',
      value: products?.length || 0,
      icon: <InventoryIcon fontSize="large" />,
      loading: productsLoading,
    },
    {
      title: 'Pedidos',
      value: orders?.length || 0,
      icon: <ShoppingCartIcon fontSize="large" />,
      loading: ordersLoading,
    },
    {
      title: 'Categorías',
      value: categories?.length || 0,
      icon: <CategoryIcon fontSize="large" />,
      loading: categoriesLoading,
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={stat.title}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h3">
                      {stat.loading ? <CircularProgress size={40} /> : stat.value}
                    </Typography>
                  </Box>
                  <Box color="primary.main">{stat.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
