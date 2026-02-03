import { ResendEmailProvider } from './providers/resend';
import type { IEmailProvider, SendEmailParams, EmailSendResult } from './providers/base';
import type { User } from '@shared/schema';
import {
  createWelcomeEmail,
  createReEngagementEmail,
  createProgramReminderEmail,
  createCompletionCelebrationEmail,
  createWhatsAppExpiryReminderEmail,
  createDailyWorkoutReminderEmail,
  type WelcomeEmailData,
  type ReEngagementEmailData,
  type ProgramReminderEmailData,
  type CompletionCelebrationEmailData,
  type WhatsAppExpiryReminderData,
  type DailyWorkoutReminderData,
} from './templates';

class EmailService {
  private provider: IEmailProvider;

  constructor() {
    this.provider = new ResendEmailProvider();
  }

  async send(params: SendEmailParams): Promise<EmailSendResult> {
    return this.provider.send(params);
  }

  async validateConnection(): Promise<boolean> {
    return this.provider.validateConnection();
  }

  async sendWelcomeEmail(user: User, programName: string): Promise<EmailSendResult> {
    const template = createWelcomeEmail({
      firstName: user.firstName,
      programName,
    });

    return this.send({
      to: { email: user.email, name: `${user.firstName} ${user.lastName}` },
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendReEngagementEmail(
    user: User,
    data: Omit<ReEngagementEmailData, 'firstName'>
  ): Promise<EmailSendResult> {
    const template = createReEngagementEmail({
      firstName: user.firstName,
      ...data,
    });

    return this.send({
      to: { email: user.email, name: `${user.firstName} ${user.lastName}` },
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendProgramReminderEmail(
    user: User,
    data: Omit<ProgramReminderEmailData, 'firstName'>
  ): Promise<EmailSendResult> {
    const template = createProgramReminderEmail({
      firstName: user.firstName,
      ...data,
    });

    return this.send({
      to: { email: user.email, name: `${user.firstName} ${user.lastName}` },
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendCompletionCelebrationEmail(
    user: User,
    data: Omit<CompletionCelebrationEmailData, 'firstName'>
  ): Promise<EmailSendResult> {
    const template = createCompletionCelebrationEmail({
      firstName: user.firstName,
      ...data,
    });

    return this.send({
      to: { email: user.email, name: `${user.firstName} ${user.lastName}` },
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendWhatsAppExpiryReminderEmail(
    user: User,
    data: Omit<WhatsAppExpiryReminderData, 'firstName'>
  ): Promise<EmailSendResult> {
    const template = createWhatsAppExpiryReminderEmail({
      firstName: user.firstName,
      ...data,
    });

    return this.send({
      to: { email: user.email, name: `${user.firstName} ${user.lastName}` },
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendTemplateTestEmail(templateType: 'welcome' | 're-engagement' | 'program-reminder' | 'completion-celebration', toEmail: string, customSubject?: string): Promise<EmailSendResult> {
    let template;
    
    switch (templateType) {
      case 'welcome':
        template = createWelcomeEmail({
          firstName: 'Zoe',
          programName: 'Your Postpartum Strength Recovery Program',
        });
        break;
      case 're-engagement':
        template = createReEngagementEmail({
          firstName: 'Zoe',
          lastLoginDays: 30,
          programProgress: 45,
        });
        break;
      case 'program-reminder':
        template = createProgramReminderEmail({
          firstName: 'Zoe',
          programName: 'Your Postpartum Strength Recovery Program',
          weekNumber: 3,
          workoutsCompleted: 8,
          totalWorkouts: 18,
        });
        break;
      case 'completion-celebration':
        template = createCompletionCelebrationEmail({
          firstName: 'Zoe',
          programName: 'Your Postpartum Strength Recovery Program',
          completionDate: new Date(),
          weeksCompleted: 6,
        });
        break;
    }

    return this.send({
      to: { email: toEmail, name: 'Test Recipient' },
      subject: customSubject || template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendDailyWorkoutReminderEmail(
    toEmail: string,
    data: DailyWorkoutReminderData
  ): Promise<EmailSendResult> {
    const template = createDailyWorkoutReminderEmail(data);

    return this.send({
      to: { email: toEmail, name: data.firstName },
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendTestEmail(toEmail: string): Promise<EmailSendResult> {
    return this.send({
      to: { email: toEmail, name: 'Test User' },
      subject: 'Test Email from Stronger With Zoe',
      html: `
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
                  <tr>
                    <td style="background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                        Email Service Test ✅
                      </h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        Success! Your email service is working correctly.
                      </p>
                      <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0;">
                        This is a test email sent at ${new Date().toLocaleString()}.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #fdf2f8; padding: 30px; text-align: center; border-radius: 0 0 16px 16px;">
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
      `,
      text: `Success! Your email service is working correctly.\n\nThis is a test email sent at ${new Date().toLocaleString()}.\n\n© ${new Date().getFullYear()} Stronger With Zoe. All rights reserved.`,
    });
  }
}

export const emailService = new EmailService();
export { EmailService };
