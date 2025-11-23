export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface WelcomeEmailData {
  firstName: string;
  programName: string;
}

export interface ReEngagementEmailData {
  firstName: string;
  lastLoginDays: number;
  programProgress?: number;
}

export interface ProgramReminderEmailData {
  firstName: string;
  programName: string;
  weekNumber: number;
  workoutsCompleted: number;
  totalWorkouts: number;
}

export interface CompletionCelebrationEmailData {
  firstName: string;
  programName: string;
  completionDate: Date;
  weeksCompleted: number;
}
