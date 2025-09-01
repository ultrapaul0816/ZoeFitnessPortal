import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, X } from "lucide-react";

interface ZoeWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ZoeWelcomeModal({ isOpen, onClose }: ZoeWelcomeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Welcome to Heal Your Core</DialogTitle>
          <DialogDescription>A personal message from Zoe</DialogDescription>
        </DialogHeader>
        
        {/* Header with close button */}
        <div className="relative p-6 pb-4">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 h-6 w-6"
            onClick={onClose}
            data-testid="button-close-welcome"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to Heal Your Core</h2>
            <p className="text-muted-foreground">A personal message from Zoe</p>
          </div>
        </div>

        {/* Zoe's photo */}
        <div className="px-6 pb-4">
          <div className="relative w-full h-64 rounded-lg overflow-hidden mb-4">
            <img 
              src="/assets/Screenshot 2025-09-01 at 11.19.02 PM_1756748945653.png"
              alt="Zoe with her children"
              className="w-full h-full object-cover grayscale"
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

        {/* Action button */}
        <div className="px-6 pb-6">
          <Button 
            onClick={onClose}
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