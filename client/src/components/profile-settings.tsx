import { useState } from "react";
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
import { ChevronDown, Info, Globe, Bell, BookOpen, CreditCard, User, LogOut } from "lucide-react";
import type { User as UserType } from "@shared/schema";

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onUserUpdate: (user: UserType) => void;
}

export default function ProfileSettings({ isOpen, onClose, user, onUserUpdate }: ProfileSettingsProps) {
  const [currentView, setCurrentView] = useState<'menu' | 'profile'>('menu');
  const [profileData, setProfileData] = useState({
    country: '',
    bio: '',
    socials: '',
    fullName: `${user.firstName} ${user.lastName}`,
    email: user.email,
    dueDate: '',
    postpartumTime: ''
  });

  if (!isOpen) return null;

  const handleLogout = () => {
    localStorage.removeItem("user");
    onClose();
    window.location.href = "/";
  };

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 
    'Italy', 'Spain', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Ireland', 
    'New Zealand', 'Japan', 'South Korea', 'Singapore', 'India', 'Brazil', 'Mexico'
  ];

  if (currentView === 'profile') {
    return (
      <div 
        className="fixed top-16 left-0 right-0 bottom-0 z-40 bg-gray-50 animate-in slide-in-from-top-4 duration-300" 
        data-testid="page-profile-settings"
      >
        <div className="w-full h-full overflow-y-auto p-6">
          {/* Back Button */}
          <button 
            onClick={() => setCurrentView('menu')}
            className="mb-6 text-pink-600 hover:text-pink-700 transition-colors"
          >
            ← Back to Menu
          </button>

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
              <Label htmlFor="country">Country</Label>
              <Select value={profileData.country} onValueChange={(value) => setProfileData(prev => ({...prev, country: value}))}>
                <SelectTrigger>
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
              <Label htmlFor="dueDate">If pregnant, when are you due?</Label>
              <Input
                id="dueDate"
                value={profileData.dueDate}
                onChange={(e) => setProfileData(prev => ({...prev, dueDate: e.target.value}))}
              />
            </div>

            {/* Postpartum Time */}
            <div className="space-y-2">
              <Label htmlFor="postpartumTime">If postpartum, how many weeks/months/years postpartum?</Label>
              <Input
                id="postpartumTime"
                value={profileData.postpartumTime}
                onChange={(e) => setProfileData(prev => ({...prev, postpartumTime: e.target.value}))}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed top-16 left-0 right-0 bottom-0 z-40 bg-white animate-in slide-in-from-top-4 duration-300" 
      data-testid="page-profile-settings"
    >
      <div className="w-full h-full overflow-y-auto">
        {/* Menu Items */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Profile */}
            <button 
              className="w-full flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors group"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentView('profile');
              }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <User className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-medium text-gray-900">Profile</span>
            </button>

            {/* My Library */}
            <button 
              className="w-full flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors group"
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = "/my-library";
              }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-medium text-gray-900">My Library</span>
            </button>

            {/* Purchases & Payment */}
            <button 
              className="w-full flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors group"
              onClick={(e) => {
                e.stopPropagation();
                // Handle purchases action
              }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-medium text-gray-900">Purchases & Payment</span>
            </button>

            {/* Notifications */}
            <button 
              className="w-full flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors group"
              onClick={(e) => {
                e.stopPropagation();
                // Handle notifications action
              }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-medium text-gray-900">Notifications</span>
            </button>

            {/* Logout */}
            <button 
              className="w-full flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors group"
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <LogOut className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-medium text-gray-900">Logout</span>
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