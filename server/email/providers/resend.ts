import { Resend } from 'resend';
import type { IEmailProvider, SendEmailParams, EmailSendResult, EmailAddress } from './base';

const DEFAULT_FROM_EMAIL = 'Stronger With Zoe <noreply@strongerwithzoe.in>';

function getCredentials() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set.');
  }

  return {
    apiKey,
    fromEmail: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL
  };
}

function getResendClient() {
  const { apiKey, fromEmail } = getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}

function formatEmailAddress(addr: EmailAddress): string {
  if (addr.name) {
    return `${addr.name} <${addr.email}>`;
  }
  return addr.email;
}

export class ResendEmailProvider implements IEmailProvider {
  async send(params: SendEmailParams): Promise<EmailSendResult> {
    try {
      const { client, fromEmail } = getResendClient();

      const toAddresses = Array.isArray(params.to)
        ? params.to.map(addr => formatEmailAddress(addr))
        : [formatEmailAddress(params.to)];

      console.log(`[Resend] Sending email from="${fromEmail}" to="${toAddresses.join(', ')}" subject="${params.subject}"`);

      const emailData: any = {
        from: fromEmail,
        to: toAddresses,
        subject: params.subject,
        html: params.html,
      };

      if (params.text) {
        emailData.text = params.text;
      }

      if (params.replyTo) {
        emailData.reply_to = formatEmailAddress(params.replyTo);
      }

      if (params.attachments && params.attachments.length > 0) {
        emailData.attachments = params.attachments.map(att => ({
          filename: att.filename,
          content: att.content,
          type: att.contentType,
        }));
      }

      const { data, error } = await client.emails.send(emailData);

      if (error) {
        console.error('[Resend] API error:', error);
        return {
          success: false,
          error: error.message || 'Failed to send email',
        };
      }

      console.log(`[Resend] Email sent successfully, messageId=${data?.id}`);
      return {
        success: true,
        messageId: data?.id,
      };
    } catch (error) {
      console.error('[Resend] Send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async validateConnection(): Promise<boolean> {
    try {
      getCredentials();
      return true;
    } catch (error) {
      console.error('[Resend] Validation error:', error);
      return false;
    }
  }
}
