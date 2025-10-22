"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Cloud,
  Sun,
  CloudRain,
  Snowflake,
  Thermometer,
  Wind,
  Droplets,
  ChefHat,
  Utensils,
  RefreshCw,
  Loader2,
  IceCream,
  Coffee,
  Soup,
} from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { getCurrentSeason, getTimeOfDay, type FoodRecommendation } from "@/lib/dynamic-time-warping"
import { generateWeatherRecommendations } from "@/lib/weather"

interface WeatherData {
  temperature: number
  condition: string
  description: string
  humidity: number
  windSpeed: number
  location: string
  icon: string
}

interface WeatherRecommendationsProps {
  location?: { latitude: number; longitude: number; name: string }
}

export function WeatherRecommendations({ location }: WeatherRecommendationsProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [recommendations, setRecommendations] = useState<FoodRecommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userPreferences, setUserPreferences] = useState<any>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const handleLocationChange = (event: CustomEvent) => {
      const { lat, lng, name } = event.detail
      fetchWeatherRecommendations({ latitude: lat, longitude: lng })
    }

    window.addEventListener("locationChanged", handleLocationChange as EventListener)
    return () => window.removeEventListener("locationChanged", handleLocationChange as EventListener)
  }, [user])

  const getWeatherIcon = (condition: string, iconCode: string) => {
    const lowerCondition = condition.toLowerCase()
    if (lowerCondition.includes("rain")) return <CloudRain className="w-8 h-8 text-blue-500" />
    if (lowerCondition.includes("snow")) return <Snowflake className="w-8 h-8 text-blue-200" />
    if (lowerCondition.includes("cloud")) return <Cloud className="w-8 h-8 text-gray-500" />
    return <Sun className="w-8 h-8 text-yellow-500" />
  }

  const getRecommendationIcon = (name: string) => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes("ice cream") || lowerName.includes("cold")) return <IceCream className="w-4 h-4" />
    if (lowerName.includes("coffee") || lowerName.includes("hot chocolate")) return <Coffee className="w-4 h-4" />
    if (lowerName.includes("soup") || lowerName.includes("stew")) return <Soup className="w-4 h-4" />
    return <ChefHat className="w-4 h-4" />
  }

  const fetchUserPreferences = async () => {
    if (!user) return null

    try {
      const response = await fetch("/api/user/preferences", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        return data.preferences
      }
    } catch (error) {
      console.error("Failed to fetch user preferences:", error)
    }
    return null
  }

  const fetchWeatherRecommendations = async (coords?: { latitude: number; longitude: number }) => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      let targetCoords = coords

      if (!targetCoords) {
        if (location) {
          targetCoords = { latitude: location.latitude, longitude: location.longitude }
        } else {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 10000,
              enableHighAccuracy: true,
            })
          })
          targetCoords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }
        }
      }

      if (!targetCoords) throw new Error("Location not available")

      const preferences = await fetchUserPreferences()
      setUserPreferences(preferences)

      const weatherResponse = await fetch("/api/weather", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ latitude: targetCoords.latitude, longitude: targetCoords.longitude }),
      })
      if (!weatherResponse.ok) throw new Error("Failed to fetch weather data")
      const weatherPayload = await weatherResponse.json()
      const w = weatherPayload.weather
      setWeather(w)

      const prefInput = {
        dietaryPreference: preferences?.dietaryPreference || preferences?.dietary || preferences?.diet,
        favoritesCuisines:
          preferences?.favoriteCuisines || preferences?.favoritesCuisines || preferences?.favoriteCuisine || [],
        allergies: preferences?.allergies || [],
        hasDiabetes: preferences?.health?.hasDiabetes ?? preferences?.hasDiabetes ?? false,
      }

      const base = generateWeatherRecommendations(w, prefInput)

      const tag =
        w.temperature >= 26
          ? "cold & refreshing"
          : w.temperature <= 15 || /rain|snow/i.test(w.condition)
            ? "hot & cozy"
            : "balanced"
      const mapped = base.recipes.slice(0, 6).map((name: string, i: number) => ({
        id: `${name}-${i}`,
        name,
        weatherScore:
          w.temperature >= 26
            ? /ice|cold|smoothie|salad/i.test(name)
              ? 0.9
              : 0.6
            : w.temperature <= 15 || /rain|snow/i.test(w.condition)
              ? /soup|stew|hot|chocolate|curry/i.test(name)
                ? 0.9
                : 0.6
              : 0.75,
        tags: [
          tag,
          ...base.cuisines.slice(0, 1),
          ...(prefInput.dietaryPreference ? [prefInput.dietaryPreference] : []),
        ],
      }))

      setRecommendations(mapped as any)

      window.dispatchEvent(
        new CustomEvent("weatherContextUpdated", {
          detail: { weather: w, weatherTag: tag.includes("hot") ? "hot" : tag.includes("cold") ? "cold" : "mild" },
        }),
      )

      toast({
        title: "Weather recommendations updated!",
        description: `Found ${mapped.length} personalized suggestions for ${w.location}`,
      })
    } catch (error: any) {
      console.error("Weather recommendations error:", error)
      setError(error.message || "Failed to get weather recommendations")
      toast({
        title: "Weather Error",
        description: "Unable to fetch weather recommendations. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchWeatherRecommendations()
    }
  }, [user, location])

  if (!user) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0">
        <CardContent className="p-6 text-center">
          <Cloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Sign in to get personalized weather-based recommendations</p>
        </CardContent>
      </Card>
    )
  }

  if (error && !weather) {
    return (
      <Card className="bg-gradient-to-br from-red-50 to-orange-100 border-0">
        <CardContent className="p-6 text-center">
          <Cloud className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => fetchWeatherRecommendations()} variant="outline" className="bg-white/50">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Weather Display */}
      {weather && (
        <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getWeatherIcon(weather.condition, weather.icon)}
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{weather.location}</h3>
                  <p className="text-gray-600 capitalize">{weather.description}</p>
                </div>
              </div>
              <Button
                onClick={() => fetchWeatherRecommendations()}
                variant="outline"
                size="sm"
                disabled={loading}
                className="bg-white/50 hover:bg-white/70"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <Thermometer className="w-5 h-5 text-red-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-800">{weather.temperature}°C</p>
                <p className="text-xs text-gray-600">Temperature</p>
              </div>
              <div className="text-center">
                <Droplets className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-800">{weather.humidity}%</p>
                <p className="text-xs text-gray-600">Humidity</p>
              </div>
              <div className="text-center">
                <Wind className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-800">{weather.windSpeed} m/s</p>
                <p className="text-xs text-gray-600">Wind Speed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dynamic Time Warping Recommendations */}
      {recommendations.length > 0 && (
        <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <ChefHat className="w-6 h-6 text-orange-500" />
              Smart Weather Recommendations
            </CardTitle>
            <CardDescription className="text-gray-600">
              Personalized suggestions using Dynamic Time Warping analysis based on weather patterns and your
              preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Top Recommendations */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-green-500" />
                Perfect for This Weather ({getCurrentSeason()} • {getTimeOfDay()})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {recommendations.slice(0, 6).map((rec, index) => (
                  <div
                    key={rec.id}
                    className="bg-gradient-to-r from-white to-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {getRecommendationIcon(rec.name)}
                      <h5 className="font-medium text-gray-800 text-sm">{rec.name}</h5>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                        {Math.min(100, Math.round(rec.weatherScore * 100))}% match
                      </Badge>
                      <div className="flex flex-wrap gap-1">
                        {rec.tags.slice(0, 2).map((tag, tagIndex) => (
                          <span key={tagIndex} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weather Insights */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Weather Insights</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>
                  • Current conditions favor{" "}
                  {weather?.temperature > 25
                    ? "cold and refreshing"
                    : weather?.temperature < 15
                      ? "hot and warming"
                      : "moderate temperature"}{" "}
                  foods
                </p>
                <p>• {getCurrentSeason()} season recommendations are boosted</p>
                <p>• {getTimeOfDay()} time preferences applied</p>
                {userPreferences?.dietary && (
                  <p>• Filtered for your dietary preferences: {userPreferences.dietary.join(", ")}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && !weather && (
        <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-0">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Analyzing weather patterns and generating personalized recommendations...</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
