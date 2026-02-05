import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { CommunityPost, User } from "@shared/schema";

interface CommunityModalProps {
  userId: string;
  onClose: () => void;
}

export default function CommunityModal({ userId, onClose }: CommunityModalProps) {
  const [currentChannel, setCurrentChannel] = useState("general");
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: postsData } = useQuery<{ posts: (CommunityPost & { user: Pick<User, 'firstName' | 'lastName'> })[] }>({
    queryKey: [`/api/community/posts?category=${currentChannel}`],
  });
  const posts = postsData?.posts || [];

  const postMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/community/posts", {
        userId,
        channel: currentChannel,
        content,
      });
      return response.json();
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: [`/api/community/posts?category=${currentChannel}`] });
      toast({
        title: "Message sent!",
        description: "Your message has been posted to the community.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      });
    },
  });

  const handleSendMessage = () => {
    if (message.trim()) {
      postMutation.mutate(message.trim());
    }
  };

  const channels = [
    { id: "general", name: "# General Chat" },
    { id: "workout-checkins", name: "# Workout Check-ins" },
    { id: "nutrition-tips", name: "# Nutrition Tips" },
    { id: "success-stories", name: "# Success Stories" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
      <Card className="w-full max-w-4xl h-[90vh] sm:h-[80vh] flex flex-col overflow-hidden">
        {/* Community Header */}
        <div className="p-6 border-b border-border">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-foreground">Community</h2>
              <p className="text-sm text-muted-foreground">Connect with fellow members</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              data-testid="button-close-community"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Mobile Channel Tabs */}
        <div className="sm:hidden border-b border-border p-2">
          <div className="flex overflow-x-auto gap-1">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setCurrentChannel(channel.id)}
                className={`flex-shrink-0 px-3 py-2 text-xs font-medium transition-colors ${
                  currentChannel === channel.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
                data-testid={`button-channel-mobile-${channel.id}`}
              >
                {channel.name.replace('# ', '')}
              </button>
            ))}
          </div>
        </div>

        {/* Community Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Channel List - Desktop only */}
          <div className="hidden sm:block w-64 bg-muted/30 border-r border-border p-4">
            <h3 className="font-semibold text-foreground mb-4">Channels</h3>
            <div className="space-y-2">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setCurrentChannel(channel.id)}
                  className={`w-full text-left p-3 transition-colors ${
                    currentChannel === channel.id
                      ? "bg-primary/20 text-primary font-medium"
                      : "hover:bg-muted text-muted-foreground"
                  }`}
                  data-testid={`button-channel-${channel.id}`}
                >
                  {channel.name}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area - Responsive */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <ScrollArea className="flex-1 p-3 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="community-message">
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-primary">
                          {post.user.firstName?.[0]}{post.user.lastName?.[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-foreground text-sm sm:text-base truncate">
                            {post.user.firstName} {post.user.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {post.createdAt ? new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                          </span>
                        </div>
                        <p className="text-foreground text-sm sm:text-base break-words">{post.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-3 sm:p-4 border-t border-border">
              <div className="flex space-x-2 sm:space-x-3">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="text-sm sm:text-base"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  data-testid="input-community-message"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || postMutation.isPending}
                  data-testid="button-send-message"
                  className="text-sm sm:text-base px-3 sm:px-4"
                >
                  {postMutation.isPending ? "Sending..." : "Send"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
