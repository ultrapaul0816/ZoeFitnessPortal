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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Video, 
  Dumbbell, 
  Check,
  X,
  ExternalLink,
  Play,
  Loader2,
  Save,
  AlertCircle,
  Heart,
  Baby,
  Sparkles
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

type WorkoutModule = {
  module_id: string;
  module_name: string;
  module_type: string;
  course_id: string;
  course_name: string;
  order_index: number;
};

type CourseConfig = {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  exercisePrefix: string;
  programs: ProgramConfig[];
};

type ProgramConfig = {
  id: string;
  name: string;
  days: DayConfig[];
};

type ExerciseSection = {
  name: string;
  color: string;
  exerciseIds: string[];
};

type DayConfig = {
  day: number;
  title: string;
  duration: string;
  exerciseIds: string[];
  sections?: ExerciseSection[];
};

export default function AdminWorkoutVideos() {
  const [, setLocation] = useLocation();
  const { user, loading: sessionLoading } = useSession();
  const { toast } = useToast();
  const [activeCourse, setActiveCourse] = useState("prenatal");
  const [activeProgram, setActiveProgram] = useState("");
  const [editingExercise, setEditingExercise] = useState<string | null>(null);
  const [videoUrls, setVideoUrls] = useState<Record<string, string>>({});
  const [savingExercise, setSavingExercise] = useState<string | null>(null);
  const [playAllUrls, setPlayAllUrls] = useState<Record<string, string>>({});
  const [editingPlayAll, setEditingPlayAll] = useState<string | null>(null);
  const [savingPlayAll, setSavingPlayAll] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionLoading && (!user || !user.isAdmin)) {
      setLocation('/');
    }
  }, [user, sessionLoading, setLocation]);

  const handleNavigate = (path: string) => setLocation(path);

  // Fetch all exercises
  const { data: allExercises = [], isLoading: exercisesLoading } = useQuery<Exercise[]>({
    queryKey: ['/api/admin/all-exercises'],
    queryFn: async () => {
      const res = await fetch('/api/admin/exercises');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  // Fetch workout modules for course/program structure
  const { data: workoutModules = [] } = useQuery<WorkoutModule[]>({
    queryKey: ['/api/admin/workout-modules'],
    queryFn: async () => {
      const res = await fetch('/api/admin/workout-modules');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  // Fetch section settings (Play All URLs) from database
  const { data: sectionSettings = {} } = useQuery<Record<string, string>>({
    queryKey: ['/api/admin/section-settings'],
    queryFn: async () => {
      const res = await fetch('/api/admin/section-settings');
      const data = await res.json();
      // Convert array to map
      const settings: Record<string, string> = {};
      if (Array.isArray(data)) {
        for (const row of data) {
          if (row.play_all_url) {
            settings[row.section_key] = row.play_all_url;
          }
        }
      }
      return settings;
    },
  });

  // Initialize playAllUrls from database when sectionSettings loads
  useEffect(() => {
    if (sectionSettings && Object.keys(sectionSettings).length > 0) {
      setPlayAllUrls(prev => ({ ...sectionSettings, ...prev }));
    }
  }, [sectionSettings]);

  const updateVideoMutation = useMutation({
    mutationFn: async ({ exerciseId, videoUrl }: { exerciseId: string; videoUrl: string }) => {
      return apiRequest("PATCH", `/api/admin/exercises/${exerciseId}`, { videoUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/all-exercises'] });
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

  // Mutation for saving Play All URLs
  const updatePlayAllMutation = useMutation({
    mutationFn: async ({ sectionKey, playAllUrl }: { sectionKey: string; playAllUrl: string }) => {
      return apiRequest("PUT", `/api/admin/section-settings/${encodeURIComponent(sectionKey)}`, { playAllUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/section-settings'] });
      setEditingPlayAll(null);
      setSavingPlayAll(null);
      toast({ title: "Play All URL saved successfully" });
    },
    onError: (error: any) => {
      setSavingPlayAll(null);
      toast({ title: "Failed to save Play All URL", description: error.message, variant: "destructive" });
    },
  });

  const handleSavePlayAll = (sectionKey: string) => {
    setSavingPlayAll(sectionKey);
    updatePlayAllMutation.mutate({
      sectionKey,
      playAllUrl: playAllUrls[sectionKey] || ''
    });
  };

  // Course configurations with exercise mappings
  const courseConfigs: CourseConfig[] = [
    {
      id: "prenatal",
      name: "Prenatal Strength",
      icon: <Baby className="w-4 h-4" />,
      color: "from-purple-500 to-pink-500",
      exercisePrefix: "prenatal",
      programs: [
        {
          id: "program1",
          name: "Program 1: Feeling Fierce (5 Days)",
          days: [
            { day: 1, title: "Day 1: Full Body Strength + Core Activation", duration: "30-35 mins", exerciseIds: [], sections: [
              { name: "Warmup", color: "bg-amber-100 text-amber-800 border-amber-300", exerciseIds: ['prenatal-warmup'] },
              { name: "Main Workout", color: "bg-purple-100 text-purple-800 border-purple-300", exerciseIds: ['prenatal-db-squat-thruster', 'prenatal-db-deadlifts', 'prenatal-db-same-leg-lunge-front-raise', 'prenatal-supported-glute-bridge-marches', 'prenatal-side-plank-hip-lifts'] },
              { name: "Finisher Flow", color: "bg-pink-100 text-pink-800 border-pink-300", exerciseIds: ['prenatal-supine-core-compressions', 'prenatal-childs-pose-travel', 'prenatal-child-pose-inner-thigh-stretch'] },
              { name: "Beginner Option", color: "bg-green-100 text-green-800 border-green-300", exerciseIds: ['prenatal-bodyweight-squats', 'prenatal-band-deadlifts', 'prenatal-wall-support-lunges', 'prenatal-pillow-glute-bridges', 'prenatal-side-lying-leg-lifts'] },
              { name: "Cooldown", color: "bg-cyan-100 text-cyan-800 border-cyan-300", exerciseIds: ['prenatal-cooldown'] }
            ]},
            { day: 2, title: "Day 2: Glutes + Upper Body Burn", duration: "30-35 mins", exerciseIds: [], sections: [
              { name: "Warmup", color: "bg-amber-100 text-amber-800 border-amber-300", exerciseIds: ['prenatal-warmup'] },
              { name: "Main Workout", color: "bg-purple-100 text-purple-800 border-purple-300", exerciseIds: ['prenatal-db-supported-chest-press', 'prenatal-db-bicep-curl-arnold-press', 'prenatal-db-sumo-squat-upright-row', 'prenatal-supported-glute-bridge-marches', 'prenatal-mini-band-side-plank-clam'] },
              { name: "Finisher Flow", color: "bg-pink-100 text-pink-800 border-pink-300", exerciseIds: ['prenatal-standing-arm-rotations', 'prenatal-seated-90-90-glute-lift', 'prenatal-thread-the-needle'] },
              { name: "Beginner Option", color: "bg-green-100 text-green-800 border-green-300", exerciseIds: ['prenatal-wall-supported-pushups', 'prenatal-band-kneeling-shoulder-press', 'prenatal-sumo-squat-bodyweight', 'prenatal-pillow-glute-bridges', 'prenatal-mini-band-lying-clamshells'] },
              { name: "Cooldown", color: "bg-cyan-100 text-cyan-800 border-cyan-300", exerciseIds: ['prenatal-cooldown'] }
            ]},
            { day: 3, title: "Day 3: Functional Conditioning Circuit", duration: "30 mins", exerciseIds: [], sections: [
              { name: "Warmup", color: "bg-amber-100 text-amber-800 border-amber-300", exerciseIds: ['prenatal-warmup'] },
              { name: "Main Workout", color: "bg-purple-100 text-purple-800 border-purple-300", exerciseIds: ['prenatal-band-squat-front-raise', 'prenatal-band-squat-wide-row', 'prenatal-mini-band-modified-jacks', 'prenatal-mini-band-traveling-squat', 'prenatal-mini-band-bridge-pull-aparts'] },
              { name: "Finisher Flow", color: "bg-pink-100 text-pink-800 border-pink-300", exerciseIds: ['prenatal-sumo-squat-hold-twists', 'prenatal-bird-dog-bodyweight', 'prenatal-core-compressions-wall-sits'] },
              { name: "Beginner Option", color: "bg-green-100 text-green-800 border-green-300", exerciseIds: ['prenatal-bodyweight-squats', 'prenatal-band-seated-narrow-rows', 'prenatal-mini-band-modified-jacks-beginner', 'prenatal-band-standing-side-abductors', 'prenatal-pillow-ball-squeeze-bridges'] },
              { name: "Cooldown", color: "bg-cyan-100 text-cyan-800 border-cyan-300", exerciseIds: ['prenatal-cooldown'] }
            ]},
            { day: 4, title: "Day 4: Core + Shoulder Stability", duration: "25-30 mins", exerciseIds: [], sections: [
              { name: "Warmup", color: "bg-amber-100 text-amber-800 border-amber-300", exerciseIds: ['prenatal-warmup'] },
              { name: "Main Workout", color: "bg-purple-100 text-purple-800 border-purple-300", exerciseIds: ['prenatal-db-bird-dog-rows', 'prenatal-db-seated-shoulder-press', 'prenatal-db-seated-lateral-raises', 'prenatal-marching-band-wrist-pull', 'prenatal-side-plank-knee-leg-lifts'] },
              { name: "Finisher Flow", color: "bg-pink-100 text-pink-800 border-pink-300", exerciseIds: ['prenatal-all-fours-shoulder-taps'] },
              { name: "Beginner Option", color: "bg-green-100 text-green-800 border-green-300", exerciseIds: ['prenatal-seated-figure-8-arm-lifts', 'prenatal-knee-side-plank-leg-lift-hold'] },
              { name: "Cooldown", color: "bg-cyan-100 text-cyan-800 border-cyan-300", exerciseIds: ['prenatal-cooldown'] }
            ]},
            { day: 5, title: "Day 5: Strength + Mobility Reset", duration: "25-30 mins", exerciseIds: [], sections: [
              { name: "Warmup", color: "bg-amber-100 text-amber-800 border-amber-300", exerciseIds: ['prenatal-warmup'] },
              { name: "Main Workout", color: "bg-purple-100 text-purple-800 border-purple-300", exerciseIds: ['prenatal-db-reverse-lunges', 'prenatal-db-stiff-deadlifts', 'prenatal-db-side-lunge-double-row', 'prenatal-knee-pushups', 'prenatal-bear-crawl-plank'] },
              { name: "Finisher Flow", color: "bg-pink-100 text-pink-800 border-pink-300", exerciseIds: ['prenatal-single-leg-stretch-reach', 'prenatal-pigeon-stretch', 'prenatal-seated-kneeling-core-compressions'] },
              { name: "Beginner Option", color: "bg-green-100 text-green-800 border-green-300", exerciseIds: ['prenatal-bodyweight-reverse-lunges', 'prenatal-band-stiff-deadlifts', 'prenatal-side-lunges', 'prenatal-bear-crawls-knee-lifts'] },
              { name: "Cooldown", color: "bg-cyan-100 text-cyan-800 border-cyan-300", exerciseIds: ['prenatal-cooldown'] }
            ]},
          ]
        },
        {
          id: "program2",
          name: "Program 2: Steady & Strong (4 Days)",
          days: [
            { day: 1, title: "Day 1: Full Body Burn + Core", duration: "30 mins", exerciseIds: [], sections: [
              { name: "Warmup", color: "bg-amber-100 text-amber-800 border-amber-300", exerciseIds: ['prenatal-warmup'] },
              { name: "Main Workout", color: "bg-purple-100 text-purple-800 border-purple-300", exerciseIds: ['prenatal-p2-db-deadlift-bentover-row', 'prenatal-p2-single-leg-reverse-lunge-knee-lift', 'prenatal-p2-squat-overhead-arm-reach', 'prenatal-p2-glute-bridge-cross-reach', 'prenatal-p2-seated-90-90-glute-stretch-rotation', 'prenatal-p2-modified-knee-elbow-opp'] },
              { name: "Finisher Flow", color: "bg-pink-100 text-pink-800 border-pink-300", exerciseIds: ['prenatal-p2-supine-core-compressions', 'prenatal-p2-all-fours-ball-pelvic-tilts'] },
              { name: "Beginner Option", color: "bg-green-100 text-green-800 border-green-300", exerciseIds: ['prenatal-p2-light-db-band-deadlift', 'prenatal-p2-squat-seated-chair'] },
              { name: "Cooldown", color: "bg-cyan-100 text-cyan-800 border-cyan-300", exerciseIds: ['prenatal-cooldown'] }
            ]},
            { day: 2, title: "Day 2: Glutes + Posture", duration: "30-35 mins", exerciseIds: [], sections: [
              { name: "Warmup", color: "bg-amber-100 text-amber-800 border-amber-300", exerciseIds: ['prenatal-warmup'] },
              { name: "Main Workout", color: "bg-purple-100 text-purple-800 border-purple-300", exerciseIds: ['prenatal-p2-glute-bridge-marches', 'prenatal-p2-kneeling-band-pull-aparts-block', 'prenatal-p2-dbs-alternating-lunges', 'prenatal-p2-band-seated-wide-row', 'prenatal-p2-band-glute-kickbacks-all-fours', 'prenatal-p2-wall-angels'] },
              { name: "Finisher Flow", color: "bg-pink-100 text-pink-800 border-pink-300", exerciseIds: ['prenatal-p2-childs-pose-open-palms-travel', 'prenatal-p2-seated-figure-8-rotations'] },
              { name: "Beginner Option", color: "bg-green-100 text-green-800 border-green-300", exerciseIds: ['prenatal-p2-glute-bridge-lifts', 'prenatal-p2-lunges-wall-support', 'prenatal-p2-band-seated-narrow-rows', 'prenatal-p2-wall-single-leg-glute-kickbacks'] },
              { name: "Cooldown", color: "bg-cyan-100 text-cyan-800 border-cyan-300", exerciseIds: ['prenatal-cooldown'] }
            ]},
            { day: 3, title: "Day 3: Active Recovery Flow", duration: "25-30 mins", exerciseIds: [], sections: [
              { name: "Warmup", color: "bg-amber-100 text-amber-800 border-amber-300", exerciseIds: ['prenatal-warmup'] },
              { name: "Main Workout", color: "bg-purple-100 text-purple-800 border-purple-300", exerciseIds: ['prenatal-p2-bear-crawl-pelvic-tilts-thread-needle', 'prenatal-p2-kneeling-ball-squeeze-band-pull', 'prenatal-p2-bird-dog-bodyweight', 'prenatal-p2-pillow-glute-bridges', 'prenatal-p2-side-plank-hip-lifts', 'prenatal-p2-cross-legged-twists'] },
              { name: "Finisher Flow", color: "bg-pink-100 text-pink-800 border-pink-300", exerciseIds: ['prenatal-p2-cross-legged-cross-hands-release', 'prenatal-p2-supine-core-compressions-belly-ribs'] },
              { name: "Beginner Option", color: "bg-green-100 text-green-800 border-green-300", exerciseIds: ['prenatal-p2-bear-crawl-pelvic-tilts-only', 'prenatal-p2-kneeling-ball-squeeze-lean-back', 'prenatal-p2-supine-bodyweight-bridges', 'prenatal-p2-side-lying-marches'] },
              { name: "Cooldown", color: "bg-cyan-100 text-cyan-800 border-cyan-300", exerciseIds: ['prenatal-cooldown'] }
            ]},
            { day: 4, title: "Day 4: Functional Strength + Core", duration: "25-30 mins", exerciseIds: [], sections: [
              { name: "Warmup", color: "bg-amber-100 text-amber-800 border-amber-300", exerciseIds: ['prenatal-warmup'] },
              { name: "Main Workout", color: "bg-purple-100 text-purple-800 border-purple-300", exerciseIds: ['prenatal-p2-db-same-leg-lunge-lateral-raise', 'prenatal-p2-supported-single-leg-glute-bridge-knee-chest', 'prenatal-p2-band-squat-narrow-row', 'prenatal-p2-db-sumo-squat-upright-row', 'prenatal-p2-bird-dog-bodyweight-d4', 'prenatal-p2-sumo-squat-alternate-arm-lifts'] },
              { name: "Finisher Flow", color: "bg-pink-100 text-pink-800 border-pink-300", exerciseIds: ['prenatal-p2-bear-crawl-downward-dog-holds', 'prenatal-p2-all-fours-shoulder-taps'] },
              { name: "Beginner Option", color: "bg-green-100 text-green-800 border-green-300", exerciseIds: ['prenatal-p2-band-lunge-lateral-raise', 'prenatal-p2-glute-bridges-bed-chair', 'prenatal-p2-band-standing-wide-narrow-row'] },
              { name: "Cooldown", color: "bg-cyan-100 text-cyan-800 border-cyan-300", exerciseIds: ['prenatal-cooldown'] }
            ]},
          ]
        },
        {
          id: "program3", 
          name: "Program 3: Balanced & Easy (3 Days)",
          days: [
            { day: 1, title: "Day 1: Light Full Body Strength", duration: "25-30 mins", exerciseIds: [], sections: [
              { name: "Warmup", color: "bg-amber-100 text-amber-800 border-amber-300", exerciseIds: ['prenatal-warmup'] },
              { name: "Main Workout", color: "bg-purple-100 text-purple-800 border-purple-300", exerciseIds: ['prenatal-p3-squat-overhead-arm-reach', 'prenatal-p3-db-standing-bent-over-narrow', 'prenatal-p3-band-standing-side-leg-abductors', 'prenatal-p3-mini-band-supine-leg-marches', 'prenatal-p3-db-bicep-curl-arnold-press', 'prenatal-p3-standing-arm-rotations', 'prenatal-p3-cross-legged-twists'] },
              { name: "Finisher Flow", color: "bg-pink-100 text-pink-800 border-pink-300", exerciseIds: ['prenatal-p3-supine-core-compressions'] },
              { name: "Beginner Option", color: "bg-green-100 text-green-800 border-green-300", exerciseIds: ['prenatal-p3-squat-seated-chair', 'prenatal-p3-band-seated-narrow-rows', 'prenatal-p3-side-lying-straight-leg-lifts', 'prenatal-p3-glute-bridges', 'prenatal-p3-seated-arnold-press'] },
              { name: "Cooldown", color: "bg-cyan-100 text-cyan-800 border-cyan-300", exerciseIds: ['prenatal-cooldown'] }
            ]},
            { day: 2, title: "Day 2: Core + Glutes Connection", duration: "25 mins", exerciseIds: [], sections: [
              { name: "Warmup", color: "bg-amber-100 text-amber-800 border-amber-300", exerciseIds: ['prenatal-warmup'] },
              { name: "Main Workout", color: "bg-purple-100 text-purple-800 border-purple-300", exerciseIds: ['prenatal-p3-wall-sit-with-ball', 'prenatal-p3-swiss-ball-seated-marches', 'prenatal-p3-banded-kneeling-fire-hydrants', 'prenatal-p3-side-plank-knee-rested-leg-lifts', 'prenatal-p3-mini-band-elbow-side-plank-clams', 'prenatal-p3-seated-crossed-leg-glute-stretch'] },
              { name: "Finisher Flow", color: "bg-pink-100 text-pink-800 border-pink-300", exerciseIds: ['prenatal-p3-core-seated-chair-compressions', 'prenatal-p3-child-pose-single-leg-inner-thigh'] },
              { name: "Beginner Option", color: "bg-green-100 text-green-800 border-green-300", exerciseIds: ['prenatal-p3-ball-squeeze-glute-bridges', 'prenatal-p3-seated-bent-knee-leg-lifts', 'prenatal-p3-kneeling-fire-hydrants', 'prenatal-p3-mini-band-side-lying-clams-hold'] },
              { name: "Cooldown", color: "bg-cyan-100 text-cyan-800 border-cyan-300", exerciseIds: ['prenatal-cooldown'] }
            ]},
            { day: 3, title: "Day 3: Mobility Flow & Recovery", duration: "20-25 mins", exerciseIds: [], sections: [
              { name: "Warmup", color: "bg-amber-100 text-amber-800 border-amber-300", exerciseIds: ['prenatal-warmup'] },
              { name: "Main Workout", color: "bg-purple-100 text-purple-800 border-purple-300", exerciseIds: ['prenatal-p3-bear-crawl-pelvic-tilts-thread', 'prenatal-p3-kneeling-ball-squeeze-lean-back', 'prenatal-p3-child-pose-hips-lifted', 'prenatal-p3-seated-crossed-glute-stretch-d3', 'prenatal-p3-butterfly-elbow-rotations', 'prenatal-p3-supine-core-compressions-d3'] },
              { name: "Finisher Flow", color: "bg-pink-100 text-pink-800 border-pink-300", exerciseIds: ['prenatal-p3-cross-legged-cross-hands-release', 'prenatal-p3-chest-stretch-opener'] },
              { name: "Beginner Option", color: "bg-green-100 text-green-800 border-green-300", exerciseIds: ['prenatal-p3-bear-crawl-pelvic-tilts-only', 'prenatal-p3-seated-lean-back-core-hold', 'prenatal-p3-hands-on-thighs-butterfly'] },
              { name: "Cooldown", color: "bg-cyan-100 text-cyan-800 border-cyan-300", exerciseIds: ['prenatal-cooldown'] }
            ]},
          ]
        },
        {
          id: "program4", 
          name: "Program 4: Gentle Flow (2 Days)",
          days: [
            { day: 1, title: "Day 1: Soft Strength + Core Support", duration: "20-25 mins", exerciseIds: [], sections: [
              { name: "Warmup", color: "bg-amber-100 text-amber-800 border-amber-300", exerciseIds: ['prenatal-warmup'] },
              { name: "Main Workout", color: "bg-purple-100 text-purple-800 border-purple-300", exerciseIds: ['prenatal-p4-band-seated-narrow-rows', 'prenatal-p4-glute-bridges-mini-band', 'prenatal-p4-side-lying-leg-lifts-top-bent', 'prenatal-p4-seated-shoulder-db-press', 'prenatal-p4-supine-pelvic-tilts', 'prenatal-p4-seated-90-90-glute-lift-reach'] },
              { name: "Finisher Flow", color: "bg-pink-100 text-pink-800 border-pink-300", exerciseIds: ['prenatal-p4-supine-core-compressions', 'prenatal-p4-child-pose-hips-lifted'] },
              { name: "Beginner Option", color: "bg-green-100 text-green-800 border-green-300", exerciseIds: ['prenatal-p4-band-standing-rows', 'prenatal-p4-pillow-glute-bridges', 'prenatal-p4-side-lying-pillow-squeeze', 'prenatal-p4-band-kneeling-shoulder-press'] },
              { name: "Cooldown", color: "bg-cyan-100 text-cyan-800 border-cyan-300", exerciseIds: ['prenatal-cooldown'] }
            ]},
            { day: 2, title: "Day 2: Stretch + Breath Recovery Flow", duration: "20-25 mins", exerciseIds: [], sections: [
              { name: "Warmup", color: "bg-amber-100 text-amber-800 border-amber-300", exerciseIds: ['prenatal-warmup'] },
              { name: "Main Workout", color: "bg-purple-100 text-purple-800 border-purple-300", exerciseIds: ['prenatal-p4-seated-same-side-leg-stretch-reach', 'prenatal-p4-kneeling-ball-squeeze-lean-back', 'prenatal-p4-kneeling-lunge-hip-flexor-reaches', 'prenatal-p4-squat-arm-rainbows', 'prenatal-p4-cross-legged-lat-stretch'] },
              { name: "Finisher Flow", color: "bg-pink-100 text-pink-800 border-pink-300", exerciseIds: ['prenatal-p4-supine-core-compressions-d2'] },
              { name: "Beginner Option", color: "bg-green-100 text-green-800 border-green-300", exerciseIds: ['prenatal-p4-chest-stretch-opener', 'prenatal-p4-supine-head-lifts-belly-pump'] },
              { name: "Cooldown", color: "bg-cyan-100 text-cyan-800 border-cyan-300", exerciseIds: ['prenatal-cooldown'] }
            ]},
          ]
        },
        {
          id: "program5", 
          name: "Program 5: Pick & Play (3 Days)",
          days: [
            { day: 1, title: "Day 1: Build Your Own - Strength Focus", duration: "25-30 mins", exerciseIds: [], sections: [
              { name: "Warmup", color: "bg-amber-100 text-amber-800 border-amber-300", exerciseIds: ['prenatal-warmup'] },
              { name: "Main Workout", color: "bg-purple-100 text-purple-800 border-purple-300", exerciseIds: ['prenatal-p5-db-squat-thruster', 'prenatal-p5-single-arm-single-leg-row', 'prenatal-p5-db-supported-chest-press', 'prenatal-p5-db-alt-leg-lunge-rainbows', 'prenatal-p5-db-sumo-deadlifts', 'prenatal-p5-seated-lateral-raises', 'prenatal-p5-marching-band-wrist-pull-aparts', 'prenatal-p5-mini-band-elbow-side-plank-clams'] },
              { name: "Finisher Flow", color: "bg-pink-100 text-pink-800 border-pink-300", exerciseIds: ['prenatal-p5-band-squat-front-raise', 'prenatal-p5-db-bird-dog-rows', 'prenatal-p5-knee-pushups', 'prenatal-p5-squat-arm-rainbows'] },
              { name: "Beginner Option", color: "bg-green-100 text-green-800 border-green-300", exerciseIds: ['prenatal-p5-sumo-squat-bodyweight', 'prenatal-p5-kneeling-band-pull-aparts', 'prenatal-p5-mini-band-lying-clams-pulses', 'prenatal-p5-standing-arm-rotations', 'prenatal-p5-seated-same-side-leg-stretch-reach', 'prenatal-p5-supine-core-compressions'] },
              { name: "Cooldown", color: "bg-cyan-100 text-cyan-800 border-cyan-300", exerciseIds: ['prenatal-cooldown'] }
            ]},
            { day: 2, title: "Day 2: Core + Conditioning Mix", duration: "20-25 mins", exerciseIds: [], sections: [
              { name: "Warmup", color: "bg-amber-100 text-amber-800 border-amber-300", exerciseIds: ['prenatal-warmup'] },
              { name: "Main Workout", color: "bg-purple-100 text-purple-800 border-purple-300", exerciseIds: ['prenatal-p5-core-compressions-wall-sits', 'prenatal-p5-mini-band-glute-bridges', 'prenatal-p5-db-sumo-squat-rows', 'prenatal-p5-supine-core-compressions-d2', 'prenatal-p5-bird-dog'] },
              { name: "Finisher Flow", color: "bg-pink-100 text-pink-800 border-pink-300", exerciseIds: ['prenatal-p5-all-fours-ball-pelvic-tilts'] },
              { name: "Beginner Option", color: "bg-green-100 text-green-800 border-green-300", exerciseIds: ['prenatal-p5-cat-camel', 'prenatal-p5-same-side-leg-stretch-reach', 'prenatal-p5-child-pose-hips-lifted'] },
              { name: "Cooldown", color: "bg-cyan-100 text-cyan-800 border-cyan-300", exerciseIds: ['prenatal-cooldown'] }
            ]},
            { day: 3, title: "Day 3: Mix & Match Flow", duration: "20-25 mins", exerciseIds: [], sections: [
              { name: "Warmup", color: "bg-amber-100 text-amber-800 border-amber-300", exerciseIds: ['prenatal-warmup'] },
              { name: "Main Workout", color: "bg-purple-100 text-purple-800 border-purple-300", exerciseIds: ['prenatal-p5-cat-camel-thread-needle', 'prenatal-p5-seated-90-90-neck-rotations', 'prenatal-p5-side-lying-squeeze-shoulder-taps', 'prenatal-p5-supine-head-lifts-glute-bridge-reach'] },
              { name: "Finisher Flow", color: "bg-pink-100 text-pink-800 border-pink-300", exerciseIds: ['prenatal-p5-bird-dog-child-pose'] },
              { name: "Beginner Option", color: "bg-green-100 text-green-800 border-green-300", exerciseIds: ['prenatal-p5-supine-compressions-wall-sit-ball'] },
              { name: "Cooldown", color: "bg-cyan-100 text-cyan-800 border-cyan-300", exerciseIds: ['prenatal-cooldown'] }
            ]},
          ]
        },
      ]
    },
    {
      id: "heal",
      name: "Heal Your Core",
      icon: <Heart className="w-4 h-4" />,
      color: "from-pink-500 to-rose-500",
      exercisePrefix: "heal",
      programs: [
        { id: "week1", name: "Week 1: Reconnect & Reset", days: [] },
        { id: "week2", name: "Week 2: Stability & Breathwork", days: [] },
        { id: "week3", name: "Week 3: Control & Awareness", days: [] },
        { id: "week4", name: "Week 4: Align & Activate", days: [] },
        { id: "week5", name: "Week 5: Functional Core Flow", days: [] },
        { id: "week6", name: "Week 6: Foundational Strength", days: [] },
      ]
    },
    {
      id: "reset",
      name: "2-Week Core Reset",
      icon: <Sparkles className="w-4 h-4" />,
      color: "from-cyan-500 to-blue-500",
      exercisePrefix: "reset",
      programs: [
        { id: "week1", name: "Week 1: Finding Your Breath", days: [] },
        { id: "week2", name: "Week 2: Building Confidence", days: [] },
      ]
    }
  ];

  const currentCourse = courseConfigs.find(c => c.id === activeCourse);
  const currentProgram = currentCourse?.programs.find(p => p.id === activeProgram) || currentCourse?.programs[0];

  // Set default program when course changes
  useEffect(() => {
    if (currentCourse && currentCourse.programs.length > 0) {
      setActiveProgram(currentCourse.programs[0].id);
    }
  }, [activeCourse]);

  const getExercisesForDay = (exerciseIds: string[]) => {
    return allExercises.filter(ex => exerciseIds.includes(ex.id));
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
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-medium text-gray-900">{exercise.name}</span>
            <Badge className={`text-xs ${getCategoryBadge(exercise.category)}`}>
              {exercise.category}
            </Badge>
            {hasVideo ? (
              <>
                <Badge className="bg-green-100 text-green-700 text-xs">
                  <Check className="w-3 h-3 mr-1" /> Video Added
                </Badge>
                <a
                  href={exercise.video_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium hover:underline ml-1"
                  data-testid={`link-play-${exercise.id}`}
                >
                  <Play className="w-3 h-3" /> PLAY
                </a>
              </>
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
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {exercise.video_url ? (
                <a 
                  href={exercise.video_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1 max-w-xs truncate"
                >
                  <Play className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{exercise.video_url}</span>
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
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

  const getVideoStats = (prefix: string) => {
    const courseExercises = allExercises.filter(ex => ex.id.startsWith(prefix));
    const total = courseExercises.length;
    const withVideo = courseExercises.filter(ex => !!ex.video_url).length;
    return { total, withVideo, percentage: total > 0 ? Math.round((withVideo / total) * 100) : 0 };
  };

  const stats = currentCourse ? getVideoStats(currentCourse.exercisePrefix) : { total: 0, withVideo: 0, percentage: 0 };

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
            Add and update exercise video URLs organized by course, program, and day
          </p>
        </div>

        {/* Course Selector */}
        <div className="mb-6">
          <Tabs value={activeCourse} onValueChange={setActiveCourse}>
            <TabsList className="bg-pink-100 h-auto flex-wrap">
              {courseConfigs.map(course => (
                <TabsTrigger 
                  key={course.id} 
                  value={course.id}
                  className="data-[state=active]:bg-white flex items-center gap-2"
                >
                  {course.icon}
                  {course.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Progress Stats */}
        <Card className={`mb-6 bg-gradient-to-r ${currentCourse?.color || 'from-pink-50 to-purple-50'} bg-opacity-10 border-pink-200`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Video Coverage - {currentCourse?.name}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.withVideo} / {stats.total} exercises
                </p>
              </div>
              <div className="w-32">
                <div className="w-full bg-white/50 rounded-full h-3">
                  <div 
                    className={`bg-gradient-to-r ${currentCourse?.color || 'from-pink-500 to-purple-600'} h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1 text-center">{stats.percentage}% complete</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Program Selector */}
        {currentCourse && currentCourse.programs.length > 0 && (
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Select Program/Week</label>
            <Select value={activeProgram} onValueChange={setActiveProgram}>
              <SelectTrigger className="w-full md:w-96">
                <SelectValue placeholder="Select a program" />
              </SelectTrigger>
              <SelectContent>
                {currentCourse.programs.map(program => (
                  <SelectItem key={program.id} value={program.id}>
                    {program.name}
                    {program.days.length === 0 && " (Coming Soon)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Workout Days */}
        {currentProgram && (
          <Card>
            <CardHeader className={`bg-gradient-to-r ${currentCourse?.color || 'from-pink-500 to-purple-500'} text-white rounded-t-lg`}>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5" />
                {currentProgram.name}
              </CardTitle>
              <CardDescription className="text-white/80">
                {currentProgram.days.length > 0 
                  ? `${currentProgram.days.length} workout days` 
                  : "Exercise mappings coming soon - add them to enable editing"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {exercisesLoading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : currentProgram.days.length > 0 ? (
                <Accordion type="multiple" className="divide-y">
                  {currentProgram.days.map(({ day, title, duration, exerciseIds, sections }) => {
                    const allExerciseIds = sections 
                      ? sections.flatMap(s => s.exerciseIds) 
                      : exerciseIds;
                    const dayExercises = getExercisesForDay(allExerciseIds);
                    const dayVideos = dayExercises.filter(ex => !!ex.video_url).length;
                    
                    return (
                      <AccordionItem key={day} value={`day-${day}`} className="border-0">
                        <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
                          <div className="flex items-center gap-4 w-full">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${currentCourse?.color || 'from-pink-500 to-purple-500'} flex items-center justify-center text-white font-bold`}>
                              {day}
                            </div>
                            <div className="flex-1 text-left">
                              <p className="font-medium text-gray-900">{title}</p>
                              <p className="text-sm text-gray-500">{duration} • {dayExercises.length} exercises</p>
                            </div>
                            <Badge className={dayVideos === dayExercises.length && dayExercises.length > 0 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                              {dayVideos}/{dayExercises.length} videos
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-0 pb-0">
                          <div className="bg-gray-50">
                            {dayExercises.length > 0 ? (
                              sections ? (
                                sections.map((section, sectionIndex) => {
                                  const sectionExercises = getExercisesForDay(section.exerciseIds);
                                  let exerciseCounter = sections.slice(0, sectionIndex).reduce((acc, s) => acc + s.exerciseIds.length, 0);
                                  const sectionKey = `${activeProgram}-day${day}-${section.name.toLowerCase().replace(/\s+/g, '-')}`;
                                  const sectionVideos = sectionExercises.filter(ex => !!ex.video_url).length;
                                  return (
                                    <div key={section.name}>
                                      <div className={`px-4 py-3 ${section.color} border-l-4 font-semibold text-sm`}>
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <span>{section.name}</span>
                                            <span className="text-xs opacity-70">({sectionExercises.length} exercises)</span>
                                            <Badge className="text-xs bg-white/50">{sectionVideos}/{sectionExercises.length} videos</Badge>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {['Main Workout', 'Finisher Flow', 'Beginner Option'].includes(section.name) && (
                                              editingPlayAll === sectionKey ? (
                                                <div className="flex items-center gap-2">
                                                  <Input
                                                    placeholder="Playlist URL..."
                                                    value={playAllUrls[sectionKey] || ''}
                                                    onChange={(e) => setPlayAllUrls(prev => ({
                                                      ...prev,
                                                      [sectionKey]: e.target.value
                                                    }))}
                                                    className="w-64 h-7 text-xs"
                                                    data-testid={`input-section-play-all-${sectionKey}`}
                                                  />
                                                  <Button
                                                    size="sm"
                                                    onClick={() => handleSavePlayAll(sectionKey)}
                                                    disabled={savingPlayAll === sectionKey}
                                                    className="h-7 px-2 bg-green-600 hover:bg-green-700"
                                                  >
                                                    {savingPlayAll === sectionKey ? (
                                                      <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                      <Save className="w-3 h-3" />
                                                    )}
                                                  </Button>
                                                  <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setEditingPlayAll(null)}
                                                    className="h-7 px-2"
                                                  >
                                                    <X className="w-3 h-3" />
                                                  </Button>
                                                </div>
                                              ) : playAllUrls[sectionKey] ? (
                                                <div className="flex items-center gap-2">
                                                  <a 
                                                    href={playAllUrls[sectionKey]}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-800 text-xs font-medium hover:underline"
                                                    data-testid={`link-section-play-all-${sectionKey}`}
                                                  >
                                                    <Play className="w-3 h-3" /> Play All
                                                  </a>
                                                  <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setEditingPlayAll(sectionKey)}
                                                    className="h-6 px-2 text-xs"
                                                  >
                                                    Edit
                                                  </Button>
                                                </div>
                                              ) : (
                                                <Button
                                                  size="sm"
                                                  variant="ghost"
                                                  onClick={() => setEditingPlayAll(sectionKey)}
                                                  className="h-6 px-2 text-xs flex items-center gap-1"
                                                  data-testid={`button-add-section-play-all-${sectionKey}`}
                                                >
                                                  <Video className="w-3 h-3" />
                                                  Add Play All
                                                </Button>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      {sectionExercises.map((exercise, index) => renderExerciseRow(exercise, exerciseCounter + index))}
                                    </div>
                                  );
                                })
                              ) : (
                                dayExercises.map((exercise, index) => renderExerciseRow(exercise, index))
                              )
                            ) : (
                              <div className="p-6 text-center text-gray-500">
                                No exercises mapped to this day yet
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Dumbbell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="font-medium">Exercise mappings not configured yet</p>
                  <p className="text-sm mt-1">Add day configurations to enable video editing for this program</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
