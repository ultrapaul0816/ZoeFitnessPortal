import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Edit, Plus, Trash2, GripVertical, ExternalLink, Play, ChevronDown, ChevronUp, Dumbbell } from "lucide-react";

interface ApiExercise {
  id: string;
  programContentId: string;
  sectionType: string;
  orderNum: number;
  name: string;
  reps: string;
  url: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ApiWorkoutProgram {
  id: string;
  week: number;
  programNumber: number;
  title: string;
  subtitle: string;
  schedule: string;
  scheduleDetail: string;
  coachNote: string;
  coachNoteColorClass: string;
  part1Title: string;
  part2PlaylistUrl: string;
  equipment: Array<{ name: string; colorClass: string }>;
  colorScheme: {
    sectionClass: string;
    borderColor: string;
    bgColor: string;
    textColor: string;
    accentColor: string;
    hoverBg: string;
    buttonColor: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  exercises: ApiExercise[];
}

function ExerciseEditor({ 
  exercise, 
  onSave,
  onDelete,
  isSaving 
}: { 
  exercise: ApiExercise;
  onSave: (updates: Partial<ApiExercise>) => void;
  onDelete: () => void;
  isSaving: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(exercise.name);
  const [reps, setReps] = useState(exercise.reps);
  const [url, setUrl] = useState(exercise.url || "");

  const handleSave = () => {
    onSave({ name, reps, url: url || null });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(exercise.name);
    setReps(exercise.reps);
    setUrl(exercise.url || "");
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white border rounded-lg p-4 space-y-3 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <Label htmlFor={`name-${exercise.id}`}>Exercise Name</Label>
            <Input
              id={`name-${exercise.id}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Exercise name"
              data-testid={`input-exercise-name-${exercise.id}`}
            />
          </div>
          <div>
            <Label htmlFor={`reps-${exercise.id}`}>Reps/Duration</Label>
            <Input
              id={`reps-${exercise.id}`}
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="e.g., 10 reps"
              data-testid={`input-exercise-reps-${exercise.id}`}
            />
          </div>
        </div>
        <div>
          <Label htmlFor={`url-${exercise.id}`}>Video URL (optional)</Label>
          <Input
            id={`url-${exercise.id}`}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            data-testid={`input-exercise-url-${exercise.id}`}
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={handleCancel} data-testid={`button-cancel-exercise-${exercise.id}`}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving} data-testid={`button-save-exercise-${exercise.id}`}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border group hover:bg-gray-100 transition-colors">
      <div className="text-gray-400 cursor-move">
        <GripVertical className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {exercise.url ? (
            <a 
              href={exercise.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:text-blue-800 font-medium truncate flex items-center gap-1"
            >
              {exercise.name}
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
            </a>
          ) : (
            <span className="font-medium text-gray-900 truncate">{exercise.name}</span>
          )}
        </div>
        <span className="text-sm text-gray-500">{exercise.reps}</span>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} data-testid={`button-edit-exercise-${exercise.id}`}>
          <Edit className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-500 hover:text-red-700" data-testid={`button-delete-exercise-${exercise.id}`}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function ProgramEditor({
  program,
  onSave,
  isSaving
}: {
  program: ApiWorkoutProgram;
  onSave: (updates: Partial<ApiWorkoutProgram>) => void;
  isSaving: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(program.title);
  const [schedule, setSchedule] = useState(program.schedule);
  const [scheduleDetail, setScheduleDetail] = useState(program.scheduleDetail);
  const [coachNote, setCoachNote] = useState(program.coachNote);
  const [part1Title, setPart1Title] = useState(program.part1Title);
  const [playlistUrl, setPlaylistUrl] = useState(program.part2PlaylistUrl);

  const handleSave = () => {
    onSave({
      title,
      schedule,
      scheduleDetail,
      coachNote,
      part1Title,
      part2PlaylistUrl: playlistUrl,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(program.title);
    setSchedule(program.schedule);
    setScheduleDetail(program.scheduleDetail);
    setCoachNote(program.coachNote);
    setPart1Title(program.part1Title);
    setPlaylistUrl(program.part2PlaylistUrl);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white border rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`title-${program.id}`}>Program Title</Label>
            <Input
              id={`title-${program.id}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-testid={`input-program-title-${program.id}`}
            />
          </div>
          <div>
            <Label htmlFor={`schedule-${program.id}`}>Schedule</Label>
            <Input
              id={`schedule-${program.id}`}
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              data-testid={`input-program-schedule-${program.id}`}
            />
          </div>
        </div>
        <div>
          <Label htmlFor={`scheduleDetail-${program.id}`}>Schedule Details</Label>
          <Input
            id={`scheduleDetail-${program.id}`}
            value={scheduleDetail}
            onChange={(e) => setScheduleDetail(e.target.value)}
            data-testid={`input-program-schedule-detail-${program.id}`}
          />
        </div>
        <div>
          <Label htmlFor={`coachNote-${program.id}`}>Coach's Note</Label>
          <Textarea
            id={`coachNote-${program.id}`}
            value={coachNote}
            onChange={(e) => setCoachNote(e.target.value)}
            rows={3}
            data-testid={`textarea-program-coach-note-${program.id}`}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`part1Title-${program.id}`}>Part 1 Title</Label>
            <Input
              id={`part1Title-${program.id}`}
              value={part1Title}
              onChange={(e) => setPart1Title(e.target.value)}
              data-testid={`input-program-part1-title-${program.id}`}
            />
          </div>
          <div>
            <Label htmlFor={`playlistUrl-${program.id}`}>Playlist URL</Label>
            <Input
              id={`playlistUrl-${program.id}`}
              value={playlistUrl}
              onChange={(e) => setPlaylistUrl(e.target.value)}
              data-testid={`input-program-playlist-url-${program.id}`}
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-2 border-t">
          <Button variant="outline" onClick={handleCancel} data-testid={`button-cancel-program-edit-${program.id}`}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} data-testid={`button-save-program-${program.id}`}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
            Save Changes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="space-y-1">
        <h4 className="font-semibold text-gray-900">{program.title}</h4>
        <p className="text-sm text-gray-600">{program.schedule} - {program.scheduleDetail}</p>
        <p className="text-sm text-gray-500 italic line-clamp-2">{program.coachNote}</p>
      </div>
      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} data-testid={`button-edit-program-${program.id}`}>
        <Edit className="w-4 h-4 mr-1" />
        Edit Details
      </Button>
    </div>
  );
}

function AddExerciseDialog({
  programId,
  sectionType,
  currentCount,
  onAdd
}: {
  programId: string;
  sectionType: string;
  currentCount: number;
  onAdd: (exercise: { name: string; reps: string; url?: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [reps, setReps] = useState("");
  const [url, setUrl] = useState("");

  const handleAdd = () => {
    if (name && reps) {
      onAdd({ name, reps, url: url || undefined });
      setName("");
      setReps("");
      setUrl("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full" data-testid={`button-add-exercise-${sectionType}`}>
          <Plus className="w-4 h-4 mr-1" />
          Add Exercise
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Exercise</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="new-exercise-name">Exercise Name</Label>
            <Input
              id="new-exercise-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., SUPINE HEEL SLIDES"
              data-testid="input-new-exercise-name"
            />
          </div>
          <div>
            <Label htmlFor="new-exercise-reps">Reps/Duration</Label>
            <Input
              id="new-exercise-reps"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="e.g., 10 reps or 30 secs"
              data-testid="input-new-exercise-reps"
            />
          </div>
          <div>
            <Label htmlFor="new-exercise-url">Video URL (optional)</Label>
            <Input
              id="new-exercise-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              data-testid="input-new-exercise-url"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel-add-exercise">
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!name || !reps} data-testid="button-confirm-add-exercise">
            <Plus className="w-4 h-4 mr-1" />
            Add Exercise
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function WorkoutContentManager() {
  const { toast } = useToast();
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);

  const { data: workoutPrograms = [], isLoading, error } = useQuery<ApiWorkoutProgram[]>({
    queryKey: ["/api/workout-content"],
  });

  const updateProgramMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ApiWorkoutProgram> }) => {
      return apiRequest("PATCH", `/api/admin/workout-content/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-content"] });
      toast({ title: "Success", description: "Program updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to update program", variant: "destructive" });
    },
  });

  const updateExerciseMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ApiExercise> }) => {
      return apiRequest("PATCH", `/api/admin/workout-exercises/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-content"] });
      toast({ title: "Success", description: "Exercise updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to update exercise", variant: "destructive" });
    },
  });

  const createExerciseMutation = useMutation({
    mutationFn: async (exercise: {
      programContentId: string;
      sectionType: string;
      orderNum: number;
      name: string;
      reps: string;
      url?: string;
    }) => {
      return apiRequest("POST", "/api/admin/workout-exercises", exercise);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-content"] });
      toast({ title: "Success", description: "Exercise added successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to add exercise", variant: "destructive" });
    },
  });

  const deleteExerciseMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/workout-exercises/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-content"] });
      toast({ title: "Success", description: "Exercise deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to delete exercise", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          <span className="ml-2 text-gray-600">Loading workout content...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-red-600">
          Failed to load workout content. Please try again later.
        </CardContent>
      </Card>
    );
  }

  if (workoutPrograms.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5" />
            Workout Content Management
          </CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center text-gray-500">
          <p>No workout content found in the database.</p>
          <p className="text-sm mt-2">Run the seed script to populate workout data.</p>
        </CardContent>
      </Card>
    );
  }

  const getColorClasses = (week: number) => {
    const colors: Record<number, { bg: string; border: string; text: string; badge: string }> = {
      1: { bg: "bg-pink-50", border: "border-pink-300", text: "text-pink-700", badge: "bg-pink-500" },
      2: { bg: "bg-cyan-50", border: "border-cyan-300", text: "text-cyan-700", badge: "bg-cyan-500" },
      3: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-700", badge: "bg-blue-500" },
      4: { bg: "bg-purple-50", border: "border-purple-300", text: "text-purple-700", badge: "bg-purple-500" },
      5: { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-700", badge: "bg-orange-500" },
      6: { bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-700", badge: "bg-emerald-500" },
    };
    return colors[week] || colors[1];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5" />
          Workout Content Management
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Edit workout programs, exercises, and video links. Changes are reflected immediately in the member dashboard.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {workoutPrograms.map((program) => {
          const colors = getColorClasses(program.week);
          const isExpanded = expandedWeek === program.week;
          const part1Exercises = program.exercises
            .filter((e) => e.sectionType === "part1")
            .sort((a, b) => a.orderNum - b.orderNum);
          const part2Exercises = program.exercises
            .filter((e) => e.sectionType === "part2")
            .sort((a, b) => a.orderNum - b.orderNum);

          return (
            <div key={program.id} className={`border rounded-lg overflow-hidden ${colors.border}`}>
              <button
                onClick={() => setExpandedWeek(isExpanded ? null : program.week)}
                className={`w-full flex items-center justify-between p-4 ${colors.bg} hover:opacity-90 transition-opacity`}
                data-testid={`button-toggle-week-${program.week}`}
              >
                <div className="flex items-center gap-3">
                  <Badge className={`${colors.badge} text-white`}>Week {program.week}</Badge>
                  <span className={`font-semibold ${colors.text}`}>{program.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {part1Exercises.length + part2Exercises.length} exercises
                  </span>
                  {isExpanded ? (
                    <ChevronUp className={`w-5 h-5 ${colors.text}`} />
                  ) : (
                    <ChevronDown className={`w-5 h-5 ${colors.text}`} />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="p-4 space-y-6 bg-white">
                  <ProgramEditor
                    program={program}
                    onSave={(updates) => updateProgramMutation.mutate({ id: program.id, updates })}
                    isSaving={updateProgramMutation.isPending}
                  />

                  <div className="space-y-4">
                    <div className={`p-3 rounded-lg ${colors.bg}`}>
                      <div className="flex items-center justify-between mb-3">
                        <h5 className={`font-semibold ${colors.text}`}>{program.part1Title}</h5>
                        <Badge variant="outline">{part1Exercises.length} exercise(s)</Badge>
                      </div>
                      <div className="space-y-2">
                        {part1Exercises.map((exercise) => (
                          <ExerciseEditor
                            key={exercise.id}
                            exercise={exercise}
                            onSave={(updates) => updateExerciseMutation.mutate({ id: exercise.id, updates })}
                            onDelete={() => {
                              if (confirm("Are you sure you want to delete this exercise?")) {
                                deleteExerciseMutation.mutate(exercise.id);
                              }
                            }}
                            isSaving={updateExerciseMutation.isPending}
                          />
                        ))}
                        <AddExerciseDialog
                          programId={program.id}
                          sectionType="part1"
                          currentCount={part1Exercises.length}
                          onAdd={(newExercise) => {
                            createExerciseMutation.mutate({
                              programContentId: program.id,
                              sectionType: "part1",
                              orderNum: part1Exercises.length + 1,
                              name: newExercise.name,
                              reps: newExercise.reps,
                              url: newExercise.url,
                            });
                          }}
                        />
                      </div>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h5 className="font-semibold text-gray-900">Part 2: Main Workout (3 Rounds)</h5>
                          {program.part2PlaylistUrl && (
                            <a
                              href={program.part2PlaylistUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                            >
                              <Play className="w-3 h-3" />
                              View Playlist
                            </a>
                          )}
                        </div>
                        <Badge variant="outline">{part2Exercises.length} exercise(s)</Badge>
                      </div>
                      <div className="space-y-2">
                        {part2Exercises.map((exercise) => (
                          <ExerciseEditor
                            key={exercise.id}
                            exercise={exercise}
                            onSave={(updates) => updateExerciseMutation.mutate({ id: exercise.id, updates })}
                            onDelete={() => {
                              if (confirm("Are you sure you want to delete this exercise?")) {
                                deleteExerciseMutation.mutate(exercise.id);
                              }
                            }}
                            isSaving={updateExerciseMutation.isPending}
                          />
                        ))}
                        <AddExerciseDialog
                          programId={program.id}
                          sectionType="part2"
                          currentCount={part2Exercises.length}
                          onAdd={(newExercise) => {
                            createExerciseMutation.mutate({
                              programContentId: program.id,
                              sectionType: "part2",
                              orderNum: part2Exercises.length + 1,
                              name: newExercise.name,
                              reps: newExercise.reps,
                              url: newExercise.url,
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
