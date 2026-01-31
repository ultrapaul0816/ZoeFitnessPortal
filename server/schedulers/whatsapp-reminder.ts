import { storage } from '../storage';
import { emailService } from '../email/service';

const RENEWAL_LINK = 'https://rzp.io/rzp/sFzniAWK';

export async function checkAndSendWhatsAppExpiryReminders() {
  console.log('[WhatsApp Reminder] Starting daily check...');
  
  const now = new Date();

  try {
    const allUsers = await storage.getAllUsers();
    const usersWithWhatsApp = allUsers.filter(u => 
      u.hasWhatsAppSupport && 
      u.whatsAppSupportExpiryDate && 
      new Date(u.whatsAppSupportExpiryDate) > now
    );

    console.log(`[WhatsApp Reminder] Found ${usersWithWhatsApp.length} users with active WhatsApp support`);

    let sevenDayRemindersSent = 0;
    let threeDayRemindersSent = 0;

    for (const user of usersWithWhatsApp) {
      if (!user.whatsAppSupportExpiryDate) continue;

      const expiryDate = new Date(user.whatsAppSupportExpiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const remindersSent = user.whatsAppRemindersSent || [];

      if (daysUntilExpiry === 7 && !remindersSent.includes('7-day')) {
        try {
          await emailService.sendWhatsAppExpiryReminderEmail(user, {
            daysRemaining: 7,
            expiryDate: expiryDate,
            renewalLink: RENEWAL_LINK,
          });

          await storage.updateUser(user.id, {
            whatsAppRemindersSent: [...remindersSent, '7-day'],
          });

          console.log(`[WhatsApp Reminder] Sent 7-day reminder to ${user.email}`);
          sevenDayRemindersSent++;
        } catch (error) {
          console.error(`[WhatsApp Reminder] Failed to send 7-day reminder to ${user.email}:`, error);
        }
      }

      if (daysUntilExpiry === 3 && !remindersSent.includes('3-day')) {
        try {
          await emailService.sendWhatsAppExpiryReminderEmail(user, {
            daysRemaining: 3,
            expiryDate: expiryDate,
            renewalLink: RENEWAL_LINK,
          });

          await storage.updateUser(user.id, {
            whatsAppRemindersSent: [...remindersSent, '3-day'],
          });

          console.log(`[WhatsApp Reminder] Sent 3-day reminder to ${user.email}`);
          threeDayRemindersSent++;
        } catch (error) {
          console.error(`[WhatsApp Reminder] Failed to send 3-day reminder to ${user.email}:`, error);
        }
      }
    }

    console.log(`[WhatsApp Reminder] Complete. Sent ${sevenDayRemindersSent} 7-day reminders and ${threeDayRemindersSent} 3-day reminders.`);
    
    return {
      sevenDayRemindersSent,
      threeDayRemindersSent,
      totalUsersChecked: usersWithWhatsApp.length,
    };
  } catch (error) {
    console.error('[WhatsApp Reminder] Error during check:', error);
    throw error;
  }
}

export function startWhatsAppReminderScheduler() {
  console.log('[WhatsApp Reminder] Scheduler initialized');
  
  checkAndSendWhatsAppExpiryReminders().catch(console.error);
  
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  setInterval(() => {
    checkAndSendWhatsAppExpiryReminders().catch(console.error);
  }, TWENTY_FOUR_HOURS);
  
  console.log('[WhatsApp Reminder] Daily check scheduled (runs every 24 hours)');
}
