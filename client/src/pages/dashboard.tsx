import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Users, User, Settings, CheckCircle, Flame, Calendar, Menu } from "lucide-react";
import ProgramCard from "@/components/program-card";
import PremiumProgramCard from "@/components/premium-program-card";
import CommunityModal from "@/components/community-modal";
import NotificationsDropdown from "@/components/notifications-dropdown";
import ProfileModal from "@/components/profile-modal";
import ProfileSettings from "@/components/profile-settings";
import type { MemberProgram, Program, Notification, User as UserType } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<UserType | null>(null);
  const [showCommunity, setShowCommunity] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      setLocation("/");
      return;
    }
    setUser(JSON.parse(userData));
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

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side navigation */}
            <div className="flex items-center">
              {/* Hamburger Menu */}
              <button 
                className="p-3 hover:bg-gray-100 transition-colors rounded-lg"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                data-testid="button-hamburger-menu"
              >
                {showProfileMenu ? (
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <Menu className="w-6 h-6 text-gray-600" />
                )}
              </button>
            </div>
            
            {/* Centered Logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <img 
                src="/assets/logo.png" 
                alt="Studio Bloom" 
                className="h-12 w-auto"
              />
            </div>
            
            {/* Right side spacer to maintain balance */}
            <div className="flex items-center opacity-0 pointer-events-none">
              <button className="p-3 rounded-lg">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Menu Dropdown */}
      {showProfileMenu && (
        <div className={`fixed top-16 left-0 right-0 bottom-0 z-50 bg-white border-t border-gray-200 shadow-sm transform transition-all duration-700 ease-out ${
          showProfileMenu ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          {/* Content */}
          <div className="flex flex-col h-full">
            {/* User Info Section */}
            <div className="border-b border-gray-200 p-6">
              <button
                onClick={() => {
                  setShowProfileSettings(true);
                  setShowProfileMenu(false);
                }}
                className="flex items-center space-x-3 w-full text-left hover:bg-gray-50 transition-colors p-2 rounded-lg"
                data-testid="button-open-profile-settings"
              >
                <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-700 font-medium">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-base">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {user.email}
                  </p>
                </div>
              </button>
            </div>

            {/* Menu Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-4 max-w-md">
                <nav className="space-y-4">
                  <button
                    className="flex items-center space-x-3 w-full text-left text-base text-gray-700 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-50"
                    data-testid="menu-notifications"
                  >
                    <Bell className="w-4 h-4 text-gray-600" />
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowCommunity(true);
                      setShowProfileMenu(false);
                    }}
                    className="block w-full text-left text-base text-gray-700 hover:text-gray-900 transition-colors"
                    data-testid="menu-community"
                  >
                    Community
                  </button>
                  <button
                    onClick={() => {
                      setLocation("/my-library");
                      setShowProfileMenu(false);
                    }}
                    className="block w-full text-left text-base text-gray-700 hover:text-gray-900 transition-colors"
                    data-testid="menu-my-library"
                  >
                    My Library
                  </button>
                  <button
                    className="block w-full text-left text-base text-gray-700 hover:text-gray-900 transition-colors"
                    data-testid="menu-email-notifications"
                  >
                    Email notifications
                  </button>
                  <button
                    className="block w-full text-left text-base text-gray-700 hover:text-gray-900 transition-colors"
                    data-testid="menu-purchases"
                  >
                    Purchases & payments
                  </button>
                  <button
                    onClick={() => {
                      localStorage.removeItem("user");
                      setLocation("/");
                    }}
                    className="block w-full text-left text-base text-gray-700 hover:text-gray-900 transition-colors"
                    data-testid="menu-sign-out"
                  >
                    Sign out
                  </button>
                </nav>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6">
              <div className="space-y-4 max-w-md">
                <button className="block text-sm text-gray-600 hover:text-gray-800 transition-colors">
                  Get the app →
                </button>
                <div className="text-sm text-gray-500">
                  <span className="hover:text-gray-700 transition-colors cursor-pointer">Terms</span>
                  <span className="mx-2">•</span>
                  <span className="hover:text-gray-700 transition-colors cursor-pointer">Privacy</span>
                  <span className="mx-2">•</span>
                  <span className="hover:text-gray-700 transition-colors cursor-pointer">Buy gift card</span>
                  <span className="mx-2">•</span>
                  <span className="hover:text-gray-700 transition-colors cursor-pointer">Claim gift card</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Settings */}
      <ProfileSettings
        isOpen={showProfileSettings}
        onClose={() => setShowProfileSettings(false)}
        user={user}
        onUserUpdate={(updatedUser) => setUser(updatedUser)}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user.firstName}! 💪
          </h1>
          <p className="text-muted-foreground">Ready to get stronger today?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Workouts Completed</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="stat-completed">
                    {stats.completedWorkouts}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="stat-streak">
                    {stats.currentStreak}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Flame className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Programs Active</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="stat-programs">
                    {stats.activePrograms}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Your Programs Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Your Programs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memberPrograms.map((memberProgram) => (
              <ProgramCard
                key={memberProgram.id}
                memberProgram={memberProgram}
                userId={user.id}
              />
            ))}
          </div>
        </section>

        {/* Premium Programs Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Premium Programs</h2>
          <p className="text-muted-foreground mb-6">Specialized programs designed for specific fitness goals</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(allPrograms) && allPrograms
              .filter((program: any) => program.name === "Heal Your Core")
              .map((program: any) => (
                <PremiumProgramCard
                  key={program.id}
                  program={program}
                  userId={user.id}
                />
              ))}
          </div>
        </section>
      </main>

      {/* Community Modal */}
      {showCommunity && (
        <CommunityModal
          userId={user.id}
          onClose={() => setShowCommunity(false)}
        />
      )}
    </div>
  );
}
