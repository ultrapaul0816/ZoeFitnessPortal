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
              
              {/* Medical Disclaimer */}
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <h3 className="font-bold text-red-700 text-base mb-3">
                  MEDICAL DISCLAIMER
                </h3>
                <p className="mb-3">
                  <strong>This program is for educational and informational purposes only and is not intended as medical advice.</strong> The exercises, information, and recommendations provided are not intended to diagnose, treat, cure, or prevent any medical condition.
                </p>
                <p>
                  Before starting any exercise program, especially postpartum, you should consult with your healthcare provider. Every individual's medical situation is unique, and what works for one person may not be appropriate for another.
                </p>
              </div>

              {/* Postpartum Specific Warnings */}
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <h3 className="font-bold text-yellow-700 text-base mb-3">
                  POSTPARTUM CONSIDERATIONS
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-1 font-bold">•</span>
                    <span>You should have medical clearance from your healthcare provider before beginning any exercise program</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-1 font-bold">•</span>
                    <span>This program is designed for women who are at least 6 weeks postpartum with medical clearance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-1 font-bold">•</span>
                    <span>If you experience pain, dizziness, shortness of breath, or any unusual symptoms, stop exercising immediately and consult your healthcare provider</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-1 font-bold">•</span>
                    <span>Results may vary. This program does not guarantee specific outcomes</span>
                  </li>
                </ul>
              </div>

              {/* Liability Disclaimer */}
              <div className="bg-gray-50 border-l-4 border-gray-500 p-4 rounded">
                <h3 className="font-bold text-gray-700 text-base mb-3">
                  ASSUMPTION OF RISK
                </h3>
                <p className="mb-3">
                  By participating in this program, you acknowledge that exercise involves certain risks, including but not limited to, serious injury or death. You voluntarily assume all risks associated with your participation.
                </p>
                <p>
                  <strong>You agree to use your own judgment and listen to your body.</strong> If any exercise feels uncomfortable or causes pain, discontinue immediately.
                </p>
              </div>

              {/* Professional Guidance */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h3 className="font-bold text-blue-700 text-base mb-3">
                  WHEN TO SEEK PROFESSIONAL HELP
                </h3>
                <p className="mb-2">
                  Please consult a healthcare professional if you experience:
                </p>
                <ul className="space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1 font-bold">•</span>
                    <span>Persistent pain or discomfort</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1 font-bold">•</span>
                    <span>Diastasis recti that doesn't improve</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1 font-bold">•</span>
                    <span>Pelvic floor dysfunction</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1 font-bold">•</span>
                    <span>Any concerns about your recovery</span>
                  </li>
                </ul>
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