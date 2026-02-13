import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';
import { sendEmail, emailTemplates } from '../../config/sendgrid.js';

export class EmailVerificationService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Generate a secure random token
   */
  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Create and send a verification link to a customer
   */
  async createVerificationLink(
    customerId: string, 
    email: string, 
    firstName: string,
    baseUrl: string
  ): Promise<string> {
    // Invalidate any existing unused tokens
    await this.prisma.emailVerification.updateMany({
      where: {
        customerId,
        used: false,
      },
      data: {
        used: true,
      },
    });

    // Generate new token
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store in database
    await this.prisma.emailVerification.create({
      data: {
        customerId,
        code: token, // Using code field to store token
        expiresAt,
      },
    });

    // Create verification URL
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

    // Send email
    const emailTemplate = emailTemplates.welcomeWithVerificationLink(firstName, verificationUrl);
    await sendEmail({
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    console.log(`[EmailVerification] Link sent to ${email}`);
    return token;
  }

  /**
   * Resend verification link
   */
  async resendVerificationLink(
    email: string, 
    baseUrl: string
  ): Promise<{ success: boolean; message: string }> {
    const customer = await this.prisma.customer.findUnique({
      where: { email },
    });

    if (!customer) {
      return { success: false, message: 'Customer not found' };
    }

    if (customer.isVerified) {
      return { success: false, message: 'Account already verified' };
    }

    // Check if there's a recent token (prevent spam)
    const recentToken = await this.prisma.emailVerification.findFirst({
      where: {
        customerId: customer.id,
        used: false,
        createdAt: {
          gte: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes
        },
      },
    });

    if (recentToken) {
      return { 
        success: false, 
        message: 'Please wait 2 minutes before requesting a new link' 
      };
    }

    // Generate and send new link
    await this.createVerificationLink(
      customer.id,
      customer.email,
      customer.firstName,
      baseUrl
    );

    return { success: true, message: 'Verification link sent successfully' };
  }

  /**
   * Verify email with token (magic link)
   */
  async verifyEmailWithToken(token: string): Promise<{ 
    success: boolean; 
    message: string;
    customer?: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      isVerified: boolean;
    }
  }> {
    // Find valid verification token
    const verification = await this.prisma.emailVerification.findFirst({
      where: {
        code: token,
        used: false,
        expiresAt: {
          gte: new Date(),
        },
      },
      include: {
        customer: true,
      },
    });

    if (!verification) {
      return { success: false, message: 'Invalid or expired verification link' };
    }

    const customer = verification.customer;

    if (customer.isVerified) {
      return { success: false, message: 'Account already verified' };
    }

    // Mark token as used
    await this.prisma.emailVerification.update({
      where: { id: verification.id },
      data: { used: true },
    });

    // Activate customer account
    await this.prisma.customer.update({
      where: { id: customer.id },
      data: { isVerified: true },
    });

    // Send confirmation email
    const confirmationEmail = emailTemplates.accountVerified(customer.firstName);
    await sendEmail({
      to: customer.email,
      subject: confirmationEmail.subject,
      html: confirmationEmail.html,
    });

    console.log(`[EmailVerification] Customer ${customer.email} verified successfully`);

    return { 
      success: true, 
      message: 'Account verified successfully',
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        isVerified: true,
      }
    };
  }

  /**
   * Legacy: Verify email with code (for backward compatibility)
   */
  async verifyEmail(email: string, code: string): Promise<{ 
    success: boolean; 
    message: string;
    customer?: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      isVerified: boolean;
    }
  }> {
    const customer = await this.prisma.customer.findUnique({
      where: { email },
    });

    if (!customer) {
      return { success: false, message: 'Customer not found' };
    }

    if (customer.isVerified) {
      return { success: false, message: 'Account already verified' };
    }

    // Find valid verification code
    const verification = await this.prisma.emailVerification.findFirst({
      where: {
        customerId: customer.id,
        code,
        used: false,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!verification) {
      return { success: false, message: 'Invalid or expired verification code' };
    }

    // Mark code as used
    await this.prisma.emailVerification.update({
      where: { id: verification.id },
      data: { used: true },
    });

    // Activate customer account
    await this.prisma.customer.update({
      where: { id: customer.id },
      data: { isVerified: true },
    });

    // Send confirmation email
    const confirmationEmail = emailTemplates.accountVerified(customer.firstName);
    await sendEmail({
      to: customer.email,
      subject: confirmationEmail.subject,
      html: confirmationEmail.html,
    });

    console.log(`[EmailVerification] Customer ${email} verified successfully`);

    return { 
      success: true, 
      message: 'Account verified successfully',
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        isVerified: true,
      }
    };
  }

  /**
   * Check if customer has a valid verification token
   */
  async hasValidToken(customerId: string): Promise<boolean> {
    const verification = await this.prisma.emailVerification.findFirst({
      where: {
        customerId,
        used: false,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    return !!verification;
  }

  /**
   * Check if customer has a valid verification code (legacy)
   */
  async hasValidCode(customerId: string): Promise<boolean> {
    return this.hasValidToken(customerId);
  }

  /**
   * Clean up expired verification tokens (can be called by a cron job)
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.prisma.emailVerification.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    console.log(`[EmailVerification] Cleaned up ${result.count} expired tokens`);
    return result.count;
  }
}
