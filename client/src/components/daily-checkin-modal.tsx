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
  Users,
  Info,
  Loader2,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { DailyCheckin } from "@shared/schema";

interface DailyCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

const gratitudeOptions = [
  { emoji: "💪", label: "My body's progress" },
  { emoji: "👶", label: "Time with my baby" },
  { emoji: "❤️", label: "Family support" },
  { emoji: "🌅", label: "A moment of peace" },
  { emoji: "🥗", label: "Healthy choices" },
  { emoji: "😴", label: "Rest I got" },
];

const challengeOptions = [
  { emoji: "😴", label: "Feeling tired" },
  { emoji: "⏰", label: "Finding time" },
  { emoji: "💭", label: "Staying motivated" },
  { emoji: "🤕", label: "Physical discomfort" },
  { emoji: "😰", label: "Feeling overwhelmed" },
  { emoji: "🍼", label: "Baby's schedule" },
];

export default function DailyCheckinModal({
  isOpen,
  onClose,
  userId: propUserId,
}: DailyCheckinModalProps) {
  const { toast } = useToast();
  const [isClosing, setIsClosing] = useState(false);
  
  const userId = propUserId || (() => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        return JSON.parse(userData).id;
      }
    } catch {}
    return null;
  })();
  
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  const [breathingPractice, setBreathingPractice] = useState(false);
  const [waterLiters, setWaterLiters] = useState(2.0);
  const [cardioMinutes, setCardioMinutes] = useState(20);
  const [gratitude, setGratitude] = useState("");
  const [struggles, setStruggles] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [savedData, setSavedData] = useState<{
    workoutCompleted: boolean;
    breathingPractice: boolean;
    waterLiters: number;
    cardioMinutes: number;
  } | null>(null);

  const { data: todayCheckin, isLoading } = useQuery<DailyCheckin | null>({
    queryKey: ["/api/daily-checkins", userId, "today"],
    enabled: isOpen && !!userId,
  });

  useEffect(() => {
    if (todayCheckin) {
      setWorkoutCompleted(todayCheckin.workoutCompleted || false);
      setBreathingPractice(todayCheckin.breathingPractice || false);
      const savedWater = todayCheckin.waterGlasses ? todayCheckin.waterGlasses * 0.25 : 2.0;
      setWaterLiters(savedWater);
      setCardioMinutes(todayCheckin.cardioMinutes || 20);
      setGratitude(todayCheckin.gratitude || "");
      setStruggles(todayCheckin.struggles || "");
    } else {
      setWaterLiters(2.0);
      setCardioMinutes(20);
    }
  }, [todayCheckin]);

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<DailyCheckin>) => {
      if (!userId) throw new Error("User not found");
      const response = await apiRequest("POST", `/api/daily-checkins/${userId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-checkins", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/workout-sessions", userId, "progress"] });
      setSavedData({
        workoutCompleted,
        breathingPractice,
        waterLiters,
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
    const waterGlasses = Math.round(waterLiters * 4);
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
    setWaterLiters(2.0);
    setCardioMinutes(20);
    setGratitude("");
    setStruggles("");
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSavedData(null);
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const handleGratitudeSelect = (option: string) => {
    setGratitude(prev => {
      if (prev.includes(option)) {
        return prev.replace(option, '').replace(/\s+,\s+|,\s+|\s+,/g, ', ').replace(/^,\s+|,\s+$/g, '').trim();
      }
      return prev ? `${prev}, ${option}` : option;
    });
  };

  const handleChallengeSelect = (option: string) => {
    setStruggles(prev => {
      if (prev.includes(option)) {
        return prev.replace(option, '').replace(/\s+,\s+|,\s+|\s+,/g, ', ').replace(/^,\s+|,\s+$/g, '').trim();
      }
      return prev ? `${prev}, ${option}` : option;
    });
  };

  const handleShareToCommunity = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!savedData) {
      toast({
        title: "Nothing to share yet",
        description: "Complete your check-in first.",
        variant: "destructive",
      });
      return;
    }
    
    if (!userId) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to share.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSharing(true);
    
    try {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
      const wins: string[] = [];
      
      if (savedData.workoutCompleted) wins.push("💪 Completed my workout");
      if (savedData.breathingPractice) wins.push("🌬️ Did breathing exercises");
      if (savedData.waterLiters > 0) wins.push(`💧 ${savedData.waterLiters.toFixed(1)}L of water`);
      if (savedData.cardioMinutes > 0) wins.push(`🏃 ${savedData.cardioMinutes} min cardio/walking`);
      
      const progressMessage = `✨ My Check-in for ${today} ✨\n\n${wins.length > 0 ? wins.join('\n') : 'Taking it easy today 💗'}\n\nEvery day counts! 💕`;
      
      const response = await fetch('/api/community/posts/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          content: progressMessage,
          category: 'progress',
        }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to share');
      }
      
      toast({
        title: "Shared to Community! 🎉",
        description: "Your check-in has been posted. Other mamas can celebrate with you!",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      handleClose();
    } catch (error) {
      toast({
        title: "Couldn't share",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open={isOpen && !isClosing} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className={`max-w-md max-h-[90vh] overflow-y-auto transition-all duration-200 ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        {showSuccess ? (
          <>
            <div className="text-center py-6 space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Amazing! 🎉</h3>
                <p className="text-gray-600 mt-1">Your check-in has been saved</p>
              </div>
              
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
                  {(savedData?.waterLiters || 0) > 0 && (
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-cyan-500" />
                      <span>{savedData?.waterLiters.toFixed(1)}L of water</span>
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
              
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-200">
                <p className="text-sm text-gray-700 mb-3">
                  <span className="font-semibold text-pink-700">Share with the community!</span>
                  <br />Build momentum by celebrating together 💪
                </p>
                <Button
                  type="button"
                  onClick={(e) => handleShareToCommunity(e)}
                  disabled={isSharing}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg"
                  data-testid="button-share-community"
                >
                  {isSharing ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Users className="w-5 h-5 mr-2" />
                  )}
                  {isSharing ? "Sharing..." : "Share to Community"}
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

            <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-xl p-4 border border-pink-200">
              <p className="text-sm text-gray-700 leading-relaxed">
                <span className="font-semibold text-pink-600">Hey mama!</span> Tracking your daily wins - even the small ones - helps you see how far you've come. 
                This creates accountability and lets us celebrate your progress together. 
                <span className="text-pink-600 font-medium"> Every sip of water counts. Every breath matters. You're doing amazing! 💗</span>
              </p>
              <p className="text-xs text-pink-500 mt-2 flex items-center gap-1">
                <span>💡</span> Tip: Check in at the end of your day to capture all your wins!
              </p>
            </div>

            <div className="space-y-5 py-4">
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
                    <p className="text-sm text-gray-500">Liters of water today</p>
                  </div>
                  <span className="text-2xl font-bold text-cyan-600">{waterLiters.toFixed(1)}L</span>
                </div>
                <Slider
                  value={[waterLiters]}
                  onValueChange={(v) => setWaterLiters(v[0])}
                  min={0}
                  max={4}
                  step={0.25}
                  className="w-full"
                  data-testid="slider-water"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0L</span>
                  <span className="text-cyan-500 font-medium">Recommended: 2-2.5L</span>
                  <span>4L</span>
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
                  <span className="text-orange-500 font-medium">Recommended: 20-30 min</span>
                  <span>120+</span>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Heart className="h-5 w-5 text-purple-600" />
                  </div>
                  <Label className="text-base font-medium">Gratitude</Label>
                </div>
                <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Expressing gratitude boosts mood and builds mental resilience
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {gratitudeOptions.map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => handleGratitudeSelect(option.label)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                        gratitude.includes(option.label)
                          ? 'bg-purple-500 text-white border-purple-500'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                      }`}
                      data-testid={`button-gratitude-${option.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {option.emoji} {option.label}
                    </button>
                  ))}
                </div>
                <Textarea
                  placeholder="Or write your own gratitude..."
                  value={gratitude}
                  onChange={(e) => setGratitude(e.target.value)}
                  className="min-h-[50px] resize-none bg-white/50"
                  maxLength={500}
                  data-testid="textarea-gratitude"
                />
              </div>

              <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-rose-100 rounded-lg">
                    <Sparkles className="h-5 w-5 text-rose-600" />
                  </div>
                  <Label className="text-base font-medium">Challenges / Struggles</Label>
                </div>
                <div className="text-xs text-gray-500 mb-3 space-y-1">
                  <p className="flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Sharing challenges helps you process and overcome them
                  </p>
                  <p className="flex items-center gap-1 text-pink-600">
                    <Users className="h-3 w-3" />
                    You're not alone - we'll show common challenges so you feel supported
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {challengeOptions.map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => handleChallengeSelect(option.label)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                        struggles.includes(option.label)
                          ? 'bg-rose-500 text-white border-rose-500'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-rose-300 hover:bg-rose-50'
                      }`}
                      data-testid={`button-challenge-${option.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {option.emoji} {option.label}
                    </button>
                  ))}
                </div>
                <Textarea
                  placeholder="Or describe your challenges... (optional, anonymous)"
                  value={struggles}
                  onChange={(e) => setStruggles(e.target.value)}
                  className="min-h-[50px] resize-none bg-white/50"
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
