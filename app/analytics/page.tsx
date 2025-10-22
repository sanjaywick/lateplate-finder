"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import {
  Users,
  MapPin,
  Star,
  Brain,
  Target,
  Activity,
  Heart,
  Lightbulb,
  Download,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/providers/auth-provider"
import { useToast } from "@/hooks/use-toast"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF7C7C"]

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user?.role === "admin") {
      fetchAnalyticsData()
    }
  }, [user])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/analytics/comprehensive")

      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data.data)
        setLastUpdated(data.timestamp)

        toast({
          title: "Analytics Data Loaded",
          description: "Latest analytics insights are now available",
        })
      } else {
        throw new Error("Failed to fetch analytics data")
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
      toast({
        title: "Error Loading Analytics",
        description: "Failed to load analytics data. Try running the analytics engine first.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const runAnalyticsEngine = async () => {
    try {
      setLoading(true)
      toast({
        title: "Running Analytics Engine",
        description: "This may take a few minutes to complete...",
      })

      const response = await fetch("/api/analytics/comprehensive", {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data.data)
        setLastUpdated(data.timestamp)

        toast({
          title: "Analytics Engine Completed",
          description: "Fresh insights have been generated successfully!",
        })
      } else {
        throw new Error("Failed to run analytics engine")
      }
    } catch (error) {
      console.error("Error running analytics engine:", error)
      toast({
        title: "Analytics Engine Failed",
        description: "Failed to run analytics engine. Check server logs for details.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const exportData = () => {
    if (!analyticsData) return

    const dataStr = JSON.stringify(analyticsData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `lateplate-analytics-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Data Exported",
      description: "Analytics data has been downloaded as JSON file",
    })
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-16">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h3>
            <p className="text-gray-600 mb-6">This page is only accessible to administrators.</p>
            <Link href="/">
              <Button>Return Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md shadow-lg border-b border-purple-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            LatePlate Analytics
          </Link>
          <div className="flex items-center gap-4">
            <Button
              onClick={runAnalyticsEngine}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Run Analytics
                </>
              )}
            </Button>
            <Button
              onClick={exportData}
              variant="outline"
              disabled={!analyticsData}
              className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Link href="/admin">
              <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50 bg-transparent">
                Admin Panel
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Advanced Analytics Dashboard
          </h1>
          <p className="text-gray-600 text-lg">Comprehensive insights powered by AI and machine learning</p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-2">Last updated: {new Date(lastUpdated).toLocaleString()}</p>
          )}
        </div>

        {!analyticsData && !loading && (
          <Card className="mb-8 bg-yellow-50 border-yellow-200">
            <CardContent className="text-center py-8">
              <Lightbulb className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-yellow-800 mb-2">No Analytics Data Available</h3>
              <p className="text-yellow-700 mb-4">
                Run the analytics engine to generate comprehensive insights from your data.
              </p>
              <Button onClick={runAnalyticsEngine} className="bg-yellow-500 hover:bg-yellow-600 text-white">
                <Brain className="w-4 h-4 mr-2" />
                Generate Analytics
              </Button>
            </CardContent>
          </Card>
        )}

        {loading && (
          <Card className="mb-8">
            <CardContent className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Processing Analytics...</h3>
              <p className="text-gray-600">
                Running comprehensive analysis including ML models, sentiment analysis, and predictive insights.
              </p>
            </CardContent>
          </Card>
        )}

        {analyticsData && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 lg:grid-cols-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="descriptive">Descriptive</TabsTrigger>
              <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
              <TabsTrigger value="clustering">Clustering</TabsTrigger>
              <TabsTrigger value="temporal">Temporal</TabsTrigger>
              <TabsTrigger value="geographic">Geographic</TabsTrigger>
              <TabsTrigger value="predictive">Predictive</TabsTrigger>
              <TabsTrigger value="recommendations">AI Insights</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {analyticsData.descriptive?.user_demographics && (
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-600 mb-1">Total Users</p>
                          <p className="text-3xl font-bold text-blue-800">
                            {analyticsData.descriptive.user_demographics.total_users}
                          </p>
                        </div>
                        <Users className="w-12 h-12 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {analyticsData.descriptive?.search_behavior && (
                  <Card className="bg-gradient-to-br from-green-50 to-green-100">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600 mb-1">Total Searches</p>
                          <p className="text-3xl font-bold text-green-800">
                            {analyticsData.descriptive.search_behavior.total_searches}
                          </p>
                        </div>
                        <Activity className="w-12 h-12 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {analyticsData.descriptive?.location_patterns && (
                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-purple-600 mb-1">Unique Cities</p>
                          <p className="text-3xl font-bold text-purple-800">
                            {analyticsData.descriptive.location_patterns.unique_cities}
                          </p>
                        </div>
                        <MapPin className="w-12 h-12 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {analyticsData.sentiment?.feedback_sentiment && (
                  <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-yellow-600 mb-1">Avg Sentiment</p>
                          <p className="text-3xl font-bold text-yellow-800">
                            {(analyticsData.sentiment.feedback_sentiment.average_sentiment * 100).toFixed(1)}%
                          </p>
                        </div>
                        <Heart className="w-12 h-12 text-yellow-500" />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Quick Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {analyticsData.descriptive?.cuisine_preferences && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="w-5 h-5" />
                        Top Cuisine Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(analyticsData.descriptive.cuisine_preferences)
                          .sort(([, a], [, b]) => b.count - a.count)
                          .slice(0, 5)
                          .map(([cuisine, data]) => (
                            <div key={cuisine} className="flex items-center justify-between">
                              <span className="font-medium">{cuisine}</span>
                              <Badge variant="secondary">{data.count} users</Badge>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {analyticsData.clustering?.cluster_characteristics && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        User Segments
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(analyticsData.clustering.cluster_characteristics).map(
                          ([clusterId, cluster]) => (
                            <div key={clusterId} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">Cluster {clusterId}</span>
                                <Badge>{cluster.size} users</Badge>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {cluster.characteristics.map((char, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {char}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Descriptive Analytics Tab */}
            <TabsContent value="descriptive" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {analyticsData.descriptive?.user_demographics?.dietary_preferences && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Dietary Preferences Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={Object.entries(analyticsData.descriptive.user_demographics.dietary_preferences).map(
                              ([key, value]) => ({
                                name: key,
                                value: value,
                              }),
                            )}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {Object.entries(analyticsData.descriptive.user_demographics.dietary_preferences).map(
                              (entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ),
                            )}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {analyticsData.descriptive?.temporal_patterns?.hourly_distribution && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Search Activity by Hour</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={Object.entries(analyticsData.descriptive.temporal_patterns.hourly_distribution).map(
                            ([hour, count]) => ({
                              hour: `${hour}:00`,
                              searches: count,
                            }),
                          )}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="hour" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="searches" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </div>

              {analyticsData.descriptive?.location_patterns?.top_cities && (
                <Card>
                  <CardHeader>
                    <CardTitle>Top Cities by User Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={analyticsData.descriptive.location_patterns.top_cities.map(([city, count]) => ({
                          city,
                          users: count,
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="city" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="users" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Sentiment Analysis Tab */}
            <TabsContent value="sentiment" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {analyticsData.sentiment?.emotion_detection && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Emotion Detection in Feedback</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={Object.entries(analyticsData.sentiment.emotion_detection).map(([emotion, count]) => ({
                            emotion,
                            count,
                          }))}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="emotion" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#ff7c7c" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {analyticsData.sentiment?.feedback_sentiment && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Overall Sentiment Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Positive", value: analyticsData.sentiment.feedback_sentiment.positive },
                              { name: "Neutral", value: analyticsData.sentiment.feedback_sentiment.neutral },
                              { name: "Negative", value: analyticsData.sentiment.feedback_sentiment.negative },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            <Cell fill="#00C49F" />
                            <Cell fill="#FFBB28" />
                            <Cell fill="#FF8042" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </div>

              {analyticsData.sentiment?.keyword_analysis && (
                <Card>
                  <CardHeader>
                    <CardTitle>Most Common Keywords in Feedback</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(analyticsData.sentiment.keyword_analysis)
                        .slice(0, 20)
                        .map(([keyword, count]) => (
                          <Badge key={keyword} variant="outline" className="text-sm">
                            {keyword} ({count})
                          </Badge>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Add more tabs for other analytics modules... */}
          </Tabs>
        )}
      </div>
    </div>
  )
}
