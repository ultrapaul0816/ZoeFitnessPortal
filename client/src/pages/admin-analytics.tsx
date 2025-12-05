import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, TrendingUp, Activity, Heart, Globe, Instagram, MessageCircle, AlertCircle, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/hooks/use-admin-auth";

interface Analytics {
  demographics: {
    totalUsers: number;
    byCountry: { country: string; count: number }[];
    byPostpartumStage: { stage: string; count: number }[];
    instagramHandlesCollected: number;
  };
  engagement: {
    activeUsers: { today: number; last7Days: number; last30Days: number; last90Days: number };
    dormantUsers: { today: number; dormant7Days: number; dormant30Days: number; dormant90Days: number };
    averageLoginFrequency: number;
    trackingStartDate: string | null;
  };
  programPerformance: {
    totalWorkoutCompletions: number;
    averageWorkoutsPerUser: number;
    completionRates: { completed: number; inProgress: number; notStarted: number };
    progressDistribution: { range: string; count: number }[];
    averageMood: number;
    averageChallengeRating: number;
  };
  communityHealth: {
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    participationRate: number;
    topCategories: { category: string; count: number }[];
    topContributors: { userId: string; userName: string; postCount: number }[];
  };
  businessMetrics: {
    whatsAppAdoption: number;
    programCompletions: number;
    averageCompletionTime: number;
  };
}

const COLORS = ['#FF69B4', '#FF85C1', '#FFA0CF', '#FFBCDD', '#FFD7EB', '#FFE8F3'];

export default function AdminAnalytics() {
  const { isLoading: authLoading, isAdmin } = useAdminAuth();

  const { data: analytics, isLoading, isError, error } = useQuery<Analytics>({
    queryKey: ["/api/admin/analytics"],
    enabled: isAdmin,
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const completionData = analytics ? [
    { name: "Completed", value: analytics.programPerformance.completionRates.completed, color: '#10b981' },
    { name: "In Progress", value: analytics.programPerformance.completionRates.inProgress, color: '#f59e0b' },
    { name: "Not Started", value: analytics.programPerformance.completionRates.notStarted, color: '#ef4444' },
  ] : [];

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="h-8 w-8 text-pink-500" />
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-white">
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="h-8 w-8 text-pink-500" />
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          </div>
          <Alert variant="destructive" data-testid="error-alert">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Analytics</AlertTitle>
            <AlertDescription>
              Failed to load analytics data. {error instanceof Error ? error.message : 'Please try again later.'}
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    if (!analytics) return null;

    return (
      <div className="space-y-6" data-testid="admin-analytics-page">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="h-8 w-8 text-pink-500" />
          <h1 className="text-2xl font-bold text-gray-900" data-testid="page-title">Analytics Dashboard</h1>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white border-gray-200 shadow-sm" data-testid="card-total-users">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-pink-500" />
                <CardTitle className="text-sm font-medium text-gray-600">Total Members</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900" data-testid="text-total-users">{analytics.demographics.totalUsers}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm" data-testid="card-workout-completions">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-500" />
                <CardTitle className="text-sm font-medium text-gray-600">Workout Completions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900" data-testid="text-workout-completions">{analytics.programPerformance.totalWorkoutCompletions}</div>
              <p className="text-sm text-gray-500 mt-1">
                Avg {analytics.programPerformance.averageWorkoutsPerUser.toFixed(1)} per user
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm" data-testid="card-community-posts">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-500" />
                <CardTitle className="text-sm font-medium text-gray-600">Community Engagement</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900" data-testid="text-community-posts">{analytics.communityHealth.totalPosts}</div>
              <p className="text-sm text-gray-500 mt-1">
                {analytics.communityHealth.participationRate.toFixed(0)}% participation rate
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm" data-testid="card-whatsapp-adoption">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-green-500" />
                <CardTitle className="text-sm font-medium text-gray-600">WhatsApp Members</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900" data-testid="text-whatsapp-members">{analytics.businessMetrics.whatsAppAdoption}</div>
              <p className="text-sm text-gray-500 mt-1">
                {((analytics.businessMetrics.whatsAppAdoption / analytics.demographics.totalUsers) * 100).toFixed(0)}% of members
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics Tabs */}
        <Tabs defaultValue="demographics" className="space-y-4" data-testid="analytics-tabs">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger value="demographics" data-testid="tab-demographics">Demographics</TabsTrigger>
            <TabsTrigger value="engagement" data-testid="tab-engagement">Engagement</TabsTrigger>
            <TabsTrigger value="performance" data-testid="tab-performance">Program Performance</TabsTrigger>
            <TabsTrigger value="community" data-testid="tab-community">Community</TabsTrigger>
          </TabsList>

          {/* Demographics Tab */}
          <TabsContent value="demographics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white shadow-sm" data-testid="card-country-distribution">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-pink-500" />
                    Distribution by Country
                  </CardTitle>
                  <CardDescription>Top 10 countries by member count</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.demographics.byCountry.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="country" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#FF69B4" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm" data-testid="card-postpartum-stage">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-500" />
                    Postpartum Stage Distribution
                  </CardTitle>
                  <CardDescription>Members by postpartum stage</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.demographics.byPostpartumStage}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ stage, count }) => `${stage}: ${count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="stage"
                      >
                        {analytics.demographics.byPostpartumStage.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white shadow-sm" data-testid="card-instagram-handles">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Instagram className="h-5 w-5 text-pink-500" />
                  Instagram Handles Collected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-gray-900" data-testid="text-instagram-count">{analytics.demographics.instagramHandlesCollected}</div>
                <p className="text-gray-600 mt-2">
                  {((analytics.demographics.instagramHandlesCollected / analytics.demographics.totalUsers) * 100).toFixed(1)}% of total members
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Engagement Tab */}
          <TabsContent value="engagement" className="space-y-6">
            <Card className="bg-white shadow-sm" data-testid="card-user-activity">
              <CardHeader>
                <CardTitle>User Activity Overview</CardTitle>
                <CardDescription>Active and dormant user metrics across different time periods</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.engagement.trackingStartDate && (
                  <Alert className="mb-6 border-blue-200 bg-blue-50" data-testid="alert-tracking-start">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-900 font-semibold">Data Tracking Information</AlertTitle>
                    <AlertDescription className="text-blue-800">
                      Activity tracking started on {new Date(analytics.engagement.trackingStartDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })} ({Math.ceil((new Date().getTime() - new Date(analytics.engagement.trackingStartDate).getTime()) / (1000 * 60 * 60 * 24))} days ago)
                    </AlertDescription>
                  </Alert>
                )}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold">Time Period</TableHead>
                        <TableHead className="text-center font-semibold text-green-600">Active Users</TableHead>
                        <TableHead className="text-center font-semibold text-red-600">Dormant Users</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow data-testid="row-activity-today">
                        <TableCell className="font-medium">Today</TableCell>
                        <TableCell className="text-center text-green-600 font-semibold" data-testid="text-active-today">
                          {analytics.engagement.activeUsers.today}
                        </TableCell>
                        <TableCell className="text-center text-red-600 font-semibold" data-testid="text-dormant-today">
                          {analytics.engagement.dormantUsers.today}
                        </TableCell>
                      </TableRow>
                      <TableRow data-testid="row-activity-7days">
                        <TableCell className="font-medium">Last 7 Days</TableCell>
                        <TableCell className="text-center text-green-600 font-semibold" data-testid="text-active-7days">
                          {analytics.engagement.activeUsers.last7Days}
                        </TableCell>
                        <TableCell className="text-center text-red-600 font-semibold" data-testid="text-dormant-7days">
                          {analytics.engagement.dormantUsers.dormant7Days}
                        </TableCell>
                      </TableRow>
                      <TableRow data-testid="row-activity-30days">
                        <TableCell className="font-medium">Last 30 Days</TableCell>
                        <TableCell className="text-center text-green-600 font-semibold" data-testid="text-active-30days">
                          {analytics.engagement.activeUsers.last30Days}
                        </TableCell>
                        <TableCell className="text-center text-red-600 font-semibold" data-testid="text-dormant-30days">
                          {analytics.engagement.dormantUsers.dormant30Days}
                        </TableCell>
                      </TableRow>
                      <TableRow data-testid="row-activity-90days">
                        <TableCell className="font-medium">Last 90 Days</TableCell>
                        <TableCell className="text-center text-green-600 font-semibold" data-testid="text-active-90days">
                          {analytics.engagement.activeUsers.last90Days}
                        </TableCell>
                        <TableCell className="text-center text-red-600 font-semibold" data-testid="text-dormant-90days">
                          {analytics.engagement.dormantUsers.dormant90Days}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Program Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white shadow-sm" data-testid="card-completion-rates">
                <CardHeader>
                  <CardTitle>Program Completion Status</CardTitle>
                  <CardDescription>Current program enrollment status</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={completionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                      >
                        {completionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm" data-testid="card-progress-distribution">
                <CardHeader>
                  <CardTitle>Progress Distribution</CardTitle>
                  <CardDescription>Breakdown by completion percentage</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.programPerformance.progressDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-white shadow-sm" data-testid="card-average-mood">
                <CardHeader>
                  <CardTitle>Average Workout Mood</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-pink-600" data-testid="text-average-mood">
                    {analytics.programPerformance.averageMood.toFixed(2)} / 5.0
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Based on post-workout mood ratings
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm" data-testid="card-challenge-rating">
                <CardHeader>
                  <CardTitle>Average Challenge Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-purple-600" data-testid="text-challenge-rating">
                    {analytics.programPerformance.averageChallengeRating.toFixed(2)} / 5.0
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Based on workout difficulty ratings
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm" data-testid="card-avg-completion-time">
                <CardHeader>
                  <CardTitle>Avg Completion Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-green-600" data-testid="text-completion-time">
                    {analytics.businessMetrics.averageCompletionTime.toFixed(0)} days
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    For completed programs
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white shadow-sm" data-testid="card-top-categories">
                <CardHeader>
                  <CardTitle>Top Post Categories</CardTitle>
                  <CardDescription>Most popular post categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.communityHealth.topCategories}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#FF69B4" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm" data-testid="card-community-stats">
                <CardHeader>
                  <CardTitle>Community Activity</CardTitle>
                  <CardDescription>Total engagement metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Posts</span>
                    <span className="text-2xl font-bold text-gray-900" data-testid="text-total-posts">{analytics.communityHealth.totalPosts}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Likes</span>
                    <span className="text-2xl font-bold text-gray-900" data-testid="text-total-likes">{analytics.communityHealth.totalLikes}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Comments</span>
                    <span className="text-2xl font-bold text-gray-900" data-testid="text-total-comments">{analytics.communityHealth.totalComments}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="text-gray-600 font-semibold">Participation Rate</span>
                    <span className="text-2xl font-bold text-purple-600" data-testid="text-participation-rate">
                      {analytics.communityHealth.participationRate.toFixed(1)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white shadow-sm" data-testid="card-top-contributors">
              <CardHeader>
                <CardTitle>Top Contributors</CardTitle>
                <CardDescription>Most active community members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.communityHealth.topContributors.map((contributor, index) => (
                    <div 
                      key={contributor.userId} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      data-testid={`contributor-row-${index}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-900" data-testid={`contributor-name-${index}`}>
                          {contributor.userName}
                        </span>
                      </div>
                      <span className="text-gray-600" data-testid={`contributor-posts-${index}`}>
                        {contributor.postCount} {contributor.postCount === 1 ? 'post' : 'posts'}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <AdminLayout
      activeTab="analytics"
      onTabChange={() => {}}
    >
      {renderContent()}
    </AdminLayout>
  );
}
