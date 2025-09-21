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
  const [hasConsented, setHasConsented] = useState(false);

  const handleClose = () => {
    if (hasConsented) {
      onClose(true); // Always save that they've seen/agreed to disclaimer
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && hasConsented && handleClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-white">
        <DialogHeader className="sr-only">
          <DialogTitle>Important Disclaimer</DialogTitle>
          <DialogDescription>Health and Safety Information</DialogDescription>
        </DialogHeader>
        
        {/* Header - Logo */}
        <div className="pt-8 pb-6 text-center">
          <img 
            src="/assets/Screenshot 2025-09-20 at 21.18.10_1758383297530.png"
            alt="Postnatal Pregnancy with Zoe Logo"
            className="mx-auto h-24 w-auto"
          />
        </div>

        {/* Large Disclaimer Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-red-600">
            ⚠️ IMPORTANT DISCLAIMER ⚠️
          </h1>
        </div>

        {/* Main Content - Single Column Layout */}
        <div className="px-8 pb-6">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6 text-sm leading-relaxed text-gray-800">
              
              {/* General Disclaimer */}
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <h3 className="font-bold text-red-700 text-base mb-3">
                  General Disclaimer:
                </h3>
                <p>
                  "Stronger with Zoe – Postnatal Health & Fitness Bible" is designed to provide general information and support for postpartum women on their recovery, health, and fitness journey. The information and exercises provided are for educational purposes only and are not intended to replace professional medical advice, diagnosis, or treatment from a qualified healthcare provider. Always consult with your physician, physiotherapist, or other qualified health provider regarding any medical condition, postpartum recovery concerns, or exercise regimen.
                </p>
              </div>

              {/* Participant Responsibility */}
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <h3 className="font-bold text-yellow-700 text-base mb-3">
                  Participant Responsibility:
                </h3>
                <p>
                  Participation in any postnatal exercise program carries inherent risks, particularly following childbirth. It is the responsibility of each participant to consult with a healthcare provider before beginning this or any other exercise program. By using "Stronger with Zoe – Postnatal Health & Fitness Bible", you acknowledge that you have been cleared by your healthcare provider to engage in postpartum physical activities. You voluntarily assume all risks associated with participation and accept full responsibility for any potential injury, discomfort, or health complications that may arise.
                </p>
              </div>

              {/* Limitation of Liability */}
              <div className="bg-gray-50 border-l-4 border-gray-500 p-4 rounded">
                <h3 className="font-bold text-gray-700 text-base mb-3">
                  Limitation of Liability:
                </h3>
                <p>
                  Zoe Modgill and "Stronger with Zoe" shall not be liable for any claims, demands, injuries, damages, actions, or cause of action that arise in connection with, or as a result of, the postnatal program, workouts, or any recommendations provided therein. Participants agree to release and hold harmless Zoe Modgill and any affiliated entities from and against any claims arising from their participation in the program.
                </p>
              </div>

              {/* Accuracy of Information */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h3 className="font-bold text-blue-700 text-base mb-3">
                  Accuracy of Information:
                </h3>
                <p>
                  While every effort is made to ensure the accuracy of the information presented in this guide, "Stronger with Zoe" cannot guarantee that all information is up-to-date, accurate, or complete at all times. Health and fitness recommendations evolve, and individual needs may vary. Any reliance you place on the information in this guide is strictly at your own risk.
                </p>
              </div>

              {/* Privacy */}
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <h3 className="font-bold text-green-700 text-base mb-3">
                  Privacy:
                </h3>
                <p>
                  Your privacy is of utmost importance. Any personal information you choose to share within "Stronger with Zoe" communities, coaching sessions, or discussions will be treated with confidentiality and will not be disclosed to any third party without your explicit consent, except as required by law.
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Consent checkbox and action button */}
        <div className="px-6 pb-6 space-y-4">
          <div className="bg-pink-50 border border-pink-200 p-4 rounded">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="consent-agreement"
                checked={hasConsented}
                onCheckedChange={(checked) => setHasConsented(!!checked)}
                data-testid="checkbox-consent-agreement"
                className="mt-1"
              />
              <label 
                htmlFor="consent-agreement" 
                className="text-sm font-medium leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-800"
              >
                <strong>I acknowledge that I have read and understand the disclaimers above.</strong> I confirm that I have received medical clearance from my healthcare provider to begin exercising. I understand the risks involved and agree to use my own judgment while participating in this program. I will stop any exercise that causes discomfort or pain and consult my healthcare provider as needed.
              </label>
            </div>
          </div>
          <Button 
            onClick={handleClose}
            disabled={!hasConsented}
            className={`w-full transition-all duration-200 ${
              hasConsented 
                ? 'bg-pink-500 hover:bg-pink-600 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            data-testid="button-agree-continue"
          >
            {hasConsented ? 'I Agree - Continue to Program' : 'Please Read and Agree to Continue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}