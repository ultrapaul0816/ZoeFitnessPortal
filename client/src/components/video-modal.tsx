import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, X } from "lucide-react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
}

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    
    // Handle YouTube playlist URLs
    if (url.includes("youtube.com/playlist") || urlObj.searchParams.get("list")) {
      const playlistId = urlObj.searchParams.get("list");
      if (playlistId) {
        return `https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1&rel=0`;
      }
    }
    
    // Handle single video URLs
    let videoId = "";
    
    if (url.includes("youtube.com/watch")) {
      videoId = urlObj.searchParams.get("v") || "";
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split(/[?&]/)[0] || "";
    } else if (url.includes("youtube.com/embed/")) {
      videoId = url.split("youtube.com/embed/")[1]?.split(/[?&]/)[0] || "";
    }
    
    if (!videoId) return null;
    
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  } catch {
    return null;
  }
}

export function VideoModal({ isOpen, onClose, videoUrl, title }: VideoModalProps) {
  const embedUrl = getYouTubeEmbedUrl(videoUrl);
  
  if (!embedUrl) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl w-[95vw] p-0 overflow-hidden bg-black border-0">
        <DialogHeader className="p-3 bg-gradient-to-r from-pink-500 to-purple-500">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-sm font-medium truncate pr-4">
              {title || "Exercise Video"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="aspect-video w-full">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title || "Exercise Video"}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface VideoLinkProps {
  url: string;
  title: string;
  className?: string;
  children?: React.ReactNode;
}

export function VideoLink({ url, title, className, children }: VideoLinkProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };
  
  return (
    <>
      <button
        onClick={handleClick}
        className={className || "text-blue-600 hover:text-blue-800 underline font-semibold cursor-pointer text-sm text-left"}
      >
        {children || title}
      </button>
      <VideoModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        videoUrl={url}
        title={title}
      />
    </>
  );
}

interface PlayAllButtonProps {
  url: string;
  colorClass?: string;
}

export function PlayAllButton({ url, colorClass = "bg-pink-500 hover:bg-pink-600" }: PlayAllButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className={`${colorClass} text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg`}
      >
        <Play className="w-4 h-4" />
        PLAY ALL
      </Button>
      <VideoModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        videoUrl={url}
        title="Workout Playlist"
      />
    </>
  );
}
