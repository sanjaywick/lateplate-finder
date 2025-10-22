"use client"

import { useEffect, useState } from "react"

type BannerLocation = { latitude: number; longitude: number; name?: string } | null

type BannerWeather = {
  temperature: number
  condition: string
  description: string
  location: string
}

export function WeatherBanner({ location }: { location: BannerLocation }) {
  const [weather, setWeather] = useState<BannerWeather | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        let coords = location
        if (!coords) {
          // Attempt geolocation if no selected location
          const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 }),
          )
          coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude }
        }

        if (!coords) {
          throw new Error("Location not available")
        }

        // Use existing weather API route
        const res = await fetch(`/api/weather?lat=${coords.latitude}&lon=${coords.longitude}`)
        if (!res.ok) throw new Error("Failed to fetch weather")

        const data = await res.json()
        setWeather({
          temperature: data.weather.temperature,
          condition: data.weather.condition,
          description: data.weather.description,
          location: data.weather.location,
        })
      } catch (e: any) {
        setError(e.message || "Unable to load weather")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [location])

  // Decide banner
  const tag =
    weather &&
    (weather.temperature >= 28
      ? "hot"
      : weather.temperature <= 23 || /rain|snow/i.test(weather.condition)
        ? "cold"
        : "mild")

  const src = tag === "hot" ? "/hotweather.jpg" : tag === "cold" ? "/coldweather.jpg" : "/balanceweather.jpg"

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-lg">
      <img
        src={src || "/placeholder.svg"}
        alt={
          tag === "hot"
            ? "Hot day banner with cool refreshing food and drinks"
            : tag === "cold"
              ? "Cold day banner with warm hearty food"
              : "Mild weather banner with balanced meals"
        }
        className="w-full h-48 sm:h-72 md:h-80 object-cover"
      />
      {/* Overlay copy */}
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <h3 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold">
          {tag === "hot" && "Cool picks for a hot day"}
          {tag === "cold" && "Warm, cozy picks for chilly weather"}
          {tag === "mild" && "Balanced picks for perfect weather"}
        </h3>
        {!loading && weather && <p className="text-white/90 text-lg sm:text-xl mt-2">{weather.temperature}°C</p>}
      </div>
    </div>
  )
}
