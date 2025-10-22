import { type NextRequest, NextResponse } from "next/server"
import { WeatherService } from "@/lib/weather"
import { connectToDatabase } from "@/lib/mongodb"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    // Get user authentication
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null

    if (!token) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any
    } catch (jwtError) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    const { latitude, longitude } = await request.json()

    if (!latitude || !longitude) {
      return NextResponse.json({ message: "Location coordinates required" }, { status: 400 })
    }

    // Fetch weather data
    const weatherData = await WeatherService.getWeatherData(latitude, longitude)

    // Get user preferences from database
    const { db } = await connectToDatabase()
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Generate personalized recommendations
    const recommendations = WeatherService.generateRecommendations(weatherData, {
      dietaryPreference: user.dietaryPreference,
      favoritesCuisines: user.favoritesCuisines || [],
      allergies: user.allergies || [],
      hasDiabetes: user.hasDiabetes || false,
    })

    // Log user activity
    await db.collection("user_activities").insertOne({
      userId: new ObjectId(decoded.userId),
      type: "weather",
      action: "viewed_recommendations",
      details: `Viewed weather-based recommendations for ${weatherData.location}`,
      metadata: {
        weather: weatherData,
        location: weatherData.location,
        temperature: weatherData.temperature,
        condition: weatherData.condition,
      },
      timestamp: new Date(),
    })

    return NextResponse.json({
      weather: weatherData,
      recommendations,
      success: true,
    })
  } catch (error) {
    console.error("Weather recommendations error:", error)
    return NextResponse.json(
      { message: "Failed to get weather recommendations", error: error.message },
      { status: 500 },
    )
  }
}
