"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  ChefHat,
  Star,
  TrendingUp,
  Clock,
  RefreshCw,
  Brain,
  Target,
  Activity,
  CheckCircle,
  Search,
  Heart,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { motion } from "framer-motion"

interface UserAnalyticsData {
  personalStats: {
    totalSearches: number
    recipesViewed: number
    restaurantsVisited: number
    avgRating: number
    favoriteRecipes: any[]
    recentActivity: any[]
  }
  recommendations: {
    recipes: any[]
    restaurants: any[]
    cuisines: string[]
  }
  insights: {
    searchPatterns: any
    preferences: any
    achievements: any[]
  }
  dynamicStats: {
    searchPatterns: {
      recipeSearches: number
      restaurantSearches: number
      grocerySearches: number
    }
    mostActiveHour: string
    favoriteCuisine: string
    averageSessionTime: string
    daysActive: string | number // allow string from API ("X days")
  }
}

export default function UserAnalytics() {
  const { user } = useAuth()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<UserAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    loadUserAnalytics()
  }, [user, router])

  const loadUserAnalytics = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/user/analytics", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.analytics)
      } else {
        console.error("Failed to load user analytics:", response.statusText)
        toast({
          title: "Warning",
          description: "Failed to load analytics data",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading user analytics:", error)
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Loading your analytics...</p>
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
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent"
            >
              LatePlate Finder
            </motion.div>

            <div className="flex items-center gap-4">
              <Button
                onClick={loadUserAnalytics}
                variant="outline"
                size="sm"
                className="border-slate-300 hover:bg-slate-50 hover:text-slate-800 bg-transparent"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
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
                Your Food Journey
              </h1>
            </div>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Discover insights about your culinary adventures and get personalized recommendations
          </motion.p>
        </motion.div>

        {/* Personal Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <motion.div whileHover={{ scale: 1.05, y: -5 }} className="group">
            <Card className="bg-white/70 backdrop-blur-sm hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-500 border-0 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Total Searches</p>
                    <p className="text-3xl font-bold text-slate-800 group-hover:scale-110 transition-transform duration-300">
                      {analytics?.personalStats?.totalSearches || 0}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Search className="w-7 h-7 text-blue-600" />
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
                    <p className="text-sm text-slate-600 mb-2">Recipes Viewed</p>
                    <p className="text-3xl font-bold text-slate-800 group-hover:scale-110 transition-transform duration-300">
                      {analytics?.personalStats?.recipesViewed || 0}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <ChefHat className="w-7 h-7 text-green-600" />
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
                    <p className="text-sm text-slate-600 mb-2">Restaurants Visited</p>
                    <p className="text-3xl font-bold text-slate-800 group-hover:scale-110 transition-transform duration-300">
                      {analytics?.personalStats?.restaurantsVisited || 0}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <MapPin className="w-7 h-7 text-purple-600" />
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
                      {analytics?.personalStats?.avgRating?.toFixed(1) || "0.0"}
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

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/70 backdrop-blur-sm">
            <TabsTrigger value="overview" className="text-slate-700 data-[state=active]:text-slate-900">
              Overview
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="text-slate-700 data-[state=active]:text-slate-900">
              Recommendations
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-slate-700 data-[state=active]:text-slate-900">
              Activity
            </TabsTrigger>
            <TabsTrigger value="insights" className="text-slate-700 data-[state=active]:text-slate-900">
              Insights
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader className="bg-red-100 rounded-t-xl">
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <Heart className="w-5 h-5" />
                      Favorite Recipes
                    </CardTitle>
                    <CardDescription className="text-red-800 text-gray-600">Your most loved recipes</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {analytics?.personalStats?.favoriteRecipes?.length > 0 ? (
                        analytics.personalStats.favoriteRecipes.slice(0, 5).map((recipe: any, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, x: 5 }}
                            className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg hover:shadow-md transition-all duration-300"
                          >
                            <div>
                              <h4 className="font-medium text-slate-800">{recipe.name || `Recipe ${index + 1}`}</h4>
                              <p className="text-sm text-slate-600">
                                {recipe.cuisine || "Various"} • {recipe.cookTime || 30} mins
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium text-slate-700">{recipe.rating || 4.5}</span>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-slate-500">
                          <ChefHat className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                          <p className="text-slate-600">No favorite recipes yet</p>
                          <p className="text-sm text-slate-500">Start exploring recipes to see your favorites here!</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader className="bg-blue-100 rounded-t-xl">
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <Activity className="w-5 h-5" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription className="text-blue-800 text-gray-600">
                      Your latest searches and interactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {analytics?.personalStats?.recentActivity?.length > 0 ? (
                        analytics.personalStats.recentActivity.slice(0, 5).map((activity: any, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg"
                          >
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-800">
                                {activity.action || "Searched for recipes"}
                              </p>
                              <p className="text-xs text-slate-500">{activity.timestamp || "Recently"}</p>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-slate-500">
                          <Clock className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                          <p className="text-slate-600">No recent activity</p>
                          <p className="text-sm text-slate-500">Your activity will appear here as you use the app</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations">
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader className="bg-purple-100 rounded-t-xl">
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <Brain className="w-5 h-5" />
                      Recipe Recommendations
                    </CardTitle>
                    <CardDescription className="text-purple-800 text-gray-600">
                      Personalized recipe suggestions based on your preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {analytics?.recommendations?.recipes?.length > 0 ? (
                        analytics.recommendations.recipes.slice(0, 5).map((recipe: any, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            className="p-4 border border-purple-200 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-slate-800">
                                {recipe.name || `Recommended Recipe ${index + 1}`}
                              </h4>
                              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                                {recipe.matchScore || 95}% match
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 mb-2">
                              {recipe.description || "A delicious recipe tailored to your taste preferences"}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span>🍽️ {recipe.cuisine || "International"}</span>
                              <span>⏱️ {recipe.cookTime || 30} mins</span>
                              <span>⭐ {recipe.rating || 4.5}</span>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-slate-500">
                          <Brain className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                          <p className="text-slate-600">No recommendations yet</p>
                          <p className="text-sm text-slate-500">
                            Use the app more to get personalized recommendations!
                          </p>
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
                  <CardHeader className="bg-green-100 rounded-t-xl">
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <MapPin className="w-5 h-5" />
                      Restaurant Suggestions
                    </CardTitle>
                    <CardDescription className="text-green-800 text-gray-600">
                      Restaurants you might like based on your preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {analytics?.recommendations?.restaurants?.length > 0 ? (
                        analytics.recommendations.restaurants.slice(0, 5).map((restaurant: any, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            className="p-4 border border-green-200 rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-teal-50 transition-all duration-300"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-slate-800">
                                {restaurant.name || `Restaurant ${index + 1}`}
                              </h4>
                              <Badge variant="outline" className="border-green-300 text-green-700">
                                {restaurant.distance || "0.5"} km
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 mb-2">
                              {restaurant.cuisine || "Various"} • {restaurant.priceRange || "$$"}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span>⭐ {restaurant.rating || 4.2}</span>
                              <span>📍 {restaurant.location || "Nearby"}</span>
                              <span className={restaurant.openNow ? "text-green-600" : "text-red-600"}>
                                🕒 {restaurant.openNow ? "Open now" : "Closed"}
                              </span>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-slate-500">
                          <MapPin className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                          <p className="text-slate-600">No restaurant suggestions yet</p>
                          <p className="text-sm text-slate-500">
                            Search for restaurants to get personalized suggestions!
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="text-slate-800 text-gray-800">Search Patterns</CardTitle>
                    <CardDescription className="text-slate-600 text-gray-600">
                      Your search behavior over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700">Recipe Searches</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800">
                            {analytics?.dynamicStats?.searchPatterns?.recipeSearches || 0}%
                          </span>
                          <div className="w-24 h-2 bg-slate-200 rounded">
                            <div
                              className="h-2 bg-green-500 rounded"
                              style={{ width: `${analytics?.dynamicStats?.searchPatterns?.recipeSearches || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700">Restaurant Searches</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800">
                            {analytics?.dynamicStats?.searchPatterns?.restaurantSearches || 0}%
                          </span>
                          <div className="w-24 h-2 bg-slate-200 rounded">
                            <div
                              className="h-2 bg-blue-500 rounded"
                              style={{ width: `${analytics?.dynamicStats?.searchPatterns?.restaurantSearches || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700">Grocery Searches</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800">
                            {analytics?.dynamicStats?.searchPatterns?.grocerySearches || 0}%
                          </span>
                          <div className="w-24 h-2 bg-slate-200 rounded">
                            <div
                              className="h-2 bg-purple-500 rounded"
                              style={{ width: `${analytics?.dynamicStats?.searchPatterns?.grocerySearches || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
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
                    <CardTitle className="text-slate-800 text-gray-800">Usage Statistics</CardTitle>
                    <CardDescription className="text-slate-600 text-gray-600">Your app usage patterns</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-700">Most Active Hour</span>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                          {analytics?.dynamicStats?.mostActiveHour || "Not available"}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-700">Favorite Cuisine</span>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                          {analytics?.dynamicStats?.favoriteCuisine || "Not determined yet"}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-700">Average Session</span>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                          {analytics?.dynamicStats?.averageSessionTime || "Not available"}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-700">Days Active</span>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                          {typeof analytics?.dynamicStats?.daysActive === "number"
                            ? `${analytics.dynamicStats.daysActive} days`
                            : analytics?.dynamicStats?.daysActive || "0 days"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights">
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-800 text-gray-800">
                      <Target className="w-5 h-5 text-orange-500" />
                      Your Food Preferences
                    </CardTitle>
                    <CardDescription className="text-slate-600 text-gray-600">
                      Based on your search and rating history
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium text-orange-800">Quick & Easy</h4>
                          <p className="text-sm text-orange-600">You prefer recipes under 30 minutes</p>
                        </div>
                        <Badge className="bg-orange-600 text-white">85%</Badge>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium text-green-800">Healthy Options</h4>
                          <p className="text-sm text-green-600">You often search for nutritious meals</p>
                        </div>
                        <Badge className="bg-green-600 text-white">72%</Badge>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium text-blue-800">International Cuisine</h4>
                          <p className="text-sm text-blue-600">You enjoy diverse flavors</p>
                        </div>
                        <Badge className="bg-blue-600 text-white">68%</Badge>
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
                    <CardTitle className="flex items-center gap-2 text-slate-800 text-gray-800">
                      <TrendingUp className="w-5 h-5 text-purple-500" />
                      Achievements
                    </CardTitle>
                    <CardDescription className="text-slate-600 text-gray-600">
                      Your milestones and accomplishments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics?.insights?.achievements?.length > 0 ? (
                        analytics.insights.achievements.map((achievement: any, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, x: 5 }}
                            className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg"
                          >
                            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-medium text-purple-800">{achievement.title}</h4>
                              <p className="text-sm text-purple-600">{achievement.description}</p>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="space-y-4">
                          <motion.div
                            whileHover={{ scale: 1.02, x: 5 }}
                            className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg"
                          >
                            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-medium text-purple-800">Explorer</h4>
                              <p className="text-sm text-purple-600">Started your culinary journey</p>
                            </div>
                          </motion.div>

                          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg opacity-50">
                            <div className="w-10 h-10 bg-slate-400 rounded-full flex items-center justify-center">
                              <Star className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-600">Recipe Master</h4>
                              <p className="text-sm text-slate-500">Try 10 different recipes</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg opacity-50">
                            <div className="w-10 h-10 bg-slate-400 rounded-full flex items-center justify-center">
                              <Heart className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-600">Food Critic</h4>
                              <p className="text-sm text-slate-500">Rate 25 recipes</p>
                            </div>
                          </div>
                        </div>
                      )}
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
