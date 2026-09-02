import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const createTransporter = () => {
  const host = (env.SMTP_HOST || process.env.SMTP_HOST || '').trim();
  const user = (env.SMTP_USER || process.env.SMTP_USER || '').trim();
  const rawPass = (env.SMTP_PASS || process.env.SMTP_PASS || '').trim();
  const pass = rawPass.replace(/\s+/g, ''); // Strip spaces from Gmail 16-char App Passwords
  const port = parseInt(env.SMTP_PORT || process.env.SMTP_PORT || '587', 10);
  const secure = port === 465;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      family: 4, // Force IPv4 addressing to avoid ENETUNREACH on Render/Cloud hosts
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false,
        servername: host,
      },
    });
  }
  return null;
};

export const emailService = {
  sendOTPEmail: async ({ to, name, otp }) => {
    const transporter = createTransporter();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Georgia, 'Times New Roman', serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }
          .container { max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; }
          .header { text-align: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 24px; }
          .brand { font-size: 24px; font-weight: bold; color: #dc2626; text-decoration: none; }
          .title { font-size: 20px; font-weight: bold; margin-bottom: 12px; }
          .text { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
          .otp-box { background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
          .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #dc2626; }
          .footer { margin-top: 32px; pt: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="brand">NewsSphere</span>
          </div>
          <div class="title">Verification Code (OTP)</div>
          <p class="text">Hello ${name || 'Reader'},</p>
          <p class="text">Use the 6-digit verification code below to authorize your password reset request:</p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>
          <p class="text" style="font-size: 12px; color: #94a3b8; text-align: center;">This verification code is valid for 10 minutes. Do not share this code with anyone.</p>
          <div class="footer">
            &copy; 2026 NewsSphere. Advanced AI Digital News Platform.
          </div>
        </div>
      </body>
      </html>
    `;

    if (transporter) {
      try {
        const fromAddress = env.EMAIL_FROM || process.env.EMAIL_FROM || `"NewsSphere Security" <${user}>`;
        await transporter.sendMail({
          from: fromAddress,
          to,
          subject: `🔑 ${otp} is your NewsSphere Verification Code`,
          html: htmlContent,
        });
        console.log(`[Email Service] OTP email dispatched to ${to}`);
        return true;
      } catch (err) {
        console.error('[Email Service Error]:', err.message);
      }
    } else {
      console.log(`\n[OTP EMAIL DISPATCH SIMULATED FOR ${to}]\nOTP CODE: ${otp}\n`);
    }

    return false;
  },

  sendPasswordResetEmail: async ({ to, name, resetUrl, resetToken }) => {
    const transporter = createTransporter();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Georgia, 'Times New Roman', serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }
          .container { max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; }
          .header { text-align: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 24px; }
          .brand { font-size: 24px; font-weight: bold; color: #dc2626; text-decoration: none; }
          .title { font-size: 20px; font-weight: bold; margin-bottom: 12px; }
          .text { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
          .btn { display: inline-block; background-color: #dc2626; color: #ffffff !important; padding: 12px 24px; font-size: 14px; font-weight: bold; border-radius: 8px; text-decoration: none; text-align: center; margin: 16px 0; }
          .footer { margin-top: 32px; pt: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="brand">NewsSphere</span>
          </div>
          <div class="title">Password Reset Request</div>
          <p class="text">Hello ${name || 'Reader'},</p>
          <p class="text">We received a request to reset your NewsSphere account password. Click the button below to set your new password:</p>
          <div style="text-align: center;">
            <a href="${resetUrl}" class="btn">Reset Password</a>
          </div>
          <p class="text" style="font-size: 12px; margin-top: 20px;">Or copy and paste this link into your browser:<br/><a href="${resetUrl}">${resetUrl}</a></p>
          <p class="text" style="font-size: 12px; color: #94a3b8;">This link will expire in 1 hour. If you did not request this, please ignore this email.</p>
          <div class="footer">
            &copy; 2026 NewsSphere. Advanced AI Digital News Platform.
          </div>
        </div>
      </body>
      </html>
    `;

    if (transporter) {
      try {
        const fromAddress = env.EMAIL_FROM || process.env.EMAIL_FROM || `"NewsSphere Security" <${user}>`;
        await transporter.sendMail({
          from: fromAddress,
          to,
          subject: '🔒 Reset Your NewsSphere Password',
          html: htmlContent,
        });
        console.log(`[Email Service] Password reset email dispatched to ${to}`);
        return true;
      } catch (err) {
        console.error('[Email Service Error]:', err.message);
      }
    } else {
      console.log(`\n[EMAIL DISPATCH SIMULATED FOR ${to}]\nReset URL: ${resetUrl}\nToken: ${resetToken}\n`);
    }

    return false;
  },
};
