import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { X, Star, Camera, Clock, Heart } from "lucide-react";
import type { Workout } from "@shared/schema";

interface WorkoutCompletionModalProps {
  workout: Workout;
  onSubmit: (data: any) => void;
  onClose: () => void;
  isSubmitting: boolean;
}

export default function WorkoutCompletionModal({ 
  workout, 
  onSubmit, 
  onClose, 
  isSubmitting 
}: WorkoutCompletionModalProps) {
  const [challengeRating, setChallengeRating] = useState<number | null>(null);
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [mood, setMood] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  const handleSubmit = () => {
    const completionData = {
      challengeRating,
      duration: duration ? parseInt(duration) : undefined,
      notes: notes || undefined,
      mood: mood || undefined,
      photoUrl: photoUrl || undefined,
    };
    onSubmit(completionData);
  };

  const isFormValid = challengeRating !== null;

  const challenges = [
    { value: 1, label: "Too Easy", emoji: "😴" },
    { value: 2, label: "Easy", emoji: "😊" },
    { value: 3, label: "Just Right", emoji: "💪" },
    { value: 4, label: "Challenging", emoji: "🔥" },
    { value: 5, label: "Very Hard", emoji: "💀" },
  ];

  const moods = [
    { value: "energized", label: "Energized", emoji: "⚡" },
    { value: "accomplished", label: "Accomplished", emoji: "🏆" },
    { value: "tired", label: "Tired", emoji: "😪" },
    { value: "motivated", label: "Motivated", emoji: "🚀" },
    { value: "relaxed", label: "Relaxed", emoji: "😌" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">Workout Complete! 🎉</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{workout.name}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              data-testid="button-close-completion"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Challenge Rating */}
          <div>
            <Label className="text-sm font-medium flex items-center space-x-2 mb-3">
              <Star className="w-4 h-4" />
              <span>How challenging was this workout? *</span>
            </Label>
            <div className="grid grid-cols-1 gap-2">
              {challenges.map((challenge) => (
                <button
                  key={challenge.value}
                  onClick={() => setChallengeRating(challenge.value)}
                  className={`p-3 text-left border rounded-lg transition-colors ${
                    challengeRating === challenge.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  data-testid={`rating-${challenge.value}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{challenge.emoji}</span>
                    <div>
                      <div className="font-medium text-sm">{challenge.label}</div>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              star <= challenge.value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <Label htmlFor="duration" className="text-sm font-medium flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4" />
              <span>How long did it take? (minutes)</span>
            </Label>
            <Input
              id="duration"
              type="number"
              placeholder="e.g., 30"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              data-testid="input-duration"
            />
          </div>

          {/* Mood */}
          <div>
            <Label className="text-sm font-medium flex items-center space-x-2 mb-3">
              <Heart className="w-4 h-4" />
              <span>How do you feel?</span>
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {moods.map((moodOption) => (
                <button
                  key={moodOption.value}
                  onClick={() => setMood(moodOption.value)}
                  className={`p-2 text-center border rounded-lg transition-colors ${
                    mood === moodOption.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  data-testid={`mood-${moodOption.value}`}
                >
                  <div className="text-lg mb-1">{moodOption.emoji}</div>
                  <div className="text-xs font-medium">{moodOption.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-sm font-medium mb-2 block">
              Share your thoughts or achievements
            </Label>
            <Textarea
              id="notes"
              placeholder="How did the workout go? Any personal bests or observations?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              data-testid="textarea-notes"
            />
          </div>

          {/* Photo URL */}
          <div>
            <Label htmlFor="photo" className="text-sm font-medium flex items-center space-x-2 mb-2">
              <Camera className="w-4 h-4" />
              <span>Share a photo (optional)</span>
            </Label>
            <Input
              id="photo"
              placeholder="Paste image URL here"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              data-testid="input-photo"
            />
            {photoUrl && (
              <div className="mt-2">
                <img 
                  src={photoUrl} 
                  alt="Workout photo" 
                  className="w-full h-32 object-cover rounded-lg"
                  onError={() => setPhotoUrl("")}
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              data-testid="button-cancel-completion"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className="flex-1"
              data-testid="button-submit-completion"
            >
              {isSubmitting ? "Submitting..." : "Complete Workout"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}