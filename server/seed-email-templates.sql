-- Seed email templates with dynamic variables

-- 1. Welcome Email Template
INSERT INTO email_templates (type, name, description, subject, html_content, variables)
VALUES (
  'welcome',
  'Welcome to Your Journey',
  'Send to new members when they join or purchase a program',
  'Welcome to {{programName}}! Let''s get started 💪',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to {{programName}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; background-color: #fdf2f8;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fdf2f8;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                Welcome to Your Journey! 💪
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #1f2937; font-size: 18px; line-height: 1.6; margin: 0 0 20px;">
                Hi {{firstName}},
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                You''re doing amazing, mama! 🌸 Welcome to <strong>{{programName}}</strong>. We''re so excited to support you on your postpartum strength recovery journey.
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                Your program is now ready and waiting for you. Remember, this is <em>your</em> journey—go at your own pace, celebrate every win (no matter how small), and know that we''re here cheering you on every step of the way.
              </p>
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 30px;">
                <tr>
                  <td align="center">
                    <a href="{{dashboardUrl}}" 
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
          <tr>
            <td style="background-color: #fdf2f8; padding: 30px; text-align: center; border-radius: 0 0 16px 16px;">
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 10px;">
                Questions? We''re here to help!
              </p>
              <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 0;">
                {{trackingPixel}}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
  ARRAY['firstName', 'userName', 'programName', 'dashboardUrl', 'trackingPixel']
)
ON CONFLICT (type) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  variables = EXCLUDED.variables,
  updated_at = now();

-- 2. Re-engagement Email Template
INSERT INTO email_templates (type, name, description, subject, html_content, variables)
VALUES (
  're-engagement',
  'We Miss You',
  'Send to members who haven''t logged in for 30+ days',
  'We miss you, {{firstName}}! 💕',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>We Miss You</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; background-color: #fdf2f8;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fdf2f8;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                We Miss You! 💕
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #1f2937; font-size: 18px; line-height: 1.6; margin: 0 0 20px;">
                Hi {{firstName}},
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                We noticed you haven''t been around lately, and we just wanted to reach out. Life gets busy—especially as a mama—and we totally get it. No judgment here. 🌸
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                Your <strong>{{programName}}</strong> is still waiting for you, ready whenever you are. Whether you need to restart or pick up where you left off, we''re here to support you every step of the way.
              </p>
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 30px;">
                <tr>
                  <td align="center">
                    <a href="{{dashboardUrl}}" 
                       style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(236, 72, 153, 0.3);">
                      Continue Your Journey
                    </a>
                  </td>
                </tr>
              </table>
              <div style="background-color: #fdf2f8; border-left: 4px solid #ec4899; padding: 20px; border-radius: 8px; margin: 0 0 20px;">
                <p style="color: #831843; font-size: 14px; line-height: 1.6; margin: 0; font-weight: 600;">
                  💡 Remember
                </p>
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 8px 0 0;">
                  Even 10 minutes counts. You don''t have to be perfect—you just have to start.
                </p>
              </div>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0;">
                We''re rooting for you,<br>
                <strong style="color: #ec4899;">Zoe & The Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #fdf2f8; padding: 30px; text-align: center; border-radius: 0 0 16px 16px;">
              <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 0;">
                {{trackingPixel}}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
  ARRAY['firstName', 'userName', 'programName', 'dashboardUrl', 'trackingPixel']
)
ON CONFLICT (type) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  variables = EXCLUDED.variables,
  updated_at = now();

-- 3. Midpoint Motivation Email Template
INSERT INTO email_templates (type, name, description, subject, html_content, variables)
VALUES (
  'program-reminder',
  'Midpoint Motivation',
  'Send to members at week 3 of their 6-week program',
  'You''re halfway there, {{firstName}}! 🌟',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Midpoint Motivation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; background-color: #fdf2f8;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fdf2f8;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                You''re Halfway There! 🌟
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #1f2937; font-size: 18px; line-height: 1.6; margin: 0 0 20px;">
                Hi {{firstName}},
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Can we just take a moment to celebrate? 🎉 You''re at <strong>Week {{weekNumber}}</strong> of <strong>{{programName}}</strong>, and you''re crushing it!
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                This is where the magic happens. You''ve built the habit, you''re getting stronger every day, and your body is thanking you. Keep going—you''re doing something incredible for yourself.
              </p>
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 30px;">
                <tr>
                  <td align="center">
                    <a href="{{dashboardUrl}}" 
                       style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(236, 72, 153, 0.3);">
                      Keep Going
                    </a>
                  </td>
                </tr>
              </table>
              <div style="background-color: #fdf2f8; border-left: 4px solid #ec4899; padding: 20px; border-radius: 8px; margin: 0 0 20px;">
                <p style="color: #831843; font-size: 14px; line-height: 1.6; margin: 0; font-weight: 600;">
                  💪 Week 3 Tip
                </p>
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 8px 0 0;">
                  Notice how exercises that felt hard in Week 1 are getting easier? That''s progress, mama!
                </p>
              </div>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0;">
                So proud of you,<br>
                <strong style="color: #ec4899;">Zoe & The Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #fdf2f8; padding: 30px; text-align: center; border-radius: 0 0 16px 16px;">
              <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 0;">
                {{trackingPixel}}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
  ARRAY['firstName', 'userName', 'programName', 'weekNumber', 'dashboardUrl', 'trackingPixel']
)
ON CONFLICT (type) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  variables = EXCLUDED.variables,
  updated_at = now();

-- 4. Completion Celebration Email Template
INSERT INTO email_templates (type, name, description, subject, html_content, variables)
VALUES (
  'completion-celebration',
  'Program Completion Celebration',
  'Send to members who complete the 6-week program',
  'You did it, {{firstName}}! 🎉',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Congratulations!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; background-color: #fdf2f8;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fdf2f8;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                You Did It! 🎉
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #1f2937; font-size: 18px; line-height: 1.6; margin: 0 0 20px;">
                Hi {{firstName}},
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Congratulations! 🌸 You just completed <strong>{{programName}}</strong>, and we couldn''t be prouder. You showed up for yourself, pushed through challenges, and proved that mamas can do hard things.
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                Take a moment to celebrate this incredible achievement. You''re stronger—physically and mentally—than when you started. And that''s something truly special. 💪✨
              </p>
              <div style="background-color: #fdf2f8; border-left: 4px solid #ec4899; padding: 20px; border-radius: 8px; margin: 0 0 20px;">
                <p style="color: #831843; font-size: 14px; line-height: 1.6; margin: 0; font-weight: 600;">
                  🌟 What''s Next?
                </p>
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 8px 0 0;">
                  Keep the momentum going! Explore our community, share your transformation, or repeat the program to level up even more.
                </p>
              </div>
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 30px;">
                <tr>
                  <td align="center">
                    <a href="{{dashboardUrl}}" 
                       style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(236, 72, 153, 0.3);">
                      View Your Dashboard
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0;">
                So incredibly proud of you,<br>
                <strong style="color: #ec4899;">Zoe & The Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #fdf2f8; padding: 30px; text-align: center; border-radius: 0 0 16px 16px;">
              <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 0;">
                {{trackingPixel}}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
  ARRAY['firstName', 'userName', 'programName', 'dashboardUrl', 'trackingPixel']
)
ON CONFLICT (type) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  variables = EXCLUDED.variables,
  updated_at = now();
