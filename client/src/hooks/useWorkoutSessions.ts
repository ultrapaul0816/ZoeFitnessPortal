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
    case 0: return 'workout';
    case 1: return 'cardio';
    case 2: return 'workout';
    case 3: return 'cardio';
    case 4: return 'workout';
    case 5: return 'rest';
    case 6: return 'workout';
    default: return 'workout';
  }
}

export function getDayTypeLabel(dayType: 'workout' | 'cardio' | 'rest'): string {
  switch (dayType) {
    case 'workout': return 'Core Workout';
    case 'cardio': return 'Cardio Day';
    case 'rest': return 'Rest Day';
  }
}
