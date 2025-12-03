import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useSession } from "@/hooks/use-session";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  GraduationCap, 
  Layers, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  MoreVertical,
  BookOpen,
  Video,
  FileText,
  Dumbbell,
  HelpCircle,
  Loader2,
  ChevronRight,
  GripVertical,
  ArrowUpDown
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Course, CourseModule, InsertCourse, InsertCourseModule } from "@shared/schema";

const moduleTypeIcons: Record<string, React.ElementType> = {
  educational: BookOpen,
  workout: Dumbbell,
  faq: HelpCircle,
  progress: ArrowUpDown,
  nutrition: FileText,
};

const moduleTypeLabels: Record<string, string> = {
  educational: "Educational",
  workout: "Workout Program",
  faq: "FAQ",
  progress: "Progress Tracking",
  nutrition: "Nutrition",
};

const colorThemeClasses: Record<string, string> = {
  pink: "bg-pink-100 text-pink-700 border-pink-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  green: "bg-green-100 text-green-700 border-green-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200",
  orange: "bg-orange-100 text-orange-700 border-orange-200",
  teal: "bg-teal-100 text-teal-700 border-teal-200",
};

export default function AdminCourses() {
  const { user, loading: sessionLoading } = useSession();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("courses");
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [showCreateModule, setShowCreateModule] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);

  const [courseForm, setCourseForm] = useState<{
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    level: "beginner" | "intermediate" | "advanced";
    durationWeeks: number | null;
    status: "draft" | "published" | "archived";
  }>({
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    level: "beginner",
    durationWeeks: null,
    status: "draft",
  });

  const [moduleForm, setModuleForm] = useState<{
    name: string;
    slug: string;
    description: string;
    moduleType: "educational" | "workout" | "faq" | "progress" | "nutrition";
    colorTheme: "pink" | "blue" | "green" | "purple" | "orange" | "teal";
  }>({
    name: "",
    slug: "",
    description: "",
    moduleType: "educational",
    colorTheme: "pink",
  });

  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/admin/courses"],
    enabled: !sessionLoading && !!user?.isAdmin,
  });

  const { data: modules = [], isLoading: modulesLoading } = useQuery<CourseModule[]>({
    queryKey: ["/api/admin/modules"],
    enabled: !sessionLoading && !!user?.isAdmin,
  });

  const createCourseMutation = useMutation({
    mutationFn: async (data: Partial<InsertCourse>) => {
      const response = await apiRequest("POST", "/api/admin/courses", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      setShowCreateCourse(false);
      resetCourseForm();
      toast({ title: "Course created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create course", description: error.message, variant: "destructive" });
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertCourse> }) => {
      const response = await apiRequest("PATCH", `/api/admin/courses/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      setEditingCourse(null);
      resetCourseForm();
      toast({ title: "Course updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update course", description: error.message, variant: "destructive" });
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/courses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      toast({ title: "Course deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete course", description: error.message, variant: "destructive" });
    },
  });

  const createModuleMutation = useMutation({
    mutationFn: async (data: Partial<InsertCourseModule>) => {
      const response = await apiRequest("POST", "/api/admin/modules", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/modules"] });
      setShowCreateModule(false);
      resetModuleForm();
      toast({ title: "Module created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create module", description: error.message, variant: "destructive" });
    },
  });

  const updateModuleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertCourseModule> }) => {
      const response = await apiRequest("PATCH", `/api/admin/modules/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/modules"] });
      setEditingModule(null);
      resetModuleForm();
      toast({ title: "Module updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update module", description: error.message, variant: "destructive" });
    },
  });

  const deleteModuleMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/modules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/modules"] });
      toast({ title: "Module deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete module", description: error.message, variant: "destructive" });
    },
  });

  const resetCourseForm = () => {
    setCourseForm({
      name: "",
      slug: "",
      description: "",
      shortDescription: "",
      level: "beginner",
      durationWeeks: null,
      status: "draft",
    });
  };

  const resetModuleForm = () => {
    setModuleForm({
      name: "",
      slug: "",
      description: "",
      moduleType: "educational",
      colorTheme: "pink",
    });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleCreateCourse = () => {
    createCourseMutation.mutate({
      ...courseForm,
      slug: courseForm.slug || generateSlug(courseForm.name),
    });
  };

  const handleUpdateCourse = () => {
    if (!editingCourse) return;
    updateCourseMutation.mutate({
      id: editingCourse.id,
      data: {
        ...courseForm,
        slug: courseForm.slug || generateSlug(courseForm.name),
      },
    });
  };

  const handleCreateModule = () => {
    createModuleMutation.mutate({
      ...moduleForm,
      slug: moduleForm.slug || generateSlug(moduleForm.name),
    });
  };

  const handleUpdateModule = () => {
    if (!editingModule) return;
    updateModuleMutation.mutate({
      id: editingModule.id,
      data: {
        ...moduleForm,
        slug: moduleForm.slug || generateSlug(moduleForm.name),
      },
    });
  };

  const openEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      name: course.name,
      slug: course.slug,
      description: course.description,
      shortDescription: course.shortDescription || "",
      level: (course.level as "beginner" | "intermediate" | "advanced") || "beginner",
      durationWeeks: course.durationWeeks || null,
      status: (course.status as "draft" | "published" | "archived") || "draft",
    });
  };

  const openEditModule = (module: CourseModule) => {
    setEditingModule(module);
    setModuleForm({
      name: module.name,
      slug: module.slug,
      description: module.description || "",
      moduleType: module.moduleType as "educational" | "workout" | "faq" | "progress" | "nutrition",
      colorTheme: (module.colorTheme as "pink" | "blue" | "green" | "purple" | "orange" | "teal") || "pink",
    });
  };

  useEffect(() => {
    if (!sessionLoading && !user?.isAdmin) {
      setLocation("/");
    }
  }, [sessionLoading, user, setLocation]);

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

  const handleNavigate = (path: string) => setLocation(path);

  return (
    <AdminLayout
      activeTab="courses"
      onTabChange={() => setLocation("/admin")}
      onNavigate={handleNavigate}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <GraduationCap className="w-7 h-7 text-pink-500" />
              Course Management
            </h1>
            <p className="text-gray-500 mt-1">Create and manage courses with reusable modules</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border shadow-sm">
            <TabsTrigger value="courses" className="data-[state=active]:bg-pink-50 data-[state=active]:text-pink-700">
              <GraduationCap className="w-4 h-4 mr-2" />
              Courses ({courses.length})
            </TabsTrigger>
            <TabsTrigger value="modules" className="data-[state=active]:bg-pink-50 data-[state=active]:text-pink-700">
              <Layers className="w-4 h-4 mr-2" />
              Module Library ({modules.length})
            </TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={showCreateCourse} onOpenChange={setShowCreateCourse}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Course
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create New Course</DialogTitle>
                    <DialogDescription>Add a new course that users can enroll in</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Course Name</Label>
                      <Input
                        placeholder="e.g., Heal Your Core Complete Program"
                        value={courseForm.name}
                        onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>URL Slug (auto-generated)</Label>
                      <Input
                        placeholder="heal-your-core-complete-program"
                        value={courseForm.slug || generateSlug(courseForm.name)}
                        onChange={(e) => setCourseForm({ ...courseForm, slug: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Short Description</Label>
                      <Input
                        placeholder="Brief description for cards"
                        value={courseForm.shortDescription}
                        onChange={(e) => setCourseForm({ ...courseForm, shortDescription: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Full Description</Label>
                      <Textarea
                        placeholder="Detailed course description..."
                        value={courseForm.description}
                        onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Level</Label>
                        <Select value={courseForm.level} onValueChange={(v) => setCourseForm({ ...courseForm, level: v as "beginner" | "intermediate" | "advanced" })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Duration (weeks)</Label>
                        <Input
                          type="number"
                          min="1"
                          placeholder="e.g., 6"
                          value={courseForm.durationWeeks || ""}
                          onChange={(e) => setCourseForm({ ...courseForm, durationWeeks: e.target.value ? parseInt(e.target.value) : null })}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCreateCourse(false)}>Cancel</Button>
                    <Button 
                      onClick={handleCreateCourse}
                      disabled={!courseForm.name || !courseForm.description || createCourseMutation.isPending}
                      className="bg-gradient-to-r from-pink-500 to-rose-500"
                    >
                      {createCourseMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Create Course
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {coursesLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
              </div>
            ) : courses.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <GraduationCap className="w-12 h-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No courses yet</h3>
                  <p className="text-gray-500 mb-4">Create your first course to get started</p>
                  <Button onClick={() => setShowCreateCourse(true)} className="bg-gradient-to-r from-pink-500 to-rose-500">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Course
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {courses.map((course) => (
                  <Card key={course.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
                            <Badge variant={course.status === "published" ? "default" : "secondary"}>
                              {course.status}
                            </Badge>
                            {course.isVisible ? (
                              <Eye className="w-4 h-4 text-green-500" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <p className="text-gray-500 text-sm mb-3">{course.shortDescription || course.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="capitalize">{course.level}</span>
                            {course.durationWeeks && <span>{course.durationWeeks} weeks</span>}
                            <span className="text-gray-300">|</span>
                            <span>/{course.slug}</span>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setLocation(`/admin/courses/${course.id}`)}>
                              <Layers className="w-4 h-4 mr-2" />
                              Manage Modules
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditCourse(course)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => deleteCourseMutation.mutate(course.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Modules Tab */}
          <TabsContent value="modules" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={showCreateModule} onOpenChange={setShowCreateModule}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Module
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create New Module</DialogTitle>
                    <DialogDescription>Modules can be reused across multiple courses</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Module Name</Label>
                      <Input
                        placeholder="e.g., Start Here, Nutrition Guide"
                        value={moduleForm.name}
                        onChange={(e) => setModuleForm({ ...moduleForm, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>URL Slug (auto-generated)</Label>
                      <Input
                        placeholder="start-here"
                        value={moduleForm.slug || generateSlug(moduleForm.name)}
                        onChange={(e) => setModuleForm({ ...moduleForm, slug: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        placeholder="What does this module cover?"
                        value={moduleForm.description}
                        onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Module Type</Label>
                        <Select value={moduleForm.moduleType} onValueChange={(v) => setModuleForm({ ...moduleForm, moduleType: v as "educational" | "workout" | "faq" | "progress" | "nutrition" })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="educational">Educational</SelectItem>
                            <SelectItem value="workout">Workout Program</SelectItem>
                            <SelectItem value="nutrition">Nutrition</SelectItem>
                            <SelectItem value="progress">Progress Tracking</SelectItem>
                            <SelectItem value="faq">FAQ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Color Theme</Label>
                        <Select value={moduleForm.colorTheme} onValueChange={(v) => setModuleForm({ ...moduleForm, colorTheme: v as "pink" | "blue" | "green" | "purple" | "orange" | "teal" })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pink">Pink</SelectItem>
                            <SelectItem value="blue">Blue</SelectItem>
                            <SelectItem value="green">Green</SelectItem>
                            <SelectItem value="purple">Purple</SelectItem>
                            <SelectItem value="orange">Orange</SelectItem>
                            <SelectItem value="teal">Teal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCreateModule(false)}>Cancel</Button>
                    <Button 
                      onClick={handleCreateModule}
                      disabled={!moduleForm.name || createModuleMutation.isPending}
                      className="bg-gradient-to-r from-pink-500 to-rose-500"
                    >
                      {createModuleMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Create Module
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {modulesLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
              </div>
            ) : modules.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Layers className="w-12 h-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No modules yet</h3>
                  <p className="text-gray-500 mb-4">Create reusable modules for your courses</p>
                  <Button onClick={() => setShowCreateModule(true)} className="bg-gradient-to-r from-pink-500 to-rose-500">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Module
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {modules.map((module) => {
                  const Icon = moduleTypeIcons[module.moduleType] || BookOpen;
                  return (
                    <Card key={module.id} className="hover:shadow-md transition-shadow group">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorThemeClasses[module.colorTheme || "pink"]}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setLocation(`/admin/modules/${module.id}`)}>
                                <FileText className="w-4 h-4 mr-2" />
                                Manage Sections
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditModule(module)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => deleteModuleMutation.mutate(module.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{module.name}</h3>
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{module.description || "No description"}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {moduleTypeLabels[module.moduleType]}
                          </Badge>
                          {module.isReusable && (
                            <span className="text-xs text-gray-400">Reusable</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Course Dialog */}
        <Dialog open={!!editingCourse} onOpenChange={() => setEditingCourse(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Course</DialogTitle>
              <DialogDescription>Update course details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Course Name</Label>
                <Input
                  value={courseForm.name}
                  onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>URL Slug</Label>
                <Input
                  value={courseForm.slug}
                  onChange={(e) => setCourseForm({ ...courseForm, slug: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Short Description</Label>
                <Input
                  value={courseForm.shortDescription}
                  onChange={(e) => setCourseForm({ ...courseForm, shortDescription: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Full Description</Label>
                <Textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Level</Label>
                  <Select value={courseForm.level} onValueChange={(v) => setCourseForm({ ...courseForm, level: v as "beginner" | "intermediate" | "advanced" })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Duration (weeks)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={courseForm.durationWeeks || ""}
                    onChange={(e) => setCourseForm({ ...courseForm, durationWeeks: e.target.value ? parseInt(e.target.value) : null })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={courseForm.status} onValueChange={(v) => setCourseForm({ ...courseForm, status: v as "draft" | "published" | "archived" })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingCourse(null)}>Cancel</Button>
              <Button 
                onClick={handleUpdateCourse}
                disabled={updateCourseMutation.isPending}
                className="bg-gradient-to-r from-pink-500 to-rose-500"
              >
                {updateCourseMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Module Dialog */}
        <Dialog open={!!editingModule} onOpenChange={() => setEditingModule(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Module</DialogTitle>
              <DialogDescription>Update module details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Module Name</Label>
                <Input
                  value={moduleForm.name}
                  onChange={(e) => setModuleForm({ ...moduleForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>URL Slug</Label>
                <Input
                  value={moduleForm.slug}
                  onChange={(e) => setModuleForm({ ...moduleForm, slug: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Module Type</Label>
                  <Select value={moduleForm.moduleType} onValueChange={(v) => setModuleForm({ ...moduleForm, moduleType: v as "educational" | "workout" | "faq" | "progress" | "nutrition" })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="educational">Educational</SelectItem>
                      <SelectItem value="workout">Workout Program</SelectItem>
                      <SelectItem value="nutrition">Nutrition</SelectItem>
                      <SelectItem value="progress">Progress Tracking</SelectItem>
                      <SelectItem value="faq">FAQ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Color Theme</Label>
                  <Select value={moduleForm.colorTheme} onValueChange={(v) => setModuleForm({ ...moduleForm, colorTheme: v as "pink" | "blue" | "green" | "purple" | "orange" | "teal" })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pink">Pink</SelectItem>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                      <SelectItem value="teal">Teal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingModule(null)}>Cancel</Button>
              <Button 
                onClick={handleUpdateModule}
                disabled={updateModuleMutation.isPending}
                className="bg-gradient-to-r from-pink-500 to-rose-500"
              >
                {updateModuleMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
