import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSession } from "@/hooks/use-session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, Users, Calendar, Check, X, Loader2, Plus, Eye, TestTube } from "lucide-react";
import { useLocation } from "wouter";

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
  createdBy: string;
  createdAt: Date;
}

export default function AdminEmailCampaigns() {
  const { user } = useSession();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("welcome");
  const [campaignName, setCampaignName] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [testEmailAddress, setTestEmailAddress] = useState("me@zoemodgill.in");
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [audienceFilters, setAudienceFilters] = useState({
    dormantDays: "",
    hasWhatsAppSupport: "any",
    countries: [] as string[],
  });

  // Available countries (you can expand this list)
  const availableCountries = ["India", "USA", "UK", "Canada", "Australia", "Singapore", "UAE"];

  // Preset dormant days options
  const dormantDaysPresets = [
    { label: "Any", value: "" },
    { label: "7 days", value: "7" },
    { label: "14 days", value: "14" },
    { label: "30 days", value: "30" },
    { label: "60 days", value: "60" },
    { label: "90 days", value: "90" },
  ];

  // Redirect if not admin
  if (user && !user.isAdmin) {
    setLocation("/dashboard");
    return null;
  }

  // Fetch campaigns
  const { data: campaigns = [], isLoading } = useQuery<EmailCampaign[]>({
    queryKey: ["/api/admin/email-campaigns"],
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: any) => {
      return apiRequest("/api/admin/email-campaigns", "POST", campaignData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-campaigns"] });
      toast({
        title: "Campaign Created",
        description: "Your email campaign has been created successfully.",
      });
      setIsCreating(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create campaign",
        variant: "destructive",
      });
    },
  });

  // Send campaign mutation
  const sendCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      return apiRequest(`/api/admin/email-campaigns/${campaignId}/send`, "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-campaigns"] });
      toast({
        title: "Campaign Sent",
        description: "Your email campaign is being sent to recipients.",
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

  // Send test email mutation
  const sendTestEmailMutation = useMutation({
    mutationFn: async ({ templateType, email, subject }: { templateType: string; email: string; subject?: string }) => {
      return apiRequest("/api/admin/email-campaigns/send-test", "POST", { templateType, email, subject });
    },
    onSuccess: () => {
      toast({
        title: "Test Email Sent",
        description: `Test email sent to ${testEmailAddress}`,
      });
      setShowTestDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send test email",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setCampaignName("");
    setEmailSubject("");
    setSelectedTemplate("welcome");
    setAudienceFilters({
      dormantDays: "",
      hasWhatsAppSupport: "any",
      countries: [],
    });
  };

  const handleCreateCampaign = () => {
    if (!campaignName || !emailSubject) {
      toast({
        title: "Missing Information",
        description: "Please provide a campaign name and subject",
        variant: "destructive",
      });
      return;
    }

    const audienceFilter: any = {};
    if (audienceFilters.dormantDays) {
      audienceFilter.dormantDays = parseInt(audienceFilters.dormantDays);
    }
    if (audienceFilters.hasWhatsAppSupport !== "any") {
      audienceFilter.hasWhatsAppSupport = audienceFilters.hasWhatsAppSupport === "true";
    }
    // Only include country filter if specific countries are selected
    if (audienceFilters.countries.length > 0 && audienceFilters.countries.length < availableCountries.length) {
      // For now, we'll use the first selected country (backend currently supports single country)
      // TODO: Update backend to support multiple countries
      audienceFilter.country = audienceFilters.countries[0];
    }

    createCampaignMutation.mutate({
      name: campaignName,
      templateType: selectedTemplate,
      subject: emailSubject,
      audienceFilter,
      status: "draft",
    });
  };

  const handleSendTestEmail = () => {
    if (!testEmailAddress) {
      toast({
        title: "Missing Email",
        description: "Please provide an email address",
        variant: "destructive",
      });
      return;
    }

    sendTestEmailMutation.mutate({
      templateType: selectedTemplate,
      email: testEmailAddress,
      subject: emailSubject || undefined,
    });
  };

  const getTemplateLabel = (type: string) => {
    const labels: Record<string, string> = {
      welcome: "Welcome to Your Journey",
      "re-engagement": "We Miss You",
      "program-reminder": "Midpoint Motivation",
      "completion-celebration": "Program Completion Celebration",
    };
    return labels[type] || type;
  };

  const getTemplateDescription = (type: string) => {
    const descriptions: Record<string, string> = {
      welcome: "Welcome new members to the program with warmth and guidance",
      "re-engagement": "Gently bring back dormant users with motivational messaging",
      "program-reminder": "Boost motivation at Week 3 with progress celebration",
      "completion-celebration": "Celebrate 6-week program graduates and encourage next steps",
    };
    return descriptions[type] || "";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-500",
      scheduled: "bg-blue-500",
      sending: "bg-yellow-500",
      sent: "bg-green-500",
      failed: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  if (isLoading) {
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
          Email Campaigns
        </h1>
        <p className="text-gray-600 mt-2">
          Create and manage email campaigns for member outreach
        </p>
      </div>

      {/* Create Campaign Card */}
      {!isCreating ? (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              data-testid="button-create-campaign"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="w-5 h-5 mr-2 text-pink-500" />
              New Email Campaign
            </CardTitle>
            <CardDescription>
              Configure your email campaign details and target audience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Campaign Name */}
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

            {/* Template Selection */}
            <div>
              <Label htmlFor="template-type">Email Template</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger id="template-type" data-testid="select-template">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="welcome">
                    <div className="flex flex-col">
                      <span className="font-medium">{getTemplateLabel("welcome")}</span>
                      <span className="text-xs text-gray-500">{getTemplateDescription("welcome")}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="re-engagement">
                    <div className="flex flex-col">
                      <span className="font-medium">{getTemplateLabel("re-engagement")}</span>
                      <span className="text-xs text-gray-500">{getTemplateDescription("re-engagement")}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="program-reminder">
                    <div className="flex flex-col">
                      <span className="font-medium">{getTemplateLabel("program-reminder")}</span>
                      <span className="text-xs text-gray-500">{getTemplateDescription("program-reminder")}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="completion-celebration">
                    <div className="flex flex-col">
                      <span className="font-medium">{getTemplateLabel("completion-celebration")}</span>
                      <span className="text-xs text-gray-500">{getTemplateDescription("completion-celebration")}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-600 mt-2">{getTemplateDescription(selectedTemplate)}</p>
            </div>

            {/* Email Subject */}
            <div>
              <Label htmlFor="email-subject">Email Subject</Label>
              <Input
                id="email-subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Enter email subject line"
                data-testid="input-email-subject"
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

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleCreateCampaign}
                disabled={createCampaignMutation.isPending}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                data-testid="button-save-campaign"
              >
                {createCampaignMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Create Campaign
                  </>
                )}
              </Button>
              
              <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50" data-testid="button-test-email">
                    <TestTube className="w-4 h-4 mr-2" />
                    Send Test Email
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Send Test Email</DialogTitle>
                    <DialogDescription>
                      Preview this email template in your inbox before sending to your audience
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
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
                    </div>
                    <div className="bg-pink-50 p-3 rounded-md">
                      <p className="text-sm text-gray-700">
                        <strong>Template:</strong> {getTemplateLabel(selectedTemplate)}
                      </p>
                      {emailSubject && (
                        <p className="text-sm text-gray-700 mt-1">
                          <strong>Subject:</strong> {emailSubject}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={handleSendTestEmail}
                      disabled={sendTestEmailMutation.isPending}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                      data-testid="button-send-test"
                    >
                      {sendTestEmailMutation.isPending ? (
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

              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  resetForm();
                }}
                data-testid="button-cancel"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaigns List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Campaign History</h2>
        
        {campaigns.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No campaigns created yet</p>
              <p className="text-sm mt-1">Create your first campaign to get started</p>
            </CardContent>
          </Card>
        ) : (
          campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{campaign.name}</h3>
                      <Badge className={`${getStatusColor(campaign.status)} text-white`}>
                        {campaign.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{campaign.subject}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {getTemplateLabel(campaign.templateType)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {campaign.recipientCount || 0} recipients
                      </div>
                      {campaign.sentAt && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Sent {new Date(campaign.sentAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {campaign.status === "sent" && (
                      <div className="mt-3 flex gap-4 text-sm">
                        <span className="text-green-600">
                          ✓ {campaign.sentCount} sent
                        </span>
                        {campaign.failedCount > 0 && (
                          <span className="text-red-600">
                            ✗ {campaign.failedCount} failed
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {campaign.status === "draft" && (
                    <Button
                      onClick={() => sendCampaignMutation.mutate(campaign.id)}
                      disabled={sendCampaignMutation.isPending}
                      size="sm"
                      className="bg-gradient-to-r from-pink-500 to-purple-500"
                      data-testid={`button-send-${campaign.id}`}
                    >
                      {sendCampaignMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Now
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
