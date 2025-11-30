import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Dumbbell,
  Wind,
  Droplets,
  Heart,
  Footprints,
  Sparkles,
  X,
  Check,
  Share2,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { DailyCheckin } from "@shared/schema";

interface DailyCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DailyCheckinModal({
  isOpen,
  onClose,
}: DailyCheckinModalProps) {
  const { toast } = useToast();
  
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  const [breathingPractice, setBreathingPractice] = useState(false);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [cardioMinutes, setCardioMinutes] = useState(0);
  const [gratitude, setGratitude] = useState("");
  const [struggles, setStruggles] = useState("");

  const { data: todayCheckin, isLoading } = useQuery<DailyCheckin | null>({
    queryKey: ["/api/daily-checkins/today"],
    enabled: isOpen,
  });

  useEffect(() => {
    if (todayCheckin) {
      setWorkoutCompleted(todayCheckin.workoutCompleted || false);
      setBreathingPractice(todayCheckin.breathingPractice || false);
      setWaterGlasses(todayCheckin.waterGlasses || 0);
      setCardioMinutes(todayCheckin.cardioMinutes || 0);
      setGratitude(todayCheckin.gratitude || "");
      setStruggles(todayCheckin.struggles || "");
    }
  }, [todayCheckin]);

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<DailyCheckin>) => {
      const response = await apiRequest("POST", "/api/daily-checkins", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-checkins"] });
      toast({
        title: "Check-in saved!",
        description: "Great job tracking your progress today!",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to save check-in",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    saveMutation.mutate({
      workoutCompleted,
      breathingPractice,
      waterGlasses,
      cardioMinutes,
      gratitude: gratitude || null,
      struggles: struggles || null,
    });
  };

  const handleReset = () => {
    setWorkoutCompleted(false);
    setBreathingPractice(false);
    setWaterGlasses(0);
    setCardioMinutes(0);
    setGratitude("");
    setStruggles("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-pink-500" />
            Daily Check-in
          </DialogTitle>
          <DialogDescription className="text-base">
            Take 30 seconds to celebrate your wins today
          </DialogDescription>
        </DialogHeader>

        {/* Zoe's Encouraging Message */}
        <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-xl p-4 border border-pink-200">
          <p className="text-sm text-gray-700 leading-relaxed">
            <span className="font-semibold text-pink-600">Hey mama!</span> Tracking your daily wins - even the small ones - helps you see how far you've come. 
            This creates accountability and lets us celebrate your progress together. 
            <span className="text-pink-600 font-medium"> Every glass of water counts. Every breath matters. You're doing amazing! 💗</span>
          </p>
        </div>

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Dumbbell className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <Label className="text-base font-medium">Workout Completed</Label>
                <p className="text-sm text-gray-500">Did you complete today's workout?</p>
              </div>
            </div>
            <Switch
              checked={workoutCompleted}
              onCheckedChange={setWorkoutCompleted}
              data-testid="switch-workout"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wind className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <Label className="text-base font-medium">Breathing Practice</Label>
                <p className="text-sm text-gray-500">Did you do your breathing exercises?</p>
              </div>
            </div>
            <Switch
              checked={breathingPractice}
              onCheckedChange={setBreathingPractice}
              data-testid="switch-breathing"
            />
          </div>

          <div className="p-4 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-xl border border-cyan-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <Droplets className="h-5 w-5 text-cyan-600" />
              </div>
              <div className="flex-1">
                <Label className="text-base font-medium">Water Intake</Label>
                <p className="text-sm text-gray-500">Glasses of water today</p>
              </div>
              <span className="text-2xl font-bold text-cyan-600">{waterGlasses}</span>
            </div>
            <Slider
              value={[waterGlasses]}
              onValueChange={(v) => setWaterGlasses(v[0])}
              max={15}
              step={1}
              className="w-full"
              data-testid="slider-water"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0</span>
              <span className="text-cyan-500 font-medium">Target: 8</span>
              <span>15+</span>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Footprints className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <Label className="text-base font-medium">Cardio / Walking</Label>
                <p className="text-sm text-gray-500">Minutes of activity today</p>
              </div>
              <span className="text-2xl font-bold text-orange-600">{cardioMinutes}</span>
            </div>
            <Slider
              value={[cardioMinutes]}
              onValueChange={(v) => setCardioMinutes(v[0])}
              max={120}
              step={5}
              className="w-full"
              data-testid="slider-cardio"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0</span>
              <span className="text-orange-500 font-medium">Target: 30 min</span>
              <span>120+</span>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Heart className="h-5 w-5 text-purple-600" />
              </div>
              <Label className="text-base font-medium">Gratitude</Label>
            </div>
            <Textarea
              placeholder="What are you grateful for today?"
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              className="min-h-[60px] resize-none bg-white/50"
              maxLength={500}
              data-testid="textarea-gratitude"
            />
          </div>

          <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-rose-100 rounded-lg">
                <Sparkles className="h-5 w-5 text-rose-600" />
              </div>
              <Label className="text-base font-medium">Challenges / Struggles</Label>
            </div>
            <Textarea
              placeholder="What challenges are you facing? (optional)"
              value={struggles}
              onChange={(e) => setStruggles(e.target.value)}
              className="min-h-[60px] resize-none bg-white/50"
              maxLength={500}
              data-testid="textarea-struggles"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            data-testid="button-cancel"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
            data-testid="button-save"
          >
            <Check className="h-4 w-4 mr-2" />
            {saveMutation.isPending ? "Saving..." : "Save Check-in"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
