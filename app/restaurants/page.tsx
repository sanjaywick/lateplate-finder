"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LocationSelector } from "@/components/location-selector"
import {
  MapPin,
  Clock,
  Star,
  Phone,
  Navigation,
  Utensils,
  Timer,
  Menu,
  Info,
  Brain,
  TrendingUp,
  ChefHat,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/providers/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"

// Restaurant Image Component with fallback
function RestaurantImage({ restaurant, className }: { restaurant: any; className: string }) {
  const [imageUrl, setImageUrl] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    // Use Google Places photos if available
    if (restaurant.photos && restaurant.photos.length > 0) {
      setImageUrl(restaurant.photos[0])
      setLoading(false)
    } else {
      // Fallback to cuisine-specific placeholder images
      const cuisineImages = {
        italian: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center",
        mexican: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop&crop=center",
        chinese: "https://images.unsplash.com/photo-1526318896946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center",
        indian: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop&crop=center",
        american: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop&crop=center",
        thai: "https://images.unsplash.com/photo-1559314809055-c3ce17fd4351?w=400&h=300&fit=crop&crop=center",
        japanese: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop&crop=center",
        "south indian": "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=300&fit=crop&crop=center",
        "north indian": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop&crop=center",
        tibetan: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400&h=300&fit=crop&crop=center",
        continental: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop&crop=center",
        "street food": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop&crop=center",
        default: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop&crop=center",
      }

      const cuisine = restaurant.cuisine?.toLowerCase() || "default"
      const fallbackImage = cuisineImages[cuisine] || cuisineImages.default

      setImageUrl(fallbackImage)
      setLoading(false)
    }
  }, [restaurant])

  const handleImageError = () => {
    if (!error) {
      setError(true)
      setImageUrl("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop&crop=center")
    }
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {loading ? (
        <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse flex items-center justify-center">
          <Utensils className="w-8 h-8 text-slate-400" />
        </div>
      ) : (
        <img
          src={imageUrl || "/placeholder.svg"}
          alt={restaurant.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={handleImageError}
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Restaurant status badge */}
      <div className="absolute top-3 right-3">
        <Badge
          variant={restaurant.isOpen ? "default" : "destructive"}
          className={`${restaurant.isOpen ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"} text-white shadow-lg`}
        >
          {restaurant.isOpen ? "Open Now" : "Closed"}
        </Badge>
      </div>

      {/* 24/7 badge */}
      {restaurant.is24Hours && (
        <div className="absolute top-3 left-3">
          <Badge className="bg-blue-500 text-white shadow-lg animate-pulse">24/7</Badge>
        </div>
      )}

      {/* Analytics score */}
      {restaurant.analyticsScore && (
        <div className="absolute bottom-3 right-3">
          <Badge className="bg-purple-500 text-white shadow-lg">
            <Brain className="w-3 h-3 mr-1" />
            {restaurant.analyticsScore}% Match
          </Badge>
        </div>
      )}
    </div>
  )
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState("")
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState("")
  const [weatherData, setWeatherData] = useState(null)
  const [weatherRecommendations, setWeatherRecommendations] = useState([])
  const [filters, setFilters] = useState({
    cuisine: "",
    rating: "",
    distance: "5",
  })
  const [userPreferences, setUserPreferences] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchUserPreferences()
    }

    const handleLocationChange = (event: CustomEvent) => {
      const { lat, lng, name, address } = event.detail
      console.log("[v0] Restaurant page received location change:", { lat, lng, name, address })
      setUserLocation({ lat, lng })
      setLocation(name || address)
      fetchWeatherData(lat, lng)
      fetchRestaurants(lat, lng)
    }

    window.addEventListener("locationChanged", handleLocationChange as EventListener)

    const savedLocation = localStorage.getItem("currentLocation")
    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation)
        setSelectedLocation(parsed)
        setUserLocation({ lat: parsed.latitude, lng: parsed.longitude })
        setLocation(parsed.name || parsed.address)
        fetchWeatherData(parsed.latitude, parsed.longitude)
        fetchRestaurants(parsed.latitude, parsed.longitude)
      } catch (error) {
        console.error("Error parsing saved location:", error)
      }
    }

    return () => {
      window.removeEventListener("locationChanged", handleLocationChange as EventListener)
    }
  }, [user])

  const fetchUserPreferences = async () => {
    try {
      const response = await fetch("/api/user/preferences", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setUserPreferences(data.preferences)
      }
    } catch (error) {
      console.error("Failed to fetch user preferences:", error)
    }
  }

  const fetchWeatherData = async (lat: number, lng: number) => {
    try {
      console.log("[v0] Fetching weather data for coordinates:", { lat, lng })
      const response = await fetch(`/api/weather?lat=${lat}&lng=${lng}`)
      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Weather data received:", data)
        setWeatherData(data.weather)

        const recResponse = await fetch(`/api/weather/recommendations?lat=${lat}&lng=${lng}&userId=${user?.id || ""}`)
        if (recResponse.ok) {
          const recData = await recResponse.json()
          console.log("[v0] Weather recommendations received:", recData)
          setWeatherRecommendations(recData.recommendations || [])
        }
      }
    } catch (error) {
      console.error("[v0] Error fetching weather data:", error)
    }
  }

  const handleLocationSelect = (location: any) => {
    setSelectedLocation(location)
    setUserLocation({ lat: location.latitude, lng: location.longitude })
    setLocation(location.name || location.address)
    localStorage.setItem("currentLocation", JSON.stringify(location))

    // Fetch data for new location
    fetchWeatherData(location.latitude, location.longitude)
    fetchRestaurants(location.latitude, location.longitude)
  }

  const fetchRestaurants = async (lat: number, lng: number) => {
    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        radius: (Number.parseInt(filters.distance) * 1609).toString(),
        ...(filters.cuisine && { type: filters.cuisine }),
        ...(user && { userId: user.id }),
        ...(weatherData && { weather: JSON.stringify(weatherData) }),
      })

      console.log("[v0] Fetching restaurants with weather data:", params.toString())

      if (user) {
        await logUserActivity("restaurant", "search", `Searched for restaurants near ${location}`, {
          location: { lat, lng },
          filters,
          timestamp: new Date().toISOString(),
        })
      }

      const response = await fetch(`/api/restaurants/google?${params}`)
      const data = await response.json()

      if (response.ok && data.restaurants) {
        console.log(`Found ${data.restaurants.length} analytics-enhanced night restaurants`)

        const enhancedRestaurants = data.restaurants
          .map((restaurant: any) => ({
            ...restaurant,
            analyticsScore: calculateAnalyticsScore(restaurant, userPreferences, filters),
          }))
          .sort((a: any, b: any) => b.analyticsScore - a.analyticsScore)

        setRestaurants(enhancedRestaurants)

        if (enhancedRestaurants.length === 0) {
          toast({
            title: "No night restaurants found",
            description: "Try expanding your search radius or changing filters",
          })
        } else {
          toast({
            title: "Analytics-Enhanced Results",
            description: `Found ${enhancedRestaurants.length} restaurants ranked by your preferences`,
          })
        }
      } else {
        console.error("Failed to fetch restaurants:", data.message)
        throw new Error(data.message || "Failed to fetch restaurants")
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error)
      toast({
        title: "Error loading restaurants",
        description: "Please try again or check your connection",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateAnalyticsScore = (restaurant: any, preferences: any, filters: any) => {
    let score = 50

    if (restaurant.photos && restaurant.photos.length > 0) {
      score += 5
    }

    if (restaurant.isOpen) {
      score += 10
    }

    if (restaurant.is24Hours) {
      score += 10
    }

    if (restaurant.rating >= 4.5) {
      score += 15
    } else if (restaurant.rating >= 4.0) {
      score += 10
    } else if (restaurant.rating >= 3.5) {
      score += 5
    }

    if (preferences) {
      if (preferences.favoritesCuisines?.includes(restaurant.cuisine)) {
        score += 15
      }
      if (
        preferences.dietaryPreferences?.some((pref: string) =>
          restaurant.specialties?.some((spec: string) => spec.toLowerCase().includes(pref.toLowerCase())),
        )
      ) {
        score += 10
      }
    }

    const currentHour = new Date().getHours()
    if (currentHour >= 22 || currentHour <= 6) {
      if (restaurant.nightSpecial) {
        score += 10
      }
      if (restaurant.is24Hours) {
        score += 5
      }
    }

    if (restaurant.reviews > 1000) {
      score += 5
    } else if (restaurant.reviews > 500) {
      score += 3
    }

    if (weatherData && weatherRecommendations.length > 0) {
      const weatherMatch = weatherRecommendations.find(
        (rec) =>
          rec.type === "restaurant" &&
          (restaurant.cuisine?.toLowerCase().includes(rec.name.toLowerCase()) ||
            restaurant.specialties?.some((spec) => spec.toLowerCase().includes(rec.name.toLowerCase()))),
      )
      if (weatherMatch) {
        score += weatherMatch.confidence * 0.2
        console.log("[v0] Weather boost applied:", weatherMatch.confidence * 0.2, "for", restaurant.name)
      }
    }

    return Math.min(100, Math.max(0, score))
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
    } catch (error) {
      console.error("Failed to log user activity:", error)
    }
  }

  const searchRestaurants = async () => {
    if (userLocation) {
      setLoading(true)
      await fetchRestaurants(userLocation.lat, userLocation.lng)
    } else if (selectedLocation) {
      setLoading(true)
      await fetchRestaurants(selectedLocation.latitude, selectedLocation.longitude)
    }
  }

  const handleMenuClick = async (restaurant: any) => {
    try {
      if (user) {
        await logUserActivity("restaurant", "menu_viewed", `Viewed menu for ${restaurant.name}`, {
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
        })
      }

      const response = await fetch(`/api/restaurants/menu?placeId=${restaurant.placeId}`)
      if (response.ok) {
        const menuData = await response.json()
        toast({
          title: "Menu Information",
          description: `Menu details for ${restaurant.name} - Check restaurant directly for latest menu`,
        })
      } else {
        if (restaurant.menuHighlights) {
          toast({
            title: `${restaurant.name} Menu Highlights`,
            description: restaurant.menuHighlights.join(", "),
          })
        } else {
          toast({
            title: "Menu Information",
            description: "Please contact the restaurant directly for menu details",
          })
        }
      }
    } catch (error) {
      toast({
        title: "Menu Information",
        description: "Please contact the restaurant directly for menu details",
      })
    }
  }

  const handleInfoClick = async (restaurant: any) => {
    try {
      if (user) {
        await logUserActivity("restaurant", "info_viewed", `Viewed details for ${restaurant.name}`, {
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
        })
      }

      const response = await fetch(`/api/restaurants/details?placeId=${restaurant.placeId}`)
      if (response.ok) {
        const details = await response.json()
        toast({
          title: `${restaurant.name} Details`,
          description: `Rating: ${details.rating}/5 | Reviews: ${details.reviews} | ${details.priceLevel ? `Price: ${"$".repeat(details.priceLevel)}` : ""}`,
        })
      } else {
        const info = [
          `Rating: ${restaurant.rating}/5`,
          `Distance: ${restaurant.distance} miles`,
          restaurant.hours,
          restaurant.specialties?.join(", "),
        ]
          .filter(Boolean)
          .join(" | ")

        toast({
          title: `${restaurant.name}`,
          description: info,
        })
      }
    } catch (error) {
      const info = [`Rating: ${restaurant.rating}/5`, `Distance: ${restaurant.distance} miles`, restaurant.hours]
        .filter(Boolean)
        .join(" | ")

      toast({
        title: `${restaurant.name}`,
        description: info,
      })
    }
  }

  const getPriceLevelText = (level: number) => {
    return "💰".repeat(level) + "💸".repeat(4 - level)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-slate-200/50 sticky top-0 z-50"
      >
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300"
          >
            LatePlate Finder
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent transition-all duration-300"
              >
                Home
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-center"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
            Find Your Favorite Restaurants
          </h1>
          <p className="text-xl text-slate-600 mb-4">
            Discover amazing restaurants open anytime with intelligent analytics-driven recommendations
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <Brain className="w-4 h-4" />
            <span>Powered by location analysis, preference matching, and real-time availability</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="mb-8 bg-white/80 backdrop-blur-sm shadow-xl border-0 card-hover">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-xl">
                <MapPin className="w-6 h-6" />
                Smart Location & Analytics Filters
              </CardTitle>
              <CardDescription className="text-orange-100">
                Select your location and customize your restaurant search preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Location Selector */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <LocationSelector onLocationSelect={handleLocationSelect} selectedLocation={selectedLocation} />
                </div>
                <Button
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        async (position) => {
                          const { latitude, longitude } = position.coords
                          setUserLocation({ lat: latitude, lng: longitude })

                          try {
                            const response = await fetch(
                              `/api/geocode/reverse?lat=${latitude}&lng=${longitude}&precision=high`,
                            )
                            if (response.ok) {
                              const data = await response.json()
                              setLocation(data.formatted_address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
                            } else {
                              setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
                            }

                            await fetchWeatherData(latitude, longitude)
                            await fetchRestaurants(latitude, longitude)
                          } catch (error) {
                            console.error("Error getting location details:", error)
                            setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
                            await fetchRestaurants(latitude, longitude)
                          }
                        },
                        (error) => {
                          console.error("Geolocation error:", error)
                          let errorMessage = "Unable to get your location"

                          switch (error.code) {
                            case error.PERMISSION_DENIED:
                              errorMessage = "Location access denied. Please enable location services."
                              break
                            case error.POSITION_UNAVAILABLE:
                              errorMessage = "Location information unavailable."
                              break
                            case error.TIMEOUT:
                              errorMessage = "Location request timed out."
                              break
                          }

                          setLocationError(errorMessage)
                          toast({
                            title: "Location Error",
                            description: errorMessage,
                            variant: "destructive",
                          })

                          setLoading(false)
                        },
                      )
                    } else {
                      setLocationError("Geolocation is not supported by this browser")
                      toast({
                        title: "Location Error",
                        description: "Geolocation is not supported by this browser",
                        variant: "destructive",
                      })
                    }
                  }}
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-50 px-6 bg-transparent h-12 transition-all duration-300"
                  disabled={loading}
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Current Location
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium mb-3 block text-slate-700 flex items-center gap-2">
                    <ChefHat className="w-4 h-4" />
                    Cuisine Preference
                  </label>
                  <select
                    className="w-full p-4 border border-slate-300 rounded-xl focus:border-slate-500 focus:ring-2 focus:ring-slate-200 bg-white text-lg transition-all duration-300"
                    value={filters.cuisine}
                    onChange={(e) => setFilters({ ...filters, cuisine: e.target.value })}
                  >
                    <option value="">All Cuisines</option>
                    <option value="italian">🍝 Italian</option>
                    <option value="american">🍔 American</option>
                    <option value="mexican">🌮 Mexican</option>
                    <option value="chinese">🥢 Chinese</option>
                    <option value="indian">🍛 Indian</option>
                    <option value="south indian">🥥 South Indian</option>
                    <option value="north indian">🫓 North Indian</option>
                    <option value="street food">🍢 Street Food</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-3 block text-slate-700 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Minimum Rating
                  </label>
                  <select
                    className="w-full p-4 border border-slate-300 rounded-xl focus:border-slate-500 focus:ring-2 focus:ring-slate-200 bg-white text-lg transition-all duration-300"
                    value={filters.rating}
                    onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                  >
                    <option value="">Any Rating</option>
                    <option value="4">⭐⭐⭐⭐ 4+ Stars</option>
                    <option value="3">⭐⭐⭐ 3+ Stars</option>
                    <option value="2">⭐⭐ 2+ Stars</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-3 block text-slate-700 flex items-center gap-2">
                    <Navigation className="w-4 h-4" />
                    Search Radius
                  </label>
                  <select
                    className="w-full p-4 border border-slate-300 rounded-xl focus:border-slate-500 focus:ring-2 focus:ring-slate-200 bg-white text-lg transition-all duration-300"
                    value={filters.distance}
                    onChange={(e) => setFilters({ ...filters, distance: e.target.value })}
                  >
                    <option value="1">📍 Within 1 mile</option>
                    <option value="5">📍 Within 5 miles</option>
                    <option value="10">📍 Within 10 miles</option>
                    <option value="25">📍 Within 25 miles</option>
                  </select>
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={searchRestaurants}
                  className="w-full bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Analyzing Night Restaurants...
                    </>
                  ) : (
                    <>Search Restaurants</>
                  )}
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        <AnimatePresence>
          {weatherData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">
                    {weatherData.main === "Clear"
                      ? "☀️"
                      : weatherData.main === "Rain"
                        ? "🌧️"
                        : weatherData.main === "Clouds"
                          ? "☁️"
                          : weatherData.main === "Snow"
                            ? "❄️"
                            : "🌤️"}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">
                      {Math.round(weatherData.temp)}°C - {weatherData.description}
                    </h3>
                    <p className="text-sm text-slate-600">
                      Perfect weather for{" "}
                      {weatherRecommendations.length > 0
                        ? weatherRecommendations
                            .slice(0, 2)
                            .map((r) => r.name)
                            .join(", ")
                        : "dining out"}
                    </p>
                  </div>
                </div>
                <Badge className="bg-blue-500 text-white">Weather-Enhanced Results</Badge>
              </div>

              {weatherRecommendations.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {weatherRecommendations.slice(0, 4).map((rec, idx) => (
                    <Badge key={idx} variant="outline" className="border-blue-300 text-blue-700">
                      {rec.name} ({Math.round(rec.confidence)}% match)
                    </Badge>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedLocation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="text-blue-800 font-medium">
                  Searching near: {selectedLocation.name || selectedLocation.address}
                </span>
                <span className="text-blue-600 text-sm">
                  ({selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)})
                </span>
                <Badge className="bg-blue-500 text-white ml-auto">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Analytics Active
                </Badge>
                {weatherData && <Badge className="bg-green-500 text-white">Weather-Enhanced</Badge>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid md:grid-cols-2 gap-8"
        >
          <AnimatePresence>
            {restaurants.map((restaurant, index) => (
              <motion.div
                key={restaurant.id || restaurant.placeId}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group"
              >
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 border-0 overflow-hidden h-full">
                  <div className="relative h-64">
                    <RestaurantImage restaurant={restaurant} className="h-full" />

                    <div className="absolute top-3 left-3">
                      <div className="bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-semibold text-slate-800">{restaurant.rating || 4.0}</span>
                          <span className="text-xs text-slate-600">({restaurant.reviews || "N/A"})</span>
                        </div>
                      </div>
                    </div>

                    <div className="absolute bottom-3 left-3">
                      <Badge className="bg-slate-600/90 text-white backdrop-blur-sm">
                        📍 {restaurant.distance} miles
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-slate-900 transition-colors">
                          {restaurant.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                            {restaurant.cuisine || "Restaurant"}
                          </Badge>
                          <span className="text-sm text-slate-600">
                            {getPriceLevelText(restaurant.priceLevel || 2)}
                          </span>
                          {restaurant.nightSpecial && (
                            <Badge className="bg-purple-100 text-purple-700 text-xs">🌙 Night Special</Badge>
                          )}
                          {restaurant.analyticsScore && (
                            <Badge className="bg-green-100 text-green-700 text-xs">
                              <Brain className="w-3 h-3 mr-1" />
                              {restaurant.analyticsScore}% Match
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-slate-600">
                        <MapPin className="w-4 h-4 mt-1 text-slate-500" />
                        <span className="text-sm">{restaurant.address}</span>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-600 font-medium">
                            {restaurant.hours || "Hours not available"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-slate-600">{restaurant.phone || "N/A"}</span>
                        </div>
                        {restaurant.deliveryTime && (
                          <div className="flex items-center gap-2">
                            <Timer className="w-4 h-4 text-purple-500" />
                            <span className="text-sm text-slate-600">Prep time: {restaurant.deliveryTime}</span>
                          </div>
                        )}
                      </div>

                      {restaurant.specialties && (
                        <div>
                          <p className="text-xs font-medium text-slate-700 mb-2">Specialties:</p>
                          <div className="flex flex-wrap gap-1">
                            {restaurant.specialties.map((specialty, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs border-slate-300 text-slate-700">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {restaurant.menuHighlights && (
                        <div>
                          <p className="text-xs font-medium text-slate-700 mb-2">Popular Items:</p>
                          <div className="text-xs text-slate-600">
                            {restaurant.menuHighlights.slice(0, 3).join(" • ")}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2 pt-4">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={() => handleMenuClick(restaurant)}
                            variant="outline"
                            className="border-slate-300 text-slate-700 hover:bg-slate-50 text-sm bg-transparent w-full transition-all duration-300"
                          >
                            <Menu className="w-3 h-3 mr-1" />
                            Menu
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={() => handleInfoClick(restaurant)}
                            variant="outline"
                            className="border-slate-300 text-slate-700 hover:bg-slate-50 text-sm bg-transparent w-full transition-all duration-300"
                          >
                            <Info className="w-3 h-3 mr-1" />
                            Details
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={() => {
                              const url = `https://www.google.com/maps/dir/?api=1&destination=${restaurant.geometry?.location?.lat || 0},${restaurant.geometry?.location?.lng || 0}`
                              window.open(url, "_blank")
                              if (user) {
                                logUserActivity("restaurant", "directions", `Got directions to ${restaurant.name}`, {
                                  restaurantId: restaurant.id,
                                  restaurantName: restaurant.name,
                                  cuisine: restaurant.types?.[0] || "restaurant",
                                  rating: restaurant.rating,
                                  location: restaurant.vicinity,
                                  priceLevel: restaurant.price_level,
                                })
                                // Also log as viewed to count as restaurant visit
                                logUserActivity("restaurant", "viewed", `Visited ${restaurant.name}`, {
                                  restaurantId: restaurant.id,
                                  restaurantName: restaurant.name,
                                  cuisine: restaurant.types?.[0] || "restaurant",
                                  rating: restaurant.rating,
                                  location: restaurant.vicinity,
                                  priceLevel: restaurant.price_level,
                                })
                              }
                            }}
                            variant="outline"
                            className="border-slate-300 text-slate-700 hover:bg-slate-50 text-sm bg-transparent w-full transition-all duration-300"
                          >
                            <Navigation className="w-3 h-3 mr-1" />
                            Directions
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {restaurants.length === 0 && !loading && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
              <CardContent className="text-center py-20">
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatDelay: 1,
                  }}
                  className="mb-8"
                >
                  <Utensils className="w-20 h-20 text-slate-400 mx-auto" />
                </motion.div>
                <h3 className="text-3xl font-bold text-slate-800 mb-4">No night restaurants found</h3>
                <p className="text-slate-600 mb-8 text-lg">
                  Try adjusting your location or filters to find more options
                </p>
                <Button
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        async (position) => {
                          const { latitude, longitude } = position.coords
                          setUserLocation({ lat: latitude, lng: longitude })

                          try {
                            const response = await fetch(
                              `/api/geocode/reverse?lat=${latitude}&lng=${longitude}&precision=high`,
                            )
                            if (response.ok) {
                              const data = await response.json()
                              setLocation(data.formatted_address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
                            } else {
                              setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
                            }

                            await fetchWeatherData(latitude, longitude)
                            await fetchRestaurants(latitude, longitude)
                          } catch (error) {
                            console.error("Error getting location details:", error)
                            setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
                            await fetchRestaurants(latitude, longitude)
                          }
                        },
                        (error) => {
                          console.error("Geolocation error:", error)
                          let errorMessage = "Unable to get your location"

                          switch (error.code) {
                            case error.PERMISSION_DENIED:
                              errorMessage = "Location access denied. Please enable location services."
                              break
                            case error.POSITION_UNAVAILABLE:
                              errorMessage = "Location information unavailable."
                              break
                            case error.TIMEOUT:
                              errorMessage = "Location request timed out."
                              break
                          }

                          setLocationError(errorMessage)
                          toast({
                            title: "Location Error",
                            description: errorMessage,
                            variant: "destructive",
                          })

                          setLoading(false)
                        },
                      )
                    } else {
                      setLocationError("Geolocation is not supported by this browser")
                      toast({
                        title: "Location Error",
                        description: "Geolocation is not supported by this browser",
                        variant: "destructive",
                      })
                    }
                  }}
                  className="bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white px-8 py-3 rounded-xl transition-all duration-300"
                >
                  <Navigation className="w-5 h-5 mr-2" />
                  Try Current Location
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
