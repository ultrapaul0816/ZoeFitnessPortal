import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSession } from "@/hooks/use-session";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Plus, 
  Loader2, 
  GripVertical, 
  Pencil, 
  Trash2, 
  Video, 
  FileText, 
  Download, 
  Dumbbell,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type ModuleSection = {
  id: string;
  module_id: string;
  name: string;
  slug: string;
  description: string | null;
  order_index: number;
  content_count?: number;
  created_at: string;
  updated_at: string;
};

type ContentItem = {
  id: string;
  section_id: string;
  content_type: "video" | "text" | "pdf" | "exercise" | "workout";
  title: string;
  description: string | null;
  content_data: any;
  duration_minutes: number | null;
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
  created_at: string;
  updated_at: string;
};

type Exercise = {
  id: string;
  display_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  default_reps: string | null;
  default_duration_seconds: number | null;
  category: string;
  muscle_groups: string[];
  difficulty: string;
  coach_notes: string | null;
};

const generateSlug = (name: string) => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

const contentTypeIcons: Record<string, typeof Video> = {
  video: Video,
  text: FileText,
  pdf: Download,
  exercise: Dumbbell,
  workout: RotateCcw,
};

type ContentTemplate = {
  id: string;
  name: string;
  icon: string;
  contentType: "video" | "text" | "pdf" | "exercise" | "workout";
  title: string;
  description: string;
  contentData?: any;
};

const contentTemplates: ContentTemplate[] = [
  {
    id: "welcome-video",
    name: "Welcome Video",
    icon: "🎬",
    contentType: "video",
    title: "Welcome to [Module Name]",
    description: "In this video, Zoe welcomes you to this module and shares what you'll learn. Get ready to feel supported every step of the way, mama!",
    contentData: { videoUrl: "" },
  },
  {
    id: "workout-intro",
    name: "Workout Introduction",
    icon: "💪",
    contentType: "video",
    title: "Today's Workout Overview",
    description: "Before we begin, let's go over what we'll be working on today. Remember: listen to your body, take breaks when needed, and celebrate showing up for yourself!",
    contentData: { videoUrl: "" },
  },
  {
    id: "educational-tip",
    name: "Educational Tip",
    icon: "📚",
    contentType: "text",
    title: "Understanding Your Body",
    description: "Your postpartum body is incredible, mama! In this section, we'll explore how to support your recovery with evidence-based guidance and gentle encouragement.",
    contentData: { textContent: "" },
  },
  {
    id: "progress-check",
    name: "Progress Checkpoint",
    icon: "🌟",
    contentType: "text",
    title: "Week [X] Progress Check",
    description: "Amazing work making it this far! Let's take a moment to reflect on your journey and celebrate your wins. Every small step counts toward your recovery.",
    contentData: { textContent: "" },
  },
  {
    id: "nutrition-guide",
    name: "Nutrition Guide",
    icon: "🥗",
    contentType: "pdf",
    title: "Nourishing Your Postpartum Body",
    description: "Download this guide for practical nutrition tips to fuel your recovery and boost your energy. Simple, realistic advice for busy mamas!",
    contentData: { pdfUrl: "", fileName: "" },
  },
  {
    id: "cooldown",
    name: "Cooldown & Stretch",
    icon: "🧘",
    contentType: "video",
    title: "Gentle Cooldown",
    description: "Let's finish strong with a calming cooldown. These stretches will help your muscles recover and leave you feeling relaxed and accomplished.",
    contentData: { videoUrl: "" },
  },
];

export default function AdminModuleEditor() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/admin/modules/:moduleId");
  const moduleId = params?.moduleId;
  const { user, loading: sessionLoading } = useSession();
  const { toast } = useToast();

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showCreateSection, setShowCreateSection] = useState(false);
  const [showCreateContent, setShowCreateContent] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<ModuleSection | null>(null);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);

  const [sectionForm, setSectionForm] = useState({
    name: "",
    slug: "",
    description: "",
    orderIndex: 0,
  });

  const [contentForm, setContentForm] = useState({
    contentType: "video" as "video" | "text" | "pdf" | "exercise" | "workout",
    title: "",
    description: "",
    durationMinutes: null as number | null,
    orderIndex: 0,
    contentData: {} as any,
  });

  const { data: module, isLoading: moduleLoading } = useQuery<CourseModule>({
    queryKey: ['/api/admin/modules', moduleId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/modules`);
      const modules = await res.json();
      return modules.find((m: CourseModule) => m.id === moduleId);
    },
    enabled: !!moduleId,
  });

  const { data: sections = [], isLoading: sectionsLoading } = useQuery<ModuleSection[]>({
    queryKey: ['/api/admin/modules', moduleId, 'sections'],
    enabled: !!moduleId,
  });

  const { data: exercises = [] } = useQuery<Exercise[]>({
    queryKey: ['/api/admin/exercises'],
    queryFn: async () => {
      const res = await fetch('/api/admin/exercises');
      return res.json();
    },
  });

  type StructuredWorkout = {
    id: string;
    name: string;
    description: string | null;
    workout_type: string;
    total_duration: string | null;
    rounds: number;
    difficulty: string;
    exercise_count?: number;
  };

  const { data: structuredWorkouts = [] } = useQuery<StructuredWorkout[]>({
    queryKey: ['/api/admin/structured-workouts'],
    queryFn: async () => {
      const res = await fetch('/api/admin/structured-workouts');
      return res.json();
    },
  });

  const createSectionMutation = useMutation({
    mutationFn: (data: typeof sectionForm) => 
      apiRequest("POST", `/api/admin/modules/${moduleId}/sections`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/modules', moduleId, 'sections'] });
      setShowCreateSection(false);
      resetSectionForm();
      toast({ title: "Section created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create section", description: error.message, variant: "destructive" });
    },
  });

  const updateSectionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<typeof sectionForm> }) => 
      apiRequest("PATCH", `/api/admin/sections/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/modules', moduleId, 'sections'] });
      setEditingSection(null);
      resetSectionForm();
      toast({ title: "Section updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update section", description: error.message, variant: "destructive" });
    },
  });

  const deleteSectionMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/sections/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/modules', moduleId, 'sections'] });
      toast({ title: "Section deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete section", description: error.message, variant: "destructive" });
    },
  });

  const createContentMutation = useMutation({
    mutationFn: ({ sectionId, data }: { sectionId: string; data: typeof contentForm }) => 
      apiRequest("POST", `/api/admin/sections/${sectionId}/content`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/sections', variables.sectionId, 'content'] });
      setShowCreateContent(null);
      resetContentForm();
      toast({ title: "Content item created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create content item", description: error.message, variant: "destructive" });
    },
  });

  const updateContentMutation = useMutation({
    mutationFn: ({ id, data, sectionId }: { id: string; data: Partial<typeof contentForm>; sectionId: string }) => 
      apiRequest("PATCH", `/api/admin/content/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/sections', variables.sectionId, 'content'] });
      setEditingContent(null);
      resetContentForm();
      toast({ title: "Content item updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update content item", description: error.message, variant: "destructive" });
    },
  });

  const deleteContentMutation = useMutation({
    mutationFn: ({ id, sectionId }: { id: string; sectionId: string }) => 
      apiRequest("DELETE", `/api/admin/content/${id}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/sections', variables.sectionId, 'content'] });
      toast({ title: "Content item deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete content item", description: error.message, variant: "destructive" });
    },
  });

  const generateContentMutation = useMutation({
    mutationFn: async ({ title, contentType }: { title: string; contentType: string }) => {
      const response = await apiRequest("POST", "/api/admin/generate-content", { title, contentType });
      return response.json();
    },
    onSuccess: (data: { description: string }) => {
      setContentForm(prev => ({ ...prev, description: data.description }));
      toast({ title: "Content generated!", description: "Review and edit as needed." });
    },
    onError: (error: any) => {
      toast({ title: "Failed to generate content", description: error.message, variant: "destructive" });
    },
  });

  const handleGenerateContent = () => {
    if (!contentForm.title) {
      toast({ title: "Enter a title first", description: "AI needs a title to generate the description.", variant: "destructive" });
      return;
    }
    generateContentMutation.mutate({ title: contentForm.title, contentType: contentForm.contentType });
  };

  const resetSectionForm = () => {
    setSectionForm({ name: "", slug: "", description: "", orderIndex: 0 });
  };

  const resetContentForm = () => {
    setContentForm({
      contentType: "video",
      title: "",
      description: "",
      durationMinutes: null,
      orderIndex: 0,
      contentData: {},
    });
  };

  const handleCreateSection = () => {
    createSectionMutation.mutate({
      ...sectionForm,
      slug: sectionForm.slug || generateSlug(sectionForm.name),
      orderIndex: sections.length,
    });
  };

  const handleUpdateSection = () => {
    if (!editingSection) return;
    updateSectionMutation.mutate({
      id: editingSection.id,
      data: {
        ...sectionForm,
        slug: sectionForm.slug || generateSlug(sectionForm.name),
      },
    });
  };

  const openEditSection = (section: ModuleSection) => {
    setEditingSection(section);
    setSectionForm({
      name: section.name,
      slug: section.slug,
      description: section.description || "",
      orderIndex: section.order_index,
    });
  };

  const handleCreateContent = (sectionId: string) => {
    createContentMutation.mutate({
      sectionId,
      data: {
        ...contentForm,
        orderIndex: 0,
      },
    });
  };

  const handleUpdateContent = () => {
    if (!editingContent) return;
    updateContentMutation.mutate({
      id: editingContent.id,
      sectionId: editingContent.section_id,
      data: contentForm,
    });
  };

  const openEditContent = (content: ContentItem) => {
    setEditingContent(content);
    setContentForm({
      contentType: content.content_type,
      title: content.title,
      description: content.description || "",
      durationMinutes: content.duration_minutes,
      orderIndex: content.order_index,
      contentData: content.content_data || {},
    });
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  useEffect(() => {
    if (!sessionLoading && !user?.isAdmin) {
      setLocation("/");
    }
  }, [sessionLoading, user, setLocation]);

  if (sessionLoading || moduleLoading) {
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

  const colorThemeStyles: Record<string, string> = {
    pink: "from-pink-500 to-rose-500",
    blue: "from-blue-500 to-indigo-500",
    green: "from-green-500 to-emerald-500",
    purple: "from-purple-500 to-violet-500",
    orange: "from-orange-500 to-amber-500",
    teal: "from-teal-500 to-cyan-500",
  };

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
          onClick={() => setLocation("/admin/modules")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Modules
        </Button>

        {module && (
          <div className={`rounded-xl bg-gradient-to-r ${colorThemeStyles[module.color_theme] || colorThemeStyles.pink} p-6 mb-6 text-white`}>
            <h1 className="text-2xl font-bold mb-2" data-testid="text-module-name">{module.name}</h1>
            <p className="opacity-90">{module.description}</p>
            <div className="flex items-center gap-3 mt-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                {module.module_type}
              </Badge>
              {module.is_reusable && (
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  Reusable
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Sections</h2>
          <Button 
            onClick={() => setShowCreateSection(true)}
            className="bg-gradient-to-r from-pink-500 to-rose-500"
            data-testid="button-add-section"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Section
          </Button>
        </div>

        {sectionsLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          </div>
        ) : sections.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500 mb-4">No sections yet. Add your first section to organize content.</p>
              <Button 
                onClick={() => setShowCreateSection(true)}
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Section
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sections.map((section) => (
              <SectionCard
                key={section.id}
                section={section}
                isExpanded={expandedSections.has(section.id)}
                onToggle={() => toggleSection(section.id)}
                onEdit={() => openEditSection(section)}
                onDelete={() => deleteSectionMutation.mutate(section.id)}
                onAddContent={() => setShowCreateContent(section.id)}
                onEditContent={openEditContent}
                onDeleteContent={(contentId) => deleteContentMutation.mutate({ id: contentId, sectionId: section.id })}
              />
            ))}
          </div>
        )}

        <Dialog open={showCreateSection} onOpenChange={setShowCreateSection}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Section</DialogTitle>
              <DialogDescription>Add a new section to organize content within this module.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Section Name</Label>
                <Input
                  placeholder="e.g., Week 1: Getting Started"
                  value={sectionForm.name}
                  onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                  data-testid="input-section-name"
                />
              </div>
              <div className="space-y-2">
                <Label>URL Slug (auto-generated)</Label>
                <Input
                  placeholder="week-1-getting-started"
                  value={sectionForm.slug || generateSlug(sectionForm.name)}
                  onChange={(e) => setSectionForm({ ...sectionForm, slug: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  placeholder="Brief description of this section"
                  value={sectionForm.description}
                  onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateSection(false)}>Cancel</Button>
              <Button 
                onClick={handleCreateSection}
                disabled={!sectionForm.name || createSectionMutation.isPending}
                className="bg-gradient-to-r from-pink-500 to-rose-500"
                data-testid="button-submit-section"
              >
                {createSectionMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Section
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingSection} onOpenChange={() => setEditingSection(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Section</DialogTitle>
              <DialogDescription>Update section details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Section Name</Label>
                <Input
                  value={sectionForm.name}
                  onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>URL Slug</Label>
                <Input
                  value={sectionForm.slug}
                  onChange={(e) => setSectionForm({ ...sectionForm, slug: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={sectionForm.description}
                  onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingSection(null)}>Cancel</Button>
              <Button 
                onClick={handleUpdateSection}
                disabled={updateSectionMutation.isPending}
                className="bg-gradient-to-r from-pink-500 to-rose-500"
              >
                {updateSectionMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!showCreateContent} onOpenChange={() => setShowCreateContent(null)}>
          <DialogContent className="max-w-lg p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-4">
              <DialogHeader className="text-white">
                <DialogTitle className="text-white text-lg font-semibold">Add Content Item</DialogTitle>
                <DialogDescription className="text-pink-100">Start with a template or build from scratch.</DialogDescription>
              </DialogHeader>
            </div>
            <div className="px-6 pb-6">
            <div className="space-y-4 py-4">
              {/* Quick Templates */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Quick Start Templates</Label>
                <div className="grid grid-cols-3 gap-2">
                  {contentTemplates.map(template => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => {
                        setContentForm({
                          ...contentForm,
                          contentType: template.contentType,
                          title: template.title,
                          description: template.description,
                          contentData: template.contentData || {},
                        });
                      }}
                      className="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-colors text-center"
                    >
                      <span className="text-lg">{template.icon}</span>
                      <span className="text-xs text-gray-600 leading-tight">{template.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Separator className="my-2" />

              <div className="space-y-2">
                <Label>Content Type</Label>
                <Select value={contentForm.contentType} onValueChange={(v) => setContentForm({ ...contentForm, contentType: v as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="text">Text / Article</SelectItem>
                    <SelectItem value="pdf">PDF Download</SelectItem>
                    <SelectItem value="exercise">Exercise</SelectItem>
                    <SelectItem value="workout">Structured Workout</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="e.g., Introduction to Core Breathing"
                  value={contentForm.title}
                  onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                  data-testid="input-content-title"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Description (optional)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateContent}
                    disabled={!contentForm.title || generateContentMutation.isPending}
                    className="gap-1 text-xs"
                  >
                    {generateContentMutation.isPending ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    Generate with AI
                  </Button>
                </div>
                <Textarea
                  placeholder="Brief description of this content (or click 'Generate with AI')"
                  value={contentForm.description}
                  onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })}
                  rows={3}
                />
              </div>
              {contentForm.contentType === "video" && (
                <div className="space-y-2">
                  <Label>YouTube Video URL</Label>
                  <Input
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={contentForm.contentData.videoUrl || ""}
                    onChange={(e) => setContentForm({ 
                      ...contentForm, 
                      contentData: { ...contentForm.contentData, videoUrl: e.target.value } 
                    })}
                  />
                </div>
              )}
              {contentForm.contentType === "exercise" && (
                <>
                  <div className="space-y-2">
                    <Label>Select Exercise from Library</Label>
                    <Select 
                      value={contentForm.contentData.exerciseId || ""} 
                      onValueChange={(v) => {
                        const selectedExercise = exercises.find(e => e.id === v);
                        if (selectedExercise) {
                          setContentForm({ 
                            ...contentForm,
                            title: selectedExercise.name,
                            description: selectedExercise.description || "",
                            durationMinutes: selectedExercise.default_duration_seconds ? Math.ceil(selectedExercise.default_duration_seconds / 60) : null,
                            contentData: { 
                              ...contentForm.contentData, 
                              exerciseId: v,
                              reps: selectedExercise.default_reps || "",
                              videoUrl: selectedExercise.video_url || "",
                              coachNotes: selectedExercise.coach_notes || "",
                            } 
                          });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an exercise..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-80">
                        {exercises.map(ex => (
                          <SelectItem key={ex.id} value={ex.id}>
                            <div className="flex items-center gap-2">
                              <span className="text-pink-600 font-mono text-xs bg-pink-50 px-1.5 py-0.5 rounded">{ex.display_id || 'EX-????'}</span>
                              <span className="font-medium">{ex.name}</span>
                              <span className="text-xs text-gray-400 capitalize">({ex.category})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {exercises.length === 0 && (
                      <p className="text-sm text-gray-500">No exercises in library. <a href="/admin/exercises" className="text-pink-500 hover:underline">Add exercises first</a>.</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Reps / Duration (override)</Label>
                    <Input
                      placeholder="e.g., 10 reps or 30 seconds"
                      value={contentForm.contentData.reps || ""}
                      onChange={(e) => setContentForm({ 
                        ...contentForm, 
                        contentData: { ...contentForm.contentData, reps: e.target.value } 
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Video URL (override, optional)</Label>
                    <Input
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={contentForm.contentData.videoUrl || ""}
                      onChange={(e) => setContentForm({ 
                        ...contentForm, 
                        contentData: { ...contentForm.contentData, videoUrl: e.target.value } 
                      })}
                    />
                  </div>
                </>
              )}
              {contentForm.contentType === "pdf" && (
                <div className="space-y-2">
                  <Label>PDF URL</Label>
                  <Input
                    placeholder="https://..."
                    value={contentForm.contentData.pdfUrl || ""}
                    onChange={(e) => setContentForm({ 
                      ...contentForm, 
                      contentData: { ...contentForm.contentData, pdfUrl: e.target.value } 
                    })}
                  />
                </div>
              )}
              {contentForm.contentType === "text" && (
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea
                    placeholder="Enter the article content..."
                    value={contentForm.contentData.text || ""}
                    onChange={(e) => setContentForm({ 
                      ...contentForm, 
                      contentData: { ...contentForm.contentData, text: e.target.value } 
                    })}
                    rows={4}
                  />
                </div>
              )}
              {contentForm.contentType === "workout" && (
                <div className="space-y-2">
                  <Label>Select Structured Workout</Label>
                  <Select 
                    value={contentForm.contentData.workoutId || ""} 
                    onValueChange={(v) => {
                      const selectedWorkout = structuredWorkouts.find(w => w.id === v);
                      if (selectedWorkout) {
                        setContentForm({ 
                          ...contentForm,
                          title: selectedWorkout.name,
                          description: selectedWorkout.description || "",
                          durationMinutes: selectedWorkout.total_duration ? parseInt(selectedWorkout.total_duration) : null,
                          contentData: { 
                            ...contentForm.contentData, 
                            workoutId: v,
                            workoutType: selectedWorkout.workout_type,
                            rounds: selectedWorkout.rounds,
                            exerciseCount: selectedWorkout.exercise_count,
                          } 
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a workout..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      {structuredWorkouts.map(workout => (
                        <SelectItem key={workout.id} value={workout.id}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{workout.name}</span>
                            <span className="text-xs text-gray-400">
                              ({workout.rounds} rounds • {workout.exercise_count || 0} exercises)
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {structuredWorkouts.length === 0 && (
                    <p className="text-sm text-gray-500">No workouts available. <a href="/admin/workouts" className="text-pink-500 hover:underline">Create workouts first</a>.</p>
                  )}
                  {contentForm.contentData.workoutId && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                      <p><strong>Type:</strong> {contentForm.contentData.workoutType}</p>
                      <p><strong>Rounds:</strong> {contentForm.contentData.rounds}</p>
                      <p><strong>Exercises:</strong> {contentForm.contentData.exerciseCount || 0}</p>
                    </div>
                  )}
                </div>
              )}
              <div className="space-y-2">
                <Label>Duration (minutes, optional)</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="e.g., 10"
                  value={contentForm.durationMinutes || ""}
                  onChange={(e) => setContentForm({ ...contentForm, durationMinutes: e.target.value ? parseInt(e.target.value) : null })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateContent(null)}>Cancel</Button>
              <Button 
                onClick={() => showCreateContent && handleCreateContent(showCreateContent)}
                disabled={!contentForm.title || createContentMutation.isPending}
                className="bg-gradient-to-r from-pink-500 to-rose-500"
                data-testid="button-submit-content"
              >
                {createContentMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Add Content
              </Button>
            </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingContent} onOpenChange={() => setEditingContent(null)}>
          <DialogContent className="max-w-lg p-0 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
              <DialogHeader className="text-white">
                <DialogTitle className="text-white text-lg font-semibold">Edit Content Item</DialogTitle>
                <DialogDescription className="text-blue-100">Update content details</DialogDescription>
              </DialogHeader>
            </div>
            <div className="px-6 pb-6">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Content Type</Label>
                <Select value={contentForm.contentType} onValueChange={(v) => setContentForm({ ...contentForm, contentType: v as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="text">Text / Article</SelectItem>
                    <SelectItem value="pdf">PDF Download</SelectItem>
                    <SelectItem value="exercise">Exercise</SelectItem>
                    <SelectItem value="workout">Structured Workout</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={contentForm.title}
                  onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={contentForm.description}
                  onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })}
                  rows={2}
                />
              </div>
              {contentForm.contentType === "video" && (
                <div className="space-y-2">
                  <Label>YouTube Video URL</Label>
                  <Input
                    value={contentForm.contentData.videoUrl || ""}
                    onChange={(e) => setContentForm({ 
                      ...contentForm, 
                      contentData: { ...contentForm.contentData, videoUrl: e.target.value } 
                    })}
                  />
                </div>
              )}
              {contentForm.contentType === "workout" && (
                <div className="space-y-2">
                  <Label>Select Structured Workout</Label>
                  <Select 
                    value={contentForm.contentData.workoutId || ""} 
                    onValueChange={(v) => {
                      const selectedWorkout = structuredWorkouts.find(w => w.id === v);
                      if (selectedWorkout) {
                        setContentForm({ 
                          ...contentForm,
                          title: selectedWorkout.name,
                          description: selectedWorkout.description || "",
                          contentData: { 
                            ...contentForm.contentData, 
                            workoutId: v,
                            workoutType: selectedWorkout.workout_type,
                            rounds: selectedWorkout.rounds,
                            exerciseCount: selectedWorkout.exercise_count,
                          } 
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a workout..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      {structuredWorkouts.map(workout => (
                        <SelectItem key={workout.id} value={workout.id}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{workout.name}</span>
                            <span className="text-xs text-gray-400">
                              ({workout.rounds} rounds • {workout.exercise_count || 0} exercises)
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {contentForm.contentData.workoutId && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                      <p><strong>Type:</strong> {contentForm.contentData.workoutType}</p>
                      <p><strong>Rounds:</strong> {contentForm.contentData.rounds}</p>
                      <p><strong>Exercises:</strong> {contentForm.contentData.exerciseCount || 0}</p>
                    </div>
                  )}
                </div>
              )}
              {contentForm.contentType === "exercise" && (
                <>
                  <div className="space-y-2">
                    <Label>Select Exercise from Library</Label>
                    <Select 
                      value={contentForm.contentData.exerciseId || ""} 
                      onValueChange={(v) => {
                        const selectedExercise = exercises.find(e => e.id === v);
                        if (selectedExercise) {
                          setContentForm({ 
                            ...contentForm,
                            title: selectedExercise.name,
                            description: selectedExercise.description || "",
                            durationMinutes: selectedExercise.default_duration_seconds ? Math.ceil(selectedExercise.default_duration_seconds / 60) : null,
                            contentData: { 
                              ...contentForm.contentData, 
                              exerciseId: v,
                              reps: selectedExercise.default_reps || "",
                              videoUrl: selectedExercise.video_url || "",
                              coachNotes: selectedExercise.coach_notes || "",
                            } 
                          });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an exercise..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-80">
                        {exercises.map(ex => (
                          <SelectItem key={ex.id} value={ex.id}>
                            <div className="flex items-center gap-2">
                              <span className="text-pink-600 font-mono text-xs bg-pink-50 px-1.5 py-0.5 rounded">{ex.display_id || 'EX-????'}</span>
                              <span className="font-medium">{ex.name}</span>
                              <span className="text-xs text-gray-400 capitalize">({ex.category})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Reps / Duration (override)</Label>
                    <Input
                      value={contentForm.contentData.reps || ""}
                      onChange={(e) => setContentForm({ 
                        ...contentForm, 
                        contentData: { ...contentForm.contentData, reps: e.target.value } 
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Video URL (override)</Label>
                    <Input
                      value={contentForm.contentData.videoUrl || ""}
                      onChange={(e) => setContentForm({ 
                        ...contentForm, 
                        contentData: { ...contentForm.contentData, videoUrl: e.target.value } 
                      })}
                    />
                  </div>
                </>
              )}
              {contentForm.contentType === "pdf" && (
                <div className="space-y-2">
                  <Label>PDF URL</Label>
                  <Input
                    value={contentForm.contentData.pdfUrl || ""}
                    onChange={(e) => setContentForm({ 
                      ...contentForm, 
                      contentData: { ...contentForm.contentData, pdfUrl: e.target.value } 
                    })}
                  />
                </div>
              )}
              {contentForm.contentType === "text" && (
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea
                    value={contentForm.contentData.text || ""}
                    onChange={(e) => setContentForm({ 
                      ...contentForm, 
                      contentData: { ...contentForm.contentData, text: e.target.value } 
                    })}
                    rows={4}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  min="1"
                  value={contentForm.durationMinutes || ""}
                  onChange={(e) => setContentForm({ ...contentForm, durationMinutes: e.target.value ? parseInt(e.target.value) : null })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingContent(null)}>Cancel</Button>
              <Button 
                onClick={handleUpdateContent}
                disabled={updateContentMutation.isPending}
                className="bg-gradient-to-r from-blue-500 to-indigo-500"
              >
                {updateContentMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

function SectionCard({
  section,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onAddContent,
  onEditContent,
  onDeleteContent,
}: {
  section: ModuleSection;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddContent: () => void;
  onEditContent: (content: ContentItem) => void;
  onDeleteContent: (contentId: string) => void;
}) {
  const { data: contentItems = [], isLoading } = useQuery<ContentItem[]>({
    queryKey: ['/api/admin/sections', section.id, 'content'],
    enabled: isExpanded,
  });

  const contentCount = Number(section.content_count) || 0;
  const displayCount = isExpanded ? contentItems.length : contentCount;

  return (
    <Card data-testid={`section-card-${section.id}`}>
      <CardHeader className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
            <button 
              onClick={onToggle} 
              className="flex items-center gap-2 text-left"
              data-testid={`button-toggle-section-${section.id}`}
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
              <div>
                <CardTitle className="text-lg">{section.name}</CardTitle>
                {section.description && (
                  <CardDescription className="mt-1">{section.description}</CardDescription>
                )}
              </div>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={displayCount === 0 ? "text-amber-600 border-amber-300" : ""}
            >
              {displayCount} item{displayCount !== 1 ? 's' : ''}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-0">
          <Separator className="mb-4" />
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
            </div>
          ) : contentItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-3">No content items yet</p>
              <Button variant="outline" size="sm" onClick={onAddContent}>
                <Plus className="w-4 h-4 mr-2" />
                Add Content
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {contentItems.map((item) => {
                const Icon = contentTypeIcons[item.content_type] || FileText;
                return (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    data-testid={`content-item-${item.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-pink-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.title}</p>
                          <p className="text-xs text-gray-500 capitalize">
                            {item.content_type}
                            {item.duration_minutes && ` • ${item.duration_minutes} min`}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => onEditContent(item)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDeleteContent(item.id)} className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              <Button variant="outline" size="sm" onClick={onAddContent} className="w-full mt-2">
                <Plus className="w-4 h-4 mr-2" />
                Add Content
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
