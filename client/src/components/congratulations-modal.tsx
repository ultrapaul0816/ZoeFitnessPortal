import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Sparkles, Target, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CongratulationsModalProps {
  onClose: () => void;
  workoutName: string;
}

export default function CongratulationsModal({ onClose, workoutName }: CongratulationsModalProps) {
  const { toast } = useToast();

  const handleShare = () => {
    const shareText = `Just completed "${workoutName}" with Stronger With Zoe! 💪 #StrongerWithZoe #FitnessJourney`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Workout Complete!',
        text: shareText,
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareText);
        toast({
          title: "Copied to clipboard!",
          description: "Share text copied. Paste it wherever you'd like to share!",
        });
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied to clipboard!",
        description: "Share text copied. Paste it wherever you'd like to share!",
      });
    }
  };

  const motivationalMessages = [
    "Every workout counts! 🔥",
    "You're getting stronger every day! 💪",
    "Progress over perfection! ⭐",
    "Your future self will thank you! 🚀",
    "One step closer to your goals! 🎯",
  ];

  const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[70]">
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-8">
          {/* Celebration Animation */}
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-primary to-primary/70 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Trophy className="w-10 h-10 text-primary-foreground" />
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-6 h-6 text-yellow-500 animate-bounce" />
            </div>
            <div className="absolute -bottom-1 -left-2">
              <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
            </div>
          </div>

          {/* Congratulations Text */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Congratulations! 🎉
            </h2>
            <p className="text-muted-foreground mb-4">
              You successfully completed
            </p>
            <Badge variant="secondary" className="rounded-none px-4 py-2 text-sm">
              {workoutName}
            </Badge>
          </div>

          {/* Motivational Message */}
          <div className="mb-6 p-4 bg-primary/10 rounded-lg border-l-4 border-primary">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Keep Going!</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {randomMessage}
            </p>
          </div>

          {/* Achievement Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-center">
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-lg font-bold text-foreground">+1</div>
              <div className="text-xs text-muted-foreground">Workout Complete</div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-lg font-bold text-foreground">🔥</div>
              <div className="text-xs text-muted-foreground">Streak Active</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleShare}
              variant="outline"
              className="w-full h-auto py-3"
              data-testid="button-share-achievement"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Your Achievement
            </Button>
            <Button
              onClick={onClose}
              className="w-full"
              data-testid="button-continue-program"
            >
              Continue Your Journey
            </Button>
          </div>

          {/* Encouraging Footer */}
          <p className="text-xs text-muted-foreground mt-6">
            Remember: Consistency is key to lasting transformation
          </p>
        </CardContent>
      </Card>
    </div>
  );
}