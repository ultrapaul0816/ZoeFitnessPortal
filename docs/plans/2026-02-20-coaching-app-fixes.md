# Coaching App Bug Fixes & Improvements Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all critical and important bugs in the private coaching app to ensure all functionalities work correctly.

**Architecture:** The app is a full-stack TypeScript application with Express.js backend (server/routes.ts), React frontend (client/src/pages/my-coaching.tsx for clients, admin-coaching.tsx for admins), PostgreSQL via Drizzle ORM (shared/schema.ts), and OpenAI GPT-4o for AI plan generation.

**Tech Stack:** TypeScript, React, Express.js, Drizzle ORM, PostgreSQL, TanStack Query, wouter, Tailwind CSS, shadcn/ui

---

## Task 1: Fix Terms Modal — Broken API Endpoint (CRITICAL)

**Problem:** `my-coaching.tsx:1477` calls `PATCH /api/auth/update-user` which does not exist on the server. New users are permanently trapped in the terms modal with no way out.

**Files:**
- Modify: `client/src/pages/my-coaching.tsx:1466-1507`

**Step 1: Fix the `handleAcceptTerms` function**

Replace the single `PATCH /api/auth/update-user` call with two sequential calls to the existing server endpoints:

```typescript
const handleAcceptTerms = async () => {
  if (!canProceed) {
    toast({
      title: "Please accept both agreements",
      description: "You must accept the Terms & Conditions and acknowledge the Disclaimer to continue.",
      variant: "destructive",
    });
    return;
  }

  try {
    // Call existing accept-terms endpoint
    const termsResponse = await fetch("/api/auth/accept-terms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ userId: user!.id }),
    });
    if (!termsResponse.ok) throw new Error("Failed to accept terms");

    // Call existing accept-disclaimer endpoint
    const disclaimerResponse = await fetch("/api/auth/accept-disclaimer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ userId: user!.id }),
    });
    if (!disclaimerResponse.ok) throw new Error("Failed to accept disclaimer");

    // Update local user state
    const updatedUser = { ...user, termsAccepted: true, disclaimerAccepted: true };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setShowTermsModal(false);

    toast({
      title: "Thank you!",
      description: "Your preferences have been saved.",
    });
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to save your preferences. Please try again.",
      variant: "destructive",
    });
  }
};
```

**Step 2: Verify the server endpoints exist**

Confirm `POST /api/auth/accept-terms` (routes.ts:1344) and `POST /api/auth/accept-disclaimer` (routes.ts:1388) both exist and accept `{ userId }` in body.

**Step 3: Commit**

```bash
git add client/src/pages/my-coaching.tsx
git commit -m "fix: use correct accept-terms and accept-disclaimer endpoints in terms modal"
```

---

## Task 2: Fix React Hooks Order Violation (CRITICAL)

**Problem:** `useEffect` at `my-coaching.tsx:1456` is called after multiple conditional `return` statements (lines 1242, 1251, 1421, 1430), violating React's Rules of Hooks.

**Files:**
- Modify: `client/src/pages/my-coaching.tsx`

**Step 1: Move the useEffect before early returns**

Move the terms-checking `useEffect` from line 1456 to right after the other hooks (after line 947, before any early returns). Guard it internally:

```typescript
// Move this block to after line 947 (after the welcomeCompleted useEffect)
useEffect(() => {
  if (user && (!user.termsAccepted || !user.disclaimerAccepted)) {
    setShowTermsModal(true);
  }
}, [user]);
```

Remove the same `useEffect` from its current location at line 1456.

**Step 2: Also move the `client` and `coachingType` assignments**

The current code at lines 1452-1453 assigns `const client = planData.client` and `const coachingType = client.coachingType` BETWEEN the early returns and the `useEffect`. These should stay where they are (after planData checks), but the `useEffect` must go above.

**Step 3: Commit**

```bash
git add client/src/pages/my-coaching.tsx
git commit -m "fix: move useEffect before conditional returns to fix React hooks order"
```

---

## Task 3: Remove Hardcoded Fake Progress Values (CRITICAL)

**Problem:** `my-coaching.tsx:1848-1854` shows fabricated progress percentages (85%, 72%, 60%, 55%, 68%) for the "5 Pillars" that never reflect real data.

**Files:**
- Modify: `client/src/pages/my-coaching.tsx:1846-1863`

**Step 1: Remove the percentage values and show icons only**

Since there's no backend data source for these pillars, remove the fake percentages and show just the pillar icons as aspirational framework labels:

```typescript
{/* 5 Pillars Framework */}
<div className="grid grid-cols-5 gap-3">
  {[
    { icon: Dumbbell, label: "Training" },
    { icon: Apple, label: "Nutrition" },
    { icon: Brain, label: "Mindset" },
    { icon: Heart, label: "Relationships" },
    { icon: Target, label: "Purpose" }
  ].map((pillar, i) => (
    <div key={i} className="text-center">
      <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-slate-700 flex items-center justify-center">
        <pillar.icon className="w-5 h-5 text-blue-400" />
      </div>
      <div className="text-xs text-slate-400">{pillar.label}</div>
    </div>
  ))}
</div>
```

**Step 2: Commit**

```bash
git add client/src/pages/my-coaching.tsx
git commit -m "fix: remove hardcoded fake progress percentages from 5 Pillars framework"
```

---

## Task 4: Fix Blueprint Endpoint Auth for Token-Based Users (CRITICAL)

**Problem:** Client-facing blueprint endpoint (`routes.ts:9661`) only checks `req.session?.userId`, not `_tokenUserId`. Token-authenticated users (magic link) are locked out. The frontend `MyWellnessBlueprint.tsx` also doesn't send the Bearer token.

**Files:**
- Modify: `server/routes.ts:9661-9681`
- Modify: `client/src/pages/my-coaching.tsx` (blueprint view rendering)
- Modify: `client/src/components/coaching/MyWellnessBlueprint.tsx`

**Step 1: Fix the server endpoint to support token auth**

```typescript
app.get("/api/coaching/my-wellness-blueprint", async (req, res) => {
  try {
    const userId = req.session?.userId || (req as any)._tokenUserId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const userIdStr = userId.toString();

    const client = await storage.getCoachingClientByUserId(userIdStr);
    if (!client) return res.status(404).json({ message: "No coaching client found" });

    if (!(client as any).blueprintApproved) {
      return res.json({ blueprint: null, message: "Your coach is preparing your personalized blueprint" });
    }

    res.json({
      blueprint: (client as any).wellnessBlueprint || null,
      generatedAt: (client as any).blueprintGeneratedAt || null,
    });
  } catch (error: any) {
    console.error("Error fetching client wellness blueprint:", error);
    res.status(500).json({ message: "Failed to fetch wellness blueprint" });
  }
});
```

**Step 2: Fix the frontend to use coachingFetch**

In `my-coaching.tsx`, pass a custom fetch function to the blueprint component, or inline the blueprint fetch using `coachingQueryFn` that already exists in the page. The simplest fix is to fetch the blueprint data in `my-coaching.tsx` itself and pass it as a prop.

Add a query in `my-coaching.tsx` (near the other coaching queries around line 1049):

```typescript
const { data: blueprintData } = useQuery({
  queryKey: ["/api/coaching/my-wellness-blueprint"],
  queryFn: coachingQueryFn as unknown as () => Promise<any>,
  enabled: !!user && activeView === "blueprint",
});
```

Then pass it to the component:

```typescript
{activeView === "blueprint" && (
  <MyWellnessBlueprint
    clientName={`${planData?.userProfile?.firstName || ''} ${planData?.userProfile?.lastName || ''}`.trim()}
    blueprintData={blueprintData}
  />
)}
```

Update `MyWellnessBlueprint.tsx` to accept optional `blueprintData` prop and use it when provided instead of fetching internally.

**Step 3: Commit**

```bash
git add server/routes.ts client/src/pages/my-coaching.tsx client/src/components/coaching/MyWellnessBlueprint.tsx
git commit -m "fix: add token auth to blueprint endpoint and use coachingFetch on client"
```

---

## Task 5: Fix approve-plan Bypassing State Machine (CRITICAL)

**Problem:** `POST /api/admin/coaching/clients/:clientId/approve-plan` (routes.ts:8490) sets status directly to `"active"` without checking current status, calculating dates, or sending activation email. This bypasses the proper `activate` endpoint.

**Files:**
- Modify: `server/routes.ts:8518-8519`

**Step 1: Change approve-plan to set status to `plan_ready` instead of `active`**

Replace line 8519:
```typescript
// OLD: await storage.updateCoachingClient(client.id, { status: "active" });
// NEW:
await storage.updateCoachingClient(client.id, { status: "plan_ready" });
```

Update the response message (line 8521):
```typescript
res.json({ message: "Plan approved. Client is ready for activation.", status: "plan_ready" });
```

**Step 2: Add status guard**

Add a status check at the top of the endpoint (after line 8493):

```typescript
const validStatuses = ["plan_generating", "plan_ready", "intake_complete"];
if (!validStatuses.includes(client.status)) {
  return res.status(400).json({ message: `Cannot approve plan: client is in '${client.status}' status` });
}
```

**Step 3: Commit**

```bash
git add server/routes.ts
git commit -m "fix: approve-plan now sets status to plan_ready, not active, with status guard"
```

---

## Task 6: Fix Admin Workout Completions Auth (CRITICAL)

**Problem:** `GET /api/admin/coaching/:clientId/workout-completions` (routes.ts:9381) uses manual auth check instead of `requireAdmin` middleware.

**Files:**
- Modify: `server/routes.ts:9381-9385`

**Step 1: Add requireAdmin middleware and remove manual check**

```typescript
// OLD:
app.get("/api/admin/coaching/:clientId/workout-completions", async (req, res) => {
  try {
    if (!req.session?.userId) return res.status(401).json({ message: "Not authenticated" });
    const user = await storage.getUser(req.session.userId);
    if (!user?.isAdmin) return res.status(403).json({ message: "Admin access required" });

// NEW:
app.get("/api/admin/coaching/:clientId/workout-completions", requireAdmin, async (req, res) => {
  try {
```

Remove the manual auth check lines (9383-9385).

**Step 2: Commit**

```bash
git add server/routes.ts
git commit -m "fix: use requireAdmin middleware on admin workout completions endpoint"
```

---

## Task 7: Fix Energy Level Scale Inconsistency (IMPORTANT)

**Problem:** Energy level shown as `/5` in Overview tab (admin-coaching.tsx:1063) but as `/10` in Check-ins tab (admin-coaching.tsx:2520). Client-side check-in form uses 1-10 scale (my-coaching.tsx:906).

**Files:**
- Modify: `client/src/pages/admin-coaching.tsx:1063`

**Step 1: Fix the Overview tab to show /10**

The client submits energy on a 1-10 scale. Change line 1063:

```typescript
// OLD: {" "}{lastCheckin.energyLevel}/5 energy
// NEW:
{" "}{lastCheckin.energyLevel}/10 energy
```

**Step 2: Commit**

```bash
git add client/src/pages/admin-coaching.tsx
git commit -m "fix: correct energy level scale from /5 to /10 in overview tab"
```

---

## Task 8: Fix Hardcoded Protein Progress Bar (IMPORTANT)

**Problem:** `my-coaching.tsx:2322` shows a progress bar hardcoded to 70% that misleads clients about their protein intake.

**Files:**
- Modify: `client/src/pages/my-coaching.tsx:2322`

**Step 1: Remove the misleading progress bar**

Replace the hardcoded progress bar with a simple visual indicator without a fake percentage:

```typescript
{nutritionOverview.proteinGoal && (
  <div className="mb-3">
    <div className="flex items-center justify-between mb-1">
      <span className="text-sm text-gray-600">Daily Protein Target</span>
      <span className="text-sm font-bold text-pink-600">{nutritionOverview.proteinGoal}g</span>
    </div>
    <div className="h-2 bg-pink-100 rounded-full">
      <div className="h-full bg-pink-500 rounded-full w-0" />
    </div>
    <p className="text-[10px] text-gray-400 mt-1">Track via your daily check-in</p>
  </div>
)}
```

**Step 2: Commit**

```bash
git add client/src/pages/my-coaching.tsx
git commit -m "fix: replace hardcoded 70% protein progress with empty track + reminder"
```

---

## Task 9: Fix Navigation Bar Not Floating (IMPORTANT)

**Problem:** `my-coaching.tsx:2958` renders the nav bar inside page flow (`mt-6 mb-4`), so users must scroll to the bottom to switch views.

**Files:**
- Modify: `client/src/pages/my-coaching.tsx:2958-2984`

**Step 1: Make the nav bar fixed at the bottom**

Replace the nav bar wrapper:

```typescript
// OLD: <div className="mt-6 mb-4">
// NEW:
<div className="fixed bottom-4 left-4 right-4 z-40">
```

**Step 2: Add bottom padding to the content container**

Add padding to the main content area so the fixed nav doesn't overlap content. Find the parent container div and add `pb-24`:

Look for the container div around the view content (approximately line 2945) and ensure it has bottom padding.

**Step 3: Remove the duplicate `<BottomNav />` at line 3002**

Since the coaching page has its own navigation, remove the site-wide BottomNav that creates a duplicate:

```typescript
// Remove this line:
<BottomNav />
```

**Step 4: Commit**

```bash
git add client/src/pages/my-coaching.tsx
git commit -m "fix: make coaching nav bar fixed at bottom and remove duplicate BottomNav"
```

---

## Task 10: Fix Stale Auth Fallback (IMPORTANT)

**Problem:** `my-coaching.tsx:929-935` falls back to stale localStorage data when the session check fails, making the user appear logged in with expired credentials.

**Files:**
- Modify: `client/src/pages/my-coaching.tsx:929-936`

**Step 1: Clear stale data on session failure**

```typescript
// OLD:
} else {
  const parsedUser = JSON.parse(userData);
  setUser(parsedUser);
}
} catch {
  const parsedUser = JSON.parse(userData);
  setUser(parsedUser);
}

// NEW:
} else {
  // Session expired on server - clear stale local data
  localStorage.removeItem("user");
  setUser(null);
}
} catch {
  // Network error - try localStorage as temporary fallback
  try {
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
  } catch {
    localStorage.removeItem("user");
    setUser(null);
  }
}
```

**Step 2: Commit**

```bash
git add client/src/pages/my-coaching.tsx
git commit -m "fix: clear stale localStorage on session expiry instead of using stale user data"
```

---

## Task 11: Fix Outline-to-Workout Race Condition (IMPORTANT)

**Problem:** `admin-coaching.tsx:2808-2811` uses `setTimeout(500)` to chain outline approval with workout generation, causing race conditions.

**Files:**
- Modify: `client/src/pages/admin-coaching.tsx:2800-2814`

**Step 1: Use mutation's onSuccess callback instead of setTimeout**

Update the approve outline button handler to trigger workout generation in the approval mutation's onSuccess:

```typescript
<Button
  onClick={() => {
    if (selectedClient && outlinePreviewWeek) {
      approveOutlineAndGenerateMutation.mutate({
        clientId: selectedClient.id,
        weekNumber: outlinePreviewWeek,
        editedOutline: editingOutlineText || undefined,
      }, {
        onSuccess: () => {
          // Generate workout AFTER outline is confirmed saved
          generateWorkoutMutation.mutate({
            clientId: selectedClient.id,
            weekNumber: outlinePreviewWeek,
          });
        },
      });
      setOutlinePreviewWeek(null);
      setEditingOutlineText("");
    }
  }}
  disabled={approveOutlineAndGenerateMutation.isPending || generateWorkoutMutation.isPending}
  className="bg-blue-600 hover:bg-blue-700 text-white"
>
```

**Step 2: Commit**

```bash
git add client/src/pages/admin-coaching.tsx
git commit -m "fix: replace setTimeout with onSuccess callback for outline-to-workout generation"
```

---

## Task 12: Fix Blueprint Approval UX (IMPORTANT)

**Problem:** `admin-coaching.tsx:2634-2637` — the "Edit & Re-approve" button actually unapproves the blueprint without confirmation, instantly hiding it from the client.

**Files:**
- Modify: `client/src/pages/admin-coaching.tsx:2634-2637`

**Step 1: Add confirmation before unapproving**

```typescript
onApprove={() => {
  const isApproved = (selectedClient as any)?.blueprintApproved;
  if (isApproved) {
    if (!window.confirm("This will hide the blueprint from the client until you re-approve. Continue?")) {
      return;
    }
  }
  approveBlueprintMutation.mutate({
    clientId: selectedClient.id,
    approved: !isApproved,
  });
}}
```

**Step 2: Commit**

```bash
git add client/src/pages/admin-coaching.tsx
git commit -m "fix: add confirmation dialog before unapproving wellness blueprint"
```

---

## Task 13: Fix Hardcoded 4-Week Limit in Admin UI (IMPORTANT)

**Problem:** `admin-coaching.tsx` hardcodes `[1, 2, 3, 4]` for week selectors instead of using `planDurationWeeks`.

**Files:**
- Modify: `client/src/pages/admin-coaching.tsx` (lines 768, 968, 1532, 1654)

**Step 1: Replace hardcoded week arrays with dynamic ones**

At each location where `[1, 2, 3, 4].map(week => ...)` appears, replace with:

```typescript
{Array.from({ length: selectedClient?.planDurationWeeks || 4 }, (_, i) => i + 1).map(week => ...)}
```

**Step 2: Commit**

```bash
git add client/src/pages/admin-coaching.tsx
git commit -m "fix: use dynamic planDurationWeeks instead of hardcoded 4-week limit"
```

---

## Summary

| Task | Severity | Estimate |
|------|----------|----------|
| 1. Fix Terms Modal API | CRITICAL | 5 min |
| 2. Fix React Hooks Order | CRITICAL | 3 min |
| 3. Remove Fake Progress | CRITICAL | 3 min |
| 4. Fix Blueprint Auth | CRITICAL | 10 min |
| 5. Fix approve-plan State Machine | CRITICAL | 5 min |
| 6. Fix Admin Completions Auth | CRITICAL | 2 min |
| 7. Fix Energy Level Scale | IMPORTANT | 1 min |
| 8. Fix Protein Progress Bar | IMPORTANT | 3 min |
| 9. Fix Floating Nav Bar | IMPORTANT | 5 min |
| 10. Fix Stale Auth Fallback | IMPORTANT | 3 min |
| 11. Fix Race Condition | IMPORTANT | 5 min |
| 12. Fix Blueprint Approval UX | IMPORTANT | 3 min |
| 13. Fix Hardcoded Week Limit | IMPORTANT | 5 min |
