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
  CheckCircle,
  PartyPopper,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
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
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedData, setSavedData] = useState<{
    workoutCompleted: boolean;
    breathingPractice: boolean;
    waterGlasses: number;
    cardioMinutes: number;
  } | null>(null);

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
      queryClient.invalidateQueries({ queryKey: ["/api/workout-sessions/progress"] });
      setSavedData({
        workoutCompleted,
        breathingPractice,
        waterGlasses,
        cardioMinutes,
      });
      setShowSuccess(true);
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

  const handleClose = () => {
    setShowSuccess(false);
    setSavedData(null);
    onClose();
  };

  const generateWhatsAppMessage = () => {
    if (!savedData) return "";
    
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    const wins: string[] = [];
    
    if (savedData.workoutCompleted) wins.push("💪 Completed my workout");
    if (savedData.breathingPractice) wins.push("🧘 Did breathing exercises");
    if (savedData.waterGlasses >= 8) wins.push(`💧 ${savedData.waterGlasses} glasses of water`);
    else if (savedData.waterGlasses > 0) wins.push(`💧 ${savedData.waterGlasses} glasses of water`);
    if (savedData.cardioMinutes >= 30) wins.push(`🏃 ${savedData.cardioMinutes} min cardio/walking`);
    else if (savedData.cardioMinutes > 0) wins.push(`🚶 ${savedData.cardioMinutes} min walking`);
    
    const message = `✨ My Check-in for ${today} ✨\n\n${wins.length > 0 ? wins.join('\n') : 'Taking it easy today 💗'}\n\n#HealYourCore #PostpartumStrength`;
    
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  };

  const shareToWhatsApp = () => {
    const url = generateWhatsAppMessage();
    window.open(url, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        {showSuccess ? (
          <>
            {/* Success State with WhatsApp Share */}
            <div className="text-center py-6 space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Amazing! 🎉</h3>
                <p className="text-gray-600 mt-1">Your check-in has been saved</p>
              </div>
              
              {/* Quick Summary */}
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 text-left">
                <h4 className="font-semibold text-pink-700 mb-2">Today's Wins:</h4>
                <div className="space-y-1.5 text-sm text-gray-700">
                  {savedData?.workoutCompleted && (
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-pink-500" />
                      <span>Completed workout</span>
                    </div>
                  )}
                  {savedData?.breathingPractice && (
                    <div className="flex items-center gap-2">
                      <Wind className="w-4 h-4 text-blue-500" />
                      <span>Breathing exercises done</span>
                    </div>
                  )}
                  {(savedData?.waterGlasses || 0) > 0 && (
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-cyan-500" />
                      <span>{savedData?.waterGlasses} glasses of water</span>
                    </div>
                  )}
                  {(savedData?.cardioMinutes || 0) > 0 && (
                    <div className="flex items-center gap-2">
                      <Footprints className="w-4 h-4 text-orange-500" />
                      <span>{savedData?.cardioMinutes} min cardio/walking</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* WhatsApp Share CTA */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <p className="text-sm text-gray-700 mb-3">
                  <span className="font-semibold text-green-700">Share with the community!</span>
                  <br />Build momentum by celebrating together 💪
                </p>
                <Button
                  onClick={shareToWhatsApp}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
                  data-testid="button-share-whatsapp"
                >
                  <SiWhatsapp className="w-5 h-5 mr-2" />
                  Share on WhatsApp
                </Button>
              </div>
              
              <Button
                variant="ghost"
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700"
                data-testid="button-done"
              >
                Done
              </Button>
            </div>
          </>
        ) : (
          <>
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
              <p className="text-xs text-pink-500 mt-2 flex items-center gap-1">
                <span>💡</span> Tip: Check in at the end of your day to capture all your wins!
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
                onClick={handleClose}
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
