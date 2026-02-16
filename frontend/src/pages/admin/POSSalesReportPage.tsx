import { useState } from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from '@mui/material';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Download,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const formatAxisValue = (value: number | undefined): string => {
  if (value === undefined) return '';
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
};

const CustomTooltip = (props: any) => {
  const { active, payload, label } = props;
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          padding: '8px 12px',
          borderRadius: '4px',
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
        {payload.map((entry: any, index: number) => (
          <Typography key={index} variant="caption" sx={{ display: 'block', color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? formatCurrency(entry.value) : entry.value}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

interface SalesStats {
  totalRevenue: number;
  totalSales: number;
  paymentMethods: Record<string, number>;
}

interface SalesOverTimeItem {
  date: string;
  revenue: number;
  sales: number;
}

interface TopProduct {
  productName: string;
  variantName: string;
  productSku: string;
  totalQuantity: number;
  totalRevenue: number;
  avgPrice: number;
}

interface StaffSales {
  staffId: string;
  staffName: string;
  totalRevenue: number;
  salesCount: number;
}

export default function POSSalesReportPage() {
  const [period, setPeriod] = useState('30');
  const [salesPeriod, setSalesPeriod] = useState<'week' | 'month' | 'year'>('week');

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['pos-sales-stats', period],
    queryFn: async () => {
      const response = await axios.get<{ success: boolean; data: SalesStats }>(`${API_BASE}/admin/pos/summary`, {
        params: { period },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data.data;
    },
  });

  const { data: salesOverTime = [], isLoading: salesOverTimeLoading } = useQuery({
    queryKey: ['pos-sales-over-time', salesPeriod],
    queryFn: async () => {
      const response = await axios.get<{ success: boolean; data: SalesOverTimeItem[] }>(
        `${API_BASE}/admin/pos/sales-over-time`,
        {
          params: { period: salesPeriod },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data.data;
    },
  });

  const { data: topProducts = [], isLoading: topProductsLoading } = useQuery({
    queryKey: ['pos-top-products', period],
    queryFn: async () => {
      const response = await axios.get<{ success: boolean; data: TopProduct[] }>(
        `${API_BASE}/admin/pos/top-products`,
        {
          params: { limit: 10, period },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data.data;
    },
  });

  const { data: staffSales = [], isLoading: staffSalesLoading } = useQuery({
    queryKey: ['pos-sales-by-staff', period],
    queryFn: async () => {
      const response = await axios.get<{ success: boolean; data: StaffSales[] }>(
        `${API_BASE}/admin/pos/sales-by-staff`,
        {
          params: { period },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data.data;
    },
  });

  const stats = statsData;

  const handleDownloadCSV = async () => {
    try {
      const response = await axios.get(`${API_BASE}/admin/pos/export`, {
        params: { period },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pos-sales-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Reporte de Ventas POS
        </Typography>
        <Stack direction="row" gap={2}>
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
          <Button
            variant="contained"
            startIcon={<Download size={18} />}
            onClick={handleDownloadCSV}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Descargar CSV
          </Button>
        </Stack>
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
          <Card sx={{ height: '100%', bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Total de Ventas
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {statsLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      stats?.totalSales || 0
                    )}
                  </Typography>
                </Box>
                <ShoppingCart size={40} style={{ opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%', bgcolor: 'info.main', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Venta Promedio
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {statsLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      formatCurrency(
                        stats?.totalSales && stats?.totalSales > 0
                          ? Math.round(stats.totalRevenue / stats.totalSales)
                          : 0
                      )
                    )}
                  </Typography>
                </Box>
                <TrendingUp size={40} style={{ opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Sales Over Time */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Ventas por Período
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                {(['week', 'month', 'year'] as const).map((p) => (
                  <Chip
                    key={p}
                    label={p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Año'}
                    onClick={() => setSalesPeriod(p)}
                    variant={salesPeriod === p ? 'filled' : 'outlined'}
                    color={salesPeriod === p ? 'primary' : 'default'}
                  />
                ))}
              </Box>
              {salesOverTimeLoading ? (
                <Box display="flex" justifyContent="center" py={3}>
                  <CircularProgress />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis 
                      yAxisId="left"
                      tickFormatter={formatAxisValue}
                      label={{ value: 'Ingresos ($)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      label={{ value: 'Cantidad de Ventas', angle: 90, position: 'insideRight', style: { textAnchor: 'middle' } }}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8B5CF6"
                      dot={false}
                      name="Ingresos"
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="sales"
                      stroke="#10B981"
                      dot={false}
                      name="Ventas"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sales by Salesman */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Ventas por Vendedor
              </Typography>
              {staffSalesLoading ? (
                <Box display="flex" justifyContent="center" py={3}>
                  <CircularProgress />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={staffSales} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      xAxisId="left"
                      type="number"
                      tickFormatter={formatAxisValue}
                      orientation="bottom"
                    />
                    <XAxis 
                      xAxisId="right"
                      type="number"
                      orientation="top"
                    />
                    <YAxis dataKey="staffName" type="category" width={150} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      xAxisId="left"
                      dataKey="totalRevenue"
                      fill="#3B82F6"
                      name="Ingresos"
                      radius={[0, 8, 8, 0]}
                    />
                    <Bar
                      xAxisId="right"
                      dataKey="salesCount"
                      fill="#10B981"
                      name="Cantidad de Ventas"
                      radius={[0, 8, 8, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Products */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Productos Más Vendidos
          </Typography>
          {topProductsLoading ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell>Producto</TableCell>
                    <TableCell align="right">Variante</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell align="right">Ingresos</TableCell>
                    <TableCell align="right">Promedio</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topProducts && topProducts.length > 0 ? (
                    topProducts.map((product: TopProduct, index: number) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Stack>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {product.productName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              SKU: {product.productSku}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">{product.variantName}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {product.totalQuantity}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {formatCurrency(product.totalRevenue)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(product.avgPrice)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          No hay datos disponibles
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
