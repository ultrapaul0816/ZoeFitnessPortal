import type { EmailTemplate, ReEngagementEmailData } from './base';

export function createReEngagementEmail(data: ReEngagementEmailData): EmailTemplate {
  const { firstName, programProgress } = data;

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
            <td style="background: linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #a855f7 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
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
                It's been a little while since we last saw you, and we just wanted to say—we're here whenever you're ready! Life with a little one is beautifully chaotic, and we completely understand.
              </p>
              
              <div style="background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%); border-left: 4px solid #ec4899; padding: 20px; border-radius: 8px; margin: 0 0 20px;">
                <p style="color: #9d174d; font-size: 14px; line-height: 1.6; margin: 0; font-weight: 600;">
                  💡 Quick Restart Idea
                </p>
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 8px 0 0;">
                  Just 10 minutes today is all it takes. Pick any workout and press play—no pressure to be perfect, just show up for yourself. Your body will thank you!
                </p>
              </div>
              
              ${programProgress !== undefined && programProgress > 0 ? `
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 0 0 20px;">
                <p style="color: #78350f; font-size: 14px; line-height: 1.6; margin: 0; font-weight: 600;">
                  📊 Your Progress
                </p>
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 8px 0 0;">
                  You're ${programProgress}% through your program. You've already done the hard part—getting started. Let's pick up where you left off!
                </p>
              </div>
              ` : ''}
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                Remember, every mama's journey is different. There's no "falling behind"—only moving forward at your own pace. You've got this! 💪
              </p>
              
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 30px;">
                <tr>
                  <td align="center">
                    <a href="${process.env.APP_URL || 'https://strongerwithzoe.com'}/dashboard" 
                       style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #a855f7 100%); color: #ffffff; text-decoration: none; padding: 18px 40px; border-radius: 30px; font-size: 18px; font-weight: 700; box-shadow: 0 4px 15px rgba(236, 72, 153, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
                      Start My Next Workout →
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

It's been a little while since we last saw you, and we just wanted to say—we're here whenever you're ready! Life with a little one is beautifully chaotic, and we completely understand.

💡 Quick Restart Idea: Just 10 minutes today is all it takes. Pick any workout and press play—no pressure to be perfect, just show up for yourself. Your body will thank you!

${programProgress !== undefined && programProgress > 0 ? `Your Progress: You're ${programProgress}% through your program. You've already done the hard part—getting started. Let's pick up where you left off!\n\n` : ''}Remember, every mama's journey is different. There's no "falling behind"—only moving forward at your own pace. You've got this!

Start your next workout: ${process.env.APP_URL || 'https://strongerwithzoe.com'}/dashboard

Rooting for you always,
Zoe & The Team

© ${new Date().getFullYear()} Stronger With Zoe. All rights reserved.
  `.trim();

  return {
    subject: `We miss you, ${firstName}! Ready to jump back in? 💕`,
    html,
    text,
  };
}
