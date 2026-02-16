import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import { sendEmail, emailTemplates } from '../../config/sendgrid.js';

export class PasswordResetService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Generate a secure random token
   */
  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Request password reset - sends email with reset link
   */
  async requestPasswordReset(email: string): Promise<{ 
    success: boolean; 
    message: string 
  }> {
    // Find customer by email
    const customer = await this.prisma.customer.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!customer) {
      return { 
        success: true, 
        message: 'Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña' 
      };
    }

    // Check for recent reset request (prevent spam)
    const recentRequest = await this.prisma.passwordReset.findFirst({
      where: {
        customerId: customer.id,
        used: false,
        createdAt: {
          gte: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes
        },
      },
    });

    if (recentRequest) {
      return { 
        success: false, 
        message: 'Por favor espera 2 minutos antes de solicitar otro enlace' 
      };
    }

    // Invalidate any existing unused tokens
    await this.prisma.passwordReset.updateMany({
      where: {
        customerId: customer.id,
        used: false,
      },
      data: {
        used: true,
      },
    });

    // Generate new token
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store in database
    await this.prisma.passwordReset.create({
      data: {
        customerId: customer.id,
        token,
        expiresAt,
      },
    });

    // Send email
    try {
      const emailTemplate = emailTemplates.passwordReset(customer.firstName, token);
      await sendEmail({
        to: customer.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });
    } catch (error) {
      // Don't expose email sending errors
    }

    return { 
      success: true, 
      message: 'Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña' 
    };
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ 
    success: boolean; 
    message: string 
  }> {
    // Validate password length
    if (!newPassword || newPassword.length < 8) {
      return { 
        success: false, 
        message: 'La contraseña debe tener al menos 8 caracteres' 
      };
    }

    // Find valid reset token
    const passwordReset = await this.prisma.passwordReset.findFirst({
      where: {
        token,
        used: false,
        expiresAt: {
          gte: new Date(),
        },
      },
      include: {
        customer: true,
      },
    });

    if (!passwordReset) {
      return { 
        success: false, 
        message: 'El enlace es inválido o ha expirado' 
      };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and mark token as used in a transaction
    await this.prisma.$transaction([
      this.prisma.customer.update({
        where: { id: passwordReset.customerId },
        data: { password: hashedPassword },
      }),
      this.prisma.passwordReset.update({
        where: { id: passwordReset.id },
        data: { used: true },
      }),
    ]);

    return { 
      success: true, 
      message: 'Tu contraseña ha sido restablecida correctamente' 
    };
  }

  /**
   * Validate reset token (check if it's still valid)
   */
  async validateResetToken(token: string): Promise<{ 
    valid: boolean; 
    email?: string 
  }> {
    const passwordReset = await this.prisma.passwordReset.findFirst({
      where: {
        token,
        used: false,
        expiresAt: {
          gte: new Date(),
        },
      },
      include: {
        customer: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!passwordReset) {
      return { valid: false };
    }

    return { 
      valid: true, 
      email: passwordReset.customer.email 
    };
  }
}
