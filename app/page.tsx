"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  MapPin,
  ChefHat,
  ShoppingCart,
  Clock,
  Star,
  Users,
  TrendingUp,
  Sparkles,
  Zap,
  Heart,
  ArrowRight,
  BarChart3,
  Brain,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/providers/auth-provider"
import { LocationSelector } from "@/components/location-selector"
import { FeedbackModal } from "@/components/feedback-modal"
import { WeatherRecommendations } from "@/components/weather-recommendations"
import { WeatherBanner } from "@/components/weather-banner"
import { motion, AnimatePresence } from "framer-motion"

interface Location {
  _id?: string
  name: string
  address: string
  latitude: number
  longitude: number
  isDefault?: boolean
}

interface UserActivity {
  _id: string
  type: "restaurant" | "recipe" | "grocery"
  action: string
  details: string
  timestamp: string
}

interface UserStats {
  restaurantsFound: number
  recipesTried: number
  groceriesFound: number // Changed from reviewsGiven to groceriesFound
  weeklyGrowth: string
}

export default function HomePage() {
  const [currentTime, setCurrentTime] = useState("")
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [userActivities, setUserActivities] = useState<UserActivity[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [hasUsedModules, setHasUsedModules] = useState(false)
  const { user, logout } = useAuth()

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const savedLocation = localStorage.getItem("currentLocation")
    if (savedLocation) {
      try {
        setSelectedLocation(JSON.parse(savedLocation))
      } catch (error) {
        console.error("Error parsing saved location:", error)
      }
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchUserActivities()
      fetchUserStats()
      checkModuleUsage()
    }
  }, [user])

  const fetchUserActivities = async () => {
    try {
      const response = await fetch("/api/user/activities", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setUserActivities(data.activities || [])
      }
    } catch (error) {
      console.error("Failed to fetch user activities:", error)
    }
  }

  const fetchUserStats = async () => {
    try {
      const response = await fetch("/api/user/stats", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setUserStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch user stats:", error)
    }
  }

  const checkModuleUsage = async () => {
    try {
      const response = await fetch("/api/user/activities", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        const moduleActivities =
          data.activities?.filter((a: any) => ["restaurant", "recipe", "grocery"].includes(a.type)) || []

        if (moduleActivities.length > 0) {
          setHasUsedModules(true)

          // Check if user hasn't given feedback today and has used modules
          const lastFeedbackDate = localStorage.getItem(`lastFeedback_${user?.id}`)
          const today = new Date().toDateString()

          if (lastFeedbackDate !== today && moduleActivities.length >= 1) {
            // Show feedback modal after a delay, but only if user has interacted with modules recently
            const recentActivity = moduleActivities.find((activity: any) => {
              const activityDate = new Date(activity.timestamp)
              const timeDiff = Date.now() - activityDate.getTime()
              return timeDiff < 5 * 60 * 1000 // Within last 5 minutes
            })

            if (recentActivity) {
              setTimeout(() => setShowFeedbackModal(true), 2000) // Show after 2 seconds
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to check module usage:", error)
    }
  }

  const logUserActivity = async (type: string, action: string, details: string, metadata = {}) => {
    if (!user) return

    try {
      await fetch("/api/user/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          type,
          action,
          details,
          metadata,
          timestamp: new Date().toISOString(),
        }),
      })
      // Refresh activities after logging
      fetchUserActivities()
      fetchUserStats()
    } catch (error) {
      console.error("Failed to log user activity:", error)
    }
  }

  const features = [
    {
      icon: MapPin,
      title: "Find Open Restaurants",
      description: "Smart restaurant discovery with personalized recommendations",
      href: "/restaurants",
      gradient: "from-orange-500 to-red-500",
      hoverGradient: "from-orange-600 to-red-600",
      bgGradient: "from-orange-50 to-red-50",
      type: "restaurant",
      analytics: "Location-based filtering • Cuisine preferences • Rating analysis",
    },
    {
      icon: ChefHat,
      title: "Recipe Recommendations",
      description: "Smart recipe matching based on your ingredients and dietary needs",
      href: "/recipes",
      gradient: "from-purple-500 to-pink-500",
      hoverGradient: "from-purple-600 to-pink-600",
      bgGradient: "from-purple-50 to-pink-50",
      type: "recipe",
      analytics: "Ingredient matching • Dietary analysis • Cooking time optimization",
    },
    {
      icon: ShoppingCart,
      title: "24/7 Grocery Stores",
      description: "Intelligent store finder with real-time availability and distance optimization",
      href: "/grocery",
      gradient: "from-green-500 to-blue-500",
      hoverGradient: "from-green-600 to-blue-600",
      bgGradient: "from-green-50 to-blue-50",
      type: "grocery",
      analytics: "Distance optimization • Store type filtering • Availability tracking",
    },
  ]

  const defaultStats = [
    { icon: Users, label: "Active Users", value: "45+" },
    { icon: MapPin, label: "Restaurants", value: "500+" },
    { icon: ChefHat, label: "Recipes", value: "6.7K+" },
    { icon: Star, label: "Reviews", value: "3.3/5" },
  ]

  // User-specific stats if logged in
  const displayUserStats =
    user && userStats
      ? [
          {
            label: "Restaurants Found",
            value: userStats.restaurantsFound.toString(),
            icon: MapPin,
            color: "text-orange-600",
            bg: "bg-orange-100",
          },
          {
            label: "Recipes Tried",
            value: userStats.recipesTried.toString(),
            icon: ChefHat,
            color: "text-purple-600",
            bg: "bg-purple-100",
          },
          {
            label: "Groceries Found", // Changed from "Reviews Given" to "Groceries Found"
            value: userStats.groceriesFound.toString(),
            icon: ShoppingCart, // Changed icon from Star to ShoppingCart
            color: "text-green-600", // Changed color from yellow to green
            bg: "bg-green-100", // Changed background from yellow to green
          },
          {
            label: "This Week",
            value: userStats.weeklyGrowth,
            icon: TrendingUp,
            color: "text-green-600",
            bg: "bg-green-100",
          },
        ]
      : []

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "restaurant":
        return MapPin
      case "recipe":
        return ChefHat
      case "grocery":
        return ShoppingCart
      default:
        return MapPin
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "restaurant":
        return { gradient: "from-blue-50 to-blue-100", iconColor: "text-blue-500" }
      case "recipe":
        return { gradient: "from-green-50 to-green-100", iconColor: "text-green-500" }
      case "grocery":
        return { gradient: "from-purple-50 to-purple-100", iconColor: "text-purple-500" }
      default:
        return { gradient: "from-gray-50 to-gray-100", iconColor: "text-gray-500" }
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const activityTime = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
    return `${Math.floor(diffInMinutes / 1440)} days ago`
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
  }

  const handleFeatureClick = (feature: any) => {
    if (user) {
      logUserActivity(feature.type, "clicked", `Clicked on ${feature.title}`, {
        feature: feature.title,
        timestamp: new Date().toISOString(),
      }).then(() => {
        // Check if we should show feedback modal after this interaction
        setTimeout(() => {
          checkModuleUsage()
        }, 1000)
      })
    }
  }

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location)
    localStorage.setItem("currentLocation", JSON.stringify(location))

    console.log("[v0] Home page dispatching location change:", {
      lat: location.latitude,
      lng: location.longitude,
      name: location.name,
      address: location.address,
    })

    // Trigger location change event for other components
    window.dispatchEvent(
      new CustomEvent("locationChanged", {
        detail: {
          lat: location.latitude,
          lng: location.longitude,
          name: location.name,
          address: location.address,
        },
      }),
    )

    // Log location selection if user is logged in
    if (user) {
      logUserActivity("location", "selected", `Selected location: ${location.name}`, {
        locationId: location._id,
        locationName: location.name,
        coordinates: { latitude: location.latitude, longitude: location.longitude },
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Navigation - Mobile Responsive */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-slate-200/50 sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent"
            >
              LatePlate Finder
            </motion.div>

            {/* Enhanced Location Selector - Mobile Responsive */}
            <div className="flex-1 max-w-md mx-4 sm:mx-8 w-full sm:w-auto">
              <LocationSelector onLocationSelect={handleLocationSelect} selectedLocation={selectedLocation} />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              {/* Weather Widget Display in Navigation */}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2 text-slate-600 order-2 sm:order-2"
              >
                <Clock className="w-4 h-4 text-slate-500" />
                <span className="font-medium text-sm sm:text-base">{currentTime}</span>
              </motion.div>

              {user ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 order-1 sm:order-2"
                >
                  <span className="text-slate-600 text-sm sm:text-base text-center sm:text-left">
                    Welcome, <span className="font-semibold text-slate-800">{user.name}</span>
                  </span>

                  {/* Analytics Buttons - Mobile Responsive */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {user.role == "user" && (
                      <Link href="/user-analytics">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent transition-all duration-300 text-xs sm:text-sm"
                        >
                          <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Explore Your Journey</span>
                          <span className="sm:hidden">Analytics</span>
                        </Button>
                      </Link>
                    )}
                    {user.role === "admin" && (
                      <Link href="/admin/dashboard">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-purple-300 text-purple-700 hover:bg-purple-50 bg-transparent transition-all duration-300 text-xs sm:text-sm"
                        >
                          <Brain className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Insights</span>
                          <span className="sm:hidden">Admin</span>
                        </Button>
                      </Link>
                    )}

                    <Link href="/profile">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent transition-all duration-300 text-xs sm:text-sm"
                      >
                        Profile
                      </Button>
                    </Link>
                  </div>

                  <Button
                    onClick={logout}
                    variant="destructive"
                    size="sm"
                    className="bg-red-500 hover:bg-red-600 transition-all duration-300 text-xs sm:text-sm"
                  >
                    Logout
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex gap-2 sm:gap-3 order-1 sm:order-2"
                >
                  <Link href="/auth/login">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent transition-all duration-300 text-xs sm:text-sm"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white transition-all duration-300 text-xs sm:text-sm"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero Section - Mobile Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12 sm:mb-20"
        >
          {user ? (
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
                  <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 absolute -top-3 -right-3" />
                </motion.div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800 bg-clip-text text-transparent px-4">
                  {getGreeting()}, {user.name}!
                </h1>
              </div>
            </div>
          ) : (
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-4xl sm:text-6xl lg:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800 mb-8 px-4"
            >
              Late Night
              <br />
              <span className="text-amber-500">Food Discovery</span>
            </motion.h1>
          )}

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-600 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-4"
          >
            {user
              ? "Ready to discover amazing food options? Your Smart companion uses advanced analytics to find the perfect match for your taste and location."
              : "Your companion to discover open restaurants, get personalized recipe suggestions, or find 24/7 grocery stores with smart recommendations."}
          </motion.p>

          {!user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white text-base sm:text-lg px-8 sm:px-10 py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          )}
        </motion.div>

        {/* Weather-Based Recommendations - Enhanced Section */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-12 sm:mb-16"
          >
            <div className="mb-8">
              <WeatherBanner location={selectedLocation || undefined} />
            </div>
            {/* Keep recommendation cards below banner */}
            <WeatherRecommendations location={selectedLocation} />
          </motion.div>
        )}

        {/* User Stats - Mobile Responsive */}
        {user && displayUserStats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16"
          >
            {displayUserStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group"
              >
                <Card className="bg-white/70 backdrop-blur-sm hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-500 border-0 overflow-hidden">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-slate-600 mb-2">{stat.label}</p>
                        <p className="text-2xl sm:text-3xl font-bold text-slate-800 group-hover:scale-110 transition-transform duration-300">
                          {stat.value}
                        </p>
                      </div>
                      <div
                        className={`w-10 h-10 sm:w-14 sm:h-14 ${stat.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
                      >
                        <stat.icon className={`w-5 h-5 sm:w-7 sm:h-7 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Feature Cards - Mobile Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-20"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ scale: 1.02, y: -10 }}
              className="group"
            >
              <Card className="bg-white/70 backdrop-blur-sm hover:bg-white/90 shadow-lg hover:shadow-2xl transition-all duration-500 border-0 overflow-hidden h-full">
                <CardContent className="p-6 sm:p-8 text-center relative h-full flex flex-col">
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                    <feature.icon className="w-full h-full" />
                  </div>

                  <div className="relative z-10 flex-1 flex flex-col">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 6 }}
                      transition={{ duration: 0.3 }}
                      className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg`}
                    >
                      <feature.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </motion.div>

                    <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3 sm:mb-4 group-hover:text-slate-900 transition-colors">
                      {feature.title}
                    </h3>

                    <p className="text-slate-600 mb-3 sm:mb-4 group-hover:text-slate-700 transition-colors flex-1 text-sm sm:text-base">
                      {feature.description}
                    </p>

                    <div className="text-xs text-slate-500 mb-4 sm:mb-6 p-2 sm:p-3 bg-slate-50 rounded-lg">
                      <strong>Analytics:</strong> {feature.analytics}
                    </div>

                    <Link href={feature.href} onClick={() => handleFeatureClick(feature)}>
                      <Button
                        className={`bg-gradient-to-r ${feature.gradient} hover:${feature.hoverGradient} text-white px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 w-full rounded-xl`}
                      >
                        <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        {user ? "Start Now" : "Explore Now"}
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Activity - Mobile Responsive */}
        <AnimatePresence>
          {user && userActivities.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0 mb-12 sm:mb-16">
                <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-t-xl">
                  <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription className="text-slate-200 text-sm sm:text-base">
                    Your latest food discoveries and interactions
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-8">
                  <div className="space-y-3 sm:space-y-4">
                    {userActivities.slice(0, 5).map((activity, index) => {
                      const ActivityIcon = getActivityIcon(activity.type)
                      const colors = getActivityColor(activity.type)
                      return (
                        <motion.div
                          key={activity._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          whileHover={{ scale: 1.02, x: 10 }}
                          className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r ${colors.gradient} rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer`}
                        >
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                            <ActivityIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${colors.iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-800 text-sm sm:text-base truncate">
                              {activity.details}
                            </p>
                            <p className="text-xs sm:text-sm text-slate-600 capitalize">
                              {activity.type} • {formatTimeAgo(activity.timestamp)}
                            </p>
                          </div>
                          <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0" />
                        </motion.div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Section (for non-logged in users) - Mobile Responsive */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
          >
            {defaultStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center group"
              >
                <div className="bg-white/30 backdrop-blur-sm rounded-2xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-white/50 transition-all duration-300">
                  <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-slate-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">{stat.value}</div>
                <div className="text-slate-600 text-xs sm:text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedbackModal && hasUsedModules && (
          <FeedbackModal isOpen={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
