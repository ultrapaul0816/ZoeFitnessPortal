import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, User, CheckCircle, Flame, Calendar, Menu, BookOpen, CreditCard, LogOut, Globe, Info, ChevronDown, ClipboardCheck, ChevronRight, Play } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ProgramCard from "@/components/program-card";
import PremiumProgramCard from "@/components/premium-program-card";
import CommunityModal from "@/components/community-modal";
import ProfileSettings from "@/components/profile-settings";
import ProfileBanner from "@/components/profile-banner";
import CheckinModal from "@/components/checkin-modal";
import TodaysWorkout from "@/components/todays-workout";
import type { MemberProgram, Program, Notification, User as UserType } from "@shared/schema";

// Determine if we should show the check-in modal based on user data
function shouldPromptCheckin(user: UserType): boolean {
  const loginCount = user.loginCount || 0;
  const lastPrompt = user.lastCheckinPromptAt ? new Date(user.lastCheckinPromptAt) : null;
  
  // Check if profile is incomplete (missing country or delivery date)
  const isProfileIncomplete = !user.country || !user.deliveryDate;
  
  // Calculate days since last prompt
  const daysSinceLastPrompt = lastPrompt 
    ? Math.floor((Date.now() - lastPrompt.getTime()) / (1000 * 60 * 60 * 24))
    : Infinity;
  
  // For users with incomplete profiles: prompt every 2-3 logins or if 3+ days since last prompt
  if (isProfileIncomplete) {
    // On first few logins, prompt on login 2 and 5
    if (loginCount === 2 || loginCount === 5) return true;
    // After that, prompt if 3+ days since last prompt
    if (daysSinceLastPrompt >= 3) return true;
  } else {
    // For complete profiles: less frequent prompting
    // Prompt on login 3 and every 7 days after
    if (loginCount === 3) return true;
    if (daysSinceLastPrompt >= 7) return true;
  }
  
  return false;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<UserType | null>(null);
  const [showCommunity, setShowCommunity] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showNotificationsDialog, setShowNotificationsDialog] = useState(false);
  const [showPurchasesDialog, setShowPurchasesDialog] = useState(false);
  const [showDangerZone, setShowDangerZone] = useState(false);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [checkinPromptChecked, setCheckinPromptChecked] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    location: "",
    bio: "",
    socials: "http://example.com",
    dueDate: "",
    postpartumWeeks: "",
    timeFormat: "12 hours",
    timezone: "",
    notifications: {
      newsUpdates: true,
      promotions: true,
      communityUpdates: true,
      transactionalEmails: true,
    }
  });
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [currentView, setCurrentView] = useState<'menu' | 'profile' | 'purchases' | 'support'>('menu');
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);

  // Auto-hide welcome message after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcomeMessage(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Check session with server on mount
    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/session");
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
          
          // Check if this is the first login for profile completion banner
          const lastLogin = localStorage.getItem("lastLoginDate");
          const today = new Date().toDateString();
          
          if (!lastLogin || lastLogin !== today) {
            setIsFirstLogin(true);
            localStorage.setItem("lastLoginDate", today);
          }
          
          // Initialize profile data with user info
          setProfileData(prev => ({
            ...prev,
            fullName: `${data.user.firstName} ${data.user.lastName}`,
            email: data.user.email
          }));
          
          // Determine if we should show the check-in modal
          // First check if user has already checked in today
          if (!checkinPromptChecked) {
            setCheckinPromptChecked(true);
            const shouldShowCheckin = shouldPromptCheckin(data.user);
            if (shouldShowCheckin) {
              // Check if user already checked in today before showing modal
              try {
                const checkinResponse = await fetch("/api/checkins/today");
                if (checkinResponse.ok) {
                  const todayCheckin = await checkinResponse.json();
                  // Only show modal if there's NO existing check-in today
                  if (!todayCheckin) {
                    setTimeout(() => setShowCheckinModal(true), 1500);
                  }
                }
              } catch (error) {
                // On error, default to showing the modal
                setTimeout(() => setShowCheckinModal(true), 1500);
              }
            }
          }
        } else {
          // No valid session - redirect to login
          localStorage.removeItem("user");
          setLocation("/");
        }
      } catch (error) {
        // On error, try localStorage as fallback
        const userData = localStorage.getItem("user");
        if (!userData) {
          setLocation("/");
          return;
        }
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        setProfileData(prev => ({
          ...prev,
          fullName: `${parsedUser.firstName} ${parsedUser.lastName}`,
          email: parsedUser.email
        }));
      }
    }
    
    checkAuth();
  }, [setLocation]);


  const { data: memberPrograms = [] } = useQuery<(MemberProgram & { program: Program })[]>({
    queryKey: ["/api/member-programs", user?.id],
    enabled: !!user?.id,
  });

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications", user?.id],
    enabled: !!user?.id,
  });

  // Get all programs for premium program display
  const { data: allPrograms = [] } = useQuery({
    queryKey: ["/api/programs"],
    enabled: !!user?.id,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (!user) return null;

  const stats = {
    completedWorkouts: memberPrograms.reduce((total, mp) => total + (mp.progress || 0), 0),
    currentStreak: "7 days",
    activePrograms: memberPrograms.filter((mp) => mp.isActive).length,
  };

  // Profile Content Component
  const ProfileContent = () => {
    const handleSaveChanges = () => {
      console.log("Saving profile changes:", profileData);
    };

    return (
      <div className="space-y-8">
        {/* My Public Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">My Public Info</h2>
            <p className="text-sm text-gray-600">
              Shown when you participate in our community or comment on videos and live events.
            </p>
          </div>

          <div className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-2xl font-medium">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
              <Button 
                variant="secondary" 
                className="bg-pink-100 text-pink-700 hover:bg-pink-200 border-pink-200"
                data-testid="button-change-avatar"
              >
                Change
              </Button>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select Your City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new-york">New York</SelectItem>
                  <SelectItem value="london">London</SelectItem>
                  <SelectItem value="toronto">Toronto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio"
                placeholder="Tell us about yourself..."
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({...prev, bio: e.target.value}))}
                rows={4}
              />
            </div>

            {/* Socials */}
            <div className="space-y-2">
              <Label htmlFor="socials">Socials</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="socials"
                  type="url"
                  value={profileData.socials}
                  onChange={(e) => setProfileData(prev => ({...prev, socials: e.target.value}))}
                  className="pl-10"
                  placeholder="http://example.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* My Private Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">My Private Info</h2>
          
          <div className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={profileData.fullName}
                onChange={(e) => setProfileData(prev => ({...prev, fullName: e.target.value}))}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({...prev, email: e.target.value}))}
              />
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="dueDate">If pregnant, when are you due?</Label>
              <Input
                id="dueDate"
                type="date"
                value={profileData.dueDate}
                onChange={(e) => setProfileData(prev => ({...prev, dueDate: e.target.value}))}
              />
            </div>

            {/* Postpartum */}
            <div className="space-y-2">
              <Label htmlFor="postpartum">If postpartum, how many weeks/months/years postpartum?</Label>
              <Input
                id="postpartum"
                placeholder="e.g., 6 weeks, 3 months, 1 year"
                value={profileData.postpartumWeeks}
                onChange={(e) => setProfileData(prev => ({...prev, postpartumWeeks: e.target.value}))}
              />
            </div>

            {/* Time Format */}
            <div className="space-y-2">
              <Label htmlFor="timeFormat">Time Format</Label>
              <Select value={profileData.timeFormat} onValueChange={(value) => setProfileData(prev => ({...prev, timeFormat: value}))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12 hours">12 hours</SelectItem>
                  <SelectItem value="24 hours">24 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Timezone */}
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select Your Timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="est">Eastern Time (EST)</SelectItem>
                  <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                  <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Secure Sign In */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Secure sign in</h2>
            <p className="text-sm text-gray-600">Manage your password</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label>Password</Label>
              <button className="block text-sm text-pink-600 hover:text-pink-700 mt-1">
                Set new password →
              </button>
            </div>
          </div>
        </div>

        {/* My Notifications */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">My Notifications</h2>
          
          <div className="space-y-4">
            {[
              { id: "newsUpdates", label: "News & Updates", checked: profileData.notifications.newsUpdates },
              { id: "promotions", label: "Promotions", checked: profileData.notifications.promotions },
              { id: "communityUpdates", label: "Community Updates", checked: profileData.notifications.communityUpdates }
            ].map((item) => (
              <div key={item.id} className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-6 h-6 rounded bg-pink-500">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <Label className="text-gray-900 font-medium">{item.label}</Label>
              </div>
            ))}
            
            {/* Transactional Emails */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-6 h-6 rounded bg-teal-500">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <Label className="text-gray-600">Transactional Emails</Label>
              </div>
              <Info className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <button
            onClick={() => setShowDangerZone(!showDangerZone)}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-lg font-semibold text-gray-900">Danger Zone</h2>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showDangerZone ? 'rotate-180' : ''}`} />
          </button>
          
          {showDangerZone && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-4">
                Permanently delete your account and all associated data.
              </p>
              <Button variant="destructive">
                Delete Account
              </Button>
            </div>
          )}
        </div>

        {/* Save Changes */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 -mx-6">
          <Button 
            onClick={handleSaveChanges}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3"
            data-testid="button-save-changes"
          >
            Save Changes
          </Button>
        </div>
      </div>
    );
  };

  // Purchases Content Component
  const PurchasesContent = () => {
    return (
      <div className="space-y-6">
        {/* Payment Method */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-6">Payment Method</h2>
          
          <div className="border border-gray-200 rounded-lg p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13.025 1l-2.847 2.828 6.176 6.176h-16.354v3.992h16.354l-6.176 6.176 2.847 2.828 10.975-11z"/>
                </svg>
              </div>
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">Link</h3>
            <p className="text-gray-600 mb-6">zoecollington@gmail.com</p>
            
            <Button 
              variant="secondary" 
              className="bg-gray-100 text-gray-700 hover:bg-gray-200"
              data-testid="button-change-payment-method"
            >
              Change Payment Method
            </Button>
          </div>
        </div>

        {/* Balance */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Balance</h3>
            <p className="text-3xl font-semibold text-gray-900 mb-6">$0.00</p>
          </div>
          
          <div className="space-y-3">
            <Button 
              variant="secondary" 
              className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200"
              data-testid="button-buy-gift-card"
            >
              Buy a gift card
            </Button>
            <Button 
              variant="secondary" 
              className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200"
              data-testid="button-redeem-gift-card"
            >
              Redeem a gift card
            </Button>
          </div>
        </div>

        {/* Invoice History */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <Button 
            variant="secondary" 
            className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200"
            data-testid="button-invoice-history"
          >
            Invoice History
          </Button>
        </div>

        {/* Subscription */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Subscription</h2>
            <p className="text-sm text-gray-500">Cancelled May 09, 2025, 4 months ago</p>
          </div>
          
          <div className="border-b border-gray-200 pb-6 mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-24 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Monthly Subscription</h3>
                <p className="text-gray-600">$29.00/month</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="px-2 py-1 text-xs font-medium text-red-600 border border-red-200 rounded">
                    CLOSED
                  </span>
                  <span className="text-sm text-gray-500">on May 18, 2025</span>
                </div>
              </div>
            </div>
          </div>
          
          <Button 
            variant="secondary" 
            className="bg-gray-100 text-gray-700 hover:bg-gray-200"
            data-testid="button-reactivate"
          >
            Reactivate
          </Button>
        </div>

        {/* Purchases */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-6">Purchases</h2>
          
          <div className="text-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-200 to-pink-200 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
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
            
            <h3 className="text-lg font-medium text-gray-900 mb-2 underline">The Mama Summit</h3>
            <span className="inline-block px-3 py-1 text-sm font-medium text-gray-700 border border-gray-300 rounded-full">
              BUNDLE
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-200 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side navigation */}
            <div className="flex items-center">
              {/* Hamburger Menu Button */}
              <button 
                className="p-3 relative transition-all duration-300 md:hover:scale-110 md:hover:rotate-12 active:scale-95 group touch-manipulation"
                data-testid="button-hamburger-menu"
                aria-label={showProfileSettings ? "Close menu" : "Open menu"}
                onClick={() => setShowProfileSettings(!showProfileSettings)}
              >
                <div className="relative w-6 h-6 flex items-center justify-center">
                  <div className={`absolute transition-all duration-300 transform md:group-hover:scale-110 ${
                    showProfileSettings ? 'rotate-45 translate-y-0' : 'rotate-0 -translate-y-2'
                  }`}>
                    <div className="w-6 h-0.5 bg-gradient-to-r from-rose-400 via-pink-500 to-pink-600 rounded shadow-sm md:group-hover:shadow-md md:group-hover:shadow-pink-200"></div>
                  </div>
                  <div className={`absolute transition-all duration-300 md:group-hover:scale-110 ${
                    showProfileSettings ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
                  }`}>
                    <div className="w-6 h-0.5 bg-gradient-to-r from-rose-400 via-pink-500 to-pink-600 rounded shadow-sm md:group-hover:shadow-md md:group-hover:shadow-pink-200"></div>
                  </div>
                  <div className={`absolute transition-all duration-300 transform md:group-hover:scale-110 ${
                    showProfileSettings ? '-rotate-45 translate-y-0' : 'rotate-0 translate-y-2'
                  }`}>
                    <div className="w-6 h-0.5 bg-gradient-to-r from-rose-400 via-pink-500 to-pink-600 rounded shadow-sm md:group-hover:shadow-md md:group-hover:shadow-pink-200"></div>
                  </div>
                </div>
                
                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-rose-400/20 via-pink-500/20 to-pink-600/20 opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 blur-md"></div>
              </button>
            </div>
            
            {/* Centered Logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <Link to="/dashboard">
                <img 
                  src="/assets/logo.png" 
                  alt="Studio Bloom" 
                  className="h-12 w-auto cursor-pointer hover:opacity-80 transition-opacity duration-200"
                />
              </Link>
            </div>
            
            {/* Right side - Daily Check-in Button */}
            <div className="flex items-center">
              <button 
                className="p-2 sm:p-3 relative transition-all duration-300 md:hover:scale-110 active:scale-95 group touch-manipulation"
                data-testid="button-daily-checkin"
                aria-label="Daily check-in"
                onClick={() => setShowCheckinModal(true)}
                title="Daily Check-in"
              >
                <div className="relative">
                  <ClipboardCheck className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500 md:group-hover:text-pink-600 transition-colors" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse" />
                </div>
                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-rose-400/20 via-pink-500/20 to-pink-600/20 opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 blur-md"></div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notifications Dialog */}
      <Dialog open={showNotificationsDialog} onOpenChange={setShowNotificationsDialog}>
        <DialogContent className="sm:max-w-md" data-testid="dialog-notifications">
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
            <DialogDescription>
              View and manage your notifications and updates.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div key={notification.id} className="p-4 border rounded-lg">
                  <h4 className="font-medium">{notification.title}</h4>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No new notifications</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Purchases Dialog */}
      <Dialog open={showPurchasesDialog} onOpenChange={setShowPurchasesDialog}>
        <DialogContent className="sm:max-w-2xl" data-testid="dialog-purchases">
          <DialogHeader>
            <DialogTitle>Purchases & payments</DialogTitle>
            <DialogDescription>
              Manage your subscription, payment methods, and purchase history.
            </DialogDescription>
          </DialogHeader>
          <PurchasesContent />
        </DialogContent>
      </Dialog>


      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section - Auto-hides after 3 seconds */}
        {showWelcomeMessage && (
          <div className="mb-6 animate-in fade-in duration-300" style={{
            animation: showWelcomeMessage ? 'fadeIn 0.3s ease-in' : 'fadeOut 0.5s ease-out forwards'
          }}>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              Welcome back, {user.firstName}! 💪
            </h1>
            <p className="text-sm text-muted-foreground">Ready to get stronger today?</p>
          </div>
        )}

        {/* Profile Completion Banner */}
        <ProfileBanner 
          onCompleteProfile={() => {
            setShowProfileSettings(true);
            // Use a small delay to ensure the hamburger menu is open before switching to profile view
            setTimeout(() => {
              setCurrentView('profile');
            }, 100);
          }}
          context={{
            location: 'dashboard',
            isFirstLogin: isFirstLogin,
            hasCompletedWorkout: stats.completedWorkouts > 0,
            sessionStartTime: Date.now()
          }}
          className="mb-8"
        />

        {/* Today's Workout Card - Main workout experience */}
        {memberPrograms.length > 0 && (
          <section className="mb-8">
            <TodaysWorkout 
              userId={user.id}
              isFirstLogin={isFirstLogin && stats.completedWorkouts === 0}
              onStartWorkout={(weekNumber) => {
                setLocation(`/heal-your-core?week=${weekNumber}`);
              }}
            />
          </section>
        )}

        {/* Program Access Card - Simplified since already purchased */}
        {memberPrograms.length > 0 && (
          <section className="mb-8">
            <button
              onClick={() => setLocation('/heal-your-core')}
              className="w-full p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200 hover:border-pink-300 transition-all hover:shadow-md flex items-center justify-between group"
              data-testid="button-view-full-program"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                  <Play className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-800">View Full Program</h3>
                  <p className="text-sm text-gray-500">Browse all 6 weeks, nutrition guide, and more</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-pink-500 transition-colors" />
            </button>
          </section>
        )}

        {/* No Programs Message */}
        {memberPrograms.length === 0 && (
          <section className="mb-8">
            <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-2xl p-8 shadow-lg border border-pink-200 text-center">
              <p className="text-gray-500 text-lg">No programs assigned yet.</p>
              <p className="text-gray-400 text-sm mt-2">Your admin will enroll you in programs soon.</p>
            </div>
          </section>
        )}
      </main>

      {/* Community Modal */}
      {showCommunity && (
        <CommunityModal
          userId={user.id}
          onClose={() => setShowCommunity(false)}
        />
      )}


      {/* Hamburger Menu Overlay */}
      {showProfileSettings && (
        <ProfileSettings
          isOpen={true}
          onClose={() => {
            setShowProfileSettings(false);
            setCurrentView('menu'); // Reset to menu when closing
          }}
          user={user}
          onUserUpdate={setUser}
          initialView={currentView}
        />
      )}

      {/* Check-in Modal */}
      {showCheckinModal && (
        <CheckinModal
          isOpen={showCheckinModal}
          onClose={() => setShowCheckinModal(false)}
          onSkip={() => setShowCheckinModal(false)}
          userId={user.id}
          existingDeliveryDate={user.deliveryDate}
        />
      )}

      {/* Floating Check-in Button */}
      <button
        onClick={() => setShowCheckinModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group z-40 hover:scale-110"
        aria-label="Log a check-in"
        data-testid="button-open-checkin"
      >
        <ClipboardCheck className="w-6 h-6 text-white" />
        <span className="absolute right-full mr-3 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Log Check-in
        </span>
      </button>
    </div>
  );
}
