import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { User, LogOut, Camera } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { UpdateUserProfile, User as UserType } from "@shared/schema";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onUserUpdate: (user: UserType) => void;
}

export default function ProfileModal({ isOpen, onClose, user, onUserUpdate }: ProfileModalProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<UpdateUserProfile>({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone || "",
    profilePictureUrl: user.profilePictureUrl || "",
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateUserProfile): Promise<UserType> => {
      const response = await fetch(`/api/users/${user.id}/profile`, {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
      
      return response.json();
    },
    onSuccess: (updatedUser: UserType) => {
      onUserUpdate(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    setLocation("/");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Remove empty fields from submission
    const cleanedData = Object.entries(formData).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== "") {
        acc[key as keyof UpdateUserProfile] = value;
      }
      return acc;
    }, {} as UpdateUserProfile);
    
    updateProfileMutation.mutate(cleanedData);
  };

  const handleInputChange = (field: keyof UpdateUserProfile, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage 
                  src={formData.profilePictureUrl || ""} 
                  alt={`${user.firstName} ${user.lastName}`}
                />
                <AvatarFallback className="text-lg">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div className="w-full space-y-2">
              <Label htmlFor="profilePictureUrl">Profile Picture URL</Label>
              <Input
                id="profilePictureUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.profilePictureUrl || ""}
                onChange={(e) => handleInputChange("profilePictureUrl", e.target.value)}
                data-testid="input-profile-picture"
              />
            </div>
          </div>

          <Separator />

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName || ""}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  data-testid="input-first-name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName || ""}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  data-testid="input-last-name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                data-testid="input-email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Optional"
                value={formData.phone || ""}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                data-testid="input-phone"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="flex-1"
                data-testid="button-save-profile"
              >
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                data-testid="button-cancel-profile"
              >
                Cancel
              </Button>
            </div>
          </form>

          <Separator />

          {/* Logout Section */}
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="w-full"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}