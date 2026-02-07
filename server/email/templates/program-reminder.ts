import type { EmailTemplate, ProgramReminderEmailData } from './base';

export function createProgramReminderEmail(data: ProgramReminderEmailData): EmailTemplate {
  const { firstName, programName, weekNumber, workoutsCompleted, totalWorkouts } = data;
  const progressPercent = totalWorkouts > 0 ? Math.round((workoutsCompleted / totalWorkouts) * 100) : 0;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Week ${weekNumber} Check-in</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #fdf2f8;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fdf2f8;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                Week ${weekNumber} - You're Crushing It! 🎉
              </h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #1f2937; font-size: 18px; line-height: 1.6; margin: 0 0 20px;">
                Hi ${firstName},
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                You're now in Week ${weekNumber} of <strong>${programName}</strong>, and we wanted to celebrate your progress! Every workout, every stretch, every moment you show up for yourself—it all counts.
              </p>
              
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%); border-radius: 12px; padding: 24px; margin: 0 0 20px;">
                <p style="color: #78350f; font-size: 14px; line-height: 1.6; margin: 0 0 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                  📈 Your Week ${weekNumber} Progress
                </p>
                <div style="background-color: #ffffff; border-radius: 8px; padding: 16px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="color: #1f2937; font-size: 16px; font-weight: 600;">
                      ${workoutsCompleted} / ${totalWorkouts} workouts completed
                    </span>
                    <span style="color: #ec4899; font-size: 18px; font-weight: 700;">
                      ${progressPercent}%
                    </span>
                  </div>
                  <div style="background-color: #f3f4f6; height: 8px; border-radius: 4px; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, #ec4899 0%, #a855f7 100%); height: 100%; width: ${progressPercent}%; transition: width 0.3s ease;"></div>
                  </div>
                </div>
              </div>
              
              ${workoutsCompleted < totalWorkouts ? `
              <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 0 0 20px;">
                <p style="color: #1e3a8a; font-size: 14px; line-height: 1.6; margin: 0; font-weight: 600;">
                  💡 This Week's Focus
                </p>
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 8px 0 0;">
                  You have ${totalWorkouts - workoutsCompleted} workout${totalWorkouts - workoutsCompleted === 1 ? '' : 's'} left this week. Remember, progress isn't about perfection—it's about consistency!
                </p>
              </div>
              ` : `
              <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 20px; border-radius: 8px; margin: 0 0 20px;">
                <p style="color: #065f46; font-size: 14px; line-height: 1.6; margin: 0; font-weight: 600;">
                  🎊 Amazing Work!
                </p>
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 8px 0 0;">
                  You've completed all your workouts for Week ${weekNumber}! Take a moment to celebrate this win—you're doing incredible!
                </p>
              </div>
              `}
              
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 30px;">
                <tr>
                  <td align="center">
                    <a href="${process.env.APP_URL || 'https://strongerwithzoe.com'}/heal-your-core" 
                       style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(236, 72, 153, 0.3);">
                      Continue Week ${weekNumber}
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0;">
                Keep showing up, mama. You're doing better than you think! 💪<br>
                <strong style="color: #ec4899;">Zoe & The Team</strong>
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="background-color: #fdf2f8; padding: 30px; text-align: center; border-radius: 0 0 16px 16px;">
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 10px;">
                Need motivation? Join our community!
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

You're now in Week ${weekNumber} of ${programName}, and we wanted to celebrate your progress! Every workout, every stretch, every moment you show up for yourself—it all counts.

Your Week ${weekNumber} Progress:
${workoutsCompleted} / ${totalWorkouts} workouts completed (${progressPercent}%)

${workoutsCompleted < totalWorkouts 
  ? `This Week's Focus: You have ${totalWorkouts - workoutsCompleted} workout${totalWorkouts - workoutsCompleted === 1 ? '' : 's'} left this week. Remember, progress isn't about perfection—it's about consistency!`
  : `Amazing Work! You've completed all your workouts for Week ${weekNumber}! Take a moment to celebrate this win—you're doing incredible!`
}

Continue Week ${weekNumber}: ${process.env.APP_URL || 'https://strongerwithzoe.com'}/heal-your-core

Keep showing up, mama. You're doing better than you think!

Zoe & The Team

© ${new Date().getFullYear()} Stronger With Zoe. All rights reserved.
  `.trim();

  return {
    subject: `Week ${weekNumber} Check-in: You're ${progressPercent}% there! 🎉`,
    html,
    text,
  };
}
