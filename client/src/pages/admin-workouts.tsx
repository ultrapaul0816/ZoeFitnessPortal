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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  Loader2, 
  Search, 
  Pencil, 
  Trash2, 
  Video,
  Dumbbell,
  Clock,
  Play,
  GripVertical,
  ChevronRight,
  Timer,
  RotateCcw,
  ArrowLeft
} from "lucide-react";

type StructuredWorkout = {
  id: string;
  name: string;
  description: string | null;
  workout_type: string;
  total_duration: string | null;
  rounds: number;
  rest_between_rounds: number;
  rest_between_exercises: number;
  difficulty: string;
  equipment_needed: string[] | null;
  coach_notes: string | null;
  is_visible: boolean;
  exercise_count?: number;
  created_at: string;
  updated_at: string;
};

type WorkoutExerciseLink = {
  id: string;
  workout_id: string;
  exercise_id: string;
  order_index: number;
  reps: string | null;
  sets: number;
  duration: string | null;
  rest_after: number;
  side_specific: boolean;
  coach_notes: string | null;
  video_url_override: string | null;
  exercise_name: string;
  exercise_video_url: string | null;
  exercise_description?: string;
  exercise_category?: string;
};

type Exercise = {
  id: string;
  name: string;
  video_url: string | null;
  category: string;
  difficulty: string;
  default_reps: string | null;
};

type WorkoutWithExercises = StructuredWorkout & {
  exercises: WorkoutExerciseLink[];
};

const workoutTypes = [
  { value: "strength", label: "Strength" },
  { value: "cardio", label: "Cardio" },
  { value: "breathing", label: "Breathing" },
  { value: "mobility", label: "Mobility" },
  { value: "warmup", label: "Warm Up" },
  { value: "cooldown", label: "Cool Down" },
];

const difficulties = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const equipmentOptions = [
  "Yoga Mat",
  "Resistance Band",
  "Mini Band",
  "Pilates Ball",
  "Swiss Ball",
  "Foam Roller",
  "Yoga Blocks",
  "Weights",
  "No Equipment",
];

const typeColors: Record<string, string> = {
  strength: "bg-purple-100 text-purple-700",
  cardio: "bg-orange-100 text-orange-700",
  breathing: "bg-blue-100 text-blue-700",
  mobility: "bg-green-100 text-green-700",
  warmup: "bg-yellow-100 text-yellow-700",
  cooldown: "bg-teal-100 text-teal-700",
};

export default function AdminWorkouts() {
  const [, setLocation] = useLocation();
  const { user, loading: sessionLoading } = useSession();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutWithExercises | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutWithExercises | null>(null);
  const [showAddExerciseDialog, setShowAddExerciseDialog] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    workoutType: "strength",
    totalDuration: "",
    rounds: 1,
    restBetweenRounds: 60,
    restBetweenExercises: 30,
    difficulty: "beginner",
    equipmentNeeded: [] as string[],
    coachNotes: "",
  });

  const [exerciseForm, setExerciseForm] = useState({
    exerciseId: "",
    reps: "",
    sets: 1,
    duration: "",
    restAfter: 30,
    sideSpecific: false,
    coachNotes: "",
  });

  const { data: workouts = [], isLoading } = useQuery<StructuredWorkout[]>({
    queryKey: ['/api/admin/structured-workouts'],
    queryFn: async () => {
      const res = await fetch('/api/admin/structured-workouts');
      if (!res.ok) throw new Error('Failed to fetch workouts');
      return res.json();
    },
  });

  const { data: exercises = [] } = useQuery<Exercise[]>({
    queryKey: ['/api/admin/exercises'],
    queryFn: async () => {
      const res = await fetch('/api/admin/exercises');
      if (!res.ok) throw new Error('Failed to fetch exercises');
      return res.json();
    },
  });

  const createWorkoutMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      return apiRequest('/api/admin/structured-workouts', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/structured-workouts'] });
      setShowCreateDialog(false);
      resetForm();
      toast({ title: "Workout created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create workout", variant: "destructive" });
    },
  });

  const updateWorkoutMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof form }) => {
      return apiRequest(`/api/admin/structured-workouts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/structured-workouts'] });
      if (selectedWorkout) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/structured-workouts', selectedWorkout.id] });
      }
      setEditingWorkout(null);
      toast({ title: "Workout updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update workout", variant: "destructive" });
    },
  });

  const deleteWorkoutMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/admin/structured-workouts/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/structured-workouts'] });
      setSelectedWorkout(null);
      toast({ title: "Workout archived successfully" });
    },
    onError: () => {
      toast({ title: "Failed to archive workout", variant: "destructive" });
    },
  });

  const addExerciseMutation = useMutation({
    mutationFn: async ({ workoutId, data }: { workoutId: string; data: typeof exerciseForm }) => {
      return apiRequest(`/api/admin/structured-workouts/${workoutId}/exercises`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      if (selectedWorkout) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/structured-workouts', selectedWorkout.id] });
        fetchWorkoutDetails(selectedWorkout.id);
      }
      setShowAddExerciseDialog(false);
      resetExerciseForm();
      toast({ title: "Exercise added to workout" });
    },
    onError: () => {
      toast({ title: "Failed to add exercise", variant: "destructive" });
    },
  });

  const removeExerciseMutation = useMutation({
    mutationFn: async (linkId: string) => {
      return apiRequest(`/api/admin/workout-exercise-links/${linkId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      if (selectedWorkout) {
        fetchWorkoutDetails(selectedWorkout.id);
      }
      toast({ title: "Exercise removed from workout" });
    },
    onError: () => {
      toast({ title: "Failed to remove exercise", variant: "destructive" });
    },
  });

  const fetchWorkoutDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/structured-workouts/${id}`);
      if (!res.ok) throw new Error('Failed to fetch workout');
      const data = await res.json();
      setSelectedWorkout(data);
    } catch (error) {
      toast({ title: "Failed to load workout details", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      workoutType: "strength",
      totalDuration: "",
      rounds: 1,
      restBetweenRounds: 60,
      restBetweenExercises: 30,
      difficulty: "beginner",
      equipmentNeeded: [],
      coachNotes: "",
    });
  };

  const resetExerciseForm = () => {
    setExerciseForm({
      exerciseId: "",
      reps: "",
      sets: 1,
      duration: "",
      restAfter: 30,
      sideSpecific: false,
      coachNotes: "",
    });
  };

  const handleCreateWorkout = () => {
    if (!form.name.trim()) {
      toast({ title: "Please enter a workout name", variant: "destructive" });
      return;
    }
    createWorkoutMutation.mutate(form);
  };

  const handleUpdateWorkout = () => {
    if (!editingWorkout || !form.name.trim()) return;
    updateWorkoutMutation.mutate({ id: editingWorkout.id, data: form });
  };

  const handleAddExercise = () => {
    if (!selectedWorkout || !exerciseForm.exerciseId) {
      toast({ title: "Please select an exercise", variant: "destructive" });
      return;
    }
    addExerciseMutation.mutate({ 
      workoutId: selectedWorkout.id, 
      data: {
        ...exerciseForm,
        orderIndex: (selectedWorkout.exercises?.length || 0),
      } as any
    });
  };

  const openEditDialog = (workout: WorkoutWithExercises) => {
    setForm({
      name: workout.name,
      description: workout.description || "",
      workoutType: workout.workout_type,
      totalDuration: workout.total_duration || "",
      rounds: workout.rounds,
      restBetweenRounds: workout.rest_between_rounds,
      restBetweenExercises: workout.rest_between_exercises,
      difficulty: workout.difficulty,
      equipmentNeeded: workout.equipment_needed || [],
      coachNotes: workout.coach_notes || "",
    });
    setEditingWorkout(workout);
  };

  useEffect(() => {
    if (!sessionLoading && (!user || !user.isAdmin)) {
      setLocation("/login");
    }
  }, [user, sessionLoading, setLocation]);

  if (sessionLoading || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        </div>
      </AdminLayout>
    );
  }

  const filteredWorkouts = workouts.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Workout Builder</h1>
            <p className="text-gray-600">Create and manage structured workouts with exercises, rounds, and rest periods</p>
          </div>
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
            data-testid="button-create-workout"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Workout
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Workout List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search workouts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-workouts"
              />
            </div>

            <ScrollArea className="h-[600px]">
              <div className="space-y-3 pr-4">
                {filteredWorkouts.map((workout) => (
                  <Card 
                    key={workout.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedWorkout?.id === workout.id ? 'ring-2 ring-pink-500' : ''
                    }`}
                    onClick={() => fetchWorkoutDetails(workout.id)}
                    data-testid={`card-workout-${workout.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{workout.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={typeColors[workout.workout_type] || 'bg-gray-100 text-gray-700'}>
                              {workout.workout_type}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {workout.exercise_count || 0} exercises
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <RotateCcw className="w-3 h-3" />
                              {workout.rounds} rounds
                            </span>
                            {workout.total_duration && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {workout.total_duration}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredWorkouts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No workouts found</p>
                    <Button 
                      variant="link" 
                      onClick={() => setShowCreateDialog(true)}
                      className="text-pink-600"
                    >
                      Create your first workout
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Workout Details */}
          <div className="lg:col-span-2">
            {selectedWorkout ? (
              <Card>
                <CardHeader className="border-b">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{selectedWorkout.name}</CardTitle>
                      <CardDescription>{selectedWorkout.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openEditDialog(selectedWorkout)}
                        data-testid="button-edit-workout"
                      >
                        <Pencil className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => {
                          if (confirm('Are you sure you want to archive this workout?')) {
                            deleteWorkoutMutation.mutate(selectedWorkout.id);
                          }
                        }}
                        data-testid="button-archive-workout"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Archive
                      </Button>
                    </div>
                  </div>

                  {/* Workout Stats */}
                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Badge className={typeColors[selectedWorkout.workout_type] || 'bg-gray-100'}>
                        {selectedWorkout.workout_type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <RotateCcw className="w-4 h-4" />
                      {selectedWorkout.rounds} round{selectedWorkout.rounds > 1 ? 's' : ''}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Timer className="w-4 h-4" />
                      {selectedWorkout.rest_between_exercises}s rest between exercises
                    </div>
                    {selectedWorkout.total_duration && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        {selectedWorkout.total_duration}
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800">Exercises</h3>
                    <Button 
                      size="sm"
                      onClick={() => setShowAddExerciseDialog(true)}
                      className="bg-gradient-to-r from-pink-500 to-rose-500"
                      data-testid="button-add-exercise"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Exercise
                    </Button>
                  </div>

                  {selectedWorkout.exercises?.length > 0 ? (
                    <div className="space-y-3">
                      {selectedWorkout.exercises.map((link, index) => (
                        <div 
                          key={link.id}
                          className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border"
                          data-testid={`exercise-link-${link.id}`}
                        >
                          <div className="flex items-center justify-center w-8 h-8 bg-pink-100 text-pink-600 rounded-full font-semibold text-sm">
                            {index + 1}
                          </div>
                          <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-800">{link.exercise_name}</div>
                            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                              {link.reps && <span>{link.reps} reps</span>}
                              {link.sets > 1 && <span>{link.sets} sets</span>}
                              {link.duration && <span>{link.duration}</span>}
                              {link.side_specific && <Badge variant="outline" className="text-xs">Each side</Badge>}
                              <span className="text-gray-400">|</span>
                              <span>{link.rest_after}s rest</span>
                            </div>
                          </div>
                          {link.exercise_video_url && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => window.open(link.exercise_video_url!, '_blank')}
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => removeExerciseMutation.mutate(link.id)}
                            data-testid={`button-remove-exercise-${link.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
                      <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="mb-2">No exercises added yet</p>
                      <Button 
                        variant="link" 
                        onClick={() => setShowAddExerciseDialog(true)}
                        className="text-pink-600"
                      >
                        Add your first exercise
                      </Button>
                    </div>
                  )}

                  {/* Coach Notes */}
                  {selectedWorkout.coach_notes && (
                    <div className="mt-6 p-4 bg-pink-50 rounded-lg">
                      <h4 className="font-medium text-pink-800 mb-2">Coach Notes</h4>
                      <p className="text-sm text-pink-700">{selectedWorkout.coach_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full">
                <CardContent className="flex flex-col items-center justify-center h-96 text-gray-500">
                  <Dumbbell className="w-16 h-16 mb-4 opacity-30" />
                  <p className="text-lg font-medium">Select a workout</p>
                  <p className="text-sm">Choose a workout from the list to view and edit its exercises</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Workout Dialog */}
      <Dialog open={showCreateDialog || !!editingWorkout} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setEditingWorkout(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className={`w-2 h-8 rounded-full ${editingWorkout ? 'bg-blue-500' : 'bg-gradient-to-b from-pink-500 to-rose-500'}`} />
              {editingWorkout ? 'Edit Workout' : 'Create New Workout'}
            </DialogTitle>
            <DialogDescription>
              {editingWorkout ? 'Update workout details' : 'Define your workout structure with rounds and rest periods'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Workout Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Week 1 Core Strength"
                data-testid="input-workout-name"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the workout"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Workout Type</Label>
                <Select value={form.workoutType} onValueChange={(v) => setForm(prev => ({ ...prev, workoutType: v }))}>
                  <SelectTrigger data-testid="select-workout-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {workoutTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Difficulty</Label>
                <Select value={form.difficulty} onValueChange={(v) => setForm(prev => ({ ...prev, difficulty: v }))}>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rounds">Rounds</Label>
                <Input
                  id="rounds"
                  type="number"
                  min={1}
                  value={form.rounds}
                  onChange={(e) => setForm(prev => ({ ...prev, rounds: parseInt(e.target.value) || 1 }))}
                />
              </div>

              <div>
                <Label htmlFor="totalDuration">Total Duration</Label>
                <Input
                  id="totalDuration"
                  value={form.totalDuration}
                  onChange={(e) => setForm(prev => ({ ...prev, totalDuration: e.target.value }))}
                  placeholder="e.g., 30 min"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="restBetweenRounds">Rest Between Rounds (sec)</Label>
                <Input
                  id="restBetweenRounds"
                  type="number"
                  min={0}
                  value={form.restBetweenRounds}
                  onChange={(e) => setForm(prev => ({ ...prev, restBetweenRounds: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div>
                <Label htmlFor="restBetweenExercises">Rest Between Exercises (sec)</Label>
                <Input
                  id="restBetweenExercises"
                  type="number"
                  min={0}
                  value={form.restBetweenExercises}
                  onChange={(e) => setForm(prev => ({ ...prev, restBetweenExercises: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div>
              <Label>Equipment Needed</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {equipmentOptions.map(eq => (
                  <Badge
                    key={eq}
                    variant={form.equipmentNeeded.includes(eq) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      setForm(prev => ({
                        ...prev,
                        equipmentNeeded: prev.equipmentNeeded.includes(eq)
                          ? prev.equipmentNeeded.filter(e => e !== eq)
                          : [...prev.equipmentNeeded, eq]
                      }));
                    }}
                  >
                    {eq}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="coachNotes">Coach Notes</Label>
              <Textarea
                id="coachNotes"
                value={form.coachNotes}
                onChange={(e) => setForm(prev => ({ ...prev, coachNotes: e.target.value }))}
                placeholder="Tips for coaches or users..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              setEditingWorkout(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={editingWorkout ? handleUpdateWorkout : handleCreateWorkout}
              disabled={createWorkoutMutation.isPending || updateWorkoutMutation.isPending}
              className="bg-gradient-to-r from-pink-500 to-rose-500"
              data-testid="button-save-workout"
            >
              {(createWorkoutMutation.isPending || updateWorkoutMutation.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {editingWorkout ? 'Update Workout' : 'Create Workout'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Exercise Dialog */}
      <Dialog open={showAddExerciseDialog} onOpenChange={setShowAddExerciseDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Exercise to Workout</DialogTitle>
            <DialogDescription>
              Select an exercise and configure reps, sets, and rest
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Exercise *</Label>
              <Select value={exerciseForm.exerciseId} onValueChange={(v) => setExerciseForm(prev => ({ ...prev, exerciseId: v }))}>
                <SelectTrigger data-testid="select-exercise">
                  <SelectValue placeholder="Select an exercise" />
                </SelectTrigger>
                <SelectContent>
                  {exercises.map(ex => (
                    <SelectItem key={ex.id} value={ex.id}>
                      <div className="flex items-center gap-2">
                        <span>{ex.name}</span>
                        <Badge variant="outline" className="text-xs">{ex.category}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reps">Reps</Label>
                <Input
                  id="reps"
                  value={exerciseForm.reps}
                  onChange={(e) => setExerciseForm(prev => ({ ...prev, reps: e.target.value }))}
                  placeholder="e.g., 12 or 8-10"
                />
              </div>

              <div>
                <Label htmlFor="sets">Sets</Label>
                <Input
                  id="sets"
                  type="number"
                  min={1}
                  value={exerciseForm.sets}
                  onChange={(e) => setExerciseForm(prev => ({ ...prev, sets: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duration (optional)</Label>
                <Input
                  id="duration"
                  value={exerciseForm.duration}
                  onChange={(e) => setExerciseForm(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g., 30 seconds"
                />
              </div>

              <div>
                <Label htmlFor="restAfter">Rest After (sec)</Label>
                <Input
                  id="restAfter"
                  type="number"
                  min={0}
                  value={exerciseForm.restAfter}
                  onChange={(e) => setExerciseForm(prev => ({ ...prev, restAfter: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sideSpecific"
                checked={exerciseForm.sideSpecific}
                onChange={(e) => setExerciseForm(prev => ({ ...prev, sideSpecific: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="sideSpecific" className="cursor-pointer">
                Side-specific (repeat for each side)
              </Label>
            </div>

            <div>
              <Label htmlFor="exerciseCoachNotes">Coach Notes (optional)</Label>
              <Textarea
                id="exerciseCoachNotes"
                value={exerciseForm.coachNotes}
                onChange={(e) => setExerciseForm(prev => ({ ...prev, coachNotes: e.target.value }))}
                placeholder="Form tips, modifications..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddExerciseDialog(false);
              resetExerciseForm();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddExercise}
              disabled={addExerciseMutation.isPending}
              className="bg-gradient-to-r from-pink-500 to-rose-500"
              data-testid="button-confirm-add-exercise"
            >
              {addExerciseMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Exercise
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
