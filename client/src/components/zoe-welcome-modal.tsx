import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart } from "lucide-react";

interface ZoeWelcomeModalProps {
  isOpen: boolean;
  onClose: (dontShowAgain: boolean) => void;
}

export default function ZoeWelcomeModal({ isOpen, onClose }: ZoeWelcomeModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(true);

  const handleClose = () => {
    onClose(dontShowAgain);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Welcome to Heal Your Core</DialogTitle>
          <DialogDescription>A personal message from Zoe</DialogDescription>
        </DialogHeader>
        
        {/* Header without close button */}
        <div className="p-6 pb-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to Heal Your Core</h2>
            <p className="text-muted-foreground">A personal message from Zoe</p>
          </div>
        </div>

        {/* Zoe's photo - smaller size */}
        <div className="px-6 pb-4 flex justify-center">
          <div className="relative w-96 h-56 rounded-lg overflow-hidden mb-4">
            <img 
              src="/assets/zoe-photo.png"
              alt="Zoe with her children"
              className="w-full h-full object-contain grayscale"
            />
          </div>
        </div>

        {/* Message content */}
        <div className="px-6 pb-6 space-y-4 text-sm leading-relaxed">
          <p className="text-foreground">
            <strong>Dear Mama,</strong>
          </p>
          
          <p className="text-foreground">
            Welcome to Heal Your Core. I'm so glad you're here. Pregnancy and birth are incredible 
            experiences—but they also bring big changes to your body, especially your core. Whether you've 
            had a vaginal birth or a C-section, you deserve time, space, and support to heal and rebuild your 
            strength.
          </p>
          
          <p className="text-foreground">
            I know this journey personally. I've had two C-sections myself and experienced both diastasis recti 
            and deep core dysfunction. I know what it's like to feel disconnected from your body—to wonder 
            if you'll ever feel strong and stable again. That's why I created this program: to give you a path 
            forward that's not only effective, but compassionate, informed, and rooted in what truly helps.
          </p>
          
          <p className="text-foreground">
            This isn't about "snapping back." It's about reconnecting with your deep core, closing the gap if 
            you're managing diastasis recti, and restoring functional strength from the inside out. This program 
            was created from both professional training and personal experience—gentle, empowering, and 
            rooted in the real needs of postpartum recovery.
          </p>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-r-lg">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="text-yellow-500">💛</span>
              WHAT MAKES THIS DIFFERENT
            </h3>
            <p className="text-foreground mb-3">
              This isn't your average core plan. It's intentionally designed with:
            </p>
            <p className="font-semibold text-foreground mb-2">The Zoe Difference:</p>
            <ul className="space-y-2 text-foreground">
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">❖</span>
                <span><strong>Realistic Progressions</strong> – No unrealistic reps or timelines. Just thoughtful, phased rebuilding.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">❖</span>
                <span><strong>Education-Based Approach</strong> – You'll learn why things matter, not just what to do.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">❖</span>
                <span><strong>Whole-Body Healing</strong> – We look beyond just abs to posture, breath, glutes, and daily function.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">❖</span>
                <span><strong>Inclusive Options</strong> – For all birth paths, all body types, and all seasons of recovery.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">❖</span>
                <span>You won't find pressure here—just empowerment and encouragement.</span>
              </li>
            </ul>
          </div>
          
          <p className="text-foreground text-center italic">
            Let's take it one breath at a time.
          </p>
          
          <div className="text-center">
            <p className="text-foreground">
              With love,
            </p>
            <p className="text-foreground font-semibold flex items-center justify-center gap-1">
              Zoe <Heart className="w-4 h-4 text-pink-500 fill-current" />
            </p>
          </div>
        </div>

        {/* Don't show again option and action button */}
        <div className="px-6 pb-6 space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="dont-show-again"
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(!!checked)}
              data-testid="checkbox-dont-show-again"
            />
            <label 
              htmlFor="dont-show-again" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Don't show this message again
            </label>
          </div>
          <Button 
            onClick={handleClose}
            className="w-full"
            data-testid="button-start-journey"
          >
            Let's Start This Journey Together
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}