# Intake Form UI Improvements — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the intake form wizard clearer, warmer, and more reliable by adding section context, validation, visual stepper, and reducing overwhelming steps.

**Architecture:** All changes are in `client/src/pages/my-coaching.tsx`, modifying the `IntakeFormWizard` component (lines 294–866). The form is a multi-step wizard with two sequential forms (lifestyle questionnaire + health evaluation). We restructure steps, add metadata/icons, improve the progress indicator, add field validation, and auto-fill the health form from lifestyle data.

**Tech Stack:** React, TypeScript, Tailwind CSS, shadcn/ui (Card, Button, Progress, Checkbox, Input, Textarea), lucide-react icons

---

### Task 1: Break Up Dense Steps

**Why:** Medical History has 22+ checkboxes crammed into one step. Additional Info has 5 textareas stacked together. Both are overwhelming.

**Files:**
- Modify: `client/src/pages/my-coaching.tsx:473-482` (lifestyleSteps array)
- Modify: `client/src/pages/my-coaching.tsx:494-708` (renderLifestyleStep switch/case)

**Step 1: Update the lifestyleSteps array**

Replace the current array at line 473 with:

```typescript
const lifestyleSteps = [
  { title: "Personal Info", fields: ["fullName", "age", "whatsappNumber", "email"] },
  { title: "Emergency Contact", fields: ["emergencyContactName", "emergencyRelationship", "emergencyContactNumber"] },
  { title: "Pregnancy Info", fields: ["pregnancyNumber", "dueDate", "trimester"] },
  { title: "Medical Conditions", fields: ["medicalConditions"] },
  { title: "Medical Flags", fields: ["medicalFlags"] },
  { title: "Discomfort & Movement", fields: ["discomfortAreas", "discomfortTiming", "exerciseHistory", "movementFeels"] },
  { title: "Core & Goals", fields: ["coreSymptoms", "helpAreas"] },
  { title: "Medications & History", fields: ["takingMedications", "previousPregnancies"] },
  { title: "Goals & Lifestyle", fields: ["mainConcerns", "mainGoals", "currentLifestyle"] },
  { title: "Final Details", fields: ["hearAbout", "usingPrograms", "consent"] },
];
```

**Step 2: Update the renderLifestyleStep switch/case**

Split old case 3 (Medical History) into two cases:
- New case 3: Medical Conditions only (the 22 MEDICAL_CONDITIONS checkboxes + "None of the above" + Other input)
- New case 4: Medical Flags only (the 5 MEDICAL_FLAGS checkboxes + "None" + Other input)

Then renumber everything after:
- Old case 4 (Discomfort & Movement) → new case 5
- Old case 5 (Core & Goals) → new case 6
- Old case 6 (Additional Info) → split into new case 7 (Medications & History) and new case 8 (Goals & Lifestyle)
- Old case 7 (Final Details) → new case 9

**New case 3 (Medical Conditions):**
```tsx
case 3: return (
  <div className="space-y-3">
    <label className="text-sm font-medium text-gray-700">Have you experienced any of the following? *</label>
    <p className="text-xs text-gray-500">Select all that apply</p>
    <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2">
      {MEDICAL_CONDITIONS.map(cond => (
        <label key={cond} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer text-sm transition-all ${lifestyle.medicalConditions.includes(cond) ? "border-pink-400 bg-pink-50" : "border-gray-200"}`}>
          <Checkbox checked={lifestyle.medicalConditions.includes(cond)} onCheckedChange={() => toggleArrayField(setLifestyle, "medicalConditions", cond)} />
          {cond}
        </label>
      ))}
      <label className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer text-sm ${lifestyle.medicalConditions.includes("None of the above") ? "border-pink-400 bg-pink-50" : "border-gray-200"}`}>
        <Checkbox checked={lifestyle.medicalConditions.includes("None of the above")} onCheckedChange={() => toggleArrayField(setLifestyle, "medicalConditions", "None of the above")} />
        None of the above
      </label>
    </div>
    <Input value={lifestyle.medicalConditionsOther} onChange={e => updateLifestyle("medicalConditionsOther", e.target.value)} placeholder="Other (please specify)" />
  </div>
);
```

**New case 4 (Medical Flags):**
```tsx
case 4: return (
  <div className="space-y-3">
    <label className="text-sm font-medium text-gray-700">Any medical flags your doctor has mentioned? *</label>
    <div className="grid grid-cols-1 gap-2 mt-2">
      {MEDICAL_FLAGS.map(flag => (
        <label key={flag} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer text-sm transition-all ${lifestyle.medicalFlags.includes(flag) ? "border-pink-400 bg-pink-50" : "border-gray-200"}`}>
          <Checkbox checked={lifestyle.medicalFlags.includes(flag)} onCheckedChange={() => toggleArrayField(setLifestyle, "medicalFlags", flag)} />
          {flag}
        </label>
      ))}
      <label className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer text-sm ${lifestyle.medicalFlags.includes("None") ? "border-pink-400 bg-pink-50" : "border-gray-200"}`}>
        <Checkbox checked={lifestyle.medicalFlags.includes("None")} onCheckedChange={() => toggleArrayField(setLifestyle, "medicalFlags", "None")} />
        None
      </label>
    </div>
    <Input className="mt-2" value={lifestyle.medicalFlagsOther} onChange={e => updateLifestyle("medicalFlagsOther", e.target.value)} placeholder="Other (please specify)" />
  </div>
);
```

**New case 7 (Medications & History):**
```tsx
case 7: return (
  <div className="space-y-4">
    <div>
      <label className="text-sm font-medium text-gray-700">Are you currently taking any medications or supplements? *</label>
      <div className="flex gap-3 mt-2">
        {["Yes", "No"].map(opt => (
          <label key={opt} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer text-sm transition-all ${lifestyle.takingMedications === opt ? "border-pink-400 bg-pink-50" : "border-gray-200"}`}>
            <input type="radio" name="medications" checked={lifestyle.takingMedications === opt} onChange={() => updateLifestyle("takingMedications", opt)} className="accent-pink-500" />
            {opt}
          </label>
        ))}
      </div>
      {lifestyle.takingMedications === "Yes" && (
        <Textarea className="mt-2" value={lifestyle.medicationDetails} onChange={e => updateLifestyle("medicationDetails", e.target.value)} placeholder="Please state the name and dosage" rows={3} />
      )}
    </div>
    <div><label className="text-sm font-medium text-gray-700">Previous pregnancies, births, or postnatal experiences? *</label><Textarea value={lifestyle.previousPregnancies} onChange={e => updateLifestyle("previousPregnancies", e.target.value)} placeholder="Share any relevant history..." rows={3} /></div>
  </div>
);
```

**New case 8 (Goals & Lifestyle):**
```tsx
case 8: return (
  <div className="space-y-4">
    <div><label className="text-sm font-medium text-gray-700">What concerns you most? *</label><Textarea value={lifestyle.mainConcerns} onChange={e => updateLifestyle("mainConcerns", e.target.value)} placeholder="About pregnancy, delivery, or postnatal phase..." rows={3} /></div>
    <div><label className="text-sm font-medium text-gray-700">Main goals with coaching? *</label><Textarea value={lifestyle.mainGoals} onChange={e => updateLifestyle("mainGoals", e.target.value)} placeholder="What do you want to achieve?" rows={3} /></div>
    <div><label className="text-sm font-medium text-gray-700">Describe your current lifestyle *</label><Textarea value={lifestyle.currentLifestyle} onChange={e => updateLifestyle("currentLifestyle", e.target.value)} placeholder="Daily routine, activity level, work..." rows={3} /></div>
  </div>
);
```

**New case 9 (Final Details):** Same content as old case 7 (unchanged).

**Step 3: Verify**

Run: `npm run dev` from the project root
Navigate to `/my-coaching`, log in as a test client, and confirm:
- The form now has 10 steps instead of 8
- Medical Conditions and Medical Flags appear on separate screens
- Medications/History and Goals/Lifestyle appear on separate screens
- All fields still function correctly

**Step 4: Commit**

```bash
git add client/src/pages/my-coaching.tsx
git commit -m "refactor: break up dense intake form steps into smaller screens"
```

---

### Task 2: Add Section Metadata — Icons + Descriptions

**Why:** Each step jumps straight to form fields with no context. Adding icons and short descriptions makes the purpose of each section clear and the experience warmer.

**Files:**
- Modify: `client/src/pages/my-coaching.tsx` — add STEP_META constant after HELP_AREAS, update render

**Step 1: Add STEP_META constant**

Add after the `HELP_AREAS` constant (after line 378):

```typescript
const LIFESTYLE_STEP_META = [
  { icon: "Heart", subtitle: "Let's start with the basics", desc: "We'll use this to personalise your experience." },
  { icon: "Shield", subtitle: "Just in case", desc: "Someone we can reach if needed during sessions." },
  { icon: "Calendar", subtitle: "Your pregnancy journey", desc: "This helps Zoe tailor everything to your stage." },
  { icon: "Activity", subtitle: "Your health background", desc: "Select anything you've experienced — no judgement, just safety." },
  { icon: "Activity", subtitle: "Doctor's notes", desc: "Anything your healthcare provider has flagged for us to know." },
  { icon: "Dumbbell", subtitle: "Body & movement", desc: "Understanding where you're at helps us meet you there." },
  { icon: "Target", subtitle: "Core health & goals", desc: "Let's understand what matters most to you right now." },
  { icon: "ClipboardCheck", subtitle: "Medications & history", desc: "This ensures your plan is safe and personalised." },
  { icon: "Sparkles", subtitle: "Your goals & lifestyle", desc: "Tell us what you'd love to achieve with coaching." },
  { icon: "Star", subtitle: "Almost done!", desc: "A few final details to complete your profile." },
];

const HEALTH_STEP_META = [
  { icon: "Heart", subtitle: "Your details", desc: "We'll pre-fill what we can from your earlier answers." },
  { icon: "Shield", subtitle: "Participant declaration", desc: "A standard acknowledgement for your safety." },
  { icon: "ClipboardCheck", subtitle: "Medical clearance", desc: "Your doctor's confirmation that exercise is safe for you." },
];
```

**Step 2: Update the form header and step rendering**

Replace the header section (lines 803-825) and welcome banner with:

```tsx
{/* Header */}
<div className="flex items-center justify-between mb-4">
  <div>
    <h1 className="text-xl font-bold text-gray-900">
      {currentForm === "lifestyle" ? "About You" : "Medical Clearance"}
    </h1>
    <p className="text-sm text-gray-500">
      Part {currentForm === "lifestyle" ? "1" : "2"} of 2
    </p>
  </div>
  <Button variant="ghost" size="sm" onClick={onLogout} className="text-gray-400">
    <LogOut className="w-4 h-4" />
  </Button>
</div>

{/* Progress dots */}
<div className="mb-6">
  <div className="flex items-center gap-1.5 mb-2">
    {steps.map((_, i) => (
      <div
        key={i}
        className={`h-1.5 flex-1 rounded-full transition-all ${
          i < currentStep ? "bg-pink-400" : i === currentStep ? "bg-pink-500" : "bg-gray-200"
        }`}
      />
    ))}
  </div>
  <p className="text-xs text-gray-400">Step {currentStep + 1} of {totalSteps}</p>
</div>

{/* Welcome banner on first step only */}
{currentForm === "lifestyle" && currentStep === 0 && (
  <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-5 rounded-2xl mb-6">
    <h2 className="font-bold text-lg mb-1">Welcome, {userName}!</h2>
    <p className="text-sm text-pink-100">Let's get to know you better so Zoe can create your personalized coaching plan. This takes about 5-10 minutes.</p>
  </div>
)}
```

**Step 3: Add section intro inside the Card**

Replace the Card content rendering (lines 836-840) with:

```tsx
<Card className="border-0 shadow-lg rounded-2xl">
  <CardContent className="p-6">
    {/* Section intro */}
    {(() => {
      const meta = currentForm === "lifestyle" ? LIFESTYLE_STEP_META[currentStep] : HEALTH_STEP_META[currentStep];
      if (!meta) return null;
      const IconMap: Record<string, any> = { Heart, Shield, Calendar, Activity, Dumbbell, Target, ClipboardCheck, Sparkles, Star };
      const IconComp = IconMap[meta.icon];
      return (
        <div className="flex items-start gap-3 mb-5 pb-4 border-b border-gray-100">
          {IconComp && <div className="p-2 bg-pink-50 rounded-xl"><IconComp className="w-5 h-5 text-pink-500" /></div>}
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{meta.subtitle}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{meta.desc}</p>
          </div>
        </div>
      );
    })()}
    {currentForm === "lifestyle" ? renderLifestyleStep() : renderHealthStep()}
  </CardContent>
</Card>
```

**Step 4: Verify**

Run dev server, navigate to each step and confirm:
- Each step shows an icon, subtitle, and description at the top of the card
- Progress shows as segmented dots instead of a percentage bar
- Header says "About You" / "Medical Clearance" instead of "Lifestyle & Goals" / "Health Evaluation"
- "Part 1 of 2" instead of "Form 1 of 2"

**Step 5: Commit**

```bash
git add client/src/pages/my-coaching.tsx
git commit -m "feat: add section icons, descriptions, and progress dots to intake form"
```

---

### Task 3: Step Validation

**Why:** Users can currently skip required fields and advance, potentially submitting incomplete forms.

**Files:**
- Modify: `client/src/pages/my-coaching.tsx` — add validation function, update handleNext

**Step 1: Add validation state and function**

Add after `const [submitting, setSubmitting] = useState(false);` (line 389):

```typescript
const [validationError, setValidationError] = useState("");
```

Add after the `toggleArrayField` function (after line 451):

```typescript
const validateCurrentStep = (): string | null => {
  if (currentForm === "lifestyle") {
    switch (currentStep) {
      case 0:
        if (!lifestyle.fullName.trim()) return "Please enter your full name";
        if (!lifestyle.age.trim()) return "Please enter your age";
        if (!lifestyle.whatsappNumber.trim()) return "Please enter your WhatsApp number";
        if (!lifestyle.email.trim()) return "Please enter your email";
        return null;
      case 1:
        if (!lifestyle.emergencyContactName.trim()) return "Please enter emergency contact name";
        if (!lifestyle.emergencyRelationship.trim()) return "Please enter their relationship to you";
        if (!lifestyle.emergencyContactNumber.trim()) return "Please enter emergency contact number";
        return null;
      case 2:
        if (!lifestyle.pregnancyNumber) return "Please select your pregnancy number";
        if (!lifestyle.dueDate) return "Please enter your due date";
        if (!lifestyle.trimester) return "Please select your trimester";
        return null;
      case 3:
        if (lifestyle.medicalConditions.length === 0) return "Please select at least one option or 'None of the above'";
        return null;
      case 4:
        if (lifestyle.medicalFlags.length === 0) return "Please select at least one option or 'None'";
        return null;
      case 5:
        if (lifestyle.discomfortAreas.length === 0) return "Please select at least one discomfort area";
        if (!lifestyle.discomfortTiming) return "Please select when discomfort is worse";
        if (!lifestyle.exerciseHistory) return "Please select your exercise history";
        if (!lifestyle.movementFeels) return "Please select how movement feels";
        return null;
      case 6:
        if (lifestyle.coreSymptoms.length === 0) return "Please select at least one option";
        if (lifestyle.helpAreas.length === 0) return "Please select at least one area";
        return null;
      case 7:
        if (!lifestyle.takingMedications) return "Please indicate if you take medications";
        if (!lifestyle.previousPregnancies.trim()) return "Please share your pregnancy history (or write 'None')";
        return null;
      case 8:
        if (!lifestyle.mainConcerns.trim()) return "Please share your main concerns";
        if (!lifestyle.mainGoals.trim()) return "Please share your goals";
        if (!lifestyle.currentLifestyle.trim()) return "Please describe your current lifestyle";
        return null;
      case 9:
        if (!lifestyle.consent) return "Please accept the consent to continue";
        return null;
    }
  } else {
    switch (currentStep) {
      case 0:
        if (!health.fullName.trim()) return "Please enter your full name";
        if (!health.age.trim()) return "Please enter your age";
        if (!health.phone.trim()) return "Please enter your phone number";
        if (!health.email.trim()) return "Please enter your email";
        if (!health.dueDate) return "Please enter your due date";
        if (!health.trimester) return "Please select your trimester";
        return null;
      case 1:
        if (!health.participantDeclaration) return "Please select your declaration";
        return null;
      case 2:
        if (!health.doctorName.trim()) return "Please enter your doctor's name";
        if (!health.doctorQualification.trim()) return "Please enter doctor's qualification";
        if (!health.clinicName.trim()) return "Please enter clinic/hospital name";
        if (!health.doctorContact.trim()) return "Please enter doctor's contact";
        if (!health.clearanceDecision) return "Please select medical clearance decision";
        return null;
    }
  }
  return null;
};
```

**Step 2: Update handleNext to validate**

Replace the `handleNext` function (lines 779-791) with:

```typescript
const handleNext = () => {
  const error = validateCurrentStep();
  if (error) {
    setValidationError(error);
    toast({ title: "Required fields", description: error, variant: "destructive" });
    return;
  }
  setValidationError("");
  if (currentStep < totalSteps - 1) {
    setCurrentStep(prev => prev + 1);
    window.scrollTo(0, 0);
  } else {
    if (currentForm === "lifestyle") {
      submitForm("lifestyle_questionnaire", lifestyle);
    } else {
      submitForm("health_evaluation", health);
    }
  }
};
```

**Step 3: Show validation error inline**

Add a validation error display just above the navigation buttons. After the closing `</Card>` tag and before `{/* Navigation */}`:

```tsx
{validationError && (
  <div className="mt-3 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl">
    <p className="text-sm text-red-600">{validationError}</p>
  </div>
)}
```

**Step 4: Clear validation error when user goes back or changes step**

Update `handleBack`:
```typescript
const handleBack = () => {
  setValidationError("");
  if (currentStep > 0) {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  }
};
```

**Step 5: Verify**

Run dev server, navigate to step 1, click Next without filling any field. Confirm:
- A red validation message appears below the card
- A destructive toast appears
- The form does NOT advance
- Fill in all fields, click Next — should advance normally
- Go back, go forward again — validation error should be cleared

**Step 6: Commit**

```bash
git add client/src/pages/my-coaching.tsx
git commit -m "feat: add step-by-step validation to intake form wizard"
```

---

### Task 4: Auto-Fill Health Form from Lifestyle Data

**Why:** The health evaluation form re-asks for full name, age, phone, email, due date, and trimester — all already collected in the lifestyle form. This is frustrating for users.

**Files:**
- Modify: `client/src/pages/my-coaching.tsx` — update submitForm to pre-populate health state

**Step 1: Update submitForm to auto-fill**

In the `submitForm` function (lines 453-471), update the success handler for `lifestyle_questionnaire`:

Replace:
```typescript
if (formType === "lifestyle_questionnaire") {
  setCurrentForm("health");
  setCurrentStep(0);
  toast({ title: "Form saved!", description: "Now please complete the Health Evaluation form." });
}
```

With:
```typescript
if (formType === "lifestyle_questionnaire") {
  // Pre-fill health form with data from lifestyle form
  setHealth(prev => ({
    ...prev,
    fullName: lifestyle.fullName,
    age: lifestyle.age,
    phone: lifestyle.whatsappNumber,
    email: lifestyle.email,
    dueDate: lifestyle.dueDate,
    trimester: lifestyle.trimester.replace("First trimester", "First").replace("Second trimester", "Second").replace("Third trimester", "Third").replace(" (0–12 weeks)", " (0–12 weeks)").replace(" (13–26 weeks)", " (13–26 weeks)").replace(" (27–40 weeks)", " (27–40 weeks)"),
  }));
  setCurrentForm("health");
  setCurrentStep(0);
  setValidationError("");
  toast({ title: "Form saved!", description: "Now please complete the Health Evaluation form. We've pre-filled your details." });
}
```

Note: The trimester values differ between forms. Lifestyle uses "First trimester (0–12 weeks)" while health uses "First (0–12 weeks)". The replace chain handles this mapping. If exact matching is not possible, the field will simply not pre-select, which is acceptable.

**Step 2: Verify**

Run dev server, fill out the lifestyle form completely, submit it. On the health form:
- Full name, age, phone, email, due date should be pre-filled
- Trimester should be pre-selected (or empty if format doesn't match — acceptable)
- User can still edit all pre-filled fields

**Step 3: Commit**

```bash
git add client/src/pages/my-coaching.tsx
git commit -m "feat: auto-fill health form from lifestyle answers"
```

---

### Task 5: Transition Polish — Warm Interstitial Between Forms

**Why:** When the lifestyle form is submitted, the user is abruptly dropped into the health form. A brief transition screen makes the journey feel intentional and gives context about what's next.

**Files:**
- Modify: `client/src/pages/my-coaching.tsx` — add transition state and screen

**Step 1: Add transition state**

Add after the `submitting` state (line 389):

```typescript
const [showFormTransition, setShowFormTransition] = useState(false);
```

**Step 2: Update submitForm to show transition**

In `submitForm`, replace the lifestyle success block with:

```typescript
if (formType === "lifestyle_questionnaire") {
  setHealth(prev => ({
    ...prev,
    fullName: lifestyle.fullName,
    age: lifestyle.age,
    phone: lifestyle.whatsappNumber,
    email: lifestyle.email,
    dueDate: lifestyle.dueDate,
    trimester: lifestyle.trimester.replace("First trimester", "First").replace("Second trimester", "Second").replace("Third trimester", "Third").replace(" (0–12 weeks)", " (0–12 weeks)").replace(" (13–26 weeks)", " (13–26 weeks)").replace(" (27–40 weeks)", " (27–40 weeks)"),
  }));
  setShowFormTransition(true);
}
```

**Step 3: Add transition screen rendering**

At the top of the return statement (before the main div), add:

```tsx
if (showFormTransition) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Part 1 Complete!</h2>
        <p className="text-sm text-gray-500 mb-6">
          Great job, {userName}! One more short form to go — this one is about medical clearance
          so Zoe can keep you safe during your sessions.
        </p>
        <Button
          onClick={() => {
            setShowFormTransition(false);
            setCurrentForm("health");
            setCurrentStep(0);
            setValidationError("");
          }}
          className="bg-pink-500 hover:bg-pink-600 text-white rounded-xl px-8"
        >
          Continue to Part 2
        </Button>
      </div>
    </div>
  );
}
```

Note: `CheckCircle` is already imported from lucide-react.

**Step 4: Verify**

Run dev server, complete the lifestyle form, submit. Confirm:
- A centered transition screen appears with a green checkmark
- "Part 1 Complete!" heading and encouraging message
- "Continue to Part 2" button takes you to the health form
- Health form fields are pre-filled

**Step 5: Commit**

```bash
git add client/src/pages/my-coaching.tsx
git commit -m "feat: add warm transition screen between intake form parts"
```

---

### Task 6: Final Navigation Polish

**Why:** Small UX improvements to the navigation buttons — show the upcoming step name, and use more encouraging button labels.

**Files:**
- Modify: `client/src/pages/my-coaching.tsx` — update navigation button rendering

**Step 1: Update the Next button label**

Replace the button text logic in the navigation section:

```tsx
<Button
  onClick={handleNext}
  disabled={submitting}
  className="flex-1 bg-pink-500 hover:bg-pink-600 text-white rounded-xl"
>
  {submitting ? (
    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
  ) : currentStep === totalSteps - 1 ? (
    currentForm === "lifestyle" ? "Save & Continue →" : "Submit & Finish ✓"
  ) : (
    <>Next: {steps[currentStep + 1]?.title}</>
  )}
</Button>
```

This shows "Next: Emergency Contact" instead of just "Next", giving the user a preview of what's coming.

**Step 2: Verify**

Run dev server, navigate through the form. Confirm:
- Next button shows the upcoming step name (e.g., "Next: Pregnancy Info")
- Last step of lifestyle shows "Save & Continue →"
- Last step of health shows "Submit & Finish ✓"

**Step 3: Commit**

```bash
git add client/src/pages/my-coaching.tsx
git commit -m "feat: show upcoming step name in Next button label"
```

---

## Verification Checklist

After all tasks are complete, verify the full flow:

1. [ ] Login as a test client at `/my-coaching`
2. [ ] Welcome banner appears on first step with user name
3. [ ] Each step has an icon, subtitle, and description
4. [ ] Progress dots show completed/current/upcoming steps
5. [ ] Medical Conditions and Medical Flags are on separate screens
6. [ ] Medications/History and Goals/Lifestyle are on separate screens
7. [ ] Clicking Next with empty required fields shows validation error
8. [ ] Filling fields and clicking Next advances normally
9. [ ] After lifestyle form submission, a transition screen appears
10. [ ] Health form has pre-filled name, age, phone, email, due date
11. [ ] Next button shows upcoming step name
12. [ ] All forms submit successfully to the server
