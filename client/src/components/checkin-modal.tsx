import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Heart,
  Sparkles,
  Target,
  Baby,
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  MapPin,
  Instagram,
  Calendar,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface CheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
  userId: string;
  existingCountry?: string | null;
  existingInstagramHandle?: string | null;
  existingDeliveryDate?: string | null;
}

const MOOD_OPTIONS = [
  { value: "great", emoji: "😊", label: "Great", color: "from-green-400 to-emerald-500" },
  { value: "good", emoji: "🙂", label: "Good", color: "from-blue-400 to-cyan-500" },
  { value: "okay", emoji: "😐", label: "Okay", color: "from-yellow-400 to-amber-500" },
  { value: "tired", emoji: "😴", label: "Tired", color: "from-purple-400 to-violet-500" },
  { value: "struggling", emoji: "😔", label: "Struggling", color: "from-pink-400 to-rose-500" },
];

const ENERGY_OPTIONS = [
  { value: 5, label: "High Energy", emoji: "⚡", color: "from-green-400 to-emerald-500" },
  { value: 4, label: "Good Energy", emoji: "💪", color: "from-blue-400 to-cyan-500" },
  { value: 3, label: "Moderate", emoji: "🌟", color: "from-yellow-400 to-amber-500" },
  { value: 2, label: "Low Energy", emoji: "🌙", color: "from-purple-400 to-violet-500" },
  { value: 1, label: "Exhausted", emoji: "😴", color: "from-gray-400 to-slate-500" },
];

const GOAL_OPTIONS = [
  "Strengthen my core",
  "Improve energy levels",
  "Build overall strength",
  "Better posture",
  "More self-care time",
  "Connect with other mums",
];

const COUNTRIES = [
  "India", "United States", "United Kingdom", "Canada", "Australia",
  "UAE", "Singapore", "Germany", "Netherlands", "France", "Other"
];

function calculatePostpartumWeeks(deliveryDate: Date): number {
  const now = new Date();
  const diffMs = now.getTime() - deliveryDate.getTime();
  const weeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
  return Math.max(0, weeks);
}

function getMonthYearOptions() {
  const options = [];
  const now = new Date();
  for (let i = 0; i <= 72; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    });
  }
  return options;
}

export default function CheckinModal({
  isOpen,
  onClose,
  onSkip,
  userId,
  existingCountry,
  existingInstagramHandle,
  existingDeliveryDate,
}: CheckinModalProps) {
  const [step, setStep] = useState(1);
  const [mood, setMood] = useState<string>("");
  const [energyLevel, setEnergyLevel] = useState<number | null>(null);
  const [goals, setGoals] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [country, setCountry] = useState(existingCountry || "");
  const [instagramHandle, setInstagramHandle] = useState(existingInstagramHandle || "");
  const [deliveryMonth, setDeliveryMonth] = useState<string>("");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [checkinId, setCheckinId] = useState<string | null>(null);
  
  const { toast } = useToast();

  const needsProfileInfo = !existingCountry || !existingDeliveryDate;
  const totalSteps = needsProfileInfo ? 4 : 3;

  const saveCheckinMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/checkins", data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.id) {
        setCheckinId(data.id);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/checkins"] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save your check-in. Please try again.",
      });
    },
  });

  const updateCheckinMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest("PATCH", `/api/checkins/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checkins"] });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PATCH", `/api/users/${userId}`, data);
    },
  });

  const dismissMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/checkins/dismiss", {});
    },
    onSuccess: () => {
      onSkip();
    },
  });

  const saveProgressively = useCallback(async (stepData: any, isPartial: boolean = true) => {
    const postpartumWeeks = deliveryMonth 
      ? calculatePostpartumWeeks(new Date(deliveryMonth + "-01"))
      : (existingDeliveryDate ? calculatePostpartumWeeks(new Date(existingDeliveryDate)) : null);

    if (!checkinId) {
      saveCheckinMutation.mutate({
        ...stepData,
        postpartumWeeksAtCheckin: postpartumWeeks,
        isPartial,
      });
    } else {
      updateCheckinMutation.mutate({
        id: checkinId,
        data: { ...stepData, postpartumWeeksAtCheckin: postpartumWeeks, isPartial },
      });
    }
  }, [checkinId, deliveryMonth, existingDeliveryDate, saveCheckinMutation, updateCheckinMutation]);

  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown <= 0) {
      setCountdown(null);
      advanceStep();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const handleMoodSelect = (value: string) => {
    setMood(value);
    saveProgressively({ mood: value }, true);
    setCountdown(2);
  };

  const handleEnergySelect = (value: number) => {
    setEnergyLevel(value);
    saveProgressively({ mood, energyLevel: value }, true);
    setCountdown(2);
  };

  const cancelCountdown = () => {
    setCountdown(null);
  };

  const advanceStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleSkip = () => {
    dismissMutation.mutate();
  };

  const handleComplete = async () => {
    if (needsProfileInfo) {
      const profileUpdates: any = {};
      if (country && !existingCountry) profileUpdates.country = country;
      if (instagramHandle && !existingInstagramHandle) profileUpdates.instagramHandle = instagramHandle;
      if (deliveryMonth && !existingDeliveryDate) {
        profileUpdates.deliveryDate = new Date(deliveryMonth + "-01");
      }
      
      if (Object.keys(profileUpdates).length > 0) {
        try {
          await updateProfileMutation.mutateAsync(profileUpdates);
        } catch (error) {
          console.error("Failed to update profile:", error);
        }
      }
    }

    const postpartumWeeks = deliveryMonth 
      ? calculatePostpartumWeeks(new Date(deliveryMonth + "-01"))
      : (existingDeliveryDate ? calculatePostpartumWeeks(new Date(existingDeliveryDate)) : null);

    const finalData = {
      mood: mood || null,
      energyLevel,
      goals: goals.length > 0 ? goals : null,
      notes: notes || null,
      postpartumWeeksAtCheckin: postpartumWeeks,
      isPartial: false,
    };

    if (checkinId) {
      await updateCheckinMutation.mutateAsync({ id: checkinId, data: finalData });
    } else {
      await saveCheckinMutation.mutateAsync(finalData);
    }

    toast({
      title: "Check-in Complete! 🌟",
      description: "Thank you for sharing how you're feeling today.",
    });
    onClose();
  };

  const toggleGoal = (goal: string) => {
    setGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const renderStep = () => {
    if (step === 1) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">How are you feeling today?</h3>
            <p className="text-sm text-gray-500">Your wellbeing matters to us</p>
          </div>
          
          <div className="grid grid-cols-5 gap-2">
            {MOOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleMoodSelect(option.value)}
                className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 ${
                  mood === option.value
                    ? `bg-gradient-to-r ${option.color} text-white shadow-lg scale-105`
                    : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                }`}
                data-testid={`button-mood-${option.value}`}
              >
                <span className="text-2xl mb-1">{option.emoji}</span>
                <span className="text-xs font-medium">{option.label}</span>
              </button>
            ))}
          </div>

          {countdown !== null && mood && (
            <div className="text-center">
              <button 
                onClick={cancelCountdown}
                className="text-sm text-gray-500 hover:text-pink-500 transition-colors"
              >
                Moving in {countdown}s... <span className="underline">tap to stay</span>
              </button>
            </div>
          )}
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">How's your energy level?</h3>
            <p className="text-sm text-gray-500">This helps us understand your recovery</p>
          </div>
          
          <div className="space-y-2">
            {ENERGY_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleEnergySelect(option.value)}
                className={`w-full flex items-center p-4 rounded-xl transition-all duration-200 ${
                  energyLevel === option.value
                    ? `bg-gradient-to-r ${option.color} text-white shadow-lg`
                    : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                }`}
                data-testid={`button-energy-${option.value}`}
              >
                <span className="text-xl mr-3">{option.emoji}</span>
                <span className="font-medium">{option.label}</span>
                {energyLevel === option.value && (
                  <Check className="w-5 h-5 ml-auto" />
                )}
              </button>
            ))}
          </div>

          {countdown !== null && energyLevel !== null && (
            <div className="text-center">
              <button 
                onClick={cancelCountdown}
                className="text-sm text-gray-500 hover:text-pink-500 transition-colors"
              >
                Moving in {countdown}s... <span className="underline">tap to stay</span>
              </button>
            </div>
          )}
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Target className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">What are you focusing on?</h3>
            <p className="text-sm text-gray-500">Select your current goals (optional)</p>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {GOAL_OPTIONS.map((goal) => (
              <button
                key={goal}
                onClick={() => toggleGoal(goal)}
                className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                  goals.includes(goal)
                    ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md"
                    : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                }`}
                data-testid={`button-goal-${goal.replace(/\s+/g, '-').toLowerCase()}`}
              >
                {goals.includes(goal) && <Check className="w-4 h-4 inline mr-1" />}
                {goal}
              </button>
            ))}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium text-gray-600">
              Anything else on your mind? (optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Share how you're doing, any challenges, or wins..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border-gray-200 focus:border-pink-300 focus:ring-pink-200 resize-none"
              rows={3}
              data-testid="textarea-notes"
            />
          </div>
        </div>
      );
    }

    if (step === 4 && needsProfileInfo) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-500 to-violet-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Baby className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">A bit about you</h3>
            <p className="text-sm text-gray-500">Help us personalize your experience</p>
          </div>
          
          <div className="space-y-4">
            {!existingDeliveryDate && (
              <div className="space-y-2">
                <Label htmlFor="delivery-date" className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-pink-500" />
                  When did you deliver?
                </Label>
                <Select value={deliveryMonth} onValueChange={setDeliveryMonth}>
                  <SelectTrigger className="border-gray-200 focus:border-pink-300 focus:ring-pink-200" data-testid="select-delivery-month">
                    <SelectValue placeholder="Select month & year" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {getMonthYearOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {deliveryMonth && (
                  <p className="text-xs text-pink-600 mt-1">
                    ~{calculatePostpartumWeeks(new Date(deliveryMonth + "-01"))} weeks postpartum
                  </p>
                )}
              </div>
            )}
            
            {!existingCountry && (
              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-pink-500" />
                  Country
                </Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger className="border-gray-200 focus:border-pink-300 focus:ring-pink-200" data-testid="select-country">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {!existingInstagramHandle && (
              <div className="space-y-2">
                <Label htmlFor="instagram" className="text-sm font-medium flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-pink-500" />
                  Instagram Handle
                </Label>
                <Input
                  id="instagram"
                  placeholder="@yourusername"
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  className="border-gray-200 focus:border-pink-300 focus:ring-pink-200"
                  data-testid="input-instagram"
                />
                <p className="text-xs text-gray-400">
                  Optional - We'll use this to feature your community posts & progress on our Instagram
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  const isLastStep = step === totalSteps;
  const showSkipOnProfileStep = step === 4 && needsProfileInfo;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleSkip()}>
      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-hidden p-0 bg-white border border-gray-200/50 shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Daily Check-in</DialogTitle>
          <DialogDescription>Share how you're feeling today</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
            aria-label="Skip check-in"
            data-testid="button-skip-checkin"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>

          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i + 1 === step
                      ? "w-8 bg-gradient-to-r from-pink-500 to-rose-500"
                      : i + 1 < step
                      ? "w-4 bg-pink-300"
                      : "w-4 bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <p className="text-center text-xs text-gray-400">
              Step {step} of {totalSteps}
            </p>
          </div>

          <div className="px-6 pb-6 overflow-y-auto max-h-[60vh]">
            {renderStep()}
          </div>

          <div className="px-6 pb-6 flex items-center justify-between gap-3 border-t border-gray-100 pt-4 bg-gray-50/50">
            {step > 1 ? (
              <Button
                variant="outline"
                onClick={() => {
                  cancelCountdown();
                  setStep(step - 1);
                }}
                className="flex items-center gap-1"
                data-testid="button-prev-step"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-gray-500 hover:text-gray-700"
                disabled={dismissMutation.isPending}
                data-testid="button-skip-later"
              >
                Maybe later
              </Button>
            )}

            <div className="flex items-center gap-2">
              {showSkipOnProfileStep && (
                <Button
                  variant="ghost"
                  onClick={handleComplete}
                  className="text-gray-500 hover:text-gray-700"
                  data-testid="button-skip-profile"
                >
                  Skip for now
                </Button>
              )}

              {!isLastStep ? (
                <Button
                  onClick={() => {
                    cancelCountdown();
                    advanceStep();
                  }}
                  disabled={step === 1 && !mood || step === 2 && energyLevel === null}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white flex items-center gap-1"
                  data-testid="button-next-step"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={saveCheckinMutation.isPending || updateCheckinMutation.isPending || updateProfileMutation.isPending}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white flex items-center gap-2"
                  data-testid="button-submit-checkin"
                >
                  {saveCheckinMutation.isPending || updateCheckinMutation.isPending ? (
                    "Saving..."
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Complete
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
