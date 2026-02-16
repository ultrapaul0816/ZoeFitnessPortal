import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Circle,
  Camera,
  MessageCircle,
  Send,
  Loader2,
  Sparkles,
  Brain,
  Dumbbell,
  Apple,
  Droplets,
  Wind,
  Calendar,
  LogOut,
  Clock,
  Star,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface PreProgramHubProps {
  client: {
    id: string;
    status: string;
    startDate: string | null;
    coachingType: string | null;
    plansGeneratedAt?: string | null;
  };
  userName: string;
  onLogout: () => void;
  onNavigateToPhotos?: () => void;
  coachingApiRequest: (method: string, url: string, data?: unknown) => Promise<Response>;
}

function getCountdownText(startDate: string | null): { days: number; text: string } {
  if (!startDate) return { days: -1, text: "Your start date will be confirmed soon" };
  const start = new Date(startDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  const diffMs = start.getTime() - now.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (days <= 0) return { days: 0, text: "Starting today!" };
  if (days === 1) return { days: 1, text: "Starts tomorrow!" };
  return { days, text: `Starts in ${days} days` };
}

function formatStartDate(startDate: string | null): string {
  if (!startDate) return "";
  return new Date(startDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

const PIPELINE_STEPS = [
  { key: "enrolled", label: "Enrolled" },
  { key: "plan_created", label: "Plan Created" },
  { key: "photos", label: "Initial Photos" },
  { key: "active", label: "Program Starts" },
];

function getCompletedSteps(status: string, plansGeneratedAt?: string | null) {
  const completed = new Set<string>();
  completed.add("enrolled");

  if (["intake_complete", "plan_generating", "plan_ready", "active"].includes(status)) {
    // Forms were done externally, so enrollment step covers that
  }
  if (status === "plan_ready" || status === "active" || plansGeneratedAt) {
    completed.add("plan_created");
  }
  if (status === "active") {
    completed.add("active");
  }
  return completed;
}

const PREP_CONTENT = [
  {
    title: "Breathing Basics",
    description: "Learn the foundation of core breathing that powers every workout",
    icon: Wind,
    color: "text-sky-500",
    bg: "bg-sky-50",
  },
  {
    title: "Hydration Guide",
    description: "How to stay properly hydrated for optimal performance",
    icon: Droplets,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    title: "Equipment Check",
    description: "Make sure you have everything ready for Week 1",
    icon: Dumbbell,
    color: "text-pink-500",
    bg: "bg-pink-50",
  },
];

export function PreProgramHub({
  client,
  userName,
  onLogout,
  onNavigateToPhotos,
  coachingApiRequest,
}: PreProgramHubProps) {
  const [messageInput, setMessageInput] = useState("");
  const [messageSent, setMessageSent] = useState(false);
  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      await coachingApiRequest("POST", "/api/coaching/messages", { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coaching/messages"] });
      setMessageInput("");
      setMessageSent(true);
      setTimeout(() => setMessageSent(false), 3000);
    },
  });

  const countdown = getCountdownText(client.startDate);
  const completedSteps = getCompletedSteps(client.status, client.plansGeneratedAt);

  const statusDescription: Record<string, string> = {
    enrolled: "Your personalized plan is being created based on your intake data.",
    intake_complete: "Zoe is reviewing your information and creating your personalized plan.",
    plan_generating: "Almost there! Your workout and nutrition plan is being finalized.",
    plan_ready: "Your plan is ready and Zoe is doing a final review. Get excited!",
    paused: "Your coaching program is currently paused. Reach out to Zoe to resume.",
    completed: "Congratulations on completing your coaching program!",
  };

  // Special cases for paused and completed
  if (client.status === "paused") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <div className="max-w-lg mx-auto px-4 pt-12 text-center">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Coaching Paused</h1>
          <p className="text-gray-600 mb-6">Your coaching program is currently paused. Reach out to Zoe to resume.</p>
          <Button className="bg-pink-500 hover:bg-pink-600 text-white" onClick={onLogout}>
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  if (client.status === "completed") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
        <div className="max-w-lg mx-auto px-4 pt-12 text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Star className="w-10 h-10 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Program Completed!</h1>
          <p className="text-gray-600 mb-6">Congratulations on completing your coaching program! What an incredible journey.</p>
          <Button className="bg-pink-500 hover:bg-pink-600 text-white" onClick={onLogout}>
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white pb-8">
      <div className="max-w-lg mx-auto px-4 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {userName}!</h1>
            {client.startDate && (
              <p className="text-sm text-gray-500 mt-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                {formatStartDate(client.startDate)}
              </p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout} className="text-gray-400">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        {/* Countdown Card */}
        <Card className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 mb-6 rounded-2xl shadow-lg">
          <CardContent className="p-6 text-center">
            {countdown.days > 0 ? (
              <>
                <div className="text-5xl font-bold mb-1">{countdown.days}</div>
                <div className="text-lg font-medium opacity-90">
                  day{countdown.days !== 1 ? "s" : ""} until your program begins
                </div>
              </>
            ) : countdown.days === 0 ? (
              <>
                <Sparkles className="w-10 h-10 mx-auto mb-2 animate-pulse" />
                <div className="text-2xl font-bold">Your program starts today!</div>
              </>
            ) : (
              <>
                <Sparkles className="w-8 h-8 mx-auto mb-2" />
                <div className="text-lg font-medium">Your journey is being prepared</div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Progress Pipeline */}
        <Card className="border-0 shadow-sm rounded-2xl mb-6">
          <CardContent className="p-5">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm">Your Journey</h3>
            <div className="space-y-3">
              {PIPELINE_STEPS.map((step, i) => {
                const isCompleted = completedSteps.has(step.key);
                const isCurrentActive =
                  !isCompleted &&
                  (i === 0 || completedSteps.has(PIPELINE_STEPS[i - 1].key));

                return (
                  <div key={step.key} className="flex items-center gap-3">
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    ) : isCurrentActive ? (
                      <div className="w-6 h-6 rounded-full border-2 border-pink-500 flex items-center justify-center flex-shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
                      </div>
                    ) : (
                      <Circle className="w-6 h-6 text-gray-300 flex-shrink-0" />
                    )}
                    <span
                      className={`text-sm ${
                        isCompleted
                          ? "text-green-700 font-medium"
                          : isCurrentActive
                          ? "text-pink-700 font-medium"
                          : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </span>
                    {isCurrentActive && (
                      <Badge className="ml-auto bg-pink-100 text-pink-700 border-0 text-xs">
                        In Progress
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-4">
              {statusDescription[client.status] || "Getting everything ready for you."}
            </p>
          </CardContent>
        </Card>

        {/* Initial Photos CTA */}
        <Card className="border-0 shadow-sm rounded-2xl mb-6 bg-gradient-to-r from-violet-50 to-pink-50">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Camera className="w-6 h-6 text-violet-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Take Your Starting Photos</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Capture your starting point so you can see your transformation over the coming weeks.
                </p>
                {onNavigateToPhotos && (
                  <Button
                    onClick={onNavigateToPhotos}
                    className="bg-violet-600 hover:bg-violet-700 text-white text-sm"
                    size="sm"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Take Photos Now
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prepare for Week 1 */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
            <Brain className="w-4 h-4 text-pink-500" />
            Prepare for Week 1
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {PREP_CONTENT.map((item) => (
              <Card key={item.title} className="border-0 shadow-sm rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Message Zoe */}
        <Card className="border-0 shadow-sm rounded-2xl mb-6">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle className="w-4 h-4 text-pink-500" />
              <h3 className="font-semibold text-gray-900 text-sm">Have a question? Message Zoe</h3>
            </div>
            {messageSent ? (
              <div className="flex items-center gap-2 text-green-600 text-sm py-2">
                <CheckCircle className="w-4 h-4" />
                Message sent! Zoe will get back to you soon.
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && messageInput.trim()) {
                      e.preventDefault();
                      sendMessageMutation.mutate(messageInput.trim());
                    }
                  }}
                  className="flex-1 rounded-xl border-gray-200 focus:ring-pink-500"
                />
                <Button
                  size="sm"
                  className="bg-pink-500 hover:bg-pink-600 text-white rounded-xl px-3"
                  disabled={!messageInput.trim() || sendMessageMutation.isPending}
                  onClick={() => sendMessageMutation.mutate(messageInput.trim())}
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* What to Expect */}
        <Card className="border-0 shadow-sm rounded-2xl">
          <CardContent className="p-5">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-500" />
              What to Expect
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex gap-3">
                <Dumbbell className="w-4 h-4 text-pink-400 mt-0.5 flex-shrink-0" />
                <span>Personalized weekly workout plans designed for your goals</span>
              </div>
              <div className="flex gap-3">
                <Apple className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Custom nutrition plan with easy-to-follow meal ideas</span>
              </div>
              <div className="flex gap-3">
                <MessageCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>Direct messaging with your coach throughout the program</span>
              </div>
              <div className="flex gap-3">
                <Brain className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                <span>Daily check-ins with AI-powered insights and feedback</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
