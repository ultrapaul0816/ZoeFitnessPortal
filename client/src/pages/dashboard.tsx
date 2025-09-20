import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Users, User, Settings, CheckCircle, Flame, Calendar } from "lucide-react";
import ProgramCard from "@/components/program-card";
import PremiumProgramCard from "@/components/premium-program-card";
import CommunityModal from "@/components/community-modal";
import NotificationsDropdown from "@/components/notifications-dropdown";
import type { MemberProgram, Program, Notification } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [showCommunity, setShowCommunity] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

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
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center justify-center">
              <div className="w-20 h-14 flex items-center justify-center">
                <img 
                  src="/assets/logo.png" 
                  alt="Stronger With Zoe" 
                  className="h-12 w-auto object-contain"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNotifications(!showNotifications)}
                  data-testid="button-notifications"
                  className="w-10 h-10"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full notification-pulse" />
                  )}
                </Button>
                {showNotifications && (
                  <NotificationsDropdown
                    notifications={notifications}
                    onClose={() => setShowNotifications(false)}
                  />
                )}
              </div>
              
              {/* Community */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCommunity(true)}
                data-testid="button-community"
                className="w-10 h-10"
              >
                <Users className="w-5 h-5" />
              </Button>
              
              {/* Profile */}
              <div className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </span>
                </div>
                <span className="text-sm font-medium text-foreground hidden sm:block">
                  {user.firstName} {user.lastName}
                </span>
              </div>
              
              {/* Admin Button */}
              {user.isAdmin && (
                <Button
                  variant="secondary"
                  onClick={() => setLocation("/admin")}
                  data-testid="button-admin"
                  className="h-10 px-4"
                >
                  Admin
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

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
