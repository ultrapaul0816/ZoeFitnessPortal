import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSession } from "@/hooks/use-session";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Video, 
  Dumbbell, 
  Check,
  X,
  ExternalLink,
  Play,
  Loader2,
  Save,
  ChevronRight,
  AlertCircle
} from "lucide-react";

type Exercise = {
  id: string;
  display_id: string;
  name: string;
  description: string | null;
  video_url: string | null;
  duration: string | null;
  category: string;
  difficulty: string;
  order_index: number;
};

type ModuleSection = {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
};

type CourseModule = {
  id: string;
  name: string;
  slug: string;
  module_type: string;
  order_index: number;
};

export default function AdminWorkoutVideos() {
  const [, setLocation] = useLocation();
  const { user, loading: sessionLoading } = useSession();
  const { toast } = useToast();
  const [activeProgram, setActiveProgram] = useState("program1");
  const [editingExercise, setEditingExercise] = useState<string | null>(null);
  const [videoUrls, setVideoUrls] = useState<Record<string, string>>({});
  const [savingExercise, setSavingExercise] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionLoading && (!user || !user.isAdmin)) {
      setLocation('/');
    }
  }, [user, sessionLoading, setLocation]);

  const handleNavigate = (path: string) => setLocation(path);

  // Fetch prenatal exercises grouped by category
  const { data: exercises = [], isLoading: exercisesLoading } = useQuery<Exercise[]>({
    queryKey: ['/api/admin/prenatal-exercises'],
    queryFn: async () => {
      const res = await fetch('/api/admin/exercises?prefix=prenatal');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  // Fetch module sections for Program 1
  const { data: program1Sections = [], isLoading: sectionsLoading } = useQuery<ModuleSection[]>({
    queryKey: ['/api/admin/modules/prenatal-t1-program1/sections'],
    queryFn: async () => {
      const res = await fetch('/api/admin/modules/prenatal-t1-program1/sections');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const updateVideoMutation = useMutation({
    mutationFn: async ({ exerciseId, videoUrl }: { exerciseId: string; videoUrl: string }) => {
      return apiRequest("PATCH", `/api/admin/exercises/${exerciseId}`, { videoUrl });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/prenatal-exercises'] });
      setEditingExercise(null);
      setSavingExercise(null);
      toast({ title: "Video URL updated successfully" });
    },
    onError: (error: any) => {
      setSavingExercise(null);
      toast({ title: "Failed to update video URL", description: error.message, variant: "destructive" });
    },
  });

  const handleSaveVideo = (exerciseId: string) => {
    setSavingExercise(exerciseId);
    updateVideoMutation.mutate({ 
      exerciseId, 
      videoUrl: videoUrls[exerciseId] || '' 
    });
  };

  const handleEditStart = (exercise: Exercise) => {
    setEditingExercise(exercise.id);
    setVideoUrls(prev => ({
      ...prev,
      [exercise.id]: exercise.video_url || ''
    }));
  };

  const handleCancelEdit = () => {
    setEditingExercise(null);
  };

  // Group exercises by day based on their IDs and order
  const getExercisesForDay = (dayNumber: number) => {
    // Map day numbers to exercise ID prefixes or order ranges
    const dayExerciseRanges: Record<number, string[]> = {
      1: ['prenatal-db-squat-thruster', 'prenatal-db-deadlifts', 'prenatal-db-same-leg-lunge-front-raise', 
          'prenatal-supported-glute-bridge-marches', 'prenatal-side-plank-hip-lifts', 'prenatal-supine-core-compressions',
          'prenatal-childs-pose-travel', 'prenatal-child-pose-inner-thigh-stretch', 'prenatal-bodyweight-squats',
          'prenatal-band-deadlifts', 'prenatal-wall-support-lunges', 'prenatal-pillow-glute-bridges', 'prenatal-side-lying-leg-lifts'],
      2: ['prenatal-db-supported-chest-press', 'prenatal-db-bicep-curl-arnold-press', 'prenatal-db-sumo-squat-upright-row',
          'prenatal-mini-band-side-plank-clam', 'prenatal-standing-arm-rotations', 'prenatal-seated-90-90-glute-lift',
          'prenatal-thread-the-needle', 'prenatal-wall-supported-pushups', 'prenatal-band-kneeling-shoulder-press',
          'prenatal-sumo-squat-bodyweight', 'prenatal-mini-band-lying-clamshells'],
      3: ['prenatal-band-squat-front-raise', 'prenatal-band-squat-wide-row', 'prenatal-mini-band-modified-jacks',
          'prenatal-mini-band-traveling-squat', 'prenatal-mini-band-bridge-pull-aparts', 'prenatal-sumo-squat-hold-twists',
          'prenatal-bird-dog-bodyweight', 'prenatal-core-compressions-wall-sits', 'prenatal-band-seated-narrow-rows',
          'prenatal-band-standing-side-abductors', 'prenatal-pillow-ball-squeeze-bridges'],
      4: ['prenatal-db-bird-dog-rows', 'prenatal-db-seated-shoulder-press', 'prenatal-db-seated-lateral-raises',
          'prenatal-marching-band-wrist-pull', 'prenatal-side-plank-knee-leg-lifts', 'prenatal-all-fours-shoulder-taps',
          'prenatal-seated-figure-8-arm-lifts', 'prenatal-knee-side-plank-leg-lift-hold'],
      5: ['prenatal-db-reverse-lunges', 'prenatal-db-stiff-deadlifts', 'prenatal-db-side-lunge-double-row',
          'prenatal-knee-pushups', 'prenatal-bear-crawl-plank', 'prenatal-single-leg-stretch-reach',
          'prenatal-pigeon-stretch', 'prenatal-seated-kneeling-core-compressions', 'prenatal-bodyweight-reverse-lunges',
          'prenatal-band-stiff-deadlifts', 'prenatal-side-lunges', 'prenatal-bear-crawls-knee-lifts',
          'prenatal-warmup', 'prenatal-cooldown']
    };
    
    const dayExerciseIds = dayExerciseRanges[dayNumber] || [];
    return exercises.filter(ex => dayExerciseIds.includes(ex.id));
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      strength: "bg-purple-100 text-purple-700",
      core: "bg-pink-100 text-pink-700",
      cardio: "bg-orange-100 text-orange-700",
      flexibility: "bg-green-100 text-green-700",
      breathing: "bg-blue-100 text-blue-700",
      warmup: "bg-yellow-100 text-yellow-700",
      cooldown: "bg-teal-100 text-teal-700",
    };
    return colors[category] || "bg-gray-100 text-gray-700";
  };

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  const renderExerciseRow = (exercise: Exercise, index: number) => {
    const isEditing = editingExercise === exercise.id;
    const isSaving = savingExercise === exercise.id;
    const hasVideo = !!exercise.video_url;

    return (
      <div 
        key={exercise.id}
        className="flex items-start gap-4 p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
        data-testid={`exercise-row-${exercise.id}`}
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
          {index + 1}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900">{exercise.name}</span>
            <Badge className={`text-xs ${getCategoryBadge(exercise.category)}`}>
              {exercise.category}
            </Badge>
            {hasVideo ? (
              <Badge className="bg-green-100 text-green-700 text-xs">
                <Check className="w-3 h-3 mr-1" /> Video Added
              </Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-700 text-xs">
                <AlertCircle className="w-3 h-3 mr-1" /> No Video
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-gray-500 mb-2">
            {exercise.duration} • {exercise.difficulty}
          </p>

          {isEditing ? (
            <div className="flex items-center gap-2 mt-2">
              <Input
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrls[exercise.id] || ''}
                onChange={(e) => setVideoUrls(prev => ({
                  ...prev,
                  [exercise.id]: e.target.value
                }))}
                className="flex-1"
                data-testid={`input-video-url-${exercise.id}`}
              />
              <Button
                size="sm"
                onClick={() => handleSaveVideo(exercise.id)}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700"
                data-testid={`button-save-video-${exercise.id}`}
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelEdit}
                data-testid={`button-cancel-edit-${exercise.id}`}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-2">
              {exercise.video_url ? (
                <a 
                  href={exercise.video_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1 max-w-md truncate"
                >
                  <Play className="w-3 h-3" />
                  {exercise.video_url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-sm text-gray-400 italic">No video URL set</span>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEditStart(exercise)}
                className="ml-auto"
                data-testid={`button-edit-video-${exercise.id}`}
              >
                <Video className="w-4 h-4 mr-1" />
                {hasVideo ? 'Update' : 'Add'} Video
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const workoutDays = [
    { day: 1, title: "Day 1: Full Body Strength + Core Activation", duration: "30-35 mins" },
    { day: 2, title: "Day 2: Glutes + Upper Body Burn", duration: "30-35 mins" },
    { day: 3, title: "Day 3: Functional Conditioning Circuit", duration: "30 mins" },
    { day: 4, title: "Day 4: Core + Shoulder Stability", duration: "25-30 mins" },
    { day: 5, title: "Day 5: Strength + Mobility Reset", duration: "25-30 mins" },
  ];

  const getVideoStats = () => {
    const total = exercises.length;
    const withVideo = exercises.filter(ex => !!ex.video_url).length;
    return { total, withVideo, percentage: total > 0 ? Math.round((withVideo / total) * 100) : 0 };
  };

  const stats = getVideoStats();

  return (
    <AdminLayout
      activeTab="courses"
      onTabChange={() => setLocation("/admin")}
      onNavigate={handleNavigate}
    >
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Video className="w-6 h-6 text-pink-500" />
            Workout Video Manager
          </h1>
          <p className="text-gray-500 mt-1">
            Add and update exercise video URLs organized by program and day
          </p>
        </div>

        {/* Progress Stats */}
        <Card className="mb-6 bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Video Coverage</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.withVideo} / {stats.total} exercises
                </p>
              </div>
              <div className="w-32">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-pink-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1 text-center">{stats.percentage}% complete</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Selector */}
        <Tabs defaultValue="prenatal" className="mb-6">
          <TabsList className="bg-pink-100">
            <TabsTrigger value="prenatal" className="data-[state=active]:bg-white">
              <Dumbbell className="w-4 h-4 mr-2" />
              Prenatal Strength
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prenatal">
            {/* Program Tabs */}
            <Tabs value={activeProgram} onValueChange={setActiveProgram}>
              <TabsList className="mb-4 bg-purple-100">
                <TabsTrigger value="program1" className="data-[state=active]:bg-white">
                  Program 1: Feeling Fierce
                </TabsTrigger>
                <TabsTrigger value="program2" className="data-[state=active]:bg-white" disabled>
                  Program 2 (Coming Soon)
                </TabsTrigger>
                <TabsTrigger value="program3" className="data-[state=active]:bg-white" disabled>
                  Program 3 (Coming Soon)
                </TabsTrigger>
              </TabsList>

              <TabsContent value="program1">
                <Card>
                  <CardHeader className="bg-gradient-to-r from-cyan-500 to-pink-500 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <Dumbbell className="w-5 h-5" />
                      Program 1: Feeling Fierce
                    </CardTitle>
                    <CardDescription className="text-white/80">
                      5-Day Week • High energy, full-body, strong
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {exercisesLoading ? (
                      <div className="p-6 space-y-4">
                        {[1, 2, 3].map(i => (
                          <Skeleton key={i} className="h-20 w-full" />
                        ))}
                      </div>
                    ) : (
                      <Accordion type="multiple" className="divide-y">
                        {workoutDays.map(({ day, title, duration }) => {
                          const dayExercises = getExercisesForDay(day);
                          const dayVideos = dayExercises.filter(ex => !!ex.video_url).length;
                          
                          return (
                            <AccordionItem key={day} value={`day-${day}`} className="border-0">
                              <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
                                <div className="flex items-center gap-4 w-full">
                                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                    {day}
                                  </div>
                                  <div className="flex-1 text-left">
                                    <p className="font-medium text-gray-900">{title}</p>
                                    <p className="text-sm text-gray-500">{duration} • {dayExercises.length} exercises</p>
                                  </div>
                                  <Badge className={dayVideos === dayExercises.length ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                                    {dayVideos}/{dayExercises.length} videos
                                  </Badge>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-0 pb-0">
                                <div className="bg-gray-50">
                                  {dayExercises.length > 0 ? (
                                    dayExercises.map((exercise, index) => renderExerciseRow(exercise, index))
                                  ) : (
                                    <div className="p-6 text-center text-gray-500">
                                      No exercises found for this day
                                    </div>
                                  )}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
