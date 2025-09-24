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
    {/* Stunning Background Container */}
    <div className="relative max-w-md mx-auto">
      {/* Decorative Background Elements */}
      <div className="absolute -inset-4 bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 rounded-3xl blur-xl opacity-30 animate-pulse"></div>
      <div className="absolute -inset-2 bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 rounded-2xl opacity-20"></div>
      
      {/* Main Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-white via-pink-50 to-purple-50 shadow-2xl border-0 backdrop-blur-sm">
        {/* Dramatic Header with Enhanced Branding */}
        <div className="relative text-center pt-8 pb-6 bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-20">
            <div className="absolute top-4 left-4 w-8 h-8 bg-white rounded-full animate-bounce"></div>
            <div className="absolute top-6 right-6 w-6 h-6 bg-yellow-300 rounded-full animate-pulse"></div>
            <div className="absolute bottom-4 left-1/4 w-4 h-4 bg-pink-200 rounded-full"></div>
          </div>
          
          <div className="relative z-10">
            <div className="text-3xl font-black text-white drop-shadow-lg">
              <span className="block">Stronger</span>
              <span className="text-yellow-300 text-4xl">Zoe</span>
            </div>
            <div className="w-20 h-1 bg-gradient-to-r from-yellow-300 to-pink-200 rounded-full mx-auto mt-3"></div>
          </div>
        </div>

        <CardContent className="px-8 py-8">
          {/* Enhanced Program Image with Glow Effect */}
          <div className="text-center mb-8">
            <div className="relative">
              {program.imageUrl ? (
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-pink-400 to-purple-500 rounded-3xl blur-md opacity-50"></div>
                  <img
                    src={program.imageUrl}
                    alt={`${program.name} program`}
                    className="relative w-28 h-28 rounded-3xl shadow-2xl mx-auto object-cover border-4 border-white"
                  />
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-pink-400 to-purple-500 rounded-3xl blur-md opacity-50"></div>
                  <div className="relative inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 rounded-3xl shadow-2xl border-4 border-white">
                    <BookOpen className="w-14 h-14 text-white drop-shadow-lg" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Program Title with Gradient */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-black bg-gradient-to-r from-gray-800 via-pink-600 to-purple-600 bg-clip-text text-transparent leading-tight">
              {program.name}
            </h3>
          </div>

          {/* Beautiful Description Card */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-pink-100 via-white to-purple-100 rounded-2xl p-6 shadow-inner border border-pink-200">
              <p className="text-gray-700 text-base leading-relaxed font-medium">
                {program.description}
              </p>
            </div>
          </div>

          {/* Enhanced Status Badge */}
          <div className="flex justify-center mb-8">
            <div className="transform hover:scale-110 transition-transform duration-200">
              {getStatusBadge()}
            </div>
          </div>

          {/* Stylish Program Details Grid */}
          <div className="grid grid-cols-1 gap-4 mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 shadow-sm">
              <div className="flex items-center justify-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full mr-3">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-gray-800 font-semibold text-lg">{program.duration}</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 shadow-sm">
              <div className="flex items-center justify-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mr-3">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <span className="text-gray-800 font-semibold text-lg">{program.level || 'Postnatal'}</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200 shadow-sm">
              <div className="flex items-center justify-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mr-3">
                  <Dumbbell className="w-5 h-5 text-white" />
                </div>
                <span className="text-gray-800 font-semibold text-lg">{program.workoutCount} Workouts</span>
              </div>
            </div>
          </div>

          {/* Dramatic Price Display */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 rounded-2xl p-6 border-2 border-orange-200 shadow-lg">
              <div className="flex items-center justify-center mb-2">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-4xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  ₹{program.price || '2,500'}
                </span>
              </div>
              <p className="text-sm text-gray-600 font-medium">Premium Access</p>
            </div>
          </div>

          {/* Enhanced Purchase & Expiry Info */}
          {(purchaseDate || expiryDate) && (
            <div className="space-y-3 mb-8">
              {purchaseDate && (
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-200">
                  <div className="flex items-center justify-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full mr-3">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700 font-semibold">Purchased {formatDate(purchaseDate.toISOString())}</span>
                  </div>
                </div>
              )}
              {expiryDate && (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-center justify-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full mr-3">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700 font-semibold">Expires {formatDate(expiryDate.toISOString())}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stunning Progress Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-pink-50 via-white to-purple-50 rounded-2xl p-6 border border-pink-200 shadow-inner">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold text-gray-800">Progress ({memberProgram.progress} of {program.workoutCount} workouts)</span>
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-lg px-4 py-2 rounded-full shadow-lg">
                  {Math.round(progressPercentage)}%
                </div>
              </div>
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-6 shadow-inner">
                  <div 
                    className="h-6 bg-gradient-to-r from-pink-400 via-rose-500 to-purple-600 rounded-full shadow-lg transition-all duration-1000 ease-out relative overflow-hidden"
                    style={{ width: `${progressPercentage}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Equipment Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 rounded-2xl p-6 border-2 border-blue-300 shadow-lg">
              <div className="flex items-center mb-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mr-3">
                  <Dumbbell className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-blue-900">Equipment Needed</span>
              </div>
              <p className="text-lg text-blue-800 font-semibold">{program.equipment || 'Minimal Equipment'}</p>
            </div>
          </div>

          {/* Spectacular Action Buttons */}
          <div className="space-y-4">
            <Button
              className="w-full relative overflow-hidden bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:via-rose-600 hover:to-purple-700 text-white font-black text-xl py-6 px-8 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.97] border-0 group"
              onClick={() => setShowWorkouts(true)}
              data-testid={`button-continue-${program.id}`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center">
                <Play className="w-7 h-7 mr-3 animate-pulse" />
                Continue Program
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="w-full bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-300 text-pink-700 hover:bg-gradient-to-r hover:from-pink-100 hover:to-purple-100 hover:border-pink-400 py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              onClick={() => saveWorkoutMutation.mutate()}
              disabled={saveWorkoutMutation.isPending}
              data-testid={`button-save-${program.id}`}
            >
              <Heart className="w-5 h-5 mr-2 text-pink-500" />
              {saveWorkoutMutation.isPending ? "Saving..." : "Save to Favorites"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
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
