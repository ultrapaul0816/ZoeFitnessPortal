import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  MessageSquare,
  FileText,
  Brain,
  Zap,
  Users,
} from "lucide-react";

const statusColors: Record<string, string> = {
  enrolled: "bg-yellow-100 text-yellow-700 border-yellow-200",
  intake_complete: "bg-indigo-100 text-indigo-700 border-indigo-200",
  plan_generating: "bg-blue-100 text-blue-700 border-blue-200",
  plan_ready: "bg-cyan-100 text-cyan-700 border-cyan-200",
  active: "bg-green-100 text-green-700 border-green-200",
  paused: "bg-orange-100 text-orange-700 border-orange-200",
  completed: "bg-gray-100 text-gray-700 border-gray-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  pending_plan: "bg-blue-100 text-blue-700 border-blue-200",
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
  pending_plan: "Plan In Progress",
};

interface CoachingClientRow {
  id: string;
  status: string | null;
  startDate: string | Date | null;
  lastCheckinDate: string | null;
  unreadMessages: number;
  missedCheckinDays: number;
  coachingType?: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    profilePictureUrl: string | null;
  };
  // Allow any additional fields from CoachingClient
  [key: string]: any;
}

interface CoachingClientsTableProps {
  clients: CoachingClientRow[];
  isLoading: boolean;
  onSelectClient: (clientId: string) => void;
}

export function CoachingClientsTable({ clients, isLoading, onSelectClient }: CoachingClientsTableProps) {
  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Loading clients...</div>;
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">No coaching clients yet</p>
        <p className="text-gray-400 text-sm mt-1">Click "New Client" to enroll your first private coaching client</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gradient-to-r from-gray-50 to-slate-50">
            <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Client</th>
            <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
            <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Check-in</th>
            <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Messages</th>
            <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Start Date</th>
            <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {clients.map(client => {
            const missed = client.missedCheckinDays || 0;
            const unread = client.unreadMessages || 0;
            const isInactive = ["paused", "completed", "cancelled"].includes(client.status || "");
            const urgencyBorder = isInactive ? "border-l-gray-300" :
              (missed >= 3 || unread >= 3) ? "border-l-red-400" :
              (missed >= 1 || unread >= 1) ? "border-l-amber-400" :
              client.status === "active" ? "border-l-green-400" : "border-l-blue-300";

            return (
              <tr
                key={client.id}
                onClick={() => onSelectClient(client.id)}
                className={cn(
                  "hover:bg-gradient-to-r hover:from-pink-50/30 hover:to-transparent transition-all duration-200 cursor-pointer border-l-4",
                  urgencyBorder
                )}
              >
                {/* Client */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                      {client.user.firstName[0]}{client.user.lastName[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-gray-900 truncate">
                          {client.user.firstName} {client.user.lastName}
                        </p>
                        <Badge variant="outline" className={cn("text-[10px] shrink-0",
                          client.coachingType === "private_coaching" ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-pink-50 text-pink-600 border-pink-200"
                        )}>
                          {client.coachingType === "private_coaching" ? "Private" : "Pregnancy"}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 truncate">{client.user.email}</p>
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="px-5 py-4">
                  <div className="flex flex-col gap-1">
                    <Badge variant="outline" className={cn("text-[10px] w-fit", statusColors[client.status || "enrolled"])}>
                      {statusLabels[client.status || "enrolled"]}
                    </Badge>
                    {(client.status === "enrolled" || client.status === "intake_complete") && (
                      <Badge className="text-[9px] bg-amber-500 text-white animate-pulse w-fit">
                        ACTION NEEDED
                      </Badge>
                    )}
                    {client.status === "enrolled" && (
                      <span className="text-[10px] text-amber-600 flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Waiting for forms
                      </span>
                    )}
                    {client.status === "intake_complete" && (
                      <span className="text-[10px] text-indigo-600 flex items-center gap-1">
                        <Brain className="w-3 h-3" /> Ready for plan
                      </span>
                    )}
                    {client.status === "plan_ready" && (
                      <span className="text-[10px] text-cyan-600 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Activate client
                      </span>
                    )}
                  </div>
                </td>

                {/* Check-in */}
                <td className="px-5 py-4">
                  {client.status === "active" ? (
                    client.lastCheckinDate ? (
                      <div>
                        <span className="text-xs text-gray-600 block">
                          {new Date(client.lastCheckinDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        {missed === 0 ? (
                          <span className="text-[10px] text-green-600 font-medium">Today</span>
                        ) : missed <= 2 ? (
                          <span className="text-[10px] font-medium text-amber-600">{missed}d ago</span>
                        ) : (
                          <span className="text-[10px] font-medium text-red-600">{missed}d ago</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">No check-ins yet</span>
                    )
                  ) : (
                    <span className="text-xs text-gray-300">&mdash;</span>
                  )}
                </td>

                {/* Messages */}
                <td className="px-5 py-4">
                  {unread > 0 ? (
                    <Badge className={cn("text-white text-[10px]", unread >= 3 ? "bg-red-500" : "bg-pink-500")}>
                      <MessageSquare className="w-3 h-3 mr-1" />
                      {unread} new
                    </Badge>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </td>

                {/* Start Date */}
                <td className="px-5 py-4">
                  {client.startDate ? (
                    <span className="text-xs text-gray-600">
                      {new Date(client.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Not set</span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-5 py-4 text-right">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-pink-600 bg-pink-50 rounded-full hover:bg-pink-100 transition-colors">
                    View
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
