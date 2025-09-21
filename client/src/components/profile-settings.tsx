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
import { ChevronDown, Info, Globe, Bell, BookOpen, CreditCard, User, LogOut, ChevronRight, ArrowRight } from "lucide-react";
import type { User as UserType } from "@shared/schema";

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onUserUpdate: (user: UserType) => void;
}

export default function ProfileSettings({ isOpen, onClose, user, onUserUpdate }: ProfileSettingsProps) {
  const [currentView, setCurrentView] = useState<'menu' | 'profile' | 'purchases'>('menu');
  const [profileData, setProfileData] = useState({
    country: '',
    bio: '',
    socials: '',
    fullName: `${user.firstName} ${user.lastName}`,
    email: user.email,
    dueDate: '',
    postpartumTime: '',
    timeFormat: '12 hours',
    timezone: '',
    newsUpdates: true,
    promotions: true,
    communityUpdates: true,
    transactionalEmails: false
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

  if (currentView === 'purchases') {
    return (
      <div 
        className="fixed top-16 left-0 right-0 bottom-0 z-40 bg-gray-50 animate-in slide-in-from-top-4 duration-300" 
        data-testid="page-purchases-settings"
      >
        <div className="w-full h-full overflow-y-auto p-6">
          {/* Back Button */}
          <button 
            onClick={() => setCurrentView('menu')}
            className="mb-6 text-pink-600 hover:text-pink-700 transition-colors"
          >
            ← Back to Menu
          </button>

          {/* Payment Method */}
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">Payment Method</h2>
            
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div className="w-16 h-16 bg-green-500 rounded flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
              </div>
              
              <h3 className="text-lg font-medium text-gray-700 mb-2">Link</h3>
              <p className="text-gray-600 mb-4">{user.email}</p>
              
              <Button variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                Change Payment Method
              </Button>
            </div>
          </div>

          {/* Balance */}
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Balance</h3>
              <p className="text-3xl font-bold text-gray-600 mb-6">$0.00</p>
              
              <div className="space-y-3">
                <Button variant="secondary" className="w-full bg-gray-100 text-gray-800 hover:bg-gray-200">
                  Buy a gift card
                </Button>
                <Button variant="secondary" className="w-full bg-gray-100 text-gray-800 hover:bg-gray-200">
                  Redeem a gift card
                </Button>
              </div>
            </div>
          </div>

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
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={profileData.timezone} onValueChange={(value) => setProfileData(prev => ({...prev, timezone: value}))}>
                <SelectTrigger>
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

          {/* My Notifications */}
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">My Notifications</h2>

            <div className="space-y-4">
              {/* News & Updates */}
              <div className="flex items-center space-x-3">
                <Checkbox 
                  checked={profileData.newsUpdates}
                  onCheckedChange={(checked) => setProfileData(prev => ({...prev, newsUpdates: checked as boolean}))}
                  className="w-5 h-5"
                />
                <label className="text-gray-900 font-medium">News & Updates</label>
              </div>

              {/* Promotions */}
              <div className="flex items-center space-x-3">
                <Checkbox 
                  checked={profileData.promotions}
                  onCheckedChange={(checked) => setProfileData(prev => ({...prev, promotions: checked as boolean}))}
                  className="w-5 h-5"
                />
                <label className="text-gray-900 font-medium">Promotions</label>
              </div>

              {/* Community Updates */}
              <div className="flex items-center space-x-3">
                <Checkbox 
                  checked={profileData.communityUpdates}
                  onCheckedChange={(checked) => setProfileData(prev => ({...prev, communityUpdates: checked as boolean}))}
                  className="w-5 h-5"
                />
                <label className="text-gray-900 font-medium">Community Updates</label>
              </div>

              {/* Transactional Emails */}
              <div className="flex items-center space-x-3">
                <ChevronDown className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Transactional Emails</span>
                <Info className="w-4 h-4 text-gray-400" />
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
          <Button className="w-full bg-rose-400 hover:bg-rose-500 text-white py-3 text-lg font-medium">
            Save Changes
          </Button>
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
        <div className="pl-6 pr-6 pt-6 pb-6">
          <div className="space-y-3">
            {/* Profile */}
            <button 
              className="flex items-center space-x-3 hover:bg-gray-50 transition-all duration-300 group py-3 px-2 rounded-lg w-full animate-in slide-in-from-left-4 fade-in-0 duration-500"
              style={{ animationDelay: '100ms' }}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentView('profile');
              }}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-105 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-pink-200">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-medium text-gray-900 group-hover:text-pink-600 transition-colors duration-300">Profile</span>
            </button>

            {/* My Library */}
            <button 
              className="flex items-center space-x-3 hover:bg-gray-50 transition-all duration-300 group py-3 px-2 rounded-lg w-full animate-in slide-in-from-left-4 fade-in-0 duration-500"
              style={{ animationDelay: '200ms' }}
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = "/my-library";
              }}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-105 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-pink-200">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-medium text-gray-900 group-hover:text-pink-600 transition-colors duration-300">My Library</span>
            </button>

            {/* Purchases & Payment */}
            <button 
              className="flex items-center space-x-3 hover:bg-gray-50 transition-all duration-300 group py-3 px-2 rounded-lg w-full animate-in slide-in-from-left-4 fade-in-0 duration-500"
              style={{ animationDelay: '300ms' }}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentView('purchases');
              }}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-105 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-pink-200">
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-medium text-gray-900 group-hover:text-pink-600 transition-colors duration-300">Purchases & Payment</span>
            </button>

            {/* Notifications */}
            <button 
              className="flex items-center space-x-3 hover:bg-gray-50 transition-all duration-300 group py-3 px-2 rounded-lg w-full animate-in slide-in-from-left-4 fade-in-0 duration-500"
              style={{ animationDelay: '400ms' }}
              onClick={(e) => {
                e.stopPropagation();
                // Handle notifications action
              }}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-105 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-pink-200">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-medium text-gray-900 group-hover:text-pink-600 transition-colors duration-300">Notifications</span>
            </button>

            {/* Logout */}
            <button 
              className="flex items-center space-x-3 hover:bg-gray-50 transition-all duration-300 group py-3 px-2 rounded-lg w-full animate-in slide-in-from-left-4 fade-in-0 duration-500"
              style={{ animationDelay: '500ms' }}
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-105 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-pink-200">
                <LogOut className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-medium text-gray-900 group-hover:text-pink-600 transition-colors duration-300">Logout</span>
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