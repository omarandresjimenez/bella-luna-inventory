import sgMail from '@sendgrid/mail';
import { config } from './index.js';

// Lazy initialization - only set API key when first email is sent
let isInitialized = false;
function ensureInitialized() {
  if (!isInitialized) {
    console.log('[SendGrid] Initializing with API key:', config.sendgrid.apiKey ? 'Present (starts with: ' + config.sendgrid.apiKey.substring(0, 10) + '...)' : 'MISSING');
    console.log('[SendGrid] From email:', config.sendgrid.fromEmail);
    
    if (config.sendgrid.apiKey) {
      sgMail.setApiKey(config.sendgrid.apiKey);
      isInitialized = true;
    }
  }
}

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailData): Promise<boolean> {
  try {
    // Ensure SendGrid is initialized
    ensureInitialized();
    
    if (!config.sendgrid.apiKey) {
      console.error('[SendGrid] API key not configured - emails will not be sent');
      console.error('[SendGrid] Please set SENDGRID_API_KEY in your .env file');
      return false;
    }

    if (!config.sendgrid.fromEmail) {
      console.error('[SendGrid] From email not configured');
      console.error('[SendGrid] Please set SENDGRID_FROM_EMAIL in your .env file');
      return false;
    }

    console.log('[SendGrid] Attempting to send email:');
    console.log('  - To:', to);
    console.log('  - From:', config.sendgrid.fromEmail);
    console.log('  - Subject:', subject);

    const result = await sgMail.send({
      to,
      from: config.sendgrid.fromEmail,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    });

    console.log(`[SendGrid] ✅ Email sent successfully to ${to}`);
    console.log('[SendGrid] Response status:', result[0]?.statusCode);
    return true;
  } catch (error: any) {
    console.error('[SendGrid] ❌ Error sending email:', error);
    if (error.response) {
      console.error('[SendGrid] Error response body:', error.response.body);
      console.error('[SendGrid] Error status code:', error.response.statusCode);
    }
    return false;
  }
}

// Bella Luna Brand Colors and Styles
const brandColors = {
  primary: '#1a1a1a',
  secondary: '#c9a962',
  accent: '#f5f5f5',
  text: '#333333',
  lightText: '#666666',
  white: '#ffffff',
  border: '#e0e0e0',
};

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bella Luna</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');
    
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f8f8f8;
      color: ${brandColors.text};
    }
    
    .email-wrapper {
      max-width: 600px;
      margin: 0 auto;
      background-color: ${brandColors.white};
    }
    
    .email-header {
      background: linear-gradient(135deg, ${brandColors.primary} 0%, #2d2d2d 100%);
      padding: 40px 30px;
      text-align: center;
    }
    
    .logo {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 32px;
      font-weight: 700;
      color: ${brandColors.white};
      letter-spacing: 2px;
      margin: 0;
    }
    
    .logo-subtitle {
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      color: ${brandColors.secondary};
      letter-spacing: 4px;
      text-transform: uppercase;
      margin-top: 8px;
    }
    
    .email-body {
      padding: 40px 30px;
    }
    
    .email-footer {
      background-color: ${brandColors.primary};
      padding: 30px;
      text-align: center;
      color: ${brandColors.white};
    }
    
    .footer-text {
      font-size: 12px;
      color: #999;
      margin-bottom: 15px;
    }
    
    .social-links {
      margin: 20px 0;
    }
    
    .social-link {
      display: inline-block;
      margin: 0 10px;
      color: ${brandColors.secondary};
      text-decoration: none;
      font-size: 14px;
    }
    
    .divider {
      height: 1px;
      background-color: ${brandColors.border};
      margin: 30px 0;
    }
    
    .btn-primary {
      display: inline-block;
      background: linear-gradient(135deg, ${brandColors.primary} 0%, #2d2d2d 100%);
      color: ${brandColors.white};
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      font-size: 14px;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-top: 20px;
      transition: all 0.3s ease;
    }
    
    .btn-secondary {
      display: inline-block;
      background-color: transparent;
      color: ${brandColors.primary};
      padding: 14px 35px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 500;
      font-size: 14px;
      border: 2px solid ${brandColors.primary};
      margin-top: 15px;
    }
    
    .highlight-box {
      background: linear-gradient(135deg, #faf8f5 0%, #f5f0e8 100%);
      border-left: 4px solid ${brandColors.secondary};
      padding: 25px;
      margin: 25px 0;
      border-radius: 0 8px 8px 0;
    }
    
    .code-box {
      background-color: ${brandColors.primary};
      color: ${brandColors.secondary};
      font-family: 'Courier New', monospace;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 8px;
      padding: 25px;
      text-align: center;
      border-radius: 8px;
      margin: 25px 0;
    }
    
    .order-summary {
      background-color: #fafafa;
      border-radius: 8px;
      padding: 25px;
      margin: 25px 0;
    }
    
    .order-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid ${brandColors.border};
    }
    
    .order-row:last-child {
      border-bottom: none;
      font-weight: 600;
      font-size: 18px;
      color: ${brandColors.primary};
    }
    
    .product-item {
      display: flex;
      padding: 15px 0;
      border-bottom: 1px solid ${brandColors.border};
    }
    
    .product-item:last-child {
      border-bottom: none;
    }
    
    .product-details {
      flex: 1;
    }
    
    .product-name {
      font-weight: 600;
      color: ${brandColors.primary};
      margin-bottom: 5px;
    }
    
    .product-variant {
      font-size: 13px;
      color: ${brandColors.lightText};
    }
    
    .product-price {
      text-align: right;
      font-weight: 600;
    }
    
    .info-box {
      background-color: #f0f7ff;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    
    .info-title {
      font-weight: 600;
      color: ${brandColors.primary};
      margin-bottom: 10px;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    h1 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 28px;
      font-weight: 600;
      color: ${brandColors.primary};
      margin: 0 0 20px 0;
    }
    
    h2 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 22px;
      font-weight: 600;
      color: ${brandColors.primary};
      margin: 30px 0 15px 0;
    }
    
    p {
      line-height: 1.7;
      color: ${brandColors.text};
      margin: 15px 0;
    }
    
    .greeting {
      font-size: 18px;
      font-weight: 500;
      color: ${brandColors.primary};
      margin-bottom: 20px;
    }
    
    .signature {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid ${brandColors.border};
    }
    
    .signature-name {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 18px;
      color: ${brandColors.primary};
      font-weight: 600;
    }
    
    .status-badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .status-pending {
      background-color: #fff3cd;
      color: #856404;
    }
    
    .status-confirmed {
      background-color: #d4edda;
      color: #155724;
    }
    
    .status-preparing {
      background-color: #cce5ff;
      color: #004085;
    }
    
    .status-delivered {
      background-color: #d1ecf1;
      color: #0c5460;
    }
    
    @media only screen and (max-width: 600px) {
      .email-body {
        padding: 30px 20px;
      }
      
      h1 {
        font-size: 24px;
      }
      
      .code-box {
        font-size: 24px;
        letter-spacing: 4px;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-header">
      <div class="logo">Bella Luna</div>
      <div class="logo-subtitle">Belleza & Estilo</div>
    </div>
    
    <div class="email-body">
      ${content}
    </div>
    
    <div class="email-footer">
      <div class="footer-text">
        © ${new Date().getFullYear()} Bella Luna. Todos los derechos reservados.
      </div>
      <div class="footer-text">
        Este email fue enviado automáticamente. Por favor no respondas a este mensaje.
      </div>
      <div class="social-links">
        <a href="${config.frontendUrl}" class="social-link">Tienda</a>
        <span style="color: #666;">|</span>
        <a href="${config.frontendUrl}/contact" class="social-link">Contacto</a>
      </div>
    </div>
  </div>
</body>
</html>
`;

// Email templates
export const emailTemplates = {
  // Welcome email with verification link (magic link)
  welcomeWithVerificationLink: (name: string, verificationUrl: string) => ({
    subject: 'Bienvenido a Bella Luna - Verifica tu cuenta',
    html: baseTemplate(`
      <div class="greeting">Hola ${name},</div>
      
      <h1>Bienvenido a Bella Luna</h1>
      
      <p>Gracias por unirte a nuestra familia. Estamos emocionados de tenerte con nosotros y ayudarte a descubrir los mejores productos de belleza.</p>
      
      <div class="highlight-box">
        <p style="margin: 0; font-weight: 500;">Para activar tu cuenta, haz clic en el siguiente botón:</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" class="btn-primary">
          Verificar mi cuenta
        </a>
      </div>
      
      <p style="text-align: center; color: ${brandColors.lightText}; font-size: 14px;">
        O copia y pega este enlace en tu navegador:<br>
        <a href="${verificationUrl}" style="color: ${brandColors.secondary}; word-break: break-all;">${verificationUrl}</a>
      </p>
      
      <p style="text-align: center; color: ${brandColors.lightText}; font-size: 14px;">
        Este enlace expirará en <strong>24 horas</strong>
      </p>
      
      <div class="divider"></div>
      
      <p style="font-size: 14px; color: ${brandColors.lightText};">
        Si no creaste esta cuenta, puedes ignorar este email. Tu información está segura.
      </p>
      
      <div class="signature">
        <div class="signature-name">El equipo de Bella Luna</div>
        <p style="font-size: 14px; color: ${brandColors.lightText}; margin-top: 10px;">
          Belleza que inspira, calidad que se siente
        </p>
      </div>
    `),
  }),

  // Welcome email with verification code (legacy - kept for backward compatibility)
  welcomeWithVerification: (name: string, code: string) => ({
    subject: 'Bienvenido a Bella Luna - Verifica tu cuenta',
    html: baseTemplate(`
      <div class="greeting">Hola ${name},</div>
      
      <h1>Bienvenido a Bella Luna</h1>
      
      <p>Gracias por unirte a nuestra familia. Estamos emocionados de tenerte con nosotros y ayudarte a descubrir los mejores productos de belleza.</p>
      
      <div class="highlight-box">
        <p style="margin: 0; font-weight: 500;">Para activar tu cuenta, por favor utiliza el siguiente código de verificación:</p>
      </div>
      
      <div class="code-box">
        ${code}
      </div>
      
      <p style="text-align: center; color: ${brandColors.lightText}; font-size: 14px;">
        Este código expirará en <strong>30 minutos</strong>
      </p>
      
      <div style="text-align: center;">
        <a href="${config.frontendUrl}/verify-email?code=${code}" class="btn-primary">
          Verificar mi cuenta
        </a>
      </div>
      
      <div class="divider"></div>
      
      <p style="font-size: 14px; color: ${brandColors.lightText};">
        Si no creaste esta cuenta, puedes ignorar este email. Tu información está segura.
      </p>
      
      <div class="signature">
        <div class="signature-name">El equipo de Bella Luna</div>
        <p style="font-size: 14px; color: ${brandColors.lightText}; margin-top: 10px;">
          Belleza que inspira, calidad que se siente
        </p>
      </div>
    `),
  }),

  // Verification code email (for resending)
  verificationCode: (name: string, code: string) => ({
    subject: 'Código de verificación - Bella Luna',
    html: baseTemplate(`
      <div class="greeting">Hola ${name},</div>
      
      <h1>Tu código de verificación</h1>
      
      <p>Has solicitado un nuevo código de verificación para tu cuenta en Bella Luna.</p>
      
      <div class="code-box">
        ${code}
      </div>
      
      <p style="text-align: center; color: ${brandColors.lightText}; font-size: 14px;">
        Este código expirará en <strong>30 minutos</strong>
      </p>
      
      <div style="text-align: center;">
        <a href="${config.frontendUrl}/verify-email?code=${code}" class="btn-primary">
          Verificar mi cuenta
        </a>
      </div>
      
      <div class="divider"></div>
      
      <p style="font-size: 14px; color: ${brandColors.lightText};">
        Si no solicitaste este código, por favor ignora este email o contacta a nuestro equipo de soporte.
      </p>
    `),
  }),

  // Account verified confirmation
  accountVerified: (name: string) => ({
    subject: '¡Tu cuenta ha sido verificada! - Bella Luna',
    html: baseTemplate(`
      <div class="greeting">Hola ${name},</div>
      
      <h1>¡Cuenta verificada con éxito!</h1>
      
      <div class="highlight-box">
        <p style="margin: 0; font-weight: 500;">
          Tu cuenta ha sido activada correctamente. Ahora puedes disfrutar de todas las funcionalidades de Bella Luna.
        </p>
      </div>
      
      <p>Como cliente verificado, ahora puedes:</p>
      
      <ul style="line-height: 2; color: ${brandColors.text};">
        <li>Realizar compras de forma segura</li>
        <li>Guardar tus direcciones de envío</li>
        <li>Ver el historial de tus pedidos</li>
        <li>Guardar tus productos favoritos</li>
        <li>Recibir ofertas exclusivas</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${config.frontendUrl}/products" class="btn-primary">
          Explorar productos
        </a>
      </div>
      
      <div class="signature">
        <div class="signature-name">El equipo de Bella Luna</div>
      </div>
    `),
  }),

  // Order confirmation for customer
  orderConfirmation: (orderNumber: string, customerName: string, items: any[], total: number, shippingAddress: any) => ({
    subject: `Confirmación de pedido - ${orderNumber}`,
    html: baseTemplate(`
      <div class="greeting">Hola ${customerName},</div>
      
      <h1>¡Gracias por tu compra!</h1>
      
      <div class="highlight-box">
        <p style="margin: 0; font-weight: 500;">
          Hemos recibido tu pedido correctamente. Te notificaremos cuando sea enviado.
        </p>
      </div>
      
      <div style="text-align: center; margin: 25px 0;">
        <span class="status-badge status-pending">Pedido Recibido</span>
      </div>
      
      <div class="info-box">
        <div class="info-title">Número de pedido</div>
        <p style="margin: 0; font-size: 18px; font-weight: 600; color: ${brandColors.primary};">
          ${orderNumber}
        </p>
      </div>
      
      <h2>Resumen del pedido</h2>
      
      <div class="order-summary">
        ${items.map(item => `
          <div class="product-item">
            <div class="product-details">
              <div class="product-name">${item.productName}</div>
              <div class="product-variant">${item.variantName}</div>
              <div class="product-variant">Cantidad: ${item.quantity}</div>
            </div>
            <div class="product-price">
              $${item.totalPrice.toLocaleString()}
            </div>
          </div>
        `).join('')}
        
        <div class="divider"></div>
        
        <div class="order-row">
          <span>Subtotal</span>
          <span>$${(total * 0.9).toLocaleString()}</span>
        </div>
        <div class="order-row">
          <span>Envío</span>
          <span>Gratis</span>
        </div>
        <div class="order-row">
          <span>Total</span>
          <span>$${total.toLocaleString()}</span>
        </div>
      </div>
      
      <div class="info-box">
        <div class="info-title">Dirección de envío</div>
        <p style="margin: 0; line-height: 1.6;">
          ${shippingAddress.street}<br>
          ${shippingAddress.city}, ${shippingAddress.state}<br>
          ${shippingAddress.zipCode}
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${config.frontendUrl}/orders/${orderNumber}" class="btn-primary">
          Ver mi pedido
        </a>
      </div>
      
      <p style="font-size: 14px; color: ${brandColors.lightText};">
        Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos respondiendo a este email o visitando nuestra página de contacto.
      </p>
      
      <div class="signature">
        <div class="signature-name">El equipo de Bella Luna</div>
        <p style="font-size: 14px; color: ${brandColors.lightText}; margin-top: 10px;">
          Gracias por confiar en nosotros
        </p>
      </div>
    `),
  }),

  // Order notification for admins
  orderNotificationAdmin: (orderNumber: string, customerName: string, customerEmail: string, items: any[], total: number) => ({
    subject: `Nuevo pedido recibido - ${orderNumber}`,
    html: baseTemplate(`
      <div class="greeting">Hola Administrador,</div>
      
      <h1>Nuevo Pedido Recibido</h1>
      
      <div class="highlight-box">
        <p style="margin: 0; font-weight: 500;">
          Se ha recibido un nuevo pedido que requiere tu atención.
        </p>
      </div>
      
      <div class="info-box">
        <div class="info-title">Detalles del pedido</div>
        <p style="margin: 5px 0;"><strong>Número:</strong> ${orderNumber}</p>
        <p style="margin: 5px 0;"><strong>Cliente:</strong> ${customerName}</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> ${customerEmail}</p>
        <p style="margin: 5px 0;"><strong>Fecha:</strong> ${new Date().toLocaleString('es-CO')}</p>
      </div>
      
      <h2>Productos ordenados</h2>
      
      <div class="order-summary">
        ${items.map(item => `
          <div class="product-item">
            <div class="product-details">
              <div class="product-name">${item.productName}</div>
              <div class="product-variant">${item.variantName}</div>
              <div class="product-variant">Cantidad: ${item.quantity} x $${item.unitPrice.toLocaleString()}</div>
            </div>
            <div class="product-price">
              $${item.totalPrice.toLocaleString()}
            </div>
          </div>
        `).join('')}
        
        <div class="divider"></div>
        
        <div class="order-row">
          <span>Total del pedido</span>
          <span style="font-size: 20px;">$${total.toLocaleString()}</span>
        </div>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${config.frontendUrl}/admin/orders/${orderNumber}" class="btn-primary">
          Ver pedido en admin
        </a>
      </div>
      
      <div style="text-align: center; margin: 15px 0;">
        <a href="${config.frontendUrl}/admin/orders" class="btn-secondary">
          Ver todos los pedidos
        </a>
      </div>
    `),
  }),

  // Order status update
  orderStatusUpdate: (orderNumber: string, customerName: string, status: string, statusMessage: string) => {
    const statusClasses: Record<string, string> = {
      'CONFIRMED': 'status-confirmed',
      'PREPARING': 'status-preparing',
      'READY_FOR_PICKUP': 'status-preparing',
      'OUT_FOR_DELIVERY': 'status-preparing',
      'DELIVERED': 'status-delivered',
    };
    
    const statusLabels: Record<string, string> = {
      'PENDING': 'Pendiente',
      'CONFIRMED': 'Confirmado',
      'PREPARING': 'En preparación',
      'READY_FOR_PICKUP': 'Listo para recoger',
      'OUT_FOR_DELIVERY': 'En camino',
      'DELIVERED': 'Entregado',
      'CANCELLED': 'Cancelado',
    };
    
    return {
      subject: `Actualización de pedido - ${orderNumber}`,
      html: baseTemplate(`
        <div class="greeting">Hola ${customerName},</div>
        
        <h1>Actualización de tu pedido</h1>
        
        <div style="text-align: center; margin: 25px 0;">
          <span class="status-badge ${statusClasses[status] || 'status-pending'}">
            ${statusLabels[status] || status}
          </span>
        </div>
        
        <div class="highlight-box">
          <p style="margin: 0; font-weight: 500;">${statusMessage}</p>
        </div>
        
        <div class="info-box">
          <div class="info-title">Número de pedido</div>
          <p style="margin: 0; font-size: 18px; font-weight: 600; color: ${brandColors.primary};">
            ${orderNumber}
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${config.frontendUrl}/orders/${orderNumber}" class="btn-primary">
            Ver detalles del pedido
          </a>
        </div>
        
        <p style="font-size: 14px; color: ${brandColors.lightText};">
          Te mantendremos informado sobre cualquier actualización adicional de tu pedido.
        </p>
        
        <div class="signature">
          <div class="signature-name">El equipo de Bella Luna</div>
        </div>
      `),
    };
  },

  // Welcome email (for already verified users)
  welcome: (name: string) => ({
    subject: 'Bienvenido a Bella Luna',
    html: baseTemplate(`
      <div class="greeting">Hola ${name},</div>
      
      <h1>Bienvenido a Bella Luna</h1>
      
      <div class="highlight-box">
        <p style="margin: 0; font-weight: 500;">
          Gracias por unirte a nuestra familia. Estamos emocionados de tenerte con nosotros.
        </p>
      </div>
      
      <p>En Bella Luna encontrarás los mejores productos de belleza cuidadosamente seleccionados para ti. Nuestro compromiso es ofrecerte calidad, elegancia y un servicio excepcional.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${config.frontendUrl}/products" class="btn-primary">
          Explorar productos
        </a>
      </div>
      
      <div class="divider"></div>
      
      <h2>¿Por qué elegir Bella Luna?</h2>
      
      <ul style="line-height: 2; color: ${brandColors.text};">
        <li>Productos de alta calidad</li>
        <li>Envíos rápidos y seguros</li>
        <li>Atención al cliente personalizada</li>
        <li>Ofertas exclusivas para miembros</li>
      </ul>
      
      <div class="signature">
        <div class="signature-name">El equipo de Bella Luna</div>
        <p style="font-size: 14px; color: ${brandColors.lightText}; margin-top: 10px;">
          Belleza que inspira, calidad que se siente
        </p>
      </div>
    `),
  }),

  // Password reset
  passwordReset: (name: string, resetToken: string) => ({
    subject: 'Recuperación de contraseña - Bella Luna',
    html: baseTemplate(`
      <div class="greeting">Hola ${name},</div>
      
      <h1>Recuperación de contraseña</h1>
      
      <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente botón para crear una nueva contraseña:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${config.frontendUrl}/reset-password?token=${resetToken}" class="btn-primary">
          Restablecer contraseña
        </a>
      </div>
      
      <div class="highlight-box">
        <p style="margin: 0; font-size: 14px;">
          Este enlace expirará en <strong>1 hora</strong> por seguridad.
        </p>
      </div>
      
      <p style="font-size: 14px; color: ${brandColors.lightText};">
        Si no solicitaste este cambio, puedes ignorar este email. Tu contraseña actual seguirá siendo válida.
      </p>
    `),
  }),
};

// Helper function to send order emails
export async function sendOrderEmails(
  orderData: {
    orderNumber: string;
    customer: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
    items: any[];
    total: number;
    shippingAddress: any;
  },
  prisma: any
): Promise<void> {
  try {
    console.log('[sendOrderEmails] Starting email sending process...');
    console.log('[sendOrderEmails] Customer email:', orderData.customer.email);
    
    // Send confirmation to customer
    const customerEmail = emailTemplates.orderConfirmation(
      orderData.orderNumber,
      orderData.customer.firstName,
      orderData.items,
      orderData.total,
      orderData.shippingAddress
    );
    
    console.log('[sendOrderEmails] Sending confirmation to customer:', orderData.customer.email);
    const customerEmailSent = await sendEmail({
      to: orderData.customer.email,
      subject: customerEmail.subject,
      html: customerEmail.html,
    });
    
    if (customerEmailSent) {
      console.log('[sendOrderEmails] ✅ Customer confirmation email sent successfully');
    } else {
      console.error('[sendOrderEmails] ❌ Failed to send customer confirmation email');
    }

    // Get all admin users
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'MANAGER'] },
        isActive: true,
      },
      select: {
        email: true,
        firstName: true,
      },
    });

    console.log(`[sendOrderEmails] Found ${admins.length} admin(s) to notify`);

    // Send notification to all admins
    const adminEmail = emailTemplates.orderNotificationAdmin(
      orderData.orderNumber,
      `${orderData.customer.firstName} ${orderData.customer.lastName}`,
      orderData.customer.email,
      orderData.items,
      orderData.total
    );

    for (const admin of admins) {
      console.log('[sendOrderEmails] Sending admin notification to:', admin.email);
      await sendEmail({
        to: admin.email,
        subject: adminEmail.subject,
        html: adminEmail.html,
      });
    }

    console.log(`[Email] ✅ Order emails sent for order ${orderData.orderNumber}`);
  } catch (error) {
    console.error('[Email] ❌ Error sending order emails:', error);
  }
}

export default sendEmail;
