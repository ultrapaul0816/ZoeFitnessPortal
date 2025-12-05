import { useState, useEffect } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Calendar,
  Play,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Video,
  FileText,
  Dumbbell,
  Download,
  GraduationCap,
  Menu,
  Heart,
  Timer,
  RotateCcw,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProfileSettings from "@/components/profile-settings";
import zoeImagePath from "@assets/zoe_1_1764958643553.png";
import type { User } from "@shared/schema";

interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  content_type: 'video' | 'text' | 'pdf' | 'exercise' | 'workout';
  video_url: string | null;
  duration_minutes: number | null;
  exercise_name?: string;
  exercise_video_url?: string;
  exercise_description?: string;
  workout_name?: string;
  workout_description?: string;
  workout_type?: string;
  workout_rounds?: number;
  workout_rest_between_exercises?: number;
  workout_rest_between_rounds?: number;
  workout_total_duration?: number;
  workout_difficulty?: string;
  workout_coach_notes?: string;
  workout_exercises?: any[];
  metadata?: any;
}

interface Section {
  id: string;
  name: string;
  description: string | null;
  order_index: number;
  contentItems: ContentItem[];
}

interface Module {
  id: string;
  name: string;
  description: string | null;
  module_type: string;
  color_theme: string | null;
  sections: Section[];
}

interface CourseData {
  course: {
    id: string;
    name: string;
    description: string;
    level: string;
    duration_weeks: number;
    image_url: string | null;
  };
  modules: Module[];
  enrollment: {
    progress_percentage: number;
    enrolled_at: string;
  };
}

const getYouTubeThumbnail = (url: string | null | undefined): string | null => {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
};

const getModuleColor = (theme: string | null) => {
  const colors: Record<string, string> = {
    pink: "from-pink-500 to-pink-600",
    purple: "from-purple-500 to-purple-600", 
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    orange: "from-orange-500 to-orange-600",
  };
  return colors[theme || "pink"] || colors.pink;
};

export default function CourseViewer() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/courses/:courseId");
  const courseId = params?.courseId;
  
  const [user, setUser] = useState<User | null>(null);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  const { data: courseData, isLoading, error } = useQuery<CourseData>({
    queryKey: ["/api/courses", courseId],
    enabled: !!courseId,
  });

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4 text-blue-500" />;
      case "exercise":
        return <Dumbbell className="w-4 h-4 text-pink-500" />;
      case "workout":
        return <Zap className="w-4 h-4 text-orange-500" />;
      case "pdf":
        return <Download className="w-4 h-4 text-green-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const WorkoutDisplay = ({ item }: { item: ContentItem }) => (
    <div className="bg-gradient-to-br from-pink-50 to-white rounded-xl border border-pink-100 overflow-hidden">
      <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-4 text-white">
        <h4 className="font-semibold text-lg">{item.workout_name || item.title}</h4>
        {item.workout_description && (
          <p className="text-pink-100 text-sm mt-1">{item.workout_description}</p>
        )}
        <div className="flex flex-wrap gap-3 mt-3 text-sm">
          {item.workout_total_duration && (
            <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
              <Timer className="w-4 h-4" />
              <span>{item.workout_total_duration} min</span>
            </div>
          )}
          {item.workout_rounds && (
            <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
              <RotateCcw className="w-4 h-4" />
              <span>{item.workout_rounds} rounds</span>
            </div>
          )}
          {item.workout_rest_between_exercises && (
            <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
              <Clock className="w-4 h-4" />
              <span>{item.workout_rest_between_exercises}s rest</span>
            </div>
          )}
        </div>
      </div>

      {item.workout_coach_notes && (
        <div className="px-4 py-3 bg-pink-50 border-b border-pink-100">
          <div className="flex items-start gap-3">
            <img 
              src={zoeImagePath} 
              alt="Zoe" 
              className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
            />
            <div>
              <p className="text-sm font-medium text-pink-700">Zoe's Notes</p>
              <p className="text-sm text-gray-600 mt-1">{item.workout_coach_notes}</p>
            </div>
          </div>
        </div>
      )}

      {item.workout_exercises && item.workout_exercises.length > 0 && (
        <div className="p-4">
          <h5 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-pink-500" />
            Exercises ({item.workout_exercises.length})
          </h5>
          <div className="space-y-3">
            {item.workout_exercises.map((exercise: any, idx: number) => (
              <div 
                key={exercise.id || idx}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-medium text-sm">
                  {idx + 1}
                </div>
                
                {exercise.exercise_video_url && (
                  <div className="w-20 h-14 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={getYouTubeThumbnail(exercise.exercise_video_url) || ""}
                      alt={exercise.exercise_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">
                    {exercise.exercise_name}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    {exercise.reps && <span>{exercise.reps} reps</span>}
                    {exercise.duration_seconds && <span>{exercise.duration_seconds}s</span>}
                    {exercise.exercise_category && (
                      <Badge variant="outline" className="text-xs">
                        {exercise.exercise_category}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {exercise.exercise_video_url && (
                  <a 
                    href={exercise.exercise_video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Play className="w-4 h-4" />
                    Watch
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const ContentItemDisplay = ({ item }: { item: ContentItem }) => {
    if (item.content_type === "workout") {
      return <WorkoutDisplay item={item} />;
    }

    if (item.content_type === "exercise") {
      return (
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          {item.exercise_video_url && (
            <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <img 
                src={getYouTubeThumbnail(item.exercise_video_url) || ""}
                alt={item.exercise_name || item.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <p className="font-medium">{item.exercise_name || item.title}</p>
            {item.description && (
              <p className="text-sm text-gray-500 mt-1">{item.description}</p>
            )}
          </div>
          {item.exercise_video_url && (
            <a 
              href={item.exercise_video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Play className="w-4 h-4" />
              Watch
            </a>
          )}
        </div>
      );
    }

    if (item.content_type === "video") {
      return (
        <div className="rounded-lg overflow-hidden">
          {item.video_url && (
            <a 
              href={item.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block relative group"
            >
              <img 
                src={getYouTubeThumbnail(item.video_url) || ""}
                alt={item.title}
                className="w-full h-40 object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                  <Play className="w-8 h-8 text-pink-500 ml-1" />
                </div>
              </div>
            </a>
          )}
          <div className="p-4 bg-gray-50">
            <p className="font-medium">{item.title}</p>
            {item.description && (
              <p className="text-sm text-gray-500 mt-1">{item.description}</p>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start gap-3">
          {getContentIcon(item.content_type)}
          <div>
            <p className="font-medium">{item.title}</p>
            {item.description && (
              <p className="text-sm text-gray-500 mt-1">{item.description}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white p-6">
        <Skeleton className="h-64 w-full rounded-xl mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <GraduationCap className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Course Not Found</h2>
            <p className="text-gray-500 mb-4">
              This course might not exist or you may not be enrolled.
            </p>
            <Link href="/my-courses">
              <Button className="bg-gradient-to-r from-pink-500 to-pink-600">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Courses
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { course, modules, enrollment } = courseData;

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <header className="bg-white border-b border-gray-200 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/my-courses">
              <Button variant="ghost" className="gap-2 text-pink-600 hover:bg-pink-50">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">My Courses</span>
              </Button>
            </Link>
            
            <div className="text-center">
              <span className="text-lg font-bold bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
                {course.name}
              </span>
            </div>

            <button 
              className="p-3 transition-all duration-300 hover:scale-110 active:scale-95"
              onClick={() => setShowProfileSettings(!showProfileSettings)}
            >
              <Menu className="w-6 h-6 text-pink-500" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6 bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <Badge className="bg-white/20 text-white mb-2">{course.level}</Badge>
              <h1 className="text-2xl font-bold mb-2">{course.name}</h1>
              <p className="text-pink-100 mb-4">{course.description}</p>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration_weeks} weeks</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{modules.length} modules</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Your Progress</span>
                  <span>{Math.round(enrollment.progress_percentage || 0)}%</span>
                </div>
                <Progress value={enrollment.progress_percentage || 0} className="h-2 bg-white/30" />
              </div>
            </div>
            
            <div className="hidden md:block">
              <img 
                src={zoeImagePath} 
                alt="Zoe" 
                className="w-20 h-20 rounded-full border-4 border-white/30 object-cover"
              />
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 opacity-10">
            <Heart className="w-40 h-40" />
          </div>
        </div>

        <div className="space-y-4">
          {modules.map((module, moduleIdx) => (
            <Collapsible
              key={module.id}
              open={expandedModules.includes(module.id)}
              onOpenChange={() => toggleModule(module.id)}
            >
              <Card className="overflow-hidden border-pink-100">
                <CollapsibleTrigger className="w-full">
                  <div className={`bg-gradient-to-r ${getModuleColor(module.color_theme)} p-4 text-white flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-medium">
                        {moduleIdx + 1}
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold">{module.name}</h3>
                        {module.description && (
                          <p className="text-sm text-white/80 mt-0.5">{module.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-white/20 text-white">
                        {module.sections.length} sections
                      </Badge>
                      <ChevronDown className={`w-5 h-5 transition-transform ${expandedModules.includes(module.id) ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="p-4 space-y-4">
                    {module.sections.map((section, sectionIdx) => (
                      <div key={section.id} className="border border-gray-100 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-sm font-medium">
                            {sectionIdx + 1}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">{section.name}</h4>
                            {section.description && (
                              <p className="text-sm text-gray-500">{section.description}</p>
                            )}
                          </div>
                        </div>
                        
                        {section.contentItems.length > 0 && (
                          <div className="p-4 space-y-3">
                            {section.contentItems.map((item) => (
                              <ContentItemDisplay key={item.id} item={item} />
                            ))}
                          </div>
                        )}
                        
                        {section.contentItems.length === 0 && (
                          <div className="p-4 text-center text-gray-400 text-sm">
                            No content in this section yet
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {module.sections.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No sections in this module yet</p>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>

        {modules.length === 0 && (
          <Card className="border-dashed border-2 border-pink-200">
            <CardContent className="py-12 text-center">
              <GraduationCap className="w-16 h-16 mx-auto text-pink-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Content Coming Soon
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                This course is being prepared with love. Check back soon!
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      {user && (
        <ProfileSettings
          isOpen={showProfileSettings}
          onClose={() => setShowProfileSettings(false)}
          user={user}
          onUserUpdate={(updatedUser) => {
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
          }}
        />
      )}
    </div>
  );
}
