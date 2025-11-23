import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSession } from "@/hooks/use-session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, Users, Eye, TestTube, Loader2, Edit, TrendingUp, Calendar, Check } from "lucide-react";
import { useLocation } from "wouter";

interface EmailTemplate {
  id: string;
  type: string;
  name: string;
  description: string;
  subject: string;
  htmlContent: string;
  variables: string[];
  timesSent: number;
  createdAt: Date;
  updatedAt: Date;
}

interface EmailCampaign {
  id: string;
  name: string;
  templateType: string;
  subject: string;
  audienceFilter: any;
  status: string;
  scheduledFor?: Date;
  sentAt?: Date;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  openCount: number;
  createdBy: string;
  createdAt: Date;
}

export default function AdminEmailCampaigns() {
  const { user, loading: sessionLoading } = useSession();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  const [testEmailAddress, setTestEmailAddress] = useState("me@zoemodgill.in");
  const [campaignName, setCampaignName] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editContent, setEditContent] = useState("");
  const [previewData, setPreviewData] = useState<{ subject: string; content: string } | null>(null);
  
  const [audienceFilters, setAudienceFilters] = useState({
    dormantDays: "0",
    hasWhatsAppSupport: "any",
    countries: [] as string[],
  });

  const availableCountries = ["India", "USA", "UK", "Canada", "Australia", "Singapore", "UAE"];
  const dormantDaysPresets = [
    { label: "Any", value: "0" },
    { label: "7 days", value: "7" },
    { label: "14 days", value: "14" },
    { label: "30 days", value: "30" },
    { label: "60 days", value: "60" },
    { label: "90 days", value: "90" },
  ];

  // Fetch templates - MUST be called before any conditional returns
  const { data: templates = [], isLoading: isLoadingTemplates, isError: isTemplatesError, error: templatesError } = useQuery<EmailTemplate[]>({
    queryKey: ["/api/admin/email-templates"],
    retry: false,
    enabled: !sessionLoading && user !== null,
  });

  // Fetch campaigns - MUST be called before any conditional returns
  const { data: campaigns = [], isError: isCampaignsError, error: campaignsError } = useQuery<EmailCampaign[]>({
    queryKey: ["/api/admin/email-campaigns"],
    retry: false,
    enabled: !sessionLoading && user !== null,
  });

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  // Preview mutation - MUST be called before any conditional returns
  const previewMutation = useMutation({
    mutationFn: async (templateId: string) => {
      return apiRequest(`/api/admin/email-templates/${templateId}/preview`, "POST") as unknown as Promise<{ subject: string; content: string }>;
    },
    onSuccess: (data) => {
      setPreviewData(data);
      setShowPreview(true);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate preview",
        variant: "destructive",
      });
    },
  });

  // Send test email mutation
  const sendTestMutation = useMutation({
    mutationFn: async ({ templateId, email }: { templateId: string; email: string }) => {
      return apiRequest(`/api/admin/email-templates/${templateId}/send-test`, "POST", { email });
    },
    onSuccess: () => {
      toast({
        title: "Test Email Sent",
        description: `Test email sent successfully to ${testEmailAddress}`,
      });
      setShowTestDialog(false);
      setTestEmailAddress("me@zoemodgill.in");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send test email",
        variant: "destructive",
      });
    },
  });

  // Send campaign mutation
  const sendCampaignMutation = useMutation({
    mutationFn: async ({ templateId, campaignName, audienceFilter }: {
      templateId: string;
      campaignName: string;
      audienceFilter: any;
    }) => {
      return apiRequest(`/api/admin/email-templates/${templateId}/send-campaign`, "POST", {
        campaignName,
        audienceFilter,
      }) as unknown as Promise<{ success: boolean; recipientCount: number; message: string }>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-campaigns"] });
      toast({
        title: "Campaign Sending",
        description: `Email campaign is being sent to ${data.recipientCount} recipients`,
      });
      setShowSendDialog(false);
      setCampaignName("");
      setAudienceFilters({
        dormantDays: "0",
        hasWhatsAppSupport: "any",
        countries: [],
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send campaign",
        variant: "destructive",
      });
    },
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: async ({ templateId, subject, htmlContent }: {
      templateId: string;
      subject: string;
      htmlContent: string;
    }) => {
      return apiRequest(`/api/admin/email-templates/${templateId}`, "PATCH", {
        subject,
        htmlContent,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-templates"] });
      toast({
        title: "Template Updated",
        description: "Email template has been updated successfully",
      });
      setShowEditDialog(false);
      setEditSubject("");
      setEditContent("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update template",
        variant: "destructive",
      });
    },
  });

  const handlePreview = (templateId: string) => {
    setSelectedTemplateId(templateId);
    previewMutation.mutate(templateId);
  };

  const handleOpenTestDialog = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setShowTestDialog(true);
  };

  const handleSendTest = () => {
    if (!testEmailAddress) {
      toast({
        title: "Missing Email",
        description: "Please provide an email address",
        variant: "destructive",
      });
      return;
    }
    sendTestMutation.mutate({ templateId: selectedTemplateId, email: testEmailAddress });
  };

  const handleOpenSendDialog = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setShowSendDialog(true);
  };

  const handleSendCampaign = () => {
    if (!campaignName) {
      toast({
        title: "Missing Information",
        description: "Please provide a campaign name",
        variant: "destructive",
      });
      return;
    }

    const audienceFilter: any = {};
    if (audienceFilters.dormantDays && audienceFilters.dormantDays !== "0") {
      audienceFilter.dormantDays = parseInt(audienceFilters.dormantDays);
    }
    if (audienceFilters.hasWhatsAppSupport !== "any") {
      audienceFilter.hasWhatsAppSupport = audienceFilters.hasWhatsAppSupport === "true";
    }
    if (audienceFilters.countries.length > 0 && audienceFilters.countries.length < availableCountries.length) {
      audienceFilter.country = audienceFilters.countries[0];
    }

    sendCampaignMutation.mutate({
      templateId: selectedTemplateId,
      campaignName,
      audienceFilter,
    });
  };

  const handleOpenEditDialog = (template: EmailTemplate) => {
    setSelectedTemplateId(template.id);
    setEditSubject(template.subject);
    setEditContent(template.htmlContent);
    setShowEditDialog(true);
  };

  const handleUpdateTemplate = () => {
    if (!editSubject || !editContent) {
      toast({
        title: "Missing Information",
        description: "Please provide both subject and content",
        variant: "destructive",
      });
      return;
    }
    updateTemplateMutation.mutate({
      templateId: selectedTemplateId,
      subject: editSubject,
      htmlContent: editContent,
    });
  };

  const getTemplateIcon = (type: string) => {
    const icons: Record<string, any> = {
      welcome: Mail,
      "re-engagement": Users,
      "program-reminder": TrendingUp,
      "completion-celebration": Check,
    };
    const Icon = icons[type] || Mail;
    return <Icon className="w-6 h-6" />;
  };

  const getTemplateColor = (type: string) => {
    const colors: Record<string, string> = {
      welcome: "from-pink-500 to-rose-500",
      "re-engagement": "from-purple-500 to-pink-500",
      "program-reminder": "from-blue-500 to-purple-500",
      "completion-celebration": "from-green-500 to-teal-500",
    };
    return colors[type] || "from-pink-500 to-purple-500";
  };

  // Calculate template stats from campaigns
  const getTemplateStats = (templateType: string) => {
    const templateCampaigns = campaigns.filter(c => c.templateType === templateType);
    const totalSent = templateCampaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0);
    const totalOpens = templateCampaigns.reduce((sum, c) => sum + (c.openCount || 0), 0);
    const openRate = totalSent > 0 ? Math.round((totalOpens / totalSent) * 100) : 0;
    return { totalSent, totalOpens, openRate };
  };

  // Show loading state while session is being checked
  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  // Redirect if not logged in or not admin
  if (user === null) {
    setLocation("/");
    return null;
  }
  
  if (user && !user.isAdmin) {
    setLocation("/dashboard");
    return null;
  }

  // Redirect to login on 401
  if ((isTemplatesError && templatesError?.message?.includes('401')) ||
      (isCampaignsError && campaignsError?.message?.includes('401'))) {
    setLocation("/");
    return null;
  }

  if (isLoadingTemplates) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          Email Campaign Templates
        </h1>
        <p className="text-gray-600 mt-2">
          Select a template to preview, test, or send to your members
        </p>
      </div>

      {/* Template Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {templates.map((template) => {
          const stats = getTemplateStats(template.type);
          return (
            <Card key={template.id} className="overflow-hidden border-2 hover:shadow-lg transition-shadow">
              <div className={`h-2 bg-gradient-to-r ${getTemplateColor(template.type)}`} />
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${getTemplateColor(template.type)} text-white`}>
                      {getTemplateIcon(template.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="mt-1">{template.description}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-4 rounded-lg border border-pink-100">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Current Subject Line:</p>
                  <p className="text-sm text-gray-600">{template.subject}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white p-3 rounded-lg border">
                    <div className="text-2xl font-bold text-pink-600">{stats.totalSent}</div>
                    <div className="text-xs text-gray-500 mt-1">Sent</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border">
                    <div className="text-2xl font-bold text-purple-600">{stats.totalOpens}</div>
                    <div className="text-xs text-gray-500 mt-1">Opens</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border">
                    <div className="text-2xl font-bold text-blue-600">{stats.openRate}%</div>
                    <div className="text-xs text-gray-500 mt-1">Open Rate</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(template.id)}
                    disabled={previewMutation.isPending}
                    className="border-pink-200 text-pink-600 hover:bg-pink-50"
                    data-testid={`button-preview-${template.type}`}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEditDialog(template)}
                    className="border-purple-200 text-purple-600 hover:bg-purple-50"
                    data-testid={`button-edit-${template.type}`}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenTestDialog(template.id)}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                    data-testid={`button-test-${template.type}`}
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    Send Test
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleOpenSendDialog(template.id)}
                    className={`bg-gradient-to-r ${getTemplateColor(template.type)} hover:opacity-90 text-white`}
                    data-testid={`button-send-${template.type}`}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send to Users
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Campaigns */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Campaigns</h2>
        
        {campaigns.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No campaigns sent yet</p>
              <p className="text-sm mt-1">Send your first campaign to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {campaigns.slice(0, 5).map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{campaign.name}</h3>
                        <Badge className="bg-green-500 text-white text-xs">
                          {campaign.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{campaign.subject}</p>
                      
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {campaign.sentCount || 0} sent
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {campaign.openCount || 0} opens
                        </div>
                        {campaign.sentAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(campaign.sentAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
            <DialogDescription>
              Preview how this email will look with sample data
            </DialogDescription>
          </DialogHeader>
          {previewData && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">Subject Line</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                  <p className="text-sm">{previewData.subject}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold">Email Content</Label>
                <div 
                  className="mt-1 p-4 bg-white rounded-md border prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewData.content }}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Send Test Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            <DialogDescription>
              Send a test version of this template to verify formatting and content
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {selectedTemplate && (
              <div className="bg-pink-50 p-3 rounded-md">
                <p className="text-sm">
                  <strong className="text-gray-700">Template:</strong> {selectedTemplate.name}
                </p>
                <p className="text-sm mt-1">
                  <strong className="text-gray-700">Subject:</strong> {selectedTemplate.subject}
                </p>
              </div>
            )}
            <div>
              <Label htmlFor="test-email">Email Address</Label>
              <Input
                id="test-email"
                type="email"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                placeholder="your@email.com"
                data-testid="input-test-email"
              />
              <p className="text-xs text-gray-500 mt-1">
                Test email will use sample data for dynamic variables
              </p>
            </div>
            <Button
              onClick={handleSendTest}
              disabled={sendTestMutation.isPending}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              data-testid="button-send-test"
            >
              {sendTestMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Test Email
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Campaign Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Send Campaign to Users</DialogTitle>
            <DialogDescription>
              Configure your campaign and select target audience
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            {selectedTemplate && (
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-4 rounded-lg border border-pink-100">
                <p className="text-sm font-semibold text-gray-700">
                  Template: {selectedTemplate.name}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Subject: {selectedTemplate.subject}
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="campaign-name">Campaign Name</Label>
              <Input
                id="campaign-name"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g., January Re-engagement"
                data-testid="input-campaign-name"
              />
            </div>

            {/* Audience Filters */}
            <div className="space-y-4 p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg border border-pink-100">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm flex items-center">
                  <Users className="w-4 h-4 mr-2 text-pink-500" />
                  Target Audience
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dormant-days">Inactivity Period</Label>
                  <Select
                    value={audienceFilters.dormantDays}
                    onValueChange={(value) => setAudienceFilters({ ...audienceFilters, dormantDays: value })}
                  >
                    <SelectTrigger id="dormant-days" data-testid="select-dormant-days">
                      <SelectValue placeholder="Select inactive period" />
                    </SelectTrigger>
                    <SelectContent>
                      {dormantDaysPresets.map((preset) => (
                        <SelectItem key={preset.value} value={preset.value}>
                          {preset.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Target users who haven't logged in for this many days</p>
                </div>

                <div>
                  <Label htmlFor="whatsapp-support">WhatsApp Community Access</Label>
                  <Select
                    value={audienceFilters.hasWhatsAppSupport}
                    onValueChange={(value) => setAudienceFilters({ ...audienceFilters, hasWhatsAppSupport: value })}
                  >
                    <SelectTrigger id="whatsapp-support" data-testid="select-whatsapp">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="true">Has WhatsApp Access</SelectItem>
                      <SelectItem value="false">No WhatsApp Access</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Filter by WhatsApp community membership</p>
                </div>
              </div>

              <div>
                <Label>Countries</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="country-all"
                      checked={audienceFilters.countries.length === 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setAudienceFilters({ ...audienceFilters, countries: [] });
                        }
                      }}
                      data-testid="checkbox-country-all"
                    />
                    <label htmlFor="country-all" className="text-sm font-medium">
                      All Countries
                    </label>
                  </div>
                  {availableCountries.map((country) => (
                    <div key={country} className="flex items-center space-x-2">
                      <Checkbox
                        id={`country-${country}`}
                        checked={audienceFilters.countries.includes(country)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setAudienceFilters({
                              ...audienceFilters,
                              countries: [...audienceFilters.countries, country],
                            });
                          } else {
                            setAudienceFilters({
                              ...audienceFilters,
                              countries: audienceFilters.countries.filter((c) => c !== country),
                            });
                          }
                        }}
                        data-testid={`checkbox-country-${country}`}
                      />
                      <label htmlFor={`country-${country}`} className="text-sm">
                        {country}
                      </label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {audienceFilters.countries.length === 0
                    ? "All countries selected"
                    : `Selected: ${audienceFilters.countries.join(", ")}`}
                </p>
              </div>
            </div>

            <Button
              onClick={handleSendCampaign}
              disabled={sendCampaignMutation.isPending}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              data-testid="button-confirm-send"
            >
              {sendCampaignMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Campaign
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Email Template</DialogTitle>
            <DialogDescription>
              Update the subject line and HTML content for this template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="edit-subject">Subject Line</Label>
              <Input
                id="edit-subject"
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
                placeholder="Email subject line"
                data-testid="input-edit-subject"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use variables: {"{{userName}}"}, {"{{firstName}}"}, {"{{programName}}"}, {"{{weekNumber}}"}
              </p>
            </div>
            <div>
              <Label htmlFor="edit-content">HTML Content</Label>
              <textarea
                id="edit-content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Email HTML content"
                className="w-full h-64 p-3 text-sm font-mono border rounded-md resize-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                data-testid="textarea-edit-content"
              />
              <p className="text-xs text-gray-500 mt-1">
                HTML content with dynamic variables and tracking pixel support
              </p>
            </div>
            <Button
              onClick={handleUpdateTemplate}
              disabled={updateTemplateMutation.isPending}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              data-testid="button-save-template"
            >
              {updateTemplateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
