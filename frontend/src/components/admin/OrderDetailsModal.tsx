import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Divider,
  Stack,
} from '@mui/material';
import { Print } from '@mui/icons-material';
import { formatCurrency } from '../../utils/formatters';
import type { POSSale } from '../../types/pos';

interface OrderDetailsModalProps {
  open: boolean;
  order: POSSale | null;
  onClose: () => void;
}

export default function OrderDetailsModal({ open, order, onClose }: OrderDetailsModalProps) {
  if (!order) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Recibo #${order.saleNumber}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              background: white;
            }
            .receipt {
              max-width: 400px;
              margin: 0 auto;
              border: 1px solid #ccc;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: bold;
            }
            .header p {
              margin: 5px 0;
              font-size: 12px;
              color: #666;
            }
            .sale-number {
              text-align: center;
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .items-table {
              width: 100%;
              margin-bottom: 20px;
              font-size: 12px;
            }
            .items-table th {
              border-bottom: 1px solid #333;
              padding: 8px;
              text-align: left;
              font-weight: bold;
            }
            .items-table td {
              padding: 8px;
              border-bottom: 1px solid #ddd;
            }
            .items-table .item-name {
              font-weight: 500;
            }
            .items-table .text-right {
              text-align: right;
            }
            .totals {
              margin: 20px 0;
              border-top: 2px solid #333;
              padding-top: 10px;
            }
            .totals-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              font-size: 12px;
            }
            .totals-row.total {
              font-weight: bold;
              font-size: 14px;
              border-top: 1px solid #333;
              padding-top: 5px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 11px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
            .payment-info {
              text-align: center;
              margin-top: 10px;
              font-size: 12px;
              font-weight: 500;
            }
            @media print {
              body {
                margin: 0;
              }
              .receipt {
                border: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h1>BELLA LUNA</h1>
              <p>Recibo de Venta</p>
            </div>
            
            <div class="sale-number">Recibo #${order.saleNumber}</div>
            
            <table class="items-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th class="text-right">Cant</th>
                  <th class="text-right">Precio</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items
                  .map(
                    (item) => `
                  <tr>
                    <td>
                      <div class="item-name">${item.productName}</div>
                      <div style="font-size: 10px; color: #999;">${item.variantName}</div>
                    </td>
                    <td class="text-right">${item.quantity}</td>
                    <td class="text-right">${formatCurrency(item.unitPrice)}</td>
                    <td class="text-right"><strong>${formatCurrency(item.totalPrice)}</strong></td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
            
            <div class="totals">
              <div class="totals-row">
                <span>Subtotal:</span>
                <span>${formatCurrency(order.subtotal)}</span>
              </div>
              <div class="totals-row total">
                <span>Total:</span>
                <span>${formatCurrency(order.total)}</span>
              </div>
            </div>
            
            <div class="payment-info">
              Pago: ${order.paymentType === 'CASH' ? 'Efectivo' : order.paymentType === 'CARD' ? 'Tarjeta' : 'Cheque'}
            </div>
            
            <div class="footer">
              <p>Fecha: ${new Date(order.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}</p>
              <p>¡Gracias por su compra!</p>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();

    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Detalles del Recibo #{order.saleNumber}</Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Order Info */}
          <Box>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Información del Recibo
            </Typography>
            <Stack spacing={1} sx={{ ml: 2 }}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Fecha:</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {new Date(order.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Tipo de Pago:</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {order.paymentType === 'CASH' ? 'Efectivo' : order.paymentType === 'CARD' ? 'Tarjeta' : 'Cheque'}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Divider />

          {/* Items */}
          <Box>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Artículos
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Producto</TableCell>
                    <TableCell align="right">Cant</TableCell>
                    <TableCell align="right">Precio</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {item.productName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {item.variantName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(item.totalPrice)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Divider />

          {/* Totals */}
          <Box>
            <Stack spacing={1}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Subtotal:</Typography>
                <Typography variant="body2">{formatCurrency(order.subtotal)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" sx={{ pt: 1, borderTop: '1px solid #ddd' }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Total:
                </Typography>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  sx={{ color: 'primary.main', fontSize: '18px' }}
                >
                  {formatCurrency(order.total)}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {order.notes && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Notas
                </Typography>
                <Typography variant="body2" sx={{ ml: 2, fontStyle: 'italic', color: '#666' }}>
                  {order.notes}
                </Typography>
              </Box>
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
        <Button onClick={handlePrint} variant="contained" startIcon={<Print />}>
          Imprimir
        </Button>
      </DialogActions>
    </Dialog>
  );
}
