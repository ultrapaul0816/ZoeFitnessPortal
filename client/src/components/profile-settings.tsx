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
import { ChevronDown, Info, Globe } from "lucide-react";
import type { User as UserType } from "@shared/schema";

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onUserUpdate: (user: UserType) => void;
}

export default function ProfileSettings({ isOpen, onClose, user, onUserUpdate }: ProfileSettingsProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const [showDangerZone, setShowDangerZone] = useState(false);
  
  const [profileData, setProfileData] = useState({
    fullName: `${user.firstName} ${user.lastName}`,
    email: user.email,
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

  const handleSaveChanges = () => {
    // Here you would typically save to backend
    console.log("Saving profile changes:", profileData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gray-50">
      <div className="h-full overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                data-testid="button-close-profile-settings"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-6">
            <nav className="flex space-x-8">
              {[
                { id: "profile", name: "Profile" },
                { id: "purchases", name: "Purchases" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-pink-500 text-pink-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  data-testid={`tab-${tab.id}`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
          {activeTab === "profile" && (
            <>
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
            </>
          )}

          {/* Other tab contents would go here */}
          {activeTab === "purchases" && (
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
                    <div className="w-24 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      <img 
                        src="/assets/workout-image.png" 
                        alt="Workout" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = '<svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
                        }}
                      />
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
                    <div className="w-24 h-24 bg-gradient-to-br from-orange-200 to-pink-200 rounded-full flex items-center justify-center overflow-hidden">
                      <img 
                        src="/assets/mama-summit.png" 
                        alt="The Mama Summit" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = '<svg class="w-12 h-12 text-orange-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
                        }}
                      />
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
          )}

        </div>
      </div>
    </div>
  );
}