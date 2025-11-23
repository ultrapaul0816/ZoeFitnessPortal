import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSession } from "@/hooks/use-session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, Users, Calendar, Check, X, Loader2, Plus, Eye } from "lucide-react";
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
  const [audienceFilters, setAudienceFilters] = useState({
    dormantDays: "",
    hasWhatsAppSupport: "any",
    country: "",
  });

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

  const resetForm = () => {
    setCampaignName("");
    setEmailSubject("");
    setSelectedTemplate("welcome");
    setAudienceFilters({
      dormantDays: "",
      hasWhatsAppSupport: "any",
      country: "",
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
    if (audienceFilters.country) {
      audienceFilter.country = audienceFilters.country;
    }

    createCampaignMutation.mutate({
      name: campaignName,
      templateType: selectedTemplate,
      subject: emailSubject,
      audienceFilter,
      status: "draft",
    });
  };

  const getTemplateLabel = (type: string) => {
    const labels: Record<string, string> = {
      welcome: "Welcome Email",
      "re-engagement": "Re-engagement Email",
      "program-reminder": "Program Reminder",
      "whatsapp-invite": "WhatsApp Invite",
    };
    return labels[type] || type;
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
                  <SelectItem value="welcome">Welcome Email</SelectItem>
                  <SelectItem value="re-engagement">Re-engagement Email</SelectItem>
                  <SelectItem value="program-reminder">Program Reminder</SelectItem>
                  <SelectItem value="whatsapp-invite">WhatsApp Invite</SelectItem>
                </SelectContent>
              </Select>
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
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-sm">Target Audience</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="dormant-days">Dormant Days</Label>
                  <Input
                    id="dormant-days"
                    type="number"
                    value={audienceFilters.dormantDays}
                    onChange={(e) => setAudienceFilters({ ...audienceFilters, dormantDays: e.target.value })}
                    placeholder="e.g., 14"
                    data-testid="input-dormant-days"
                  />
                  <p className="text-xs text-gray-500 mt-1">Users inactive for X days</p>
                </div>

                <div>
                  <Label htmlFor="whatsapp-support">WhatsApp Support</Label>
                  <Select
                    value={audienceFilters.hasWhatsAppSupport}
                    onValueChange={(value) => setAudienceFilters({ ...audienceFilters, hasWhatsAppSupport: value })}
                  >
                    <SelectTrigger id="whatsapp-support" data-testid="select-whatsapp">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="true">Has WhatsApp</SelectItem>
                      <SelectItem value="false">No WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={audienceFilters.country}
                    onChange={(e) => setAudienceFilters({ ...audienceFilters, country: e.target.value })}
                    placeholder="e.g., India"
                    data-testid="input-country"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
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
