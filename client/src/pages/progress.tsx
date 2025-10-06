import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { User, ProgressPhoto } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Trash2, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      setLocation("/");
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
  }, [setLocation]);

  // Fetch existing progress photos
  const { data: photos = [], isLoading } = useQuery<ProgressPhoto[]>({
    queryKey: ["/api/progress-photos", user?.id],
    enabled: !!user?.id,
  });

  const startPhoto = photos.find((p) => p.photoType === "start");
  const finishPhoto = photos.find((p) => p.photoType === "finish");

  // Upload mutation
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

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (photoId: string) => {
      return apiRequest(`/api/progress-photos/${user!.id}/${photoId}`, {
        method: "DELETE",
      });
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "start" | "finish") => {
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

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "start") {
        setStartPhotoFile(file);
        setStartPreview(reader.result as string);
      } else {
        setFinishPhotoFile(file);
        setFinishPreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = (type: "start" | "finish") => {
    const file = type === "start" ? startPhotoFile : finishPhotoFile;
    if (!file) return;

    uploadMutation.mutate({ file, photoType: type });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Your Progress Journey
          </h1>
          <p className="text-lg text-gray-600">
            Track your transformation with before and after photos
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Start Photo Card */}
            <Card className="p-6 border-2 border-pink-200 bg-white shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Start Photo</h2>
                  <p className="text-sm text-gray-600">Your beginning</p>
                </div>
              </div>

              {startPhoto || startPreview ? (
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden aspect-[3/4] bg-gray-100">
                    <img
                      src={startPreview || startPhoto?.fileUrl}
                      alt="Start photo"
                      className="w-full h-full object-cover"
                      data-testid="img-start-photo"
                    />
                  </div>
                  {startPhoto && !startPreview && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMutation.mutate(startPhoto.id)}
                      disabled={deleteMutation.isPending}
                      className="w-full"
                      data-testid="button-delete-start"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete & Replace
                    </Button>
                  )}
                  {startPreview && (
                    <Button
                      onClick={() => handleUpload("start")}
                      disabled={uploadMutation.isPending}
                      className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
                      data-testid="button-upload-start"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadMutation.isPending ? "Uploading..." : "Upload Photo"}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-pink-300 rounded-lg p-12 text-center bg-pink-50">
                    <Camera className="w-16 h-16 text-pink-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Upload your starting photo</p>
                    <label htmlFor="start-photo" className="cursor-pointer">
                      <Button
                        type="button"
                        className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
                        onClick={() => document.getElementById("start-photo")?.click()}
                        data-testid="button-select-start"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Select Photo
                      </Button>
                    </label>
                    <input
                      id="start-photo"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, "start")}
                      data-testid="input-start-photo"
                    />
                  </div>
                </div>
              )}
            </Card>

            {/* Finish Photo Card */}
            <Card className="p-6 border-2 border-green-200 bg-white shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Finish Photo</h2>
                  <p className="text-sm text-gray-600">Your progress</p>
                </div>
              </div>

              {finishPhoto || finishPreview ? (
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden aspect-[3/4] bg-gray-100">
                    <img
                      src={finishPreview || finishPhoto?.fileUrl}
                      alt="Finish photo"
                      className="w-full h-full object-cover"
                      data-testid="img-finish-photo"
                    />
                  </div>
                  {finishPhoto && !finishPreview && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMutation.mutate(finishPhoto.id)}
                      disabled={deleteMutation.isPending}
                      className="w-full"
                      data-testid="button-delete-finish"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete & Replace
                    </Button>
                  )}
                  {finishPreview && (
                    <Button
                      onClick={() => handleUpload("finish")}
                      disabled={uploadMutation.isPending}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      data-testid="button-upload-finish"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadMutation.isPending ? "Uploading..." : "Upload Photo"}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-green-300 rounded-lg p-12 text-center bg-green-50">
                    <Camera className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Upload your progress photo</p>
                    <label htmlFor="finish-photo" className="cursor-pointer">
                      <Button
                        type="button"
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        onClick={() => document.getElementById("finish-photo")?.click()}
                        data-testid="button-select-finish"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Select Photo
                      </Button>
                    </label>
                    <input
                      id="finish-photo"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, "finish")}
                      data-testid="input-finish-photo"
                    />
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        <Card className="mt-8 p-6 bg-gradient-to-r from-pink-100 to-rose-100 border-2 border-pink-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Tips for Great Progress Photos</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-pink-600 mr-2">•</span>
              <span>Take photos in the same location and lighting for accurate comparison</span>
            </li>
            <li className="flex items-start">
              <span className="text-pink-600 mr-2">•</span>
              <span>Wear similar fitted clothing to show body changes clearly</span>
            </li>
            <li className="flex items-start">
              <span className="text-pink-600 mr-2">•</span>
              <span>Stand in the same pose (front, side, or back view)</span>
            </li>
            <li className="flex items-start">
              <span className="text-pink-600 mr-2">•</span>
              <span>Your photos are private and only visible to you</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
