import crypto from 'crypto';
import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import { DatabaseServicePG } from './databaseServicePG';

export interface EmailVerificationToken {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  created_at: Date;
  used_at?: Date;
}

export class EmailVerificationService {
  private static transporter: nodemailer.Transporter | null = null;
  private static sendGridInitialized = false;

  /**
   * Initialize SendGrid
   */
  private static initializeSendGrid(): void {
    if (!this.sendGridInitialized && process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      this.sendGridInitialized = true;
      console.log('📧 SendGrid initialized successfully');
    }
  }

  /**
   * Initialize email transporter
   */
  private static getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      // Configure based on environment variables
      const emailProvider = process.env.EMAIL_PROVIDER || 'smtp';
      
      if (emailProvider === 'smtp') {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'localhost',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
      } else if (emailProvider === 'sendgrid') {
        this.transporter = nodemailer.createTransport({
          service: 'SendGrid',
          auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY
          }
        });
      } else if (emailProvider === 'gmail') {
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
          }
        });
      } else {
        // Fallback to console logging for development
        // console.log('⚠️ No email provider configured, using console logging');
        this.transporter = nodemailer.createTransport({
          streamTransport: true,
          newline: 'unix',
          buffer: true
        });
      }
    }
    
    return this.transporter;
  }

  /**
   * Generate a verification token
   */
  static generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Create and store verification token for user
   */
  static async createVerificationToken(userId: number): Promise<string> {
    const token = this.generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const query = `
      INSERT INTO email_verification_tokens (user_id, token, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id
    `;

    await DatabaseServicePG.query(query, [userId, token, expiresAt]);
    return token;
  }

  /**
   * Send verification email using SendGrid or fallback to nodemailer
   */
  static async sendVerificationEmail(
    email: string, 
    firstName: string, 
    token: string
  ): Promise<boolean> {
    try {
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
      const emailProvider = process.env.EMAIL_PROVIDER || 'smtp';

      // Email content
      const subject = 'Verify Your Lantern AI Account';
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🏮 Lantern AI</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Career Guidance Platform</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Welcome to Lantern AI, ${firstName}!</h2>
            
            <p>Thank you for creating your account. To get started with personalized career guidance, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="background: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 14px;">
              ${verificationUrl}
            </p>
            
            <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                <strong>What's next?</strong><br>
                Once verified, you'll be able to:
              </p>
              <ul style="color: #666; font-size: 14px; margin: 10px 0;">
                <li>Take personalized career assessments</li>
                <li>Get AI-powered career recommendations</li>
                <li>Access detailed career pathways and action plans</li>
                <li>Connect with counselors and track your progress</li>
              </ul>
            </div>
            
            <div style="border-top: 1px solid #eee; margin-top: 20px; padding-top: 20px; color: #666; font-size: 12px;">
              <p>This verification link will expire in 24 hours. If you didn't create this account, you can safely ignore this email.</p>
              <p>Need help? Contact us at <a href="mailto:support@lanternai.com" style="color: #667eea;">support@lanternai.com</a></p>
            </div>
          </div>
        </body>
        </html>
      `;

      const textContent = `
Welcome to Lantern AI, ${firstName}!

Thank you for creating your account. To get started with personalized career guidance, please verify your email address by visiting this link:

${verificationUrl}

This verification link will expire in 24 hours. If you didn't create this account, you can safely ignore this email.

What's next?
Once verified, you'll be able to:
- Take personalized career assessments
- Get AI-powered career recommendations  
- Access detailed career pathways and action plans
- Connect with counselors and track your progress

Need help? Contact us at support@lanternai.com

Best regards,
The Lantern AI Team
      `;

      // Use SendGrid if configured
      if (emailProvider === 'sendgrid' && process.env.SENDGRID_API_KEY) {
        this.initializeSendGrid();
        
        const msg = {
          to: email,
          from: {
            email: process.env.FROM_EMAIL || 'noreply@lanternai.com',
            name: 'Lantern AI'
          },
          subject: subject,
          text: textContent,
          html: htmlContent,
          // SendGrid specific settings
          trackingSettings: {
            clickTracking: {
              enable: true,
              enableText: false
            },
            openTracking: {
              enable: true
            }
          },
          mailSettings: {
            sandboxMode: {
              enable: process.env.NODE_ENV === 'development' && process.env.SENDGRID_SANDBOX === 'true'
            }
          }
        };

        const result = await sgMail.send(msg);
        
        if (process.env.NODE_ENV === 'development') {
          console.log('📧 SendGrid verification email sent:');
          console.log('   To:', email);
          console.log('   Token:', token);
          console.log('   URL:', verificationUrl);
          console.log('   Message ID:', result[0].headers['x-message-id']);
        }

        return true;
      } else {
        // Fallback to nodemailer for other providers
        const transporter = this.getTransporter();
        const mailOptions = {
          from: process.env.FROM_EMAIL || 'noreply@lanternai.com',
          to: email,
          subject: subject,
          html: htmlContent,
          text: textContent
        };

        const info = await transporter.sendMail(mailOptions);
        
        if (process.env.NODE_ENV === 'development') {
          console.log('📧 Nodemailer verification email sent:');
          console.log('   To:', email);
          console.log('   Token:', token);
          console.log('   URL:', verificationUrl);
          console.log('   Message ID:', info.messageId);
        }

        return true;
      }
    } catch (error) {
      console.error('❌ Failed to send verification email:', error);
      
      // Log SendGrid specific errors
      if (error && typeof error === 'object' && 'response' in error) {
        const sgError = error as any;
        if (sgError.response && sgError.response.body) {
          console.error('SendGrid Error Details:', sgError.response.body);
        }
      }
      
      return false;
    }
  }

  /**
   * Verify email token
   */
  static async verifyEmailToken(token: string): Promise<{ success: boolean; userId?: number; error?: string }> {
    try {
      const query = `
        SELECT evt.*, u.email, u.email_verified
        FROM email_verification_tokens evt
        JOIN users u ON evt.user_id = u.id
        WHERE evt.token = $1 AND evt.used_at IS NULL
      `;

      const result = await DatabaseServicePG.query(query, [token]);
      
      if (result.rows.length === 0) {
        return { success: false, error: 'Invalid or expired verification token' };
      }

      const tokenData = result.rows[0];
      
      // Check if token is expired
      if (new Date() > new Date(tokenData.expires_at)) {
        return { success: false, error: 'Verification token has expired' };
      }

      // Check if email is already verified
      if (tokenData.email_verified) {
        return { success: false, error: 'Email is already verified' };
      }

      // Mark token as used
      const updateTokenQuery = `
        UPDATE email_verification_tokens 
        SET used_at = NOW() 
        WHERE id = $1
      `;
      await DatabaseServicePG.query(updateTokenQuery, [tokenData.id]);

      // Mark email as verified
      const updateUserQuery = `
        UPDATE users 
        SET email_verified = true, email_verified_at = NOW() 
        WHERE id = $1
      `;
      await DatabaseServicePG.query(updateUserQuery, [tokenData.user_id]);

      // console.log('✅ Email verified successfully for user:', tokenData.user_id);
      
      return { success: true, userId: tokenData.user_id };
    } catch (error) {
      // console.error('❌ Error verifying email token:', error);
      return { success: false, error: 'Failed to verify email' };
    }
  }

  /**
   * Resend verification email
   */
  static async resendVerificationEmail(userId: number): Promise<{ success: boolean; error?: string }> {
    try {
      // Get user details
      const userQuery = `
        SELECT email, first_name, email_verified 
        FROM users 
        WHERE id = $1
      `;
      const userResult = await DatabaseServicePG.query(userQuery, [userId]);
      
      if (userResult.rows.length === 0) {
        return { success: false, error: 'User not found' };
      }

      const user = userResult.rows[0];
      
      if (user.email_verified) {
        return { success: false, error: 'Email is already verified' };
      }

      // Invalidate existing tokens
      const invalidateQuery = `
        UPDATE email_verification_tokens 
        SET used_at = NOW() 
        WHERE user_id = $1 AND used_at IS NULL
      `;
      await DatabaseServicePG.query(invalidateQuery, [userId]);

      // Create new token and send email
      const token = await this.createVerificationToken(userId);
      const emailSent = await this.sendVerificationEmail(user.email, user.first_name, token);

      if (!emailSent) {
        return { success: false, error: 'Failed to send verification email' };
      }

      return { success: true };
    } catch (error) {
      // console.error('❌ Error resending verification email:', error);
      return { success: false, error: 'Failed to resend verification email' };
    }
  }

  /**
   * Check if user's email is verified
   */
  static async isEmailVerified(userId: number): Promise<boolean> {
    try {
      const query = `SELECT email_verified FROM users WHERE id = $1`;
      const result = await DatabaseServicePG.query(query, [userId]);
      
      return result.rows.length > 0 && result.rows[0].email_verified;
    } catch (error) {
      // console.error('❌ Error checking email verification status:', error);
      return false;
    }
  }
}