import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, Play, BookOpen, Calendar, Clock, Target, User, Dumbbell, CheckCircle } from "lucide-react";
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

  // Format dates for display
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Use real purchase/expiry dates from memberProgram if available
  const purchaseDate = memberProgram.purchaseDate ? new Date(memberProgram.purchaseDate) : null;
  const expiryDate = memberProgram.expiryDate ? new Date(memberProgram.expiryDate) : null;

  return (
    <>
    <Card className="overflow-hidden bg-white shadow-xl border-0 max-w-md mx-auto">
      {/* Header with Logo */}
      <div className="text-center pt-6 pb-4">
        <div className="text-2xl font-bold">
          <span className="text-gray-900">Stronger</span>
          <br />
          <span className="text-pink-500">Zoe</span>
        </div>
      </div>

      <CardContent className="px-6 pb-6">
        {/* Program Image/Icon */}
        <div className="text-center mb-6">
          {program.imageUrl ? (
            <img
              src={program.imageUrl}
              alt={`${program.name} program`}
              className="w-20 h-20 rounded-2xl shadow-lg mx-auto object-cover"
            />
          ) : (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-400 to-pink-500 rounded-2xl shadow-lg mb-4">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
          )}
        </div>

        {/* Program Title */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">{program.name}</h3>
        </div>

        {/* Program Description */}
        <div className="text-center mb-6">
          <p className="text-gray-600 text-sm leading-relaxed px-2">
            {program.description}
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center mb-6">
          {getStatusBadge()}
        </div>

        {/* Program Details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-center text-sm">
            <BookOpen className="w-4 h-4 text-pink-500 mr-2" />
            <span className="text-gray-700">{program.duration}</span>
          </div>
          <div className="flex items-center justify-center text-sm">
            <Target className="w-4 h-4 text-pink-500 mr-2" />
            <span className="text-gray-700">{program.level || 'Postnatal'}</span>
          </div>
          <div className="flex items-center justify-center text-sm">
            <Dumbbell className="w-4 h-4 text-pink-500 mr-2" />
            <span className="text-gray-700">{program.workoutCount} Workouts</span>
          </div>
        </div>

        {/* Price */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 bg-pink-500 rounded mr-2"></div>
            <span className="text-2xl font-bold text-gray-900">₹{program.price || '2,500'}</span>
          </div>
        </div>

        {/* Purchase & Expiry Info */}
        {(purchaseDate || expiryDate) && (
          <div className="space-y-2 mb-6 text-center">
            {purchaseDate && (
              <div className="flex items-center justify-center text-sm text-gray-600">
                <User className="w-4 h-4 mr-2" />
                <span>Purchased {formatDate(purchaseDate.toISOString())}</span>
              </div>
            )}
            {expiryDate && (
              <div className="flex items-center justify-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                <span>Expires {formatDate(expiryDate.toISOString())}</span>
              </div>
            )}
          </div>
        )}

        {/* Progress Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Progress ({memberProgram.progress} of {program.workoutCount} workouts)</span>
            <span className="text-sm font-semibold text-pink-500">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2 bg-gray-100">
            <div 
              className="h-full bg-gradient-to-r from-pink-400 to-pink-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </Progress>
        </div>

        {/* Equipment Section */}
        <div className="mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center mb-2">
              <Dumbbell className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-900">Equipment Needed</span>
            </div>
            <p className="text-sm text-blue-700">{program.equipment || 'Minimal Equipment'}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] border-0"
            onClick={() => setShowWorkouts(true)}
            data-testid={`button-continue-${program.id}`}
          >
            <Play className="w-5 h-5 mr-2" />
            Continue Program
          </Button>
          
          <Button
            variant="outline"
            className="w-full border-pink-200 text-pink-600 hover:bg-pink-50 hover:border-pink-300 py-2"
            onClick={() => saveWorkoutMutation.mutate()}
            disabled={saveWorkoutMutation.isPending}
            data-testid={`button-save-${program.id}`}
          >
            <Heart className="w-4 h-4 mr-2" />
            {saveWorkoutMutation.isPending ? "Saving..." : "Save to Favorites"}
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
