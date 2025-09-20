import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Lock, Star, Calendar, Target, Dumbbell } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PremiumProgramCardProps {
  program: any;
  userId: string;
}

export default function PremiumProgramCard({ program, userId }: PremiumProgramCardProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user has access to this premium program
  const { data: accessData, isLoading: accessLoading } = useQuery({
    queryKey: ["/api/program-access", userId, program.id],
    enabled: !!userId && !!program.id,
  });

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/program-purchases", {
        userId,
        programId: program.id,
        amount: program.price,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Purchase Successful!",
        description: "You now have access to this premium program.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/program-access", userId, program.id] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Purchase Failed",
        description: "Unable to process your purchase. Please try again.",
      });
    },
  });

  const hasAccess = (accessData as any)?.hasAccess;

  const handleCardClick = () => {
    if (hasAccess) {
      if (program.name === "Your Postpartum Strength Recovery Program") {
        navigate("/heal-your-core");
      }
    }
  };

  const handlePurchaseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    purchaseMutation.mutate();
  };

  return (
    <Card 
      className={`overflow-hidden shadow-sm transition-all duration-200 ${
        hasAccess ? 'hover:shadow-md cursor-pointer' : 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50'
      }`}
      onClick={handleCardClick}
      data-testid={`card-program-${program.id}`}
    >
      <div className="relative">
        <img
          src={program.imageUrl}
          alt={`${program.name} program`}
          className="w-full h-48 object-cover"
        />
        {!hasAccess && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center text-white">
              <Lock className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Premium Program</p>
            </div>
          </div>
        )}
        <Badge className="absolute top-3 left-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 text-xs font-semibold shadow-lg border-0">
          {program.level}
        </Badge>
        {hasAccess && (
          <Badge className="absolute top-3 right-3 bg-green-600 hover:bg-green-700">
            <Star className="w-3 h-3 mr-1" />
            Premium Access
          </Badge>
        )}
      </div>

      <CardContent className="p-6">
        <div className="mb-3">
          <h3 className="font-semibold text-lg">{program.name}</h3>
        </div>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {program.description}
        </p>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{program.duration}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Target className="w-4 h-4 text-primary" />
            <span>{program.level} level</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Dumbbell className="w-4 h-4 text-primary" />
            <span>{program.equipment}</span>
          </div>
        </div>

        {accessLoading ? (
          <Button disabled className="w-full">
            Loading...
          </Button>
        ) : hasAccess ? (
          <div className="space-y-3">
            <Button 
              className="w-full" 
              data-testid={`button-start-${program.id}`}
            >
              <Star className="w-4 h-4 mr-2" />
              Start Program
            </Button>
            <p className="text-xs text-center text-green-600 font-medium">
              ✓ You have full access to this program
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary mb-1">
                ₹{(program.price / 100).toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">One-time purchase</p>
            </div>
            <Button
              className="w-full"
              onClick={handlePurchaseClick}
              disabled={purchaseMutation.isPending}
              data-testid={`button-purchase-${program.id}`}
            >
              <Heart className="w-4 h-4 mr-2" />
              {purchaseMutation.isPending ? "Processing..." : "Get Access"}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Join hundreds of mothers on their recovery journey
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}