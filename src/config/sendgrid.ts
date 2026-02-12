import sgMail from '@sendgrid/mail';
import { config } from './index.js';

sgMail.setApiKey(config.sendgrid.apiKey);

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailData): Promise<boolean> {
  try {
    if (!config.sendgrid.apiKey) {



      return false;
    }

    await sgMail.send({
      to,
      from: config.sendgrid.fromEmail,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    });


    return true;
  } catch (error) {

    return false;
  }
}

// Email templates
export const emailTemplates = {
  welcome: (name: string) => ({
    subject: 'Bienvenido a Bella Luna',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #000000;">Bienvenido a Bella Luna</h1>
        <p>Hola ${name},</p>
        <p>Gracias por registrarte en nuestra tienda. Estamos emocionados de tenerte con nosotros.</p>
        <p>Explora nuestro catÃ¡logo y descubre los mejores productos de belleza.</p>
        <a href="${config.frontendUrl}" style="background-color: #000000; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 20px;">Ir a la tienda</a>
        <p style="margin-top: 30px; color: #666;">Â© 2024 Bella Luna. Todos los derechos reservados.</p>
      </div>
    `,
  }),

  orderConfirmation: (orderNumber: string, total: number) => ({
    subject: `ConfirmaciÃ³n de pedido - ${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #000000;">Â¡Gracias por tu compra!</h1>
        <p>Hemos recibido tu pedido correctamente.</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>NÃºmero de pedido:</strong> ${orderNumber}</p>
          <p><strong>Total:</strong> $${total.toLocaleString()}</p>
        </div>
        <p>Te notificaremos cuando tu pedido estÃ© en camino.</p>
        <a href="${config.frontendUrl}/orders" style="background-color: #000000; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 20px;">Ver mi pedido</a>
        <p style="margin-top: 30px; color: #666;">Â© 2024 Bella Luna. Todos los derechos reservados.</p>
      </div>
    `,
  }),

  orderStatusUpdate: (orderNumber: string, status: string) => ({
    subject: `ActualizaciÃ³n de pedido - ${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #000000;">ActualizaciÃ³n de tu pedido</h1>
        <p>Tu pedido <strong>${orderNumber}</strong> ha sido actualizado.</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Estado actual:</strong> ${status}</p>
        </div>
        <a href="${config.frontendUrl}/orders" style="background-color: #000000; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 20px;">Ver detalles</a>
        <p style="margin-top: 30px; color: #666;">Â© 2024 Bella Luna. Todos los derechos reservados.</p>
      </div>
    `,
  }),
};

