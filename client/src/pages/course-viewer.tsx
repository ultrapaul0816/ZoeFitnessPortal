import { useState, useEffect } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Play,
  ChevronRight,
  ChevronDown,
  Video,
  FileText,
  Dumbbell,
  Download,
  GraduationCap,
  Menu,
  Timer,
  RotateCcw,
  ExternalLink
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

export default function CourseViewer() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/courses/:courseId");
  const courseId = params?.courseId;
  
  const [user, setUser] = useState<User | null>(null);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { toast } = useToast();

  const toggleItem = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const { data: courseData, isLoading, error } = useQuery<CourseData>({
    queryKey: ["/api/courses", courseId],
    enabled: !!courseId,
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  useEffect(() => {
    if (courseData?.modules && courseData.modules.length > 0) {
      setExpandedModules([courseData.modules[0].id]);
    }
  }, [courseData?.modules]);

  const getContentIcon = (type: string) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case "video":
        return <Video className={`${iconClass} text-pink-600`} />;
      case "exercise":
        return <Dumbbell className={`${iconClass} text-pink-600`} />;
      case "workout":
        return <Dumbbell className={`${iconClass} text-pink-600`} />;
      case "pdf":
        return <Download className={`${iconClass} text-pink-600`} />;
      default:
        return <FileText className={`${iconClass} text-pink-600`} />;
    }
  };

  const WorkoutDisplay = ({ item }: { item: ContentItem }) => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h4 className="font-semibold text-gray-900">{item.workout_name || item.title}</h4>
        {item.workout_description && (
          <p className="text-gray-600 text-sm mt-1">{item.workout_description}</p>
        )}
        <div className="flex flex-wrap gap-2 mt-3">
          {item.workout_total_duration && (
            <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-1">
              <Timer className="w-3 h-3" />
              {item.workout_total_duration} min
            </span>
          )}
          {item.workout_rounds && (
            <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-1">
              <RotateCcw className="w-3 h-3" />
              {item.workout_rounds} rounds
            </span>
          )}
          {item.workout_rest_between_exercises && (
            <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-1">
              <Clock className="w-3 h-3" />
              {item.workout_rest_between_exercises}s rest
            </span>
          )}
        </div>
      </div>

      {item.workout_coach_notes && (
        <div className="px-4 py-3 bg-pink-50 border-b border-pink-100">
          <div className="flex items-start gap-3">
            <img 
              src={zoeImagePath} 
              alt="Zoe" 
              className="w-8 h-8 rounded-full border border-pink-200"
            />
            <div>
              <p className="text-xs font-medium text-pink-700">Coach Zoe</p>
              <p className="text-sm text-gray-600 mt-0.5">{item.workout_coach_notes}</p>
            </div>
          </div>
        </div>
      )}

      {item.workout_exercises && item.workout_exercises.length > 0 && (
        <div className="p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            {item.workout_exercises.length} Exercises
          </p>
          <div className="space-y-3">
            {item.workout_exercises.map((exercise: any, idx: number) => (
              <div 
                key={exercise.id || idx}
                className="bg-gray-50 rounded-lg overflow-hidden"
              >
                <div className="flex items-start gap-3 p-3">
                  <span className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 text-xs font-medium flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm leading-tight">
                      {exercise.exercise_name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {exercise.reps && <span>{exercise.reps}</span>}
                      {exercise.duration_seconds && <span>{exercise.duration_seconds}s</span>}
                    </p>
                  </div>
                </div>
                
                {exercise.exercise_video_url && (
                  <a 
                    href={exercise.exercise_video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 pb-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 relative">
                      <img 
                        src={getYouTubeThumbnail(exercise.exercise_video_url) || ""}
                        alt={exercise.exercise_name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                          <Play className="w-4 h-4 text-pink-500 ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <span className="text-pink-600 hover:text-pink-700 text-sm font-medium">
                      Watch Video
                    </span>
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
        <div className="bg-gray-50 rounded-lg overflow-hidden">
          <div className="p-3">
            <p className="font-medium text-gray-800 text-sm leading-tight">{item.exercise_name || item.title}</p>
            {item.description && (
              <p className="text-xs text-gray-500 mt-1">{item.description}</p>
            )}
          </div>
          {item.exercise_video_url && (
            <a 
              href={item.exercise_video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 pb-3"
            >
              <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 relative">
                <img 
                  src={getYouTubeThumbnail(item.exercise_video_url) || ""}
                  alt={item.exercise_name || item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="w-4 h-4 text-pink-500 ml-0.5" />
                  </div>
                </div>
              </div>
              <span className="text-pink-600 hover:text-pink-700 text-sm font-medium">
                Watch Video
              </span>
            </a>
          )}
        </div>
      );
    }

    if (item.content_type === "video") {
      return (
        <a 
          href={item.video_url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {item.video_url && (
            <div className="w-20 h-14 rounded overflow-hidden flex-shrink-0 relative">
              <img 
                src={getYouTubeThumbnail(item.video_url) || ""}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                  <Play className="w-4 h-4 text-pink-500 ml-0.5" />
                </div>
              </div>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-800 text-sm">{item.title}</p>
            {item.description && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>
            )}
            {item.duration_minutes && (
              <p className="text-xs text-gray-400 mt-1">{item.duration_minutes} min</p>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
        </a>
      );
    }

    const isExpanded = expandedItems.includes(item.id);
    const hasContent = item.description || item.video_url;
    
    if (item.content_type === "pdf" && item.video_url) {
      return (
        <a 
          href={item.video_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5 text-pink-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-800 text-sm">{item.title}</p>
            <p className="text-xs text-pink-600 mt-0.5">Tap to download</p>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400" />
        </a>
      );
    }

    return (
      <button 
        onClick={() => hasContent && toggleItem(item.id)}
        className={`w-full text-left p-4 bg-gray-50 rounded-lg transition-colors ${hasContent ? 'hover:bg-gray-100 active:bg-gray-200 cursor-pointer' : ''}`}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
            {getContentIcon(item.content_type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-800 text-sm">{item.title}</p>
            {!isExpanded && item.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
            )}
          </div>
          {hasContent && (
            <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          )}
        </div>
        
        {isExpanded && item.description && (
          <div className="mt-3 pt-3 border-t border-gray-200 ml-13">
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
              {item.description}
            </p>
            {item.video_url && (
              <a 
                href={item.video_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-2 mt-3 text-pink-600 hover:text-pink-700 text-sm font-medium"
              >
                <Play className="w-4 h-4" />
                Watch Video
              </a>
            )}
          </div>
        )}
      </button>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Skeleton className="h-32 w-full rounded-xl mb-6" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <GraduationCap className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Course Not Found</h2>
            <p className="text-gray-500 text-sm mb-4">
              This course might not exist or you may not be enrolled.
            </p>
            <Link href="/my-courses">
              <Button className="bg-pink-500 hover:bg-pink-600">
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Link href="/my-courses">
              <Button variant="ghost" size="sm" className="gap-1 text-gray-600 hover:text-gray-900 -ml-2">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </Link>
            
            <span className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">
              {course.name}
            </span>

            <button 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setShowProfileSettings(!showProfileSettings)}
              data-testid="button-menu"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs bg-pink-50 text-pink-700 border-0">
                  {course.level}
                </Badge>
                <span className="text-xs text-gray-500">{course.duration_weeks} weeks</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">{course.name}</h1>
              <p className="text-gray-600 text-sm">{course.description}</p>
              
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium text-pink-600">{Math.round(enrollment.progress_percentage || 0)}%</span>
                </div>
                <Progress value={enrollment.progress_percentage || 0} className="h-1.5" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {modules.map((module, moduleIdx) => (
            <Accordion 
              key={module.id} 
              type="single" 
              collapsible
              defaultValue={moduleIdx === 0 ? module.id : undefined}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <AccordionItem value={module.id} className="border-0">
                <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-gray-50 data-[state=open]:bg-gray-50">
                  <div className="flex items-center gap-3 text-left">
                    <span className="w-7 h-7 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600 text-sm font-semibold flex-shrink-0">
                      {moduleIdx + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{module.name}</h3>
                      {module.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{module.description}</p>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4 pt-2">
                    {module.sections.map((section, sectionIdx) => (
                      <div key={section.id}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-medium">
                            {sectionIdx + 1}
                          </span>
                          <h4 className="font-medium text-gray-800 text-sm">{section.name}</h4>
                        </div>
                        
                        {section.contentItems.length > 0 ? (
                          <div className="space-y-2 ml-7">
                            {section.contentItems.map((item) => (
                              <ContentItemDisplay key={item.id} item={item} />
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 ml-7">No content yet</p>
                        )}
                      </div>
                    ))}
                    
                    {module.sections.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">No sections in this module</p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </div>

        {modules.length === 0 && (
          <Card className="border-dashed border-2 border-gray-200">
            <CardContent className="py-12 text-center">
              <GraduationCap className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-semibold text-gray-700 mb-1">
                Content Coming Soon
              </h3>
              <p className="text-gray-500 text-sm">
                This course is being prepared. Check back soon!
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
