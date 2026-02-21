import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

const STORAGE_KEY = "zoe_coaching_guide_seen";

const steps = [
  { icon: "📥", title: "New Client Enrollment", desc: 'Click "+ Enroll Client" to add someone. They\'ll get login credentials via email.' },
  { icon: "📋", title: "Client Completes Intake", desc: 'They fill out the lifestyle questionnaire and health evaluation. You\'ll see their status change to "Intake Complete".' },
  { icon: "📝", title: "Review & Generate Coach's Notes", desc: 'Go to their Overview tab. Click "Generate with AI" to create coaching notes from their intake. Read them, edit if needed, then click "Approve & Lock Notes".' },
  { icon: "🧠", title: "AI Assessment", desc: 'This generates automatically after intake. Review it and click "Approve & Lock Assessment".' },
  { icon: "📖", title: "Wellness Blueprint", desc: 'Go to the Blueprint tab and click "Generate". This creates a premium wellness report for your client.' },
  { icon: "💪", title: "Workout Plan", desc: "Go to the Workout Plan tab. Generate a week structure, review it, then generate individual workouts for each day." },
  { icon: "🎯", title: "Client Goes Active", desc: 'Once everything is set up, change their status to "Active". They\'ll see their workouts, can do daily check-ins, and message you.' },
];

const tips = [
  { bold: "The journey card", text: "at the top of each client shows exactly where they are and what to do next" },
  { bold: "Messages", text: "work like a chat — clients can message you anytime" },
  { bold: "Check-ins", text: "— clients submit daily mood, energy, and workout notes" },
  { bold: "Programs", text: "— create reusable program templates to assign to clients" },
];

export function CoachingHelpGuide() {
  const [open, setOpen] = useState(false);
  const [dontShow, setDontShow] = useState(false);

  // Auto-show on first visit
  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setOpen(true);
    }
  }, []);

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      if (dontShow) {
        localStorage.setItem(STORAGE_KEY, "true");
      }
    }
  };

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={() => setOpen(true)}
        title="Quick Start Guide"
      >
        <HelpCircle className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">🚀 Getting Started with Private Coaching</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">Your client pipeline — every client goes through these steps</p>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="text-2xl flex-shrink-0 mt-0.5">{step.icon}</div>
                <div>
                  <h4 className="font-semibold text-sm">
                    {i + 1}. {step.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold text-sm mb-2">💡 Tips</h4>
            <ul className="space-y-1.5">
              {tips.map((tip, i) => (
                <li key={i} className="text-sm text-muted-foreground">
                  • <span className="font-medium text-foreground">{tip.bold}</span> {tip.text}
                </li>
              ))}
            </ul>
          </div>

          <DialogFooter className="flex-col sm:flex-row items-start sm:items-center gap-3 pt-2">
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={dontShow}
                onChange={(e) => setDontShow(e.target.checked)}
                className="rounded"
              />
              Don't show this again
            </label>
            <Button onClick={dismiss} className="ml-auto">Got it!</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
