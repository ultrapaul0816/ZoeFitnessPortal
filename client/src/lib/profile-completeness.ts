export interface ProfileData {
  country: string;
  bio: string;
  socials: string;
  dueDate: string;
  postpartumTime: string;
  timezone: string;
  fullName: string;
  email: string;
  timeFormat: string;
  photo: string;
  // Fitness & Health Information
  fitnessLevel: string;
  deliveryType: string;
  numberOfChildren: string;
  breastfeedingStatus: string;
  medicalClearance: boolean;
  availableEquipment: string[];
  fitnessGoals: string;
  workoutDaysPerWeek: string;
  preferredWorkoutTime: string;
  physicalLimitations: string;
  newsUpdates: boolean;
  promotions: boolean;
  communityUpdates: boolean;
  transactionalEmails: boolean;
}

export interface ProfileCompleteness {
  isComplete: boolean;
  completionPercentage: number;
  requiredFields: {
    field: keyof ProfileData;
    label: string;
    completed: boolean;
  }[];
  optionalFields: {
    field: keyof ProfileData;
    label: string;
    completed: boolean;
  }[];
  missingRequiredCount: number;
  totalRequiredCount: number;
}

export interface PromptContext {
  location: string; // 'dashboard', 'workouts', 'community'
  isFirstLogin: boolean;
  hasCompletedWorkout: boolean;
  sessionStartTime: number;
}

// Define required and optional fields for profile completion
const REQUIRED_FIELDS = [
  { field: 'timezone' as keyof ProfileData, label: 'Timezone' },
  { field: 'country' as keyof ProfileData, label: 'Country' },
] as const;

// Either due date OR postpartum time is required (not both)
const REQUIRED_ALTERNATIVE_FIELDS = [
  { field: 'dueDate' as keyof ProfileData, label: 'Due Date' },
  { field: 'postpartumTime' as keyof ProfileData, label: 'Postpartum Time' },
] as const;

const OPTIONAL_FIELDS = [
  { field: 'bio' as keyof ProfileData, label: 'Bio' },
  { field: 'socials' as keyof ProfileData, label: 'Social Links' },
] as const;

// Storage keys for prompt management
export const STORAGE_KEYS = {
  PROFILE_PROMPT_SNOOZE: 'profilePromptSnoozeUntil',
  PROFILE_PROMPT_LAST_SHOWN: 'profilePromptLastShownAt',
  PROFILE_COMPLETION_DISMISSED: 'profileCompletionDismissed',
} as const;

const SNOOZE_DURATION_DAYS = 7;
const MIN_PROMPT_INTERVAL_MINUTES = 10;

/**
 * Helper function to check if a field value is completed
 */
function isFieldCompleted(value: string | boolean | string[]): boolean {
  if (typeof value === 'boolean') {
    return true; // Boolean fields are considered always completed (they have default values)
  }
  if (Array.isArray(value)) {
    return value.length > 0; // Array fields are completed if they have at least one item
  }
  return Boolean(value?.trim());
}

/**
 * Evaluates the completeness of a user's profile
 */
export function evaluateCompleteness(profileData: ProfileData): ProfileCompleteness {
  const requiredFieldsStatus = REQUIRED_FIELDS.map(({ field, label }) => ({
    field,
    label,
    completed: isFieldCompleted(profileData[field]),
  }));

  // Check if at least one alternative field is completed
  const hasAlternativeField = REQUIRED_ALTERNATIVE_FIELDS.some(
    ({ field }) => isFieldCompleted(profileData[field])
  );

  const alternativeFieldsStatus = REQUIRED_ALTERNATIVE_FIELDS.map(({ field, label }) => ({
    field,
    label,
    completed: isFieldCompleted(profileData[field]),
  }));

  const optionalFieldsStatus = OPTIONAL_FIELDS.map(({ field, label }) => ({
    field,
    label,
    completed: isFieldCompleted(profileData[field]),
  }));

  // Calculate completion
  const completedRequired = requiredFieldsStatus.filter(f => f.completed).length;
  const totalRequired = REQUIRED_FIELDS.length + 1; // +1 for alternative fields requirement
  const requiredComplete = completedRequired === REQUIRED_FIELDS.length && hasAlternativeField;

  const completedOptional = optionalFieldsStatus.filter(f => f.completed).length;
  const optionalBonus = (completedOptional / OPTIONAL_FIELDS.length) * 10; // 10% bonus for optional fields

  const basePercentage = requiredComplete ? 100 : ((completedRequired + (hasAlternativeField ? 1 : 0)) / totalRequired) * 100;
  const completionPercentage = Math.min(100, Math.round(basePercentage + optionalBonus));

  // Fix: Correct missing count calculation
  const missingRequiredCount = (REQUIRED_FIELDS.length - completedRequired) + (hasAlternativeField ? 0 : 1);

  return {
    isComplete: requiredComplete,
    completionPercentage,
    requiredFields: [
      ...requiredFieldsStatus,
      {
        field: hasAlternativeField ? alternativeFieldsStatus.find(f => f.completed)!.field : 'dueDate',
        label: hasAlternativeField 
          ? alternativeFieldsStatus.find(f => f.completed)!.label 
          : 'Due Date or Postpartum Time',
        completed: hasAlternativeField,
      }
    ],
    optionalFields: optionalFieldsStatus,
    missingRequiredCount,
    totalRequiredCount: totalRequired,
  };
}

/**
 * Gets the list of missing required fields
 */
export function getMissingFields(completeness: ProfileCompleteness): string[] {
  return completeness.requiredFields
    .filter(field => !field.completed)
    .map(field => field.label);
}

/**
 * Gets the field name of the first missing required field (for focus targeting)
 */
export function getFirstMissingFieldName(completeness: ProfileCompleteness): keyof ProfileData | null {
  const firstMissing = completeness.requiredFields.find(field => !field.completed);
  return firstMissing ? firstMissing.field : null;
}

/**
 * Determines if a profile completion prompt should be shown
 */
export function shouldShowPrompt(
  completeness: ProfileCompleteness,
  context: PromptContext
): boolean {
  // Don't show if profile is complete
  if (completeness.isComplete) {
    return false;
  }

  // Check if user has permanently dismissed
  const dismissed = localStorage.getItem(STORAGE_KEYS.PROFILE_COMPLETION_DISMISSED);
  if (dismissed === 'true') {
    return false;
  }

  // Check snooze status
  const snoozeUntil = localStorage.getItem(STORAGE_KEYS.PROFILE_PROMPT_SNOOZE);
  if (snoozeUntil && Date.now() < parseInt(snoozeUntil)) {
    return false;
  }

  // Check if already shown this session (prevent spam)
  const lastShownKey = `${STORAGE_KEYS.PROFILE_PROMPT_LAST_SHOWN}_${context.location}`;
  const lastShown = sessionStorage.getItem(lastShownKey);
  
  if (lastShown) {
    const timeSinceLastShown = Date.now() - parseInt(lastShown);
    const minInterval = MIN_PROMPT_INTERVAL_MINUTES * 60 * 1000;
    
    if (timeSinceLastShown < minInterval) {
      return false;
    }
  }

  // Location-specific rules
  switch (context.location) {
    case 'dashboard':
      // Show on first login after disclaimer
      return context.isFirstLogin;
      
    case 'workouts':
      // Show before first workout if profile incomplete
      return !context.hasCompletedWorkout;
      
    case 'community':
      // Always show in community if incomplete (for better engagement)
      return true;
      
    default:
      return false;
  }
}

/**
 * Records that a prompt was shown
 */
export function recordPromptShown(location: string): void {
  const lastShownKey = `${STORAGE_KEYS.PROFILE_PROMPT_LAST_SHOWN}_${location}`;
  sessionStorage.setItem(lastShownKey, Date.now().toString());
}

/**
 * Snoozes profile prompts for the specified duration
 */
export function snoozePrompts(days: number = SNOOZE_DURATION_DAYS): void {
  const snoozeUntil = Date.now() + (days * 24 * 60 * 60 * 1000);
  localStorage.setItem(STORAGE_KEYS.PROFILE_PROMPT_SNOOZE, snoozeUntil.toString());
}

/**
 * Permanently dismisses profile completion prompts
 */
export function dismissPromptsPermanently(): void {
  localStorage.setItem(STORAGE_KEYS.PROFILE_COMPLETION_DISMISSED, 'true');
}

/**
 * Clears all prompt-related storage (for profile completion)
 */
export function clearPromptState(): void {
  localStorage.removeItem(STORAGE_KEYS.PROFILE_PROMPT_SNOOZE);
  localStorage.removeItem(STORAGE_KEYS.PROFILE_COMPLETION_DISMISSED);
  
  // Clear all session storage for last shown
  const keysToRemove: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key?.startsWith(STORAGE_KEYS.PROFILE_PROMPT_LAST_SHOWN)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => sessionStorage.removeItem(key));
}

/**
 * Gets the current profile data from localStorage
 */
export function getCurrentProfileData(): ProfileData {
  // Default profile data structure
  const defaultProfile: ProfileData = {
    country: '',
    bio: '',
    socials: '',
    dueDate: '',
    postpartumTime: '',
    timezone: '',
    fullName: '',
    email: '',
    timeFormat: '12 hours',
    photo: '',
    // Fitness & Health Information
    fitnessLevel: '',
    deliveryType: '',
    numberOfChildren: '',
    breastfeedingStatus: '',
    medicalClearance: false,
    availableEquipment: [],
    fitnessGoals: '',
    workoutDaysPerWeek: '',
    preferredWorkoutTime: '',
    physicalLimitations: '',
    newsUpdates: true,
    promotions: true,
    communityUpdates: true,
    transactionalEmails: false,
  };

  try {
    // Try to get existing profile data from localStorage
    const stored = localStorage.getItem('profileData');
    if (stored) {
      return { ...defaultProfile, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.warn('Failed to parse profile data from localStorage:', error);
  }

  return defaultProfile;
}

/**
 * Saves profile data to localStorage and clears prompts if complete
 */
export function saveProfileData(profileData: ProfileData): void {
  localStorage.setItem('profileData', JSON.stringify(profileData));
  
  // Check if profile is now complete and clear prompts
  const completeness = evaluateCompleteness(profileData);
  if (completeness.isComplete) {
    clearPromptState();
  }
}