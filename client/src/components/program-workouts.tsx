import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, CheckCircle, Clock, Target } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import WorkoutCompletionModal from "@/components/workout-completion-modal";
import CongratulationsModal from "@/components/congratulations-modal";
import type { Workout, WorkoutCompletion, Program, MemberProgram } from "@shared/schema";

interface ProgramWorkoutsProps {
  program: Program;
  memberProgram: MemberProgram;
  userId: string;
  onClose: () => void;
}

export default function ProgramWorkouts({ program, memberProgram, userId, onClose }: ProgramWorkoutsProps) {
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: workouts = [] } = useQuery<Workout[]>({
    queryKey: ["/api/workouts", program.id],
    queryFn: async () => {
      const response = await fetch(`/api/workouts/${program.id}`);
      return response.json();
    },
  });

  const { data: completions = [] } = useQuery<WorkoutCompletion[]>({
    queryKey: ["/api/workout-completions", userId],
    queryFn: async () => {
      const response = await fetch(`/api/workout-completions/${userId}`);
      return response.json();
    },
  });

  const workoutCompletionMutation = useMutation({
    mutationFn: async (completionData: any) => {
      const response = await apiRequest("POST", "/api/workouts/complete", completionData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-completions", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/member-programs", userId] });
      setShowCompletion(false);
      setShowCongratulations(true);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to complete workout. Please try again.",
      });
    },
  });

  const handleWorkoutComplete = (workout: Workout) => {
    setSelectedWorkout(workout);
    setShowCompletion(true);
  };

  const handleSubmitCompletion = (completionData: any) => {
    if (selectedWorkout) {
      workoutCompletionMutation.mutate({
        userId,
        workoutId: selectedWorkout.id,
        ...completionData,
      });
    }
  };

  const getWorkoutStatus = (workout: Workout) => {
    return completions.find(c => c.workoutId === workout.id);
  };

  const getNextWorkout = () => {
    const sortedWorkouts = workouts.sort((a, b) => a.day - b.day);
    return sortedWorkouts.find(workout => !getWorkoutStatus(workout));
  };

  const nextWorkout = getNextWorkout();

  const getWorkoutTypeFromName = (name: string) => {
    if (name.toLowerCase().includes('strength')) return 'Strength Training';
    if (name.toLowerCase().includes('cardio')) return 'Cardio';
    if (name.toLowerCase().includes('core')) return 'Core Workout';
    if (name.toLowerCase().includes('foundation')) return 'Foundation';
    if (name.toLowerCase().includes('building')) return 'Building';
    if (name.toLowerCase().includes('mastery')) return 'Mastery';
    if (name.toLowerCase().includes('hiit')) return 'HIIT';
    if (name.toLowerCase().includes('yoga')) return 'Yoga';
    if (name.toLowerCase().includes('stretch')) return 'Stretching';
    return 'Full Body Workout';
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
        <Card className="w-full max-w-4xl h-[90vh] sm:h-[80vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-foreground">{program.name}</h2>
                <p className="text-sm text-muted-foreground">
                  Progress: {memberProgram.progress}/{program.workoutCount} days completed
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                data-testid="button-close-workouts"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Workout List */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-3">
              {workouts
                .sort((a, b) => a.day - b.day)
                .map((workout) => {
                  const completion = getWorkoutStatus(workout);
                  const isCompleted = !!completion;
                  const isNext = !isCompleted && workout.id === nextWorkout?.id;
                  const workoutType = getWorkoutTypeFromName(workout.name);

                  return (
                    <Card 
                      key={workout.id} 
                      className={`transition-all ${
                        isNext 
                          ? 'border-primary bg-primary/5' 
                          : isCompleted 
                            ? 'border-green-500/50 bg-green-50/50 dark:bg-green-900/20' 
                            : 'border-muted'
                      }`}
                      data-testid={`workout-card-${workout.day}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                isCompleted 
                                  ? 'bg-green-500 text-white' 
                                  : isNext 
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground'
                              }`}>
                                {isCompleted ? <CheckCircle className="w-4 h-4" /> : workout.day}
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground">{workout.name}</h3>
                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                  <Target className="w-3 h-3" />
                                  <span>{workoutType}</span>
                                  <span>•</span>
                                  <Clock className="w-3 h-3" />
                                  <span>{workout.duration}</span>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{workout.description}</p>
                            {isCompleted && completion && (
                              <div className="mt-2 flex items-center space-x-2">
                                <Badge variant="secondary" className="text-xs">
                                  Completed {new Date(completion.completedAt!).toLocaleDateString()}
                                </Badge>
                                {completion.challengeRating && (
                                  <Badge variant="outline" className="text-xs">
                                    Challenge: {completion.challengeRating}/5
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {isNext && (
                              <Badge className="text-xs">Next Up</Badge>
                            )}
                            {!isCompleted && (
                              <Button
                                onClick={() => handleWorkoutComplete(workout)}
                                disabled={workoutCompletionMutation.isPending}
                                data-testid={`button-complete-${workout.day}`}
                                variant={isNext ? "default" : "outline"}
                                size="sm"
                              >
                                Mark Complete
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Workout Completion Modal */}
      {showCompletion && selectedWorkout && (
        <WorkoutCompletionModal
          workout={selectedWorkout}
          onSubmit={handleSubmitCompletion}
          onClose={() => setShowCompletion(false)}
          isSubmitting={workoutCompletionMutation.isPending}
        />
      )}

      {/* Congratulations Modal */}
      {showCongratulations && (
        <CongratulationsModal
          onClose={() => setShowCongratulations(false)}
          workoutName={selectedWorkout?.name || ""}
        />
      )}
    </>
  );
}