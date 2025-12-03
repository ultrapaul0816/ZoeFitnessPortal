import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSession } from "@/hooks/use-session";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Loader2, 
  Search, 
  Pencil, 
  Trash2, 
  Video,
  Dumbbell,
  MoreVertical,
  Clock,
  Target,
  Play
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type Exercise = {
  id: string;
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
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
};

const generateSlug = (name: string) => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

const categories = [
  { value: "core", label: "Core" },
  { value: "breathing", label: "Breathing" },
  { value: "cardio", label: "Cardio" },
  { value: "strength", label: "Strength" },
  { value: "flexibility", label: "Flexibility" },
  { value: "pelvic-floor", label: "Pelvic Floor" },
  { value: "warmup", label: "Warm Up" },
  { value: "cooldown", label: "Cool Down" },
];

const muscleGroupOptions = [
  "Transverse Abdominis",
  "Rectus Abdominis",
  "Obliques",
  "Pelvic Floor",
  "Glutes",
  "Lower Back",
  "Hip Flexors",
  "Diaphragm",
  "Full Body",
];

const difficulties = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const categoryColors: Record<string, string> = {
  core: "bg-pink-100 text-pink-700",
  breathing: "bg-blue-100 text-blue-700",
  cardio: "bg-orange-100 text-orange-700",
  strength: "bg-purple-100 text-purple-700",
  flexibility: "bg-green-100 text-green-700",
  "pelvic-floor": "bg-rose-100 text-rose-700",
  warmup: "bg-yellow-100 text-yellow-700",
  cooldown: "bg-teal-100 text-teal-700",
};

export default function AdminExercises() {
  const [, setLocation] = useLocation();
  const { user, loading: sessionLoading } = useSession();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    videoUrl: "",
    thumbnailUrl: "",
    defaultReps: "",
    defaultDurationSeconds: null as number | null,
    category: "core",
    muscleGroups: [] as string[],
    difficulty: "beginner",
    coachNotes: "",
  });

  const { data: exercises = [], isLoading } = useQuery<Exercise[]>({
    queryKey: ['/api/admin/exercises', { category: selectedCategory, search: searchQuery }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      const res = await fetch(`/api/admin/exercises?${params}`);
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => apiRequest("POST", "/api/admin/exercises", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/exercises'] });
      setShowCreateDialog(false);
      resetForm();
      toast({ title: "Exercise created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create exercise", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<typeof form> }) => 
      apiRequest("PATCH", `/api/admin/exercises/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/exercises'] });
      setEditingExercise(null);
      resetForm();
      toast({ title: "Exercise updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update exercise", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/exercises/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/exercises'] });
      toast({ title: "Exercise deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete exercise", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setForm({
      name: "",
      slug: "",
      description: "",
      videoUrl: "",
      thumbnailUrl: "",
      defaultReps: "",
      defaultDurationSeconds: null,
      category: "core",
      muscleGroups: [],
      difficulty: "beginner",
      coachNotes: "",
    });
  };

  const handleCreate = () => {
    createMutation.mutate({
      ...form,
      slug: form.slug || generateSlug(form.name),
    });
  };

  const handleUpdate = () => {
    if (!editingExercise) return;
    updateMutation.mutate({
      id: editingExercise.id,
      data: {
        ...form,
        slug: form.slug || generateSlug(form.name),
      },
    });
  };

  const openEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setForm({
      name: exercise.name,
      slug: exercise.slug,
      description: exercise.description || "",
      videoUrl: exercise.video_url || "",
      thumbnailUrl: exercise.thumbnail_url || "",
      defaultReps: exercise.default_reps || "",
      defaultDurationSeconds: exercise.default_duration_seconds,
      category: exercise.category,
      muscleGroups: exercise.muscle_groups || [],
      difficulty: exercise.difficulty,
      coachNotes: exercise.coach_notes || "",
    });
  };

  const toggleMuscleGroup = (group: string) => {
    const current = form.muscleGroups;
    if (current.includes(group)) {
      setForm({ ...form, muscleGroups: current.filter(g => g !== group) });
    } else {
      setForm({ ...form, muscleGroups: [...current, group] });
    }
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

  const getYouTubeThumbnail = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/);
    if (match) {
      return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
    }
    return null;
  };

  return (
    <AdminLayout
      activeTab="courses"
      onTabChange={() => setLocation("/admin")}
      onNavigate={handleNavigate}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Exercise Library</h1>
            <p className="text-gray-500">Manage your master list of exercises</p>
          </div>
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-gradient-to-r from-pink-500 to-rose-500"
            data-testid="button-create-exercise"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Exercise
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search exercises..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          </div>
        ) : exercises.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Dumbbell className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">
                {searchQuery || selectedCategory !== 'all' 
                  ? "No exercises match your filters" 
                  : "No exercises yet. Add your first exercise to get started."}
              </p>
              {!searchQuery && selectedCategory === 'all' && (
                <Button onClick={() => setShowCreateDialog(true)} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Exercise
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {exercises.map((exercise) => {
              const thumbnail = exercise.thumbnail_url || (exercise.video_url ? getYouTubeThumbnail(exercise.video_url) : null);
              return (
                <Card key={exercise.id} className="overflow-hidden hover:shadow-md transition-shadow group" data-testid={`exercise-card-${exercise.id}`}>
                  {thumbnail && (
                    <div className="relative aspect-video bg-gray-100">
                      <img 
                        src={thumbnail} 
                        alt={exercise.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-12 h-12 text-white" />
                      </div>
                    </div>
                  )}
                  <CardContent className={thumbnail ? "p-4" : "p-5"}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{exercise.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">{exercise.description || "No description"}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(exercise)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => deleteMutation.mutate(exercise.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge className={categoryColors[exercise.category] || "bg-gray-100 text-gray-700"}>
                        {categories.find(c => c.value === exercise.category)?.label || exercise.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">
                        {exercise.difficulty}
                      </Badge>
                      {exercise.default_reps && (
                        <Badge variant="outline" className="text-xs">
                          <Target className="w-3 h-3 mr-1" />
                          {exercise.default_reps}
                        </Badge>
                      )}
                      {exercise.default_duration_seconds && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {exercise.default_duration_seconds}s
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Exercise</DialogTitle>
              <DialogDescription>Create a new exercise for your library</DialogDescription>
            </DialogHeader>
            <ExerciseForm 
              form={form}
              setForm={setForm}
              onSubmit={handleCreate}
              onCancel={() => { setShowCreateDialog(false); resetForm(); }}
              isPending={createMutation.isPending}
              submitLabel="Create Exercise"
              toggleMuscleGroup={toggleMuscleGroup}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingExercise} onOpenChange={() => { setEditingExercise(null); resetForm(); }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Exercise</DialogTitle>
              <DialogDescription>Update exercise details</DialogDescription>
            </DialogHeader>
            <ExerciseForm 
              form={form}
              setForm={setForm}
              onSubmit={handleUpdate}
              onCancel={() => { setEditingExercise(null); resetForm(); }}
              isPending={updateMutation.isPending}
              submitLabel="Save Changes"
              toggleMuscleGroup={toggleMuscleGroup}
            />
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

function ExerciseForm({
  form,
  setForm,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
  toggleMuscleGroup,
}: {
  form: any;
  setForm: (form: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isPending: boolean;
  submitLabel: string;
  toggleMuscleGroup: (group: string) => void;
}) {
  return (
    <>
      <Tabs defaultValue="basic" className="mt-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="video">Video & Media</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Exercise Name *</Label>
            <Input
              placeholder="e.g., Diaphragmatic Breathing"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              data-testid="input-exercise-name"
            />
          </div>
          <div className="space-y-2">
            <Label>URL Slug (auto-generated)</Label>
            <Input
              placeholder="diaphragmatic-breathing"
              value={form.slug || generateSlug(form.name)}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Describe how to perform this exercise..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map(d => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="video" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>YouTube Video URL</Label>
            <Input
              placeholder="https://www.youtube.com/watch?v=..."
              value={form.videoUrl}
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
            />
            {form.videoUrl && (
              <p className="text-xs text-gray-500">Thumbnail will be auto-generated from YouTube</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Custom Thumbnail URL (optional)</Label>
            <Input
              placeholder="https://..."
              value={form.thumbnailUrl}
              onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
            />
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Default Reps</Label>
              <Input
                placeholder="e.g., 10 reps, 3 sets of 8"
                value={form.defaultReps}
                onChange={(e) => setForm({ ...form, defaultReps: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Default Duration (seconds)</Label>
              <Input
                type="number"
                min="1"
                placeholder="e.g., 30"
                value={form.defaultDurationSeconds || ""}
                onChange={(e) => setForm({ ...form, defaultDurationSeconds: e.target.value ? parseInt(e.target.value) : null })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Muscle Groups</Label>
            <div className="flex flex-wrap gap-2">
              {muscleGroupOptions.map(group => (
                <Badge
                  key={group}
                  variant={form.muscleGroups.includes(group) ? "default" : "outline"}
                  className={`cursor-pointer ${form.muscleGroups.includes(group) ? "bg-pink-500 hover:bg-pink-600" : "hover:bg-gray-100"}`}
                  onClick={() => toggleMuscleGroup(group)}
                >
                  {group}
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Coach Notes</Label>
            <Textarea
              placeholder="Tips for users, form cues, modifications..."
              value={form.coachNotes}
              onChange={(e) => setForm({ ...form, coachNotes: e.target.value })}
              rows={3}
            />
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter className="mt-6">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button 
          onClick={onSubmit}
          disabled={!form.name || isPending}
          className="bg-gradient-to-r from-pink-500 to-rose-500"
          data-testid="button-submit-exercise"
        >
          {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {submitLabel}
        </Button>
      </DialogFooter>
    </>
  );
}
