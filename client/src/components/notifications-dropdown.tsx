import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";

interface NotificationsDropdownProps {
  notifications: any[];
  onClose: () => void;
}

export default function NotificationsDropdown({ notifications, onClose }: NotificationsDropdownProps) {
  const queryClient = useQueryClient();

  const markReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await apiRequest("POST", `/api/notifications/${notificationId}/read`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  return (
    <Card className="absolute top-12 right-0 w-80 shadow-xl z-40">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Notifications</h3>
      </div>
      
      <ScrollArea className="max-h-96">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No new notifications
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="p-4 border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => {
                if (!notification.isRead) {
                  markReadMutation.mutate(notification.id);
                }
              }}
              data-testid={`notification-${notification.id}`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  notification.isRead ? "bg-muted" : "bg-primary"
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {notification.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </ScrollArea>
      
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full text-sm text-primary hover:underline"
          onClick={onClose}
          data-testid="button-view-all-notifications"
        >
          View All Notifications
        </Button>
      </div>
    </Card>
  );
}
