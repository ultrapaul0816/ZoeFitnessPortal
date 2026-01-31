import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dumbbell,
  Wind,
  Droplets,
  Footprints,
  Flame,
  Share2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Calendar,
  Pencil,
  Users,
  Loader2,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import DailyCheckinModal from "./daily-checkin-modal";
import type { DailyCheckin } from "@shared/schema";

interface WeeklySummaryData {
  weekStart: string;
  checkins: Array<{
    id: string;
    date: string;
    workoutCompleted: boolean;
    breathingPractice: boolean;
    waterGlasses: number;
    cardioMinutes: number;
    mood?: string | null;
    energyLevel?: number | null;
  }>;
  stats: {
    totalCheckins: number;
    workoutDays: number;
    breathingDays: number;
    avgWaterGlasses: number;
    avgCardioMinutes: number;
    currentStreak: number;
    moodDistribution?: { mood: string; count: number; emoji: string }[];
    avgEnergyLevel?: number;
    energyTrend?: 'up' | 'down' | 'stable';
    recentMoods?: { date: string; mood: string | null; energyLevel: number | null }[];
  };
  programWeek: number;
  shareMessage: string;
  whatsappUrl: string;
}

interface WeeklySummaryProps {
  compact?: boolean;
  userId?: string;
}

export default function WeeklySummary({ compact = false, userId: propUserId }: WeeklySummaryProps) {
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  // Get userId from prop or localStorage
  const userId = propUserId || (() => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        return JSON.parse(userData).id;
      }
    } catch {}
    return null;
  })();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCollapsed(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const { data: summary, isLoading } = useQuery<WeeklySummaryData>({
    queryKey: ["/api/daily-checkins", userId, "weekly-summary"],
    enabled: !!userId,
  });

  const { data: todayCheckin } = useQuery<DailyCheckin | null>({
    queryKey: ["/api/daily-checkins", userId, "today"],
    enabled: !!userId,
  });

  const hasCheckedInToday = !!todayCheckin;

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-100">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-pink-100 rounded w-1/3"></div>
            <div className="h-20 bg-pink-100 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = summary?.stats || {
    totalCheckins: 0,
    workoutDays: 0,
    breathingDays: 0,
    avgWaterGlasses: 0,
    avgCardioMinutes: 0,
    currentStreak: 0,
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Milestone messages based on streak
  const getStreakMessage = (streak: number) => {
    if (streak >= 30) return { emoji: "🏆", message: "30 days strong! You're unstoppable!", milestone: true };
    if (streak >= 14) return { emoji: "⭐", message: "2 weeks of consistency! Amazing!", milestone: true };
    if (streak >= 7) return { emoji: "🔥", message: "1 week streak! Keep it up!", milestone: true };
    if (streak >= 3) return { emoji: "💪", message: "Building momentum!", milestone: false };
    if (streak >= 1) return { emoji: "🌱", message: "Great start! Every day counts", milestone: false };
    return { emoji: "✨", message: "Start your streak today!", milestone: false };
  };
  
  const streakInfo = getStreakMessage(stats.currentStreak);
  
  const getCheckinForDay = (dayIndex: number) => {
    if (!summary?.checkins) return null;
    const weekStart = new Date(summary.weekStart);
    const targetDate = new Date(weekStart);
    targetDate.setDate(weekStart.getDate() + dayIndex);
    
    return summary.checkins.find(c => {
      const checkinDate = new Date(c.date);
      return checkinDate.toDateString() === targetDate.toDateString();
    });
  };

  const handleShareToCommunity = async () => {
    if (!userId || !summary) return;
    
    setIsSharing(true);
    
    try {
      // Build a nice progress message for the community
      const progressMessage = `
🌟 My Weekly Progress Update!

💪 ${stats.workoutDays} workout days this week
🌬️ ${stats.breathingDays} days of breathing practice  
💧 Averaging ${stats.avgWaterGlasses} glasses of water
🏃 ${stats.avgCardioMinutes} min cardio on average
🔥 ${stats.currentStreak} day streak!

Week ${summary.programWeek} of my Heal Your Core journey. Every day counts! 💕
      `.trim();
      
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('content', progressMessage);
      formData.append('category', 'progress');
      formData.append('weekNumber', String(summary.programWeek || 1));
      
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to share');
      }
      
      toast({
        title: "Shared to Community! 🎉",
        description: "Your progress has been posted. Other mamas can now celebrate with you!",
      });
      
      // Invalidate community posts cache
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sharing failed",
        description: "Please try again in a moment.",
      });
    } finally {
      setIsSharing(false);
    }
  };

  if (compact) {
    return (
      <>
        <Card 
          className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-100 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setShowCheckinModal(true)}
          data-testid="card-daily-checkin-compact"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Daily Check-in</h3>
                  <p className="text-sm text-gray-500">
                    {stats.currentStreak > 0 
                      ? `${stats.currentStreak} day streak! 🔥` 
                      : "Track your progress today"}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <DailyCheckinModal 
          isOpen={showCheckinModal} 
          onClose={() => setShowCheckinModal(false)} 
        />
      </>
    );
  }

  return (
    <>
      <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-100">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div 
              className="flex-1 cursor-pointer" 
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <CardTitle className="flex items-center gap-2 text-xl">
                <TrendingUp className="h-5 w-5 text-pink-500" />
                Week {summary?.programWeek || 1} Progress
                <button 
                  className="ml-2 p-1 rounded-full hover:bg-pink-100 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCollapsed(!isCollapsed);
                  }}
                  data-testid="button-toggle-progress"
                >
                  {isCollapsed ? (
                    <ChevronDown className="h-4 w-4 text-pink-500" />
                  ) : (
                    <ChevronUp className="h-4 w-4 text-pink-500" />
                  )}
                </button>
              </CardTitle>
              {!isCollapsed && (
                <CardDescription>Your wellness journey this week</CardDescription>
              )}
            </div>
            <Button
              variant={hasCheckedInToday ? "outline" : "default"}
              size="sm"
              onClick={() => setShowCheckinModal(true)}
              className={hasCheckedInToday 
                ? "border-pink-200 hover:bg-pink-100" 
                : "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
              }
              data-testid="button-checkin"
            >
              {hasCheckedInToday ? (
                <>
                  <Pencil className="h-4 w-4 mr-2" />
                  Update Today's Log
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Log Today's Progress
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        {!isCollapsed && (
          <CardContent className="space-y-6">
            {/* Streak Display with Milestone Celebration */}
            <div className={`p-4 rounded-xl text-center ${
              streakInfo.milestone 
                ? 'bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-100 border-2 border-amber-300 animate-pulse' 
                : 'bg-white/50'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-3xl">{streakInfo.emoji}</span>
                <span className="text-3xl font-bold text-gray-900">{stats.currentStreak}</span>
                <span className="text-gray-600 text-lg">day streak</span>
              </div>
              <p className={`text-sm ${streakInfo.milestone ? 'text-amber-700 font-semibold' : 'text-gray-500'}`}>
                {streakInfo.message}
              </p>
            </div>

            <div className="flex justify-between gap-1">
              {weekDays.map((day, index) => {
                const checkin = getCheckinForDay(index);
                const hasActivity = checkin && (
                  checkin.workoutCompleted || 
                  checkin.breathingPractice || 
                  (checkin.waterGlasses && checkin.waterGlasses > 0) ||
                  (checkin.cardioMinutes && checkin.cardioMinutes > 0)
                );
                const today = new Date().getDay();
                const adjustedToday = today === 0 ? 6 : today - 1;
                const isToday = index === adjustedToday;
                
                return (
                  <div 
                    key={day}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg flex-1 ${
                      isToday ? 'bg-pink-100 border border-pink-200' : ''
                    }`}
                  >
                    <span className={`text-xs font-medium ${isToday ? 'text-pink-600' : 'text-gray-500'}`}>
                      {day}
                    </span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      hasActivity 
                        ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {hasActivity ? '✓' : '·'}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={<Dumbbell className="h-4 w-4" />}
                label="Workouts"
                value={`${stats.workoutDays}/7`}
                progress={(stats.workoutDays / 7) * 100}
                color="pink"
              />
              <StatCard
                icon={<Wind className="h-4 w-4" />}
                label="Breathing"
                value={`${stats.breathingDays}/7`}
                progress={(stats.breathingDays / 7) * 100}
                color="blue"
              />
              <StatCard
                icon={<Droplets className="h-4 w-4" />}
                label="Avg Water"
                value={`${stats.avgWaterGlasses}`}
                subLabel="glasses/day"
                progress={Math.min((stats.avgWaterGlasses / 8) * 100, 100)}
                color="cyan"
              />
              <StatCard
                icon={<Footprints className="h-4 w-4" />}
                label="Avg Cardio"
                value={`${stats.avgCardioMinutes}`}
                subLabel="min/day"
                progress={Math.min((stats.avgCardioMinutes / 30) * 100, 100)}
                color="orange"
              />
            </div>

            <Button
              onClick={handleShareToCommunity}
              disabled={isSharing}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
              data-testid="button-share-community"
            >
              {isSharing ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Users className="h-5 w-5 mr-2" />
              )}
              {isSharing ? "Sharing..." : "Share to Community"}
            </Button>
          </CardContent>
        )}
      </Card>

      <DailyCheckinModal 
        isOpen={showCheckinModal} 
        onClose={() => setShowCheckinModal(false)} 
      />
    </>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  subLabel,
  progress, 
  color 
}: { 
  icon: React.ReactNode;
  label: string;
  value: string;
  subLabel?: string;
  progress: number;
  color: 'pink' | 'blue' | 'cyan' | 'orange';
}) {
  const colorClasses = {
    pink: {
      bg: 'bg-pink-50',
      icon: 'bg-pink-100 text-pink-600',
      progress: 'bg-pink-500',
    },
    blue: {
      bg: 'bg-blue-50',
      icon: 'bg-blue-100 text-blue-600',
      progress: 'bg-blue-500',
    },
    cyan: {
      bg: 'bg-cyan-50',
      icon: 'bg-cyan-100 text-cyan-600',
      progress: 'bg-cyan-500',
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'bg-orange-100 text-orange-600',
      progress: 'bg-orange-500',
    },
  };

  const classes = colorClasses[color];

  return (
    <div className={`p-3 rounded-xl ${classes.bg}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-lg ${classes.icon}`}>
          {icon}
        </div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-xl font-bold text-gray-900">{value}</span>
        {subLabel && <span className="text-xs text-gray-500">{subLabel}</span>}
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all ${classes.progress}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}
