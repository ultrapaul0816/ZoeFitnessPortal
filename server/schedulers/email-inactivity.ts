import { storage } from '../storage';
import { triggerAutomation } from '../email/automation-trigger';

const isProduction = process.env.NODE_ENV === 'production';

export async function checkInactiveUsers() {
  console.log('[Inactivity Check] Starting daily check...');

  if (!isProduction) {
    console.log('[Inactivity Check] Skipping in development environment');
    return;
  }

  try {
    const now = new Date();
    const allUsers = await storage.getAllUsers();
    let triggered7d = 0, triggered14d = 0, triggered30d = 0, triggeredIncomplete = 0;

    for (const user of allUsers) {
      // Inactivity checks based on lastLoginAt
      if (user.lastLoginAt) {
        const daysSinceLogin = Math.floor(
          (now.getTime() - new Date(user.lastLoginAt).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceLogin >= 7 && daysSinceLogin < 8) {
          const result = await triggerAutomation('user_inactivity_7d', user.id).catch(() => ({ triggered: false }));
          if (result.triggered) triggered7d++;
        } else if (daysSinceLogin >= 14 && daysSinceLogin < 15) {
          const result = await triggerAutomation('user_inactivity_14d', user.id).catch(() => ({ triggered: false }));
          if (result.triggered) triggered14d++;
        } else if (daysSinceLogin >= 30 && daysSinceLogin < 31) {
          const result = await triggerAutomation('user_inactivity_30d', user.id).catch(() => ({ triggered: false }));
          if (result.triggered) triggered30d++;
        }
      }

      // Incomplete signup check: users who registered 3 days ago but haven't completed terms/disclaimer
      if (user.createdAt) {
        const daysSinceCreation = Math.floor(
          (now.getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceCreation >= 3 && daysSinceCreation < 4 && (!user.termsAccepted || !user.disclaimerAccepted)) {
          const result = await triggerAutomation('incomplete_signup_3d', user.id).catch(() => ({ triggered: false }));
          if (result.triggered) triggeredIncomplete++;
        }
      }
    }

    console.log(`[Inactivity Check] Done. 7d: ${triggered7d}, 14d: ${triggered14d}, 30d: ${triggered30d}, incomplete: ${triggeredIncomplete}`);
  } catch (error) {
    console.error('[Inactivity Check] Error:', error);
  }
}

export function startInactivityScheduler() {
  console.log('[Inactivity Check] Scheduler initialized (runs every 24 hours)');

  // Run once on startup (with delay to let server settle)
  setTimeout(() => {
    checkInactiveUsers().catch(console.error);
  }, 30000); // 30 second delay

  // Then run every 24 hours
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  setInterval(() => {
    checkInactiveUsers().catch(console.error);
  }, TWENTY_FOUR_HOURS);
}
