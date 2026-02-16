import { Resend } from 'resend';
import type { IEmailProvider, SendEmailParams, EmailSendResult, EmailAddress } from './base';

let connectionSettings: any;

const DEFAULT_FROM_EMAIL = 'Your Postpartum Strength <noreply@yourpostpartumstrength.com>';

async function getCredentials() {
  // First, try direct RESEND_API_KEY env var (works everywhere)
  if (process.env.RESEND_API_KEY) {
    return {
      apiKey: process.env.RESEND_API_KEY,
      fromEmail: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL
    };
  }

  // Fallback: try Replit connectors
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken || !hostname) {
    throw new Error('No Resend API key found. Set RESEND_API_KEY env var or connect via Replit.');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || !connectionSettings.settings.api_key) {
    throw new Error('Resend not connected');
  }

  return {
    apiKey: connectionSettings.settings.api_key,
    fromEmail: connectionSettings.settings.from_email || DEFAULT_FROM_EMAIL
  };
}

async function getUncachableResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
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
      const { client, fromEmail } = await getUncachableResendClient();

      const toAddresses = Array.isArray(params.to) 
        ? params.to.map(addr => formatEmailAddress(addr))
        : [formatEmailAddress(params.to)];

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
        console.error('Resend error:', error);
        return {
          success: false,
          error: error.message || 'Failed to send email',
        };
      }

      return {
        success: true,
        messageId: data?.id,
      };
    } catch (error) {
      console.error('Email send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async validateConnection(): Promise<boolean> {
    try {
      await getCredentials();
      return true;
    } catch (error) {
      console.error('Resend validation error:', error);
      return false;
    }
  }
}
