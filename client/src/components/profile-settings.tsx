import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Info, Globe, BookOpen, CreditCard, User, LogOut, ChevronRight, ArrowRight, ArrowLeft, Mail, HelpCircle, Copy, CheckCircle2, Circle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  evaluateCompleteness, 
  getCurrentProfileData, 
  saveProfileData,
  clearPromptState,
  getFirstMissingFieldName,
  type ProfileData 
} from "@/lib/profile-completeness";
import type { User as UserType } from "@shared/schema";

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onUserUpdate: (user: UserType) => void;
  initialView?: 'menu' | 'profile' | 'purchases' | 'support';
}

export default function ProfileSettings({ isOpen, onClose, user, onUserUpdate, initialView = 'menu' }: ProfileSettingsProps) {
  const [location, setLocation] = useLocation();
  const [currentView, setCurrentView] = useState<'menu' | 'profile' | 'purchases' | 'support'>(initialView);
  const [profileData, setProfileData] = useState<ProfileData>({
    country: '',
    bio: '',
    socials: '',
    dueDate: '',
    postpartumTime: '',
    timezone: '',
    newsUpdates: true,
    promotions: true,
    communityUpdates: true,
    transactionalEmails: false
  });
  const [profileCompleteness, setProfileCompleteness] = useState<ReturnType<typeof evaluateCompleteness> | null>(null);
  const { toast } = useToast();
  const countryRef = useRef<HTMLButtonElement>(null);
  const timezoneRef = useRef<HTMLButtonElement>(null);
  const dueDateRef = useRef<HTMLInputElement>(null);
  const postpartumRef = useRef<HTMLInputElement>(null);

  const [renderOpen, setRenderOpen] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  // Load profile data from localStorage when component opens
  useEffect(() => {
    if (isOpen) {
      const currentProfile = getCurrentProfileData();
      setProfileData(currentProfile);
      
      // Evaluate completeness
      const completeness = evaluateCompleteness(currentProfile);
      setProfileCompleteness(completeness);
      
      setRenderOpen(true);
      setIsClosing(false);
      
      // Focus on first missing field after a short delay to allow render
      setTimeout(() => {
        if (!completeness.isComplete) {
          const firstMissingField = getFirstMissingFieldName(completeness);
          switch (firstMissingField) {
            case 'country':
              countryRef.current?.focus();
              break;
            case 'timezone':
              timezoneRef.current?.focus();
              break;
            case 'dueDate':
              dueDateRef.current?.focus();
              break;
            case 'postpartumTime':
              postpartumRef.current?.focus();
              break;
          }
        }
      }, 100);
    } else if (renderOpen) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setRenderOpen(false);
      }, 600); // Allow time for staggered exit animation
      return () => clearTimeout(timer);
    }
  }, [isOpen, renderOpen]);

  // Update completeness when profile data changes
  useEffect(() => {
    const completeness = evaluateCompleteness(profileData);
    setProfileCompleteness(completeness);
  }, [profileData]);

  // Update current view when initialView prop changes
  useEffect(() => {
    setCurrentView(initialView);
  }, [initialView]);

  if (!renderOpen) return null;

  const handleLogout = () => {
    localStorage.removeItem("user");
    onClose();
    window.location.href = "/";
  };

  const handleSaveProfile = () => {
    // Save profile data to localStorage
    saveProfileData(profileData);
    
    const completeness = evaluateCompleteness(profileData);
    
    // Show success feedback
    if (completeness.isComplete) {
      toast({
        title: "Profile Complete! 🎉",
        description: "Your profile has been completed successfully. You're all set!",
        duration: 4000,
      });
      
      // Clear prompt state since profile is now complete
      clearPromptState();
    } else {
      toast({
        title: "Profile Updated",
        description: `Profile saved. ${completeness.missingRequiredCount} required field${completeness.missingRequiredCount > 1 ? 's' : ''} remaining.`,
        duration: 3000,
      });
    }
    
    // Update completeness state
    setProfileCompleteness(completeness);
  };

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 
    'Italy', 'Spain', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Ireland', 
    'New Zealand', 'Japan', 'South Korea', 'Singapore', 'India', 'Brazil', 'Mexico'
  ];

  if (currentView === 'support') {
    return (
      <div 
        className="fixed top-16 left-0 right-0 bottom-0 z-40 bg-gray-50 animate-in scale-in-95 fade-in duration-300" 
        data-testid="page-support-settings"
      >
        <div className="w-full h-full overflow-y-auto p-6">
          {/* Back Button */}
          <button 
            onClick={() => setCurrentView('menu')}
            className="group relative mb-6 flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white shadow-sm hover:shadow-lg hover:border-pink-300 hover:bg-pink-50 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-50"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600 group-hover:text-pink-600 transition-all duration-300 transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-pink-700 transition-colors duration-300">
              Back to Menu
            </span>
            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400/0 to-pink-600/0 group-hover:from-pink-400/10 group-hover:to-pink-600/10 transition-all duration-300 pointer-events-none"></div>
          </button>

          {/* Support Center */}
          <div className="bg-white rounded-lg p-8 shadow-sm text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <HelpCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Need Help?</h2>
              <p className="text-gray-600 mb-6">
                We're here to support you on your wellness journey. Get in touch with our friendly team for any questions or assistance.
              </p>
            </div>

            {/* Support Email Section */}
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-6 mb-6 border border-pink-200">
              <div className="flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-pink-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Email Support</h3>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-gray-900">support@strongerwithzoe.in</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText('support@strongerwithzoe.in');
                      // You could add a toast notification here
                    }}
                    className="p-2 text-pink-600 hover:text-pink-700 hover:bg-pink-50 rounded-lg transition-colors duration-200"
                    title="Copy email address"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mt-3">
                Send us an email and we'll get back to you within 24 hours
              </p>
            </div>

            {/* Additional Support Info */}
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Response Time</h4>
                <p className="text-sm text-gray-600">We typically respond within 24 hours during business days</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">What to Include</h4>
                <p className="text-sm text-gray-600">Your account email and a detailed description of your question</p>
              </div>
            </div>

            {/* Contact Button */}
            <div className="mt-8">
              <Button 
                onClick={() => window.open('https://mail.google.com/mail/u/0/?to=support@strongerwithzoe.in&su=Support+Request&body=Hi+Stronger+With+Zoe+Team,%0D%0A%0D%0AI+would+like+to+get+support+with:%0D%0A%0D%0A[Please+describe+your+question+or+issue+here]%0D%0A%0D%0AThank+you!&tf=cm', '_blank')}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-medium px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                data-testid="button-contact-support"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'purchases') {
    return (
      <div 
        className="fixed top-16 left-0 right-0 bottom-0 z-40 bg-gray-50 animate-in scale-in-95 fade-in duration-300" 
        data-testid="page-purchases-settings"
      >
        <div className="w-full h-full overflow-y-auto p-6">
          {/* Back Button */}
          <button 
            onClick={() => setCurrentView('menu')}
            className="group relative mb-6 flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white shadow-sm hover:shadow-lg hover:border-pink-300 hover:bg-pink-50 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-50"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600 group-hover:text-pink-600 transition-all duration-300 transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-pink-700 transition-colors duration-300">
              Back to Menu
            </span>
            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400/0 to-pink-600/0 group-hover:from-pink-400/10 group-hover:to-pink-600/10 transition-all duration-300 pointer-events-none"></div>
          </button>


          {/* Invoice History */}
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">Invoice History</h2>
            
            {/* Subscription Section */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Subscription</h3>
              <p className="text-gray-600 mb-4">Cancelled May 09, 2025, 4 months ago</p>
              
              <div className="border rounded-lg p-4 flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Monthly Subscription</h4>
                  <p className="text-gray-600">$29.00/month</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded border border-red-200">
                      CLOSED
                    </span>
                    <span className="text-sm text-gray-600">on May 18, 2025</span>
                  </div>
                </div>
              </div>
              
              <Button variant="secondary" className="mt-4 bg-gray-100 text-gray-800 hover:bg-gray-200">
                Reactivate
              </Button>
            </div>

            {/* Purchases Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Purchases</h3>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-200 to-pink-200 rounded flex items-center justify-center">
                      <svg className="w-8 h-8 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <div className="absolute -top-2 -right-2 bg-gray-600 text-white text-xs font-medium px-2 py-1 rounded flex items-center space-x-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                      </svg>
                      <span>15</span>
                    </div>
                  </div>
                  <div className="flex-1 text-center">
                    <h4 className="font-medium text-gray-900 mb-2 underline">The Mama Summit</h4>
                    <span className="inline-block px-3 py-1 text-sm font-medium text-gray-700 border border-gray-300 rounded-full">
                      BUNDLE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'profile') {
    return (
      <div 
        className="fixed top-16 left-0 right-0 bottom-0 z-40 bg-gray-50 animate-in scale-in-95 fade-in duration-300" 
        data-testid="page-profile-settings"
      >
        <div className="w-full h-full overflow-y-auto p-6">
          {/* Back Button */}
          <button 
            onClick={() => setCurrentView('menu')}
            className="group relative mb-6 flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white shadow-sm hover:shadow-lg hover:border-pink-300 hover:bg-pink-50 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-50"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600 group-hover:text-pink-600 transition-all duration-300 transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-pink-700 transition-colors duration-300">
              Back to Menu
            </span>
            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400/0 to-pink-600/0 group-hover:from-pink-400/10 group-hover:to-pink-600/10 transition-all duration-300 pointer-events-none"></div>
          </button>

          {/* Profile Completion Checklist */}
          {profileCompleteness && !profileCompleteness.isComplete && (
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-6 mb-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Complete Your Profile</h3>
                    <p className="text-sm text-gray-600">
                      {profileCompleteness.missingRequiredCount} required field{profileCompleteness.missingRequiredCount > 1 ? 's' : ''} remaining
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {profileCompleteness.completionPercentage}%
                  </div>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${profileCompleteness.completionPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {profileCompleteness.requiredFields.map((field) => (
                  <div key={field.field} className="flex items-center space-x-2">
                    {field.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={`text-sm ${field.completed ? 'text-green-700' : 'text-gray-600'}`}>
                      {field.label}
                    </span>
                  </div>
                ))}
              </div>

              {profileCompleteness.optionalFields.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Optional (for better experience):</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {profileCompleteness.optionalFields.map((field) => (
                      <div key={field.field} className="flex items-center space-x-2">
                        {field.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-300" />
                        )}
                        <span className={`text-sm ${field.completed ? 'text-blue-700' : 'text-gray-500'}`}>
                          {field.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Profile Complete Success Message */}
          {profileCompleteness && profileCompleteness.isComplete && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-6 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Profile Complete! 🎉</h3>
                  <p className="text-sm text-gray-600">
                    Your profile is 100% complete. You're all set for the best experience!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* My Public Info */}
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">My Public Info</h2>
            <p className="text-gray-600 mb-6">
              Shown when you participate in our community or comment on videos and live events.
            </p>

            {/* Avatar */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-2xl font-medium">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
              <Button 
                variant="secondary" 
                className="bg-gray-400 text-white hover:bg-gray-500"
              >
                Change
              </Button>
            </div>

            {/* Country */}
            <div className="space-y-2 mb-6">
              <Label htmlFor="country">Country *</Label>
              <Select value={profileData.country} onValueChange={(value) => setProfileData(prev => ({...prev, country: value}))}>
                <SelectTrigger 
                  ref={countryRef}
                  className={!profileData.country ? 'ring-2 ring-pink-500 ring-opacity-50' : ''}
                >
                  <SelectValue placeholder="Select Your Country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bio */}
            <div className="space-y-2 mb-6">
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio"
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({...prev, bio: e.target.value}))}
                className="min-h-[100px]"
              />
            </div>

            {/* Socials */}
            <div className="space-y-2">
              <Label htmlFor="socials">Socials</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="socials"
                  type="url"
                  placeholder="http://example.com"
                  value={profileData.socials}
                  onChange={(e) => setProfileData(prev => ({...prev, socials: e.target.value}))}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* My Private Info */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">My Private Info</h2>

            {/* Full Name */}
            <div className="space-y-2 mb-6">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={profileData.fullName}
                onChange={(e) => setProfileData(prev => ({...prev, fullName: e.target.value}))}
              />
            </div>

            {/* Email */}
            <div className="space-y-2 mb-6">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({...prev, email: e.target.value}))}
              />
            </div>

            {/* Due Date */}
            <div className="space-y-2 mb-6">
              <Label htmlFor="dueDate">If pregnant, when are you due? *</Label>
              <Input
                id="dueDate"
                type="date"
                value={profileData.dueDate}
                onChange={(e) => setProfileData(prev => ({...prev, dueDate: e.target.value}))}
                ref={dueDateRef}
                className={!profileData.dueDate && !profileData.postpartumTime ? 'ring-2 ring-pink-500 ring-opacity-50' : ''}
              />
            </div>

            {/* Postpartum Time */}
            <div className="space-y-2">
              <Label htmlFor="postpartumTime">If postpartum, how many weeks/months/years postpartum? *</Label>
              <Input
                id="postpartumTime"
                placeholder="e.g., 6 weeks, 3 months, 1 year"
                value={profileData.postpartumTime}
                onChange={(e) => setProfileData(prev => ({...prev, postpartumTime: e.target.value}))}
                ref={postpartumRef}
                className={!profileData.dueDate && !profileData.postpartumTime ? 'ring-2 ring-pink-500 ring-opacity-50' : ''}
              />
              <p className="text-xs text-gray-500">* Please fill either Due Date OR Postpartum Time (not both)</p>
            </div>
          </div>

          {/* Time & Timezone Settings */}
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            {/* Time Format */}
            <div className="space-y-2 mb-6">
              <Label htmlFor="timeFormat">Time Format</Label>
              <Select value={profileData.timeFormat} onValueChange={(value) => setProfileData(prev => ({...prev, timeFormat: value}))}>
                <SelectTrigger>
                  <SelectValue placeholder="12 hours" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12 hours">12 hours</SelectItem>
                  <SelectItem value="24 hours">24 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Timezone */}
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone *</Label>
              <Select value={profileData.timezone} onValueChange={(value) => setProfileData(prev => ({...prev, timezone: value}))}>
                <SelectTrigger 
                  ref={timezoneRef}
                  className={!profileData.timezone ? 'ring-2 ring-pink-500 ring-opacity-50' : ''}
                >
                  <SelectValue placeholder="Select Your Timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
                  <SelectItem value="UTC-7">Mountain Time (UTC-7)</SelectItem>
                  <SelectItem value="UTC-6">Central Time (UTC-6)</SelectItem>
                  <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                  <SelectItem value="UTC+0">Greenwich Mean Time (UTC+0)</SelectItem>
                  <SelectItem value="UTC+1">Central European Time (UTC+1)</SelectItem>
                  <SelectItem value="UTC+10">Australian Eastern Time (UTC+10)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Secure Sign In */}
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Secure sign in</h2>
            <p className="text-gray-600 mb-6">Manage your password</p>

            <div className="space-y-2">
              <Label className="text-gray-700">Password</Label>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Set new password</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>


          {/* Danger Zone */}
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Danger Zone</h2>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Save Changes Button */}
          <Button 
            onClick={handleSaveProfile}
            className="w-full bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 group"
            data-testid="button-save-profile"
          >
            <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Save Changes</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed top-16 left-0 right-0 bottom-0 z-40 bg-white animate-in slide-in-from-top-4 fade-in duration-300" 
      data-testid="page-profile-settings"
    >
      <div className="w-full h-full overflow-y-auto">
        {/* Menu Items */}
        <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-6">
          <div className="flex flex-col space-y-3">
            {/* Profile */}
            <div className="flex justify-start">
              <button 
                className="relative inline-flex items-center space-x-3 hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 hover:shadow-lg hover:shadow-pink-200/50 hover:border hover:border-pink-300 border border-transparent transition-all duration-300 group py-3 pl-3 pr-4 rounded-2xl animate-in scale-in-95 fade-in duration-400 overflow-hidden"
                style={{ animationDelay: '80ms' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentView('profile');
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-400 opacity-0 group-hover:opacity-10 group-hover:animate-in group-hover:slide-in-from-top-2 transition-all duration-300 rounded-2xl"></div>
                <div className="w-8 h-8 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-pink-300 relative z-10">
                  <User className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-base font-medium text-gray-900 group-hover:text-pink-600 group-hover:translate-x-2 transition-all duration-300 relative z-10">Profile</span>
                <div className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-300 ml-2">
                  <ChevronRight className="w-4 h-4 text-pink-500" />
                </div>
              </button>
            </div>

            {/* Divider */}
            <div className="flex justify-start my-2 pl-3">
              <div className="w-40 h-px bg-gradient-to-r from-pink-300 via-pink-300 to-transparent shadow-sm"></div>
            </div>

            {/* My Library */}
            <div className="flex justify-start">
              <button 
                className="relative inline-flex items-center space-x-3 hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 hover:shadow-lg hover:shadow-pink-200/50 hover:border hover:border-pink-300 border border-transparent transition-all duration-300 group py-3 pl-3 pr-4 rounded-2xl animate-in scale-in-95 fade-in duration-400 overflow-hidden"
                style={{ animationDelay: '160ms' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                  setLocation("/my-library");
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-400 opacity-0 group-hover:opacity-10 group-hover:animate-in group-hover:slide-in-from-top-2 transition-all duration-300 rounded-2xl"></div>
                <div className="w-8 h-8 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-pink-300 relative z-10">
                  <BookOpen className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-base font-medium text-gray-900 group-hover:text-pink-600 group-hover:translate-x-2 transition-all duration-300 relative z-10">My Library</span>
                <div className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-300 ml-2">
                  <ChevronRight className="w-4 h-4 text-pink-500" />
                </div>
              </button>
            </div>

            {/* Divider */}
            <div className="flex justify-start my-2 pl-3">
              <div className="w-40 h-px bg-gradient-to-r from-pink-300 via-pink-300 to-transparent shadow-sm"></div>
            </div>

            {/* Purchases & Payment */}
            <div className="flex justify-start">
              <button 
                className="relative inline-flex items-center space-x-3 hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 hover:shadow-lg hover:shadow-pink-200/50 hover:border hover:border-pink-300 border border-transparent transition-all duration-300 group py-3 pl-3 pr-4 rounded-2xl animate-in scale-in-95 fade-in duration-400 overflow-hidden"
                style={{ animationDelay: '240ms' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentView('purchases');
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-400 opacity-0 group-hover:opacity-10 group-hover:animate-in group-hover:slide-in-from-top-2 transition-all duration-300 rounded-2xl"></div>
                <div className="w-8 h-8 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-pink-300 relative z-10">
                  <CreditCard className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-base font-medium text-gray-900 group-hover:text-pink-600 group-hover:translate-x-2 transition-all duration-300 relative z-10">Purchases</span>
                <div className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-300 ml-2">
                  <ChevronRight className="w-4 h-4 text-pink-500" />
                </div>
              </button>
            </div>

            {/* Divider */}
            <div className="flex justify-start my-2 pl-3">
              <div className="w-40 h-px bg-gradient-to-r from-pink-300 via-pink-300 to-transparent shadow-sm"></div>
            </div>

            {/* Support */}
            <div className="flex justify-start">
              <button 
                className="relative inline-flex items-center space-x-3 hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 hover:shadow-lg hover:shadow-pink-200/50 hover:border hover:border-pink-300 border border-transparent transition-all duration-300 group py-3 pl-3 pr-4 rounded-2xl animate-in scale-in-95 fade-in duration-400 overflow-hidden"
                style={{ animationDelay: '320ms' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentView('support');
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-400 opacity-0 group-hover:opacity-10 group-hover:animate-in group-hover:slide-in-from-top-2 transition-all duration-300 rounded-2xl"></div>
                <div className="w-8 h-8 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-pink-300 relative z-10">
                  <HelpCircle className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-base font-medium text-gray-900 group-hover:text-pink-600 group-hover:translate-x-2 transition-all duration-300 relative z-10">Support</span>
                <div className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-300 ml-2">
                  <ChevronRight className="w-4 h-4 text-pink-500" />
                </div>
              </button>
            </div>

            {/* Divider */}
            <div className="flex justify-start my-2 pl-3">
              <div className="w-40 h-px bg-gradient-to-r from-pink-300 via-pink-300 to-transparent shadow-sm"></div>
            </div>

            {/* Logout */}
            <div className="flex justify-start">
              <button 
                className="relative inline-flex items-center space-x-3 hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 hover:shadow-lg hover:shadow-pink-200/50 hover:border hover:border-pink-300 border border-transparent transition-all duration-300 group py-3 pl-3 pr-4 rounded-2xl animate-in scale-in-95 fade-in duration-400 overflow-hidden"
                style={{ animationDelay: '400ms' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogout();
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-400 opacity-0 group-hover:opacity-10 group-hover:animate-in group-hover:slide-in-from-top-2 transition-all duration-300 rounded-2xl"></div>
                <div className="w-8 h-8 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-pink-300 relative z-10">
                  <LogOut className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-base font-medium text-gray-900 group-hover:text-pink-600 group-hover:translate-x-2 transition-all duration-300 relative z-10">Logout</span>
                <div className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-300 ml-2">
                  <ChevronRight className="w-4 h-4 text-pink-500" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Click outside area to close */}
        <div 
          className="absolute inset-0 -z-10" 
          onClick={onClose}
        ></div>
      </div>
    </div>
  );
}