import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Plus, Search, PanelLeftClose, PanelLeftOpen } from "lucide-react";

type CoachingClient = {
  id: number;
  status: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  unreadMessages: number;
  coachingType?: string;
};

type SidebarStats = {
  active: number;
  needsAction: number;
};

const statusDotColors: Record<string, string> = {
  enrolled: "bg-yellow-500",
  intake_complete: "bg-blue-500",
  plan_generating: "bg-blue-500",
  plan_ready: "bg-green-500",
  active: "bg-green-500",
  paused: "bg-gray-400",
  completed: "bg-gray-300",
  cancelled: "bg-red-500",
  pending: "bg-yellow-500",
  pending_plan: "bg-blue-500",
};

const statusLabels: Record<string, string> = {
  enrolled: "Enrolled",
  intake_complete: "Intake Complete",
  plan_generating: "Generating Plan",
  plan_ready: "Plan Ready",
  active: "Active",
  paused: "Paused",
  completed: "Completed",
  cancelled: "Cancelled",
  pending: "Enrolled",
  pending_plan: "Plan Generating",
};

interface CoachingSidebarProps {
  clients: CoachingClient[];
  selectedClientId: number | null;
  onSelectClient: (clientId: number) => void;
  onNewClient: () => void;
  stats: SidebarStats;
  isLoading?: boolean;
}

export function CoachingSidebar({
  clients,
  selectedClientId,
  onSelectClient,
  onNewClient,
  stats,
  isLoading = false,
}: CoachingSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  // Filter clients based on search query
  const filteredClients = clients.filter((client) => {
    const searchLower = searchQuery.toLowerCase();
    const fullName = `${client.user.firstName} ${client.user.lastName}`.toLowerCase();
    const email = client.user.email.toLowerCase();
    return fullName.includes(searchLower) || email.includes(searchLower);
  });

  // Collapsed view - narrow strip with toggle
  if (collapsed) {
    return (
      <aside className="w-12 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col h-full">
        <div className="p-2 border-b border-gray-200 flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCollapsed(false)}
            title="Expand sidebar"
          >
            <PanelLeftOpen className="w-4 h-4 text-gray-500" />
          </Button>
        </div>
        {/* Collapsed client dots */}
        <div className="flex-1 overflow-y-auto py-2 space-y-1">
          {filteredClients.map((client) => (
            <button
              key={client.id}
              onClick={() => onSelectClient(client.id)}
              className={cn(
                "w-full flex justify-center py-2 hover:bg-gray-50 transition-colors relative",
                selectedClientId === client.id && "bg-blue-50 border-l-2 border-l-blue-600"
              )}
              title={`${client.user.firstName} ${client.user.lastName}`}
            >
              <div
                className={cn(
                  "w-2.5 h-2.5 rounded-full",
                  statusDotColors[client.status || "enrolled"]
                )}
              />
              {client.unreadMessages > 0 && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
        <div className="p-2 border-t border-gray-200 flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onNewClient}
            title="New Client"
          >
            <Plus className="w-4 h-4 text-gray-500" />
          </Button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-80 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col h-full">
      {/* Header with collapse toggle */}
      <div className="p-4 border-b border-gray-200 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-gray-50 border-gray-200"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex-shrink-0"
          onClick={() => setCollapsed(true)}
          title="Collapse sidebar"
        >
          <PanelLeftClose className="w-4 h-4 text-gray-500" />
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Active</span>
            <span className="font-semibold text-gray-900">{stats.active}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Needs Action</span>
            <span className="font-semibold text-red-600">{stats.needsAction}</span>
          </div>
        </div>
      </div>

      {/* Client List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-sm text-gray-500">
            Loading clients...
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            {searchQuery ? "No clients found" : "No clients yet"}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredClients.map((client) => (
              <button
                key={client.id}
                onClick={() => onSelectClient(client.id)}
                className={cn(
                  "w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors",
                  selectedClientId === client.id &&
                    "bg-blue-50 border-l-4 border-l-blue-600"
                )}
              >
                <div className="flex items-center gap-3">
                  {/* Status Dot */}
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full flex-shrink-0",
                      statusDotColors[client.status || "enrolled"]
                    )}
                  />

                  {/* Client Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {client.user.firstName} {client.user.lastName}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {statusLabels[client.status || "enrolled"]}
                    </div>
                  </div>

                  {/* Unread Messages Badge */}
                  {client.unreadMessages > 0 && (
                    <div className="flex-shrink-0">
                      <Badge
                        variant="secondary"
                        className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full"
                      >
                        {client.unreadMessages}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Coaching Type Indicator (if different types exist) */}
                {client.coachingType === "pregnancy_coaching" && (
                  <div className="mt-1 ml-5">
                    <Badge
                      variant="outline"
                      className="text-xs border-gray-200 text-gray-600"
                    >
                      Pregnancy
                    </Badge>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* New Client Button - Always at Bottom */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <Button
          variant="outline"
          className="w-full justify-center"
          onClick={onNewClient}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Client
        </Button>
      </div>
    </aside>
  );
}
