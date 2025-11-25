import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/hooks/use-session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft, Mail, TrendingUp, Users, Eye, Loader2, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format } from "date-fns";

interface EmailAnalytics {
  overview: {
    totalCampaigns: number;
    totalSent: number;
    totalOpens: number;
    averageOpenRate: number;
  };
  templateStats: Array<{
    templateId: string;
    templateType: string;
    templateName: string;
    totalSent: number;
    totalOpens: number;
    openRate: number;
    campaigns: number;
  }>;
  recentCampaigns: Array<{
    id: string;
    name: string;
    templateType: string;
    status: string;
    sentAt: Date | null;
    recipientCount: number;
    sentCount: number;
    openCount: number;
    openRate: number;
  }>;
}

const COLORS = ['#EC4899', '#F472B6', '#FB7185', '#FDA4AF', '#FCA5A5', '#FBBF24'];

export default function AdminEmailAnalytics() {
  const { user, loading: sessionLoading } = useSession();
  const [, setLocation] = useLocation();

  const { data: analytics, isLoading, isError } = useQuery<EmailAnalytics>({
    queryKey: ["/api/admin/analytics/email-campaigns"],
    enabled: !sessionLoading && user !== null && user.isAdmin,
  });

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    setLocation("/");
    return null;
  }

  if (isError) {
    setLocation("/");
    return null;
  }

  if (isLoading || !analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-pink-500" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Email Campaign Analytics
              </h1>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setLocation("/admin")}
                variant="outline"
                data-testid="button-back-admin"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </Button>
              <Button
                onClick={() => setLocation("/admin-email-campaigns")}
                variant="ghost"
                data-testid="button-back-campaigns"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Campaigns
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          </div>
        </div>
      </div>
    );
  }

  const { overview, templateStats, recentCampaigns } = analytics;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-pink-500" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Email Campaign Analytics
            </h1>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setLocation("/admin")}
              variant="outline"
              data-testid="button-back-admin"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
            <Button
              onClick={() => setLocation("/admin-email-campaigns")}
              variant="ghost"
              data-testid="button-back-campaigns"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Campaigns
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-pink-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription className="text-sm font-medium text-gray-600">Total Campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-gray-900">{overview.totalCampaigns}</div>
                <Mail className="w-8 h-8 text-pink-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription className="text-sm font-medium text-gray-600">Total Sent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-gray-900">{overview.totalSent.toLocaleString()}</div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription className="text-sm font-medium text-gray-600">Total Opens</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-gray-900">{overview.totalOpens.toLocaleString()}</div>
                <Eye className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription className="text-sm font-medium text-gray-600">Average Open Rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-gray-900">{overview.averageOpenRate}%</div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Template Performance Chart */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Template Performance</CardTitle>
              <CardDescription>Email opens by template type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={templateStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="templateName" fontSize={12} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalSent" fill="#EC4899" name="Sent" />
                  <Bar dataKey="totalOpens" fill="#8B5CF6" name="Opens" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Open Rate Distribution */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Open Rate by Template</CardTitle>
              <CardDescription>Percentage breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={templateStats}
                    dataKey="openRate"
                    nameKey="templateName"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.templateName}: ${entry.openRate}%`}
                  >
                    {templateStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Template Statistics Table */}
        <Card className="shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Template Statistics</CardTitle>
            <CardDescription>Detailed performance metrics for each template</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold text-gray-700">Template</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Campaigns</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Sent</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Opens</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Open Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {templateStats.map((stat) => (
                    <tr key={stat.templateId} className="border-b hover:bg-pink-50 transition-colors">
                      <td className="p-3 font-medium text-gray-900">{stat.templateName}</td>
                      <td className="p-3 text-right text-gray-700">{stat.campaigns}</td>
                      <td className="p-3 text-right text-gray-700">{stat.totalSent.toLocaleString()}</td>
                      <td className="p-3 text-right text-gray-700">{stat.totalOpens.toLocaleString()}</td>
                      <td className="p-3 text-right">
                        <span className={`font-semibold ${stat.openRate >= 30 ? 'text-green-600' : stat.openRate >= 15 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {stat.openRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Campaigns */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Recent Campaigns</CardTitle>
            <CardDescription>Last 10 email campaigns sent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold text-gray-700">Campaign Name</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Template</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Status</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Sent Date</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Recipients</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Sent</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Opens</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Open Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCampaigns.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-500">
                        No campaigns sent yet
                      </td>
                    </tr>
                  ) : (
                    recentCampaigns.map((campaign) => (
                      <tr key={campaign.id} className="border-b hover:bg-purple-50 transition-colors">
                        <td className="p-3 font-medium text-gray-900">{campaign.name}</td>
                        <td className="p-3 text-gray-700 capitalize">{campaign.templateType.replace('-', ' ')}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            campaign.status === 'sent' ? 'bg-green-100 text-green-800' :
                            campaign.status === 'sending' ? 'bg-blue-100 text-blue-800' :
                            campaign.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="p-3 text-gray-700">
                          {campaign.sentAt ? format(new Date(campaign.sentAt), 'MMM d, yyyy h:mm a') : '-'}
                        </td>
                        <td className="p-3 text-right text-gray-700">{campaign.recipientCount}</td>
                        <td className="p-3 text-right text-gray-700">{campaign.sentCount}</td>
                        <td className="p-3 text-right text-gray-700">{campaign.openCount}</td>
                        <td className="p-3 text-right">
                          <span className={`font-semibold ${campaign.openRate >= 30 ? 'text-green-600' : campaign.openRate >= 15 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {campaign.openRate}%
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
