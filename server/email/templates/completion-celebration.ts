import type { EmailTemplate, CompletionCelebrationEmailData } from './base';

export function createCompletionCelebrationEmail(data: CompletionCelebrationEmailData): EmailTemplate {
  const { firstName, programName, weeksCompleted } = data;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You Did It! Program Complete</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #fdf2f8;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fdf2f8;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                You Did It! 🎉
              </h1>
              <p style="color: #fce7f3; font-size: 18px; margin: 12px 0 0; font-weight: 500;">
                ${weeksCompleted}-Week Program Complete
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #1f2937; font-size: 18px; line-height: 1.6; margin: 0 0 20px;">
                Hi ${firstName},
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                <strong>Congratulations, mama!</strong> 🌟 You've just completed all ${weeksCompleted} weeks of <strong>${programName}</strong>. Take a moment to celebrate this incredible achievement—you showed up, you pushed through, and you did the work!
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                This journey wasn't just about fitness—it was about reclaiming your strength, building consistency, and proving to yourself what you're capable of. You should be so proud!
              </p>
              
              <!-- Achievement Box -->
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fce7f3 100%); padding: 24px; border-radius: 12px; margin: 0 0 30px; text-align: center;">
                <p style="color: #78350f; font-size: 20px; font-weight: 700; margin: 0 0 8px;">
                  ✨ Program Complete ✨
                </p>
                <p style="color: #92400e; font-size: 16px; margin: 0;">
                  ${weeksCompleted} weeks of strength, consistency & growth
                </p>
              </div>
              
              <p style="color: #1f2937; font-size: 18px; line-height: 1.6; margin: 0 0 16px; font-weight: 600;">
                What's Next?
              </p>
              
              <ul style="color: #4b5563; font-size: 16px; line-height: 1.8; margin: 0 0 30px; padding-left: 24px;">
                <li><strong>Keep the momentum going</strong> - Repeat your favorite workouts or explore new challenges</li>
                <li><strong>Share your story</strong> - Post your transformation in the Community Feed to inspire other moms</li>
                <li><strong>Track your progress</strong> - Update your before/after photos in the Progress Tracker</li>
                <li><strong>Stay connected</strong> - Continue engaging with our supportive WhatsApp community</li>
              </ul>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 30px;">
                <tr>
                  <td align="center">
                    <a href="${process.env.APP_URL || 'https://strongerwithzoe.com'}/dashboard" 
                       style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(236, 72, 153, 0.3);">
                      View Your Dashboard
                    </a>
                  </td>
                </tr>
              </table>
              
              <div style="background-color: #fdf2f8; border-left: 4px solid #ec4899; padding: 20px; border-radius: 8px; margin: 0 0 20px;">
                <p style="color: #831843; font-size: 14px; line-height: 1.6; margin: 0; font-weight: 600;">
                  💕 We'd Love to Hear From You
                </p>
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 8px 0 0;">
                  Share your wins, transformations, and progress photos in our Community Feed. Your journey could inspire another mom to start hers!
                </p>
              </div>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0;">
                You've proven what you're capable of. Keep going, mama—the best is yet to come! 💪
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 20px 0 0;">
                With pride and admiration,<br>
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

Congratulations, mama! 🎉 You've just completed all ${weeksCompleted} weeks of ${programName}. Take a moment to celebrate this incredible achievement—you showed up, you pushed through, and you did the work!

This journey wasn't just about fitness—it was about reclaiming your strength, building consistency, and proving to yourself what you're capable of. You should be so proud!

WHAT'S NEXT?
• Keep the momentum going - Repeat your favorite workouts or explore new challenges
• Share your story - Post your transformation in the Community Feed to inspire other moms
• Track your progress - Update your before/after photos in the Progress Tracker
• Stay connected - Continue engaging with our supportive WhatsApp community

View Your Dashboard: ${process.env.APP_URL || 'https://strongerwithzoe.com'}/dashboard

We'd love to hear from you! Share your wins, transformations, and progress photos in our Community Feed. Your journey could inspire another mom to start hers!

You've proven what you're capable of. Keep going, mama—the best is yet to come! 💪

With pride and admiration,
Zoe & The Team

© ${new Date().getFullYear()} Stronger With Zoe. All rights reserved.
  `.trim();

  return {
    subject: `You Did It! 🎉 Your ${weeksCompleted}-Week Transformation Complete`,
    html,
    text,
  };
}
