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
  TablePagination,
} from '@mui/material';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  useAdminUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useToggleUserStatus,
} from '../../hooks/useAdmin';
import { useAuth } from '../../hooks/useAuth';
import type { User, UserRole } from '../../types';

const roleConfig: Record<UserRole, { label: string; color: 'error' | 'warning' | 'default' }> = {
  ADMIN: { label: 'Administrador', color: 'error' },
  MANAGER: { label: 'Gerente', color: 'warning' },
  EMPLOYEE: { label: 'Empleado', color: 'default' },
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  
  const { data: response, isLoading, error } = useAdminUsers({
    page: page + 1,
    limit,
    search: searchTerm || undefined,
    role: roleFilter !== 'ALL' ? roleFilter : undefined,
    isActive: statusFilter !== 'ALL' ? statusFilter === 'ACTIVE' : undefined,
  });
  
  const users = response?.data || [];
  const pagination = response?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };
  
  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();
  const { mutate: toggleStatus, isPending: isToggling } = useToggleUserStatus();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'EMPLOYEE' as UserRole,
    isActive: true,
  });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleOpenDialog = (user?: User) => {
    setFormErrors({});
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        password: '',
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive ?? true,
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'EMPLOYEE',
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.email || !formData.email.includes('@')) {
      errors.email = 'Email inválido';
    }
    
    if (!editingUser && (!formData.password || formData.password.length < 8)) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres';
    }
    
    if (!formData.firstName || formData.firstName.length < 2) {
      errors.firstName = 'El nombre debe tener al menos 2 caracteres';
    }
    
    if (!formData.lastName || formData.lastName.length < 2) {
      errors.lastName = 'El apellido debe tener al menos 2 caracteres';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const submitData = { ...formData };
    
    // Remove password if empty when editing
    if (editingUser && !submitData.password) {
      delete (submitData as Partial<typeof submitData>).password;
    }

    if (editingUser) {
      updateUser({ id: editingUser.id, data: submitData });
    } else {
      createUser(submitData as Required<typeof submitData>);
    }
    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteId) {
      deleteUser(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  const handleToggleStatus = (id: string) => {
    toggleStatus(id);
  };

  const isCurrentUser = (userId: string) => currentUser?.id === userId;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Error al cargar usuarios</Alert>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Usuarios</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Usuario
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} flexWrap="wrap">
          <TextField
            placeholder="Buscar usuarios..."
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
            <InputLabel>Rol</InputLabel>
            <Select
              value={roleFilter}
              label="Rol"
              onChange={(e) => setRoleFilter(e.target.value as UserRole | 'ALL')}
            >
              <MenuItem value="ALL">Todos</MenuItem>
              <MenuItem value="ADMIN">Administrador</MenuItem>
              <MenuItem value="MANAGER">Gerente</MenuItem>
              <MenuItem value="EMPLOYEE">Empleado</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={statusFilter}
              label="Estado"
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            >
              <MenuItem value="ALL">Todos</MenuItem>
              <MenuItem value="ACTIVE">Activos</MenuItem>
              <MenuItem value="INACTIVE">Inactivos</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Usuario</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    {user.firstName} {user.lastName}
                    {isCurrentUser(user.id) && (
                      <Chip size="small" label="Tú" color="primary" />
                    )}
                  </Box>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={roleConfig[user.role].label}
                    color={roleConfig[user.role].color}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    icon={user.isActive ? <CheckCircleIcon /> : <BlockIcon />}
                    label={user.isActive ? 'Activo' : 'Inactivo'}
                    color={user.isActive ? 'success' : 'error'}
                    size="small"
                    variant={user.isActive ? 'filled' : 'outlined'}
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title={user.isActive ? 'Desactivar' : 'Activar'}>
                    <span>
                      <IconButton
                        onClick={() => handleToggleStatus(user.id)}
                        disabled={isCurrentUser(user.id) || isToggling}
                        color={user.isActive ? 'success' : 'error'}
                      >
                        {user.isActive ? <CheckCircleIcon /> : <BlockIcon />}
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Editar">
                    <IconButton
                      onClick={() => handleOpenDialog(user)}
                      disabled={isCurrentUser(user.id)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <span>
                      <IconButton
                        onClick={() => handleDelete(user.id)}
                        disabled={isCurrentUser(user.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {users?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary" py={4}>
                    No se encontraron usuarios
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
          {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
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
            label={editingUser ? 'Nueva Contraseña (dejar en blanco para no cambiar)' : 'Contraseña'}
            margin="normal"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={!!formErrors.password}
            helperText={formErrors.password}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Rol</InputLabel>
            <Select
              value={formData.role}
              label="Rol"
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
            >
              <MenuItem value="ADMIN">Administrador</MenuItem>
              <MenuItem value="MANAGER">Gerente</MenuItem>
              <MenuItem value="EMPLOYEE">Empleado</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
            }
            label="Usuario activo"
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Eliminar Usuario"
        message="¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer."
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
