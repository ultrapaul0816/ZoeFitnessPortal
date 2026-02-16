import { storage } from '../storage';
import { emailService } from '../email/service';
import { replaceTemplateVariables, generateUserVariables } from '../email/template-variables';

const isProduction = process.env.NODE_ENV === 'production';

export async function processScheduledCampaigns() {
  console.log('[Campaign Scheduler] Checking for due campaigns...');

  if (!isProduction) {
    console.log('[Campaign Scheduler] Skipping in development environment');
    return;
  }

  try {
    const now = new Date();
    const allCampaigns = await storage.getEmailCampaigns();
    const dueCampaigns = allCampaigns.filter(
      c => c.status === 'scheduled' && c.scheduledFor && new Date(c.scheduledFor) <= now
    );

    if (dueCampaigns.length === 0) {
      return;
    }

    console.log(`[Campaign Scheduler] Found ${dueCampaigns.length} due campaign(s)`);

    for (const campaign of dueCampaigns) {
      console.log(`[Campaign Scheduler] Processing campaign ${campaign.id}: ${campaign.name}`);

      // Update status to 'sending'
      await storage.updateEmailCampaign(campaign.id!, { status: 'sending' as any });

      try {
        const recipients = await storage.getCampaignRecipients(campaign.id!);
        const pendingRecipients = recipients.filter(r => r.status === 'pending');
        const baseUrl = process.env.APP_URL || 'https://strongerwithzoe.com';

        let sentCount = 0;
        let failedCount = 0;

        for (const recipient of pendingRecipients) {
          try {
            const user = await storage.getUser(recipient.userId);
            if (!user || !user.email) {
              failedCount++;
              await storage.updateRecipientStatus(recipient.id!, 'failed', undefined, 'User not found or no email');
              continue;
            }

            const userVariables = generateUserVariables(user, {
              campaignId: campaign.id!,
              recipientId: recipient.id!,
              baseUrl,
            });

            const subject = replaceTemplateVariables(campaign.subject, userVariables);
            const html = replaceTemplateVariables(campaign.htmlContent, userVariables);

            // Retry logic: up to 3 attempts with exponential backoff
            let result: { success: boolean; error?: string; messageId?: string } = { success: false };
            for (let attempt = 1; attempt <= 3; attempt++) {
              result = await emailService.send(
                {
                  to: { email: user.email, name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email },
                  subject,
                  html,
                  text: html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(),
                },
                { messageType: 'campaign', userId: user.id }
              );

              if (result.success) break;
              if (attempt < 3) {
                // Exponential backoff: 2s, 4s
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
              }
            }

            if (result.success) {
              sentCount++;
              await storage.updateRecipientStatus(recipient.id!, 'sent', new Date(), undefined, result.messageId);
            } else {
              failedCount++;
              await storage.updateRecipientStatus(recipient.id!, 'failed', undefined, result.error || 'Send failed after 3 attempts');
            }
          } catch (error) {
            failedCount++;
            await storage.updateRecipientStatus(
              recipient.id!, 'failed', undefined,
              error instanceof Error ? error.message : 'Unknown error'
            );
          }
        }

        // Update campaign final status
        await storage.updateEmailCampaign(campaign.id!, {
          status: (failedCount === pendingRecipients.length && pendingRecipients.length > 0 ? 'failed' : 'sent') as any,
          sentAt: new Date(),
          sentCount,
          failedCount,
        } as any);

        console.log(`[Campaign Scheduler] Campaign ${campaign.id} done: ${sentCount} sent, ${failedCount} failed`);
      } catch (error) {
        console.error(`[Campaign Scheduler] Fatal error for campaign ${campaign.id}:`, error);
        await storage.updateEmailCampaign(campaign.id!, { status: 'failed' as any });
      }
    }
  } catch (error) {
    console.error('[Campaign Scheduler] Error:', error);
  }
}

export function startCampaignScheduler() {
  console.log('[Campaign Scheduler] Initialized (checks every 5 minutes)');

  // Check on startup with delay
  setTimeout(() => {
    processScheduledCampaigns().catch(console.error);
  }, 60000); // 1 minute delay

  // Then check every 5 minutes
  const FIVE_MINUTES = 5 * 60 * 1000;
  setInterval(() => {
    processScheduledCampaigns().catch(console.error);
  }, FIVE_MINUTES);
}
