# Critical Fixes Applied + Remaining Work

## ✅ FIXED: OpenAI Configuration (Just Now)

**Problem:** OpenAI endpoints were inconsistently configured. Some used `OPENAI_API_KEY`, others used Replit's `AI_INTEGRATIONS_*` variables.

**Solution:** All OpenAI endpoints now support BOTH configurations:
- If `AI_INTEGRATIONS_OPENAI_BASE_URL` and `AI_INTEGRATIONS_OPENAI_API_KEY` exist → Uses Replit AI Integrations
- Otherwise uses `OPENAI_API_KEY` → Direct OpenAI API

**Deploy to fix:**
```bash
cd ~/workspace
git pull origin main
# Restart server
```

**This fixes:**
- ✅ Coach's Notes & Direction generation
- ✅ Workout plan generation
- ✅ Plan outline generation
- ✅ All AI features in both local and production

---

## 🔧 TODO: Exercise Library Video Upload

**Current State:** Exercise library exists but cannot upload videos.

**What's Needed:**
1. Add video file upload field to exercise creation form
2. Handle video file upload (via Cloudinary or direct storage)
3. Display video in exercise library and workout views
4. Add video player component for clients to view exercises

**Complexity:** Medium (2-3 hours)
**Priority:** High - blocks full workout experience

---

## 🔧 TODO: Bulk Exercise Upload

**Current State:** Exercises must be created one-by-one in admin panel.

**What's Needed:**
1. CSV/Excel import functionality
2. Template file for bulk exercise data
3. Validation and error handling for bulk imports
4. Preview before committing bulk data

**Example CSV format:**
```
name,category,difficulty,sets,reps,description,videoUrl
Squats,Lower Body,Intermediate,3,12,Basic bodyweight squat,https://...
Push-ups,Upper Body,Beginner,3,10,Standard push-up,https://...
```

**Complexity:** Medium (3-4 hours)
**Priority:** Medium - useful but not blocking

---

## 🚀 Deployment Steps

### 1. Pull Latest Code in Replit
```bash
git pull origin main
```

### 2. Restart Server
Click Stop → Run in Replit

### 3. Test OpenAI Features
1. Go to admin coaching panel
2. Select a client with completed intake
3. Click "Generate with AI" → Should work now
4. Try generating Week 1 workout → Should work now

### 4. Verify Environment Variables
In Replit, check you have ONE of these configurations:

**Option A: Replit AI Integrations (Recommended)**
- `AI_INTEGRATIONS_OPENAI_BASE_URL` (set by Replit)
- `AI_INTEGRATIONS_OPENAI_API_KEY` (set by Replit)

**Option B: Direct OpenAI API**
- `OPENAI_API_KEY` = your OpenAI key

You only need ONE of these configurations, not both.

---

## 📝 What to Test After Deploying

1. **Coach Remarks Generation**
   - Admin panel → Client with completed intake
   - Click "Generate with AI" in Coach's Notes section
   - Should generate 4 fields with personalized content

2. **Workout Generation**
   - Admin panel → Click "Generate" for Week 1
   - Should create outline and then full 7-day workout

3. **Error Messages**
   - If API key is missing, should show clear error:
   - "OpenAI API key not configured. Please add OPENAI_API_KEY or configure Replit AI Integrations."

---

## 🎯 Next Steps

### Immediate (Today)
1. ✅ Deploy OpenAI fixes to Replit
2. ✅ Test AI generation features
3. ✅ Complete test script (TEST-SCRIPT.md)

### Short Term (This Week)
1. ⏳ Add video upload to exercise library
2. ⏳ Add bulk exercise import feature
3. ⏳ Complete end-to-end user testing

### Future Enhancements
- Exercise categories and filtering
- Exercise search functionality
- Video preview in admin panel
- Exercise usage tracking (which workouts use which exercises)

---

## 🐛 Known Issues (After This Fix)

1. **Video upload missing** - Exercises have videoUrl field but no upload UI
2. **Bulk import needed** - Manual exercise creation is slow
3. **No exercise preview** - Can't preview exercise before adding to workout

All other critical bugs from the audit have been fixed.

---

## 📞 Support

If issues persist after deploying:

1. Check Replit console logs for detailed errors
2. Verify environment variables are set
3. Try the TEST-SCRIPT.md for systematic testing
4. Share specific error messages for troubleshooting
