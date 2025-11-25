import { useQuery } from "@tanstack/react-query";
import { workoutPrograms, ProgramData, Exercise, BreathingExercise } from "@/data/workoutPrograms";

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
  playlistUrl: string;
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

function transformApiToLocal(apiPrograms: ApiWorkoutProgram[]): ProgramData[] {
  return apiPrograms.map((program) => {
    const part1Exercises: BreathingExercise[] = program.exercises
      .filter((ex) => ex.sectionType === "part1")
      .sort((a, b) => a.orderNum - b.orderNum)
      .map((ex) => ({
        name: ex.name,
        reps: ex.reps,
        url: ex.url || undefined,
      }));

    const part2Exercises: Exercise[] = program.exercises
      .filter((ex) => ex.sectionType === "part2")
      .sort((a, b) => a.orderNum - b.orderNum)
      .map((ex, idx) => ({
        num: idx + 1,
        name: ex.name,
        reps: ex.reps,
        url: ex.url || "",
      }));

    return {
      week: program.week,
      programNumber: program.programNumber,
      title: program.title,
      subtitle: program.subtitle,
      schedule: program.schedule,
      scheduleDetail: program.scheduleDetail,
      equipment: program.equipment,
      coachNote: program.coachNote,
      coachNoteColorClass: program.coachNoteColorClass,
      part1: {
        title: program.part1Title,
        exercises: part1Exercises,
      },
      part2: {
        playlistUrl: program.playlistUrl,
        exercises: part2Exercises,
      },
      colorScheme: program.colorScheme,
    };
  });
}

export function useWorkoutContent() {
  return useQuery<ProgramData[]>({
    queryKey: ["/api/workout-content"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/workout-content");
        
        if (!response.ok) {
          console.warn("Failed to fetch workout content from API, using static fallback");
          return workoutPrograms;
        }
        
        const apiData: ApiWorkoutProgram[] = await response.json();
        
        if (!apiData || apiData.length === 0) {
          console.warn("No workout content in database, using static fallback");
          return workoutPrograms;
        }
        
        const transformed = transformApiToLocal(apiData);
        console.log("Using database-driven workout content:", transformed.length, "programs");
        return transformed;
      } catch (error) {
        console.warn("Error fetching workout content, using static fallback:", error);
        return workoutPrograms;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useWorkoutContentByWeek(week: number) {
  return useQuery<ProgramData | null>({
    queryKey: ["/api/workout-content", week],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/workout-content/${week}`);
        
        if (!response.ok) {
          console.warn(`Failed to fetch week ${week} from API, using static fallback`);
          return workoutPrograms.find(p => p.week === week) || null;
        }
        
        const apiData: ApiWorkoutProgram = await response.json();
        
        if (!apiData) {
          console.warn(`No workout content for week ${week} in database, using static fallback`);
          return workoutPrograms.find(p => p.week === week) || null;
        }
        
        const transformed = transformApiToLocal([apiData]);
        return transformed[0] || null;
      } catch (error) {
        console.warn(`Error fetching week ${week}, using static fallback:`, error);
        return workoutPrograms.find(p => p.week === week) || null;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: week >= 1 && week <= 6,
  });
}
