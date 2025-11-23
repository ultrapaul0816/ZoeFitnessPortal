import type { EmailTemplate, ReEngagementEmailData } from './base';

export function createReEngagementEmail(data: ReEngagementEmailData): EmailTemplate {
  const { firstName, lastLoginDays, programProgress } = data;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>We Miss You!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #fdf2f8;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fdf2f8;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                We Miss You, ${firstName}! 💕
              </h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #1f2937; font-size: 18px; line-height: 1.6; margin: 0 0 20px;">
                Hi ${firstName},
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                It's been ${lastLoginDays} days since we last saw you, and we wanted to check in. Life with a little one is beautifully chaotic—we get it! But remember, taking even 20 minutes for yourself isn't selfish, it's essential.
              </p>
              
              ${programProgress !== undefined ? `
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 0 0 20px;">
                <p style="color: #78350f; font-size: 14px; line-height: 1.6; margin: 0; font-weight: 600;">
                  📊 Your Progress
                </p>
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 8px 0 0;">
                  You're ${programProgress}% through your program. You've already come so far—let's keep that momentum going!
                </p>
              </div>
              ` : ''}
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                Your program is waiting for you, and there's no pressure to be perfect. Just show up for yourself today—even if it's just to stretch or breathe. You've got this, mama. 💪
              </p>
              
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 30px;">
                <tr>
                  <td align="center">
                    <a href="${process.env.REPLIT_DEV_DOMAIN || 'https://your-domain.repl.co'}/dashboard" 
                       style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(236, 72, 153, 0.3);">
                      Continue Your Journey
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0;">
                Rooting for you always,<br>
                <strong style="color: #ec4899;">Zoe & The Team</strong>
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="background-color: #fdf2f8; padding: 30px; text-align: center; border-radius: 0 0 16px 16px;">
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 10px;">
                Need support? We're here for you!
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

It's been ${lastLoginDays} days since we last saw you, and we wanted to check in. Life with a little one is beautifully chaotic—we get it! But remember, taking even 20 minutes for yourself isn't selfish, it's essential.

${programProgress !== undefined ? `Your Progress: You're ${programProgress}% through your program. You've already come so far—let's keep that momentum going!\n\n` : ''}Your program is waiting for you, and there's no pressure to be perfect. Just show up for yourself today—even if it's just to stretch or breathe. You've got this, mama.

Continue your journey: ${process.env.REPLIT_DEV_DOMAIN || 'https://your-domain.repl.co'}/dashboard

Rooting for you always,
Zoe & The Team

© ${new Date().getFullYear()} Stronger With Zoe. All rights reserved.
  `.trim();

  return {
    subject: `We miss you, ${firstName}! Your strength journey is waiting 💕`,
    html,
    text,
  };
}
