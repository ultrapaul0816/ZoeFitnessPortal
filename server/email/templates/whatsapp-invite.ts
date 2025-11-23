import type { EmailTemplate, WhatsAppInviteEmailData } from './base';
import { format } from 'date-fns';

export function createWhatsAppInviteEmail(data: WhatsAppInviteEmailData): EmailTemplate {
  const { firstName, whatsAppLink, expiryDate } = data;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Join Our WhatsApp Community!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #fdf2f8;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fdf2f8;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                Join Our Community! 💬
              </h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #1f2937; font-size: 18px; line-height: 1.6; margin: 0 0 20px;">
                Hi ${firstName},
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                You're invited to join our exclusive <strong>WhatsApp Community</strong>! This is where the magic happens—real mamas supporting each other, sharing wins, asking questions, and building strength together. 💪✨
              </p>
              
              <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 12px; padding: 24px; margin: 0 0 20px;">
                <p style="color: #065f46; font-size: 14px; line-height: 1.6; margin: 0 0 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                  ✨ What You'll Get
                </p>
                <ul style="color: #1f2937; font-size: 14px; line-height: 1.8; margin: 0; padding: 0 0 0 20px;">
                  <li>Daily motivation and encouragement</li>
                  <li>Direct support from Zoe and the team</li>
                  <li>A safe space to share your journey</li>
                  <li>Tips, advice, and inspiration from other mamas</li>
                  <li>Accountability partners who get it</li>
                </ul>
              </div>
              
              ${expiryDate ? `
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 0 0 20px;">
                <p style="color: #78350f; font-size: 14px; line-height: 1.6; margin: 0; font-weight: 600;">
                  ⏰ Your Access Expires: ${format(expiryDate, 'MMMM d, yyyy')}
                </p>
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 8px 0 0;">
                  Join now to make the most of your community access!
                </p>
              </div>
              ` : ''}
              
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 30px;">
                <tr>
                  <td align="center">
                    <a href="${whatsAppLink}" 
                       style="display: inline-block; background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(37, 211, 102, 0.3);">
                      Join WhatsApp Community
                    </a>
                  </td>
                </tr>
              </table>
              
              <div style="background-color: #fdf2f8; border-left: 4px solid #ec4899; padding: 20px; border-radius: 8px; margin: 0 0 20px;">
                <p style="color: #831843; font-size: 14px; line-height: 1.6; margin: 0; font-weight: 600;">
                  💡 Community Guidelines
                </p>
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 8px 0 0;">
                  Be kind, supportive, and respectful. We're all in this together, and every mama's journey is unique. This is a judgment-free zone!
                </p>
              </div>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0;">
                Can't wait to see you in the community!<br>
                <strong style="color: #25D366;">Zoe & The Team</strong>
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="background-color: #fdf2f8; padding: 30px; text-align: center; border-radius: 0 0 16px 16px;">
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 10px;">
                Questions about the community? Reach out anytime!
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

You're invited to join our exclusive WhatsApp Community! This is where the magic happens—real mamas supporting each other, sharing wins, asking questions, and building strength together.

What You'll Get:
- Daily motivation and encouragement
- Direct support from Zoe and the team
- A safe space to share your journey
- Tips, advice, and inspiration from other mamas
- Accountability partners who get it

${expiryDate ? `Your Access Expires: ${format(expiryDate, 'MMMM d, yyyy')}\nJoin now to make the most of your community access!\n\n` : ''}Join WhatsApp Community: ${whatsAppLink}

Community Guidelines: Be kind, supportive, and respectful. We're all in this together, and every mama's journey is unique. This is a judgment-free zone!

Can't wait to see you in the community!
Zoe & The Team

© ${new Date().getFullYear()} Stronger With Zoe. All rights reserved.
  `.trim();

  return {
    subject: `You're invited! Join our WhatsApp Community 💬`,
    html,
    text,
  };
}
