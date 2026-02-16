# Video Upload & Bulk Import Implementation Plan

## Priority 1: Video Upload for Exercise Library

### Current State
- Exercise form has "Video & Media" tab
- Only accepts YouTube URL (text input)
- Cloudinary integration exists for images
- Multer configured for video files (mp4, mov, webm, etc.)

### Implementation Steps

#### Step 1: Add File Upload UI (admin-exercises.tsx)

**Location:** Lines 523-543 in "Video & Media" tab

Add below the YouTube URL input:
```tsx
<div className="space-y-2">
  <Label>Or Upload Video File</Label>
  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-pink-400 transition-colors">
    <input
      type="file"
      accept="video/mp4,video/quicktime,video/webm,video/x-m4v,video/x-msvideo"
      onChange={handleVideoFileChange}
      className="hidden"
      id="video-upload"
    />
    <label htmlFor="video-upload" className="cursor-pointer">
      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
      <p className="text-sm font-medium">Click to upload video</p>
      <p className="text-xs text-gray-500">MP4, MOV, WEBM up to 50MB</p>
    </label>
    {uploadingVideo && (
      <div className="mt-2">
        <Progress value={uploadProgress} />
        <p className="text-xs text-gray-600 mt-1">Uploading... {uploadProgress}%</p>
      </div>
    )}
    {form.videoUrl && !form.videoUrl.includes('youtube') && (
      <div className="mt-2 flex items-center justify-center gap-2">
        <Video className="w-4 h-4 text-green-600" />
        <span className="text-sm text-green-600">Video uploaded</span>
      </div>
    )}
  </div>
</div>
```

#### Step 2: Add State Management

Add to form state (around line 105):
```tsx
const [uploadingVideo, setUploadingVideo] = useState(false);
const [uploadProgress, setUploadProgress] = useState(0);
```

Add handler function:
```tsx
const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validate file size (50MB)
  if (file.size > 50 * 1024 * 1024) {
    toast({ title: "File too large", description: "Max file size is 50MB", variant: "destructive" });
    return;
  }

  setUploadingVideo(true);
  setUploadProgress(0);

  try {
    const formData = new FormData();
    formData.append('video', file);

    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        setUploadProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        setForm({ ...form, videoUrl: response.videoUrl });
        toast({ title: "Video uploaded", description: "Video uploaded successfully!" });
      } else {
        throw new Error('Upload failed');
      }
      setUploadingVideo(false);
    });

    xhr.addEventListener('error', () => {
      toast({ title: "Upload failed", description: "Failed to upload video", variant: "destructive" });
      setUploadingVideo(false);
    });

    xhr.open('POST', '/api/admin/exercises/upload-video');
    xhr.send(formData);
  } catch (error) {
    console.error('Video upload error:', error);
    toast({ title: "Upload failed", description: "An error occurred", variant: "destructive" });
    setUploadingVideo(false);
  }
};
```

#### Step 3: Add Backend Video Upload Endpoint

**Location:** `server/routes.ts` (add after existing exercise endpoints, around line 5620)

```typescript
// Upload video for exercise
app.post("/api/admin/exercises/upload-video", requireAdmin, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No video file provided" });
    }

    // Validate file type
    const validTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v', 'video/x-msvideo'];
    if (!validTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: "Invalid video format. Allowed: MP4, MOV, WEBM" });
    }

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'exercises/videos',
          format: 'mp4',
          transformation: [
            { quality: 'auto', fetch_format: 'auto' },
            { duration: '120' } // Limit to 2 minutes if needed
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    const videoUrl = (uploadResult as any).secure_url;
    const thumbnailUrl = (uploadResult as any).secure_url.replace(/\.[^.]+$/, '.jpg');

    res.json({
      videoUrl,
      thumbnailUrl,
      publicId: (uploadResult as any).public_id
    });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ message: "Failed to upload video" });
  }
});
```

#### Step 4: Update Exercise Schema (Make videoUrl Optional)

**Location:** `shared/schema.ts` (around line 212)

Change:
```typescript
videoUrl: text("video_url").notNull(), // OLD
```

To:
```typescript
videoUrl: text("video_url"), // NEW - optional
```

Run migration if using Drizzle migrations.

#### Step 5: Update Form Validation

**Location:** `admin-exercises.tsx` (around line 665, in handleSubmit)

Change validation from:
```typescript
if (!form.name || !form.description || !form.videoUrl) {
  toast({ title: "Missing fields", description: "Name, description, and video URL are required", variant: "destructive" });
  return;
}
```

To:
```typescript
if (!form.name || !form.description) {
  toast({ title: "Missing fields", description: "Name and description are required", variant: "destructive" });
  return;
}
// videoUrl is now optional
```

---

## Priority 2: Bulk Exercise Import

### Feature Overview
Allow admin to upload CSV/Excel file with multiple exercises at once.

### CSV Template Format

```csv
name,description,category,difficulty,videoUrl,defaultReps,defaultDurationSeconds,muscleGroups,coachNotes
Squats,Basic bodyweight squat,Lower Body,Beginner,https://youtube.com/...,12,0,"Quads,Glutes,Hamstrings",Keep knees over toes
Push-ups,Standard push-up,Upper Body,Beginner,https://youtube.com/...,10,0,"Chest,Triceps,Shoulders",Keep core tight
Plank,Core stability hold,Core,Intermediate,,0,60,"Core,Abs",Maintain straight line
```

### Implementation Steps

#### Step 1: Add Bulk Import Button

**Location:** `admin-exercises.tsx` (add next to "Create Exercise" button, around line 770)

```tsx
<div className="flex gap-2">
  <Button onClick={() => setShowDialog(true)} className="gap-2">
    <Plus className="w-4 h-4" />
    Create Exercise
  </Button>
  <Button variant="outline" onClick={() => setShowBulkImport(true)} className="gap-2">
    <Upload className="w-4 h-4" />
    Bulk Import
  </Button>
  <Button variant="outline" onClick={downloadTemplate} className="gap-2">
    <Download className="w-4 h-4" />
    Download Template
  </Button>
</div>
```

#### Step 2: Add Bulk Import Dialog Component

```tsx
{showBulkImport && (
  <Dialog open={showBulkImport} onOpenChange={setShowBulkImport}>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Bulk Import Exercises</DialogTitle>
        <DialogDescription>
          Upload a CSV file with exercise data. Download the template to see the required format.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            accept=".csv"
            onChange={handleBulkImportFile}
            className="hidden"
            id="bulk-import"
          />
          <label htmlFor="bulk-import" className="cursor-pointer">
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-sm font-medium">Click to upload CSV</p>
            <p className="text-xs text-gray-500">Must be a valid CSV file</p>
          </label>
        </div>

        {previewData.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Preview ({previewData.length} exercises)</h3>
            <div className="max-h-64 overflow-y-auto border rounded">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-2 py-1 text-left">Name</th>
                    <th className="px-2 py-1 text-left">Category</th>
                    <th className="px-2 py-1 text-left">Difficulty</th>
                    <th className="px-2 py-1 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-2 py-1">{row.name}</td>
                      <td className="px-2 py-1">{row.category}</td>
                      <td className="px-2 py-1">{row.difficulty}</td>
                      <td className="px-2 py-1">
                        {row.error ? (
                          <span className="text-red-600 text-xs">{row.error}</span>
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleBulkImportSubmit}
            disabled={previewData.length === 0 || importingBulk}
            className="flex-1"
          >
            {importingBulk ? "Importing..." : `Import ${previewData.filter(d => !d.error).length} Exercises`}
          </Button>
          <Button variant="outline" onClick={() => { setShowBulkImport(false); setPreviewData([]); }}>
            Cancel
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
)}
```

#### Step 3: Add CSV Parsing Logic

```tsx
const handleBulkImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target?.result as string;
    const lines = text.split('\n').filter(l => l.trim());

    // Skip header row
    const headers = lines[0].split(',').map(h => h.trim());
    const data = lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};

      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });

      // Validate required fields
      if (!row.name || !row.description || !row.category) {
        row.error = 'Missing required fields';
      }

      return row;
    });

    setPreviewData(data);
  };
  reader.readAsText(file);
};

const handleBulkImportSubmit = async () => {
  setImportingBulk(true);

  const validRows = previewData.filter(d => !d.error);

  try {
    const res = await apiRequest("POST", "/api/admin/exercises/bulk-import", {
      exercises: validRows
    });

    const result = await res.json();
    toast({
      title: "Import complete",
      description: `Successfully imported ${result.count} exercises`
    });

    refetchExercises();
    setShowBulkImport(false);
    setPreviewData([]);
  } catch (error) {
    toast({
      title: "Import failed",
      description: "Failed to import exercises",
      variant: "destructive"
    });
  } finally {
    setImportingBulk(false);
  }
};

const downloadTemplate = () => {
  const csv = `name,description,category,difficulty,videoUrl,defaultReps,defaultDurationSeconds,muscleGroups,coachNotes
Squats,Basic bodyweight squat,Lower Body,Beginner,https://youtube.com/watch?v=example,12,0,"Quads,Glutes,Hamstrings",Keep knees over toes
Push-ups,Standard push-up,Upper Body,Beginner,https://youtube.com/watch?v=example,10,0,"Chest,Triceps,Shoulders",Keep core tight`;

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'exercise-import-template.csv';
  a.click();
  window.URL.revokeObjectURL(url);
};
```

#### Step 4: Add Backend Bulk Import Endpoint

**Location:** `server/routes.ts` (after video upload endpoint)

```typescript
// Bulk import exercises
app.post("/api/admin/exercises/bulk-import", requireAdmin, async (req, res) => {
  try {
    const { exercises } = req.body;

    if (!Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({ message: "No exercises provided" });
    }

    let successCount = 0;
    const errors: string[] = [];

    for (const exercise of exercises) {
      try {
        // Generate slug from name
        const slug = exercise.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        // Parse muscle groups (comma-separated string to array)
        const muscleGroups = exercise.muscleGroups
          ? exercise.muscleGroups.split(',').map((m: string) => m.trim())
          : [];

        await storage.createExercise({
          name: exercise.name,
          slug,
          description: exercise.description,
          videoUrl: exercise.videoUrl || null,
          thumbnailUrl: exercise.thumbnailUrl || null,
          defaultReps: exercise.defaultReps || null,
          defaultDurationSeconds: exercise.defaultDurationSeconds ? parseInt(exercise.defaultDurationSeconds) : null,
          category: exercise.category,
          muscleGroups,
          difficulty: exercise.difficulty || 'Beginner',
          coachNotes: exercise.coachNotes || null,
          isActive: true,
        });

        successCount++;
      } catch (err: any) {
        errors.push(`${exercise.name}: ${err.message}`);
      }
    }

    res.json({
      count: successCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({ message: "Failed to import exercises" });
  }
});
```

---

## Testing Checklist

### Video Upload
- [ ] Upload MP4 file < 50MB
- [ ] See upload progress bar
- [ ] Video appears in Cloudinary
- [ ] Exercise saved with Cloudinary video URL
- [ ] Can still use YouTube URL instead
- [ ] Video plays in exercise preview

### Bulk Import
- [ ] Download template CSV
- [ ] Fill in 3-5 test exercises
- [ ] Upload CSV and see preview
- [ ] Invalid rows show errors
- [ ] Import succeeds for valid rows
- [ ] Exercises appear in library
- [ ] Can still create exercises manually

---

## Deployment

1. Commit changes
2. Push to GitHub
3. Pull in Replit
4. Restart server
5. Test video upload
6. Test bulk import

---

## Estimated Time
- Video Upload: 2-3 hours
- Bulk Import: 3-4 hours
- Total: 5-7 hours of development + testing
