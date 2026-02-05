import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreVertical, 
  Crown, 
  Camera, 
  Image as ImageIcon,
  X,
  Send,
  Trash2,
  Flag,
  Filter,
  ArrowLeft,
  Plus,
  Loader2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { User as UserType, CommunityPost, PostComment } from "@shared/schema";
import { compressImage } from "@/lib/imageCompression";
import { PhotoEditor } from "@/components/ui/photo-editor";
import { ImageCarousel } from "@/components/ui/image-carousel";
import BottomNav from "@/components/bottom-nav";

// Category icons and labels
const CATEGORIES = {
  wins: { label: "#Wins", color: "bg-green-100 text-green-700" },
  realtalk: { label: "#RealTalk", color: "bg-blue-100 text-blue-700" },
  transformations: { label: "#Transformations", color: "bg-purple-100 text-purple-700" },
  workoutselfies: { label: "#WorkoutSelfies", color: "bg-pink-100 text-pink-700" },
  momlife: { label: "#MomLife", color: "bg-yellow-100 text-yellow-700" },
  general: { label: "#General", color: "bg-gray-100 text-gray-700" },
} as const;

type CategoryKey = keyof typeof CATEGORIES;

type EnrichedPost = CommunityPost & {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profilePictureUrl: string | null;
    profilePictureThumbnailUrl: string | null;
  };
  likeCount: number;
  commentCount: number;
  isLikedByUser?: boolean;
  likes: Array<{ userId: string; userName: string }>;
};

type CommentWithUser = PostComment & {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profilePictureUrl: string | null;
    profilePictureThumbnailUrl: string | null;
  };
};

export default function Community() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<UserType | null>(null);
  const { toast } = useToast();

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | "all">("all");
  const [selectedWeek, setSelectedWeek] = useState<number | "all">("all");
  const [sortBy, setSortBy] = useState<"newest" | "mostLiked">("newest");

  // Modal states
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showComments, setShowComments] = useState<string | null>(null);
  const [showLikers, setShowLikers] = useState<string | null>(null);
  const [showSensitiveContent, setShowSensitiveContent] = useState<Set<string>>(new Set());

  // Create post form states
  const [postContent, setPostContent] = useState("");
  const [postCategory, setPostCategory] = useState<CategoryKey>("general");
  const [postImages, setPostImages] = useState<File[]>([]);
  const [postImagePreviews, setPostImagePreviews] = useState<string[]>([]);
  const [isSensitive, setIsSensitive] = useState(false);
  const [postWeek, setPostWeek] = useState<number | null>(null);
  
  // Photo editor states
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);
  const [rawImageForEditing, setRawImageForEditing] = useState<string | null>(null);
  const [editingImageIndex, setEditingImageIndex] = useState<number>(-1);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);

  // Comment input states
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      setLocation("/");
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // Check URL params for auto-opening post modal
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'post') {
      setShowCreatePost(true);
      // Clear the URL param without reloading
      window.history.replaceState({}, '', '/community');
    }
  }, [setLocation]);

  // Pagination state
  const [displayedPosts, setDisplayedPosts] = useState<EnrichedPost[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const POSTS_PER_PAGE = 15;

  // Fetch posts with filters and pagination
  const { data: postsData, isLoading } = useQuery<{ posts: EnrichedPost[]; total: number; hasMore: boolean }>({
    queryKey: [
      "/api/community/posts",
      selectedCategory,
      selectedWeek,
      sortBy
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (selectedWeek !== "all") params.append("weekNumber", String(selectedWeek));
      params.append("sortBy", sortBy);
      params.append("limit", String(POSTS_PER_PAGE));
      params.append("offset", "0");
      
      const url = `/api/community/posts?${params.toString()}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
    enabled: !!user,
    staleTime: 30 * 1000,
  });

  // Update displayed posts when initial data changes
  useEffect(() => {
    if (postsData) {
      setDisplayedPosts(postsData.posts);
      setHasMore(postsData.hasMore);
    }
  }, [postsData]);

  // Load more posts function
  const loadMorePosts = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (selectedWeek !== "all") params.append("weekNumber", String(selectedWeek));
      params.append("sortBy", sortBy);
      params.append("limit", String(POSTS_PER_PAGE));
      params.append("offset", String(displayedPosts.length));
      
      const url = `/api/community/posts?${params.toString()}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch more posts");
      const data = await res.json();
      
      setDisplayedPosts(prev => [...prev, ...data.posts]);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Compatibility: posts array for existing code
  const posts = displayedPosts;

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create post");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      toast({
        title: "Post created!",
        description: "Your post has been shared with the community.",
      });
      handleCloseCreatePost();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
      if (isLiked) {
        await apiRequest("DELETE", `/api/community/posts/${postId}/like`, { userId: user?.id });
      } else {
        await apiRequest("POST", `/api/community/posts/${postId}/like`, { userId: user?.id });
      }
    },
    onMutate: async ({ postId, isLiked }) => {
      const previousPosts = [...displayedPosts];
      
      setDisplayedPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              isLikedByUser: !isLiked,
              likeCount: isLiked ? post.likeCount - 1 : post.likeCount + 1
            }
          : post
      ));

      return { previousPosts };
    },
    onError: (err, variables, context) => {
      if (context?.previousPosts) {
        setDisplayedPosts(context.previousPosts);
      }
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      await apiRequest("DELETE", `/api/community/posts/${postId}`, { userId: user?.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      toast({
        title: "Post deleted",
        description: "Your post has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    },
  });

  // Report post mutation
  const reportPostMutation = useMutation({
    mutationFn: async (postId: string) => {
      await apiRequest("POST", `/api/community/posts/${postId}/report`, {});
    },
    onSuccess: () => {
      toast({
        title: "Post reported",
        description: "Thank you for helping keep our community safe.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to report post",
        variant: "destructive",
      });
    },
  });

  // Create comment mutation with optimistic update
  const createCommentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      await apiRequest("POST", `/api/community/posts/${postId}/comments`, {
        userId: user?.id,
        content,
      });
    },
    onMutate: async ({ postId }) => {
      const previousPosts = [...displayedPosts];
      
      setDisplayedPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, commentCount: post.commentCount + 1 }
          : post
      ));

      return { previousPosts };
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts", postId, "comments"] });
      setCommentInputs(prev => ({ ...prev, [postId]: "" }));
      toast({
        title: "Comment posted!",
      });
    },
    onError: (err, variables, context) => {
      if (context?.previousPosts) {
        setDisplayedPosts(context.previousPosts);
      }
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      await apiRequest("DELETE", `/api/community/comments/${commentId}`, { userId: user?.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      toast({
        title: "Comment deleted",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    },
  });

  // Centralized queue processor using useEffect
  useEffect(() => {
    // Only process if there are pending files, no editor is open, and not currently processing
    if (pendingFiles.length > 0 && !showPhotoEditor && !isProcessingQueue) {
      processNextPendingFile(pendingFiles);
    }
  }, [pendingFiles, showPhotoEditor, isProcessingQueue]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check total count including pending files (max 4 images total)
    const currentTotal = postImages.length + pendingFiles.length + files.length;
    if (currentTotal > 4) {
      toast({
        title: "Too many images",
        description: `You can upload a maximum of 4 images per post (currently have ${postImages.length} added, ${pendingFiles.length} pending)`,
        variant: "destructive",
      });
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Validate each file
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 10MB limit`,
          variant: "destructive",
        });
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
    }

    // Reset file input immediately so same files can be re-selected later
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Append to pending queue - useEffect will automatically process
    setPendingFiles(prev => [...prev, ...files]);
  };

  const processNextPendingFile = (filesToProcess: File[]) => {
    if (filesToProcess.length === 0) {
      setIsProcessingQueue(false);
      return;
    }

    // Set processing guard to prevent useEffect re-triggering
    setIsProcessingQueue(true);

    // Read the first file (DON'T dequeue yet - dequeue happens after save/cancel)
    const file = filesToProcess[0];

    // Open the editor for this file
    const reader = new FileReader();
    reader.onloadend = () => {
      setRawImageForEditing(reader.result as string);
      setEditingImageIndex(-1); // -1 means new image being added
      setShowPhotoEditor(true);
      setIsProcessingQueue(false); // Clear guard once editor is open
    };
    reader.onerror = () => {
      // Handle FileReader errors
      console.error("FileReader error");
      setIsProcessingQueue(false);
      setPendingFiles(prev => prev.slice(1)); // Skip this file and continue
      toast({
        title: "Error",
        description: "Failed to load image. Skipping to next file.",
        variant: "destructive",
      });
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoEditorSave = async (editedImageBlob: Blob) => {
    try {
      toast({
        title: "Processing image...",
        description: "Compressing and preparing your photo",
      });

      // Convert blob to file
      const editedFile = new File([editedImageBlob], `edited-photo-${Date.now()}.jpg`, { type: "image/jpeg" });
      
      // Compress the edited image
      const compressedFile = await compressImage(editedFile, 0.8, 1920, 0.85);
      
      // Add to images array
      let newImagesCount = 0;
      setPostImages(prev => {
        const updated = [...prev, compressedFile];
        newImagesCount = updated.length;
        return updated;
      });
      
      // Generate preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(compressedFile);

      // Close editor and reset processing state
      setShowPhotoEditor(false);
      setRawImageForEditing(null);
      setEditingImageIndex(-1);
      setIsProcessingQueue(false); // Clear processing flag to allow next file

      // Dequeue the file AFTER successful save - this triggers useEffect to process next
      setPendingFiles(prev => {
        const remainingFiles = prev.slice(1);
        
        // Show toast
        setTimeout(() => {
          if (remainingFiles.length > 0) {
            toast({
              title: "Image added!",
              description: `${newImagesCount}/4 added. ${remainingFiles.length} more to edit.`,
            });
          } else {
            toast({
              title: "All images added!",
              description: `${newImagesCount}/4 images ready to post`,
            });
          }
        }, 100);
        
        return remainingFiles;
      });
    } catch (error) {
      console.error("Image processing error:", error);
      toast({
        title: "Error",
        description: "Failed to process image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePhotoEditorCancel = () => {
    setShowPhotoEditor(false);
    setRawImageForEditing(null);
    setEditingImageIndex(-1);
    setIsProcessingQueue(false); // Clear processing flag
    
    // Dequeue the current file and clear remaining queue on cancel
    setPendingFiles([]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCloseCreatePost = () => {
    setShowCreatePost(false);
    setPostContent("");
    setPostCategory("general");
    setPostImages([]);
    setPostImagePreviews([]);
    setIsSensitive(false);
    setPostWeek(null);
    setPendingFiles([]);
  };

  const handleCreatePost = () => {
    if (!postContent.trim()) {
      toast({
        title: "Content required",
        description: "Please add some text to your post",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("userId", user!.id);
    formData.append("content", postContent);
    formData.append("category", postCategory);
    
    // Append all images with field name "images" (matches backend upload.array("images", 4))
    postImages.forEach((image) => {
      formData.append("images", image);
    });
    
    if (postWeek) {
      formData.append("weekNumber", postWeek.toString());
    }
    formData.append("isSensitiveContent", isSensitive.toString());

    createPostMutation.mutate(formData);
  };

  const handleLikePost = (postId: string, isLiked: boolean) => {
    likePostMutation.mutate({ postId, isLiked });
  };

  const handleShareToInstagram = async (post: EnrichedPost) => {
    try {
      const shareText = post.content 
        ? `${post.content.slice(0, 100)}${post.content.length > 100 ? '...' : ''}\n\n💪 Shared via Studio Bloom #StudioBloom #PostpartumFitness`
        : `Check out this post from ${post.user.firstName}! 💪\n\n#StudioBloom #PostpartumFitness`;
      
      if (navigator.share) {
        const shareData: ShareData = {
          title: `${post.user.firstName}'s Post`,
          text: shareText,
        };
        
        if (post.imageUrls && post.imageUrls.length > 0) {
          try {
            const response = await fetch(post.imageUrls[0]);
            const blob = await response.blob();
            const file = new File([blob], 'post-image.jpg', { type: 'image/jpeg' });
            
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              shareData.files = [file];
            }
          } catch (imgError) {
            console.log('Could not include image in share');
          }
        }
        
        await navigator.share(shareData);
        toast({
          title: "Shared!",
          description: "Post shared successfully",
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Copied to clipboard!",
          description: "Share text copied. Paste it to share!",
        });
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        await navigator.clipboard.writeText(
          post.content || `Check out this post from ${post.user.firstName}! 💪 #StudioBloom`
        );
        toast({
          title: "Copied to clipboard!",
          description: "Share text copied. Paste it to share!",
        });
      }
    }
  };

  const toggleSensitiveContent = (postId: string) => {
    setShowSensitiveContent(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (selectedWeek !== "all") count++;
    return count;
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedWeek("all");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/dashboard")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900">Community</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowCreatePost(true)}
            className="text-primary"
            data-testid="button-create-post"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto">
        {/* Filters */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 space-y-3">
          {/* Sort and Week filter */}
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as "newest" | "mostLiked")}>
              <SelectTrigger className="flex-1" data-testid="select-sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="mostLiked">Most Liked</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedWeek.toString()} onValueChange={(v) => setSelectedWeek(v === "all" ? "all" : parseInt(v))}>
              <SelectTrigger className="flex-1" data-testid="select-week">
                <SelectValue placeholder="All Weeks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Weeks</SelectItem>
                {[1, 2, 3, 4, 5, 6].map(week => (
                  <SelectItem key={week} value={week.toString()}>Week {week}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
              className="shrink-0"
              data-testid="filter-all"
            >
              All
            </Button>
            {(Object.keys(CATEGORIES) as CategoryKey[]).map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="shrink-0"
                data-testid={`filter-${cat}`}
              >
                {CATEGORIES[cat].label}
              </Button>
            ))}
          </div>

          {/* Clear filters */}
          {getActiveFilterCount() > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="w-full text-pink-600"
              data-testid="button-clear-filters"
            >
              Clear {getActiveFilterCount()} filter{getActiveFilterCount() > 1 ? "s" : ""}
            </Button>
          )}
        </div>

        {/* Posts Feed */}
        <div className="divide-y divide-gray-200">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-64 w-full rounded-lg" />
                <Skeleton className="h-16 w-full" />
              </Card>
            ))
          ) : posts.length === 0 ? (
            <div className="text-center py-16 px-4">
              <MessageCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-4">Be the first to share with the community!</p>
              <Button onClick={() => setShowCreatePost(true)} data-testid="button-create-first-post">
                Create Post
              </Button>
            </div>
          ) : (
            <>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={user}
                  onLike={() => handleLikePost(post.id, post.isLikedByUser || false)}
                  onDelete={() => deletePostMutation.mutate(post.id)}
                  onReport={() => reportPostMutation.mutate(post.id)}
                  onShare={() => handleShareToInstagram(post)}
                  onShowComments={() => setShowComments(post.id)}
                  onShowLikers={() => setShowLikers(post.id)}
                  showSensitive={showSensitiveContent.has(post.id)}
                  onToggleSensitive={() => toggleSensitiveContent(post.id)}
                />
              ))}
              {hasMore && (
                <div className="flex justify-center py-6">
                  <Button
                    variant="outline"
                    onClick={loadMorePosts}
                    disabled={isLoadingMore}
                    className="px-8"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More Posts"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col" data-testid="dialog-create-post">
          <DialogHeader>
            <DialogTitle>Create Post</DialogTitle>
            <DialogDescription>
              Share your wins, ask questions, or celebrate progress!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            {/* Posting prompts - show only when content is empty */}
            {postContent.length === 0 && postImagePreviews.length === 0 && (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-xs text-gray-500 font-medium mb-2">Ideas to get you started:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { text: "I completed my workout today!", emoji: "💪" },
                    { text: "Feeling proud of my progress...", emoji: "🎉" },
                    { text: "Any tips for staying motivated?", emoji: "💡" },
                    { text: "My energy levels have improved!", emoji: "⚡" },
                  ].map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => setPostContent(prompt.text)}
                      className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1.5 hover:bg-rose-50 hover:border-rose-200 transition-colors text-gray-600 hover:text-rose-600"
                    >
                      {prompt.emoji} {prompt.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Image previews (grid layout for multiple images) */}
            {postImagePreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {postImagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={preview} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-32 object-cover rounded-lg"
                      data-testid={`image-preview-${index}`}
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => {
                        setPostImages(prev => prev.filter((_, i) => i !== index));
                        setPostImagePreviews(prev => prev.filter((_, i) => i !== index));
                      }}
                      data-testid={`button-remove-image-${index}`}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Image upload button */}
            {postImagePreviews.length < 4 && (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="button-upload-image"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {postImagePreviews.length === 0 
                    ? "Add Photos (up to 4)" 
                    : `Add More (${postImagePreviews.length}/4)`}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple={postImagePreviews.length === 0}
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </div>
            )}

            {/* Content */}
            <div className="space-y-2">
              <Label>What's on your mind?</Label>
              <Textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value.slice(0, 500))}
                placeholder="Share your thoughts..."
                rows={4}
                data-testid="textarea-post-content"
              />
              <div className="text-xs text-gray-500 text-right">
                {postContent.length}/500
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={postCategory} onValueChange={(v) => setPostCategory(v as CategoryKey)}>
                <SelectTrigger data-testid="select-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CATEGORIES) as CategoryKey[]).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {CATEGORIES[cat].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Week */}
            <div className="space-y-2">
              <Label>Week (optional)</Label>
              <Select value={postWeek?.toString() || "none"} onValueChange={(v) => setPostWeek(v === "none" ? null : parseInt(v))}>
                <SelectTrigger data-testid="select-post-week">
                  <SelectValue placeholder="Select week" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No week</SelectItem>
                  {[1, 2, 3, 4, 5, 6].map(week => (
                    <SelectItem key={week} value={week.toString()}>Week {week}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sensitive content */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sensitive"
                checked={isSensitive}
                onCheckedChange={(checked) => setIsSensitive(checked as boolean)}
                data-testid="checkbox-sensitive"
              />
              <Label htmlFor="sensitive" className="text-sm font-normal cursor-pointer">
                Mark as sensitive (blurs by default)
              </Label>
            </div>

            {/* Submit */}
            <Button
              onClick={handleCreatePost}
              disabled={createPostMutation.isPending}
              className="w-full"
              data-testid="button-submit-post"
            >
              {createPostMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Comments Modal */}
      {showComments && (
        <CommentsModal
          postId={showComments}
          currentUser={user}
          onClose={() => setShowComments(null)}
          commentInput={commentInputs[showComments] || ""}
          onCommentInputChange={(value) => setCommentInputs(prev => ({ ...prev, [showComments]: value }))}
          onSubmitComment={(content) => createCommentMutation.mutate({ postId: showComments, content })}
          onDeleteComment={(commentId) => deleteCommentMutation.mutate(commentId)}
          isSubmitting={createCommentMutation.isPending}
        />
      )}

      {/* Likers Modal */}
      {showLikers && (
        <LikersModal
          postId={showLikers}
          onClose={() => setShowLikers(null)}
        />
      )}

      {/* Photo Editor Modal */}
      {showPhotoEditor && rawImageForEditing && (
        <PhotoEditor
          imageUrl={rawImageForEditing}
          onSave={handlePhotoEditorSave}
          onCancel={handlePhotoEditorCancel}
          isOpen={showPhotoEditor}
        />
      )}

      {/* Floating Action Button (mobile) - positioned above bottom nav */}
      <Button
        onClick={() => setShowCreatePost(true)}
        className="fixed bottom-20 right-6 rounded-full w-14 h-14 shadow-lg md:hidden z-30"
        data-testid="button-fab-create"
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Bottom Navigation */}
      <BottomNav />
      
      {/* Spacer for bottom nav */}
      <div className="h-20" />
    </div>
  );
}

// Post Card Component
function PostCard({
  post,
  currentUser,
  onLike,
  onDelete,
  onReport,
  onShare,
  onShowComments,
  onShowLikers,
  showSensitive,
  onToggleSensitive,
}: {
  post: EnrichedPost;
  currentUser: UserType;
  onLike: () => void;
  onDelete: () => void;
  onReport: () => void;
  onShare: () => void;
  onShowComments: () => void;
  onShowLikers: () => void;
  showSensitive: boolean;
  onToggleSensitive: () => void;
}) {
  const isOwnPost = post.userId === currentUser.id;
  const category = CATEGORIES[post.category as CategoryKey] || CATEGORIES.general;

  return (
    <Card className="bg-white overflow-hidden" data-testid={`post-${post.id}`}>
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.user.profilePictureThumbnailUrl || post.user.profilePictureUrl || undefined} />
              <AvatarFallback className="bg-pink-100 text-pink-700">
                {post.user.firstName[0]}{post.user.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900">
                  {post.user.firstName} {post.user.lastName}
                </p>
                {post.weekNumber && (
                  <Badge variant="secondary" className="text-xs">
                    Week {post.weekNumber}
                  </Badge>
                )}
                {post.featured && (
                  <Crown className="w-4 h-4 text-yellow-500" data-testid="icon-featured" />
                )}
              </div>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(post.createdAt!), { addSuffix: true })}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="button-post-menu">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwnPost && (
                <DropdownMenuItem onClick={onDelete} className="text-red-600" data-testid="menu-delete-post">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Post
                </DropdownMenuItem>
              )}
              {!isOwnPost && (
                <DropdownMenuItem onClick={onReport} data-testid="menu-report-post">
                  <Flag className="w-4 h-4 mr-2" />
                  Report Post
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Category */}
        <Badge className={category.color} data-testid="badge-category">
          {category.label}
        </Badge>

        {/* Image(s) */}
        {post.imageUrls && post.imageUrls.length > 0 && (
          <div className="relative">
            {post.isSensitiveContent && !showSensitive ? (
              <div 
                onClick={onToggleSensitive}
                className="relative h-64 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                data-testid="sensitive-content-overlay"
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-white rounded-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-700 font-medium">Sensitive Content</p>
                  <p className="text-sm text-gray-500">Tap to view</p>
                </div>
              </div>
            ) : (
              <ImageCarousel 
                images={post.imageUrls} 
                alt="Post" 
                className="rounded-lg max-h-96"
              />
            )}
          </div>
        )}

        {/* Content */}
        <p className="text-gray-800 whitespace-pre-wrap" data-testid="post-content">
          {post.content}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={onLike}
            className="flex items-center gap-1 group transition-transform active:scale-95"
            data-testid="button-like"
          >
            <Heart 
              className={`w-6 h-6 transition-all ${
                post.isLikedByUser 
                  ? "fill-pink-500 text-pink-500 scale-110" 
                  : "text-gray-600 group-hover:text-pink-500"
              }`}
            />
            {post.likeCount > 0 && (
              <span 
                className="text-sm text-gray-600 cursor-pointer hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  onShowLikers();
                }}
                data-testid="text-like-count"
              >
                {post.likeCount}
              </span>
            )}
          </button>

          <button
            onClick={onShowComments}
            className="flex items-center gap-1 group"
            data-testid="button-comments"
          >
            <MessageCircle className="w-6 h-6 text-gray-600 group-hover:text-pink-500 transition-colors" />
            {post.commentCount > 0 && (
              <span className="text-sm text-gray-600" data-testid="text-comment-count">
                {post.commentCount}
              </span>
            )}
          </button>

          <button
            onClick={onShare}
            className="flex items-center gap-1 group ml-auto"
            data-testid="button-share-instagram"
          >
            <Share2 className="w-6 h-6 text-gray-600 group-hover:text-pink-500 transition-colors" />
            <span className="text-sm text-gray-600 group-hover:text-pink-500">
              Share to Instagram
            </span>
          </button>
        </div>
      </div>
    </Card>
  );
}

// Comments Modal Component
function CommentsModal({
  postId,
  currentUser,
  onClose,
  commentInput,
  onCommentInputChange,
  onSubmitComment,
  onDeleteComment,
  isSubmitting,
}: {
  postId: string;
  currentUser: UserType;
  onClose: () => void;
  commentInput: string;
  onCommentInputChange: (value: string) => void;
  onSubmitComment: (content: string) => void;
  onDeleteComment: (commentId: string) => void;
  isSubmitting: boolean;
}) {
  const { data: comments = [] } = useQuery<CommentWithUser[]>({
    queryKey: ["/api/community/posts", postId, "comments"],
  });

  const handleSubmit = () => {
    if (commentInput.trim()) {
      onSubmitComment(commentInput);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col" data-testid="dialog-comments">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {comments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No comments yet. Be the first!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3" data-testid={`comment-${comment.id}`}>
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarImage src={comment.user.profilePictureThumbnailUrl || comment.user.profilePictureUrl || undefined} />
                  <AvatarFallback className="bg-pink-100 text-pink-700 text-xs">
                    {comment.user.firstName[0]}{comment.user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-lg px-3 py-2">
                    <p className="font-semibold text-sm text-gray-900">
                      {comment.user.firstName} {comment.user.lastName}
                    </p>
                    <p className="text-sm text-gray-800">{comment.content}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-1 px-3">
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(comment.createdAt!), { addSuffix: true })}
                    </span>
                    {comment.userId === currentUser.id && (
                      <button
                        onClick={() => onDeleteComment(comment.id)}
                        className="text-xs text-red-600 hover:underline"
                        data-testid="button-delete-comment"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Textarea
            value={commentInput}
            onChange={(e) => onCommentInputChange(e.target.value.slice(0, 500))}
            placeholder="Add a comment..."
            rows={2}
            data-testid="textarea-comment"
          />
          <Button
            onClick={handleSubmit}
            disabled={!commentInput.trim() || isSubmitting}
            size="icon"
            className="shrink-0"
            data-testid="button-submit-comment"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Likers Modal Component
function LikersModal({
  postId,
  onClose,
}: {
  postId: string;
  onClose: () => void;
}) {
  const { data: likes = [] } = useQuery<Array<{ userId: string; userName: string }>>({
    queryKey: ["/api/community/posts", postId, "likes"],
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-likers">
        <DialogHeader>
          <DialogTitle>Liked by</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {likes.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No likes yet</p>
          ) : (
            likes.map((like) => (
              <div key={like.userId} className="flex items-center gap-3" data-testid={`liker-${like.userId}`}>
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-pink-100 text-pink-700">
                    {like.userName.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <p className="font-medium text-gray-900">{like.userName}</p>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
