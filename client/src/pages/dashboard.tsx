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
            {/* Logo */}
            <div className="flex-shrink-0">
              <img 
                src="/assets/logo.png" 
                alt="Studio Bloom" 
                className="h-12 w-auto"
              />
            </div>
            
            {/* Right side navigation */}
            <div className="flex items-center space-x-3">
              {/* Notification Bell */}
              <button 
                className="p-3 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-colors relative"
                data-testid="button-notifications"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Profile Avatar */}
              <button 
                className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-700 font-medium text-sm hover:bg-pink-200 transition-colors"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                data-testid="button-profile-avatar"
              >
                {user.firstName?.[0]}{user.lastName?.[0]}
              </button>

              {/* Hamburger Menu */}
              <button 
                className="p-3 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-colors"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                data-testid="button-hamburger-menu"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Menu Dropdown */}
      {showProfileMenu && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0" onClick={() => setShowProfileMenu(false)} />
          <div className="absolute right-0 top-16 h-[calc(100vh-4rem)] w-80 bg-white shadow-xl z-60 overflow-y-auto">
            {/* Header Section */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img 
                    src="/assets/logo.png" 
                    alt="Studio Bloom" 
                    className="h-6 w-auto"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    data-testid="button-notifications-menu"
                  >
                    <Bell className="w-4 h-4 text-gray-600" />
                  </button>
                  <button 
                    className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-medium text-sm"
                    data-testid="profile-avatar-header"
                  >
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </button>
                  <button 
                    onClick={() => setShowProfileMenu(false)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    data-testid="button-close-profile-menu"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* User Info */}
              <button
                onClick={() => {
                  setShowProfileSettings(true);
                  setShowProfileMenu(false);
                }}
                className="flex items-center space-x-3 py-3 border-b border-gray-100 w-full text-left hover:bg-gray-50 transition-colors"
                data-testid="button-open-profile-settings"
              >
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-medium">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {user.email}
                  </p>
                </div>
              </button>
            </div>

            {/* Menu Content */}
            <div className="p-6">
              {/* My Library Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-600 mb-4 border-b border-gray-100 pb-2">
                  My Library
                </h3>
                <nav className="space-y-2">
                  <button
                    onClick={() => {
                      setLocation("/my-library");
                      setShowProfileMenu(false);
                    }}
                    className="block w-full text-left px-0 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                    data-testid="menu-my-library"
                  >
                    My Library
                  </button>
                  <button
                    onClick={() => {
                      setShowCommunity(true);
                      setShowProfileMenu(false);
                    }}
                    className="block w-full text-left px-0 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                    data-testid="menu-community"
                  >
                    Community
                  </button>
                  <button
                    className="block w-full text-left px-0 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                    data-testid="menu-email-notifications"
                  >
                    Email notifications
                  </button>
                  <button
                    className="block w-full text-left px-0 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                    data-testid="menu-purchases"
                  >
                    Purchases & payments
                  </button>
                  <button
                    onClick={() => {
                      localStorage.removeItem("user");
                      setLocation("/");
                    }}
                    className="block w-full text-left px-0 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                    data-testid="menu-sign-out"
                  >
                    Sign out
                  </button>
                </nav>
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
