import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, Globe, BookOpen, CreditCard, User, LogOut, ChevronRight, ArrowRight, ArrowLeft, Mail, HelpCircle, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import type { User as UserType } from "@shared/schema";

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onUserUpdate: (user: UserType) => void;
  initialView?: 'menu' | 'profile' | 'purchases' | 'support';
}

interface SimpleProfileData {
  photo: string;
  fullName: string;
  email: string;
}

export default function ProfileSettings({ isOpen, onClose, user, onUserUpdate, initialView = 'menu' }: ProfileSettingsProps) {
  const [location, setLocation] = useLocation();
  const [currentView, setCurrentView] = useState<'menu' | 'profile' | 'purchases' | 'support'>(initialView);
  const { toast } = useToast();
  
  // Fetch user's purchased programs
  const { data: memberPrograms = [], isLoading: isLoadingPrograms } = useQuery<any[]>({
    queryKey: ['/api/member-programs', user.id],
    enabled: !!user.id && currentView === 'purchases',
  });
  
  const [profileData, setProfileData] = useState<SimpleProfileData>({
    photo: '',
    fullName: '',
    email: ''
  });

  const [selectedPhoto, setSelectedPhoto] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved profile data
  useEffect(() => {
    const savedData = localStorage.getItem('profileData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setProfileData({
          photo: parsed.photo || '',
          fullName: parsed.fullName || user.firstName + ' ' + user.lastName || '',
          email: parsed.email || user.email || ''
        });
        if (parsed.photo) {
          setSelectedPhoto(parsed.photo);
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
      }
    } else {
      // Initialize with user data
      setProfileData({
        photo: '',
        fullName: user.firstName + ' ' + user.lastName || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedPhoto(result);
        setProfileData(prev => ({...prev, photo: result}));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleSaveProfile = () => {
    try {
      // Save to localStorage
      localStorage.setItem('profileData', JSON.stringify(profileData));
      
      toast({
        title: "Profile saved!",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error saving profile",
        description: "There was an error saving your profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  if (!isOpen) return null;

  const getInitials = (firstName?: string, lastName?: string) => {
    return ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase() || 'U';
  };

  if (currentView === 'profile') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
        <div className="relative bg-white w-full max-w-lg mx-4 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <button onClick={() => setCurrentView('menu')} className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Profile Settings</h1>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                ×
              </button>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6 pb-20">
            {/* Simple Profile Section */}
            <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>

              {/* Photo Upload */}
              <div className="flex items-center space-x-4 mb-6">
                {selectedPhoto ? (
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
                    <img 
                      src={selectedPhoto} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 text-2xl font-medium">
                    {getInitials(user.firstName, user.lastName)}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  data-testid="input-profile-photo"
                />
                <Button 
                  variant="outline" 
                  onClick={handlePhotoClick}
                  data-testid="button-change-photo"
                >
                  Change Photo
                </Button>
              </div>

              {/* Full Name */}
              <div className="space-y-2 mb-4">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={profileData.fullName || ''}
                  onChange={(e) => setProfileData(prev => ({...prev, fullName: e.target.value}))}
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email || ''}
                  onChange={(e) => setProfileData(prev => ({...prev, email: e.target.value}))}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Secure sign in */}
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
      </div>
    );
  }

  if (currentView === 'purchases') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
        <div className="relative bg-white w-full max-w-lg mx-4 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <button onClick={() => setCurrentView('menu')} className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">My Purchases</h1>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                ×
              </button>
            </div>
          </div>

          {/* Purchases Content */}
          <div className="p-6 pb-20">
            {isLoadingPrograms ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
              </div>
            ) : memberPrograms.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No purchases yet</h3>
                <p className="text-gray-600">Your purchased programs will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {memberPrograms.map((program) => (
                  <div key={program.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h3 className="font-medium text-gray-900">{program.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">Purchased on {new Date(program.enrolledAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'support') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
        <div className="relative bg-white w-full max-w-lg mx-4 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <button onClick={() => setCurrentView('menu')} className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Support & Help</h1>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                ×
              </button>
            </div>
          </div>

          {/* Support Content */}
          <div className="p-6 pb-20">
            <div className="space-y-4">
              {/* Email Support */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Mail className="w-5 h-5 text-pink-500" />
                  <h3 className="font-medium text-gray-900">Email Support</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">Get help via email - we typically respond within 24 hours.</p>
                <a
                  href="mailto:support@yourpostnatalstrength.com"
                  className="inline-flex items-center text-pink-600 hover:text-pink-700 text-sm font-medium"
                >
                  support@yourpostnatalstrength.com
                  <ArrowRight className="w-4 h-4 ml-1" />
                </a>
              </div>

              {/* WhatsApp Community */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Globe className="w-5 h-5 text-green-500" />
                  <h3 className="font-medium text-gray-900">WhatsApp Community</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">Join our supportive community for tips, motivation, and quick help.</p>
                <button className="inline-flex items-center text-green-600 hover:text-green-700 text-sm font-medium">
                  Join Community
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>

              {/* FAQ */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <HelpCircle className="w-5 h-5 text-blue-500" />
                  <h3 className="font-medium text-gray-900">Frequently Asked Questions</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">Find answers to common questions about the program.</p>
                <button className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View FAQ
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main menu view
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-end">
      <div className="relative bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 w-full max-w-sm h-full shadow-2xl overflow-y-auto animate-slide-in-right">
        {/* Header with close button and profile info */}
        <div className="sticky top-0 bg-gradient-to-r from-pink-100 to-rose-100 border-b border-pink-200 px-6 py-6 z-10 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {selectedPhoto ? (
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-pink-300 shadow-md">
                  <img 
                    src={selectedPhoto} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 flex items-center justify-center text-white text-lg font-bold shadow-md">
                  {getInitials(user.firstName, user.lastName)}
                </div>
              )}
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-gray-600 hover:text-gray-900 shadow-sm transition-all duration-200"
            >
              ×
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <div className="px-6 py-8 space-y-6">
          {/* Profile */}
          <div className="flex justify-start">
            <button 
              className="relative inline-flex items-center space-x-3 hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 hover:shadow-lg hover:shadow-pink-200/50 hover:border hover:border-pink-300 border border-transparent transition-all duration-300 group py-3 pl-3 pr-4 rounded-2xl animate-in scale-in-95 fade-in duration-400 overflow-hidden"
              style={{ animationDelay: '100ms' }}
              onClick={() => setCurrentView('profile')}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-400 opacity-0 group-hover:opacity-10 group-hover:animate-in group-hover:slide-in-from-top-2 transition-all duration-300 rounded-2xl"></div>
              <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-pink-300 relative z-10">
                <User className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="text-base font-medium text-gray-900 group-hover:text-pink-600 group-hover:translate-x-2 transition-all duration-300 relative z-10">Profile</span>
              <div className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-300 ml-2">
                <ChevronRight className="w-4 h-4 text-pink-500" />
              </div>
            </button>
          </div>

          {/* My Purchases */}
          <div className="flex justify-start">
            <button 
              className="relative inline-flex items-center space-x-3 hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 hover:shadow-lg hover:shadow-pink-200/50 hover:border hover:border-pink-300 border border-transparent transition-all duration-300 group py-3 pl-3 pr-4 rounded-2xl animate-in scale-in-95 fade-in duration-400 overflow-hidden"
              style={{ animationDelay: '200ms' }}
              onClick={() => setCurrentView('purchases')}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-400 opacity-0 group-hover:opacity-10 group-hover:animate-in group-hover:slide-in-from-top-2 transition-all duration-300 rounded-2xl"></div>
              <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-pink-300 relative z-10">
                <CreditCard className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="text-base font-medium text-gray-900 group-hover:text-pink-600 group-hover:translate-x-2 transition-all duration-300 relative z-10">My Purchases</span>
              <div className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-300 ml-2">
                <ChevronRight className="w-4 h-4 text-pink-500" />
              </div>
            </button>
          </div>

          {/* Support & Help */}
          <div className="flex justify-start">
            <button 
              className="relative inline-flex items-center space-x-3 hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 hover:shadow-lg hover:shadow-pink-200/50 hover:border hover:border-pink-300 border border-transparent transition-all duration-300 group py-3 pl-3 pr-4 rounded-2xl animate-in scale-in-95 fade-in duration-400 overflow-hidden"
              style={{ animationDelay: '300ms' }}
              onClick={() => setCurrentView('support')}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-400 opacity-0 group-hover:opacity-10 group-hover:animate-in group-hover:slide-in-from-top-2 transition-all duration-300 rounded-2xl"></div>
              <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-pink-300 relative z-10">
                <HelpCircle className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="text-base font-medium text-gray-900 group-hover:text-pink-600 group-hover:translate-x-2 transition-all duration-300 relative z-10">Support & Help</span>
              <div className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-300 ml-2">
                <ChevronRight className="w-4 h-4 text-pink-500" />
              </div>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center">
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

        {/* Click outside area to close */}
        <div 
          className="absolute inset-0 -z-10" 
          onClick={onClose}
        ></div>
      </div>
    </div>
  );
}