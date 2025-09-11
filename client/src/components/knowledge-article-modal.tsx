import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Play, X } from "lucide-react";

interface KnowledgeArticleModalProps {
  article: {
    id: string;
    title: string;
    content: string;
    category: string;
    videoUrl?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function KnowledgeArticleModal({ 
  article, 
  isOpen, 
  onClose 
}: KnowledgeArticleModalProps) {
  const formatCategory = (category: string) => {
    return category.replace('-', ' ').split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-2xl">{article.title}</DialogTitle>
              <Badge variant="outline" className="rounded-none px-4 py-2">
                {formatCategory(article.category)}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              data-testid="button-close-article"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Video Section */}
          {article.videoUrl && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Video Content</h3>
              </div>
              
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="text-center text-white">
                    <Play className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">Click to play video</p>
                  </div>
                </div>
                <Button 
                  className="absolute inset-0 w-full h-full bg-transparent hover:bg-black/10 text-white"
                  variant="ghost"
                  onClick={() => {
                    // In a real implementation, this would open the video in a player
                    window.open(article.videoUrl, '_blank');
                  }}
                  data-testid="button-play-article-video"
                >
                  <span className="sr-only">Play video</span>
                </Button>
              </div>
            </div>
          )}

          {/* Article Content */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Article Content</h3>
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {article.content}
              </p>
            </div>
          </div>

          {/* Category-specific additional content */}
          {article.category === 'diastasis-recti' && (
            <div className="bg-pink-50 dark:bg-pink-950 p-4 rounded-lg border border-pink-200 dark:border-pink-800">
              <h4 className="font-semibold text-pink-900 dark:text-pink-100 mb-2">
                How to Check for Diastasis Recti
              </h4>
              <ol className="text-sm text-pink-800 dark:text-pink-200 space-y-1">
                <li>1. Lie on your back with knees bent</li>
                <li>2. Place fingers horizontally above your belly button</li>
                <li>3. Lift your head slightly off the ground</li>
                <li>4. Feel for a gap between the muscle bands</li>
                <li>5. Measure the width with your fingers</li>
              </ol>
            </div>
          )}

          {article.category === 'breathing' && (
            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                360-Degree Breathing Technique
              </h4>
              <ol className="text-sm text-green-800 dark:text-green-200 space-y-1">
                <li>1. Place one hand on chest, one on belly</li>
                <li>2. Breathe in slowly through your nose</li>
                <li>3. Feel your ribcage expand in all directions</li>
                <li>4. Exhale slowly, engaging your core</li>
                <li>5. Practice for 5-10 breaths</li>
              </ol>
            </div>
          )}

          {article.category === 'nutrition' && (
            <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
              <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                Key Nutrients for Recovery
              </h4>
              <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1">
                <li>• Protein: 1.2-1.6g per kg body weight</li>
                <li>• Vitamin C: Supports collagen synthesis</li>
                <li>• Omega-3s: Reduce inflammation</li>
                <li>• Iron: Especially important if breastfeeding</li>
                <li>• Water: 8-10 glasses per day minimum</li>
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}