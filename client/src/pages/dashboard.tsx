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
import type { MemberProgram, Program, Notification, User as UserType } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<UserType | null>(null);
  const [showCommunity, setShowCommunity] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
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
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-[auto_1fr_auto] items-center h-16">
            {/* Hamburger Menu */}
            <div className="justify-self-start">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowHamburgerMenu(!showHamburgerMenu)}
                data-testid="button-hamburger"
                className="w-9 h-9 md:w-10 md:h-10"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Centered Logo */}
            <div className="justify-self-center">
              <div className="w-16 h-12 md:w-20 md:h-14 flex items-center justify-center">
                <img 
                  src="/assets/logo.png" 
                  alt="Stronger With Zoe" 
                  className="h-10 w-auto md:h-12 object-contain"
                />
              </div>
            </div>
            
            {/* Right side navigation */}
            <div className="flex items-center gap-3 md:gap-6 justify-self-end">
              {/* Profile */}
              <button 
                className="flex items-center space-x-2 md:space-x-3 px-2 py-1.5 md:px-3 md:py-2 rounded-lg hover:bg-muted/50 transition-colors"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                data-testid="button-profile"
              >
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </span>
                </div>
                <span className="text-sm font-medium text-foreground hidden sm:block">
                  {user.firstName} {user.lastName}
                </span>
              </button>
              
              {/* Admin Button */}
              {user.isAdmin && (
                <Button
                  variant="secondary"
                  onClick={() => setLocation("/admin")}
                  data-testid="button-admin"
                  className="h-9 md:h-10 px-3 md:px-4"
                >
                  Admin
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hamburger Menu Dropdown */}
      {showHamburgerMenu && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/20" onClick={() => setShowHamburgerMenu(false)} />
          <div className="absolute left-4 top-20 bg-card border border-border rounded-lg shadow-lg w-64 p-4 z-60">
            <div className="space-y-4">
              {/* Notifications Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-1 text-xs bg-destructive text-destructive-foreground rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No notifications</p>
                  ) : (
                    notifications.slice(0, 3).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-2 rounded-md text-xs ${
                          !notification.isRead ? 'bg-primary/10' : 'bg-muted/50'
                        }`}
                      >
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-muted-foreground">{notification.message}</p>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 3 && (
                  <button 
                    className="text-xs text-primary hover:underline mt-2"
                    onClick={() => setShowNotifications(true)}
                  >
                    View all notifications
                  </button>
                )}
              </div>

              <hr className="border-border" />

              {/* Community Section */}
              <div>
                <button
                  className="flex items-center space-x-3 w-full p-2 rounded-md hover:bg-muted/50 transition-colors text-left"
                  onClick={() => {
                    setShowCommunity(true);
                    setShowHamburgerMenu(false);
                  }}
                  data-testid="hamburger-community"
                >
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Community</span>
                </button>
                <p className="text-xs text-muted-foreground mt-1 ml-7">
                  Connect with other members and share your journey
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileMenu && user && (
        <ProfileModal
          isOpen={showProfileMenu}
          onClose={() => setShowProfileMenu(false)}
          user={user}
          onUserUpdate={(updatedUser) => setUser(updatedUser)}
        />
      )}

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
