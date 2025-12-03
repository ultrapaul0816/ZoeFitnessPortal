import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSession } from "@/hooks/use-session";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Plus, 
  Loader2, 
  GripVertical, 
  Trash2, 
  BookOpen,
  Dumbbell,
  HelpCircle,
  TrendingUp,
  Apple,
  Eye,
  EyeOff,
  Clock,
  Users,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

type Course = {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string | null;
  level: string;
  duration_weeks: number | null;
  status: string;
  image_url: string | null;
  thumbnail_url: string | null;
  price: number;
  is_visible: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
};

type CourseModule = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  module_type: string;
  icon_name: string | null;
  color_theme: string;
  is_reusable: boolean;
};

type CourseModuleMapping = {
  id: string;
  course_id: string;
  module_id: string;
  order_index: number;
  name: string;
  slug: string;
  description: string | null;
  module_type: string;
  icon_name: string | null;
  color_theme: string;
};

const moduleTypeIcons: Record<string, typeof BookOpen> = {
  educational: BookOpen,
  workout: Dumbbell,
  faq: HelpCircle,
  progress: TrendingUp,
  nutrition: Apple,
};

const colorThemeClasses: Record<string, string> = {
  pink: "bg-pink-100 text-pink-600",
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
  purple: "bg-purple-100 text-purple-600",
  orange: "bg-orange-100 text-orange-600",
  teal: "bg-teal-100 text-teal-600",
};

const moduleTypeLabels: Record<string, string> = {
  educational: "Educational",
  workout: "Workout Program",
  faq: "FAQ",
  progress: "Progress Tracking",
  nutrition: "Nutrition",
};

export default function AdminCourseEditor() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/admin/courses/:courseId");
  const courseId = params?.courseId;
  const { user, loading: sessionLoading } = useSession();
  const { toast } = useToast();

  const [showAddModule, setShowAddModule] = useState(false);
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    queryKey: ['/api/admin/courses', courseId],
    enabled: !!courseId,
  });

  const { data: assignedModules = [], isLoading: assignedLoading } = useQuery<CourseModuleMapping[]>({
    queryKey: ['/api/admin/courses', courseId, 'modules'],
    enabled: !!courseId,
  });

  const { data: allModules = [], isLoading: allModulesLoading } = useQuery<CourseModule[]>({
    queryKey: ['/api/admin/modules'],
  });

  const assignModuleMutation = useMutation({
    mutationFn: (moduleId: string) => 
      apiRequest("POST", `/api/admin/courses/${courseId}/modules`, { 
        moduleId,
        orderIndex: assignedModules.length 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses', courseId, 'modules'] });
      toast({ title: "Module added to course" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to add module", description: error.message, variant: "destructive" });
    },
  });

  const removeModuleMutation = useMutation({
    mutationFn: (mappingId: string) => 
      apiRequest("DELETE", `/api/admin/course-modules/${mappingId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses', courseId, 'modules'] });
      toast({ title: "Module removed from course" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to remove module", description: error.message, variant: "destructive" });
    },
  });

  const handleAddSelectedModules = async () => {
    const moduleIds = Array.from(selectedModules);
    for (const moduleId of moduleIds) {
      await assignModuleMutation.mutateAsync(moduleId);
    }
    setSelectedModules(new Set());
    setShowAddModule(false);
  };

  const toggleModuleSelection = (moduleId: string) => {
    const newSelected = new Set(selectedModules);
    if (newSelected.has(moduleId)) {
      newSelected.delete(moduleId);
    } else {
      newSelected.add(moduleId);
    }
    setSelectedModules(newSelected);
  };

  const assignedModuleIds = new Set(assignedModules.map(m => m.module_id));
  const availableModules = allModules.filter(m => !assignedModuleIds.has(m.id));

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !courseId) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`/api/admin/courses/${courseId}/image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      await queryClient.invalidateQueries({ queryKey: ['/api/admin/courses', courseId] });
      
      toast({
        title: "Image Uploaded",
        description: "Course image has been updated successfully",
      });
    } catch (error) {
      console.error('Image upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  useEffect(() => {
    if (!sessionLoading && !user?.isAdmin) {
      setLocation("/");
    }
  }, [sessionLoading, user, setLocation]);

  if (sessionLoading || courseLoading) {
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

  const handleNavigate = (path: string) => setLocation(path);

  return (
    <AdminLayout
      activeTab="courses"
      onTabChange={() => setLocation("/admin")}
      onNavigate={handleNavigate}
    >
      <div className="p-6 max-w-5xl mx-auto">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => setLocation("/admin/courses")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </Button>

        {course && (
          <Card className="mb-6 overflow-hidden">
            <div className="relative h-48 bg-gradient-to-r from-pink-500 to-rose-500">
              {course.image_url ? (
                <img 
                  src={course.image_url} 
                  alt={course.name}
                  className="w-full h-full object-cover"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              
              {/* Image Upload Button */}
              <div className="absolute top-4 right-4">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="bg-white/90 hover:bg-white text-gray-900"
                >
                  {isUploadingImage ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  {course.image_url ? 'Change Image' : 'Upload Image'}
                </Button>
              </div>
              
              {/* Course Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold mb-2" data-testid="text-course-name">{course.name}</h1>
                    <p className="opacity-90 mb-4">{course.short_description || course.description}</p>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="bg-white/20 text-white border-0 capitalize">
                        {course.level}
                      </Badge>
                      {course.duration_weeks && (
                        <Badge variant="secondary" className="bg-white/20 text-white border-0">
                          <Clock className="w-3 h-3 mr-1" />
                          {course.duration_weeks} weeks
                        </Badge>
                      )}
                      <Badge variant="secondary" className="bg-white/20 text-white border-0 capitalize">
                        {course.status}
                      </Badge>
                      {course.is_visible ? (
                        <Badge variant="secondary" className="bg-white/20 text-white border-0">
                          <Eye className="w-3 h-3 mr-1" />
                          Visible
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-white/20 text-white border-0">
                          <EyeOff className="w-3 h-3 mr-1" />
                          Hidden
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => setLocation(`/admin/courses/${courseId}/preview`)}
                    className="bg-blue-500 hover:bg-blue-600 text-white border-0"
                    data-testid="button-preview-course"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Course
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Course Modules</h2>
            <p className="text-gray-500 text-sm">Organize and order the modules in this course</p>
          </div>
          <Button 
            onClick={() => setShowAddModule(true)}
            className="bg-gradient-to-r from-pink-500 to-rose-500"
            data-testid="button-add-module"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Modules
          </Button>
        </div>

        {assignedLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          </div>
        ) : assignedModules.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">No modules assigned yet. Add modules to build your course structure.</p>
              <Button 
                onClick={() => setShowAddModule(true)}
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Modules
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {assignedModules.map((mapping, index) => {
              const Icon = moduleTypeIcons[mapping.module_type] || BookOpen;
              return (
                <Card key={mapping.id} className="hover:shadow-md transition-shadow" data-testid={`module-card-${mapping.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
                        <span className="text-sm text-gray-400 font-medium w-6">{index + 1}</span>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorThemeClasses[mapping.color_theme] || colorThemeClasses.pink}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{mapping.name}</h3>
                          <p className="text-sm text-gray-500">
                            {moduleTypeLabels[mapping.module_type]} • /{mapping.slug}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setLocation(`/admin/modules/${mapping.module_id}`)}
                          className="text-gray-600"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeModuleMutation.mutate(mapping.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          data-testid={`button-remove-module-${mapping.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={showAddModule} onOpenChange={setShowAddModule}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Modules to Course</DialogTitle>
              <DialogDescription>Select modules from your library to add to this course</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {allModulesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
                </div>
              ) : availableModules.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">All modules are already assigned to this course.</p>
                  <Button variant="outline" onClick={() => setLocation("/admin/modules")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Module
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableModules.map((module) => {
                    const Icon = moduleTypeIcons[module.module_type] || BookOpen;
                    const isSelected = selectedModules.has(module.id);
                    return (
                      <div 
                        key={module.id}
                        className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                          isSelected ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleModuleSelection(module.id)}
                        data-testid={`module-option-${module.id}`}
                      >
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={() => toggleModuleSelection(module.id)}
                        />
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorThemeClasses[module.color_theme] || colorThemeClasses.pink}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{module.name}</h4>
                          <p className="text-sm text-gray-500">
                            {moduleTypeLabels[module.module_type]}
                            {module.description && ` • ${module.description.substring(0, 50)}${module.description.length > 50 ? '...' : ''}`}
                          </p>
                        </div>
                        {module.is_reusable && (
                          <Badge variant="outline" className="text-xs">Reusable</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setSelectedModules(new Set());
                setShowAddModule(false);
              }}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddSelectedModules}
                disabled={selectedModules.size === 0 || assignModuleMutation.isPending}
                className="bg-gradient-to-r from-pink-500 to-rose-500"
                data-testid="button-confirm-add"
              >
                {assignModuleMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Add {selectedModules.size} Module{selectedModules.size !== 1 ? 's' : ''}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
