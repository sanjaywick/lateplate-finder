import { type NextRequest, NextResponse } from "next/server"
import { WeatherService } from "@/lib/weather"
import { connectDB } from "@/lib/mongodb"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const radius = searchParams.get("radius") || "5"
    const cuisine = searchParams.get("cuisine")
    const useWeatherRecommendations = searchParams.get("weather") === "true"

    // Get user preferences if authenticated
    let userPreferences = null
    let weatherRecommendations = null

    const authHeader = request.headers.get("authorization")
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null

    if (token && lat && lng) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any
        const db = await connectDB()
        const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) })

        if (user) {
          userPreferences = {
            dietaryPreference: user.dietaryPreference,
            favoritesCuisines: user.favoritesCuisines || [],
            allergies: user.allergies || [],
            hasDiabetes: user.hasDiabetes || false,
          }

          if (useWeatherRecommendations) {
            const weatherData = await WeatherService.getWeatherData(Number.parseFloat(lat), Number.parseFloat(lng))
            weatherRecommendations = WeatherService.generateRecommendations(weatherData, userPreferences)
          }
        }
      } catch (error) {
        console.error("Auth error in restaurant search:", error)
      }
    }

    // Mock restaurant data - in production, this would integrate with Google Places API
    const mockRestaurants = [
      {
        id: 1,
        name: "Tony's 24/7 Pizza",
        cuisine: "Italian",
        rating: 4.5,
        distance: 0.8,
        address: "123 Main St, Downtown",
        phone: "(555) 123-4567",
        hours: "Open 24 hours",
        isOpen: true,
        deliveryTime: "25-35 min",
        priceLevel: 2,
        photos: ["/placeholder.svg?height=200&width=300"],
        weatherScore: 0.8, // Added weather compatibility score
      },
      {
        id: 2,
        name: "Midnight Diner",
        cuisine: "American",
        rating: 4.2,
        distance: 1.2,
        address: "456 Oak Ave, Midtown",
        phone: "(555) 234-5678",
        hours: "Open until 3:00 AM",
        isOpen: true,
        deliveryTime: "30-40 min",
        priceLevel: 2,
        photos: ["/placeholder.svg?height=200&width=300"],
        weatherScore: 0.6,
      },
      {
        id: 3,
        name: "Spice Palace",
        cuisine: "Indian",
        rating: 4.7,
        distance: 1.5,
        address: "789 Curry Lane, Spice District",
        phone: "(555) 345-6789",
        hours: "Open until 2:00 AM",
        isOpen: true,
        deliveryTime: "35-45 min",
        priceLevel: 3,
        photos: ["/placeholder.svg?height=200&width=300"],
        weatherScore: 0.9,
      },
      {
        id: 4,
        name: "Mediterranean Breeze",
        cuisine: "Mediterranean",
        rating: 4.4,
        distance: 2.1,
        address: "321 Olive St, Harbor View",
        phone: "(555) 456-7890",
        hours: "Open until 1:00 AM",
        isOpen: true,
        deliveryTime: "40-50 min",
        priceLevel: 3,
        photos: ["/placeholder.svg?height=200&width=300"],
        weatherScore: 0.7,
      },
    ]

    // Filter by cuisine if specified
    let filteredRestaurants = mockRestaurants
    if (cuisine && cuisine !== "") {
      filteredRestaurants = mockRestaurants.filter((r) => r.cuisine.toLowerCase() === cuisine.toLowerCase())
    }

    if (weatherRecommendations && useWeatherRecommendations) {
      // Boost restaurants that match weather-recommended cuisines
      filteredRestaurants = filteredRestaurants.map((restaurant) => {
        let boostedScore = restaurant.weatherScore

        // Boost if cuisine matches weather recommendations
        if (weatherRecommendations.cuisines.includes(restaurant.cuisine)) {
          boostedScore += 0.3
        }

        // Boost if matches user's favorite cuisines
        if (userPreferences?.favoritesCuisines?.includes(restaurant.cuisine)) {
          boostedScore += 0.2
        }

        return {
          ...restaurant,
          weatherScore: Math.min(boostedScore, 1.0),
          isWeatherRecommended: weatherRecommendations.cuisines.includes(restaurant.cuisine),
        }
      })

      // Sort by weather compatibility score
      filteredRestaurants.sort((a, b) => b.weatherScore - a.weatherScore)
    }

    return NextResponse.json({
      restaurants: filteredRestaurants,
      total: filteredRestaurants.length,
      weatherRecommendations: weatherRecommendations,
      userPreferences: userPreferences,
    })
  } catch (error) {
    console.error("Restaurant search error:", error)
    return NextResponse.json({ message: "Failed to fetch restaurants" }, { status: 500 })
  }
}
