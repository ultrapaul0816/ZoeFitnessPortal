import type { EmailTemplate, WelcomeEmailData } from './base';

export function createWelcomeEmail(data: WelcomeEmailData): EmailTemplate {
  const { firstName, programName } = data;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${programName}</title>
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
                Welcome to Your Journey! 💪
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
                You're doing amazing, mama! 🌸 Welcome to <strong>${programName}</strong>. We're so excited to support you on your postpartum strength recovery journey.
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                Your program is now ready and waiting for you. Remember, this is <em>your</em> journey—go at your own pace, celebrate every win (no matter how small), and know that we're here cheering you on every step of the way.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 30px;">
                <tr>
                  <td align="center">
                    <a href="${process.env.REPLIT_DEV_DOMAIN || 'https://your-domain.repl.co'}/dashboard" 
                       style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(236, 72, 153, 0.3);">
                      Start Your Journey
                    </a>
                  </td>
                </tr>
              </table>
              
              <div style="background-color: #fdf2f8; border-left: 4px solid #ec4899; padding: 20px; border-radius: 8px; margin: 0 0 20px;">
                <p style="color: #831843; font-size: 14px; line-height: 1.6; margin: 0; font-weight: 600;">
                  💡 Quick Tip
                </p>
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 8px 0 0;">
                  Set aside 20-30 minutes for your workouts. Consistency over perfection is key!
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
                Questions? We're here to help!
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

You're doing amazing, mama! Welcome to ${programName}. We're so excited to support you on your postpartum strength recovery journey.

Your program is now ready and waiting for you. Remember, this is your journey—go at your own pace, celebrate every win (no matter how small), and know that we're here cheering you on every step of the way.

Get started: ${process.env.REPLIT_DEV_DOMAIN || 'https://your-domain.repl.co'}/dashboard

Quick Tip: Set aside 20-30 minutes for your workouts. Consistency over perfection is key!

With strength and support,
Zoe & The Team

© ${new Date().getFullYear()} Stronger With Zoe. All rights reserved.
  `.trim();

  return {
    subject: `Welcome to ${programName}! Let's get started 💪`,
    html,
    text,
  };
}
