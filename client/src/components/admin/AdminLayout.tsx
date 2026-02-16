import { useState, useEffect, useCallback } from "react";
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
  ChevronDown,
  LogOut,
  Menu,
  X,
  Settings,
  GraduationCap,
  BookOpen,
  Layers,
  FileText,
  Zap,
  Eye,
  Video,
  HeartHandshake,
  ShoppingBag,
  Send,
  TrendingUp,
  Home,
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
  noPadding?: boolean;
}

const navItems: NavItem[] = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard, section: "Main" },
  { id: "preview", label: "Preview as User", icon: Eye, section: "Main", path: "/admin/preview", badge: "New" },
  { id: "members", label: "All Members", icon: Users, section: "Members" },
  { id: "deactivated", label: "Deactivated", icon: UserX, section: "Members" },
  { id: "courses", label: "Courses", icon: GraduationCap, section: "Content", path: "/admin/courses" },
  { id: "modules", label: "Module Library", icon: Layers, section: "Content", path: "/admin/modules" },
  { id: "exercises", label: "Exercise Library", icon: Dumbbell, section: "Content", path: "/admin/exercises" },
  { id: "programs", label: "Programs (Legacy)", icon: FolderOpen, section: "Content" },
  { id: "assets", label: "Assets", icon: Image, section: "Content" },
  { id: "analytics", label: "Analytics", icon: BarChart3, section: "Insights", path: "/admin/analytics" },
  { id: "reports", label: "Reports", icon: FileText, section: "Insights", path: "/admin/reports" },
  { id: "orders", label: "Shopify Orders", icon: ShoppingBag, section: "Insights", path: "/admin/orders" },
  { id: "communications", label: "Communications", icon: Send, section: "Insights", path: "/admin/communications" },
  { id: "program-progress", label: "Program Progress", icon: TrendingUp, section: "Insights", path: "/admin/program-progress" },
  { id: "automation", label: "Email Automation", icon: Zap, section: "Marketing", path: "/admin/automation" },
  { id: "private-coaching", label: "Private Coaching", icon: HeartHandshake, section: "Coaching", path: "/admin/coaching", badge: "New" },
];

const STORAGE_KEY = "admin-collapsed-sections";

function getInitialCollapsedSections(): Record<string, boolean> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return {};
}

export default function AdminLayout({ children, activeTab, onTabChange, onNavigate, noPadding = false }: AdminLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(getInitialCollapsedSections);
  const [, setLocation] = useLocation();
  
  const navigate = onNavigate || setLocation;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collapsedSections));
    } catch {}
  }, [collapsedSections]);

  const toggleSection = useCallback((section: string) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

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

  const sectionOrder = ["Main", "Members", "Content", "Insights", "Marketing", "Coaching"];

  const sectionIcons: Record<string, React.ElementType> = {
    Main: LayoutDashboard,
    Members: Users,
    Content: GraduationCap,
    Insights: BarChart3,
    Marketing: Mail,
    Coaching: HeartHandshake,
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-950 dark:to-gray-900">
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

      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-2 px-4">
          {sectionOrder.map((section) => {
            const items = groupedItems[section];
            if (!items) return null;
            const isSectionCollapsed = collapsedSections[section] || false;
            const SectionIcon = sectionIcons[section];
            const hasActiveItem = items.some(item => activeTab === item.id);
            
            return (
              <div key={section}>
                {!isCollapsed ? (
                  <button
                    onClick={() => toggleSection(section)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 mb-1 rounded-xl transition-all duration-200 group",
                      hasActiveItem && isSectionCollapsed
                        ? "bg-pink-50 dark:bg-pink-900/20"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800/50"
                    )}
                  >
                    <ChevronDown className={cn(
                      "w-3.5 h-3.5 text-gray-400 transition-transform duration-200",
                      isSectionCollapsed && "-rotate-90"
                    )} />
                    <p className={cn(
                      "text-[10px] font-bold uppercase tracking-[0.15em] flex-1 text-left transition-colors",
                      hasActiveItem && isSectionCollapsed
                        ? "text-pink-600 dark:text-pink-400"
                        : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                    )}>
                      {section}
                    </p>
                    {hasActiveItem && isSectionCollapsed && (
                      <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                    )}
                  </button>
                ) : (
                  SectionIcon && (
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex justify-center py-2 mb-1">
                            <div className="w-6 h-px bg-gray-200 dark:bg-gray-700" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="font-medium bg-gray-900 text-white border-gray-700">
                          {section}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )
                )}
                {(!isSectionCollapsed || isCollapsed) && (
                  <div className={cn("space-y-1", !isCollapsed && "ml-1")}>
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
                            "w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl transition-all duration-300 text-left group relative overflow-hidden",
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
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t border-gray-200/60 dark:border-gray-800 p-4 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm space-y-2">
        {isCollapsed ? (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="w-full flex items-center justify-center p-3.5 rounded-2xl text-gray-600 hover:bg-white dark:text-gray-400 dark:hover:bg-gray-800 transition-all duration-300 hover:shadow-md hover:scale-105 group"
                  data-testid="nav-exit-admin"
                >
                  <Home className="w-5 h-5 group-hover:text-pink-600 transition-colors" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium bg-gray-900 text-white border-gray-700">
                Back to Member View
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={async () => {
                    try { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }); } catch {}
                    localStorage.removeItem("user");
                    window.location.href = "/admin/login";
                  }}
                  className="w-full flex items-center justify-center p-3.5 rounded-2xl text-gray-600 hover:bg-red-50 dark:text-gray-400 dark:hover:bg-red-900/20 transition-all duration-300 hover:shadow-md hover:scale-105 group"
                  data-testid="nav-logout"
                >
                  <LogOut className="w-5 h-5 group-hover:text-red-600 transition-colors" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium bg-gray-900 text-white border-gray-700">
                Logout
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <>
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-gray-600 hover:bg-white dark:text-gray-400 dark:hover:bg-gray-800 transition-all duration-300 text-left group hover:shadow-md hover:scale-[1.01] relative overflow-hidden"
              data-testid="nav-exit-admin"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/5 to-pink-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Home className="w-5 h-5 group-hover:scale-110 group-hover:text-pink-600 transition-all duration-300 relative z-10" />
              <span className="text-sm font-semibold relative z-10">Back to Member View</span>
            </button>
            <button
              onClick={async () => {
                try { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }); } catch {}
                localStorage.removeItem("user");
                window.location.href = "/admin/login";
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-gray-600 hover:bg-red-50 dark:text-gray-400 dark:hover:bg-red-900/20 transition-all duration-300 text-left group hover:shadow-md hover:scale-[1.01]"
              data-testid="nav-logout"
            >
              <LogOut className="w-5 h-5 group-hover:scale-110 group-hover:text-red-600 transition-all duration-300" />
              <span className="text-sm font-semibold group-hover:text-red-600 transition-colors">Logout</span>
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 hidden lg:block shadow-sm",
          isCollapsed ? "w-[72px]" : "w-72"
        )}
      >
        <SidebarContent />
      </div>

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

      <main
        className={cn(
          "min-h-screen pt-16 lg:pt-0 transition-all duration-300 bg-gradient-to-br from-gray-50 via-white to-gray-50/50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900",
          isCollapsed ? "lg:pl-[72px]" : "lg:pl-72"
        )}
      >
        {noPadding ? (
          children
        ) : (
          <div className="p-4 lg:p-6 max-w-[1600px] mx-auto">
            {children}
          </div>
        )}
      </main>
    </div>
  );
}
