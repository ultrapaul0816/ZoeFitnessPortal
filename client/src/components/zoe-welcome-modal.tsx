import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, Shield, AlertTriangle, FileText, Lock, Users, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface ZoeWelcomeModalProps {
  isOpen: boolean;
  onClose: (dontShowAgain: boolean) => void;
  userId: string;
}

export default function ZoeWelcomeModal({ isOpen, onClose, userId }: ZoeWelcomeModalProps) {
  const [hasConsented, setHasConsented] = useState(false);
  const { toast } = useToast();

  const acceptDisclaimerMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/accept-disclaimer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) {
        throw new Error("Failed to accept disclaimer");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Disclaimer Accepted",
        description: "Thank you for reviewing our safety information!",
      });
      onClose(true);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save disclaimer acceptance. Please try again.",
      });
    },
  });

  const handleClose = () => {
    if (hasConsented) {
      acceptDisclaimerMutation.mutate();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && hasConsented && handleClose()}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[95vh] overflow-hidden p-0 bg-white border border-gray-200/50 shadow-2xl [&>button]:hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Important Disclaimer</DialogTitle>
          <DialogDescription>Health and Safety Information</DialogDescription>
        </DialogHeader>

        {/* Single unified container */}
        <div className="overflow-y-auto max-h-[95vh] bg-white">
          {/* Header Section - Now white background */}
          <div className="px-6 pt-8 pb-6 text-center bg-white border-b border-gray-100">
            <img 
              src="/assets/Screenshot 2025-09-20 at 21.18.10_1758383297530.png"
              alt="Postnatal Pregnancy with Zoe Logo"
              className="mx-auto h-20 w-auto mb-4"
            />
            
            {/* Modern disclaimer heading */}
            <div className="mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">
                IMPORTANT DISCLAIMER
              </h1>
            </div>
            
            <p className="text-sm text-gray-600 font-medium">
              Please read carefully before continuing
            </p>
          </div>

          {/* Main Content */}
          <div className="px-4 sm:px-6 py-6">
            <div className="space-y-4">
              
              {/* General Disclaimer */}
              <div className="group relative bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:border-pink-300/70">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-base mb-3 flex items-center gap-2">
                      General Disclaimer
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-700">
                      "Stronger with Zoe – Postnatal Health & Fitness Bible" is designed to provide general information and support for postpartum women on their recovery, health, and fitness journey. The information and exercises provided are for educational purposes only and are not intended to replace professional medical advice, diagnosis, or treatment from a qualified healthcare provider. Always consult with your physician, physiotherapist, or other qualified health provider regarding any medical condition, postpartum recovery concerns, or exercise regimen.
                    </p>
                  </div>
                </div>
              </div>

              {/* Participant Responsibility */}
              <div className="group relative bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:border-pink-300/70">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-base mb-3">
                      Participant Responsibility
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-700">
                      Participation in any postnatal exercise program carries inherent risks, particularly following childbirth. It is the responsibility of each participant to consult with a healthcare provider before beginning this or any other exercise program. By using "Stronger with Zoe – Postnatal Health & Fitness Bible", you acknowledge that you have been cleared by your healthcare provider to engage in postpartum physical activities. You voluntarily assume all risks associated with participation and accept full responsibility for any potential injury, discomfort, or health complications that may arise.
                    </p>
                  </div>
                </div>
              </div>

              {/* Limitation of Liability */}
              <div className="group relative bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:border-pink-300/70">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-gray-500 to-slate-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-base mb-3">
                      Limitation of Liability
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-700">
                      Zoe Modgill and "Stronger with Zoe" shall not be liable for any claims, demands, injuries, damages, actions, or cause of action that arise in connection with, or as a result of, the postnatal program, workouts, or any recommendations provided therein. Participants agree to release and hold harmless Zoe Modgill and any affiliated entities from and against any claims arising from their participation in the program.
                    </p>
                  </div>
                </div>
              </div>

              {/* Accuracy of Information */}
              <div className="group relative bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:border-pink-300/70">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-base mb-3">
                      Accuracy of Information
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-700">
                      While every effort is made to ensure the accuracy of the information presented in this guide, "Stronger with Zoe" cannot guarantee that all information is up-to-date, accurate, or complete at all times. Health and fitness recommendations evolve, and individual needs may vary. Any reliance you place on the information in this guide is strictly at your own risk.
                    </p>
                  </div>
                </div>
              </div>

              {/* Privacy */}
              <div className="group relative bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:border-pink-300/70">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-base mb-3">
                      Privacy
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-700">
                      Your privacy is of utmost importance. Any personal information you choose to share within "Stronger with Zoe" communities, coaching sessions, or discussions will be treated with confidentiality and will not be disclosed to any third party without your explicit consent, except as required by law.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Consent Section - Integrated into main container */}
            <div className="mt-6 space-y-4">
              {/* Consent checkbox */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <Checkbox 
                      id="consent-agreement"
                      checked={hasConsented}
                      onCheckedChange={(checked) => setHasConsented(!!checked)}
                      data-testid="checkbox-consent-agreement"
                      className="w-5 h-5 border-2 border-pink-300 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-pink-500 data-[state=checked]:to-rose-500 data-[state=checked]:border-pink-500"
                    />
                  </div>
                  <label 
                    htmlFor="consent-agreement" 
                    className="text-sm font-medium leading-relaxed cursor-pointer text-gray-800"
                  >
                    <strong className="text-pink-600">I acknowledge that I have read and understand the disclaimers above.</strong> I confirm that I have received medical clearance from my healthcare provider to begin exercising. I understand the risks involved and agree to use my own judgment while participating in this program. I will stop any exercise that causes discomfort or pain and consult my healthcare provider as needed.
                  </label>
                </div>
              </div>
              
              {/* Action button */}
              <button
                onClick={handleClose}
                disabled={!hasConsented || acceptDisclaimerMutation.isPending}
                className={`w-full py-4 rounded-2xl font-semibold text-base transition-all duration-300 shadow-lg ${
                  hasConsented && !acceptDisclaimerMutation.isPending
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-pink-500/25 hover:shadow-pink-500/40 hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-gray-200/50'
                }`}
                data-testid="button-agree-continue"
              >
                <div className="flex items-center justify-center gap-2">
                  {hasConsented && !acceptDisclaimerMutation.isPending && <Heart className="w-5 h-5" />}
                  {acceptDisclaimerMutation.isPending 
                    ? 'Saving...' 
                    : hasConsented 
                      ? 'I Agree - Continue to Program' 
                      : 'Please Read and Agree to Continue'
                  }
                </div>
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}