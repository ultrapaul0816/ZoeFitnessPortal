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
import { ClipboardList, Stethoscope, CheckCircle2, Clock, Edit3, Save, FileText, Dumbbell, Heart, Shield, Calendar, Activity, Target } from "lucide-react";
import type { CoachingFormResponse } from "@shared/schema";

// ── Constants matching what the client wizard submits ──

const MEDICAL_CONDITIONS = [
  "Shortness of breath", "Chest pain", "Vaginal bleeding", "Dizziness or faintness",
  "Headaches", "Muscle weakness", "Calf pain or swelling", "Preterm labor signs",
  "Decreased fetal movement", "Leaking amniotic fluid", "Heart palpitations",
  "Severe nausea/vomiting", "Abdominal pain", "Blurred vision", "Swelling (face/hands)",
  "High blood pressure", "Gestational diabetes", "Placenta previa", "Pre-eclampsia",
  "Cervical insufficiency", "Multiple pregnancy (twins+)", "Epilepsy", "Anemia",
  "Thyroid condition", "SPD (Symphysis Pubis Dysfunction)", "Back injury (current or past)",
  "None of the above",
];

const MEDICAL_FLAGS = [
  "Pelvic girdle pain", "Sciatica", "High blood pressure", "Gestational diabetes",
  "Cervical concerns", "Low-lying placenta", "Restricted activity / bed rest advised",
  "Iron deficiency", "None",
];

const DISCOMFORT_AREAS = [
  "Lower back", "Upper back", "Hips", "Neck/shoulders", "Knees", "Feet/ankles",
  "Wrists/hands", "Ribs", "Round ligament", "Tailbone/coccyx", "General fatigue",
  "Pelvic pain", "No discomfort",
];

const DISCOMFORT_TIMING = [
  "In the morning", "After sitting for long", "After standing for long",
  "During sleep", "At end of day", "During workouts", "Random/unpredictable",
  "It varies day to day",
];

const EXERCISE_HISTORY = [
  "Sedentary (little or no exercise)", "Light (walking, yoga, 1-2x/week)",
  "Moderate (regular exercise 3-4x/week)", "Active (daily exercise, varied)",
  "Athletic (competitive/high intensity)",
];

const CORE_SYMPTOMS = [
  "Heaviness or pressure in pelvic area", "Leaking when coughing, sneezing, or laughing",
  "Difficulty holding in urine", "Doming or coning of the belly during movement",
  "Lower belly feels unsupported", "Pain or discomfort during core movements",
  "None of the above",
];

const HELP_AREAS = [
  "Pain relief & comfort", "Strength & muscle tone", "Posture improvement",
  "Birth preparation", "Staying active safely", "Energy & stamina",
  "Pelvic floor support", "Stress & anxiety relief", "Sleep quality",
  "General comfort & wellbeing",
];

// ── Helpers ──

function SectionHeader({ title, icon: Icon }: { title: string; icon?: any }) {
  return (
    <div className="pt-4 pb-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-pink-400" />}
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</h4>
      </div>
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

function TagList({ items, color = "pink" }: { items: string[]; color?: string }) {
  if (!items || items.length === 0) return null;
  const colors: Record<string, string> = {
    pink: "bg-pink-100 text-pink-700 border-pink-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    amber: "bg-amber-100 text-amber-700 border-amber-200",
    green: "bg-green-100 text-green-700 border-green-200",
    purple: "bg-purple-100 text-purple-700 border-purple-200",
    red: "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map(item => (
        <span key={item} className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${colors[color] || colors.pink}`}>
          {item}
        </span>
      ))}
    </div>
  );
}

function HighlightedValue({ value, options }: { value: string; options?: string[] }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-pink-50 border border-pink-200 text-sm font-medium text-pink-700">
      {value}
    </span>
  );
}

function TextBlock({ value }: { value: string }) {
  if (!value) return null;
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-800 whitespace-pre-wrap border border-gray-100">
      {value}
    </div>
  );
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

// ── Read-Only Views matching client-submitted fields ──

function LifestyleReadOnly({ data }: { data: Record<string, any> }) {
  return (
    <div className="space-y-4">
      {/* Personal Info */}
      <SectionHeader title="Personal Information" icon={Heart} />
      <div className="grid grid-cols-2 gap-3">
        <ReadOnlyField label="Full Name" value={data.fullName} />
        <ReadOnlyField label="Age" value={data.age} />
        <ReadOnlyField label="WhatsApp Number" value={data.whatsappNumber} />
        <ReadOnlyField label="Email" value={data.email} />
      </div>

      {/* Emergency Contact */}
      <SectionHeader title="Emergency Contact" icon={Shield} />
      <div className="grid grid-cols-2 gap-3">
        <ReadOnlyField label="Contact Name" value={data.emergencyContactName} />
        <ReadOnlyField label="Relationship" value={data.emergencyRelationship} />
        <ReadOnlyField label="Contact Number" value={data.emergencyContactNumber} />
      </div>

      {/* Pregnancy Info */}
      <SectionHeader title="Pregnancy Info" icon={Calendar} />
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-xs font-medium text-gray-500">Pregnancy Number</p>
          {data.pregnancyNumber && <HighlightedValue value={data.pregnancyNumber} />}
        </div>
        <ReadOnlyField label="Due Date" value={data.dueDate} />
        <div>
          <p className="text-xs font-medium text-gray-500">Trimester</p>
          {data.trimester && <HighlightedValue value={data.trimester} />}
        </div>
      </div>

      {/* Medical Conditions */}
      <SectionHeader title="Medical Conditions" icon={Activity} />
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-500">Conditions</p>
        <TagList items={data.medicalConditions || []} color="red" />
        <ReadOnlyField label="Other Conditions" value={data.medicalConditionsOther} />
      </div>

      {/* Medical Flags */}
      <div className="space-y-2 pt-2">
        <p className="text-xs font-medium text-gray-500">Medical Flags</p>
        <TagList items={data.medicalFlags || []} color="amber" />
        <ReadOnlyField label="Other Flags" value={data.medicalFlagsOther} />
      </div>

      {/* Discomfort & Movement */}
      <SectionHeader title="Discomfort & Movement" />
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-500">Discomfort Areas</p>
        <TagList items={data.discomfortAreas || []} color="purple" />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500">When is discomfort worse?</p>
        {data.discomfortTiming && <HighlightedValue value={data.discomfortTiming} />}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-medium text-gray-500">Exercise History</p>
          {data.exerciseHistory && <HighlightedValue value={data.exerciseHistory} />}
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">Movement Feels</p>
          {data.movementFeels && <HighlightedValue value={data.movementFeels} />}
        </div>
      </div>

      {/* Core & Goals */}
      <SectionHeader title="Core Health & Goals" icon={Target} />
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-500">Core Symptoms</p>
        <TagList items={data.coreSymptoms || []} color="blue" />
      </div>
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-500">Help Areas</p>
        <TagList items={data.helpAreas || []} color="green" />
      </div>

      {/* Medications & History */}
      <SectionHeader title="Medications & History" />
      <div>
        <p className="text-xs font-medium text-gray-500">Taking Medications?</p>
        {data.takingMedications && <HighlightedValue value={data.takingMedications} />}
      </div>
      {data.takingMedications === "Yes" && data.medicationDetails && (
        <div>
          <p className="text-xs font-medium text-gray-500">Medication Details</p>
          <TextBlock value={data.medicationDetails} />
        </div>
      )}
      {data.previousPregnancies && (
        <div>
          <p className="text-xs font-medium text-gray-500">Previous Pregnancies</p>
          <TextBlock value={data.previousPregnancies} />
        </div>
      )}

      {/* Goals & Lifestyle */}
      <SectionHeader title="Goals & Lifestyle" />
      {data.mainConcerns && (
        <div>
          <p className="text-xs font-medium text-gray-500">Main Concerns</p>
          <TextBlock value={data.mainConcerns} />
        </div>
      )}
      {data.mainGoals && (
        <div>
          <p className="text-xs font-medium text-gray-500">Main Goals</p>
          <TextBlock value={data.mainGoals} />
        </div>
      )}
      {data.currentLifestyle && (
        <div>
          <p className="text-xs font-medium text-gray-500">Current Lifestyle</p>
          <TextBlock value={data.currentLifestyle} />
        </div>
      )}

      {/* Final Details */}
      <SectionHeader title="Referral & Consent" />
      <div className="grid grid-cols-2 gap-3">
        <ReadOnlyField label="How did you hear?" value={data.hearAbout} />
        <ReadOnlyField label="Referred By" value={data.referredBy} />
        <ReadOnlyField label="Using Zoe's Programs?" value={data.usingPrograms} />
        <ReadOnlyField label="Which Program" value={data.programDetails} />
        <ReadOnlyField label="Consent" value={data.consent ? "Yes ✓" : "No"} />
      </div>
    </div>
  );
}

function HealthEvaluationReadOnly({ data }: { data: Record<string, any> }) {
  return (
    <div className="space-y-4">
      <SectionHeader title="Personal Details" icon={Heart} />
      <div className="grid grid-cols-2 gap-3">
        <ReadOnlyField label="Full Name" value={data.fullName} />
        <ReadOnlyField label="Age" value={data.age} />
        <ReadOnlyField label="Phone" value={data.phone} />
        <ReadOnlyField label="Email" value={data.email} />
        <ReadOnlyField label="Due Date" value={data.dueDate} />
        <div>
          <p className="text-xs font-medium text-gray-500">Trimester</p>
          {data.trimester && <HighlightedValue value={data.trimester} />}
        </div>
      </div>

      <SectionHeader title="Participant Declaration" icon={Shield} />
      <div>
        <p className="text-xs font-medium text-gray-500">Declaration</p>
        {data.participantDeclaration && (
          <HighlightedValue value={data.participantDeclaration} />
        )}
      </div>

      <SectionHeader title="Medical Clearance" />
      <div className="grid grid-cols-2 gap-3">
        <ReadOnlyField label="Doctor's Name" value={data.doctorName} />
        <ReadOnlyField label="Qualification" value={data.doctorQualification} />
        <ReadOnlyField label="Clinic / Hospital" value={data.clinicName} />
        <ReadOnlyField label="Doctor's Contact" value={data.doctorContact} />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500">Clearance Decision</p>
        {data.clearanceDecision && <HighlightedValue value={data.clearanceDecision} />}
      </div>
      {data.restrictionDetails && (
        <div>
          <p className="text-xs font-medium text-gray-500">Restrictions</p>
          <TextBlock value={data.restrictionDetails} />
        </div>
      )}
    </div>
  );
}

// ── Edit Dialogs matching client-submitted fields ──

function LifestyleQuestionnaireDialog({ open, onOpenChange, existingData, clientId }: {
  open: boolean; onOpenChange: (v: boolean) => void; existingData?: Record<string, any>; clientId: string;
}) {
  const defaults: Record<string, any> = {
    fullName: "", age: "", whatsappNumber: "", email: "",
    emergencyContactName: "", emergencyRelationship: "", emergencyContactNumber: "",
    pregnancyNumber: "", dueDate: "", trimester: "",
    medicalConditions: [], medicalConditionsOther: "",
    medicalFlags: [], medicalFlagsOther: "",
    discomfortAreas: [], discomfortTiming: "",
    exerciseHistory: "", movementFeels: "",
    coreSymptoms: [], helpAreas: [],
    takingMedications: "", medicationDetails: "",
    previousPregnancies: "",
    mainConcerns: "", mainGoals: "", currentLifestyle: "",
    hearAbout: "", referredBy: "", usingPrograms: "", programDetails: "",
    consent: false,
  };

  const [form, setForm] = useState<Record<string, any>>(defaults);
  const { toast } = useToast();

  useEffect(() => {
    if (open) setForm(existingData ? { ...defaults, ...existingData } : defaults);
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
            Edit Lifestyle Questionnaire
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-4" style={{ maxHeight: "calc(90vh - 140px)" }}>
          <div className="space-y-4 py-2">
            <SectionHeader title="Personal Information" />
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Full Name</Label><Input value={form.fullName} onChange={e => set("fullName", e.target.value)} /></div>
              <div><Label>Age</Label><Input value={form.age} onChange={e => set("age", e.target.value)} /></div>
              <div><Label>WhatsApp Number</Label><Input value={form.whatsappNumber} onChange={e => set("whatsappNumber", e.target.value)} /></div>
              <div><Label>Email</Label><Input value={form.email} onChange={e => set("email", e.target.value)} /></div>
            </div>

            <SectionHeader title="Emergency Contact" />
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Contact Name</Label><Input value={form.emergencyContactName} onChange={e => set("emergencyContactName", e.target.value)} /></div>
              <div><Label>Relationship</Label><Input value={form.emergencyRelationship} onChange={e => set("emergencyRelationship", e.target.value)} /></div>
              <div><Label>Contact Number</Label><Input value={form.emergencyContactNumber} onChange={e => set("emergencyContactNumber", e.target.value)} /></div>
            </div>

            <SectionHeader title="Pregnancy Info" />
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
              <div><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={e => set("dueDate", e.target.value)} /></div>
              <div>
                <Label>Trimester</Label>
                <Select value={form.trimester} onValueChange={v => set("trimester", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="First trimester (0–12 weeks)">First trimester</SelectItem>
                    <SelectItem value="Second trimester (13–26 weeks)">Second trimester</SelectItem>
                    <SelectItem value="Third trimester (27–40 weeks)">Third trimester</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <SectionHeader title="Medical Conditions" />
            <MultiCheckboxField label="Medical Conditions" options={MEDICAL_CONDITIONS} value={form.medicalConditions || []} onChange={v => set("medicalConditions", v)} />
            <div><Label>Other</Label><Input value={form.medicalConditionsOther} onChange={e => set("medicalConditionsOther", e.target.value)} placeholder="Other conditions..." /></div>

            <SectionHeader title="Medical Flags" />
            <MultiCheckboxField label="Medical Flags" options={MEDICAL_FLAGS} value={form.medicalFlags || []} onChange={v => set("medicalFlags", v)} />
            <div><Label>Other</Label><Input value={form.medicalFlagsOther} onChange={e => set("medicalFlagsOther", e.target.value)} placeholder="Other flags..." /></div>

            <SectionHeader title="Discomfort & Movement" />
            <MultiCheckboxField label="Discomfort Areas" options={DISCOMFORT_AREAS} value={form.discomfortAreas || []} onChange={v => set("discomfortAreas", v)} />
            <div>
              <Label>When is discomfort worse?</Label>
              <Select value={form.discomfortTiming} onValueChange={v => set("discomfortTiming", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {DISCOMFORT_TIMING.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Exercise History</Label>
                <Select value={form.exerciseHistory} onValueChange={v => set("exerciseHistory", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {EXERCISE_HISTORY.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Movement Feels</Label>
                <Select value={form.movementFeels} onValueChange={v => set("movementFeels", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {["Comforting", "Neutral", "Intimidating", "Pain-provoking"].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <SectionHeader title="Core Health & Goals" />
            <MultiCheckboxField label="Core Symptoms" options={CORE_SYMPTOMS} value={form.coreSymptoms || []} onChange={v => set("coreSymptoms", v)} />
            <MultiCheckboxField label="Help Areas" options={HELP_AREAS} value={form.helpAreas || []} onChange={v => set("helpAreas", v)} />

            <SectionHeader title="Medications & History" />
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

            <SectionHeader title="Goals & Lifestyle" />
            <div><Label>Main Concerns</Label><Textarea value={form.mainConcerns} onChange={e => set("mainConcerns", e.target.value)} rows={2} /></div>
            <div><Label>Main Goals</Label><Textarea value={form.mainGoals} onChange={e => set("mainGoals", e.target.value)} rows={2} /></div>
            <div><Label>Current Lifestyle</Label><Textarea value={form.currentLifestyle} onChange={e => set("currentLifestyle", e.target.value)} rows={2} /></div>

            <SectionHeader title="Referral & Consent" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>How did you hear about Zoe?</Label>
                <Select value={form.hearAbout} onValueChange={v => set("hearAbout", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {["Instagram", "YouTube", "Website", "Friend/word of mouth", "Google search", "Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Referred By</Label><Input value={form.referredBy} onChange={e => set("referredBy", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Using Zoe's Programs?</Label>
                <Select value={form.usingPrograms} onValueChange={v => set("usingPrograms", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.usingPrograms === "Yes" && (
                <div><Label>Which Program?</Label><Input value={form.programDetails} onChange={e => set("programDetails", e.target.value)} /></div>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={form.consent} onCheckedChange={v => set("consent", !!v)} />
              <span>Consent to being contacted</span>
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
  const defaults: Record<string, any> = {
    fullName: "", age: "", phone: "", email: "",
    dueDate: "", trimester: "",
    participantDeclaration: "",
    doctorName: "", doctorQualification: "", clinicName: "", doctorContact: "",
    clearanceDecision: "", restrictionDetails: "",
  };

  const [form, setForm] = useState<Record<string, any>>(defaults);
  const { toast } = useToast();

  useEffect(() => {
    if (open) setForm(existingData ? { ...defaults, ...existingData } : defaults);
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
            Edit Health Evaluation
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-4" style={{ maxHeight: "calc(90vh - 140px)" }}>
          <div className="space-y-4 py-2">
            <SectionHeader title="Personal Details" />
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Full Name</Label><Input value={form.fullName} onChange={e => set("fullName", e.target.value)} /></div>
              <div><Label>Age</Label><Input value={form.age} onChange={e => set("age", e.target.value)} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => set("phone", e.target.value)} /></div>
              <div><Label>Email</Label><Input value={form.email} onChange={e => set("email", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={e => set("dueDate", e.target.value)} /></div>
              <div>
                <Label>Trimester</Label>
                <Select value={form.trimester} onValueChange={v => set("trimester", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="First (0–12 weeks)">First</SelectItem>
                    <SelectItem value="Second (13–26 weeks)">Second</SelectItem>
                    <SelectItem value="Third (27–40 weeks)">Third</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <SectionHeader title="Participant Declaration" />
            <div>
              <Label>Declaration</Label>
              <Select value={form.participantDeclaration} onValueChange={v => set("participantDeclaration", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="I agree">I agree</SelectItem>
                  <SelectItem value="I do not agree">I do not agree</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <SectionHeader title="Medical Clearance" />
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Doctor's Name</Label><Input value={form.doctorName} onChange={e => set("doctorName", e.target.value)} /></div>
              <div><Label>Qualification</Label><Input value={form.doctorQualification} onChange={e => set("doctorQualification", e.target.value)} /></div>
              <div><Label>Clinic / Hospital</Label><Input value={form.clinicName} onChange={e => set("clinicName", e.target.value)} /></div>
              <div><Label>Doctor's Contact</Label><Input value={form.doctorContact} onChange={e => set("doctorContact", e.target.value)} /></div>
            </div>
            <div>
              <Label>Clearance Decision</Label>
              <Select value={form.clearanceDecision} onValueChange={v => set("clearanceDecision", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cleared with no restrictions">Cleared with no restrictions</SelectItem>
                  <SelectItem value="Cleared with restrictions/considerations">Cleared with restrictions</SelectItem>
                  <SelectItem value="Not cleared">Not cleared</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(form.clearanceDecision === "Cleared with restrictions/considerations" || form.clearanceDecision === "Cleared with restrictions") && (
              <div><Label>Restrictions</Label><Textarea value={form.restrictionDetails} onChange={e => set("restrictionDetails", e.target.value)} rows={3} /></div>
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

// ── Main Export ──

export function CoachingFormResponsesSection({ clientId, coachingType = "pregnancy_coaching" }: { clientId: string; coachingType?: string }) {
  const [lifestyleDialogOpen, setLifestyleDialogOpen] = useState(false);
  const [healthDialogOpen, setHealthDialogOpen] = useState(false);

  const { data: formResponses = [], isLoading } = useQuery<CoachingFormResponse[]>({
    queryKey: ['/api/admin/coaching/clients', clientId, 'form-responses'],
  });

  const lifestyleResponse = formResponses.find(r => r.formType === "lifestyle_questionnaire");
  const healthResponse = formResponses.find(r => r.formType === "health_evaluation");

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="py-8 text-center text-gray-400">Loading form responses...</CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Lifestyle Questionnaire Card */}
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
                <p className="text-sm text-gray-400 mb-3">Not submitted yet</p>
                <Button size="sm" onClick={() => setLifestyleDialogOpen(true)} className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                  <ClipboardList className="w-3.5 h-3.5 mr-1.5" /> Enter Data
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Health Evaluation Card */}
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
                <p className="text-sm text-gray-400 mb-3">Not submitted yet</p>
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
