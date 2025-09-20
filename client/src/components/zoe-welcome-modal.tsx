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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-white">
        <DialogHeader className="sr-only">
          <DialogTitle>Welcome to Heal Your Core</DialogTitle>
          <DialogDescription>A personal message from Zoe</DialogDescription>
        </DialogHeader>
        
        {/* Header - Logo */}
        <div className="pt-8 pb-6 text-center">
          <img 
            src="/attached_assets/Screenshot 2025-09-20 at 21.18.10_1758383297530.png"
            alt="Postnatal Pregnancy with Zoe Logo"
            className="mx-auto h-24 w-auto"
          />
        </div>

        {/* Large Welcome Heading */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-pink-500">
            ✨ WELCOME ✨
          </h1>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="px-8 pb-6">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Left Column - Text Content */}
            <div className="space-y-4 text-sm leading-relaxed text-gray-700">
              <p>
                <strong>Dear Mama,</strong>
              </p>
              
              <p>
                Welcome to <span className="text-blue-300 font-medium">Heal Your Core</span>. I'm so glad you're here. Pregnancy and birth are incredible experiences—but they also bring big changes to your body, especially your core. Whether you've had a vaginal birth or a C-section, you deserve time, space, and support to heal and rebuild your strength.
              </p>
              
              <p>
                I know this journey personally. I've had two C-sections myself and experienced both diastasis recti and deep core dysfunction. I know what it's like to feel disconnected from your body—to wonder if you'll ever feel strong and stable again. That's why I created this program: to give you a path forward that's not only effective, but compassionate, informed, and rooted in what truly helps.
              </p>
              
              <p>
                This isn't about "snapping back." It's about reconnecting with your deep core, closing the gap if you're managing diastasis recti, and restoring functional strength from the inside out. This program was created from both professional training and personal experience—gentle, empowering, and rooted in the real needs of postpartum recovery.
              </p>
              
              <div className="mt-6">
                <h3 className="font-bold text-black text-base mb-3">
                  WHAT MAKES THIS DIFFERENT
                </h3>
                <p className="mb-3">
                  This isn't your average core plan. It's intentionally designed with: <span className="text-yellow-500">💛</span> <strong>The Zoe Difference:</strong>
                </p>
                
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500 mt-1">❖</span>
                    <span><strong>Realistic Progressions</strong> – No unrealistic reps or timelines. Just thoughtful, phased rebuilding.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500 mt-1">❖</span>
                    <span><strong>Education-Based Approach</strong> – You'll learn why things matter, not just what to do.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500 mt-1">❖</span>
                    <span><strong>Whole-Body Healing</strong> – We look beyond just abs to posture, breath, and daily function.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500 mt-1">❖</span>
                    <span><strong>Inclusive Options</strong> – For all birth paths, all body types, and all seasons of recovery.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500 mt-1">❖</span>
                    <span>You won't find pressure here—just empowerment and encouragement.</span>
                  </li>
                </ul>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-pink-400 italic">
                  Let's take it one breath at a time.
                </p>
                <p className="mt-2">
                  With love,
                </p>
                <p className="font-semibold flex items-center justify-center gap-1">
                  Zoe <Heart className="w-4 h-4 text-red-500 fill-current" />
                </p>
              </div>
            </div>

            {/* Right Column - Photo */}
            <div className="flex justify-center items-start">
              <div className="w-full max-w-sm">
                <img 
                  src="/attached_assets/zoe-photo.png"
                  alt="Zoe with her children"
                  className="w-full h-auto object-cover rounded-lg grayscale"
                />
              </div>
            </div>
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