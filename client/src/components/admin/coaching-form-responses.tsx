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
import { ClipboardList, Stethoscope, CheckCircle2, Clock, Edit3, Save, FileText } from "lucide-react";
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

export function CoachingFormResponsesSection({ clientId }: { clientId: string }) {
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
