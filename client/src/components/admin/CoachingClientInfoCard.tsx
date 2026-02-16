import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Baby,
} from "lucide-react";

interface CoachingClientInfoCardProps {
  client: {
    id: string;
    status: string | null;
    startDate: string | null;
    endDate: string | null;
    planDurationWeeks: number | null;
    paymentAmount: number | null;
    paymentStatus: string | null;
    isPregnant: boolean | null;
    dueDate: string | null;
    pregnancyNotes: string | null;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string | null;
    };
    [key: string]: any;
  };
  onUpdateClient: (data: { clientId: string; updates: Record<string, any> }) => void;
}

export function CoachingClientInfoCard({ client, onUpdateClient }: CoachingClientInfoCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const coachingTypeLabel = client.coachingType === "private_coaching" ? "Private Coaching" : "Pregnancy Coaching";
  const coachingTypeBadge = client.coachingType === "private_coaching"
    ? "bg-blue-50 text-blue-600 border-blue-200"
    : "bg-pink-50 text-pink-600 border-pink-200";

  // Calculate trimester if pregnant
  const trimesterInfo = client.isPregnant && client.dueDate ? (() => {
    const daysLeft = Math.max(0, Math.ceil((new Date(client.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
    const weeksPregnant = Math.max(0, Math.floor((280 - daysLeft) / 7));
    const trimester = weeksPregnant <= 12 ? 1 : weeksPregnant <= 26 ? 2 : 3;
    const trimesterColors: Record<number, string> = {
      1: "bg-blue-100 text-blue-700",
      2: "bg-amber-100 text-amber-700",
      3: "bg-pink-100 text-pink-700",
    };
    return { trimester, weeksPregnant, color: trimesterColors[trimester] };
  })() : null;

  const dateFields = [
    { label: "Purchase Date", field: "purchaseDate" },
    { label: "Form Submission", field: "formSubmissionDate" },
    { label: "Start Date", field: "startDate" },
    { label: "End Date", field: "endDate" },
  ];

  return (
    <Card className="border-0 shadow-sm overflow-hidden">
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-5 py-3 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <User className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">Client Information</span>
          <Badge variant="outline" className={cn("text-[10px]", coachingTypeBadge)}>
            {coachingTypeLabel}
          </Badge>
          {client.isPregnant && trimesterInfo && (
            <Badge className={cn("text-[10px]", trimesterInfo.color)}>
              T{trimesterInfo.trimester} · Week {trimesterInfo.weeksPregnant}
            </Badge>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Content - collapsible */}
      {isExpanded && (
        <CardContent className="px-5 pb-5 pt-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left column: Personal info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                <Mail className="w-3 h-3" /> Contact Details
              </div>
              {[
                { icon: User, label: "Name", value: `${client.user.firstName} ${client.user.lastName}` },
                { icon: Mail, label: "Email", value: client.user.email },
                { icon: Phone, label: "Phone", value: client.user.phone || "Not provided" },
                { icon: Calendar, label: "Program", value: `${client.planDurationWeeks || 4} weeks` },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 flex items-center gap-1.5">
                      <item.icon className="w-3.5 h-3.5" />
                      {item.label}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{item.value}</span>
                  </div>
                  {i < 3 && <Separator className="mt-3" />}
                </div>
              ))}
              <Separator />
              {/* Payment */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  Payment
                </span>
                <span className="text-sm font-medium">
                  ₹{((client.paymentAmount || 0) / 100).toLocaleString()}
                  <Badge variant="outline" className={cn("ml-2 text-[10px]",
                    client.paymentStatus === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  )}>
                    {client.paymentStatus || "pending"}
                  </Badge>
                </span>
              </div>
            </div>

            {/* Right column: Dates & Pregnancy */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                <Calendar className="w-3 h-3" /> Dates & Schedule
              </div>
              {dateFields.map((item) => (
                <div key={item.field}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{item.label}</span>
                    <Input
                      type="date"
                      className="w-40 h-8 text-sm"
                      value={client[item.field] ? new Date(client[item.field] as string).toISOString().split('T')[0] : ''}
                      onChange={(e) => onUpdateClient({
                        clientId: client.id,
                        updates: { [item.field]: e.target.value ? new Date(e.target.value).toISOString() : null }
                      })}
                    />
                  </div>
                  <Separator className="mt-3" />
                </div>
              ))}

              {/* Pregnancy section */}
              {client.isPregnant && (
                <div className="mt-4 p-3 rounded-lg bg-pink-50 border border-pink-100 space-y-3">
                  <div className="flex items-center gap-2">
                    <Baby className="w-4 h-4 text-pink-500" />
                    <span className="text-sm font-medium text-pink-700">Pregnancy Details</span>
                    {trimesterInfo && (
                      <Badge className={cn("text-[10px] ml-auto", trimesterInfo.color)}>
                        Trimester {trimesterInfo.trimester} · Week {trimesterInfo.weeksPregnant}
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-gray-500">Due Date</Label>
                      <Input
                        type="date"
                        className="mt-1 h-8 text-sm bg-white"
                        value={client.dueDate ? new Date(client.dueDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => onUpdateClient({
                          clientId: client.id,
                          updates: { dueDate: e.target.value ? new Date(e.target.value).toISOString() : null }
                        })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Trimester</Label>
                      <div className="mt-1 h-8 flex items-center">
                        {trimesterInfo ? (
                          <Badge className={cn("text-[10px]", trimesterInfo.color)}>
                            T{trimesterInfo.trimester} · Week {trimesterInfo.weeksPregnant}
                          </Badge>
                        ) : (
                          <span className="text-xs text-gray-400">Set due date</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Pregnancy Notes</Label>
                    <Textarea
                      className="mt-1 text-sm min-h-[36px] bg-white"
                      rows={1}
                      placeholder="Pregnancy-related notes..."
                      defaultValue={client.pregnancyNotes || ''}
                      onBlur={(e) => {
                        if (e.target.value !== (client.pregnancyNotes || '')) {
                          onUpdateClient({
                            clientId: client.id,
                            updates: { pregnancyNotes: e.target.value || null }
                          });
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
