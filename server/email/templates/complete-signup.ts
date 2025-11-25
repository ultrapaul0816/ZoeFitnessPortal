import type { EmailTemplate, CompleteSignupEmailData } from './base';

export function createCompleteSignupEmail(data: CompleteSignupEmailData): EmailTemplate {
  const { firstName, email, daysSinceSignup } = data;
  const appUrl = 'https://app.strongerwithzoe.com';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complete Your Signup - Stronger With Zoe</title>
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
                You're Almost There! 🌟
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
                We noticed you started signing up for <strong>Your Postpartum Strength Recovery Program</strong> but haven't completed the process yet. Your account is waiting for you!
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                Just a few quick steps and you'll have full access to your personalized 6-week program designed to help you rebuild your strength safely postpartum.
              </p>
              
              <!-- Account Info Box -->
              <div style="background-color: #f3e8ff; border-radius: 12px; padding: 20px; margin: 0 0 30px;">
                <p style="color: #7c3aed; font-size: 14px; font-weight: 600; margin: 0 0 10px;">
                  📧 Your Account Email
                </p>
                <p style="color: #1f2937; font-size: 16px; margin: 0; word-break: break-all;">
                  ${email}
                </p>
              </div>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 30px;">
                <tr>
                  <td align="center">
                    <a href="${appUrl}" 
                       style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(236, 72, 153, 0.3);">
                      Complete My Signup
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Steps Box -->
              <div style="background-color: #fdf2f8; border-left: 4px solid #ec4899; padding: 20px; border-radius: 8px; margin: 0 0 30px;">
                <p style="color: #831843; font-size: 14px; line-height: 1.6; margin: 0 0 15px; font-weight: 600;">
                  ✨ How to Complete Your Signup:
                </p>
                <ol style="color: #4b5563; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;"><strong>Visit</strong> <a href="${appUrl}" style="color: #ec4899; text-decoration: none;">${appUrl}</a></li>
                  <li style="margin-bottom: 8px;"><strong>Log in</strong> with your email and password</li>
                  <li style="margin-bottom: 8px;"><strong>Accept</strong> the Terms & Conditions</li>
                  <li><strong>Accept</strong> the Health Disclaimer</li>
                </ol>
              </div>
              
              <div style="background-color: #ecfdf5; border-radius: 12px; padding: 20px; margin: 0 0 20px;">
                <p style="color: #059669; font-size: 14px; line-height: 1.6; margin: 0;">
                  💪 <strong>What's waiting for you:</strong> A complete 6-week program with guided exercises, video demonstrations, progress tracking, and community support—all designed for postpartum mamas like you!
                </p>
              </div>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0;">
                We can't wait to support you on this journey!<br><br>
                With strength and care,<br>
                <strong style="color: #ec4899;">Zoe & The Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #fdf2f8; padding: 30px; text-align: center; border-radius: 0 0 16px 16px;">
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 10px;">
                Need help? Just reply to this email.
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

We noticed you started signing up for Your Postpartum Strength Recovery Program but haven't completed the process yet. Your account is waiting for you!

Just a few quick steps and you'll have full access to your personalized 6-week program designed to help you rebuild your strength safely postpartum.

Your Account Email: ${email}

How to Complete Your Signup:
1. Visit ${appUrl}
2. Log in with your email and password
3. Accept the Terms & Conditions
4. Accept the Health Disclaimer

What's waiting for you: A complete 6-week program with guided exercises, video demonstrations, progress tracking, and community support—all designed for postpartum mamas like you!

We can't wait to support you on this journey!

With strength and care,
Zoe & The Team

© ${new Date().getFullYear()} Stronger With Zoe. All rights reserved.
  `.trim();

  return {
    subject: `${firstName}, complete your signup to start your recovery journey! 💪`,
    html,
    text,
  };
}
