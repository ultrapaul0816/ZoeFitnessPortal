import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Camera, 
  Plus,
  Trash2,
  Calendar,
  Image as ImageIcon,
  Loader2,
  X,
  Sparkles,
  Menu
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ProfileSettings from "@/components/profile-settings";
import ZoeEncouragement from "@/components/zoe-encouragement";
import zoeImagePath from "@assets/zoe_1_1764958643553.png";
import type { User, ProgressPhoto } from "@shared/schema";

export default function ProgressPhotos() {
  const [, navigate] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showAddPhotoDialog, setShowAddPhotoDialog] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [photoType, setPhotoType] = useState<string>("progress");
  const [notes, setNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  const { data: photos = [], isLoading } = useQuery<ProgressPhoto[]>({
    queryKey: ["/api/progress-photos", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const response = await fetch(`/api/progress-photos/${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch photos");
      return response.json();
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`/api/progress-photos/${user?.id}`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to upload photo");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress-photos", user?.id] });
      toast({ title: "Photo uploaded!", description: "Your progress photo has been saved." });
      handleCloseDialog();
    },
    onError: () => {
      toast({ title: "Upload failed", description: "Please try again.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (photoId: string) => {
      const response = await apiRequest("DELETE", `/api/progress-photos/${user?.id}/${photoId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress-photos", user?.id] });
      toast({ title: "Photo deleted", description: "Your photo has been removed." });
      setShowDeleteConfirm(null);
      setSelectedPhoto(null);
    },
    onError: () => {
      toast({ title: "Delete failed", description: "Please try again.", variant: "destructive" });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please select a photo under 10MB.", variant: "destructive" });
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user?.id) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("photo", selectedFile);
    formData.append("photoType", photoType);
    formData.append("notes", notes);
    try {
      await uploadMutation.mutateAsync(formData);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloseDialog = () => {
    setShowAddPhotoDialog(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setPhotoType("progress");
    setNotes("");
  };

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  const getPhotoTypeLabel = (type: string) => {
    switch (type) {
      case "start": return "Starting Point";
      case "finish": return "Finish";
      case "progress": return "Progress";
      default: return type;
    }
  };

  const getPhotoTypeBadgeColor = (type: string) => {
    switch (type) {
      case "start": return "bg-blue-100 text-blue-700 border-blue-200";
      case "finish": return "bg-green-100 text-green-700 border-green-200";
      case "progress": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const sortedPhotos = [...photos].sort((a, b) => {
    const dateA = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
    const dateB = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
    return dateB - dateA;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <div className="max-w-lg mx-auto px-4 py-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="text-gray-600 hover:text-pink-600 -ml-2"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back
          </Button>
          <Button
            variant="ghost"
            onClick={() => setShowProfileSettings(true)}
            className="text-gray-600 hover:text-pink-600"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">My Progress Photos</h1>
          <p className="text-gray-500 text-sm">Track your amazing transformation journey</p>
        </div>

        <ZoeEncouragement
          user={user}
          context="progress"
          variant="card"
        />

        <Button
          onClick={() => setShowAddPhotoDialog(true)}
          className="w-full mb-6 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-6"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Progress Photo
        </Button>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : sortedPhotos.length === 0 ? (
          <Card className="border-dashed border-2 border-pink-200 bg-pink-50/50">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-100 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-pink-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No photos yet</h3>
              <p className="text-gray-500 text-sm mb-4">
                Start capturing your progress! Take a "starting point" photo to see how far you've come.
              </p>
              <Button
                onClick={() => setShowAddPhotoDialog(true)}
                variant="outline"
                className="border-pink-300 text-pink-600 hover:bg-pink-50"
              >
                <Camera className="w-4 h-4 mr-2" />
                Take Your First Photo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span className="text-sm font-medium text-gray-600">
                {photos.length} photo{photos.length !== 1 ? "s" : ""} in your journey
              </span>
            </div>
            {sortedPhotos.map((photo) => (
              <Card 
                key={photo.id} 
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border-pink-100"
                onClick={() => setSelectedPhoto(photo)}
              >
                <div className="relative aspect-[4/3] bg-gray-100">
                  <img
                    src={photo.fileUrl}
                    alt={`Progress photo from ${formatDate(photo.uploadedAt)}`}
                    className="w-full h-full object-cover"
                  />
                  <Badge className={`absolute top-3 left-3 ${getPhotoTypeBadgeColor(photo.photoType)}`}>
                    {getPhotoTypeLabel(photo.photoType)}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Calendar className="w-4 h-4" />
                    {formatDate(photo.uploadedAt)}
                  </div>
                  {photo.notes && (
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">{photo.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={showAddPhotoDialog} onOpenChange={setShowAddPhotoDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Progress Photo</DialogTitle>
              <DialogDescription>
                Capture your journey with a new progress photo
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileSelect}
              />
              
              {previewUrl ? (
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    onClick={() => {
                      setPreviewUrl(null);
                      setSelectedFile(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full h-32 border-dashed border-2 border-pink-300 hover:border-pink-400 hover:bg-pink-50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-center">
                    <Camera className="w-8 h-8 mx-auto mb-2 text-pink-400" />
                    <span className="text-pink-600">Tap to select photo</span>
                  </div>
                </Button>
              )}

              <div className="space-y-2">
                <Label>Photo Type</Label>
                <Select value={photoType} onValueChange={setPhotoType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="start">Starting Point</SelectItem>
                    <SelectItem value="progress">Progress Update</SelectItem>
                    <SelectItem value="finish">Finish / After</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How are you feeling? Any observations about your progress?"
                  className="resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleCloseDialog} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Save Photo"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
            {selectedPhoto && (
              <>
                <div className="relative aspect-[4/3] bg-gray-100">
                  <img
                    src={selectedPhoto.fileUrl}
                    alt={`Progress photo from ${formatDate(selectedPhoto.uploadedAt)}`}
                    className="w-full h-full object-contain"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    onClick={() => setSelectedPhoto(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className={getPhotoTypeBadgeColor(selectedPhoto.photoType)}>
                      {getPhotoTypeLabel(selectedPhoto.photoType)}
                    </Badge>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Calendar className="w-4 h-4" />
                      {formatDate(selectedPhoto.uploadedAt)}
                    </div>
                  </div>
                  {selectedPhoto.notes && (
                    <p className="text-gray-600">{selectedPhoto.notes}</p>
                  )}
                  <Button
                    variant="outline"
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => setShowDeleteConfirm(selectedPhoto.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Photo
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete Photo?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. Are you sure you want to delete this photo?
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(null)} className="flex-1">
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => showDeleteConfirm && deleteMutation.mutate(showDeleteConfirm)}
                disabled={deleteMutation.isPending}
                className="flex-1"
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {showProfileSettings && (
          <ProfileSettings
            isOpen={showProfileSettings}
            onClose={() => setShowProfileSettings(false)}
            user={user}
            onUserUpdate={setUser}
          />
        )}
      </div>
    </div>
  );
}
