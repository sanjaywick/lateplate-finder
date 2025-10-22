"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Cloud, Sun, CloudRain, Snowflake, Wind, Droplets, MapPin, Clock } from "lucide-react"
import { motion } from "framer-motion"

interface WeatherData {
  temperature: number
  condition: string
  description: string
  humidity: number
  windSpeed: number
  icon: string
  location: string
  timestamp: number
}

interface Location {
  latitude: number
  longitude: number
  name?: string
}

interface WeatherWidgetProps {
  location: Location | null
}

export function WeatherWidget({ location }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState("")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      )
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (location?.latitude && location?.longitude) {
      fetchWeather()
    } else {
      // Try to load from saved location if no location provided
      const savedLocation = localStorage.getItem("currentLocation")
      if (savedLocation) {
        try {
          const parsed = JSON.parse(savedLocation)
          if (parsed.latitude && parsed.longitude) {
            fetchWeatherForCoords(parsed.latitude, parsed.longitude)
          }
        } catch (error) {
          console.error("Error parsing saved location for weather:", error)
        }
      }
    }
  }, [location])

  const fetchWeather = async () => {
    if (!location) return

    setLoading(true)
    try {
      console.log("[v0] Fetching weather data...")
      const response = await fetch(`/api/weather?lat=${location.latitude}&lon=${location.longitude}`)

      if (response.ok) {
        const data = await response.json()
        setWeather(data.weather)
        console.log("[v0] Weather data loaded:", data.weather)
      } else {
        console.error("[v0] Failed to fetch weather data")
      }
    } catch (error) {
      console.error("[v0] Error fetching weather:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWeatherForCoords = async (lat: number, lon: number) => {
    setLoading(true)
    try {
      console.log("[v0] Fetching weather data for coordinates:", lat, lon)
      const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`)

      if (response.ok) {
        const data = await response.json()
        setWeather(data.weather)
        console.log("[v0] Weather data loaded:", data.weather)
      } else {
        console.error("[v0] Failed to fetch weather data")
      }
    } catch (error) {
      console.error("[v0] Error fetching weather:", error)
    } finally {
      setLoading(false)
    }
  }

  const getWeatherIcon = (condition: string) => {
    const iconMap: { [key: string]: any } = {
      clear: Sun,
      clouds: Cloud,
      rain: CloudRain,
      drizzle: CloudRain,
      snow: Snowflake,
      thunderstorm: CloudRain,
      mist: Cloud,
      fog: Cloud,
      haze: Cloud,
    }

    return iconMap[condition.toLowerCase()] || Sun
  }

  const getWeatherEmoji = (condition: string) => {
    const emojiMap: { [key: string]: string } = {
      clear: "☀️",
      clouds: "☁️",
      rain: "🌧️",
      drizzle: "🌦️",
      thunderstorm: "⛈️",
      snow: "❄️",
      mist: "🌫️",
      fog: "🌫️",
      haze: "🌫️",
    }

    return emojiMap[condition.toLowerCase()] || "🌤️"
  }

  const getTemperatureColor = (temp: number) => {
    if (temp > 30) return "text-red-500"
    if (temp > 20) return "text-orange-500"
    if (temp > 10) return "text-blue-500"
    return "text-blue-700"
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Sun className="w-8 h-8 text-yellow-500" />
            </motion.div>
            <span className="ml-3 text-slate-600">Loading weather...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!weather) {
    return (
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="text-center text-slate-500">
            <MapPin className="w-8 h-8 mx-auto mb-2" />
            <p>Select a location to see weather</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const WeatherIcon = getWeatherIcon(weather.condition)

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: weather.condition === "clear" ? [0, 10, -10, 0] : 0,
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                className="text-4xl"
              >
                {getWeatherEmoji(weather.condition)}
              </motion.div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-3xl font-bold ${getTemperatureColor(weather.temperature)}`}>
                    {weather.temperature}°C
                  </span>
                </div>
                <p className="text-slate-600 capitalize text-sm">{weather.description}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 text-slate-600 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{currentTime}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500">
                <MapPin className="w-3 h-3" />
                <span className="text-xs">{weather.location}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-slate-600">{weather.humidity}% humidity</span>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-600">{weather.windSpeed} m/s wind</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
