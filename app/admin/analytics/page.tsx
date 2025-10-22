"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import {
  Users,
  Search,
  ChefHat,
  Star,
  Activity,
  TrendingUp,
  Database,
  Zap,
  RefreshCw,
  Home,
  MapPin,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/providers/auth-provider"

interface SystemMetrics {
  totalUsers: number
  activeUsers: number
  totalSearches: number
  totalRecipes: number
  averageRating: number
}

interface SystemStatus {
  operational: boolean
  mlModelsActive: boolean
  dataPipelineRunning: boolean
  apiHealthy: boolean
}

export default function AdminAnalyticsPage() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [searchTrends, setSearchTrends] = useState([])
  const [userBehavior, setUserBehavior] = useState({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/analytics/comprehensive", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()

        if (data.needsInitialization) {
          // Wait a moment and try again
          setTimeout(() => {
            fetchAnalytics()
          }, 2000)
          return
        }

        setMetrics(data.systemOverview)
        setSystemStatus(data.systemStatus)
        setSearchTrends(data.searchTrends || [])
        setUserBehavior(data.userBehavior || {})
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAnalytics()
    setRefreshing(false)
  }

  const runMLAnalysis = async () => {
    try {
      const response = await fetch("/api/ml/run-analysis", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        alert("ML Analysis started successfully!")
        await fetchAnalytics()
      }
    } catch (error) {
      console.error("Failed to run ML analysis:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">LatePlate Finder</h1>
              <p className="text-gray-600">Admin Analytics Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={runMLAnalysis} className="bg-purple-600 hover:bg-purple-700 text-white">
                <Zap className="w-4 h-4 mr-2" />
                Run ML Analysis
              </Button>
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                className="hover:bg-gray-50 hover:text-gray-900 bg-transparent"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button variant="outline" className="hover:bg-gray-50 hover:text-gray-900 bg-transparent">
                Export Data
              </Button>
              <Link href="/admin">
                <Button variant="outline" className="hover:bg-gray-50 hover:text-gray-900 bg-transparent">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">
                  {systemStatus?.operational ? "Operational" : "Issues Detected"}
                </span>
              </div>
              <Activity className="w-8 h-8 text-green-500 mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">ML Models</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 ${systemStatus?.mlModelsActive ? "bg-blue-500" : "bg-gray-400"} rounded-full`}
                ></div>
                <span className="text-sm font-medium text-gray-900">
                  {systemStatus?.mlModelsActive ? "Active" : "Inactive"}
                </span>
              </div>
              <Database className="w-8 h-8 text-blue-500 mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Data Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 ${systemStatus?.dataPipelineRunning ? "bg-purple-500" : "bg-gray-400"} rounded-full`}
                ></div>
                <span className="text-sm font-medium text-gray-900">
                  {systemStatus?.dataPipelineRunning ? "Running" : "Stopped"}
                </span>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500 mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">API Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 ${systemStatus?.apiHealthy ? "bg-orange-500" : "bg-red-500"} rounded-full`}
                ></div>
                <span className="text-sm font-medium text-gray-900">
                  {systemStatus?.apiHealthy ? "Healthy" : "Issues"}
                </span>
              </div>
              <Zap className="w-8 h-8 text-orange-500 mt-2" />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white">
            <TabsTrigger value="overview" className="text-gray-700 data-[state=active]:text-gray-900">
              Overview
            </TabsTrigger>
            <TabsTrigger value="insights" className="text-gray-700 data-[state=active]:text-gray-900">
              ML Insights
            </TabsTrigger>
            <TabsTrigger value="behavior" className="text-gray-700 data-[state=active]:text-gray-900">
              User Behavior
            </TabsTrigger>
            <TabsTrigger value="reports" className="text-gray-700 data-[state=active]:text-gray-900">
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{metrics?.activeUsers || 0}</div>
                  <div className="flex items-center gap-1 mt-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600">Total: {metrics?.totalUsers || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Searches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{metrics?.totalSearches || 0}</div>
                  <div className="flex items-center gap-1 mt-2">
                    <Search className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">This month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Recipes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{metrics?.totalRecipes || 0}</div>
                  <div className="flex items-center gap-1 mt-2">
                    <ChefHat className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-gray-600">In database</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Average Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{metrics?.averageRating || "0.0"}</div>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-600">User feedback</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ChefHat className="w-5 h-5" />
                      Recipe Recommendations
                    </CardTitle>
                    <CardDescription className="text-purple-100">ML-powered recipe suggestion system</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold">6871</div>
                        <div className="text-sm text-purple-100">Total Recipes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-300">32min</div>
                        <div className="text-sm text-purple-100">Avg Cook Time</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Top Cuisines</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Indian</span>
                          <span>1157 recipes</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Continental</span>
                          <span>1021 recipes</span>
                        </div>
                        <div className="flex justify-between">
                          <span>North Indian Recipes</span>
                          <span>938 recipes</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Restaurant Analysis
                    </CardTitle>
                    <CardDescription className="text-blue-100">Restaurant data insights</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold">0</div>
                        <div className="text-sm text-blue-100">Clusters Found</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-300">0</div>
                        <div className="text-sm text-blue-100">Restaurants</div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-2">Average Rating</div>
                      <div className="text-2xl font-bold text-green-300">4.2</div>
                    </div>
                    <div className="text-xs text-blue-200 bg-blue-600/30 p-2 rounded">
                      Restaurant clustering analysis will populate as users interact with the system
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gradient-to-br from-green-500 to-teal-500 text-white lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Sentiment Analysis Results
                  </CardTitle>
                  <CardDescription className="text-green-100">User feedback sentiment analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-200">40%</div>
                      <div className="text-sm text-green-100 mb-2">Positive</div>
                      <div className="w-full bg-green-600/30 rounded-full h-2">
                        <div className="bg-green-300 h-2 rounded-full" style={{ width: "40%" }}></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-yellow-200">20%</div>
                      <div className="text-sm text-green-100 mb-2">Neutral</div>
                      <div className="w-full bg-green-600/30 rounded-full h-2">
                        <div className="bg-yellow-300 h-2 rounded-full" style={{ width: "20%" }}></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-red-200">40%</div>
                      <div className="text-sm text-green-100 mb-2">Negative</div>
                      <div className="w-full bg-green-600/30 rounded-full h-2">
                        <div className="bg-red-300 h-2 rounded-full" style={{ width: "40%" }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-gray-900">Search Trends</CardTitle>
                  <CardDescription className="text-gray-600">Daily search volume over the last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={searchTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#6B7280" }} />
                      <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #E5E7EB",
                          borderRadius: "6px",
                          color: "#1F2937",
                        }}
                      />
                      <Line type="monotone" dataKey="searches" stroke="#3B82F6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-gray-900">User Activity Distribution</CardTitle>
                  <CardDescription className="text-gray-600">Breakdown of user interactions by type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Restaurant Searches</span>
                      <span className="font-semibold text-gray-900">{userBehavior.restaurant || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Recipe Views</span>
                      <span className="font-semibold text-gray-900">{userBehavior.recipe || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Grocery Searches</span>
                      <span className="font-semibold text-gray-900">{userBehavior.grocery || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-gray-900">ML Insights</CardTitle>
                <CardDescription className="text-gray-600">
                  Machine learning analysis and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Run ML analysis to generate insights</p>
                  <Button onClick={runMLAnalysis} className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Zap className="w-4 h-4 mr-2" />
                    Generate ML Insights
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="behavior">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-gray-900">User Behavior Analysis</CardTitle>
                <CardDescription className="text-gray-600">Detailed user interaction patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">User behavior analysis will be displayed here</p>
                  <p className="text-sm text-gray-500">Data is being collected from user interactions</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-gray-900">System Reports</CardTitle>
                <CardDescription className="text-gray-600">
                  Comprehensive system performance and usage reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">System reports will be generated here</p>
                  <p className="text-sm text-gray-500">Export functionality coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
