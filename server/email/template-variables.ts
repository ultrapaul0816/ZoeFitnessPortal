import type { User } from "@shared/schema";

export interface TemplateVariables {
  firstName: string;
  userName: string;
  programName: string;
  weekNumber: string;
  dashboardUrl: string;
  trackingPixel?: string;
}

/**
 * Replace template variables like {{firstName}}, {{programName}} with actual values
 */
export function replaceTemplateVariables(
  template: string,
  variables: Partial<TemplateVariables>
): string {
  let result = template;
  
  // Replace each variable
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    const replacement = value || '';
    result = result.replace(new RegExp(placeholder, 'g'), replacement);
  });
  
  return result;
}

/**
 * Generate template variables from user data
 */
export function generateUserVariables(
  user: User,
  options: {
    programName?: string;
    weekNumber?: number;
    campaignId?: string;
    recipientId?: string;
    baseUrl?: string;
  } = {}
): TemplateVariables {
  const baseUrl = options.baseUrl || process.env.REPLIT_DEV_DOMAIN || 'https://your-domain.repl.co';
  const dashboardUrl = `${baseUrl}/dashboard`;
  
  // Generate tracking pixel if campaign and recipient IDs are provided
  let trackingPixel = '';
  if (options.campaignId && options.recipientId) {
    trackingPixel = `<img src="${baseUrl}/api/email-track/${options.campaignId}/${options.recipientId}" width="1" height="1" alt="" style="display:none;" />`;
  }
  
  return {
    firstName: user.firstName || 'there',
    userName: `${user.firstName} ${user.lastName}`.trim() || 'there',
    programName: options.programName || 'Your Postpartum Strength Recovery Program',
    weekNumber: options.weekNumber?.toString() || '1',
    dashboardUrl,
    trackingPixel,
  };
}

/**
 * Generate sample variables for preview purposes
 */
export function generateSampleVariables(baseUrl?: string): TemplateVariables {
  const url = baseUrl || process.env.REPLIT_DEV_DOMAIN || 'https://your-domain.repl.co';
  
  return {
    firstName: 'Sarah',
    userName: 'Sarah Johnson',
    programName: 'Your Postpartum Strength Recovery Program',
    weekNumber: '3',
    dashboardUrl: `${url}/dashboard`,
    trackingPixel: '<img src="..." width="1" height="1" alt="" style="display:none;" />',
  };
}
