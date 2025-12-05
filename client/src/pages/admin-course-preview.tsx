import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { useSession } from "@/hooks/use-session";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft,
  GraduationCap, 
  Layers, 
  Edit, 
  Eye, 
  EyeOff, 
  BookOpen,
  Video,
  FileText,
  Dumbbell,
  HelpCircle,
  Loader2,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  PlayCircle,
  ExternalLink,
  BarChart3,
  Apple,
  Lightbulb,
  Award,
  Image as ImageIcon,
  RotateCcw,
  Timer
} from "lucide-react";

interface ContentItem {
  id: string;
  title: string;
  content_type: string;
  content?: string;
  description?: string;
  video_url?: string;
  duration?: string;
  duration_minutes?: number;
  exercise_id?: string;
  exercise_name?: string;
  exercise_video_url?: string;
  exercise_duration?: string;
  exercise_default_reps?: string;
  exercise_category?: string;
  exercise_display_id?: string;
  exercise_description?: string;
  exercise_difficulty?: string;
  reps_override?: string;
  structured_workout_id?: string;
  workout_name?: string;
  workout_type?: string;
  workout_rounds?: number;
  workout_rest_between_exercises?: number;
  workout_rest_between_rounds?: number;
  workout_total_duration?: string;
  workout_difficulty?: string;
  workout_exercises?: WorkoutExercise[];
  metadata?: any;
}

interface WorkoutExercise {
  id: string;
  exercise_name: string;
  exercise_video_url?: string;
  reps?: string;
  sets?: number;
  duration?: string;
  rest_after?: number;
  side_specific?: boolean;
  order_index: number;
}

interface Section {
  id: string;
  title: string;
  description?: string;
  order_index: number;
  contentItems: ContentItem[];
}

interface Module {
  id: string;
  name: string;
  description?: string;
  module_type: string;
  color_theme?: string;
  sections: Section[];
  mapping_order?: number;
  is_required?: boolean;
}

interface CoursePreviewData {
  course: {
    id: string;
    name: string;
    slug: string;
    description: string;
    short_description?: string;
    level?: string;
    duration_weeks?: number;
    status: string;
    image_url?: string;
    thumbnail_url?: string;
    is_visible?: boolean;
  };
  modules: Module[];
  stats: {
    totalModules: number;
    totalSections: number;
    totalItems: number;
    modulesWithContent: number;
    emptyModules: string[];
    emptySections: { module: string; section: string }[];
  };
}

const moduleTypeIcons: Record<string, React.ElementType> = {
  educational: Lightbulb,
  workout: Dumbbell,
  faq: HelpCircle,
  progress: Award,
  nutrition: Apple,
};

const moduleTypeLabels: Record<string, string> = {
  educational: "Educational",
  workout: "Workout Program",
  faq: "FAQ",
  progress: "Progress Tracking",
  nutrition: "Nutrition",
};

const colorThemeClasses: Record<string, string> = {
  pink: "bg-gradient-to-r from-pink-500 to-rose-500",
  blue: "bg-gradient-to-r from-blue-500 to-cyan-500",
  green: "bg-gradient-to-r from-green-500 to-emerald-500",
  purple: "bg-gradient-to-r from-purple-500 to-violet-500",
  orange: "bg-gradient-to-r from-orange-500 to-amber-500",
  teal: "bg-gradient-to-r from-teal-500 to-cyan-500",
};

const colorThemeBorderClasses: Record<string, string> = {
  pink: "border-pink-300",
  blue: "border-blue-300",
  green: "border-green-300",
  purple: "border-purple-300",
  orange: "border-orange-300",
  teal: "border-teal-300",
};

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default function AdminCoursePreview() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;
  const { user, loading: sessionLoading } = useSession();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("preview");

  const { data, isLoading, error } = useQuery<CoursePreviewData>({
    queryKey: ["/api/admin/courses", courseId, "preview"],
    queryFn: async () => {
      const response = await fetch(`/api/admin/courses/${courseId}/preview`);
      if (!response.ok) throw new Error("Failed to fetch course preview");
      return response.json();
    },
    enabled: !sessionLoading && !!user?.isAdmin && !!courseId,
  });

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const expandAll = () => {
    if (data) {
      setExpandedModules(new Set(data.modules.map(m => m.id)));
      setExpandedSections(new Set(data.modules.flatMap(m => m.sections.map(s => s.id))));
    }
  };

  const collapseAll = () => {
    setExpandedModules(new Set());
    setExpandedSections(new Set());
  };

  if (sessionLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (!user?.isAdmin) {
    setLocation("/");
    return null;
  }

  if (error || !data) {
    return (
      <AdminLayout
        activeTab="courses"
        onTabChange={() => setLocation("/admin")}
        onNavigate={setLocation}
      >
        <div className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load course preview</h2>
          <p className="text-gray-500 mb-4">Please try again or go back to courses.</p>
          <Button onClick={() => setLocation("/admin/courses")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const { course, modules, stats } = data;
  const hasIssues = stats.emptyModules.length > 0 || stats.emptySections.length > 0 || !course.image_url;

  return (
    <AdminLayout
      activeTab="courses"
      onTabChange={() => setLocation("/admin")}
      onNavigate={setLocation}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setLocation("/admin/courses")}
              className="flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Eye className="w-7 h-7 text-pink-500" />
                Course Preview
              </h1>
              <p className="text-gray-500 mt-1">Preview how "{course.name}" will appear to users</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={expandAll}
            >
              Expand All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={collapseAll}
            >
              Collapse All
            </Button>
            <Button
              onClick={() => setLocation(`/admin/courses/${courseId}`)}
              className="bg-gradient-to-r from-pink-500 to-rose-500"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Course
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border shadow-sm">
            <TabsTrigger value="preview" className="data-[state=active]:bg-pink-50 data-[state=active]:text-pink-700">
              <Eye className="w-4 h-4 mr-2" />
              User View
            </TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:bg-pink-50 data-[state=active]:text-pink-700">
              <BarChart3 className="w-4 h-4 mr-2" />
              Content Audit
              {hasIssues && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full">
                  {stats.emptyModules.length + stats.emptySections.length + (course.image_url ? 0 : 1)}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* User View Tab */}
          <TabsContent value="preview" className="space-y-6">
            {/* Course Header (as user would see it) */}
            <Card className="overflow-hidden">
              <div className="relative h-48 md:h-64 bg-gradient-to-br from-pink-100 to-rose-100">
                {course.image_url ? (
                  <img 
                    src={course.image_url} 
                    alt={course.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon className="w-16 h-16 mb-2" />
                    <span className="text-sm">No course image uploaded</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={course.status === "published" ? "bg-green-500" : "bg-gray-500"}>
                      {course.status}
                    </Badge>
                    {course.level && (
                      <Badge variant="outline" className="border-white/50 text-white">
                        {course.level}
                      </Badge>
                    )}
                    {course.duration_weeks && (
                      <Badge variant="outline" className="border-white/50 text-white">
                        <Clock className="w-3 h-3 mr-1" />
                        {course.duration_weeks} weeks
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold">{course.name}</h2>
                  {course.short_description && (
                    <p className="text-white/80 mt-2">{course.short_description}</p>
                  )}
                </div>
              </div>
              {course.description && (
                <CardContent className="pt-4">
                  <p className="text-gray-600">{course.description}</p>
                </CardContent>
              )}
            </Card>

            {/* Modules List (as user would see it) */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Course Modules ({modules.length})</h3>
              
              {modules.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <Layers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No modules assigned to this course yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {modules.map((module, moduleIndex) => {
                    const Icon = moduleTypeIcons[module.module_type] || BookOpen;
                    const isModuleExpanded = expandedModules.has(module.id);
                    const moduleHasContent = module.sections.some(s => s.contentItems.length > 0);
                    const colorTheme = module.color_theme || "pink";

                    return (
                      <Card 
                        key={module.id} 
                        className={`overflow-hidden border-l-4 ${colorThemeBorderClasses[colorTheme] || "border-pink-300"}`}
                      >
                        <Collapsible open={isModuleExpanded} onOpenChange={() => toggleModule(module.id)}>
                          <CollapsibleTrigger className="w-full">
                            <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${colorThemeClasses[colorTheme] || colorThemeClasses.pink}`}>
                                  <Icon className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-400">Module {moduleIndex + 1}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {moduleTypeLabels[module.module_type]}
                                    </Badge>
                                    {!moduleHasContent && (
                                      <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                                        Empty
                                      </Badge>
                                    )}
                                  </div>
                                  <h4 className="font-semibold text-gray-900">{module.name}</h4>
                                  {module.description && (
                                    <p className="text-sm text-gray-500 line-clamp-1">{module.description}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right text-sm text-gray-500">
                                  <span>{module.sections.length} sections</span>
                                  <span className="mx-1">•</span>
                                  <span>{module.sections.reduce((sum, s) => sum + s.contentItems.length, 0)} items</span>
                                </div>
                                {isModuleExpanded ? (
                                  <ChevronDown className="w-5 h-5 text-gray-400" />
                                ) : (
                                  <ChevronRight className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="border-t bg-gray-50/50 p-4 space-y-3">
                              {module.sections.length === 0 ? (
                                <p className="text-gray-500 text-sm italic">No sections in this module</p>
                              ) : (
                                module.sections.map((section, sectionIndex) => {
                                  const isSectionExpanded = expandedSections.has(section.id);
                                  
                                  return (
                                    <Card key={section.id} className="bg-white">
                                      <Collapsible open={isSectionExpanded} onOpenChange={() => toggleSection(section.id)}>
                                        <CollapsibleTrigger className="w-full">
                                          <div className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                                                {sectionIndex + 1}
                                              </div>
                                              <div className="text-left">
                                                <h5 className="font-medium text-gray-900">{section.title}</h5>
                                                {section.description && (
                                                  <p className="text-xs text-gray-500">{section.description}</p>
                                                )}
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                              <span className="text-sm text-gray-500">
                                                {section.contentItems.length} item{section.contentItems.length !== 1 ? 's' : ''}
                                              </span>
                                              {section.contentItems.length === 0 ? (
                                                <XCircle className="w-4 h-4 text-amber-500" />
                                              ) : (
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                              )}
                                              {isSectionExpanded ? (
                                                <ChevronDown className="w-4 h-4 text-gray-400" />
                                              ) : (
                                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                              )}
                                            </div>
                                          </div>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                          <div className="border-t p-3 space-y-2 bg-gray-50/50">
                                            {section.contentItems.length === 0 ? (
                                              <p className="text-gray-400 text-sm italic py-2">No content items in this section</p>
                                            ) : (
                                              section.contentItems.map((item, itemIndex) => {
                                                const videoUrl = item.video_url || item.exercise_video_url;
                                                const youtubeId = videoUrl ? extractYouTubeId(videoUrl) : null;
                                                
                                                return (
                                                  <div 
                                                    key={item.id} 
                                                    className="flex items-start gap-3 p-3 bg-white rounded-lg border"
                                                  >
                                                    {/* Thumbnail or icon */}
                                                    {youtubeId ? (
                                                      <div className="relative w-24 h-14 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                                                        <img 
                                                          src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                                                          alt={item.title}
                                                          className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                          <PlayCircle className="w-8 h-8 text-white" />
                                                        </div>
                                                      </div>
                                                    ) : (
                                                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                        {item.content_type === "video" && <Video className="w-5 h-5 text-gray-500" />}
                                                        {item.content_type === "text" && <FileText className="w-5 h-5 text-gray-500" />}
                                                        {item.content_type === "exercise" && <Dumbbell className="w-5 h-5 text-gray-500" />}
                                                        {item.content_type === "pdf" && <FileText className="w-5 h-5 text-gray-500" />}
                                                        {item.content_type === "workout" && <RotateCcw className="w-5 h-5 text-purple-500" />}
                                                        {!["video", "text", "exercise", "pdf", "workout"].includes(item.content_type) && (
                                                          <BookOpen className="w-5 h-5 text-gray-500" />
                                                        )}
                                                      </div>
                                                    )}
                                                    
                                                    <div className="flex-1 min-w-0">
                                                      <div className="flex items-center gap-2">
                                                        <h6 className="font-medium text-gray-900 truncate">
                                                          {item.exercise_name || item.title}
                                                        </h6>
                                                        <Badge variant="outline" className="text-xs flex-shrink-0">
                                                          {item.content_type}
                                                        </Badge>
                                                        {item.exercise_display_id && (
                                                          <span className="text-xs text-gray-400 font-mono">
                                                            {item.exercise_display_id}
                                                          </span>
                                                        )}
                                                      </div>
                                                      
                                                      {/* Show content for text items */}
                                                      {item.content_type === 'text' && item.content && (
                                                        <div className="mt-2 p-3 bg-gray-50 rounded-lg border text-sm text-gray-700 whitespace-pre-wrap">
                                                          {item.content}
                                                        </div>
                                                      )}
                                                      
                                                      {/* Show images from metadata */}
                                                      {item.metadata?.images && item.metadata.images.length > 0 && (
                                                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                          {item.metadata.images.map((img: { path: string; alt: string }, imgIdx: number) => (
                                                            <div key={imgIdx} className="rounded-lg overflow-hidden border bg-white shadow-sm">
                                                              <img 
                                                                src={img.path} 
                                                                alt={img.alt}
                                                                className="w-full h-auto object-contain"
                                                              />
                                                              <p className="text-xs text-gray-500 p-2 bg-gray-50 border-t">{img.alt}</p>
                                                            </div>
                                                          ))}
                                                        </div>
                                                      )}
                                                      
                                                      {/* Show description for other items */}
                                                      {item.content_type !== 'text' && item.content_type !== 'workout' && (item.description || item.exercise_description) && (
                                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                          {item.description || item.exercise_description}
                                                        </p>
                                                      )}
                                                      
                                                      {/* Show structured workout details */}
                                                      {item.content_type === 'workout' && (
                                                        <div className="mt-3 space-y-3">
                                                          {/* Workout stats */}
                                                          <div className="flex flex-wrap gap-3 text-xs">
                                                            {item.workout_rounds && (
                                                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                                                <RotateCcw className="w-3 h-3 mr-1" />
                                                                {item.workout_rounds} round{item.workout_rounds > 1 ? 's' : ''}
                                                              </Badge>
                                                            )}
                                                            {item.workout_rest_between_exercises && (
                                                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                                <Timer className="w-3 h-3 mr-1" />
                                                                {item.workout_rest_between_exercises}s rest between exercises
                                                              </Badge>
                                                            )}
                                                            {item.workout_total_duration && (
                                                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                                <Clock className="w-3 h-3 mr-1" />
                                                                {item.workout_total_duration}
                                                              </Badge>
                                                            )}
                                                            {item.workout_difficulty && (
                                                              <Badge variant="outline" className="capitalize">
                                                                {item.workout_difficulty}
                                                              </Badge>
                                                            )}
                                                          </div>
                                                          
                                                          {/* Exercise list */}
                                                          {item.workout_exercises && item.workout_exercises.length > 0 && (
                                                            <div className="bg-gray-50 rounded-lg p-3 border">
                                                              <h6 className="text-xs font-semibold text-gray-600 mb-2">
                                                                Exercises ({item.workout_exercises.length})
                                                              </h6>
                                                              <div className="space-y-2">
                                                                {item.workout_exercises.map((ex, exIdx) => (
                                                                  <div key={ex.id} className="flex items-center gap-2 text-sm">
                                                                    <span className="w-5 h-5 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xs font-medium">
                                                                      {exIdx + 1}
                                                                    </span>
                                                                    <span className="font-medium text-gray-800">{ex.exercise_name}</span>
                                                                    {ex.reps && (
                                                                      <span className="text-gray-500 text-xs">{ex.reps}</span>
                                                                    )}
                                                                    {ex.sets && ex.sets > 1 && (
                                                                      <Badge variant="outline" className="text-xs">{ex.sets} sets</Badge>
                                                                    )}
                                                                    {ex.side_specific && (
                                                                      <Badge variant="outline" className="text-xs">Each side</Badge>
                                                                    )}
                                                                    {ex.exercise_video_url && (
                                                                      <a 
                                                                        href={ex.exercise_video_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="ml-auto text-blue-600 hover:text-blue-800"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                      >
                                                                        <PlayCircle className="w-4 h-4" />
                                                                      </a>
                                                                    )}
                                                                  </div>
                                                                ))}
                                                              </div>
                                                            </div>
                                                          )}
                                                        </div>
                                                      )}
                                                      
                                                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                                        {(item.reps_override || item.exercise_default_reps) && (
                                                          <span className="flex items-center gap-1">
                                                            <Dumbbell className="w-3 h-3" />
                                                            {item.reps_override || item.exercise_default_reps}
                                                          </span>
                                                        )}
                                                        {(item.duration || item.exercise_duration || item.duration_minutes) && (
                                                          <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {item.duration || item.exercise_duration || `${item.duration_minutes} min`}
                                                          </span>
                                                        )}
                                                        {(item.exercise_category || item.exercise_difficulty) && (
                                                          <div className="flex items-center gap-1">
                                                            {item.exercise_category && (
                                                              <Badge variant="outline" className="text-xs">
                                                                {item.exercise_category}
                                                              </Badge>
                                                            )}
                                                            {item.exercise_difficulty && (
                                                              <Badge variant="outline" className="text-xs">
                                                                {item.exercise_difficulty}
                                                              </Badge>
                                                            )}
                                                          </div>
                                                        )}
                                                        {videoUrl && (
                                                          <a 
                                                            href={videoUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 text-blue-600 hover:underline"
                                                            onClick={(e) => e.stopPropagation()}
                                                          >
                                                            <ExternalLink className="w-3 h-3" />
                                                            Watch Video
                                                          </a>
                                                        )}
                                                      </div>
                                                    </div>
                                                  </div>
                                                );
                                              })
                                            )}
                                          </div>
                                        </CollapsibleContent>
                                      </Collapsible>
                                    </Card>
                                  );
                                })
                              )}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Content Audit Tab */}
          <TabsContent value="audit" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-gray-900">{stats.totalModules}</div>
                  <p className="text-sm text-gray-500">Total Modules</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-gray-900">{stats.totalSections}</div>
                  <p className="text-sm text-gray-500">Total Sections</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-gray-900">{stats.totalItems}</div>
                  <p className="text-sm text-gray-500">Content Items</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold text-gray-900">{stats.modulesWithContent}</div>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-500">{stats.totalModules}</span>
                  </div>
                  <p className="text-sm text-gray-500">Modules with Content</p>
                </CardContent>
              </Card>
            </div>

            {/* Issues */}
            {!course.image_url && (
              <Alert variant="destructive" className="border-amber-200 bg-amber-50">
                <ImageIcon className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">Missing Course Image</AlertTitle>
                <AlertDescription className="text-amber-700">
                  This course doesn't have a cover image. Add one in the course editor to improve the visual appeal.
                </AlertDescription>
              </Alert>
            )}

            {stats.emptyModules.length > 0 && (
              <Alert variant="destructive" className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">Empty Modules ({stats.emptyModules.length})</AlertTitle>
                <AlertDescription className="text-amber-700">
                  <p className="mb-2">The following modules have no content:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {stats.emptyModules.map((name, i) => (
                      <li key={i}>{name}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {stats.emptySections.length > 0 && (
              <Alert variant="destructive" className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">Empty Sections ({stats.emptySections.length})</AlertTitle>
                <AlertDescription className="text-amber-700">
                  <p className="mb-2">The following sections have no content items:</p>
                  <ScrollArea className="h-32">
                    <ul className="list-disc list-inside space-y-1">
                      {stats.emptySections.map((item, i) => (
                        <li key={i}>
                          <span className="font-medium">{item.module}</span> → {item.section}
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </AlertDescription>
              </Alert>
            )}

            {!hasIssues && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Content Complete</AlertTitle>
                <AlertDescription className="text-green-700">
                  All modules and sections have content. The course is ready for users!
                </AlertDescription>
              </Alert>
            )}

            {/* Module Content Summary Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Module Content Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-3 font-medium text-gray-600">Module</th>
                        <th className="text-left p-3 font-medium text-gray-600">Type</th>
                        <th className="text-center p-3 font-medium text-gray-600">Sections</th>
                        <th className="text-center p-3 font-medium text-gray-600">Items</th>
                        <th className="text-center p-3 font-medium text-gray-600">Status</th>
                        <th className="text-right p-3 font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modules.map((module) => {
                        const totalItems = module.sections.reduce((sum, s) => sum + s.contentItems.length, 0);
                        const emptySectionsCount = module.sections.filter(s => s.contentItems.length === 0).length;
                        const hasContent = totalItems > 0;
                        
                        return (
                          <tr key={module.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">
                              <span className="font-medium text-gray-900">{module.name}</span>
                            </td>
                            <td className="p-3">
                              <Badge variant="outline" className="text-xs">
                                {moduleTypeLabels[module.module_type]}
                              </Badge>
                            </td>
                            <td className="p-3 text-center">
                              <span className={emptySectionsCount > 0 ? "text-amber-600" : ""}>
                                {module.sections.length - emptySectionsCount}/{module.sections.length}
                              </span>
                            </td>
                            <td className="p-3 text-center">{totalItems}</td>
                            <td className="p-3 text-center">
                              {hasContent ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                              ) : (
                                <XCircle className="w-5 h-5 text-amber-500 mx-auto" />
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setLocation(`/admin/modules/${module.id}`)}
                                className="text-pink-600 hover:text-pink-700"
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
