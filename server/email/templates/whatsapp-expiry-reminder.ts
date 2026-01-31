import type { EmailTemplate } from './base';

export interface WhatsAppExpiryReminderData {
  firstName: string;
  daysRemaining: number;
  expiryDate: Date;
  renewalLink: string;
}

export function createWhatsAppExpiryReminderEmail(data: WhatsAppExpiryReminderData): EmailTemplate {
  const { firstName, daysRemaining, expiryDate, renewalLink } = data;
  
  const formattedExpiryDate = expiryDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const urgencyColor = daysRemaining <= 3 ? '#dc2626' : '#f59e0b';
  const urgencyText = daysRemaining <= 3 ? 'expiring soon' : 'expiring in a week';
  
  const subject = daysRemaining <= 3 
    ? `⏰ ${firstName}, your WhatsApp support expires in ${daysRemaining} days!`
    : `Hey ${firstName}, your WhatsApp support is ${urgencyText}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fdf2f8;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fdf2f8;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                Stronger With Zoe 💪
              </h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">
                WhatsApp Community Support
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #1f2937; font-size: 18px; line-height: 1.6; margin: 0 0 20px;">
                Hi ${firstName}! 👋
              </p>
              
              <!-- Expiry Alert Box -->
              <div style="background: linear-gradient(135deg, ${urgencyColor}10 0%, ${urgencyColor}05 100%); border: 2px solid ${urgencyColor}30; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
                <p style="color: ${urgencyColor}; font-size: 14px; font-weight: 600; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">
                  ⏰ Support Expiry Notice
                </p>
                <p style="color: #1f2937; font-size: 24px; font-weight: 700; margin: 0 0 8px;">
                  ${daysRemaining} Days Remaining
                </p>
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  Expires on ${formattedExpiryDate}
                </p>
              </div>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                Your WhatsApp Community Support access is expiring ${daysRemaining <= 3 ? 'very soon' : 'in a week'}. Don't miss out on:
              </p>
              
              <ul style="color: #4b5563; font-size: 15px; line-height: 1.8; padding-left: 20px; margin: 0 0 25px;">
                <li>Daily motivation and accountability</li>
                <li>Direct access to Coach Zoe for questions</li>
                <li>Community support from other moms</li>
                <li>Workout modifications and tips</li>
                <li>Quick answers when you need them</li>
              </ul>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
                Renew now to keep your spot in our supportive community!
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 10px 0;">
                    <a href="${renewalLink}" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 30px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(236, 72, 153, 0.4);">
                      Renew Now - ₹1,000 for 3 Months
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #9ca3af; font-size: 13px; text-align: center; margin: 20px 0 0;">
                Having trouble? Just reply to this email and I'll help you out!
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #fdf2f8; padding: 30px; text-align: center; border-radius: 0 0 16px 16px;">
              <p style="color: #ec4899; font-size: 14px; font-weight: 600; margin: 0 0 10px;">
                With love, Coach Zoe 💕
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
`;

  const text = `Hi ${firstName}!

Your WhatsApp Community Support is expiring in ${daysRemaining} days (${formattedExpiryDate}).

Don't miss out on:
- Daily motivation and accountability
- Direct access to Coach Zoe for questions
- Community support from other moms
- Workout modifications and tips
- Quick answers when you need them

Renew now to keep your spot in our supportive community!

Renew Now: ${renewalLink}
Price: ₹1,000 for 3 Months

Having trouble? Just reply to this email and I'll help you out!

With love,
Coach Zoe 💕

© ${new Date().getFullYear()} Stronger With Zoe. All rights reserved.`;

  return { subject, html, text };
}
