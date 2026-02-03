import type { EmailTemplate } from './base';

export interface DailyWorkoutReminderData {
  firstName: string;
  currentStreak?: number;
  todayWorkoutName?: string;
  motivationalMessage?: string;
}

export function createDailyWorkoutReminderEmail(data: DailyWorkoutReminderData): EmailTemplate {
  const { 
    firstName, 
    currentStreak = 0, 
    todayWorkoutName = "Today's Core Workout",
    motivationalMessage = "Every workout brings you closer to feeling strong and confident in your body."
  } = data;

  const streakMessage = currentStreak > 0 
    ? `You're on a ${currentStreak}-day streak! Keep the momentum going.`
    : "Start your streak today - one workout at a time.";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Workout is Waiting</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #fafafa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fafafa;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 560px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #f3f4f6;">
              <div style="font-size: 28px; margin-bottom: 8px;">💪</div>
              <h1 style="color: #1f2937; margin: 0; font-size: 22px; font-weight: 600;">
                Good morning, ${firstName}!
              </h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin: 0 0 24px;">
                ${motivationalMessage}
              </p>
              
              <!-- Today's Workout Card -->
              <div style="background-color: #fdf2f8; border-radius: 10px; padding: 20px; margin: 0 0 24px;">
                <p style="color: #be185d; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px;">
                  Today's Workout
                </p>
                <p style="color: #1f2937; font-size: 18px; font-weight: 600; margin: 0;">
                  ${todayWorkoutName}
                </p>
              </div>
              
              <!-- Streak Info -->
              ${currentStreak > 0 ? `
              <div style="background-color: #fef3c7; border-radius: 10px; padding: 16px; margin: 0 0 24px; text-align: center;">
                <span style="font-size: 24px;">🔥</span>
                <p style="color: #92400e; font-size: 14px; font-weight: 500; margin: 8px 0 0;">
                  ${streakMessage}
                </p>
              </div>
              ` : ''}
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 8px 0 24px;">
                    <a href="${process.env.REPLIT_DEV_DOMAIN || 'https://strongerwithzoe.com'}/dashboard" 
                       style="display: inline-block; background-color: #e11d48; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 15px; font-weight: 600;">
                      Start Today's Workout
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Closing -->
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0; text-align: center;">
                You've got this, mama. Show up for yourself today.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 32px; text-align: center; border-radius: 0 0 12px 12px;">
              <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0;">
                Stronger with Zoe<br>
                <a href="${process.env.REPLIT_DEV_DOMAIN || 'https://strongerwithzoe.com'}/settings" style="color: #9ca3af;">Manage notification preferences</a>
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

  const text = `
Good morning, ${firstName}!

${motivationalMessage}

TODAY'S WORKOUT: ${todayWorkoutName}

${streakMessage}

Start your workout now: ${process.env.REPLIT_DEV_DOMAIN || 'https://strongerwithzoe.com'}/dashboard

You've got this, mama. Show up for yourself today.

- Zoe & The Team
`;

  return {
    subject: `${firstName}, your workout is waiting 💪`,
    html,
    text,
  };
}
