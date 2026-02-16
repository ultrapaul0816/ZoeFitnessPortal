import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Crown,
  Dumbbell,
  Apple,
  Brain,
  Heart,
  Target,
  Zap,
  CheckCircle,
} from "lucide-react";

function TimelineItem({ phase, focus }: { phase: string; focus: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-3 h-3 rounded-full bg-blue-500 mt-2" />
      <div>
        <h4 className="text-lg font-semibold mb-1">{phase}</h4>
        <p className="text-slate-400">{focus}</p>
      </div>
    </div>
  );
}

export function StrategicWelcome({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-12">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-all",
                i <= step ? "bg-blue-500" : "bg-slate-700"
              )}
            />
          ))}
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="text-center space-y-8">
            <div className="w-20 h-20 mx-auto bg-blue-500 rounded-full flex items-center justify-center">
              <Crown className="w-10 h-10" />
            </div>
            <h1 className="text-5xl font-bold">
              Welcome to Your
              <br />
              High Performance Operating System
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              This isn't another fitness program. This is the Strategic Identity
              Architecture— a proven framework used by elite performers to
              optimize every dimension of their lives.
            </p>
            <Button size="lg" onClick={() => setStep(2)}>
              Begin Your Journey
            </Button>
          </div>
        )}

        {/* Step 2: Who You Are */}
        {step === 2 && (
          <div className="space-y-8">
            <h2 className="text-4xl font-bold">Who You Are</h2>
            <p className="text-xl text-slate-300 leading-relaxed">
              Your Strategic Identity is the foundation of everything. It's who
              you are at your core—beyond roles, beyond achievements, beyond
              circumstances.
            </p>
            <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
              <h3 className="text-2xl font-semibold mb-4">Key Principle</h3>
              <p className="text-lg text-slate-300">
                When your actions align with your authentic identity, resistance
                disappears. You don't "try" to be disciplined—you simply{" "}
                <em>are</em> disciplined because that's who you've decided to
                be.
              </p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)}>Continue</Button>
            </div>
          </div>
        )}

        {/* Step 3: Your Mission */}
        {step === 3 && (
          <div className="space-y-8">
            <h2 className="text-4xl font-bold">Your Mission</h2>
            <p className="text-xl text-slate-300 leading-relaxed">
              What are you here to achieve? Not surface-level goals like "lose
              10kg"— we're talking about the transformation that changes how you
              show up in life.
            </p>
            <div className="grid grid-cols-2 gap-6">
              {[
                {
                  title: "Physical Transformation",
                  desc: "Build a body that supports your ambitions",
                },
                {
                  title: "Mental Clarity",
                  desc: "Develop unshakeable focus and decision-making",
                },
                {
                  title: "Energy Optimization",
                  desc: "Sustain peak performance without burnout",
                },
                {
                  title: "Identity Upgrade",
                  desc: "Become the person capable of your goals",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-slate-800 rounded-lg p-6 border border-slate-700"
                >
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={() => setStep(4)}>Continue</Button>
            </div>
          </div>
        )}

        {/* Step 4: The 5 Pillars */}
        {step === 4 && (
          <div className="space-y-8">
            <h2 className="text-4xl font-bold">The 5 Pillars</h2>
            <p className="text-xl text-slate-300">
              High performance isn't just about training hard. It's a complete
              operating system across five interconnected dimensions:
            </p>
            <div className="space-y-4">
              {[
                {
                  icon: Dumbbell,
                  title: "Training & Recovery",
                  desc: "Structured workouts, active recovery, sleep optimization",
                },
                {
                  icon: Apple,
                  title: "Nutrition",
                  desc: "Fuel for performance, not restriction. Protein-first approach.",
                },
                {
                  icon: Brain,
                  title: "Mindset & Psychology",
                  desc: "Identity work, stress management, mental resilience",
                },
                {
                  icon: Heart,
                  title: "Relationships & Environment",
                  desc: "Who you surround yourself with shapes who you become",
                },
                {
                  icon: Target,
                  title: "Career & Purpose",
                  desc: "Aligning your work with your Strategic Identity",
                },
              ].map((pillar, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 bg-slate-800 rounded-lg p-6 border border-slate-700"
                >
                  <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <pillar.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {pillar.title}
                    </h3>
                    <p className="text-slate-400">{pillar.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button onClick={() => setStep(5)}>Continue</Button>
            </div>
          </div>
        )}

        {/* Step 5: How This Works */}
        {step === 5 && (
          <div className="space-y-8">
            <h2 className="text-4xl font-bold">How This Works</h2>
            <p className="text-xl text-slate-300">
              Over the next 12-16 weeks, we'll build your High Performance
              Operating System:
            </p>
            <div className="space-y-6">
              <TimelineItem
                phase="Phase 1: Foundation (Weeks 1-4)"
                focus="Establish baseline habits, assess current state, build training foundation"
              />
              <TimelineItem
                phase="Phase 2: Momentum (Weeks 5-8)"
                focus="Increase intensity, refine nutrition, deepen identity work"
              />
              <TimelineItem
                phase="Phase 3: Peak (Weeks 9-12)"
                focus="Push boundaries, optimize all pillars, solidify new identity"
              />
              <TimelineItem
                phase="Phase 4: Integration (Weeks 13-16)"
                focus="Make it permanent, develop self-sufficiency, plan long-term"
              />
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-3">
                What You'll Receive:
              </h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>
                    Custom training programs tailored to your goals and
                    constraints
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>
                    Nutrition plans designed around your preferences (no rigid
                    diets)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>Direct access to Coach Zoe via messaging</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>Weekly check-ins and accountability</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>
                    Mindset frameworks and identity architecture work
                  </span>
                </li>
              </ul>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(4)}>
                Back
              </Button>
              <Button onClick={() => setStep(6)}>Continue</Button>
            </div>
          </div>
        )}

        {/* Step 6: Ready to Begin */}
        {step === 6 && (
          <div className="text-center space-y-8">
            <div className="w-20 h-20 mx-auto bg-blue-500 rounded-full flex items-center justify-center">
              <Zap className="w-10 h-10" />
            </div>
            <h2 className="text-4xl font-bold">Ready to Begin?</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              The next step is completing your intake questionnaire. This helps
              me understand where you're starting from so I can build your
              personalized program.
            </p>
            <div className="flex flex-col gap-4 max-w-md mx-auto">
              <Button size="lg" onClick={onComplete}>
                Complete Intake Questionnaire
              </Button>
              <Button variant="outline" onClick={() => setStep(5)}>
                Go Back
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
