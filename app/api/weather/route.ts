import { type NextRequest, NextResponse } from "next/server"
import { WeatherService } from "@/lib/weather"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = Number.parseFloat(searchParams.get("lat") || "0")
    const lon = Number.parseFloat(searchParams.get("lon") || "0")

    if (!lat || !lon) {
      return NextResponse.json({ error: "Latitude and longitude are required", lat, lon }, { status: 400 })
    }

    console.log(`[v0] Fetching weather for coordinates: ${lat}, ${lon}`)

    const weatherData = await WeatherService.getWeatherData(lat, lon)

    if (!weatherData) {
      return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 })
    }

    console.log(`[v0] Weather data fetched successfully:`, weatherData)

    return NextResponse.json({ weather: weatherData })
  } catch (error) {
    console.error("[v0] Error in weather API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const latitude = Number.parseFloat(String(body.latitude ?? body.lat ?? "0"))
    const longitude = Number.parseFloat(String(body.longitude ?? body.lon ?? "0"))

    if (!latitude || !longitude) {
      return NextResponse.json({ error: "Latitude and longitude are required", latitude, longitude }, { status: 400 })
    }

    console.log(`[v0] (POST) Fetching weather for coordinates: ${latitude}, ${longitude}`)
    const weatherData = await WeatherService.getWeatherData(latitude, longitude)
    return NextResponse.json({ weather: weatherData })
  } catch (error) {
    console.error("[v0] Error in weather API (POST):", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
