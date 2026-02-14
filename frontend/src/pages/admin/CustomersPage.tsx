import { useState } from 'react';
import {
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  InputAdornment,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  TablePagination,
} from '@mui/material';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import {
  useAdminCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  useToggleCustomerVerification,
  useCustomersStats,
} from '../../hooks/useAdmin';
import type { Customer } from '../../types';

interface CustomerWithStats extends Customer {
  orderCount: number;
  totalSpent: number;
  addressesCount: number;
}

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState<'ALL' | 'VERIFIED' | 'UNVERIFIED'>('ALL');
  const [hasOrdersFilter, setHasOrdersFilter] = useState<'ALL' | 'WITH_ORDERS' | 'WITHOUT_ORDERS'>('ALL');
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  
  const { data: response, isLoading, error } = useAdminCustomers({
    page: page + 1,
    limit,
    search: searchTerm || undefined,
    isVerified: verifiedFilter !== 'ALL' ? verifiedFilter === 'VERIFIED' : undefined,
    hasOrders: hasOrdersFilter !== 'ALL' ? hasOrdersFilter === 'WITH_ORDERS' : undefined,
  });
  
  const customers = response?.data || [];
  const pagination = response?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };
  
  const { data: stats } = useCustomersStats();
  
  const { mutate: createCustomer, isPending: isCreating } = useCreateCustomer();
  const { mutate: updateCustomer, isPending: isUpdating } = useUpdateCustomer();
  const { mutate: deleteCustomer, isPending: isDeleting } = useDeleteCustomer();
  const { mutate: toggleVerification, isPending: isToggling } = useToggleCustomerVerification();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerWithStats | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<CustomerWithStats | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    birthDate: '',
    isVerified: true,
  });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleOpenDialog = (customer?: CustomerWithStats) => {
    setFormErrors({});
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        email: customer.email,
        password: '',
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone || '',
        birthDate: customer.birthDate || '',
        isVerified: customer.isVerified ?? true,
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        birthDate: '',
        isVerified: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCustomer(null);
    setFormErrors({});
  };

  const handleOpenViewDialog = (customer: CustomerWithStats) => {
    setViewingCustomer(customer);
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setViewingCustomer(null);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.email || !formData.email.includes('@')) {
      errors.email = 'Email inválido';
    }
    
    if (!editingCustomer && (!formData.password || formData.password.length < 8)) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres';
    }
    
    if (!formData.firstName || formData.firstName.length < 2) {
      errors.firstName = 'El nombre debe tener al menos 2 caracteres';
    }
    
    if (!formData.lastName || formData.lastName.length < 2) {
      errors.lastName = 'El apellido debe tener al menos 2 caracteres';
    }
    
    if (!formData.phone || formData.phone.length < 10) {
      errors.phone = 'El teléfono debe tener al menos 10 caracteres';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const submitData = { ...formData };
    
    // Remove password if empty when editing
    if (editingCustomer && !submitData.password) {
      delete (submitData as Partial<typeof submitData>).password;
    }

    // Remove empty birthDate
    if (!submitData.birthDate) {
      delete (submitData as Partial<typeof submitData>).birthDate;
    }

    if (editingCustomer) {
      updateCustomer({ id: editingCustomer.id, data: submitData });
    } else {
      createCustomer(submitData as Required<typeof submitData>);
    }
    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteId) {
      deleteCustomer(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  const handleToggleVerification = (id: string) => {
    toggleVerification(id);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Error al cargar clientes</Alert>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Clientes</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Cliente
        </Button>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }} gap={2} mb={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Clientes
              </Typography>
              <Typography variant="h4">{stats.total}</Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Verificados
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.verified}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Con Pedidos
              </Typography>
              <Typography variant="h4" color="info.main">
                {stats.withOrders}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Ingresos Totales
              </Typography>
              <Typography variant="h4" color="primary.main">
                {formatCurrency(stats.totalRevenue)}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} flexWrap="wrap">
          <TextField
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Verificación</InputLabel>
            <Select
              value={verifiedFilter}
              label="Verificación"
              onChange={(e) => setVerifiedFilter(e.target.value as typeof verifiedFilter)}
            >
              <MenuItem value="ALL">Todos</MenuItem>
              <MenuItem value="VERIFIED">Verificados</MenuItem>
              <MenuItem value="UNVERIFIED">No verificados</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Pedidos</InputLabel>
            <Select
              value={hasOrdersFilter}
              label="Pedidos"
              onChange={(e) => setHasOrdersFilter(e.target.value as typeof hasOrdersFilter)}
            >
              <MenuItem value="ALL">Todos</MenuItem>
              <MenuItem value="WITH_ORDERS">Con pedidos</MenuItem>
              <MenuItem value="WITHOUT_ORDERS">Sin pedidos</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Customers Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Cliente</TableCell>
              <TableCell>Contacto</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Pedidos</TableCell>
              <TableCell>Total Gastado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers?.map((customer: CustomerWithStats) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PersonIcon color="action" />
                    {customer.firstName} {customer.lastName}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body2">{customer.email}</Typography>
                    </Box>
                    {customer.phone && (
                      <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography variant="body2">{customer.phone}</Typography>
                      </Box>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={customer.isVerified ? <CheckCircleIcon /> : <BlockIcon />}
                    label={customer.isVerified ? 'Verificado' : 'No verificado'}
                    color={customer.isVerified ? 'success' : 'warning'}
                    size="small"
                    variant={customer.isVerified ? 'filled' : 'outlined'}
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <ShoppingBagIcon fontSize="small" color="action" />
                    {customer.orderCount}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <AttachMoneyIcon fontSize="small" color="action" />
                    {formatCurrency(customer.totalSpent)}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Ver detalles">
                    <IconButton onClick={() => handleOpenViewDialog(customer)}>
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={customer.isVerified ? 'Desverificar' : 'Verificar'}>
                    <IconButton
                      onClick={() => handleToggleVerification(customer.id)}
                      disabled={isToggling}
                      color={customer.isVerified ? 'success' : 'warning'}
                    >
                      {customer.isVerified ? <CheckCircleIcon /> : <BlockIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editar">
                    <IconButton onClick={() => handleOpenDialog(customer)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <span>
                      <IconButton
                        onClick={() => handleDelete(customer.id)}
                        disabled={customer.orderCount > 0}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {customers?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary" py={4}>
                    No se encontraron clientes
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={pagination.total}
          rowsPerPage={limit}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setLimit(parseInt(event.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        />
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nombre"
            margin="normal"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            error={!!formErrors.firstName}
            helperText={formErrors.firstName}
          />
          <TextField
            fullWidth
            label="Apellido"
            margin="normal"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            error={!!formErrors.lastName}
            helperText={formErrors.lastName}
          />
          <TextField
            fullWidth
            label="Email"
            margin="normal"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={!!formErrors.email}
            helperText={formErrors.email}
          />
          <TextField
            fullWidth
            label="Teléfono"
            margin="normal"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            error={!!formErrors.phone}
            helperText={formErrors.phone}
          />
          <TextField
            fullWidth
            label="Fecha de Nacimiento"
            margin="normal"
            type="date"
            value={formData.birthDate}
            onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label={editingCustomer ? 'Nueva Contraseña (dejar en blanco para no cambiar)' : 'Contraseña'}
            margin="normal"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={!!formErrors.password}
            helperText={formErrors.password}
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.isVerified}
                onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
              />
            }
            label="Email verificado"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isCreating || isUpdating}
          >
            {isCreating || isUpdating ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onClose={handleCloseViewDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Detalles del Cliente</DialogTitle>
        <DialogContent>
          {viewingCustomer && (
            <Box>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <PersonIcon sx={{ fontSize: 60 }} color="primary" />
                <Box>
                  <Typography variant="h6">
                    {viewingCustomer.firstName} {viewingCustomer.lastName}
                  </Typography>
                  <Chip
                    size="small"
                    label={viewingCustomer.isVerified ? 'Verificado' : 'No verificado'}
                    color={viewingCustomer.isVerified ? 'success' : 'warning'}
                  />
                </Box>
              </Box>

              <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2} mb={3}>
                <Paper variant="outlined" sx={{ p: 2, gridColumn: 'span 2' }}>
                  <Typography variant="subtitle2" gutterBottom>Contacto</Typography>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <EmailIcon fontSize="small" color="action" />
                    <Typography>{viewingCustomer.email}</Typography>
                  </Box>
                  {viewingCustomer.phone && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography>{viewingCustomer.phone}</Typography>
                    </Box>
                  )}
                </Paper>
                
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <ShoppingBagIcon color="primary" />
                  <Typography variant="h6">{viewingCustomer.orderCount}</Typography>
                  <Typography variant="body2" color="text.secondary">Pedidos</Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <AttachMoneyIcon color="primary" />
                  <Typography variant="h6">{formatCurrency(viewingCustomer.totalSpent)}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Gastado</Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <LocationOnIcon color="primary" />
                  <Typography variant="h6">{viewingCustomer.addressesCount}</Typography>
                  <Typography variant="body2" color="text.secondary">Direcciones</Typography>
                </Paper>
              </Box>

              <Typography variant="body2" color="text.secondary">
                Registrado: {new Date(viewingCustomer.createdAt || '').toLocaleDateString('es-CO')}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Eliminar Cliente"
        message="¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        isDangerous={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
        isLoading={isDeleting}
      />
    </Box>
  );
}
