import { storage } from '../storage';
import { emailService } from './service';
import { replaceTemplateVariables, generateUserVariables } from './template-variables';

/**
 * Trigger an automation rule by its trigger type.
 * Handles dedup, user lookup, template variable replacement, and sending.
 *
 * Fire-and-forget: call with .catch(console.error) from routes.
 */
export async function triggerAutomation(
  triggerType: string,
  userId: string,
  context?: Record<string, any>
): Promise<{ triggered: boolean; reason?: string }> {
  try {
    // 1. Look up the automation rule
    const rule = await storage.getEmailAutomationRuleByTriggerType(triggerType);
    if (!rule) {
      return { triggered: false, reason: `No automation rule found for trigger: ${triggerType}` };
    }
    if (!rule.enabled) {
      return { triggered: false, reason: `Automation rule '${rule.name}' is disabled` };
    }

    // 2. Get user data
    const user = await storage.getUser(userId);
    if (!user || !user.email) {
      return { triggered: false, reason: `User ${userId} not found or has no email` };
    }

    // 3. Dedup check: query communicationsLog for recent sends of this type to this user
    // Event-based triggers: 24h dedup window
    // Inactivity triggers: 7d dedup window
    const isInactivityTrigger = triggerType.includes('inactivity') || triggerType.includes('incomplete_signup');
    const dedupWindowMs = isInactivityTrigger ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const recentLogs = await storage.getCommunicationsLog({
      messageType: triggerType,
      channel: 'email',
      limit: 10,
    });

    const recentForUser = recentLogs.filter(
      log => log.userId === userId &&
      log.status === 'sent' &&
      log.createdAt &&
      (Date.now() - new Date(log.createdAt).getTime()) < dedupWindowMs
    );

    if (recentForUser.length > 0) {
      return { triggered: false, reason: `Already sent '${triggerType}' to user ${userId} within dedup window` };
    }

    // 4. Generate personalized email content
    const baseUrl = process.env.APP_URL || 'https://strongerwithzoe.com';
    const userVariables = generateUserVariables(user, {
      baseUrl,
      programName: context?.programName,
      weekNumber: context?.weekNumber,
    });
    const subject = replaceTemplateVariables(rule.subject, userVariables);
    const html = replaceTemplateVariables(rule.htmlContent, userVariables);

    // 5. Send email
    const result = await emailService.send(
      {
        to: { email: user.email, name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email },
        subject,
        html,
        text: html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(),
      },
      { messageType: triggerType, userId }
    );

    if (!result.success) {
      console.error(`[Automation] Failed to send '${triggerType}' to ${user.email}: ${result.error}`);
      return { triggered: false, reason: `Email send failed: ${result.error}` };
    }

    // 6. Update rule stats
    try {
      await storage.incrementAutomationRuleSent(rule.id);
    } catch (e) {
      console.error('[Automation] Failed to increment rule stats:', e);
    }

    console.log(`[Automation] Sent '${triggerType}' to ${user.email}`);
    return { triggered: true };
  } catch (error) {
    console.error(`[Automation] Error triggering '${triggerType}' for user ${userId}:`, error);
    return { triggered: false, reason: error instanceof Error ? error.message : 'Unknown error' };
  }
}
