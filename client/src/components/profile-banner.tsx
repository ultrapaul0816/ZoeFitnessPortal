import { useState, useEffect } from "react";
import { X, User, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  evaluateCompleteness, 
  getCurrentProfileData, 
  shouldShowPrompt, 
  recordPromptShown, 
  snoozePrompts,
  getMissingFields,
  type PromptContext
} from "@/lib/profile-completeness";

interface ProfileBannerProps {
  onCompleteProfile: () => void;
  context: PromptContext;
  className?: string;
}

export default function ProfileBanner({ 
  onCompleteProfile, 
  context, 
  className = "" 
}: ProfileBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [profileCompleteness, setProfileCompleteness] = useState<ReturnType<typeof evaluateCompleteness> | null>(null);

  useEffect(() => {
    const profileData = getCurrentProfileData();
    const completeness = evaluateCompleteness(profileData);
    setProfileCompleteness(completeness);

    const shouldShow = shouldShowPrompt(completeness, context);
    if (shouldShow) {
      setIsVisible(true);
      recordPromptShown(context.location);
    } else if (completeness.isComplete) {
      // Hide banner if profile is complete
      setIsVisible(false);
    }
  }, [context]);

  // Listen for localStorage changes to update banner when profile data changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'profileData') {
        const profileData = getCurrentProfileData();
        const completeness = evaluateCompleteness(profileData);
        setProfileCompleteness(completeness);
        
        // Hide banner if profile is now complete
        if (completeness.isComplete) {
          setIsVisible(false);
        } else {
          // Re-evaluate if banner should show
          const shouldShow = shouldShowPrompt(completeness, context);
          setIsVisible(shouldShow);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [context]);

  const handleCompleteProfile = () => {
    setIsVisible(false);
    onCompleteProfile();
  };

  const handleRemindLater = () => {
    setIsVisible(false);
    snoozePrompts(7); // Snooze for 7 days
  };

  const handleDismiss = () => {
    setIsVisible(false);
    snoozePrompts(1); // Snooze for 1 day if just dismissed
  };

  if (!isVisible || !profileCompleteness || profileCompleteness.isComplete) {
    return null;
  }

  const missingFields = getMissingFields(profileCompleteness);
  const completionText = profileCompleteness.missingRequiredCount === 1 
    ? "1 field left" 
    : `${profileCompleteness.missingRequiredCount} fields left`;

  return (
    <div className={`relative bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-4 md:p-6 shadow-sm ${className}`}>
      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors z-10"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4 pr-8">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-2">
            <h3 className="text-sm font-semibold text-gray-900">
              Complete Your Profile
            </h3>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
              <span className="text-xs text-gray-600">{completionText}</span>
            </div>
          </div>

          <p className="text-sm text-gray-700 mb-3">
            Add your {missingFields.join(", ").toLowerCase()} to get personalized recommendations and connect with other moms in your area.
          </p>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Profile completion</span>
              <span>{profileCompleteness.completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${profileCompleteness.completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Action Buttons - Mobile Responsive */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              onClick={handleCompleteProfile}
              size="sm"
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-medium px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 w-full sm:w-auto"
              data-testid="button-complete-profile"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Profile (2 min)
            </Button>

            <Button
              onClick={handleRemindLater}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-800 font-medium px-3 py-2 rounded-full hover:bg-gray-100 transition-all duration-200 w-full sm:w-auto"
              data-testid="button-remind-later"
            >
              <Clock className="w-4 h-4 mr-1" />
              Remind me later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}