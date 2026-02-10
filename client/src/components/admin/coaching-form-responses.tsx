import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ClipboardList, Stethoscope, CheckCircle2, Clock, Edit3, Save, FileText, Dumbbell } from "lucide-react";
import type { CoachingFormResponse } from "@shared/schema";

const LIFESTYLE_MEDICAL_HISTORY_OPTIONS = [
  "Shortness of breath", "Chest pain", "Vaginal bleeding", "Pelvic or abdominal pain/cramps",
  "High blood pressure", "Low blood pressure", "Diabetes", "Hypoglycaemia (low blood sugar)",
  "Seizures", "Heart disease", "Blood disorders", "Eating disorders", "Arthritis",
  "Osteoporosis or bone/joint issues", "Back pain", "Knee pain", "Neck pain",
  "Incompetent cervix", "Multiple gestation (twins/triplets)", "Previous miscarriage",
  "Major surgery in the last 10 years", "Minor surgery in the last 10 years", "None of the above",
];

const MEDICAL_FLAGS_OPTIONS = [
  "Pelvic girdle pain", "Sciatica", "High BP", "Gestational diabetes", "Cervical concerns", "None",
];

const DISCOMFORT_AREAS_OPTIONS = [
  "Lower back / SI joint", "Hips or pelvis", "Tailbone", "Upper back / between shoulder blades",
  "Neck and shoulders", "Knees", "Feet / arches / heels", "Wrists or hands (carpal tunnel-like)",
  "Rib pressure or breath restriction", "General heaviness / fatigue, no clear pain",
];

const DISCOMFORT_WORSE_OPTIONS = [
  "First thing in the morning", "After sitting for long periods", "After standing or walking",
  "While sleeping or turning in bed", "At the end of the day", "During workouts", "Random / unpredictable",
];

const CORE_AWARENESS_OPTIONS = [
  "Heaviness or pressure downwards", "Needing to clench or brace to move",
  "Short or shallow breathing", "Difficulty relaxing belly or ribs", "None of the above",
];

const HELP_NEEDED_OPTIONS = [
  "Relief from aches", "Feeling stronger and more supported", "Better posture and breathing",
  "Preparing my body for birth", "Staying active without fear", "Just moving without discomfort",
];

function getDefaultLifestyleForm(): Record<string, any> {
  return {
    pregnancyNumber: "", expectedDueDate: "", trimester: "",
    medicalHistory: [], medicalHistoryOther: "", medicalFlags: [], medicalFlagsOther: "",
    discomfortAreas: [], discomfortWorse: [],
    exerciseHistory: "", movementFeels: "", coreAwareness: [],
    helpNeeded: [], takingMedications: "", medicationDetails: "",
    previousPregnancies: "", concerns: "", mainGoals: "", currentLifestyle: "",
    howDidYouHear: "", referredBy: "", usingOnlinePrograms: "", whichProgram: "",
    consentToContact: false,
  };
}

function getDefaultHealthForm(): Record<string, any> {
  return {
    expectedDueDate: "", currentTrimester: "",
    participantDeclaration: "",
    doctorName: "", doctorQualification: "", clinicName: "", doctorContact: "",
    clearanceDecision: "", clearanceRestrictions: "",
  };
}

function MultiCheckboxField({ label, options, value, onChange }: {
  label: string; options: string[]; value: string[]; onChange: (v: string[]) => void;
}) {
  const toggle = (opt: string) => {
    onChange(value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt]);
  };
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {options.map(opt => (
          <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox checked={value.includes(opt)} onCheckedChange={() => toggle(opt)} />
            <span>{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="pt-4 pb-2">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</h4>
      <Separator className="mt-2" />
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: any }) {
  if (value === undefined || value === null || value === "") return null;
  const display = Array.isArray(value) ? value.join(", ") : String(value);
  if (!display) return null;
  return (
    <div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-sm text-gray-900 mt-0.5">{display}</p>
    </div>
  );
}

function LifestyleQuestionnaireDialog({ open, onOpenChange, existingData, clientId }: {
  open: boolean; onOpenChange: (v: boolean) => void; existingData?: Record<string, any>; clientId: string;
}) {
  const [form, setForm] = useState<Record<string, any>>(getDefaultLifestyleForm());
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setForm(existingData ? { ...getDefaultLifestyleForm(), ...existingData } : getDefaultLifestyleForm());
    }
  }, [open, existingData]);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admin/coaching/clients/${clientId}/form-responses`, {
        formType: "lifestyle_questionnaire", responses: form,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/coaching/clients', clientId, 'form-responses'] });
      onOpenChange(false);
      toast({ title: "Saved", description: "Lifestyle questionnaire saved successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const set = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-pink-500" />
            Lifestyle Questionnaire
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-4" style={{ maxHeight: "calc(90vh - 140px)" }}>
          <div className="space-y-4 py-2">
            <SectionHeader title="Pregnancy Details" />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Pregnancy Number</Label>
                <Select value={form.pregnancyNumber} onValueChange={v => set("pregnancyNumber", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="First pregnancy">First pregnancy</SelectItem>
                    <SelectItem value="Second pregnancy">Second pregnancy</SelectItem>
                    <SelectItem value="Third or more">Third or more</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Expected Due Date</Label><Input type="date" value={form.expectedDueDate} onChange={e => set("expectedDueDate", e.target.value)} /></div>
              <div>
                <Label>Trimester</Label>
                <Select value={form.trimester} onValueChange={v => set("trimester", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="First trimester (0–12 weeks)">First trimester (0–12 weeks)</SelectItem>
                    <SelectItem value="Second trimester (13–26 weeks)">Second trimester (13–26 weeks)</SelectItem>
                    <SelectItem value="Third trimester (27–40 weeks)">Third trimester (27–40 weeks)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <SectionHeader title="Medical History" />
            <MultiCheckboxField label="Medical History" options={LIFESTYLE_MEDICAL_HISTORY_OPTIONS} value={form.medicalHistory || []} onChange={v => set("medicalHistory", v)} />
            <div><Label>Other (Medical History)</Label><Input value={form.medicalHistoryOther} onChange={e => set("medicalHistoryOther", e.target.value)} placeholder="Any other conditions..." /></div>
            <MultiCheckboxField label="Medical Flags" options={MEDICAL_FLAGS_OPTIONS} value={form.medicalFlags || []} onChange={v => set("medicalFlags", v)} />
            <div><Label>Other (Medical Flags)</Label><Input value={form.medicalFlagsOther} onChange={e => set("medicalFlagsOther", e.target.value)} placeholder="Any other flags..." /></div>

            <SectionHeader title="Discomfort & Pain" />
            <MultiCheckboxField label="Areas of Discomfort" options={DISCOMFORT_AREAS_OPTIONS} value={form.discomfortAreas || []} onChange={v => set("discomfortAreas", v)} />
            <MultiCheckboxField label="When is Discomfort Worse?" options={DISCOMFORT_WORSE_OPTIONS} value={form.discomfortWorse || []} onChange={v => set("discomfortWorse", v)} />

            <SectionHeader title="Movement & Exercise History" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Exercise History</Label>
                <Select value={form.exerciseHistory} onValueChange={v => set("exerciseHistory", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Didn't exercise">Didn't exercise</SelectItem>
                    <SelectItem value="Walked / did light activity">Walked / did light activity</SelectItem>
                    <SelectItem value="Strength trained">Strength trained</SelectItem>
                    <SelectItem value="Did yoga / pilates">Did yoga / pilates</SelectItem>
                    <SelectItem value="Did mixed / athletic workouts">Did mixed / athletic workouts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>How Movement Feels</Label>
                <Select value={form.movementFeels} onValueChange={v => set("movementFeels", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Comforting">Comforting</SelectItem>
                    <SelectItem value="Neutral">Neutral</SelectItem>
                    <SelectItem value="Intimidating">Intimidating</SelectItem>
                    <SelectItem value="Pain-provoking">Pain-provoking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <MultiCheckboxField label="Core Awareness" options={CORE_AWARENESS_OPTIONS} value={form.coreAwareness || []} onChange={v => set("coreAwareness", v)} />

            <SectionHeader title="Goals & Lifestyle" />
            <MultiCheckboxField label="What Help Do You Need?" options={HELP_NEEDED_OPTIONS} value={form.helpNeeded || []} onChange={v => set("helpNeeded", v)} />
            <div>
              <Label>Taking Medications?</Label>
              <Select value={form.takingMedications} onValueChange={v => set("takingMedications", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.takingMedications === "Yes" && (
              <div><Label>Medication Details</Label><Textarea value={form.medicationDetails} onChange={e => set("medicationDetails", e.target.value)} rows={2} /></div>
            )}
            <div><Label>Previous Pregnancies</Label><Textarea value={form.previousPregnancies} onChange={e => set("previousPregnancies", e.target.value)} rows={2} /></div>
            <div><Label>Concerns</Label><Textarea value={form.concerns} onChange={e => set("concerns", e.target.value)} rows={2} /></div>
            <div><Label>Main Goals</Label><Textarea value={form.mainGoals} onChange={e => set("mainGoals", e.target.value)} rows={2} /></div>
            <div><Label>Current Lifestyle</Label><Textarea value={form.currentLifestyle} onChange={e => set("currentLifestyle", e.target.value)} rows={2} /></div>

            <SectionHeader title="Referral & Consent" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>How Did You Hear About Us?</Label>
                <Select value={form.howDidYouHear} onValueChange={v => set("howDidYouHear", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="Youtube">Youtube</SelectItem>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="Friend/ word of mouth">Friend/ word of mouth</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Referred By</Label><Input value={form.referredBy} onChange={e => set("referredBy", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Using Online Programs?</Label>
                <Select value={form.usingOnlinePrograms} onValueChange={v => set("usingOnlinePrograms", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.usingOnlinePrograms === "Yes" && (
                <div><Label>Which Program?</Label><Input value={form.whichProgram} onChange={e => set("whichProgram", e.target.value)} /></div>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={form.consentToContact} onCheckedChange={v => set("consentToContact", !!v)} />
              <span>Yes, I consent to being contacted</span>
            </label>
          </div>
        </div>
        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
            <Save className="w-4 h-4 mr-2" />
            {mutation.isPending ? "Saving..." : "Save Questionnaire"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function HealthEvaluationDialog({ open, onOpenChange, existingData, clientId }: {
  open: boolean; onOpenChange: (v: boolean) => void; existingData?: Record<string, any>; clientId: string;
}) {
  const [form, setForm] = useState<Record<string, any>>(getDefaultHealthForm());
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setForm(existingData ? { ...getDefaultHealthForm(), ...existingData } : getDefaultHealthForm());
    }
  }, [open, existingData]);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admin/coaching/clients/${clientId}/form-responses`, {
        formType: "health_evaluation", responses: form,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/coaching/clients', clientId, 'form-responses'] });
      onOpenChange(false);
      toast({ title: "Saved", description: "Health evaluation saved successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const set = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-pink-500" />
            Health Evaluation
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-4" style={{ maxHeight: "calc(90vh - 140px)" }}>
          <div className="space-y-4 py-2">
            <SectionHeader title="Pregnancy Details" />
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Expected Due Date</Label><Input type="date" value={form.expectedDueDate} onChange={e => set("expectedDueDate", e.target.value)} /></div>
              <div>
                <Label>Current Trimester</Label>
                <Select value={form.currentTrimester} onValueChange={v => set("currentTrimester", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="First (0–12 weeks)">First (0–12 weeks)</SelectItem>
                    <SelectItem value="Second (13–26 weeks)">Second (13–26 weeks)</SelectItem>
                    <SelectItem value="Third (27–40 weeks)">Third (27–40 weeks)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <SectionHeader title="Participant Declaration" />
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-800">
              I confirm that: • I have completed the Pregnancy with Zoe intake and health questionnaire honestly and accurately. • I understand that this program involves physical activity during pregnancy. • I authorise my healthcare provider to share relevant information about my medical fitness for exercise with Zoe Modgill.
            </div>
            <div>
              <Label>Participant Declaration</Label>
              <Select value={form.participantDeclaration} onValueChange={v => set("participantDeclaration", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="I agree">I agree</SelectItem>
                  <SelectItem value="I do not agree">I do not agree</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <SectionHeader title="Doctor/Midwife Clearance" />
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Medical Professional's Name</Label><Input value={form.doctorName} onChange={e => set("doctorName", e.target.value)} /></div>
              <div><Label>Qualification / Speciality</Label><Input value={form.doctorQualification} onChange={e => set("doctorQualification", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Clinic / Hospital Name</Label><Input value={form.clinicName} onChange={e => set("clinicName", e.target.value)} /></div>
              <div><Label>Contact Number / Email</Label><Input value={form.doctorContact} onChange={e => set("doctorContact", e.target.value)} /></div>
            </div>
            <div>
              <Label>Clearance Decision</Label>
              <Select value={form.clearanceDecision} onValueChange={v => set("clearanceDecision", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cleared for exercise without restrictions">Cleared for exercise without restrictions</SelectItem>
                  <SelectItem value="Cleared with restrictions">Cleared with restrictions</SelectItem>
                  <SelectItem value="Not cleared for exercise at this time">Not cleared for exercise at this time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.clearanceDecision === "Cleared with restrictions" && (
              <div><Label>Restrictions</Label><Textarea value={form.clearanceRestrictions} onChange={e => set("clearanceRestrictions", e.target.value)} rows={3} placeholder="Describe restrictions..." /></div>
            )}
          </div>
        </div>
        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
            <Save className="w-4 h-4 mr-2" />
            {mutation.isPending ? "Saving..." : "Save Evaluation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LifestyleReadOnly({ data }: { data: Record<string, any> }) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Pregnancy Details</h4>
      <div className="grid grid-cols-2 gap-2">
        <ReadOnlyField label="Pregnancy Number" value={data.pregnancyNumber} />
        <ReadOnlyField label="Expected Due Date" value={data.expectedDueDate} />
        <ReadOnlyField label="Trimester" value={data.trimester} />
      </div>
      <Separator />
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Medical History</h4>
      <ReadOnlyField label="Medical History" value={data.medicalHistory} />
      <ReadOnlyField label="Other" value={data.medicalHistoryOther} />
      <ReadOnlyField label="Medical Flags" value={data.medicalFlags} />
      <ReadOnlyField label="Other Flags" value={data.medicalFlagsOther} />
      <Separator />
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Discomfort & Pain</h4>
      <ReadOnlyField label="Discomfort Areas" value={data.discomfortAreas} />
      <ReadOnlyField label="When Worse" value={data.discomfortWorse} />
      <Separator />
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Movement & Exercise</h4>
      <div className="grid grid-cols-2 gap-2">
        <ReadOnlyField label="Exercise History" value={data.exerciseHistory} />
        <ReadOnlyField label="Movement Feels" value={data.movementFeels} />
      </div>
      <ReadOnlyField label="Core Awareness" value={data.coreAwareness} />
      <Separator />
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Goals & Lifestyle</h4>
      <ReadOnlyField label="Help Needed" value={data.helpNeeded} />
      <ReadOnlyField label="Taking Medications" value={data.takingMedications} />
      <ReadOnlyField label="Medication Details" value={data.medicationDetails} />
      <ReadOnlyField label="Previous Pregnancies" value={data.previousPregnancies} />
      <ReadOnlyField label="Concerns" value={data.concerns} />
      <ReadOnlyField label="Main Goals" value={data.mainGoals} />
      <ReadOnlyField label="Current Lifestyle" value={data.currentLifestyle} />
      <Separator />
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Referral & Consent</h4>
      <div className="grid grid-cols-2 gap-2">
        <ReadOnlyField label="How Did You Hear" value={data.howDidYouHear} />
        <ReadOnlyField label="Referred By" value={data.referredBy} />
        <ReadOnlyField label="Using Online Programs" value={data.usingOnlinePrograms} />
        <ReadOnlyField label="Which Program" value={data.whichProgram} />
        <ReadOnlyField label="Consent to Contact" value={data.consentToContact ? "Yes" : "No"} />
      </div>
    </div>
  );
}

function HealthEvaluationReadOnly({ data }: { data: Record<string, any> }) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Pregnancy Details</h4>
      <div className="grid grid-cols-2 gap-2">
        <ReadOnlyField label="Expected Due Date" value={data.expectedDueDate} />
        <ReadOnlyField label="Trimester" value={data.currentTrimester} />
      </div>
      <Separator />
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Participant Declaration</h4>
      <ReadOnlyField label="Declaration" value={data.participantDeclaration} />
      <Separator />
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Doctor/Midwife Clearance</h4>
      <div className="grid grid-cols-2 gap-2">
        <ReadOnlyField label="Doctor Name" value={data.doctorName} />
        <ReadOnlyField label="Qualification" value={data.doctorQualification} />
        <ReadOnlyField label="Clinic" value={data.clinicName} />
        <ReadOnlyField label="Contact" value={data.doctorContact} />
      </div>
      <ReadOnlyField label="Clearance Decision" value={data.clearanceDecision} />
      <ReadOnlyField label="Restrictions" value={data.clearanceRestrictions} />
    </div>
  );
}

const GOAL_PLAN_OPTIONS = [
  "A Beginners Guide to Wellness", "Tone & Build Muscle", "Post Baby-The first phase",
  "Fatloss & Weight-loss – The Mindful Approach", "Get the Wedding Glow",
  "Strengthening your Lower Back & Core", "A Detox plan: Mind & Body, Skin & Hair",
  "Become Your Holiday Body", "Aches & Pains: Lets feel Good",
  "Your Post-Covid Return to Exercise",
];

const PERIOD_ISSUES_OPTIONS = [
  "Cramps", "Heavy Periods", "Irregular Periods", "Painful Periods",
  "No Periods", "Able to Exercise during Periods", "Have Medication to help with cramps",
];

const STRESS_SOURCES_OPTIONS = ["Work", "Family", "Social", "Finances", "Health", "Other"];

const FAMILY_OVERWEIGHT_OPTIONS = ["Father", "Mother", "Sibling", "Grandparents"];

const EATING_HABITS_OPTIONS = [
  "Eat too much", "Late-night eating", "Dislike healthy foods",
  "Healthy foods not easily available", "Poor snack choices",
  "Family members don't like healthy foods", "Have negative relationship to food",
  "Struggle with eating issues", "Love to eat", "Eat because I have to",
  "Emotional eater", "Eat too much under stress", "Eat too little under stress",
  "Don't care to cook", "Confused about nutrition advice",
];

const REASONS_TO_EAT_OPTIONS = ["Boredom", "Social", "Stressed", "Tired", "Depressed", "Happy", "Nervous"];

const LOW_PARTICIPATION_OPTIONS = ["Lack of Interest", "Illness", "Injury", "Lack of time", "Other"];

const HELP_GOALS_OPTIONS = [
  "Lose Body Fat", "Develop Muscle", "Tone", "Rehabilitate an Injury",
  "Nutrition", "Education", "Start an Exercise Program",
  "Design a more advanced program", "Safety", "Sports Specific Training",
  "Increase Muscle Size", "Fun", "Motivation", "Constant pushing",
  "Just to feel good", "Other",
];

const EXERCISE_ACTIVITIES = ["Cardio/Aerobic", "Strength/Resistance", "Flexibility/Stretching", "Balance", "Sports/Leisure"];

function getDefaultPrivateCoachingForm(): Record<string, any> {
  return {
    dietType: "", givenBirthWithinYear: "", hasInjury: "",
    selectedGoals: [],
    healthConcerns: [
      { problem: "", severity: "" }, { problem: "", severity: "" },
      { problem: "", severity: "" }, { problem: "", severity: "" },
    ],
    healthConditionsAffectExercise: "", recentSurgery: "",
    takeMedications: "", medicationDetails: "",
    heartCondition: "", chestPainDuringActivity: "", chestPainWithoutActivity: "",
    loseBalanceDizziness: "", loseConsciousness: "",
    pregnantOrRecentBirth: "", deliveryTimeframe: "", dateOfDelivery: "",
    birthType: "", deliveryComplications: "", deliveryComplicationsDetails: "",
    medicallyCleared: "", currentlyBreastfeeding: "",
    periodsRegular: "", periodIssues: [],
    smoke: "", cigarettesPerDay: "", smokingYears: "",
    drinkAlcohol: "", alcoholFrequency: "",
    sleepHours: "", jobType: "", jobTypeOther: "",
    jobRequiresTravel: "", travelFrequency: "",
    stressLevel: "", stressSources: [], stressSourceOther: "",
    familyOverweight: [], overweightAsChild: "",
    nutritionRating: "", mealsPerDay: "", skipMeals: "",
    mealsOutPerWeek: "", eatBreakfast: "",
    eatingHabits: [], waterIntake: "",
    knowCalorieIntake: "", dailyCalories: "",
    doOwnCooking: "", reasonsToEat: [],
    eatPastFullness: "", eatHighFatSugar: "",
    nutritionImprovements: ["", "", ""],
    dietTypeDetail: "", eatEggs: "", eatSeafood: "", seafoodDislikes: "",
    foodRestrictions: "", foodRestrictionsDetails: "",
    sweetOrSavoury: "", dislikedFoods: "", favoriteFoodsDrinks: "", foodCravings: "",
    bestShapeWhen: "", consistentExercise3Months: "",
    whatStoppedWorkouts: "", fitnessLevelRating: "", motivatedToExercise: "",
    physicalActivityFrequency: "",
    lowParticipationReasons: [], lowParticipationOther: "",
    specificInjury: "", injuryDetails: "",
    idealTrainingWeek: "", exerciseLocation: "", exerciseLocationOther: "",
    currentExerciseRoutine: EXERCISE_ACTIVITIES.map(a => ({
      activity: a, daysPerWeek: "", duration: "", intensity: "", types: "",
    })),
    helpGoals: [], helpGoalsOther: "",
    priorityGoals: ["", "", ""],
    goalAchievementFeeling: "",
    healthPriority: "", commitmentLevel: "",
    obstaclesDetails: "", overcomeMethods: ["", "", ""],
    howHeardAbout: "", referredBy: "",
    usingOnlinePrograms: "", whichProgram: "",
    consentTerms: false, consentBodyImages: false, signatureDate: "",
  };
}

function PrivateCoachingQuestionnaireDialog({ open, onOpenChange, existingData, clientId }: {
  open: boolean; onOpenChange: (v: boolean) => void; existingData?: Record<string, any>; clientId: string;
}) {
  const [form, setForm] = useState<Record<string, any>>(getDefaultPrivateCoachingForm());
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setForm(existingData ? { ...getDefaultPrivateCoachingForm(), ...existingData } : getDefaultPrivateCoachingForm());
    }
  }, [open, existingData]);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admin/coaching/clients/${clientId}/form-responses`, {
        formType: "private_coaching_questionnaire", responses: form,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/coaching/clients', clientId, 'form-responses'] });
      onOpenChange(false);
      toast({ title: "Saved", description: "Private coaching questionnaire saved successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const set = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  const updateHealthConcern = (index: number, field: string, value: string) => {
    const concerns = [...(form.healthConcerns || [])];
    concerns[index] = { ...concerns[index], [field]: value };
    set("healthConcerns", concerns);
  };

  const updateRoutine = (index: number, field: string, value: string) => {
    const routine = [...(form.currentExerciseRoutine || [])];
    routine[index] = { ...routine[index], [field]: value };
    set("currentExerciseRoutine", routine);
  };

  const updateArrayField = (key: string, index: number, value: string) => {
    const arr = [...(form[key] || [])];
    arr[index] = value;
    set(key, arr);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-pink-500" />
            Private Coaching Questionnaire
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-4" style={{ maxHeight: "calc(90vh - 140px)" }}>
          <div className="space-y-4 py-2">

            <SectionHeader title="Your Basics" />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Diet Type</Label>
                <Select value={form.dietType} onValueChange={v => set("dietType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {["Vegetarian", "Non-Vegetarian", "Vegan", "Eggs"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Given Birth Within Last Year?</Label>
                <Select value={form.givenBirthWithinYear} onValueChange={v => set("givenBirthWithinYear", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Do You Have an Injury?</Label>
                <Select value={form.hasInjury} onValueChange={v => set("hasInjury", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <SectionHeader title="Goal-Based Plan (Pick 1-2)" />
            <MultiCheckboxField label="Select Your Goals" options={GOAL_PLAN_OPTIONS} value={form.selectedGoals || []} onChange={v => set("selectedGoals", v)} />

            <SectionHeader title="Section A: Medical Details" />
            <Label className="text-sm font-medium">Current Health Concerns</Label>
            {(form.healthConcerns || []).map((c: any, i: number) => (
              <div key={i} className="grid grid-cols-2 gap-3">
                <div><Input placeholder={`Problem ${i + 1}`} value={c.problem} onChange={e => updateHealthConcern(i, "problem", e.target.value)} /></div>
                <div>
                  <Select value={c.severity} onValueChange={v => updateHealthConcern(i, "severity", v)}>
                    <SelectTrigger><SelectValue placeholder="Severity..." /></SelectTrigger>
                    <SelectContent>
                      {["Mild", "Moderate", "Severe"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Health conditions affect exercise?</Label>
                <Select value={form.healthConditionsAffectExercise} onValueChange={v => set("healthConditionsAffectExercise", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <Label>Recent Surgery?</Label>
                <Select value={form.recentSurgery} onValueChange={v => set("recentSurgery", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Take Medications?</Label>
              <Select value={form.takeMedications} onValueChange={v => set("takeMedications", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
              </Select>
            </div>
            {form.takeMedications === "Yes" && (
              <div><Label>Medication Details</Label><Textarea value={form.medicationDetails} onChange={e => set("medicationDetails", e.target.value)} rows={2} /></div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Heart Condition?</Label>
                <Select value={form.heartCondition} onValueChange={v => set("heartCondition", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <Label>Chest Pain During Activity?</Label>
                <Select value={form.chestPainDuringActivity} onValueChange={v => set("chestPainDuringActivity", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Chest Pain Without Activity?</Label>
                <Select value={form.chestPainWithoutActivity} onValueChange={v => set("chestPainWithoutActivity", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <Label>Lose Balance / Dizziness?</Label>
                <Select value={form.loseBalanceDizziness} onValueChange={v => set("loseBalanceDizziness", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Lose Consciousness?</Label>
              <Select value={form.loseConsciousness} onValueChange={v => set("loseConsciousness", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <Label>Pregnant or Given Birth Within Last Year?</Label>
              <Select value={form.pregnantOrRecentBirth} onValueChange={v => set("pregnantOrRecentBirth", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
              </Select>
            </div>
            {form.pregnantOrRecentBirth === "Yes" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Delivery Timeframe</Label>
                    <Select value={form.deliveryTimeframe} onValueChange={v => set("deliveryTimeframe", v)}>
                      <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        {["1-3 months ago", "3-6 months ago", "6-9 months ago", "9-12 months ago", "More than 1 year ago"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Date of Delivery</Label><Input value={form.dateOfDelivery} onChange={e => set("dateOfDelivery", e.target.value)} placeholder="Enter date..." /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Birth Type</Label>
                    <Select value={form.birthType} onValueChange={v => set("birthType", v)}>
                      <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Normal Birth">Normal Birth</SelectItem>
                        <SelectItem value="C-Section">C-Section</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Delivery Complications?</Label>
                    <Select value={form.deliveryComplications} onValueChange={v => set("deliveryComplications", v)}>
                      <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                {form.deliveryComplications === "Yes" && (
                  <div><Label>Complication Details</Label><Textarea value={form.deliveryComplicationsDetails} onChange={e => set("deliveryComplicationsDetails", e.target.value)} rows={2} /></div>
                )}
                <div>
                  <Label>Medically Cleared to Exercise?</Label>
                  <Select value={form.medicallyCleared} onValueChange={v => set("medicallyCleared", v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                  </Select>
                </div>
              </>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Currently Breastfeeding?</Label>
                <Select value={form.currentlyBreastfeeding} onValueChange={v => set("currentlyBreastfeeding", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <Label>Periods Regular?</Label>
                <Select value={form.periodsRegular} onValueChange={v => set("periodsRegular", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <MultiCheckboxField label="Period Issues" options={PERIOD_ISSUES_OPTIONS} value={form.periodIssues || []} onChange={v => set("periodIssues", v)} />

            <SectionHeader title="Section B: Lifestyle" />
            <div>
              <Label>Do You Smoke?</Label>
              <Select value={form.smoke} onValueChange={v => set("smoke", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
              </Select>
            </div>
            {form.smoke === "Yes" && (
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Cigarettes Per Day</Label><Input value={form.cigarettesPerDay} onChange={e => set("cigarettesPerDay", e.target.value)} /></div>
                <div><Label>Number of Years</Label><Input value={form.smokingYears} onChange={e => set("smokingYears", e.target.value)} /></div>
              </div>
            )}
            <div>
              <Label>Drink Alcohol?</Label>
              <Select value={form.drinkAlcohol} onValueChange={v => set("drinkAlcohol", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
              </Select>
            </div>
            {form.drinkAlcohol === "Yes" && (
              <div>
                <Label>Alcohol Frequency</Label>
                <Select value={form.alcoholFrequency} onValueChange={v => set("alcoholFrequency", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {["1-3 Beverages a week", "4-6 Beverages a week", "7-10 Beverages a week", ">10 Beverages a week"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Sleep Hours</Label>
                <Select value={form.sleepHours} onValueChange={v => set("sleepHours", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {["8-10 hours", "6-8 Hours", "4-6 Hours", "less than 4 hours"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Job Type</Label>
                <Select value={form.jobType} onValueChange={v => set("jobType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {["Sedentary", "Active", "Physically Demanding", "Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {form.jobType === "Other" && (
              <div><Label>Job Type (Other)</Label><Input value={form.jobTypeOther} onChange={e => set("jobTypeOther", e.target.value)} /></div>
            )}
            <div>
              <Label>Job Requires Travel?</Label>
              <Select value={form.jobRequiresTravel} onValueChange={v => set("jobRequiresTravel", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
              </Select>
            </div>
            {form.jobRequiresTravel === "Yes" && (
              <div>
                <Label>Travel Frequency</Label>
                <Select value={form.travelFrequency} onValueChange={v => set("travelFrequency", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {["Very often", "Sometimes", "Seldomly"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Stress Level (1-10)</Label>
              <Select value={form.stressLevel} onValueChange={v => set("stressLevel", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <MultiCheckboxField label="Biggest Sources of Stress" options={STRESS_SOURCES_OPTIONS} value={form.stressSources || []} onChange={v => set("stressSources", v)} />
            {(form.stressSources || []).includes("Other") && (
              <div><Label>Other Stress Source</Label><Input value={form.stressSourceOther} onChange={e => set("stressSourceOther", e.target.value)} /></div>
            )}
            <MultiCheckboxField label="Family Members Overweight?" options={FAMILY_OVERWEIGHT_OPTIONS} value={form.familyOverweight || []} onChange={v => set("familyOverweight", v)} />
            <div>
              <Label>Overweight as a Child?</Label>
              <Select value={form.overweightAsChild} onValueChange={v => set("overweightAsChild", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
              </Select>
            </div>

            <SectionHeader title="Section C: Nutrition" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Nutrition Rating (1-10)</Label>
                <Select value={form.nutritionRating} onValueChange={v => set("nutritionRating", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Meals Per Day</Label>
                <Select value={form.mealsPerDay} onValueChange={v => set("mealsPerDay", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 6 }, (_, i) => i + 1).map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Skip Meals?</Label>
                <Select value={form.skipMeals} onValueChange={v => set("skipMeals", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {["Yes", "No", "Sometimes"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Meals Out Per Week</Label>
                <Select value={form.mealsOutPerWeek} onValueChange={v => set("mealsOutPerWeek", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {["0-1", "1-3", "3-5", ">5 meals"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Eat Breakfast?</Label>
              <Select value={form.eatBreakfast} onValueChange={v => set("eatBreakfast", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
              </Select>
            </div>
            <MultiCheckboxField label="Eating Habits" options={EATING_HABITS_OPTIONS} value={form.eatingHabits || []} onChange={v => set("eatingHabits", v)} />
            <div>
              <Label>Water Intake</Label>
              <Select value={form.waterIntake} onValueChange={v => set("waterIntake", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {["less than 1 litre", "1-2 Litres", "3+ Litres"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Know Calorie Intake?</Label>
              <Select value={form.knowCalorieIntake} onValueChange={v => set("knowCalorieIntake", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
              </Select>
            </div>
            {form.knowCalorieIntake === "Yes" && (
              <div><Label>Daily Calories</Label><Input value={form.dailyCalories} onChange={e => set("dailyCalories", e.target.value)} /></div>
            )}
            <div>
              <Label>Do Own Cooking?</Label>
              <Select value={form.doOwnCooking} onValueChange={v => set("doOwnCooking", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
              </Select>
            </div>
            <MultiCheckboxField label="Besides Hunger, Reasons to Eat" options={REASONS_TO_EAT_OPTIONS} value={form.reasonsToEat || []} onChange={v => set("reasonsToEat", v)} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Eat Past Fullness?</Label>
                <Select value={form.eatPastFullness} onValueChange={v => set("eatPastFullness", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {["Often", "Sometimes", "Never"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Eat High Fat/Sugar Foods?</Label>
                <Select value={form.eatHighFatSugar} onValueChange={v => set("eatHighFatSugar", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {["Often", "Sometimes", "Never"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Label className="text-sm font-medium">3 Nutrition Areas to Improve</Label>
            {[0, 1, 2].map(i => (
              <div key={i}><Input placeholder={`Improvement ${i + 1}`} value={(form.nutritionImprovements || [])[i] || ""} onChange={e => updateArrayField("nutritionImprovements", i, e.target.value)} /></div>
            ))}

            <SectionHeader title="Section D: Diet Details" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Diet Type</Label>
                <Select value={form.dietTypeDetail} onValueChange={v => set("dietTypeDetail", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="Non-Vegetarian">Non-Vegetarian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Eat Eggs?</Label>
                <Select value={form.eatEggs} onValueChange={v => set("eatEggs", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Eat Seafood?</Label>
              <Select value={form.eatSeafood} onValueChange={v => set("eatSeafood", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
              </Select>
            </div>
            {form.eatSeafood === "No" && (
              <div><Label>Seafood Dislikes</Label><Input value={form.seafoodDislikes} onChange={e => set("seafoodDislikes", e.target.value)} /></div>
            )}
            <div>
              <Label>Food Restrictions/Allergies?</Label>
              <Select value={form.foodRestrictions} onValueChange={v => set("foodRestrictions", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
              </Select>
            </div>
            {form.foodRestrictions === "Yes" && (
              <div><Label>Restriction Details</Label><Textarea value={form.foodRestrictionsDetails} onChange={e => set("foodRestrictionsDetails", e.target.value)} rows={2} /></div>
            )}
            <div>
              <Label>Sweet or Savoury?</Label>
              <Select value={form.sweetOrSavoury} onValueChange={v => set("sweetOrSavoury", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sweet">Sweet</SelectItem>
                  <SelectItem value="Savoury">Savoury</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Disliked Foods</Label><Textarea value={form.dislikedFoods} onChange={e => set("dislikedFoods", e.target.value)} rows={2} /></div>
            <div><Label>Favorite Foods & Drinks</Label><Textarea value={form.favoriteFoodsDrinks} onChange={e => set("favoriteFoodsDrinks", e.target.value)} rows={2} /></div>
            <div><Label>Food Cravings</Label><Textarea value={form.foodCravings} onChange={e => set("foodCravings", e.target.value)} rows={2} /></div>

            <SectionHeader title="Section E: Fitness History" />
            <div><Label>When Were You in the Best Shape?</Label><Textarea value={form.bestShapeWhen} onChange={e => set("bestShapeWhen", e.target.value)} rows={2} /></div>
            <div>
              <Label>Consistently Exercising Past 3 Months?</Label>
              <Select value={form.consistentExercise3Months} onValueChange={v => set("consistentExercise3Months", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>What Stopped Your Workouts?</Label><Textarea value={form.whatStoppedWorkouts} onChange={e => set("whatStoppedWorkouts", e.target.value)} rows={2} /></div>
            <div><Label>Fitness Level Rating (1-10)</Label><Input value={form.fitnessLevelRating} onChange={e => set("fitnessLevelRating", e.target.value)} placeholder="1-10" /></div>
            <div>
              <Label>Motivated to Exercise?</Label>
              <Select value={form.motivatedToExercise} onValueChange={v => set("motivatedToExercise", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {["Yes", "A little", "No"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <SectionHeader title="Section F: Exercise" />
            <div>
              <Label>Physical Activity Frequency</Label>
              <Select value={form.physicalActivityFrequency} onValueChange={v => set("physicalActivityFrequency", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {["5-7x/week", "3-4x/week", "1-2x/week"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <MultiCheckboxField label="Low Participation Reasons" options={LOW_PARTICIPATION_OPTIONS} value={form.lowParticipationReasons || []} onChange={v => set("lowParticipationReasons", v)} />
            {(form.lowParticipationReasons || []).includes("Other") && (
              <div><Label>Other Reason</Label><Input value={form.lowParticipationOther} onChange={e => set("lowParticipationOther", e.target.value)} /></div>
            )}
            <div>
              <Label>Specific Injury?</Label>
              <Select value={form.specificInjury} onValueChange={v => set("specificInjury", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
              </Select>
            </div>
            {form.specificInjury === "Yes" && (
              <div><Label>Injury Details</Label><Textarea value={form.injuryDetails} onChange={e => set("injuryDetails", e.target.value)} rows={2} /></div>
            )}
            <div><Label>Ideal Training Week</Label><Textarea value={form.idealTrainingWeek} onChange={e => set("idealTrainingWeek", e.target.value)} rows={2} /></div>
            <div>
              <Label>Exercise Location</Label>
              <Select value={form.exerciseLocation} onValueChange={v => set("exerciseLocation", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {["Gym", "Home", "Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {form.exerciseLocation === "Other" && (
              <div><Label>Exercise Location (Other)</Label><Input value={form.exerciseLocationOther} onChange={e => set("exerciseLocationOther", e.target.value)} /></div>
            )}
            <Label className="text-sm font-medium">Current Exercise Routine</Label>
            <div className="space-y-3">
              {(form.currentExerciseRoutine || []).map((r: any, i: number) => (
                <div key={i} className="p-3 border rounded-lg space-y-2">
                  <p className="text-sm font-medium text-gray-700">{r.activity}</p>
                  <div className="grid grid-cols-4 gap-2">
                    <div><Label className="text-xs">Days/Week</Label><Input value={r.daysPerWeek} onChange={e => updateRoutine(i, "daysPerWeek", e.target.value)} placeholder="e.g. 3" /></div>
                    <div><Label className="text-xs">Duration</Label><Input value={r.duration} onChange={e => updateRoutine(i, "duration", e.target.value)} placeholder="e.g. 30 min" /></div>
                    <div><Label className="text-xs">Intensity</Label><Input value={r.intensity} onChange={e => updateRoutine(i, "intensity", e.target.value)} placeholder="Low/Med/High" /></div>
                    <div><Label className="text-xs">Types</Label><Input value={r.types} onChange={e => updateRoutine(i, "types", e.target.value)} placeholder="e.g. Running" /></div>
                  </div>
                </div>
              ))}
            </div>

            <SectionHeader title="Section G: Goal Setting" />
            <MultiCheckboxField label="What Would You Like Help With?" options={HELP_GOALS_OPTIONS} value={form.helpGoals || []} onChange={v => set("helpGoals", v)} />
            {(form.helpGoals || []).includes("Other") && (
              <div><Label>Other Goals</Label><Input value={form.helpGoalsOther} onChange={e => set("helpGoalsOther", e.target.value)} /></div>
            )}
            <Label className="text-sm font-medium">Top 3 Priority Goals</Label>
            {[0, 1, 2].map(i => (
              <div key={i}><Input placeholder={`Priority Goal ${i + 1}`} value={(form.priorityGoals || [])[i] || ""} onChange={e => updateArrayField("priorityGoals", i, e.target.value)} /></div>
            ))}
            <div><Label>How Will Achieving Goals Make You Feel?</Label><Textarea value={form.goalAchievementFeeling} onChange={e => set("goalAchievementFeeling", e.target.value)} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Health Priority</Label>
                <Select value={form.healthPriority} onValueChange={v => set("healthPriority", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {["Low", "Medium", "High"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Commitment Level</Label>
                <Select value={form.commitmentLevel} onValueChange={v => set("commitmentLevel", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {["Very", "Semi", "Not very"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Obstacles Details</Label><Textarea value={form.obstaclesDetails} onChange={e => set("obstaclesDetails", e.target.value)} rows={2} /></div>
            <Label className="text-sm font-medium">3 Ways to Overcome Obstacles</Label>
            {[0, 1, 2].map(i => (
              <div key={i}><Input placeholder={`Method ${i + 1}`} value={(form.overcomeMethods || [])[i] || ""} onChange={e => updateArrayField("overcomeMethods", i, e.target.value)} /></div>
            ))}

            <SectionHeader title="Section H: Miscellaneous" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>How Did You Hear About Us?</Label>
                <Select value={form.howHeardAbout} onValueChange={v => set("howHeardAbout", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {["Word of Mouth", "Online", "Website", "Instagram", "Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Referred By</Label><Input value={form.referredBy} onChange={e => set("referredBy", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Using Online Programs?</Label>
                <Select value={form.usingOnlinePrograms} onValueChange={v => set("usingOnlinePrograms", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                </Select>
              </div>
              {form.usingOnlinePrograms === "Yes" && (
                <div><Label>Which Program?</Label><Input value={form.whichProgram} onChange={e => set("whichProgram", e.target.value)} /></div>
              )}
            </div>

            <SectionHeader title="Section I: Participant Release" />
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={form.consentTerms} onCheckedChange={v => set("consentTerms", !!v)} />
              <span>I have read and understand the terms</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={form.consentBodyImages} onCheckedChange={v => set("consentBodyImages", !!v)} />
              <span>I consent to body images being taken for progress tracking</span>
            </label>
            <div><Label>Signature Date</Label><Input type="date" value={form.signatureDate} onChange={e => set("signatureDate", e.target.value)} /></div>
          </div>
        </div>
        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
            <Save className="w-4 h-4 mr-2" />
            {mutation.isPending ? "Saving..." : "Save Questionnaire"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PrivateCoachingReadOnly({ data }: { data: Record<string, any> }) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Your Basics</h4>
      <div className="grid grid-cols-2 gap-2">
        <ReadOnlyField label="Diet Type" value={data.dietType} />
        <ReadOnlyField label="Given Birth Within Year" value={data.givenBirthWithinYear} />
        <ReadOnlyField label="Has Injury" value={data.hasInjury} />
      </div>
      <Separator />
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Goal-Based Plan</h4>
      <ReadOnlyField label="Selected Goals" value={data.selectedGoals} />
      <Separator />
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Section A: Medical Details</h4>
      {(data.healthConcerns || []).filter((c: any) => c.problem).map((c: any, i: number) => (
        <ReadOnlyField key={i} label={`Health Concern ${i + 1}`} value={`${c.problem} (${c.severity})`} />
      ))}
      <div className="grid grid-cols-2 gap-2">
        <ReadOnlyField label="Conditions Affect Exercise" value={data.healthConditionsAffectExercise} />
        <ReadOnlyField label="Recent Surgery" value={data.recentSurgery} />
        <ReadOnlyField label="Take Medications" value={data.takeMedications} />
        <ReadOnlyField label="Medication Details" value={data.medicationDetails} />
        <ReadOnlyField label="Heart Condition" value={data.heartCondition} />
        <ReadOnlyField label="Chest Pain During Activity" value={data.chestPainDuringActivity} />
        <ReadOnlyField label="Chest Pain Without Activity" value={data.chestPainWithoutActivity} />
        <ReadOnlyField label="Lose Balance/Dizziness" value={data.loseBalanceDizziness} />
        <ReadOnlyField label="Lose Consciousness" value={data.loseConsciousness} />
        <ReadOnlyField label="Pregnant/Recent Birth" value={data.pregnantOrRecentBirth} />
      </div>
      {data.pregnantOrRecentBirth === "Yes" && (
        <div className="grid grid-cols-2 gap-2">
          <ReadOnlyField label="Delivery Timeframe" value={data.deliveryTimeframe} />
          <ReadOnlyField label="Date of Delivery" value={data.dateOfDelivery} />
          <ReadOnlyField label="Birth Type" value={data.birthType} />
          <ReadOnlyField label="Delivery Complications" value={data.deliveryComplications} />
          <ReadOnlyField label="Complication Details" value={data.deliveryComplicationsDetails} />
          <ReadOnlyField label="Medically Cleared" value={data.medicallyCleared} />
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <ReadOnlyField label="Currently Breastfeeding" value={data.currentlyBreastfeeding} />
        <ReadOnlyField label="Periods Regular" value={data.periodsRegular} />
      </div>
      <ReadOnlyField label="Period Issues" value={data.periodIssues} />
      <Separator />
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Section B: Lifestyle</h4>
      <div className="grid grid-cols-2 gap-2">
        <ReadOnlyField label="Smoke" value={data.smoke} />
        <ReadOnlyField label="Cigarettes/Day" value={data.cigarettesPerDay} />
        <ReadOnlyField label="Smoking Years" value={data.smokingYears} />
        <ReadOnlyField label="Drink Alcohol" value={data.drinkAlcohol} />
        <ReadOnlyField label="Alcohol Frequency" value={data.alcoholFrequency} />
        <ReadOnlyField label="Sleep Hours" value={data.sleepHours} />
        <ReadOnlyField label="Job Type" value={data.jobType} />
        <ReadOnlyField label="Job Type Other" value={data.jobTypeOther} />
        <ReadOnlyField label="Job Requires Travel" value={data.jobRequiresTravel} />
        <ReadOnlyField label="Travel Frequency" value={data.travelFrequency} />
        <ReadOnlyField label="Stress Level" value={data.stressLevel} />
      </div>
      <ReadOnlyField label="Stress Sources" value={data.stressSources} />
      <ReadOnlyField label="Other Stress Source" value={data.stressSourceOther} />
      <ReadOnlyField label="Family Overweight" value={data.familyOverweight} />
      <ReadOnlyField label="Overweight as Child" value={data.overweightAsChild} />
      <Separator />
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Section C: Nutrition</h4>
      <div className="grid grid-cols-2 gap-2">
        <ReadOnlyField label="Nutrition Rating" value={data.nutritionRating} />
        <ReadOnlyField label="Meals Per Day" value={data.mealsPerDay} />
        <ReadOnlyField label="Skip Meals" value={data.skipMeals} />
        <ReadOnlyField label="Meals Out/Week" value={data.mealsOutPerWeek} />
        <ReadOnlyField label="Eat Breakfast" value={data.eatBreakfast} />
      </div>
      <ReadOnlyField label="Eating Habits" value={data.eatingHabits} />
      <div className="grid grid-cols-2 gap-2">
        <ReadOnlyField label="Water Intake" value={data.waterIntake} />
        <ReadOnlyField label="Know Calorie Intake" value={data.knowCalorieIntake} />
        <ReadOnlyField label="Daily Calories" value={data.dailyCalories} />
        <ReadOnlyField label="Do Own Cooking" value={data.doOwnCooking} />
      </div>
      <ReadOnlyField label="Reasons to Eat" value={data.reasonsToEat} />
      <div className="grid grid-cols-2 gap-2">
        <ReadOnlyField label="Eat Past Fullness" value={data.eatPastFullness} />
        <ReadOnlyField label="Eat High Fat/Sugar" value={data.eatHighFatSugar} />
      </div>
      <ReadOnlyField label="Nutrition Improvements" value={(data.nutritionImprovements || []).filter((s: string) => s)} />
      <Separator />
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Section D: Diet Details</h4>
      <div className="grid grid-cols-2 gap-2">
        <ReadOnlyField label="Diet Type" value={data.dietTypeDetail} />
        <ReadOnlyField label="Eat Eggs" value={data.eatEggs} />
        <ReadOnlyField label="Eat Seafood" value={data.eatSeafood} />
        <ReadOnlyField label="Seafood Dislikes" value={data.seafoodDislikes} />
        <ReadOnlyField label="Food Restrictions" value={data.foodRestrictions} />
        <ReadOnlyField label="Restriction Details" value={data.foodRestrictionsDetails} />
        <ReadOnlyField label="Sweet or Savoury" value={data.sweetOrSavoury} />
      </div>
      <ReadOnlyField label="Disliked Foods" value={data.dislikedFoods} />
      <ReadOnlyField label="Favorite Foods & Drinks" value={data.favoriteFoodsDrinks} />
      <ReadOnlyField label="Food Cravings" value={data.foodCravings} />
      <Separator />
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Section E: Fitness History</h4>
      <ReadOnlyField label="Best Shape When" value={data.bestShapeWhen} />
      <div className="grid grid-cols-2 gap-2">
        <ReadOnlyField label="Consistent Exercise (3 Months)" value={data.consistentExercise3Months} />
        <ReadOnlyField label="Fitness Level Rating" value={data.fitnessLevelRating} />
        <ReadOnlyField label="Motivated to Exercise" value={data.motivatedToExercise} />
      </div>
      <ReadOnlyField label="What Stopped Workouts" value={data.whatStoppedWorkouts} />
      <Separator />
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Section F: Exercise</h4>
      <ReadOnlyField label="Physical Activity Frequency" value={data.physicalActivityFrequency} />
      <ReadOnlyField label="Low Participation Reasons" value={data.lowParticipationReasons} />
      <ReadOnlyField label="Other Reason" value={data.lowParticipationOther} />
      <div className="grid grid-cols-2 gap-2">
        <ReadOnlyField label="Specific Injury" value={data.specificInjury} />
        <ReadOnlyField label="Injury Details" value={data.injuryDetails} />
        <ReadOnlyField label="Exercise Location" value={data.exerciseLocation} />
        <ReadOnlyField label="Exercise Location Other" value={data.exerciseLocationOther} />
      </div>
      <ReadOnlyField label="Ideal Training Week" value={data.idealTrainingWeek} />
      {(data.currentExerciseRoutine || []).filter((r: any) => r.daysPerWeek || r.duration || r.intensity || r.types).length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500">Current Exercise Routine</p>
          {(data.currentExerciseRoutine || []).filter((r: any) => r.daysPerWeek || r.duration || r.intensity || r.types).map((r: any, i: number) => (
            <div key={i} className="text-sm text-gray-900">
              <span className="font-medium">{r.activity}:</span> {r.daysPerWeek} days/wk, {r.duration}, {r.intensity} intensity{r.types ? `, ${r.types}` : ""}
            </div>
          ))}
        </div>
      )}
      <Separator />
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Section G: Goal Setting</h4>
      <ReadOnlyField label="Help Goals" value={data.helpGoals} />
      <ReadOnlyField label="Other Goals" value={data.helpGoalsOther} />
      <ReadOnlyField label="Priority Goals" value={(data.priorityGoals || []).filter((s: string) => s)} />
      <ReadOnlyField label="Goal Achievement Feeling" value={data.goalAchievementFeeling} />
      <div className="grid grid-cols-2 gap-2">
        <ReadOnlyField label="Health Priority" value={data.healthPriority} />
        <ReadOnlyField label="Commitment Level" value={data.commitmentLevel} />
      </div>
      <ReadOnlyField label="Obstacles" value={data.obstaclesDetails} />
      <ReadOnlyField label="Overcome Methods" value={(data.overcomeMethods || []).filter((s: string) => s)} />
      <Separator />
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Section H: Miscellaneous</h4>
      <div className="grid grid-cols-2 gap-2">
        <ReadOnlyField label="How Heard About" value={data.howHeardAbout} />
        <ReadOnlyField label="Referred By" value={data.referredBy} />
        <ReadOnlyField label="Using Online Programs" value={data.usingOnlinePrograms} />
        <ReadOnlyField label="Which Program" value={data.whichProgram} />
      </div>
      <Separator />
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Section I: Participant Release</h4>
      <div className="grid grid-cols-2 gap-2">
        <ReadOnlyField label="Consent to Terms" value={data.consentTerms ? "Yes" : "No"} />
        <ReadOnlyField label="Consent to Body Images" value={data.consentBodyImages ? "Yes" : "No"} />
        <ReadOnlyField label="Signature Date" value={data.signatureDate} />
      </div>
    </div>
  );
}

export function CoachingFormResponsesSection({ clientId, coachingType = "pregnancy_coaching" }: { clientId: string; coachingType?: string }) {
  const [lifestyleDialogOpen, setLifestyleDialogOpen] = useState(false);
  const [healthDialogOpen, setHealthDialogOpen] = useState(false);
  const [privateCoachingDialogOpen, setPrivateCoachingDialogOpen] = useState(false);

  const { data: formResponses = [], isLoading } = useQuery<CoachingFormResponse[]>({
    queryKey: ['/api/admin/coaching/clients', clientId, 'form-responses'],
  });

  const lifestyleResponse = formResponses.find(r => r.formType === "lifestyle_questionnaire");
  const healthResponse = formResponses.find(r => r.formType === "health_evaluation");
  const privateCoachingResponse = formResponses.find(r => r.formType === "private_coaching_questionnaire");

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="py-8 text-center text-gray-400">Loading form responses...</CardContent>
      </Card>
    );
  }

  if (coachingType === "private_coaching") {
    return (
      <>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-pink-500" />
                Private Coaching Questionnaire
              </CardTitle>
              <div className="flex items-center gap-2">
                {privateCoachingResponse ? (
                  <Badge className="bg-green-100 text-green-700 border-0">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-100 text-yellow-700 border-0">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending
                  </Badge>
                )}
              </div>
            </div>
            {privateCoachingResponse?.submittedAt && (
              <p className="text-xs text-gray-400 mt-1">Submitted {new Date(privateCoachingResponse.submittedAt).toLocaleDateString()}</p>
            )}
          </CardHeader>
          <CardContent>
            {privateCoachingResponse ? (
              <>
                <PrivateCoachingReadOnly data={privateCoachingResponse.responses as Record<string, any>} />
                <div className="mt-4">
                  <Button variant="outline" size="sm" onClick={() => setPrivateCoachingDialogOpen(true)}>
                    <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400 mb-3">No data entered yet</p>
                <Button size="sm" onClick={() => setPrivateCoachingDialogOpen(true)} className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                  <Dumbbell className="w-3.5 h-3.5 mr-1.5" /> Enter Data
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <PrivateCoachingQuestionnaireDialog
          open={privateCoachingDialogOpen}
          onOpenChange={setPrivateCoachingDialogOpen}
          existingData={privateCoachingResponse?.responses as Record<string, any> | undefined}
          clientId={clientId}
        />
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-pink-500" />
                Lifestyle Questionnaire
              </CardTitle>
              <div className="flex items-center gap-2">
                {lifestyleResponse ? (
                  <Badge className="bg-green-100 text-green-700 border-0">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-100 text-yellow-700 border-0">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending
                  </Badge>
                )}
              </div>
            </div>
            {lifestyleResponse?.submittedAt && (
              <p className="text-xs text-gray-400 mt-1">Submitted {new Date(lifestyleResponse.submittedAt).toLocaleDateString()}</p>
            )}
          </CardHeader>
          <CardContent>
            {lifestyleResponse ? (
              <>
                <LifestyleReadOnly data={lifestyleResponse.responses as Record<string, any>} />
                <div className="mt-4">
                  <Button variant="outline" size="sm" onClick={() => setLifestyleDialogOpen(true)}>
                    <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400 mb-3">No data entered yet</p>
                <Button size="sm" onClick={() => setLifestyleDialogOpen(true)} className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                  <ClipboardList className="w-3.5 h-3.5 mr-1.5" /> Enter Data
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-pink-500" />
                Health Evaluation
              </CardTitle>
              <div className="flex items-center gap-2">
                {healthResponse ? (
                  <Badge className="bg-green-100 text-green-700 border-0">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-100 text-yellow-700 border-0">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending
                  </Badge>
                )}
              </div>
            </div>
            {healthResponse?.submittedAt && (
              <p className="text-xs text-gray-400 mt-1">Submitted {new Date(healthResponse.submittedAt).toLocaleDateString()}</p>
            )}
          </CardHeader>
          <CardContent>
            {healthResponse ? (
              <>
                <HealthEvaluationReadOnly data={healthResponse.responses as Record<string, any>} />
                <div className="mt-4">
                  <Button variant="outline" size="sm" onClick={() => setHealthDialogOpen(true)}>
                    <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400 mb-3">No data entered yet</p>
                <Button size="sm" onClick={() => setHealthDialogOpen(true)} className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                  <Stethoscope className="w-3.5 h-3.5 mr-1.5" /> Enter Data
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <LifestyleQuestionnaireDialog
        open={lifestyleDialogOpen}
        onOpenChange={setLifestyleDialogOpen}
        existingData={lifestyleResponse?.responses as Record<string, any> | undefined}
        clientId={clientId}
      />
      <HealthEvaluationDialog
        open={healthDialogOpen}
        onOpenChange={setHealthDialogOpen}
        existingData={healthResponse?.responses as Record<string, any> | undefined}
        clientId={clientId}
      />
    </>
  );
}
