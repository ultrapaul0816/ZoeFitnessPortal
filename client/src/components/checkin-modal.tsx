import { useState } from "react";
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
  existingPostpartumWeeks?: number | null;
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

export default function CheckinModal({
  isOpen,
  onClose,
  onSkip,
  userId,
  existingCountry,
  existingInstagramHandle,
  existingPostpartumWeeks,
}: CheckinModalProps) {
  const [step, setStep] = useState(1);
  const [mood, setMood] = useState<string>("");
  const [energyLevel, setEnergyLevel] = useState<number | null>(null);
  const [goals, setGoals] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [country, setCountry] = useState(existingCountry || "");
  const [instagramHandle, setInstagramHandle] = useState(existingInstagramHandle || "");
  const [postpartumWeeks, setPostpartumWeeks] = useState<string>(
    existingPostpartumWeeks ? String(existingPostpartumWeeks) : ""
  );
  
  const { toast } = useToast();

  const needsProfileInfo = !existingCountry || !existingPostpartumWeeks;
  const totalSteps = needsProfileInfo ? 4 : 3;

  const submitCheckinMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/checkins", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checkins"] });
      toast({
        title: "Check-in Complete! 🌟",
        description: "Thank you for sharing how you're feeling today.",
      });
      onClose();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save your check-in. Please try again.",
      });
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

  const handleSkip = () => {
    dismissMutation.mutate();
  };

  const handleSubmit = async () => {
    if (needsProfileInfo && (country || instagramHandle || postpartumWeeks)) {
      const profileUpdates: any = {};
      if (country && !existingCountry) profileUpdates.country = country;
      if (instagramHandle && !existingInstagramHandle) profileUpdates.instagramHandle = instagramHandle;
      if (postpartumWeeks && !existingPostpartumWeeks) profileUpdates.postpartumWeeks = parseInt(postpartumWeeks);
      
      if (Object.keys(profileUpdates).length > 0) {
        await updateProfileMutation.mutateAsync(profileUpdates);
      }
    }

    submitCheckinMutation.mutate({
      mood: mood || null,
      energyLevel: energyLevel,
      goals: goals.length > 0 ? goals : null,
      notes: notes || null,
      postpartumWeeksAtCheckin: postpartumWeeks ? parseInt(postpartumWeeks) : (existingPostpartumWeeks || null),
    });
  };

  const toggleGoal = (goal: string) => {
    setGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const canProceed = () => {
    if (step === 1) return !!mood;
    if (step === 2) return energyLevel !== null;
    if (step === 3 && needsProfileInfo) return true;
    if ((step === 3 && !needsProfileInfo) || step === 4) return true;
    return true;
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
                onClick={() => setMood(option.value)}
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
                onClick={() => setEnergyLevel(option.value)}
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
        </div>
      );
    }

    if (step === 3 && needsProfileInfo) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-500 to-violet-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Baby className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">A bit about you</h3>
            <p className="text-sm text-gray-500">Help us personalize your experience (optional)</p>
          </div>
          
          <div className="space-y-4">
            {!existingPostpartumWeeks && (
              <div className="space-y-2">
                <Label htmlFor="postpartum-weeks" className="text-sm font-medium flex items-center gap-2">
                  <Baby className="w-4 h-4 text-pink-500" />
                  Weeks Postpartum
                </Label>
                <Input
                  id="postpartum-weeks"
                  type="number"
                  placeholder="e.g., 12"
                  value={postpartumWeeks}
                  onChange={(e) => setPostpartumWeeks(e.target.value)}
                  className="border-gray-200 focus:border-pink-300 focus:ring-pink-200"
                  data-testid="input-postpartum-weeks"
                />
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
                  Instagram Handle (optional)
                </Label>
                <Input
                  id="instagram"
                  placeholder="@yourusername"
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  className="border-gray-200 focus:border-pink-300 focus:ring-pink-200"
                  data-testid="input-instagram"
                />
              </div>
            )}
          </div>
        </div>
      );
    }

    const isGoalStep = (step === 3 && !needsProfileInfo) || step === 4;
    if (isGoalStep) {
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

    return null;
  };

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
                onClick={() => setStep(step - 1)}
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

            {step < totalSteps ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white flex items-center gap-1"
                data-testid="button-next-step"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitCheckinMutation.isPending || updateProfileMutation.isPending}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white flex items-center gap-2"
                data-testid="button-submit-checkin"
              >
                {submitCheckinMutation.isPending ? (
                  "Saving..."
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Complete Check-in
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
