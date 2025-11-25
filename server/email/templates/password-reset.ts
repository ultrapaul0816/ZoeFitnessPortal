import type { EmailTemplate } from './base';

export interface PasswordResetEmailData {
  firstName: string;
  code: string;
}

export function createPasswordResetEmail(data: PasswordResetEmailData): EmailTemplate {
  const { firstName, code } = data;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Login Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #fdf2f8;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fdf2f8;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                Your Login Code 🔐
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #1f2937; font-size: 18px; line-height: 1.6; margin: 0 0 20px;">
                Hi ${firstName},
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                We received a request to help you log in to your account. Use the code below to continue:
              </p>
              
              <!-- OTP Code Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <div style="background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%); border: 2px solid #ec4899; border-radius: 12px; padding: 24px 40px; display: inline-block;">
                      <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #be185d; font-family: 'Courier New', monospace;">
                        ${code}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>
              
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 8px; margin: 0 0 20px;">
                <p style="color: #92400e; font-size: 14px; line-height: 1.6; margin: 0; font-weight: 600;">
                  ⏱️ This code expires in 10 minutes
                </p>
                <p style="color: #78350f; font-size: 14px; line-height: 1.6; margin: 8px 0 0;">
                  If you didn't request this code, you can safely ignore this email.
                </p>
              </div>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0;">
                With strength and support,<br>
                <strong style="color: #ec4899;">Zoe & The Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #fdf2f8; padding: 30px; text-align: center; border-radius: 0 0 16px 16px;">
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 10px;">
                Need help? We're here for you!
              </p>
              <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 0;">
                © ${new Date().getFullYear()} Stronger With Zoe. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
Hi ${firstName},

We received a request to help you log in to your account. Use the code below to continue:

Your login code: ${code}

This code expires in 10 minutes.

If you didn't request this code, you can safely ignore this email.

With strength and support,
Zoe & The Team

© ${new Date().getFullYear()} Stronger With Zoe. All rights reserved.
  `.trim();

  return {
    subject: `Your Login Code: ${code}`,
    html,
    text,
  };
}
