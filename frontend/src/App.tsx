import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useProducts, useLowStockProducts, useHealthCheck } from './hooks/useProducts';

function App() {
  const { data: products, isLoading: productsLoading, error: productsError } = useProducts();
  const { data: lowStock, isLoading: lowStockLoading } = useLowStockProducts();
  const { data: health, isLoading: healthLoading } = useHealthCheck();

  const totalProducts = products?.length || 0;
  const lowStockCount = lowStock?.length || 0;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <InventoryIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Bella Luna Inventory
          </Typography>
          {!healthLoading && (
            <Chip
              icon={<CheckCircleIcon />}
              label="API Connected"
              color="success"
              size="small"
              sx={{ ml: 2 }}
            />
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>

        {(productsError as Error) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error loading products: {(productsError as Error).message}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Total Products Card */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Products
                </Typography>
                <Typography variant="h3" component="div">
                  {productsLoading ? (
                    <CircularProgress size={40} />
                  ) : (
                    totalProducts
                  )}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Low Stock Card */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Low Stock Items
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h3" component="div" sx={{ mr: 1 }}>
                    {lowStockLoading ? (
                      <CircularProgress size={40} />
                    ) : (
                      lowStockCount
                    )}
                  </Typography>
                  {lowStockCount > 0 && (
                    <WarningIcon color="warning" />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* API Status Card */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  API Status
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {healthLoading ? (
                    <CircularProgress size={40} />
                  ) : health?.success ? (
                    <>
                      <Typography variant="h5" component="div" color="success.main">
                        Online
                      </Typography>
                      <CheckCircleIcon color="success" sx={{ ml: 1 }} />
                    </>
                  ) : (
                    <Typography variant="h5" component="div" color="error.main">
                      Offline
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Products Table Preview */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Recent Products
          </Typography>
          {productsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : products && products.length > 0 ? (
            <Grid container spacing={2}>
              {products.slice(0, 6).map((product) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" noWrap>
                        {product.name}
                      </Typography>
                      <Typography color="textSecondary" gutterBottom>
                        SKU: {product.sku}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Chip
                          label={`Stock: ${product.quantity}`}
                          color={product.quantity <= product.minStock ? 'error' : 'success'}
                          size="small"
                        />
                        <Typography variant="body2">
                          ${product.salePrice}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info">No products found</Alert>
          )}
        </Box>
      </Container>
    </Box>
  );
}

export default App;
