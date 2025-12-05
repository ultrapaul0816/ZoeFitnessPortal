import { useState } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  UserX,
  Dumbbell,
  FolderOpen,
  Image,
  Mail,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Settings,
  GraduationCap,
  BookOpen,
  Layers,
  FileText,
  Zap,
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  section?: string;
  path?: string;
  badge?: string;
}

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onNavigate?: (path: string) => void;
}

const navItems: NavItem[] = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard, section: "Main" },
  { id: "members", label: "Active Members", icon: Users, section: "Members" },
  { id: "deactivated", label: "Deactivated", icon: UserX, section: "Members" },
  { id: "courses", label: "Courses", icon: GraduationCap, section: "Content", path: "/admin/courses", badge: "New" },
  { id: "modules", label: "Module Library", icon: Layers, section: "Content", path: "/admin/modules" },
  { id: "exercises", label: "Exercise Library", icon: Dumbbell, section: "Content", path: "/admin/exercises" },
  { id: "workouts", label: "Workout Builder", icon: BookOpen, section: "Content", path: "/admin/workouts" },
  { id: "programs", label: "Programs (Legacy)", icon: FolderOpen, section: "Content" },
  { id: "assets", label: "Assets", icon: Image, section: "Content" },
  { id: "analytics", label: "Analytics", icon: BarChart3, section: "Insights", path: "/admin/analytics" },
  { id: "email-campaigns", label: "Email Campaigns", icon: Mail, section: "Marketing", path: "/admin-email-campaigns" },
  { id: "email-analytics", label: "Email Analytics", icon: BarChart3, section: "Marketing", path: "/admin-email-analytics" },
  { id: "automation", label: "Automation", icon: Zap, section: "Marketing", path: "/admin/automation" },
];

export default function AdminLayout({ children, activeTab, onTabChange, onNavigate }: AdminLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [, setLocation] = useLocation();
  
  const navigate = onNavigate || setLocation;

  const handleNavClick = (item: NavItem) => {
    if (item.path) {
      setLocation(item.path);
    } else {
      onTabChange(item.id);
    }
    setIsMobileOpen(false);
  };

  const groupedItems = navItems.reduce((acc, item) => {
    const section = item.section || "Other";
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  const sectionOrder = ["Main", "Members", "Content", "Insights", "Marketing"];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <div className={cn(
        "flex items-center border-b border-gray-200/60 dark:border-gray-800 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm",
        isCollapsed ? "justify-center p-4" : "justify-between px-6 py-6"
      )}>
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 via-pink-600 to-rose-600 rounded-2xl flex items-center justify-center shadow-xl shadow-pink-500/30 dark:shadow-pink-900/40 ring-2 ring-pink-100 dark:ring-pink-900/20">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">Admin Panel</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Stronger With Zoe</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="hidden lg:flex h-9 w-9 p-0 hover:bg-pink-50 dark:hover:bg-gray-800 rounded-xl transition-all"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4 text-gray-600" /> : <ChevronLeft className="w-4 h-4 text-gray-600" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-6">
        <nav className="space-y-8 px-4">
          {sectionOrder.map((section) => {
            const items = groupedItems[section];
            if (!items) return null;
            
            return (
              <div key={section}>
                {!isCollapsed && (
                  <div className="flex items-center gap-2 px-3 mb-4">
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] letter-spacing-wide">
                      {section}
                    </p>
                    <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-800 dark:to-transparent" />
                  </div>
                )}
                <div className="space-y-1.5">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    
                    if (isCollapsed) {
                      return (
                        <TooltipProvider key={item.id} delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => handleNavClick(item)}
                                className={cn(
                                  "w-full flex items-center justify-center p-3.5 rounded-2xl transition-all duration-300 relative group",
                                  isActive
                                    ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xl shadow-pink-500/40 dark:shadow-pink-900/40 scale-105"
                                    : "text-gray-500 hover:bg-white dark:text-gray-400 dark:hover:bg-gray-800 hover:shadow-md hover:scale-105"
                                )}
                                data-testid={`nav-${item.id}`}
                              >
                                <Icon className="w-5 h-5" />
                                {item.badge && (
                                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-gray-950 animate-pulse" />
                                )}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="font-medium bg-gray-900 text-white border-gray-700">
                              {item.label}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    }

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item)}
                        className={cn(
                          "w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-300 text-left group relative overflow-hidden",
                          isActive
                            ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xl shadow-pink-500/30 dark:shadow-pink-900/40 scale-[1.02]"
                            : "text-gray-700 hover:bg-white dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md hover:scale-[1.01]"
                        )}
                        data-testid={`nav-${item.id}`}
                      >
                        {!isActive && (
                          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/5 to-pink-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        )}
                        <Icon className={cn(
                          "w-5 h-5 transition-all duration-300 relative z-10",
                          !isActive && "group-hover:scale-110 group-hover:text-pink-600"
                        )} />
                        <span className="text-sm font-semibold flex-1 relative z-10">{item.label}</span>
                        {item.badge && (
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "text-[10px] px-2 py-0.5 h-5 font-bold relative z-10",
                              isActive 
                                ? "bg-white/20 text-white border-white/30 shadow-inner" 
                                : "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                            )}
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-gray-200/60 dark:border-gray-800 p-4 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm">
        {isCollapsed ? (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="w-full flex items-center justify-center p-3.5 rounded-2xl text-gray-600 hover:bg-white dark:text-gray-400 dark:hover:bg-gray-800 transition-all duration-300 hover:shadow-md hover:scale-105 group"
                  data-testid="nav-exit-admin"
                >
                  <LogOut className="w-5 h-5 group-hover:text-pink-600 transition-colors" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium bg-gray-900 text-white border-gray-700">
                Back to Member View
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-gray-600 hover:bg-white dark:text-gray-400 dark:hover:bg-gray-800 transition-all duration-300 text-left group hover:shadow-md hover:scale-[1.01] relative overflow-hidden"
            data-testid="nav-exit-admin"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/5 to-pink-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <LogOut className="w-5 h-5 group-hover:scale-110 group-hover:text-pink-600 transition-all duration-300 relative z-10" />
            <span className="text-sm font-semibold relative z-10">Back to Member View</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 hidden lg:block shadow-sm",
          isCollapsed ? "w-[72px]" : "w-72"
        )}
      >
        <SidebarContent />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-lg border-b border-gray-200/60 dark:border-gray-800 shadow-lg">
        <div className="flex items-center justify-between px-5 h-16">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-pink-500 via-pink-600 to-rose-600 rounded-2xl flex items-center justify-center shadow-xl shadow-pink-500/30 ring-2 ring-pink-100 dark:ring-pink-900/20">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900 dark:text-white text-base">Admin Panel</span>
              <p className="text-xs text-gray-500 font-medium">Stronger With Zoe</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 hover:bg-pink-50 dark:hover:bg-gray-800 rounded-xl transition-all"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            {isMobileOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="lg:hidden fixed top-16 left-0 right-0 bottom-0 z-50 bg-white dark:bg-gray-950 overflow-auto">
            <SidebarContent />
          </div>
        </>
      )}

      {/* Main Content */}
      <main
        className={cn(
          "min-h-screen pt-16 lg:pt-0 transition-all duration-300 bg-gradient-to-br from-gray-50 via-white to-gray-50/50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900",
          isCollapsed ? "lg:pl-[72px]" : "lg:pl-72"
        )}
      >
        <div className="p-4 lg:p-6 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
