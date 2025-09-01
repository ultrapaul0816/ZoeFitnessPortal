import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Terms } from "@shared/schema";

interface TermsModalProps {
  userId: string;
  onAccept: () => void;
  onCancel: () => void;
}

export default function TermsModal({ userId, onAccept, onCancel }: TermsModalProps) {
  const { toast } = useToast();

  const { data: terms } = useQuery<Terms>({
    queryKey: ["/api/terms"],
  });

  const acceptTermsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/accept-terms", { userId });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Terms Accepted",
        description: "Welcome to Stronger With Zoe!",
      });
      onAccept();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to accept terms. Please try again.",
      });
    },
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Terms & Conditions</h2>
          <p className="text-sm text-muted-foreground mt-1">Please review and accept to continue</p>
        </div>
        
        <ScrollArea className="max-h-96 p-6">
          {terms && (
            <div 
              className="prose prose-sm text-foreground"
              dangerouslySetInnerHTML={{ __html: terms.content }}
            />
          )}
        </ScrollArea>

        <div className="p-6 border-t border-border flex gap-3">
          <Button
            variant="secondary"
            onClick={onCancel}
            className="flex-1"
            data-testid="button-cancel-terms"
          >
            Cancel
          </Button>
          <Button
            onClick={() => acceptTermsMutation.mutate()}
            disabled={acceptTermsMutation.isPending}
            className="flex-1"
            data-testid="button-accept-terms"
          >
            {acceptTermsMutation.isPending ? "Accepting..." : "Accept & Continue"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
