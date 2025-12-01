import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface WorkoutSessionProgress {
  currentWeek: number;
  workoutsCompletedThisWeek: number;
  cardioCompletedThisWeek: number;
  totalWorkoutsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string | null;
  weeklyProgress: Array<{
    week: number;
    workoutsCompleted: number;
    cardioCompleted: number;
    isComplete: boolean;
    isSkipped: boolean;
  }>;
}

export interface WeeklyWorkoutSession {
  id: string;
  userId: string;
  week: number;
  sessionType: 'workout' | 'cardio';
  sessionNumber: number;
  completedAt: string;
  rating: number | null;
  notes: string | null;
}

export function useWorkoutSessionProgress() {
  return useQuery<WorkoutSessionProgress>({
    queryKey: ["/api/workout-sessions/progress"],
  });
}

export function useWeeklyWorkoutSessions(week: number) {
  return useQuery<WeeklyWorkoutSession[]>({
    queryKey: ["/api/workout-sessions/week", week],
    enabled: week >= 1 && week <= 6,
  });
}

export function useLogWorkoutSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      week: number;
      sessionType: 'workout' | 'cardio';
      sessionNumber: number;
      rating?: number | null;
      notes?: string | null;
    }) => {
      const response = await apiRequest("POST", "/api/workout-sessions", data);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-sessions/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workout-sessions/week", variables.week] });
    },
  });
}

export function useSkipWeek() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (week: number) => {
      const response = await apiRequest("POST", "/api/workout-sessions/skip-week", { week });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-sessions/progress"] });
    },
  });
}

export function getDayType(dayOfWeek: number): 'workout' | 'cardio' | 'rest' {
  switch (dayOfWeek) {
    case 0: return 'rest';      // Sunday - Rest Day
    case 1: return 'workout';   // Monday - Core Workout
    case 2: return 'cardio';    // Tuesday - Cardio Day
    case 3: return 'workout';   // Wednesday - Core Workout
    case 4: return 'cardio';    // Thursday - Cardio Day
    case 5: return 'workout';   // Friday - Core Workout
    case 6: return 'workout';   // Saturday - Core Workout
    default: return 'workout';
  }
}

export function getDayTypeLabel(dayType: 'workout' | 'cardio' | 'rest'): string {
  switch (dayType) {
    case 'workout': return 'Core Workout Day';
    case 'cardio': return 'Cardio Day';
    case 'rest': return 'Rest Day';
  }
}

export function getWeekSchedule(): { day: string; type: 'workout' | 'cardio' | 'rest'; label: string }[] {
  return [
    { day: 'Mon', type: 'workout', label: 'Core' },
    { day: 'Tue', type: 'cardio', label: 'Cardio' },
    { day: 'Wed', type: 'workout', label: 'Core' },
    { day: 'Thu', type: 'cardio', label: 'Cardio' },
    { day: 'Fri', type: 'workout', label: 'Core' },
    { day: 'Sat', type: 'workout', label: 'Core' },
    { day: 'Sun', type: 'rest', label: 'Rest' },
  ];
}
