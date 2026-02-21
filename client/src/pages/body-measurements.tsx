import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { User, ProgressTracking, MemberProgram } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, TrendingUp, TrendingDown, Activity, Zap, Heart, Ruler } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function getInitialUser(): User | null {
  if (typeof window !== "undefined") {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  }
  return null;
}

function parseDrGap(value: string): number | null {
  // Parse "2 fingers", "1.5 fingers", "2", etc. to numeric
  const match = value.match(/([\d.]+)/);
  return match ? parseFloat(match[1]) : null;
}

export default function BodyMeasurements() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(getInitialUser);
  const { toast } = useToast();

  // Form state
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [drGap, setDrGap] = useState("");
  const [coreScore, setCoreScore] = useState<number>(5);
  const [pelvicSymptoms, setPelvicSymptoms] = useState("");
  const [backDiscomfort, setBackDiscomfort] = useState<number>(5);
  const [energyLevel, setEnergyLevel] = useState<number>(5);
  const [notes, setNotes] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      setLocation("/");
      return;
    }
    setUser(JSON.parse(userData));
  }, [setLocation]);

  // Get user's active program
  const { data: memberPrograms = [] } = useQuery<MemberProgram[]>({
    queryKey: ["/api/member-programs", user?.id],
    enabled: !!user?.id,
  });

  const activeProgram = memberPrograms.find((mp) => mp.isActive);
  const programId = activeProgram?.programId || "heal-your-core";

  // Fetch existing progress entries
  const { data: entries = [], isLoading } = useQuery<ProgressTracking[]>({
    queryKey: ["/api/progress-tracking", user?.id, programId],
    enabled: !!user?.id,
  });

  // Auto-detect current week from progress data
  useEffect(() => {
    if (entries.length > 0) {
      const maxWeek = Math.max(...entries.map((e) => e.week));
      const nextWeek = Math.min(maxWeek + 1, 6);
      setSelectedWeek(nextWeek);
    }
  }, [entries]);

  // Load existing data when selecting a week that has data
  useEffect(() => {
    const existing = entries.find((e) => e.week === selectedWeek);
    if (existing) {
      setDrGap(existing.drGapMeasurement || "");
      setCoreScore(existing.coreConnectionScore || 5);
      setPelvicSymptoms(existing.pelvicFloorSymptoms || "");
      setBackDiscomfort(existing.postureBackDiscomfort || 5);
      setEnergyLevel(existing.energyLevel || 5);
      setNotes(existing.notes || "");
      setEditingId(existing.id);
    } else {
      setDrGap("");
      setCoreScore(5);
      setPelvicSymptoms("");
      setBackDiscomfort(5);
      setEnergyLevel(5);
      setNotes("");
      setEditingId(null);
    }
  }, [selectedWeek, entries]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = {
        programId,
        week: selectedWeek,
        drGapMeasurement: drGap,
        coreConnectionScore: coreScore,
        pelvicFloorSymptoms: pelvicSymptoms,
        postureBackDiscomfort: backDiscomfort,
        energyLevel,
        notes,
      };
      if (editingId) {
        return apiRequest("PUT", `/api/progress-tracking/${editingId}`, data);
      } else {
        return apiRequest("POST", "/api/progress-tracking", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/progress-tracking", user?.id, programId],
      });
      toast({
        title: "Saved! 🎉",
        description: `Week ${selectedWeek} measurements recorded.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save measurements. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Prepare chart data
  const chartData = entries
    .sort((a, b) => a.week - b.week)
    .map((e) => ({
      week: `Week ${e.week}`,
      weekNum: e.week,
      drGap: parseDrGap(e.drGapMeasurement || ""),
      coreScore: e.coreConnectionScore,
      backDiscomfort: e.postureBackDiscomfort,
      energyLevel: e.energyLevel,
    }));

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setLocation("/progress")}
            className="flex items-center gap-1 text-white/80 hover:text-white mb-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Progress
          </button>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Ruler className="w-6 h-6" />
            Body Measurements
          </h1>
          <p className="text-white/80 text-sm mt-1">
            Track your healing journey week by week
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Measurement Input Form */}
        <Card className="p-5 md:p-6 border-pink-100 shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            Weekly Measurements
          </h2>

          <div className="space-y-5">
            {/* Week Selector */}
            <div>
              <Label className="text-sm font-medium text-gray-700">Week</Label>
              <div className="flex gap-2 mt-1.5">
                {[1, 2, 3, 4, 5, 6].map((w) => {
                  const hasData = entries.some((e) => e.week === w);
                  return (
                    <button
                      key={w}
                      onClick={() => setSelectedWeek(w)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedWeek === w
                          ? "bg-pink-500 text-white shadow-md"
                          : hasData
                          ? "bg-pink-100 text-pink-700 hover:bg-pink-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {w}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {editingId ? "✏️ Editing existing entry" : "📝 New entry"}
              </p>
            </div>

            {/* DR Gap - Hero Field */}
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
              <Label className="text-sm font-semibold text-pink-700 flex items-center gap-1.5">
                <Ruler className="w-4 h-4" />
                DR Gap Measurement
                <span className="text-xs font-normal text-pink-500 ml-1">⭐ Key Metric</span>
              </Label>
              <Input
                value={drGap}
                onChange={(e) => setDrGap(e.target.value)}
                placeholder='e.g., "2 fingers" or "1.5 fingers"'
                className="mt-1.5 border-pink-200 focus:border-pink-400"
              />
              <p className="text-xs text-pink-500 mt-1">
                Measure the gap at your belly button using finger widths
              </p>
            </div>

            {/* Core Connection Score */}
            <div>
              <Label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-purple-500" />
                  Core Connection Score
                </span>
                <span className="text-purple-600 font-semibold">{coreScore}/10</span>
              </Label>
              <Slider
                value={[coreScore]}
                onValueChange={([v]) => setCoreScore(v)}
                min={1}
                max={10}
                step={1}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Weak</span>
                <span>Strong</span>
              </div>
            </div>

            {/* Pelvic Floor Symptoms */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Pelvic Floor Symptoms
              </Label>
              <Select value={pelvicSymptoms} onValueChange={setPelvicSymptoms}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select symptoms..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="mild-leaking">Mild leaking</SelectItem>
                  <SelectItem value="moderate-leaking">Moderate leaking</SelectItem>
                  <SelectItem value="heaviness">Heaviness / pressure</SelectItem>
                  <SelectItem value="pain">Pain or discomfort</SelectItem>
                  <SelectItem value="urgency">Urgency</SelectItem>
                  <SelectItem value="multiple">Multiple symptoms</SelectItem>
                  <SelectItem value="improving">Symptoms improving</SelectItem>
                  <SelectItem value="resolved">Symptoms resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Posture/Back Discomfort */}
            <div>
              <Label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-orange-500" />
                  Posture / Back Discomfort
                </span>
                <span className="text-orange-600 font-semibold">{backDiscomfort}/10</span>
              </Label>
              <Slider
                value={[backDiscomfort]}
                onValueChange={([v]) => setBackDiscomfort(v)}
                min={1}
                max={10}
                step={1}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>No pain</span>
                <span>Severe</span>
              </div>
            </div>

            {/* Energy Level */}
            <div>
              <Label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  Energy Level
                </span>
                <span className="text-yellow-600 font-semibold">{energyLevel}/10</span>
              </Label>
              <Slider
                value={[energyLevel]}
                onValueChange={([v]) => setEnergyLevel(v)}
                min={1}
                max={10}
                step={1}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label className="text-sm font-medium text-gray-700">Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How are you feeling? Any wins this week?"
                className="mt-1.5 min-h-[80px]"
              />
            </div>

            {/* Save Button */}
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-3"
            >
              {saveMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {editingId ? "Update" : "Save"} Week {selectedWeek}
                </span>
              )}
            </Button>
          </div>
        </Card>

        {/* Trend Charts */}
        {chartData.length >= 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-pink-500" />
              Your Trends
            </h2>

            {/* DR Gap Chart - Hero */}
            <Card className="p-4 md:p-5 border-pink-200 shadow-md bg-gradient-to-br from-white to-pink-50">
              <h3 className="text-sm font-semibold text-pink-700 mb-3 flex items-center gap-1.5">
                <Ruler className="w-4 h-4" />
                DR Gap Trend
                <span className="text-xs font-normal text-pink-400 ml-1">↓ lower is better</span>
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.filter((d) => d.drGap !== null)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} domain={[0, "auto"]} />
                    <Tooltip
                      formatter={(value: number) => [`${value} fingers`, "DR Gap"]}
                      contentStyle={{ borderRadius: 8, borderColor: "#f9a8d4" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="drGap"
                      stroke="#ec4899"
                      strokeWidth={3}
                      dot={{ fill: "#ec4899", r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Core Connection Score */}
            <Card className="p-4 md:p-5 border-purple-100 shadow-sm">
              <h3 className="text-sm font-semibold text-purple-700 mb-3 flex items-center gap-1.5">
                <Activity className="w-4 h-4" />
                Core Connection
                <span className="text-xs font-normal text-purple-400 ml-1">↑ higher is better</span>
              </h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} domain={[0, 10]} />
                    <Tooltip contentStyle={{ borderRadius: 8 }} />
                    <Line
                      type="monotone"
                      dataKey="coreScore"
                      stroke="#a855f7"
                      strokeWidth={2}
                      dot={{ fill: "#a855f7", r: 4 }}
                      name="Core Score"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Back Discomfort */}
            <Card className="p-4 md:p-5 border-orange-100 shadow-sm">
              <h3 className="text-sm font-semibold text-orange-700 mb-3 flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4" />
                Back Discomfort
                <span className="text-xs font-normal text-orange-400 ml-1">↓ lower is better</span>
              </h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fff7ed" />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} domain={[0, 10]} />
                    <Tooltip contentStyle={{ borderRadius: 8 }} />
                    <Line
                      type="monotone"
                      dataKey="backDiscomfort"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={{ fill: "#f97316", r: 4 }}
                      name="Discomfort"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Energy Level */}
            <Card className="p-4 md:p-5 border-yellow-100 shadow-sm">
              <h3 className="text-sm font-semibold text-yellow-700 mb-3 flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                Energy Level
                <span className="text-xs font-normal text-yellow-500 ml-1">↑ higher is better</span>
              </h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fefce8" />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} domain={[0, 10]} />
                    <Tooltip contentStyle={{ borderRadius: 8 }} />
                    <Line
                      type="monotone"
                      dataKey="energyLevel"
                      stroke="#eab308"
                      strokeWidth={2}
                      dot={{ fill: "#eab308", r: 4 }}
                      name="Energy"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {chartData.length === 0 && !isLoading && (
          <Card className="p-6 text-center border-dashed border-2 border-pink-200">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-gray-600 text-sm">
              No measurements yet. Fill in your first week above to start tracking your progress!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
