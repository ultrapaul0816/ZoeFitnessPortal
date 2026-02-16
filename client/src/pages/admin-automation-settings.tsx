import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSession } from "@/hooks/use-session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Mail, CheckCircle, AlertCircle, Edit, Loader2, ArrowLeft, Zap } from "lucide-react";
import { useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";

interface EmailAutomationRule {
  id: string;
  triggerType: string;
  name: string;
  description: string;
  templateId: string;
  subject: string;
  htmlContent: string;
  enabled: boolean;
  config: {
    inactivityDays?: number;
    delayMinutes?: number;
  };
  totalSent: number;
  lastTriggeredAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export default function AdminAutomationSettings() {
  const { user, loading: sessionLoading } = useSession();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedRule, setSelectedRule] = useState<EmailAutomationRule | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editContent, setEditContent] = useState("");
  const [testingRuleId, setTestingRuleId] = useState<string | null>(null);

  // Fetch automation rules
  const { data: rules = [], isLoading: isLoadingRules, isError: isRulesError, error: rulesError } = useQuery<EmailAutomationRule[]>({
    queryKey: ["/api/admin/automation-rules"],
    retry: false,
    enabled: !sessionLoading && user !== null,
  });

  // Toggle automation rule mutation
  const toggleRuleMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const response = await apiRequest("PATCH", `/api/admin/automation-rules/${id}`, { enabled });
      return await response.json() as EmailAutomationRule;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/automation-rules"] });
      toast({
        title: data.enabled ? "Automation Enabled" : "Automation Disabled",
        description: `${data.name} has been ${data.enabled ? "enabled" : "disabled"}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update automation rule",
        variant: "destructive",
      });
    },
  });

  // Update rule content mutation
  const updateRuleMutation = useMutation({
    mutationFn: async ({ id, subject, htmlContent }: {
      id: string;
      subject: string;
      htmlContent: string;
    }) => {
      const response = await apiRequest("PATCH", `/api/admin/automation-rules/${id}`, {
        subject,
        htmlContent,
      });
      return await response.json() as EmailAutomationRule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/automation-rules"] });
      toast({
        title: "Automation Updated",
        description: "Email content has been updated successfully",
      });
      setShowEditDialog(false);
      setSelectedRule(null);
      setEditSubject("");
      setEditContent("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update automation rule",
        variant: "destructive",
      });
    },
  });

  // Send test email mutation
  const sendTestMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("POST", `/api/admin/automation-rules/${id}/test`, {});
      return await response.json();
    },
    onSuccess: (data: any) => {
      setTestingRuleId(null);
      toast({
        title: "Test Email Sent",
        description: `Test email has been sent to ${data.sentTo}`,
      });
    },
    onError: (error: any) => {
      setTestingRuleId(null);
      toast({
        title: "Error",
        description: error.message || "Failed to send test email",
        variant: "destructive",
      });
    },
  });

  const handleToggle = (rule: EmailAutomationRule) => {
    toggleRuleMutation.mutate({ id: rule.id, enabled: !rule.enabled });
  };

  const handleOpenEditDialog = (rule: EmailAutomationRule) => {
    setSelectedRule(rule);
    setEditSubject(rule.subject);
    setEditContent(rule.htmlContent);
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (!selectedRule) return;

    if (!editSubject.trim()) {
      toast({
        title: "Missing Subject",
        description: "Please provide an email subject",
        variant: "destructive",
      });
      return;
    }

    if (!editContent.trim()) {
      toast({
        title: "Missing Content",
        description: "Please provide email content",
        variant: "destructive",
      });
      return;
    }

    updateRuleMutation.mutate({
      id: selectedRule.id,
      subject: editSubject,
      htmlContent: editContent,
    });
  };

  const getTriggerIcon = (triggerType: string) => {
    if (triggerType === "user_signup") {
      return <Mail className="h-5 w-5" />;
    } else if (triggerType === "program_completion") {
      return <CheckCircle className="h-5 w-5" />;
    } else if (triggerType === "workout_completion") {
      return <CheckCircle className="h-5 w-5" />;
    } else if (triggerType.startsWith("user_inactivity")) {
      return <AlertCircle className="h-5 w-5" />;
    } else if (triggerType === "incomplete_signup_3d") {
      return <AlertCircle className="h-5 w-5" />;
    }
    return <Zap className="h-5 w-5" />;
  };

  const getTriggerBadge = (rule: EmailAutomationRule) => {
    const { triggerType, config } = rule;
    
    if (triggerType === "user_signup") {
      return (
        <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0">
          <Mail className="h-3 w-3 mr-1" />
          User Signup
        </Badge>
      );
    } else if (triggerType === "program_completion") {
      return (
        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
          <CheckCircle className="h-3 w-3 mr-1" />
          Program Completion
        </Badge>
      );
    } else if (triggerType === "workout_completion") {
      return (
        <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
          <CheckCircle className="h-3 w-3 mr-1" />
          Workout Completion
        </Badge>
      );
    } else if (triggerType.startsWith("user_inactivity")) {
      const days = config.inactivityDays || 0;
      return (
        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
          <AlertCircle className="h-3 w-3 mr-1" />
          {days} Days Inactive
        </Badge>
      );
    } else if (triggerType === "incomplete_signup_3d") {
      return (
        <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0">
          <AlertCircle className="h-3 w-3 mr-1" />
          Incomplete Signup (3 Days)
        </Badge>
      );
    }
    return (
      <Badge variant="outline">
        {triggerType}
      </Badge>
    );
  };

  const formatLastTriggered = (lastTriggeredAt?: Date | string | null) => {
    if (!lastTriggeredAt) return "Never triggered";
    
    try {
      const date = typeof lastTriggeredAt === 'string' ? new Date(lastTriggeredAt) : lastTriggeredAt;
      return `Last triggered: ${formatDistanceToNow(date, { addSuffix: true })}`;
    } catch {
      return "Never triggered";
    }
  };

  // Auth check
  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-pink-50 to-white">
        <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  if (!user.isAdmin) {
    setLocation("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex gap-2 mb-4">
            <Button
              variant="outline"
              onClick={() => setLocation("/admin")}
              data-testid="button-back-admin"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-3 rounded-xl">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Email Automation Settings
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Configure automatic email triggers for your members
          </p>
        </div>

        {/* Error State */}
        {isRulesError && (
          <Card className="border-red-200 bg-red-50 mb-6">
            <CardContent className="pt-6">
              <p className="text-red-800">
                Error loading automation rules: {rulesError instanceof Error ? rulesError.message : "Unknown error"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoadingRules && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
          </div>
        )}

        {/* Automation Rules List */}
        {!isLoadingRules && !isRulesError && (
          <div className="space-y-4">
            {rules.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-gray-600 text-center">No automation rules configured yet.</p>
                </CardContent>
              </Card>
            ) : (
              rules.map((rule) => (
                <Card key={rule.id} className="border-purple-200 hover:shadow-lg transition-shadow" data-testid={`card-automation-rule-${rule.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            rule.triggerType === "user_signup" 
                              ? "bg-gradient-to-r from-pink-100 to-purple-100" 
                              : rule.triggerType === "program_completion"
                              ? "bg-gradient-to-r from-green-100 to-emerald-100"
                              : rule.triggerType === "workout_completion"
                              ? "bg-gradient-to-r from-blue-100 to-cyan-100"
                              : rule.triggerType === "incomplete_signup_3d"
                              ? "bg-gradient-to-r from-yellow-100 to-amber-100"
                              : "bg-gradient-to-r from-amber-100 to-orange-100"
                          }`}>
                            {getTriggerIcon(rule.triggerType)}
                          </div>
                          <div>
                            <CardTitle className="text-xl">{rule.name}</CardTitle>
                            <CardDescription className="text-sm mt-1">
                              {rule.description}
                            </CardDescription>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 flex-wrap">
                          {getTriggerBadge(rule)}
                          
                          <Badge variant="outline" className="text-gray-600">
                            {rule.totalSent || 0} emails sent
                          </Badge>
                          
                          <Badge variant="outline" className="text-gray-600">
                            {formatLastTriggered(rule.lastTriggeredAt)}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`toggle-${rule.id}`} className="text-sm font-medium">
                            {rule.enabled ? "ON" : "OFF"}
                          </Label>
                          <Switch
                            id={`toggle-${rule.id}`}
                            checked={rule.enabled}
                            onCheckedChange={() => handleToggle(rule)}
                            disabled={toggleRuleMutation.isPending}
                            className={rule.enabled ? "bg-gradient-to-r from-pink-500 to-purple-500" : ""}
                            data-testid={`switch-toggle-${rule.id}`}
                          />
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => {
                            setTestingRuleId(rule.id);
                            sendTestMutation.mutate(rule.id);
                          }}
                          disabled={testingRuleId === rule.id && sendTestMutation.isPending}
                          className="border-green-300 hover:bg-green-50 text-green-700"
                          data-testid={`button-test-${rule.id}`}
                        >
                          {testingRuleId === rule.id && sendTestMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Test
                            </>
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => handleOpenEditDialog(rule)}
                          className="border-purple-300 hover:bg-purple-50"
                          data-testid={`button-edit-${rule.id}`}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Content
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Edit Automation Content
              </DialogTitle>
              <DialogDescription>
                Customize the email subject and content for this automation.
                Variables like {'{{firstName}}'}, {'{{userName}}'}, {'{{programName}}'} will be replaced when sending.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-subject" className="text-sm font-medium">
                  Email Subject <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-subject"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  placeholder="Enter email subject..."
                  className="border-purple-200 focus:border-purple-400"
                  data-testid="input-edit-subject"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-content" className="text-sm font-medium">
                  Email Content (HTML) <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="edit-content"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Enter email HTML content..."
                  className="border-purple-200 focus:border-purple-400 min-h-[400px] font-mono text-sm"
                  data-testid="textarea-edit-content"
                />
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-2">Available Variables:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-purple-700">
                  <div><code>{'{{firstName}}'}</code> - User's first name</div>
                  <div><code>{'{{lastName}}'}</code> - User's last name</div>
                  <div><code>{'{{userName}}'}</code> - Full name</div>
                  <div><code>{'{{email}}'}</code> - User's email</div>
                  <div><code>{'{{programName}}'}</code> - Program name</div>
                  <div><code>{'{{appUrl}}'}</code> - App URL</div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditDialog(false);
                    setSelectedRule(null);
                    setEditSubject("");
                    setEditContent("");
                  }}
                  disabled={updateRuleMutation.isPending}
                  data-testid="button-cancel-edit"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={updateRuleMutation.isPending}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600"
                  data-testid="button-save-edit"
                >
                  {updateRuleMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>Save Changes</>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
