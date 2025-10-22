"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { MapPin, ChefHat, ShoppingCart, Star, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface Location {
  _id?: string
  name: string
  address: string
  latitude: number
  longitude: number
  isDefault?: boolean
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [currentTime, setCurrentTime] = useState("")

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    // Redirect to home page since we've consolidated everything there
    router.replace("/")

    // Update time every second
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [user, router])

  if (!user) return null

  const quickActions = [
    {
      icon: MapPin,
      title: "Find Restaurants",
      description: "Discover open restaurants nearby",
      href: "/restaurants",
      gradient: "from-orange-500 to-red-500",
      hoverGradient: "from-orange-600 to-red-600",
      bgGradient: "from-orange-50 to-red-50",
    },
    {
      icon: ChefHat,
      title: "Get Recipes",
      description: "Find recipes with your ingredients",
      href: "/recipes",
      gradient: "from-purple-500 to-pink-500",
      hoverGradient: "from-purple-600 to-pink-600",
      bgGradient: "from-purple-50 to-pink-50",
    },
    {
      icon: ShoppingCart,
      title: "Find Groceries",
      description: "Locate 24/7 grocery stores",
      href: "/grocery",
      gradient: "from-green-500 to-blue-500",
      hoverGradient: "from-green-600 to-blue-600",
      bgGradient: "from-green-50 to-blue-50",
    },
  ]

  const stats = [
    { label: "Restaurants Found", value: "23", icon: MapPin, color: "text-orange-600", bg: "bg-orange-100" },
    { label: "Recipes Tried", value: "8", icon: ChefHat, color: "text-purple-600", bg: "bg-purple-100" },
    { label: "Reviews Given", value: "5", icon: Star, color: "text-yellow-600", bg: "bg-yellow-100" },
    { label: "This Week", value: "+12%", icon: TrendingUp, color: "text-green-600", bg: "bg-green-100" },
  ]

  const recentActivity = [
    {
      icon: MapPin,
      title: "Found 5 open restaurants",
      time: "2 hours ago",
      gradient: "from-blue-50 to-blue-100",
      iconColor: "text-blue-500",
    },
    {
      icon: ChefHat,
      title: "Tried Midnight Pasta recipe",
      time: "Yesterday",
      gradient: "from-green-50 to-green-100",
      iconColor: "text-green-500",
    },
    {
      icon: Star,
      title: "Rated Tony's Pizza - 5 stars",
      time: "2 days ago",
      gradient: "from-yellow-50 to-yellow-100",
      iconColor: "text-yellow-500",
    },
  ]

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to home...</p>
      </div>
    </div>
  )
}
