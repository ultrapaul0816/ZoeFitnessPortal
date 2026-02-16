import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Edit3,
  Eye,
  Dumbbell,
} from "lucide-react";

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface WorkoutPlanDay {
  id: string;
  weekNumber: number;
  dayNumber: number;
  title: string;
  dayType: string;
  isApproved: boolean;
  coachNotes: string | null;
  exercises: any;
}

interface CoachingWorkoutTableProps {
  workoutPlans: WorkoutPlanDay[];
  completions: any[];
  onEditDay: (day: WorkoutPlanDay) => void;
  onViewDay: (day: WorkoutPlanDay) => void;
}

export function CoachingWorkoutTable({ workoutPlans, completions, onEditDay, onViewDay }: CoachingWorkoutTableProps) {
  if (workoutPlans.length === 0) {
    return (
      <div className="text-center py-12">
        <Dumbbell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">No workout plans generated yet</p>
        <p className="text-gray-400 text-sm mt-1">Generate week plans from the calendar view above</p>
      </div>
    );
  }

  // Sort by week, then by day
  const sorted = [...workoutPlans].sort((a, b) => {
    if (a.weekNumber !== b.weekNumber) return a.weekNumber - b.weekNumber;
    return a.dayNumber - b.dayNumber;
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gradient-to-r from-gray-50 to-slate-50">
            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-16">Week</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-20">Day</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Title</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Type</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Exercises</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Completed</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Status</th>
            <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {sorted.map(day => {
            const exercisesData = day.exercises?.sections || day.exercises?.exercises?.sections || [];
            const totalExercises = exercisesData.reduce((sum: number, sec: any) => sum + (sec.exercises?.length || 0), 0);
            const dayCompletions = completions.filter((c: any) =>
              c.weekNumber === day.weekNumber && c.dayNumber === day.dayNumber && c.completed
            );
            const completedCount = dayCompletions.length;
            const isRestDay = day.dayType?.toLowerCase().includes("rest") || day.dayType?.toLowerCase().includes("recovery");
            const allDone = totalExercises > 0 && completedCount >= totalExercises;
            const partial = completedCount > 0 && !allDone;

            // Status
            let statusBadge: { label: string; color: string };
            if (isRestDay) {
              statusBadge = { label: "Rest", color: "bg-blue-100 text-blue-700" };
            } else if (allDone) {
              statusBadge = { label: "Complete", color: "bg-green-100 text-green-700" };
            } else if (partial) {
              statusBadge = { label: "Partial", color: "bg-amber-100 text-amber-700" };
            } else {
              statusBadge = { label: "Not Started", color: "bg-gray-100 text-gray-500" };
            }

            return (
              <tr
                key={day.id}
                className="hover:bg-gradient-to-r hover:from-pink-50/30 hover:to-transparent transition-all duration-200"
              >
                {/* Week */}
                <td className="px-4 py-3">
                  <Badge variant="outline" className="text-[10px] font-bold">
                    W{day.weekNumber}
                  </Badge>
                </td>

                {/* Day */}
                <td className="px-4 py-3">
                  <span className="text-xs font-medium text-gray-700">
                    {dayNames[day.dayNumber - 1] || `Day ${day.dayNumber}`}
                  </span>
                </td>

                {/* Title */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{day.title}</span>
                    {day.isApproved && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />}
                  </div>
                  {day.coachNotes && (
                    <p className="text-[10px] text-gray-400 truncate max-w-[200px] mt-0.5 italic">{day.coachNotes}</p>
                  )}
                </td>

                {/* Type */}
                <td className="px-4 py-3">
                  <Badge variant="outline" className="text-[10px]">{day.dayType}</Badge>
                </td>

                {/* Exercises count */}
                <td className="px-4 py-3">
                  <span className="text-xs text-gray-600">
                    {isRestDay ? "-" : `${totalExercises} exercises`}
                  </span>
                </td>

                {/* Completed */}
                <td className="px-4 py-3">
                  {isRestDay ? (
                    <span className="text-xs text-gray-400">-</span>
                  ) : totalExercises > 0 ? (
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div
                          className={cn("h-1.5 rounded-full transition-all", allDone ? "bg-green-500" : "bg-pink-400")}
                          style={{ width: `${Math.min((completedCount / totalExercises) * 100, 100)}%` }}
                        />
                      </div>
                      <span className={cn("text-[10px] font-medium", allDone ? "text-green-600" : "text-gray-500")}>
                        {completedCount}/{totalExercises}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">0</span>
                  )}
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <Badge className={cn("text-[10px]", statusBadge.color)}>
                    {statusBadge.label}
                  </Badge>
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-gray-400 hover:text-gray-700"
                      title="View details"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDay(day);
                      }}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-gray-400 hover:text-pink-600"
                      title="Edit workout"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditDay(day);
                      }}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
