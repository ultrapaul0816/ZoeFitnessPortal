export { createWelcomeEmail } from './welcome';
export { createReEngagementEmail } from './re-engagement';
export { createProgramReminderEmail } from './program-reminder';
export { createCompletionCelebrationEmail } from './completion-celebration';
export { createCompleteSignupEmail } from './complete-signup';
export { createPasswordResetEmail } from './password-reset';
export { createWhatsAppExpiryReminderEmail } from './whatsapp-expiry-reminder';
export { createDailyWorkoutReminderEmail } from './daily-workout-reminder';

export type {
  EmailTemplate,
  WelcomeEmailData,
  ReEngagementEmailData,
  ProgramReminderEmailData,
  CompletionCelebrationEmailData,
  CompleteSignupEmailData,
  WhatsAppExpiryReminderData,
} from './base';
export type { PasswordResetEmailData } from './password-reset';
export type { DailyWorkoutReminderData } from './daily-workout-reminder';
