import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Badge,
  Drawer,
  Divider,
  Chip,
  Stack,
  List,
  Button,
  Collapse,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Link,
} from '@mui/material';
import { Bell, X, Trash2, CheckCircle } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { usePollingNotifications } from '../../hooks/usePollingNotifications';
import { formatCurrency } from '../../utils/formatters';

export default function NotificationPanel() {
  const navigate = useNavigate();
  const { notifications, unreadCount, clearNotification, markAsRead, clearAllNotifications, isConnected, addNotification } = useNotifications();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedNotification, setExpandedNotification] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [lastNotification, setLastNotification] = useState<any>(null);
  
  // Check if WebSockets are supported (not on Vercel/production)
  const isProduction = import.meta.env.VITE_API_URL?.includes('vercel.app');

  // Use polling fallback on production when WebSockets aren't available
  usePollingNotifications({
    enabled: isProduction || !isConnected,
    onNewNotification: (notification) => {
      // Add the notification to the context
      addNotification({
        id: `${notification.orderId ? 'order-' : 'status-'}${notification.orderId || notification.id}`,
        orderId: notification.orderId,
        orderNumber: notification.orderNumber,
        message: notification.message,
        type: notification.type as any,
        customerId: notification.customerId,
        customerName: notification.customerName,
        total: notification.total,
        status: notification.status,
        timestamp: notification.timestamp,
        read: notification.read,
      });
    },
    pollingInterval: 5000, // Poll every 5 seconds
  });

  // Auto-open drawer and show toast only for new orders
  useEffect(() => {
    if (notifications.length > 0 && !showToast) {
      const latestNotification = notifications[0];
      // Only show toast for new orders (id starts with "order-"), not status changes
      if (latestNotification.id.startsWith('order-')) {
        setLastNotification(latestNotification);
        setShowToast(true);
        setDrawerOpen(true);
        
        // Auto-close toast after 6 seconds
        const timer = setTimeout(() => {
          setShowToast(false);
        }, 6000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [notifications.length]);

  const handleNavigateToOrder = (orderId?: string) => {
    if (orderId) {
      navigate(`/admin/orders/${orderId}`);
      setDrawerOpen(false);
    }
  };

  const handleToggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleClearNotification = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    clearNotification(id);
  };

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const getTypeColor = (type: string): 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' => {
    const colorMap: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'> = {
      success: 'success',
      error: 'error',
      warning: 'warning',
      info: 'info',
    };
    return colorMap[type] || 'default';
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ⓘ',
    };
    return icons[type] || '•';
  };

  return (
    <>
      {/* Floating Notification Button */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={handleToggleDrawer}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              width: 56,
              height: 56,
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              boxShadow: 2,
              transition: 'all 0.3s ease',
              transform: drawerOpen ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            <Badge
              badgeContent={unreadCount}
              color="error"
              overlap="circular"
              sx={{
                '& .MuiBadge-badge': {
                  right: -3,
                  top: 13,
                  border: '2px solid white',
                  padding: '0 4px',
                  fontWeight: 700,
                },
              }}
            >
              <Bell size={24} />
            </Badge>
          </IconButton>

          {/* Connection status indicator */}
          <Box
            sx={{
              position: 'absolute',
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: isConnected ? '#4caf50' : '#f44336',
              bottom: 4,
              left: 4,
              border: '2px solid white',
            }}
          />
        </Box>
      </Box>

      {/* Notification Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleToggleDrawer}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400, md: 450 },
            maxHeight: '100vh',
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Notificaciones
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {notifications.length > 0 && (
                  <Button
                    size="small"
                    startIcon={<Trash2 size={16} />}
                    onClick={clearAllNotifications}
                    sx={{ color: 'text.secondary' }}
                  >
                    Limpiar
                  </Button>
                )}
                <IconButton size="small" onClick={handleToggleDrawer}>
                  <X size={20} />
                </IconButton>
              </Box>
            </Box>

            {/* Status */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: isConnected ? '#4caf50' : '#f44336',
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {isConnected ? 'Conectado' : 'Desconectado'}
              </Typography>
              {unreadCount > 0 && (
                <>
                  <Divider orientation="vertical" sx={{ mx: 1, height: 16 }} />
                  <Chip
                    label={`${unreadCount} sin leer`}
                    color="error"
                    size="small"
                    variant="outlined"
                  />
                </>
              )}
            </Box>
          </Box>

          {/* Notifications List */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 0 }}>
            {notifications.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary" variant="body2">
                  No hay notificaciones
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {notifications.map((notification: any, index: any) => (
                  <Box key={notification.id}>
                    <Card
                      variant="outlined"
                      sx={{
                        m: 1,
                        mb: 0.5,
                        bgcolor: notification.read ? 'background.paper' : 'action.hover',
                        border: notification.read ? '1px solid' : '2px solid',
                        borderColor: notification.read ? 'divider' : 'primary.main',
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: 1,
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <CardContent
                        sx={{
                          p: 1.5,
                          '&:last-child': { pb: 1.5 },
                        }}
                        onClick={() =>
                          setExpandedNotification(
                            expandedNotification === notification.id ? null : notification.id
                          )
                        }
                      >
                        {/* Notification Header */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
                            <Chip
                              label={getTypeIcon(notification.type)}
                              size="small"
                              color={getTypeColor(notification.type)}
                              variant="filled"
                              sx={{ minWidth: 32, height: 28 }}
                            />
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>
                                  {notification.message}
                                </Typography>
                                {notification.orderId && (
                                  <Link
                                    component="button"
                                    onClick={(e: any) => {
                                      e.preventDefault();
                                      handleNavigateToOrder(notification.orderId);
                                    }}
                                    sx={{
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      whiteSpace: 'nowrap',
                                      cursor: 'pointer',
                                      color: 'primary.main',
                                      '&:hover': {
                                        textDecoration: 'underline',
                                      },
                                    }}
                                  >
                                    Ver
                                  </Link>
                                )}
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                {notification.timestamp.toLocaleTimeString('es-CO', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {!notification.read && (
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification.id);
                                }}
                                sx={{ color: 'primary.main' }}
                              >
                                <CheckCircle size={16} />
                              </IconButton>
                            )}
                            <IconButton
                              size="small"
                              onClick={(e) => handleClearNotification(notification.id, e)}
                              sx={{ color: 'text.secondary' }}
                            >
                              <X size={16} />
                            </IconButton>
                          </Box>
                        </Box>

                        {/* Order Details (if available) */}
                        <Collapse in={expandedNotification === notification.id && !!notification.orderNumber}>
                          {notification.orderNumber && (
                            <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                              <Stack spacing={0.5}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="caption" color="text.secondary">
                                    Pedido:
                                  </Typography>
                                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                    #{notification.orderNumber}
                                  </Typography>
                                </Box>
                                {notification.customerName && (
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="caption" color="text.secondary">
                                      Cliente:
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                      {notification.customerName}
                                    </Typography>
                                  </Box>
                                )}
                                {notification.total !== undefined && (
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="caption" color="text.secondary">
                                      Total:
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'success.main' }}>
                                      {formatCurrency(notification.total)}
                                    </Typography>
                                  </Box>
                                )}
                              </Stack>
                            </Box>
                          )}
                        </Collapse>
                      </CardContent>
                    </Card>

                    {index < notifications.length - 1 && <Divider sx={{ my: 0 }} />}
                  </Box>
                ))}
              </List>
            )}
          </Box>

          {/* Footer - View All Link */}
          {notifications.length > 0 && (
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Total: {notifications.length} notificaciones
              </Typography>
            </Box>
          )}
        </Box>
      </Drawer>

      {/* Toast Notification */}
      <Snackbar
        open={showToast}
        autoHideDuration={6000}
        onClose={() => setShowToast(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={() => setShowToast(false)}
          severity="success"
          variant="filled"
          sx={{
            width: '100%',
            boxShadow: 3,
            fontSize: '0.95rem',
            animation: 'slideIn 0.3s ease-in-out',
            '@keyframes slideIn': {
              from: {
                transform: 'translateX(-100%)',
                opacity: 0,
              },
              to: {
                transform: 'translateX(0)',
                opacity: 1,
              },
            },
            '& .MuiAlert-message': {
              width: '100%',
            },
          }}
          action={
            lastNotification?.orderId ? (
              <Button
                color="inherit"
                size="small"
                onClick={() => handleNavigateToOrder(lastNotification.orderId)}
                sx={{
                  fontWeight: 600,
                  textDecoration: 'underline',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                Ver
              </Button>
            ) : undefined
          }
        >
          {lastNotification?.message}
        </Alert>
      </Snackbar>
    </>
  );
}
