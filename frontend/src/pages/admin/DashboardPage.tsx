import { useState } from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Package,
  AlertTriangle,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../services/adminApi';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#EF4444'];

const statusTranslations: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  PROCESSING: 'Procesando',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
  RETURNED: 'Devuelto',
  preparing: 'Preparando',
  'ready for pick up': 'Listo para recoger',
};

const translateStatus = (status: string): string => {
  return statusTranslations[status] || status;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value);
};

const formatAxisValue = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
};

export default function DashboardPage() {
  const [period, setPeriod] = useState('30');
  const [salesPeriod, setSalesPeriod] = useState('week');

  const { data: statsResponse, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-dashboard-stats', period],
    queryFn: () => adminApi.getDashboardStats(period),
  });

  const { data: salesResponse, isLoading: salesLoading } = useQuery({
    queryKey: ['admin-sales-over-time', salesPeriod],
    queryFn: () => adminApi.getSalesOverTime(salesPeriod),
  });

  const { data: topProductsResponse, isLoading: topProductsLoading } = useQuery({
    queryKey: ['admin-top-products', period],
    queryFn: () => adminApi.getTopProducts({ limit: 10, period }),
  });

  const { data: categoryResponse, isLoading: categoryLoading } = useQuery({
    queryKey: ['admin-sales-by-category', period],
    queryFn: () => adminApi.getSalesByCategory(period),
  });

  const stats = statsResponse?.data?.data;
  const salesOverTime = salesResponse?.data?.data || [];
  const topProducts = topProductsResponse?.data?.data || [];
  const salesByCategory = categoryResponse?.data?.data || [];

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Dashboard
        </Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Período</InputLabel>
          <Select
            value={period}
            label="Período"
            onChange={(e) => setPeriod(e.target.value)}
          >
            <MenuItem value="7">Últimos 7 días</MenuItem>
            <MenuItem value="30">Últimos 30 días</MenuItem>
            <MenuItem value="90">Últimos 3 meses</MenuItem>
            <MenuItem value="365">Último año</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%', bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Ingresos Totales
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {statsLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      formatCurrency(stats?.totalRevenue || 0)
                    )}
                  </Typography>
                </Box>
                <DollarSign size={40} style={{ opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%', bgcolor: 'secondary.main', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Total Pedidos
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {statsLoading ? <CircularProgress size={24} color="inherit" /> : stats?.totalOrders || 0}
                  </Typography>
                </Box>
                <ShoppingCart size={40} style={{ opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%', bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Valor Promedio
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {statsLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      formatCurrency(stats?.avgOrderValue || 0)
                    )}
                  </Typography>
                </Box>
                <TrendingUp size={40} style={{ opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%', bgcolor: 'error.main', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Productos Agotados
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {statsLoading ? <CircularProgress size={24} color="inherit" /> : stats?.outOfStockCount || 0}
                  </Typography>
                </Box>
                <Package size={40} style={{ opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* POS Sales Stats */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%', bgcolor: '#F97316', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Ventas POS
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {statsLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      formatCurrency(stats?.posStats?.totalRevenue || 0)
                    )}
                  </Typography>
                </Box>
                <DollarSign size={40} style={{ opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%', bgcolor: '#06B6D4', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Transacciones POS
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {statsLoading ? <CircularProgress size={24} color="inherit" /> : stats?.posStats?.totalSales || 0}
                  </Typography>
                </Box>
                <ShoppingCart size={40} style={{ opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Sales Over Time Chart */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BarChart3 size={24} color="#8B5CF6" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Ventas en el Tiempo
                  </Typography>
                </Box>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={salesPeriod}
                    onChange={(e) => setSalesPeriod(e.target.value)}
                  >
                    <MenuItem value="week">Semana</MenuItem>
                    <MenuItem value="month">Mes</MenuItem>
                    <MenuItem value="year">Año</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              {salesLoading ? (
                <Box display="flex" justifyContent="center" py={8}>
                  <CircularProgress />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={salesOverTime || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={formatAxisValue} />
                    <RechartsTooltip
                      formatter={(value: number | undefined) => value != null ? formatCurrency(value) : ''}
                      labelStyle={{ color: '#666' }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#8B5CF6"
                      strokeWidth={3}
                      name="Ventas"
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Pedidos"
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Orders by Status */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <PieChart size={24} color="#EC4899" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Pedidos por Estado
                </Typography>
              </Box>
              {statsLoading ? (
                <Box display="flex" justifyContent="center" py={8}>
                  <CircularProgress />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <RechartsPieChart>
                    <Pie
                      data={(stats?.ordersByStatus || []).map(item => ({
                        ...item,
                        status: translateStatus(item.status)
                      }))}
                      dataKey="_count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {stats?.ordersByStatus?.map((_entry: { status: string; _count: number }, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value: any) => `${value}`}
                      labelFormatter={(label: any) => String(label)}
                    />
                    <Legend formatter={(value: string) => value} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Products */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <TrendingUp size={24} color="#10B981" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Productos Más Vendidos
                </Typography>
              </Box>
              {topProductsLoading ? (
                <Box display="flex" justifyContent="center" py={8}>
                  <CircularProgress />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topProducts || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={formatAxisValue} />
                    <YAxis dataKey="name" type="category" width={150} />
                    <RechartsTooltip
                      formatter={(value: number | undefined) => value != null ? formatCurrency(value) : ''}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8B5CF6" name="Ingresos" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sales by Category */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <PieChart size={24} color="#F59E0B" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Ventas por Categoría
                </Typography>
              </Box>
              {categoryLoading ? (
                <Box display="flex" justifyContent="center" py={8}>
                  <CircularProgress />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <RechartsPieChart>
                    <Pie
                      data={salesByCategory || []}
                      dataKey="revenue"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label={({ name, percent }: any) =>
                        percent != null ? `${name || ''}: ${(percent * 100).toFixed(0)}%` : (name || '')
                      }
                    >
                      {(salesByCategory || []).map((_entry: { name: string; revenue: number; quantity: number }, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: number | undefined) => value != null ? formatCurrency(value) : ''} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Low Stock Warnings */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <AlertTriangle size={24} color="#EF4444" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Alertas de Stock Bajo (≤ 5 unidades)
                </Typography>
              </Box>
              {statsLoading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : stats?.lowStockProducts && stats.lowStockProducts.length > 0 ? (
                <List>
                  {stats.lowStockProducts.map((product: {
                    id: string;
                    name: string;
                    sku: string;
                    stock: number;
                    variants: Array<{
                      id: string;
                      variantSku: string | null;
                      stock: number;
                      attributeValues: Array<{
                        attributeValue: {
                          attribute: { name: string; displayName: string };
                          value: string;
                          displayValue: string | null;
                        };
                      }>;
                    }>;
                  }) => (
                    <Box key={product.id}>
                      <ListItem
                        sx={{
                          bgcolor: 'error.light',
                          mb: 1,
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'error.main',
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {product.name}
                              </Typography>
                              <Chip
                                label={`SKU: ${product.sku}`}
                                size="small"
                                color="default"
                              />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              {product.variants.length > 0 ? (
                                <Stack spacing={0.5}>
                                  <Typography variant="body2" color="text.secondary">
                                    Variantes con stock bajo:
                                  </Typography>
                                  {product.variants.map((variant: {
                                    id: string;
                                    variantSku: string | null;
                                    stock: number;
                                    attributeValues: Array<{
                                      attributeValue: {
                                        value: string;
                                        displayValue: string | null;
                                      };
                                    }>;
                                  }) => (
                                    <Box
                                      key={variant.id}
                                      sx={{ display: 'flex', gap: 1, alignItems: 'center', ml: 2 }}
                                    >
                                      <Chip
                                        label={variant.attributeValues
                                          .map((av: { attributeValue: { value: string; displayValue: string | null } }) => 
                                            av.attributeValue.displayValue || av.attributeValue.value)
                                          .join(' - ')}
                                        size="small"
                                        variant="outlined"
                                      />
                                      <Chip
                                        label={`Stock: ${variant.stock}`}
                                        size="small"
                                        color="warning"
                                      />
                                      {variant.variantSku && (
                                        <Typography variant="caption" color="text.secondary">
                                          SKU: {variant.variantSku}
                                        </Typography>
                                      )}
                                    </Box>
                                  ))}
                                </Stack>
                              ) : (
                                <Chip
                                  label={`Stock: ${product.stock} unidades`}
                                  size="small"
                                  color="warning"
                                />
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    </Box>
                  ))}
                </List>
              ) : (
                <Alert severity="success">
                  ¡Excelente! No hay productos con stock bajo en este momento.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
