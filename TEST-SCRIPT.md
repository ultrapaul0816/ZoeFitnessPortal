# Private Coaching Test Script
**Complete End-to-End Testing Guide**

## Pre-Test Setup

### 1. Deploy Latest Code to Replit
```bash
git pull origin main
npm install
```

### 2. Verify Environment Variables in Replit Secrets
✅ `APP_URL` = `https://app.strongerwithzoe.com`
✅ `RESEND_API_KEY` = `re_emqDfZDf_P2i1undgvkBEmx9djGwW5Zza`
✅ `OPENAI_API_KEY` = (your OpenAI key)
✅ `DATABASE_URL` = (your Neon PostgreSQL URL)

### 3. Restart Replit Server
Click Stop → Run

---

## Test Phase 1: Admin Creates New Coaching Client

### Step 1.1: Login as Admin
1. Go to `https://app.strongerwithzoe.com/login`
2. Login with your admin account
3. Navigate to `/admin-coaching`

### Step 1.2: Create New Client
1. Click "New Client" button (pink button, top of left sidebar)
2. Fill in form:
   - **Email**: Use a test email you have access to (e.g., `youremail+test1@gmail.com`)
   - **First Name**: Test
   - **Last Name**: Client
   - **Coaching Type**: Select "Private Coaching"
   - **Payment Amount**: 5000 (or any number)
3. Click "Enroll Client"

**Expected Result:**
- ✅ Success toast: "Client enrolled successfully"
- ✅ Client appears in left sidebar with status "Enrolled"
- ✅ Email arrives with subject "Welcome to Private Coaching with Zoe!"

**Screenshot Location:** Save as `01-client-created.png`

### Step 1.3: Check Welcome Email
1. Check inbox for test email
2. **DO NOT click the link yet** - just verify it arrived
3. Email should say "Start Your Intake Forms" button

**Expected Result:**
- ✅ Email received within 30 seconds
- ✅ Contains magic link button

**Screenshot Location:** Save as `02-welcome-email.png`

---

## Test Phase 2: Client Accepts Terms and Completes Intake

### Step 2.1: Click Magic Link (Auto-Login)
1. Click "Start Your Intake Forms" button in email
2. Browser opens to `app.strongerwithzoe.com`

**Expected Result:**
- ✅ Redirects to `/my-coaching` page
- ✅ Shows Terms & Disclaimer modal (NEW!)
- ✅ Modal has two checkboxes and "Continue" button

**Screenshot Location:** Save as `03-terms-modal.png`

### Step 2.2: Accept Terms
1. Check "I have read and agree to the Terms & Conditions"
2. Check "I acknowledge and understand the health and safety information"
3. Click "Continue to My Coaching Dashboard"

**Expected Result:**
- ✅ Modal closes
- ✅ Shows "Strategic Welcome" page with timeline graphic
- ✅ Page says "Let's Get Started" at top

**Screenshot Location:** Save as `04-strategic-welcome.png`

### Step 2.3: Complete Strategic Welcome
1. Read the welcome page
2. Click "Continue to Intake Form" button at bottom

**Expected Result:**
- ✅ Intake form wizard appears
- ✅ Shows progress bar at top
- ✅ First section is "Personal Information" or similar

**Screenshot Location:** Save as `05-intake-form-start.png`

### Step 2.4: Fill Out Intake Form
Fill in ALL sections of the intake form:
- Personal information
- Goals and motivation
- Fitness experience
- Medical history
- Lifestyle factors

**IMPORTANT**: Take your time and fill in realistic data - the AI will use this to generate workout plans!

Example answers:
- Goals: "Build strength, improve energy, feel confident"
- Experience: "Beginner to intermediate"
- Medical: "No injuries, no conditions"
- Availability: "3-4 days per week"

### Step 2.5: Submit Intake Form
1. Click through all sections using "Next" button
2. On final page, click "Submit"

**Expected Result:**
- ✅ Success message appears
- ✅ Redirects to waiting screen
- ✅ Says "Zoe is Reviewing Your Information"
- ✅ Status shows "Intake Complete" or similar

**Screenshot Location:** Save as `06-intake-submitted.png`

---

## Test Phase 3: Admin Generates AI Coach Remarks

### Step 3.1: Return to Admin Panel
1. Go back to admin dashboard (`/admin-coaching`)
2. Click on the test client in left sidebar
3. Status should show "intake_complete"

**Expected Result:**
- ✅ Client status is "Intake Complete" (green badge)
- ✅ Overview tab shows intake form responses

**Screenshot Location:** Save as `07-admin-intake-complete.png`

### Step 3.2: Generate Coach Remarks with AI
1. Scroll to "Coach's Notes & Direction" section
2. Click "Generate with AI" button (purple/violet border)
3. Wait 5-10 seconds

**Expected Result:**
- ✅ Button shows "Generating..." with spinning icon
- ✅ After 5-10 seconds, 4 text fields fill with AI-generated content:
  - Training Focus
  - Nutritional Guidance
  - Things to Watch
  - Client Personality
- ✅ Content is specific to the client's intake responses

**Screenshot Location:** Save as `08-ai-coach-remarks.png`

**If this fails:**
- Check error message
- Verify `OPENAI_API_KEY` is set in Replit Secrets
- Check Replit console logs for detailed error

---

## Test Phase 4: Admin Generates Week 1 Workout Plan

### Step 4.1: Generate Plan Outline
1. Scroll to "4-Week Workout Plan" section
2. Find "Week 1" row
3. Click "Generate" button for Week 1
4. Wait 10-15 seconds

**Expected Result:**
- ✅ Button shows "Generating..."
- ✅ Dialog/modal appears with "Weekly Approach Preview"
- ✅ Shows AI-generated weekly overview/philosophy
- ✅ Has "Approve & Generate Workout" button

**Screenshot Location:** Save as `09-week1-outline.png`

**If this fails with "Week number must be between 1 and 4":**
- This bug should be fixed now
- If still occurs, check Replit pulled latest code

### Step 4.2: Approve and Generate Full Workout
1. Review the weekly approach text
2. Click "Approve & Generate Workout" button
3. Wait 20-30 seconds (this is the longest AI generation)

**Expected Result:**
- ✅ Progress indicator shows generation happening
- ✅ After 20-30 seconds, dialog closes
- ✅ Week 1 now shows "7 days" badge (green)
- ✅ Week 1 button changes to "Regenerate"

**Screenshot Location:** Save as `10-week1-generated.png`

### Step 4.3: View Generated Workout Details
1. Click on "Week 1" row to expand it
2. Scroll through the 7 days

**Expected Result:**
- ✅ Shows 7 days (Day 1 through Day 7)
- ✅ Each day has exercises listed
- ✅ Exercises have sets, reps, and descriptions
- ✅ At least one "Rest Day" should exist

**Screenshot Location:** Save as `11-week1-details.png`

---

## Test Phase 5: Admin Activates Client

### Step 5.1: Change Status to "Plan Ready"
1. At top of client details, find Status dropdown
2. Change from "Intake Complete" to "Plan Ready"
3. Click save/update (if needed)

**Expected Result:**
- ✅ Status changes to "Plan Ready" (blue badge)
- ✅ No errors

### Step 5.2: Activate Client
1. Click "Activate Client" button (should appear after status change)
2. Confirm if prompted

**Expected Result:**
- ✅ Status changes to "Active" (green badge)
- ✅ Success toast appears
- ✅ Start date is set to next Monday

**Screenshot Location:** Save as `12-client-activated.png`

**If activation fails:**
- Error should say "Cannot activate: Week 1 incomplete (X/7 days)"
- This means not all 7 days generated - go back to Step 4.2

---

## Test Phase 6: Client Views and Completes Workout

### Step 6.1: Client Accesses Dashboard
1. Open a new incognito/private browser window
2. Go to `https://app.strongerwithzoe.com/my-coaching`
3. Login using the test client email (use magic link or password)

**Expected Result:**
- ✅ Redirects to `/my-coaching` coaching dashboard
- ✅ Shows "Week 1" workouts
- ✅ Shows "Today's Workout" or current day
- ✅ Bottom navigation shows: Today, Workouts, Nutrition, Messages, Check-in

**Screenshot Location:** Save as `13-client-dashboard.png`

### Step 6.2: View Week 1 Day 1 Workout
1. Click on "Workouts" tab in bottom navigation
2. Click on "Week 1"
3. Click on "Day 1"

**Expected Result:**
- ✅ Full workout details appear
- ✅ Shows list of exercises with sets/reps
- ✅ Each exercise has a checkbox or complete button
- ✅ "Mark Workout Complete" button at bottom

**Screenshot Location:** Save as `14-day1-workout.png`

### Step 6.3: Mark Workout as Complete
1. Scroll to bottom of Day 1 workout
2. Click "Mark Workout Complete" button
3. Confirm if prompted

**Expected Result:**
- ✅ Success message appears
- ✅ Day 1 shows as completed (checkmark or green indicator)
- ✅ Progress updates (e.g., "1/7 workouts completed this week")

**Screenshot Location:** Save as `15-workout-completed.png`

---

## Test Phase 7: Client Logs Meal

### Step 7.1: Go to Check-in Tab
1. Click "Check-in" tab in bottom navigation

**Expected Result:**
- ✅ Shows daily check-in form
- ✅ Has fields for:
  - Mood
  - Energy level
  - Sleep hours
  - Water intake
  - Meals logged (breakfast, lunch, dinner, snack)
  - Weight (optional)
  - Notes

**Screenshot Location:** Save as `16-checkin-form.png`

### Step 7.2: Log a Meal
1. In "Meals Logged" section, find "Breakfast"
2. Type a meal: "Oatmeal with berries and almonds"
3. Fill in at least one other field (e.g., Mood = "Good", Energy = 7)
4. Click "Submit Check-in" button

**Expected Result:**
- ✅ Success message: "Check-in submitted"
- ✅ Form clears or shows confirmation
- ✅ Can view check-in history

**Screenshot Location:** Save as `17-meal-logged.png`

---

## Test Phase 8: Admin Verifies Progress

### Step 8.1: Check Client Progress in Admin
1. Return to admin dashboard
2. Click on test client
3. Go to "Check-ins" tab

**Expected Result:**
- ✅ Shows today's check-in with meal logged
- ✅ Shows workout completion (1 workout)
- ✅ Progress stats updated

**Screenshot Location:** Save as `18-admin-progress-view.png`

---

## Success Criteria

All tests passed if:
- ✅ Client created and welcome email received
- ✅ Terms/disclaimer modal shown and accepted
- ✅ Intake form submitted successfully
- ✅ AI coach remarks generated
- ✅ Week 1 (7 days) generated with exercises
- ✅ Client activated successfully
- ✅ Client can view and complete Day 1 workout
- ✅ Client can log a meal in check-in
- ✅ Admin can see client progress

---

## Troubleshooting Common Issues

### Issue: "OpenAI API key not configured"
**Fix:** Add `OPENAI_API_KEY` to Replit Secrets

### Issue: "Week number must be between 1 and 4"
**Fix:** Run `git pull origin main` in Replit - this bug is fixed in latest code

### Issue: Terms modal doesn't appear
**Fix:** This is correct now! Modal should appear on first visit after magic link

### Issue: "Cannot activate: Week 1 incomplete"
**Fix:** Make sure all 7 days of Week 1 are generated before activating

### Issue: Magic link shows 404
**Fix:**
1. Check `APP_URL` in Replit Secrets matches your domain
2. Ensure latest code is deployed (`git pull origin main`)

---

## After Testing

Once all tests pass:
1. Collect all 18 screenshots
2. Report any issues you encountered
3. Note anything that felt confusing or broken
4. Share results with development team

**Test completed by:** ___________
**Date:** ___________
**Overall status:** ☐ PASS ☐ FAIL ☐ PARTIAL
