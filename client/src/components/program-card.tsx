import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, Play } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ProgramWorkouts from "@/components/program-workouts";

interface ProgramCardProps {
  memberProgram: any;
  userId: string;
}

export default function ProgramCard({ memberProgram, userId }: ProgramCardProps) {
  const { program } = memberProgram;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showWorkouts, setShowWorkouts] = useState(false);

  const saveWorkoutMutation = useMutation({
    mutationFn: async () => {
      // For now, we'll use the first workout of the program
      const response = await apiRequest("POST", "/api/workouts/save", {
        userId,
        workoutId: "sample-workout-id", // This would come from selecting a specific workout
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Workout Saved!",
        description: "Added to your saved workouts list.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save workout.",
      });
    },
  });

  const progressPercentage = (memberProgram.progress / program.workoutCount) * 100;

  const getStatusBadge = () => {
    if (memberProgram.progress === program.workoutCount) {
      return <Badge variant="secondary">Completed</Badge>;
    }
    if (memberProgram.isActive) {
      return <Badge>Active</Badge>;
    }
    return <Badge variant="outline">Inactive</Badge>;
  };

  return (
    <>
    <Card className="overflow-hidden workout-card-hover shadow-sm">
      <img
        src={program.imageUrl}
        alt={`${program.name} workout session`}
        className="w-full h-48 object-cover"
      />
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold text-foreground">{program.name}</h3>
          {getStatusBadge()}
        </div>
        
        <p className="text-muted-foreground text-sm mb-4">{program.description}</p>
        
        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">
              {memberProgram.progress}/{program.workoutCount} {program.workoutCount > 50 ? 'workouts' : 'days'}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="flex gap-3">
          <Button
            className="flex-1"
            onClick={() => setShowWorkouts(true)}
            data-testid={`button-continue-${program.id}`}
          >
            <Play className="w-4 h-4 mr-2" />
            {memberProgram.progress === program.workoutCount ? "Review" : "Continue"}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => saveWorkoutMutation.mutate()}
            disabled={saveWorkoutMutation.isPending}
            data-testid={`button-save-${program.id}`}
          >
            <Heart className="w-5 h-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
    {showWorkouts && (
      <ProgramWorkouts
        program={program}
        memberProgram={memberProgram}
        userId={userId}
        onClose={() => setShowWorkouts(false)}
      />
    )}
    </>
  );
}
