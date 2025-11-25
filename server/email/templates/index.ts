export { createWelcomeEmail } from './welcome';
export { createReEngagementEmail } from './re-engagement';
export { createProgramReminderEmail } from './program-reminder';
export { createCompletionCelebrationEmail } from './completion-celebration';
export { createCompleteSignupEmail } from './complete-signup';
export { createPasswordResetEmail } from './password-reset';

export type {
  EmailTemplate,
  WelcomeEmailData,
  ReEngagementEmailData,
  ProgramReminderEmailData,
  CompletionCelebrationEmailData,
  CompleteSignupEmailData,
} from './base';
export type { PasswordResetEmailData } from './password-reset';
