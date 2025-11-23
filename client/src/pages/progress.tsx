import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { User, ProgressPhoto } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, Trash2, Camera, Image as ImageIcon, Download, Info, Sparkles, TrendingUp, X, ZoomIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import examplePhotoImage from "@assets/WhatsApp Image 2025-10-06 at 21.30.02_1759768347069.jpeg";
import { compressImage } from "@/lib/imageCompression";
import { BeforeAfterSlider } from "@/components/ui/before-after-slider";
import { PhotoEditor } from "@/components/ui/photo-editor";

function getInitialUser(): User | null {
  if (typeof window !== 'undefined') {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  }
  return null;
}

export default function Progress() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(getInitialUser);
  const { toast } = useToast();

  const [startPhotoFile, setStartPhotoFile] = useState<File | null>(null);
  const [finishPhotoFile, setFinishPhotoFile] = useState<File | null>(null);
  const [startPreview, setStartPreview] = useState<string | null>(null);
  const [finishPreview, setFinishPreview] = useState<string | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; type: "start" | "finish" } | null>(null);
  
  // Photo editor states
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);
  const [rawImageForEditing, setRawImageForEditing] = useState<string | null>(null);
  const [editingPhotoType, setEditingPhotoType] = useState<"start" | "finish" | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      setLocation("/");
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
  }, [setLocation]);

  const { data: photos = [], isLoading } = useQuery<ProgressPhoto[]>({
    queryKey: ["/api/progress-photos", user?.id],
    enabled: !!user?.id,
  });

  const startPhoto = photos.find((p) => p.photoType === "start");
  const finishPhoto = photos.find((p) => p.photoType === "finish");

  const uploadMutation = useMutation({
    mutationFn: async ({ file, photoType }: { file: File; photoType: "start" | "finish" }) => {
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("photoType", photoType);

      const response = await fetch(`/api/progress-photos/${user!.id}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload photo");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress-photos", user?.id] });
      toast({
        title: "Success",
        description: "Your photo has been uploaded!",
      });
      setStartPhotoFile(null);
      setFinishPhotoFile(null);
      setStartPreview(null);
      setFinishPreview(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (photoId: string) => {
      const response = await fetch(`/api/progress-photos/${user!.id}/${photoId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete photo");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress-photos", user?.id] });
      toast({
        title: "Success",
        description: "Photo deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete photo",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: "start" | "finish") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Convert to data URL and open photo editor
    const reader = new FileReader();
    reader.onloadend = () => {
      setRawImageForEditing(reader.result as string);
      setEditingPhotoType(type);
      setShowPhotoEditor(true);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoEditorSave = async (editedImageBlob: Blob) => {
    if (!editingPhotoType) return;

    try {
      toast({
        title: "Processing image...",
        description: "Compressing and preparing your photo",
      });

      // Convert blob to file
      const editedFile = new File([editedImageBlob], "edited-photo.jpg", { type: "image/jpeg" });
      
      // Compress the edited image
      const compressedFile = await compressImage(editedFile, 0.8, 1920, 0.85);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        if (editingPhotoType === "start") {
          setStartPhotoFile(compressedFile);
          setStartPreview(reader.result as string);
        } else {
          setFinishPhotoFile(compressedFile);
          setFinishPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(compressedFile);

      setShowPhotoEditor(false);
      setRawImageForEditing(null);
      setEditingPhotoType(null);

      toast({
        title: "Image ready!",
        description: "Your edited photo is ready to upload",
      });
    } catch (error) {
      console.error("Image processing error:", error);
      toast({
        title: "Error",
        description: "Failed to process image",
        variant: "destructive",
      });
    }
  };

  const handlePhotoEditorCancel = () => {
    setShowPhotoEditor(false);
    setRawImageForEditing(null);
    setEditingPhotoType(null);
  };

  const handleUpload = (type: "start" | "finish") => {
    const file = type === "start" ? startPhotoFile : finishPhotoFile;
    if (!file) return;

    uploadMutation.mutate({ file, photoType: type });
  };

  const downloadProgressTracker = async () => {
    try {
      const jsPDF = await import('jspdf');
      const doc = new jsPDF.jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Add title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('PROGRESS TRACKER', 148.5, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Track your healing journey, week by week. Use this table to note your progress, symptoms, and small wins.', 148.5, 28, { align: 'center' });

      // Table data
      const tableData = [
        ['WEEK', 'WEEK 1', 'WEEK 2', 'WEEK 3', 'WEEK 4', 'WEEK 5', 'WEEK 6'],
        ['DR GAP MEASUREMENT\n(Width/Depth at Navel, 2" Above, 2" Below)', '', '', '', '', '', ''],
        ['CORE CONNECTION\n(Scale 1-5)', '', '', '', '', '', ''],
        ['PELVIC FLOOR SYMPTOMS\n(Leaking, heaviness, bulging)', '', '', '', '', '', ''],
        ['POSTURE/BACK DISCOMFORT\n(Scale 1-5)', '', '', '', '', '', ''],
        ['ENERGY LEVEL\n(Scale 1-5)', '', '', '', '', '', ''],
        ['NUMBER OF WORKOUTS\nCompleted', '', '', '', '', '', ''],
        ['NOTES OR WINS\nFor the week', '', '', '', '', '', '']
      ];

      // Draw table manually
      const startX = 10;
      const startY = 40;
      const rowHeight = 15;
      const colWidths = [60, 36, 36, 36, 36, 36, 36];

      // Draw rows
      for (let i = 0; i < tableData.length; i++) {
        const y = startY + (i * rowHeight);
        let currentX = startX;

        for (let j = 0; j < tableData[i].length; j++) {
          const width = colWidths[j];
          
          // Fill header row with colors
          if (i === 0) {
            if (j === 0) {
              doc.setFillColor(200, 200, 200); // Gray for "WEEK"
            } else {
              doc.setFillColor(242, 3, 139); // Pink for week columns
            }
            doc.rect(currentX, y, width, rowHeight, 'F');
          } else if (j === 0) {
            doc.setFillColor(230, 230, 230); // Light gray for labels
            doc.rect(currentX, y, width, rowHeight, 'F');
          }

          // Draw border
          doc.setDrawColor(0);
          doc.rect(currentX, y, width, rowHeight);

          // Add text
          if (tableData[i][j]) {
            doc.setTextColor(i === 0 && j > 0 ? 255 : 0); // White text for pink headers
            doc.setFontSize(i === 0 ? 9 : 8);
            doc.setFont('helvetica', i === 0 ? 'bold' : 'normal');
            
            const lines = tableData[i][j].split('\n');
            const lineHeight = 4;
            const textStartY = y + (rowHeight / 2) - ((lines.length - 1) * lineHeight / 2) + 2;
            
            lines.forEach((line, lineIndex) => {
              doc.text(line, currentX + 2, textStartY + (lineIndex * lineHeight), { maxWidth: width - 4 });
            });
          }

          currentX += width;
        }
      }

      // Footer
      doc.setTextColor(0);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text('Printing Tip: Print in landscape mode for best results. Fill out by hand weekly.', startX, startY + (tableData.length * rowHeight) + 10);

      doc.save('Progress-Tracker-Postpartum-Recovery.pdf');
      
      toast({
        title: "Download Started",
        description: "Your Progress Tracker PDF has been downloaded!",
      });
    } catch (error) {
      console.error('PDF Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-4 md:space-y-6 text-left px-2 md:px-0">
      {/* Full-Size Photo Preview Dialog */}
      <Dialog open={!!previewPhoto} onOpenChange={() => setPreviewPhoto(null)}>
        <DialogContent className="max-w-4xl w-full p-2 md:p-6">
          <DialogHeader>
            <DialogTitle className="text-center text-lg md:text-xl font-bold">
              {previewPhoto?.type === "start" ? "📷 Start Photo - Before Program" : "✨ Finish Photo - After 6 Weeks"}
            </DialogTitle>
          </DialogHeader>
          <div className="relative">
            <img
              src={previewPhoto?.url}
              alt={previewPhoto?.type === "start" ? "Start photo full view" : "Finish photo full view"}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
          </div>
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPreviewPhoto(null)}
              className="w-full md:w-auto"
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo Editor Modal */}
      {showPhotoEditor && rawImageForEditing && (
        <PhotoEditor
          imageUrl={rawImageForEditing}
          onSave={handlePhotoEditorSave}
          onCancel={handlePhotoEditorCancel}
          isOpen={showPhotoEditor}
        />
      )}

      {/* Header Section - Matching other tabs design */}
      <div className="text-left mb-4 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold mb-2 md:mb-4 bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
          Progress Tracker
        </h1>
        <p className="text-xs md:text-sm font-medium text-gray-600 border-l-4 border-pink-400 pl-3 md:pl-4 bg-gradient-to-r from-pink-50 to-transparent py-2">
          Document your transformation journey with photos and weekly progress tracking
        </p>
      </div>

      {/* Guidance Section */}
      <Card className="bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 border-2 border-pink-200 p-4 md:p-6">
        <div className="flex items-start gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center flex-shrink-0">
            <Info className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">When to Take Your Photos</h3>
            <div className="space-y-2 md:space-y-3 text-xs md:text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <span className="text-pink-600 font-bold mt-0.5">📷</span>
                <div>
                  <strong className="text-pink-600">Start Photo:</strong> Take this <strong>before beginning the 6-week program</strong>. This captures your starting point and helps you see how far you've come.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">✨</span>
                <div>
                  <strong className="text-green-600">Finish Photo:</strong> Take this <strong>after completing the 6-week program</strong>. This celebrates your progress, strength gains, and transformation!
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Photo Upload Section */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-3"></div>
          <p className="text-gray-600 font-medium">Loading your photos...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4 md:gap-8">
          {/* Start Photo Card */}
          <Card className="p-4 md:p-6 border-2 border-pink-200 bg-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center flex-shrink-0">
                <Camera className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg md:text-2xl font-bold text-gray-900">Start Photo</h2>
                <p className="text-xs md:text-sm text-gray-600">Your beginning (Day 1)</p>
              </div>
            </div>

            {startPhoto || startPreview ? (
              <div className="space-y-4">
                <div 
                  className="relative rounded-lg overflow-hidden aspect-[3/4] bg-gray-100 border-2 border-pink-200 cursor-pointer hover:border-pink-400 transition-all group"
                  onClick={() => startPhoto && setPreviewPhoto({ url: startPhoto.fileUrl, type: "start" })}
                >
                  <img
                    src={startPreview || startPhoto?.fileUrl}
                    alt="Start photo"
                    className="w-full h-full object-cover"
                    data-testid="img-start-photo"
                  />
                  {startPhoto && !startPreview && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-3">
                        <ZoomIn className="w-6 h-6 text-pink-600" />
                      </div>
                    </div>
                  )}
                  {uploadMutation.isPending && startPreview && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-3"></div>
                        <p className="text-white font-semibold">Uploading...</p>
                      </div>
                    </div>
                  )}
                </div>
                {startPhoto && !startPreview && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMutation.mutate(startPhoto.id)}
                    disabled={deleteMutation.isPending}
                    className="w-full border-pink-300 text-pink-600 hover:bg-pink-50"
                    data-testid="button-delete-start"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {deleteMutation.isPending ? "Deleting..." : "Delete & Replace"}
                  </Button>
                )}
                {startPreview && (
                  <Button
                    onClick={() => handleUpload("start")}
                    disabled={uploadMutation.isPending}
                    className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
                    data-testid="button-upload-start"
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Photo
                      </>
                    )}
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                <div className="border-2 border-dashed border-pink-300 rounded-lg p-4 md:p-8 text-center bg-gradient-to-b from-pink-50 to-white">
                  <Camera className="w-12 h-12 md:w-16 md:h-16 text-pink-400 mx-auto mb-3 md:mb-4" />
                  <p className="text-sm md:text-base text-gray-700 font-medium mb-2 md:mb-4">Upload your starting photo</p>
                  <p className="text-xs text-gray-500 mb-4 md:mb-6">Take this before starting the program</p>
                  <div className="flex flex-col gap-2 md:gap-3 justify-center">
                    <label htmlFor="start-photo-camera" className="w-full">
                      <Button
                        type="button"
                        className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 w-full text-sm md:text-base py-5 md:py-2"
                        onClick={() => {
                          const input = document.getElementById("start-photo-camera") as HTMLInputElement;
                          if (input) input.click();
                        }}
                        data-testid="button-camera-start"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Take Photo
                      </Button>
                    </label>
                    <input
                      id="start-photo-camera"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, "start")}
                      data-testid="input-camera-start"
                    />
                    
                    <label htmlFor="start-photo-gallery" className="w-full">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-pink-300 text-pink-600 hover:bg-pink-50 w-full text-sm md:text-base py-5 md:py-2"
                        onClick={() => {
                          const input = document.getElementById("start-photo-gallery") as HTMLInputElement;
                          if (input) input.click();
                        }}
                        data-testid="button-gallery-start"
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Choose from Gallery
                      </Button>
                    </label>
                    <input
                      id="start-photo-gallery"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, "start")}
                      data-testid="input-gallery-start"
                    />
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Finish Photo Card */}
          <Card className="p-4 md:p-6 border-2 border-green-200 bg-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg md:text-2xl font-bold text-gray-900">Finish Photo</h2>
                <p className="text-xs md:text-sm text-gray-600">Your progress (Week 6+)</p>
              </div>
            </div>

            {finishPhoto || finishPreview ? (
              <div className="space-y-4">
                <div 
                  className="relative rounded-lg overflow-hidden aspect-[3/4] bg-gray-100 border-2 border-green-200 cursor-pointer hover:border-green-400 transition-all group"
                  onClick={() => finishPhoto && setPreviewPhoto({ url: finishPhoto.fileUrl, type: "finish" })}
                >
                  <img
                    src={finishPreview || finishPhoto?.fileUrl}
                    alt="Finish photo"
                    className="w-full h-full object-cover"
                    data-testid="img-finish-photo"
                  />
                  {finishPhoto && !finishPreview && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-3">
                        <ZoomIn className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  )}
                  {uploadMutation.isPending && finishPreview && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-3"></div>
                        <p className="text-white font-semibold">Uploading...</p>
                      </div>
                    </div>
                  )}
                </div>
                {finishPhoto && !finishPreview && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMutation.mutate(finishPhoto.id)}
                    disabled={deleteMutation.isPending}
                    className="w-full border-green-300 text-green-600 hover:bg-green-50"
                    data-testid="button-delete-finish"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {deleteMutation.isPending ? "Deleting..." : "Delete & Replace"}
                  </Button>
                )}
                {finishPreview && (
                  <Button
                    onClick={() => handleUpload("finish")}
                    disabled={uploadMutation.isPending}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    data-testid="button-upload-finish"
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Photo
                      </>
                    )}
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                <div className="border-2 border-dashed border-green-300 rounded-lg p-4 md:p-8 text-center bg-gradient-to-b from-green-50 to-white">
                  <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-green-400 mx-auto mb-3 md:mb-4" />
                  <p className="text-sm md:text-base text-gray-700 font-medium mb-2 md:mb-4">Upload your progress photo</p>
                  <p className="text-xs text-gray-500 mb-4 md:mb-6">Take this after completing the program</p>
                  <div className="flex flex-col gap-2 md:gap-3 justify-center">
                    <label htmlFor="finish-photo-camera" className="w-full">
                      <Button
                        type="button"
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 w-full text-sm md:text-base py-5 md:py-2"
                        onClick={() => {
                          const input = document.getElementById("finish-photo-camera") as HTMLInputElement;
                          if (input) input.click();
                        }}
                        data-testid="button-camera-finish"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Take Photo
                      </Button>
                    </label>
                    <input
                      id="finish-photo-camera"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, "finish")}
                      data-testid="input-camera-finish"
                    />
                    
                    <label htmlFor="finish-photo-gallery" className="w-full">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-green-300 text-green-600 hover:bg-green-50 w-full text-sm md:text-base py-5 md:py-2"
                        onClick={() => {
                          const input = document.getElementById("finish-photo-gallery") as HTMLInputElement;
                          if (input) input.click();
                        }}
                        data-testid="button-gallery-finish"
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Choose from Gallery
                      </Button>
                    </label>
                    <input
                      id="finish-photo-gallery"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, "finish")}
                      data-testid="input-gallery-finish"
                    />
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Interactive Before/After Slider - Only show if both photos uploaded */}
      {startPhoto && finishPhoto && (
        <Card className="p-4 md:p-6 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-2 border-purple-200">
          <div className="text-center mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-2">
              ✨ Your Transformation Journey ✨
            </h2>
            <p className="text-xs md:text-sm text-gray-700 mb-4">
              Drag the slider to reveal your amazing progress!
            </p>
          </div>

          {/* Interactive Slider */}
          <div className="max-w-2xl mx-auto mb-6 md:mb-8">
            <BeforeAfterSlider
              beforeImage={startPhoto.fileUrl}
              afterImage={finishPhoto.fileUrl}
              beforeLabel="Start"
              afterLabel="Finish"
              className="shadow-xl"
            />
            <p className="text-center text-xs text-gray-500 mt-3 italic">
              💡 Tip: Drag the slider left and right to see your transformation
            </p>
          </div>

          {/* Divider */}
          <div className="relative my-6 md:my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-purple-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 text-gray-500 font-medium">
                Or view side by side
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            {/* Start Photo Comparison */}
            <div>
              <div 
                className="relative rounded-lg overflow-hidden aspect-[3/4] bg-gray-100 border-2 border-pink-300 mb-3 cursor-pointer hover:border-pink-500 transition-all group"
                onClick={() => setPreviewPhoto({ url: startPhoto.fileUrl, type: "start" })}
              >
                <img
                  src={startPhoto.fileUrl}
                  alt="Start - Before program"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-pink-600 text-white px-3 py-1 rounded-full text-xs md:text-sm font-semibold">
                  📷 Start
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-3">
                    <ZoomIn className="w-6 h-6 text-pink-600" />
                  </div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700 mb-2">Before Program</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteMutation.mutate(startPhoto.id)}
                  disabled={deleteMutation.isPending}
                  className="border-pink-300 text-pink-600 hover:bg-pink-50 text-xs"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  {deleteMutation.isPending ? "Deleting..." : "Replace"}
                </Button>
              </div>
            </div>

            {/* Finish Photo Comparison */}
            <div>
              <div 
                className="relative rounded-lg overflow-hidden aspect-[3/4] bg-gray-100 border-2 border-green-300 mb-3 cursor-pointer hover:border-green-500 transition-all group"
                onClick={() => setPreviewPhoto({ url: finishPhoto.fileUrl, type: "finish" })}
              >
                <img
                  src={finishPhoto.fileUrl}
                  alt="Finish - After program"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-green-600 text-white px-3 py-1 rounded-full text-xs md:text-sm font-semibold">
                  ✨ Finish
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-3">
                    <ZoomIn className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700 mb-2">After 6 Weeks</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteMutation.mutate(finishPhoto.id)}
                  disabled={deleteMutation.isPending}
                  className="border-green-300 text-green-600 hover:bg-green-50 text-xs"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  {deleteMutation.isPending ? "Deleting..." : "Replace"}
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-4 md:mt-6 bg-white/50 border border-purple-200 rounded-lg p-3 md:p-4 text-center">
            <p className="text-xs md:text-sm text-gray-600 italic">
              🎉 Look at how far you've come! Your dedication and hard work are truly inspiring. Keep celebrating your progress!
            </p>
          </div>
        </Card>
      )}

      {/* Example Photo & Tips Section */}
      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        {/* Example Image */}
        <Card className="p-4 md:p-6 border-2 border-pink-300 bg-white">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-pink-600" />
            <h3 className="text-base md:text-lg font-bold text-gray-900">Example Photo Angle</h3>
          </div>
          <div className="relative rounded-lg overflow-hidden mb-3 md:mb-4 bg-gray-100">
            <img 
              src={examplePhotoImage} 
              alt="Example progress photo showing proper angle" 
              className="w-full h-auto object-contain"
              data-testid="img-example-photo"
            />
          </div>
          <p className="text-xs md:text-sm text-gray-600 text-center italic">
            Side-angle view showing body posture and core area clearly
          </p>
        </Card>

        {/* Photography Tips */}
        <Card className="p-4 md:p-6 border-2 border-pink-300 bg-gradient-to-br from-pink-50 to-white">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-pink-600" />
            <h3 className="text-base md:text-lg font-bold text-gray-900">Photography Tips</h3>
          </div>
          <ul className="space-y-2 md:space-y-3 text-xs md:text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-pink-600 font-bold">1.</span>
              <span><strong>Same Location & Lighting:</strong> Use the same spot with consistent lighting each time for accurate comparison</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-600 font-bold">2.</span>
              <span><strong>Similar Clothing:</strong> Wear similar fitted clothing (sports bra, leggings) to clearly show body changes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-600 font-bold">3.</span>
              <span><strong>Side-Angle Mirror Selfie:</strong> Take a side-profile photo using a mirror to clearly show your core and posture changes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-600 font-bold">4.</span>
              <span><strong>Consistent Distance & Angle:</strong> Stand at the same distance from the mirror each time, capturing from chest to upper thighs</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-600 font-bold">5.</span>
              <span><strong>Privacy Assured:</strong> Your photos are completely private and only visible to you—no one else can see them</span>
            </li>
          </ul>
        </Card>
      </div>

      {/* Downloadable Progress Tracker */}
      <Card className="p-4 md:p-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200">
        <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Weekly Progress Tracker</h3>
            <p className="text-xs md:text-sm text-gray-700">
              Track your healing journey week by week. Download this printable PDF to note your progress, symptoms, and small wins—because every step matters.
            </p>
          </div>
        </div>
        
        <Button
          onClick={downloadProgressTracker}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all w-full text-sm md:text-base py-5 md:py-2 mb-4 md:mb-6"
          data-testid="button-download-tracker"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Printable Tracker (PDF)
        </Button>

        {/* Progress Tracker Table */}
        <div id="progress-tracker-table" className="bg-white p-3 md:p-6 rounded-lg border-2" style={{borderColor: '#9aafdc'}}>
          <div className="text-center mb-4 md:mb-6">
            <h2 className="text-lg md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-2 md:mb-3">
              ✨ PROGRESS TRACKER ✨
            </h2>
            <p className="text-gray-700 text-xs md:text-sm">
              Track your healing journey, week by week. Use this table to note your progress, symptoms, and small wins—because every step matters.
            </p>
          </div>
          
          <div className="overflow-x-auto -mx-3 md:mx-0">
            <table className="w-full border-collapse border border-gray-400 min-w-[600px]">
              <thead>
                <tr>
                  <th className="border border-gray-400 bg-gray-200 p-2 md:p-3 text-center font-bold text-gray-700 text-xs md:text-sm" style={{width: '20%'}}>
                    WEEK
                  </th>
                  <th className="border border-gray-400 bg-pink-100 p-2 md:p-3 text-center font-bold text-pink-700 text-xs md:text-sm">
                    WEEK 1
                  </th>
                  <th className="border border-gray-400 bg-pink-100 p-2 md:p-3 text-center font-bold text-pink-700 text-xs md:text-sm">
                    WEEK 2
                  </th>
                  <th className="border border-gray-400 bg-pink-100 p-2 md:p-3 text-center font-bold text-pink-700 text-xs md:text-sm">
                    WEEK 3
                  </th>
                  <th className="border border-gray-400 bg-pink-100 p-2 md:p-3 text-center font-bold text-pink-700 text-xs md:text-sm">
                    WEEK 4
                  </th>
                  <th className="border border-gray-400 bg-pink-100 p-2 md:p-3 text-center font-bold text-pink-700 text-xs md:text-sm">
                    WEEK 5
                  </th>
                  <th className="border border-gray-400 bg-pink-100 p-2 md:p-3 text-center font-bold text-pink-700 text-xs md:text-sm">
                    WEEK 6
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-400 bg-gray-100 p-2 md:p-3 font-semibold text-gray-700 text-xs md:text-sm">
                    DR GAP MEASUREMENT<br/>
                    <span className="text-[10px] md:text-xs font-normal">(Width/Depth at Navel, 2" Above, 2" Below)</span>
                  </td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-12 md:h-16"></td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-12 md:h-16"></td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-12 md:h-16"></td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-12 md:h-16"></td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-12 md:h-16"></td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-12 md:h-16"></td>
                </tr>
                <tr>
                  <td className="border border-gray-400 bg-gray-100 p-2 md:p-3 font-semibold text-gray-700 text-xs md:text-sm">
                    CORE CONNECTION<br/>
                    <span className="text-[10px] md:text-xs font-normal">(Scale 1-5)</span>
                  </td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-12 md:h-16"></td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-12 md:h-16"></td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-12 md:h-16"></td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-12 md:h-16"></td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-12 md:h-16"></td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-12 md:h-16"></td>
                </tr>
                <tr>
                  <td className="border border-gray-400 bg-gray-100 p-2 md:p-3 font-semibold text-gray-700 text-xs md:text-sm">
                    PELVIC FLOOR SYMPTOMS<br/>
                    <span className="text-[10px] md:text-xs font-normal">(Leaking, heaviness, bulging)</span>
                  </td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-12 md:h-16"></td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-12 md:h-16"></td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-12 md:h-16"></td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-12 md:h-16"></td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-12 md:h-16"></td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-12 md:h-16"></td>
                </tr>
                <tr>
                  <td className="border border-gray-400 bg-gray-100 p-2 md:p-3 font-semibold text-gray-700 text-xs md:text-sm">
                    POSTURE/BACK DISCOMFORT<br/>
                    <span className="text-[10px] md:text-xs font-normal">(Scale 1-5)</span>
                  </td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-12 md:h-16"></td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-12 md:h-16"></td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-12 md:h-16"></td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-12 md:h-16"></td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-12 md:h-16"></td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-12 md:h-16"></td>
                </tr>
                <tr>
                  <td className="border border-gray-400 bg-gray-100 p-2 md:p-3 font-semibold text-gray-700 text-xs md:text-sm">
                    ENERGY LEVEL<br/>
                    <span className="text-[10px] md:text-xs font-normal">(Scale 1-5)</span>
                  </td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-12 md:h-16"></td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-12 md:h-16"></td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-12 md:h-16"></td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-12 md:h-16"></td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-12 md:h-16"></td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-12 md:h-16"></td>
                </tr>
                <tr>
                  <td className="border border-gray-400 bg-gray-100 p-2 md:p-3 font-semibold text-gray-700 text-xs md:text-sm">
                    NUMBER OF WORKOUTS<br/>
                    <span className="text-[10px] md:text-xs font-normal">Completed</span>
                  </td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-12 md:h-16"></td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-12 md:h-16"></td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-12 md:h-16"></td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-12 md:h-16"></td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-12 md:h-16"></td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-12 md:h-16"></td>
                </tr>
                <tr>
                  <td className="border border-gray-400 bg-gray-100 p-2 md:p-3 font-semibold text-gray-700 text-xs md:text-sm">
                    NOTES OR WINS<br/>
                    <span className="text-[10px] md:text-xs font-normal">For the week</span>
                  </td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-16 md:h-24"></td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-16 md:h-24"></td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-16 md:h-24"></td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-16 md:h-24"></td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-16 md:h-24"></td>
                  <td className="border border-gray-400 p-2 md:p-3 bg-white h-16 md:h-24"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Printing Tip */}
          <div className="mt-4 md:mt-6 bg-blue-50 border-l-4 border-blue-400 p-3 md:p-4 rounded-r-lg">
            <div className="flex items-start gap-2 md:gap-3">
              <span className="text-xl md:text-2xl">🖨️</span>
              <div>
                <p className="font-semibold text-gray-800 mb-1 text-sm md:text-base">Printing Tip:</p>
                <p className="text-xs md:text-sm text-gray-700">
                  Print this tracker in <strong>landscape mode</strong> for best results. Fill it out by hand weekly to document your healing journey.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
