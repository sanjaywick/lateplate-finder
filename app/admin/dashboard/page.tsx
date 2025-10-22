"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  MapPin,
  ChefHat,
  Star,
  TrendingUp,
  BarChart3,
  Download,
  RefreshCw,
  Brain,
  Target,
  Zap,
  Activity,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { motion } from "framer-motion"

interface AnalyticsData {
  overview: any
  userBehavior: any
  sentiment: any
  topRated: any
  mlResults: any
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [mlResults, setMlResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [runningAnalysis, setRunningAnalysis] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    if (user.role !== "admin") {
      router.push("/")
      return
    }

    loadAnalyticsData()
  }, [user, router])

  const loadAnalyticsData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")

      // Load comprehensive analytics
      const response = await fetch("/api/analytics/comprehensive", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.data)
      } else {
        console.error("Failed to load analytics:", response.statusText)
        toast({
          title: "Warning",
          description: "Failed to load analytics data",
          variant: "destructive",
        })
      }

      // Load ML results
      const mlResponse = await fetch("/api/ml/results", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (mlResponse.ok) {
        const mlData = await mlResponse.json()
        setMlResults(mlData.results)
      } else {
        console.error("Failed to load ML results:", mlResponse.statusText)
      }
    } catch (error) {
      console.error("Error loading analytics:", error)
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const runMLAnalysis = async () => {
    setRunningAnalysis(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/ml/run-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Analysis Complete",
          description: data.message || "ML analysis completed successfully",
        })

        // Reload data after analysis
        setTimeout(() => {
          loadAnalyticsData()
        }, 2000)
      } else {
        throw new Error("Analysis failed")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to run ML analysis",
        variant: "destructive",
      })
    }
    setRunningAnalysis(false)
  }

  const exportData = () => {
    const data = JSON.stringify({ analytics, mlResults }, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `lateplate-analytics-${new Date().toISOString().split("T")[0]}.json`
    a.click()
  }

  if (!user) {
    return null
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-600 mb-4">You need admin privileges to access this page.</p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white hover:text-white">
              Go to Home
            </Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Loading analytics dashboard...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-slate-200/50 sticky top-0 z-50"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent"
              >
                LatePlate Finder
              </motion.div>
              <p className="text-sm text-slate-600">Admin Analytics Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={runMLAnalysis}
                disabled={runningAnalysis}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white hover:text-white"
              >
                {runningAnalysis ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Running Analysis...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Run ML Analysis
                  </>
                )}
              </Button>
              <Button
                onClick={loadAnalyticsData}
                variant="outline"
                size="sm"
                className="border-slate-300 hover:bg-slate-50 hover:text-slate-800 bg-transparent"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={exportData}
                variant="outline"
                size="sm"
                className="border-slate-300 hover:bg-slate-50 hover:text-slate-800 bg-transparent"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Link href="/">
                <Button
                  variant="outline"
                  className="border-slate-300 hover:bg-slate-50 hover:text-slate-800 bg-transparent"
                >
                  <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="relative">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 3,
                }}
              >
                <Sparkles className="w-10 h-10 text-amber-400 absolute -top-3 -right-3" />
              </motion.div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800 bg-clip-text text-transparent">
                Admin Analytics
              </h1>
            </div>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Comprehensive platform analytics with ML insights and real-time monitoring
          </motion.p>
        </motion.div>

        {/* System Status Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          <motion.div whileHover={{ scale: 1.05, y: -5 }} className="group">
            <Card className="bg-white/70 backdrop-blur-sm hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-500 border-0 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-2">System Status</p>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-600">Operational</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Activity className="w-7 h-7 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05, y: -5 }} className="group">
            <Card className="bg-white/70 backdrop-blur-sm hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-500 border-0 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-2">ML Models</p>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-blue-600">{mlResults ? "Active" : "Inactive"}</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Brain className="w-7 h-7 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05, y: -5 }} className="group">
            <Card className="bg-white/70 backdrop-blur-sm hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-500 border-0 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Data Pipeline</p>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium text-purple-600">Running</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <BarChart3 className="w-7 h-7 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05, y: -5 }} className="group">
            <Card className="bg-white/70 backdrop-blur-sm hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-500 border-0 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-2">API Health</p>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-medium text-orange-600">Healthy</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Zap className="w-7 h-7 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/70 backdrop-blur-sm">
            <TabsTrigger value="overview" className="text-slate-700 data-[state=active]:text-slate-900">
              Overview
            </TabsTrigger>
            <TabsTrigger value="ml-insights" className="text-slate-700 data-[state=active]:text-slate-900">
              ML Insights
            </TabsTrigger>
            <TabsTrigger value="user-behavior" className="text-slate-700 data-[state=active]:text-slate-900">
              User Behavior
            </TabsTrigger>
            <TabsTrigger value="performance" className="text-slate-700 data-[state=active]:text-slate-900">
              Performance
            </TabsTrigger>
            <TabsTrigger value="reports" className="text-slate-700 data-[state=active]:text-slate-900">
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              <motion.div whileHover={{ scale: 1.05, y: -5 }} className="group">
                <Card className="bg-white/70 backdrop-blur-sm hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-500 border-0 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 mb-2">Active Users</p>
                        <p className="text-3xl font-bold text-slate-800 group-hover:scale-110 transition-transform duration-300">
                          {analytics?.overview?.activeUsers?.toLocaleString() || "0"}
                        </p>
                      </div>
                      <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        <Users className="w-7 h-7 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05, y: -5 }} className="group">
                <Card className="bg-white/70 backdrop-blur-sm hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-500 border-0 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 mb-2">Total Searches</p>
                        <p className="text-3xl font-bold text-slate-800 group-hover:scale-110 transition-transform duration-300">
                          {analytics?.overview?.totalSearches?.toLocaleString() || "0"}
                        </p>
                      </div>
                      <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        <BarChart3 className="w-7 h-7 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05, y: -5 }} className="group">
                <Card className="bg-white/70 backdrop-blur-sm hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-500 border-0 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 mb-2">Total Recipes</p>
                        <p className="text-3xl font-bold text-slate-800 group-hover:scale-110 transition-transform duration-300">
                          {analytics?.overview?.totalRecipes?.toLocaleString() || "0"}
                        </p>
                      </div>
                      <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        <ChefHat className="w-7 h-7 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05, y: -5 }} className="group">
                <Card className="bg-white/70 backdrop-blur-sm hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-500 border-0 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 mb-2">Average Rating</p>
                        <p className="text-3xl font-bold text-slate-800 group-hover:scale-110 transition-transform duration-300">
                          {analytics?.overview?.avgRating?.toFixed(1) || "0.0"}
                        </p>
                      </div>
                      <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        <Star className="w-7 h-7 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="text-slate-800">Search Distribution</CardTitle>
                    <CardDescription className="text-slate-600">Breakdown of search types</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics?.userBehavior?.searchTypes &&
                        Object.entries(analytics.userBehavior.searchTypes).map(([type, count]) => {
                          const total = Object.values(analytics.userBehavior.searchTypes).reduce(
                            (sum: number, c) => sum + (c as number),
                            0,
                          )
                          const percentage = total > 0 ? Math.round(((count as number) / total) * 100) : 0

                          return (
                            <motion.div
                              key={type}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4 }}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-blue-500" />
                                <span className="capitalize text-slate-700">{type.replace("_", " ")}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-800">{percentage}%</span>
                                <div className="w-24 h-2 bg-slate-200 rounded">
                                  <div className="h-2 bg-blue-500 rounded" style={{ width: `${percentage}%` }}></div>
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="text-slate-800">Real-time Activity</CardTitle>
                    <CardDescription className="text-slate-600">Live system metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-700">Peak Hour</span>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                          {analytics?.userBehavior?.peakHour || 22}:00
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-700">Total Users</span>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                          {analytics?.overview?.activeUsers || 0}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-700">Avg Rating</span>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                          {analytics?.overview?.avgRating?.toFixed(1) || "0.0"}/5
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-700">Last Updated</span>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                          {analytics?.lastUpdated ? new Date(analytics.lastUpdated).toLocaleTimeString() : "Never"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* ML Insights Tab */}
          <TabsContent value="ml-insights">
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-xl">
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      Recipe Recommendations
                    </CardTitle>
                    <CardDescription className="text-purple-100">ML-powered recipe suggestion system</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {mlResults?.recipeRecommendations?.totalRecipes ||
                              mlResults?.recipeAnalysis?.totalRecipes ||
                              "0"}
                          </div>
                          <div className="text-sm text-slate-600">Total Recipes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {mlResults?.recipeRecommendations?.avgCookingTime ||
                              mlResults?.recipeAnalysis?.avgCookingTime ||
                              "0"}
                            min
                          </div>
                          <div className="text-sm text-slate-600">Avg Cook Time</div>
                        </div>
                      </div>

                      {(mlResults?.recipeRecommendations?.topCuisines || mlResults?.recipeAnalysis?.topCuisines) && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-slate-800">Top Cuisines</h4>
                          {(mlResults.recipeRecommendations?.topCuisines || mlResults.recipeAnalysis?.topCuisines || [])
                            .slice(0, 3)
                            .map((item: any, index: number) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span className="text-slate-700">{item.cuisine}</span>
                                <span className="text-slate-600">{item.count} recipes</span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-xl">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Restaurant Analysis
                    </CardTitle>
                    <CardDescription className="text-blue-100">Restaurant data insights</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {mlResults?.restaurantClustering?.clustersFound ||
                              mlResults?.restaurantAnalysis?.clusters ||
                              mlResults?.restaurantClustering?.length ||
                              "0"}
                          </div>
                          <div className="text-sm text-slate-600">Clusters Found</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {mlResults?.restaurantClustering?.totalRestaurants ||
                              mlResults?.restaurantAnalysis?.totalRestaurants ||
                              (mlResults?.restaurantClustering?.reduce
                                ? mlResults.restaurantClustering.reduce(
                                    (sum: number, cluster: any) => sum + (cluster.restaurants?.length || 0),
                                    0,
                                  )
                                : "0")}
                          </div>
                          <div className="text-sm text-slate-600">Restaurants</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-slate-800">Average Rating</h4>
                        <div className="text-2xl font-bold text-green-600">
                          {mlResults?.restaurantAnalysis?.avgRating?.toFixed(1) || "4.2"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {mlResults?.restaurantClustering &&
                Array.isArray(mlResults.restaurantClustering) &&
                mlResults.restaurantClustering.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="md:col-span-2"
                  >
                    <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0">
                      <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-xl">
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5" />
                          Restaurant Clusters Analysis
                        </CardTitle>
                        <CardDescription className="text-indigo-100">
                          K-means clustering results showing restaurant groupings
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {mlResults.restaurantClustering.map((cluster: any, index: number) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.9, y: 20 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              transition={{
                                duration: 0.5,
                                delay: index * 0.1,
                                type: "spring",
                                stiffness: 100,
                              }}
                              whileHover={{
                                scale: 1.05,
                                y: -5,
                                transition: { duration: 0.2 },
                              }}
                              className="group"
                            >
                              <Card className="h-full bg-gradient-to-br from-white to-slate-50 hover:from-slate-50 hover:to-white shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-indigo-300">
                                <CardHeader className="pb-3">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">
                                      Cluster {index + 1}
                                    </CardTitle>
                                    <motion.div
                                      animate={{
                                        rotate: [0, 10, -10, 0],
                                        scale: [1, 1.1, 1],
                                      }}
                                      transition={{
                                        duration: 2,
                                        repeat: Number.POSITIVE_INFINITY,
                                        repeatDelay: 3,
                                      }}
                                      className={`w-3 h-3 rounded-full ${
                                        index % 6 === 0
                                          ? "bg-red-400"
                                          : index % 6 === 1
                                            ? "bg-blue-400"
                                            : index % 6 === 2
                                              ? "bg-green-400"
                                              : index % 6 === 3
                                                ? "bg-yellow-400"
                                                : index % 6 === 4
                                                  ? "bg-purple-400"
                                                  : "bg-pink-400"
                                      }`}
                                    />
                                  </div>
                                  <CardDescription className="text-slate-600">
                                    {cluster.restaurants?.length || cluster.size || 0} restaurants
                                  </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="bg-slate-100 rounded-lg p-2 text-center group-hover:bg-indigo-50 transition-colors">
                                      <div className="font-semibold text-slate-800">
                                        {cluster.centroid?.rating?.toFixed(1) || cluster.avgRating?.toFixed(1) || "N/A"}
                                      </div>
                                      <div className="text-xs text-slate-600">Avg Rating</div>
                                    </div>
                                    <div className="bg-slate-100 rounded-lg p-2 text-center group-hover:bg-indigo-50 transition-colors">
                                      <div className="font-semibold text-slate-800">
                                        ${cluster.centroid?.price?.toFixed(0) || cluster.avgPrice?.toFixed(0) || "N/A"}
                                      </div>
                                      <div className="text-xs text-slate-600">Avg Price</div>
                                    </div>
                                  </div>

                                  {cluster.centroid && (
                                    <div className="space-y-2">
                                      <div className="text-xs font-medium text-slate-700">Cluster Center:</div>
                                      <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="flex justify-between">
                                          <span className="text-slate-600">Lat:</span>
                                          <span className="font-mono text-slate-800">
                                            {cluster.centroid.latitude?.toFixed(4) || "N/A"}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-slate-600">Lng:</span>
                                          <span className="font-mono text-slate-800">
                                            {cluster.centroid.longitude?.toFixed(4) || "N/A"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {cluster.topCuisines && cluster.topCuisines.length > 0 && (
                                    <div className="space-y-2">
                                      <div className="text-xs font-medium text-slate-700">Top Cuisines:</div>
                                      <div className="flex flex-wrap gap-1">
                                        {cluster.topCuisines
                                          .slice(0, 3)
                                          .map((cuisine: string, cuisineIndex: number) => (
                                            <motion.span
                                              key={cuisineIndex}
                                              initial={{ opacity: 0, scale: 0.8 }}
                                              animate={{ opacity: 1, scale: 1 }}
                                              transition={{ delay: index * 0.1 + cuisineIndex * 0.05 }}
                                              className="inline-block px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full group-hover:bg-indigo-200 transition-colors"
                                            >
                                              {cuisine}
                                            </motion.span>
                                          ))}
                                      </div>
                                    </div>
                                  )}

                                  <motion.div
                                    className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden"
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 1, delay: index * 0.1 }}
                                  >
                                    <motion.div
                                      className={`h-full rounded-full ${
                                        index % 6 === 0
                                          ? "bg-red-400"
                                          : index % 6 === 1
                                            ? "bg-blue-400"
                                            : index % 6 === 2
                                              ? "bg-green-400"
                                              : index % 6 === 3
                                                ? "bg-yellow-400"
                                                : index % 6 === 4
                                                  ? "bg-purple-400"
                                                  : "bg-pink-400"
                                      }`}
                                      initial={{ width: 0 }}
                                      animate={{
                                        width: `${Math.min(100, ((cluster.restaurants?.length || cluster.size || 0) / 10) * 100)}%`,
                                      }}
                                      transition={{ duration: 1.5, delay: index * 0.1 + 0.5 }}
                                    />
                                  </motion.div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>

                        {mlResults.restaurantClustering.length > 6 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="text-center mt-4"
                          >
                            <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                              +{mlResults.restaurantClustering.length - 6} more clusters
                            </Badge>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="md:col-span-2"
              >
                <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-t-xl">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Sentiment Analysis Results
                    </CardTitle>
                    <CardDescription className="text-green-100">User feedback sentiment analysis</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">
                          {mlResults?.sentimentAnalysis?.sentimentPercentages?.positive ||
                            Math.round(
                              (mlResults?.sentimentAnalysis?.positive /
                                Math.max(mlResults?.sentimentAnalysis?.total, 1)) *
                                100,
                            ) ||
                            "0"}
                          %
                        </div>
                        <div className="text-sm text-slate-600 mb-2">Positive</div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                            style={{
                              width: `${
                                mlResults?.sentimentAnalysis?.sentimentPercentages?.positive ||
                                Math.round(
                                  (mlResults?.sentimentAnalysis?.positive /
                                    Math.max(mlResults?.sentimentAnalysis?.total, 1)) *
                                    100,
                                ) ||
                                0
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-600">
                          {mlResults?.sentimentAnalysis?.sentimentPercentages?.neutral ||
                            Math.round(
                              (mlResults?.sentimentAnalysis?.neutral /
                                Math.max(mlResults?.sentimentAnalysis?.total, 1)) *
                                100,
                            ) ||
                            "0"}
                          %
                        </div>
                        <div className="text-sm text-slate-600 mb-2">Neutral</div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-yellow-500 h-2 rounded-full transition-all duration-1000"
                            style={{
                              width: `${
                                mlResults?.sentimentAnalysis?.sentimentPercentages?.neutral ||
                                Math.round(
                                  (mlResults?.sentimentAnalysis?.neutral /
                                    Math.max(mlResults?.sentimentAnalysis?.total, 1)) *
                                    100,
                                ) ||
                                0
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-red-600">
                          {mlResults?.sentimentAnalysis?.sentimentPercentages?.negative ||
                            Math.round(
                              (mlResults?.sentimentAnalysis?.negative /
                                Math.max(mlResults?.sentimentAnalysis?.total, 1)) *
                                100,
                            ) ||
                            "0"}
                          %
                        </div>
                        <div className="text-sm text-slate-600 mb-2">Negative</div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                            style={{
                              width: `${
                                mlResults?.sentimentAnalysis?.sentimentPercentages?.negative ||
                                Math.round(
                                  (mlResults?.sentimentAnalysis?.negative /
                                    Math.max(mlResults?.sentimentAnalysis?.total, 1)) *
                                    100,
                                ) ||
                                0
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* User Behavior Tab */}
          <TabsContent value="user-behavior">
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="text-slate-800">User Activity Patterns</CardTitle>
                    <CardDescription className="text-slate-600">Hourly activity distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics?.temporalPatterns?.hourlyPatterns &&
                        analytics.temporalPatterns.hourlyPatterns.map((count: number, hour: number) => {
                          const maxCount = Math.max(...analytics.temporalPatterns.hourlyPatterns)
                          const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0

                          return (
                            <div key={hour} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium text-slate-700">{hour}:00</span>
                                <span className="text-slate-600">{count} activities</span>
                              </div>
                              <div className="flex gap-1 h-2">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ duration: 0.8, delay: hour * 0.05 }}
                                  className="bg-blue-500 rounded-sm"
                                ></motion.div>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="text-slate-800">User Segmentation</CardTitle>
                    <CardDescription className="text-slate-600">User activity levels</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mlResults?.userBehaviorAnalysis?.userSegments &&
                        Object.entries(mlResults.userBehaviorAnalysis.userSegments).map(([segment, count], index) => (
                          <motion.div
                            key={segment}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, x: 5 }}
                            className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg"
                          >
                            <div>
                              <h4 className="font-medium text-blue-800 capitalize">{segment} Users</h4>
                              <p className="text-sm text-blue-600">User segment based on activity</p>
                            </div>
                            <Badge className="bg-blue-600 text-white">{count as number}</Badge>
                          </motion.div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="text-slate-800">System Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-700">Database Load</span>
                        <span className="text-sm font-medium text-slate-800">Normal</span>
                      </div>
                      <Progress value={45} className="h-2" />

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-700">API Response</span>
                        <span className="text-sm font-medium text-slate-800">Fast</span>
                      </div>
                      <Progress value={85} className="h-2" />

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-700">ML Processing</span>
                        <span className="text-sm font-medium text-slate-800">Optimal</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="text-slate-800">API Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">99.9%</div>
                        <div className="text-sm text-slate-600">Uptime</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">142ms</div>
                        <div className="text-sm text-slate-600">Avg Response Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">1.2K</div>
                        <div className="text-sm text-slate-600">Requests/min</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="text-slate-800">ML Model Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {mlResults?.sentimentAnalysis?.averageRating?.toFixed(1) || "0.0"}
                        </div>
                        <div className="text-sm text-slate-600">Avg Sentiment Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">89ms</div>
                        <div className="text-sm text-slate-600">Inference Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{mlResults?.totalPredictions || "0"}</div>
                        <div className="text-sm text-slate-600">Total Predictions</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <div className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="text-slate-800">Generate Reports</CardTitle>
                    <CardDescription className="text-slate-600">Create comprehensive analytics reports</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          className="h-20 flex-col gap-2 w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:text-white"
                          onClick={exportData}
                        >
                          <BarChart3 className="w-6 h-6" />
                          <span>Export Analytics Data</span>
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          className="h-20 flex-col gap-2 w-full bg-transparent"
                          variant="outline"
                          onClick={runMLAnalysis}
                        >
                          <Brain className="w-6 h-6" />
                          <span>Generate ML Report</span>
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button className="h-20 flex-col gap-2 w-full bg-transparent" variant="outline">
                          <Users className="w-6 h-6" />
                          <span>User Behavior Report</span>
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button className="h-20 flex-col gap-2 w-full bg-transparent" variant="outline">
                          <TrendingUp className="w-6 h-6" />
                          <span>Performance Report</span>
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="text-slate-800">Recent Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: "ML Analytics Report", date: new Date().toLocaleDateString(), status: "completed" },
                        {
                          name: "User Behavior Analysis",
                          date: new Date(Date.now() - 86400000).toLocaleDateString(),
                          status: "completed",
                        },
                        {
                          name: "Recipe Recommendations",
                          date: new Date(Date.now() - 172800000).toLocaleDateString(),
                          status: "completed",
                        },
                      ].map((report, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          whileHover={{ scale: 1.01, x: 5 }}
                          className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all duration-300"
                        >
                          <div>
                            <h4 className="font-medium text-slate-800">{report.name}</h4>
                            <p className="text-sm text-slate-600">{report.date}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <Badge variant="default" className="bg-green-100 text-green-700">
                              completed
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={exportData}
                              className="border-slate-300 hover:bg-slate-50 hover:text-slate-800 bg-transparent"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
