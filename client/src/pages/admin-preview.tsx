import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Smartphone, Tablet, Monitor, RotateCcw, ExternalLink, Eye } from "lucide-react";
import type { User } from "@shared/schema";

type DeviceType = "mobile" | "tablet" | "desktop";

const deviceSizes: Record<DeviceType, { width: number; height: number; label: string }> = {
  mobile: { width: 375, height: 812, label: "iPhone (375x812)" },
  tablet: { width: 768, height: 1024, label: "iPad (768x1024)" },
  desktop: { width: 1280, height: 800, label: "Desktop (1280x800)" },
};

const pages = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/todays-workout", label: "Today's Workout" },
  { path: "/program", label: "Program" },
  { path: "/my-courses", label: "My Courses" },
  { path: "/community", label: "Community" },
  { path: "/profile", label: "Profile" },
  { path: "/login", label: "Login Page" },
];

export default function AdminPreview() {
  const { isLoading: authLoading, isAdmin } = useAdminAuth();
  const [, setLocation] = useLocation();
  const [device, setDevice] = useState<DeviceType>("mobile");
  const [currentPage, setCurrentPage] = useState("/dashboard");
  const [selectedUser, setSelectedUser] = useState<string>("none");
  const [iframeKey, setIframeKey] = useState(0);

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: isAdmin,
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const deviceConfig = deviceSizes[device];
  const previewUrl = currentPage;

  const refreshPreview = () => {
    setIframeKey(prev => prev + 1);
  };

  const openInNewTab = () => {
    window.open(currentPage, "_blank");
  };

  return (
    <AdminLayout
      activeTab="preview"
      onTabChange={() => setLocation("/admin")}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Preview as User</h1>
            <p className="text-gray-500 mt-1">See how the app looks on different devices</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={refreshPreview}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={openInNewTab}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in Tab
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="w-5 h-5 text-pink-500" />
              Preview Controls
            </CardTitle>
            <CardDescription>
              Select a device size and page to preview the user experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Device</label>
                <div className="flex gap-2">
                  <Button
                    variant={device === "mobile" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDevice("mobile")}
                    className={device === "mobile" ? "bg-pink-500 hover:bg-pink-600" : ""}
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    Mobile
                  </Button>
                  <Button
                    variant={device === "tablet" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDevice("tablet")}
                    className={device === "tablet" ? "bg-pink-500 hover:bg-pink-600" : ""}
                  >
                    <Tablet className="w-4 h-4 mr-2" />
                    Tablet
                  </Button>
                  <Button
                    variant={device === "desktop" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDevice("desktop")}
                    className={device === "desktop" ? "bg-pink-500 hover:bg-pink-600" : ""}
                  >
                    <Monitor className="w-4 h-4 mr-2" />
                    Desktop
                  </Button>
                </div>
              </div>

              <div className="space-y-2 min-w-[200px]">
                <label className="text-sm font-medium text-gray-700">Page</label>
                <Select value={currentPage} onValueChange={setCurrentPage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a page" />
                  </SelectTrigger>
                  <SelectContent>
                    {pages.map((page) => (
                      <SelectItem key={page.path} value={page.path}>
                        {page.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 min-w-[250px]">
                <label className="text-sm font-medium text-gray-700">View as User (Coming Soon)</label>
                <Select value={selectedUser} onValueChange={setSelectedUser} disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user to impersonate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Current Session</SelectItem>
                    {users.slice(0, 20).map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
              <Badge variant="outline">{deviceConfig.label}</Badge>
              <span>•</span>
              <span>Previewing: {pages.find(p => p.path === currentPage)?.label}</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <div 
            className="relative bg-gray-900 rounded-[3rem] p-3 shadow-2xl"
            style={{
              width: device === "mobile" ? deviceConfig.width + 24 : "auto",
            }}
          >
            {device === "mobile" && (
              <>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-10" />
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-700 rounded-full z-20" />
              </>
            )}
            
            <div 
              className="bg-white rounded-[2.5rem] overflow-hidden"
              style={{
                width: deviceConfig.width,
                height: device === "desktop" ? deviceConfig.height : Math.min(deviceConfig.height, 700),
              }}
            >
              <iframe
                key={iframeKey}
                src={previewUrl}
                className="w-full h-full border-0"
                title="App Preview"
                style={{
                  width: deviceConfig.width,
                  height: deviceConfig.height,
                }}
              />
            </div>

            {device === "mobile" && (
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-600 rounded-full" />
            )}
          </div>
        </div>

        <Card className="bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                <Eye className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Preview Tips</h3>
                <ul className="mt-2 text-sm text-gray-600 space-y-1">
                  <li>• Mobile preview shows how users on phones will see the app</li>
                  <li>• Use "Open in Tab" to test interactions in full browser</li>
                  <li>• Check all key pages to ensure consistent experience</li>
                  <li>• "View as User" feature coming soon for testing personalization</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
