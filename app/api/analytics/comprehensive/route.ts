import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any
      // Note: In a real app, you'd check if the user is an admin
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const db = await connectDB()

    // Get comprehensive analytics data
    const [totalRecipes, totalRestaurants, totalUsers, totalSearches, totalFeedback, recentActivities, mlResults] =
      await Promise.all([
        db.collection("recipes").countDocuments(),
        db.collection("restaurants").countDocuments(),
        db.collection("users").countDocuments(),
        db.collection("search_logs").countDocuments(),
        db.collection("feedback").countDocuments(),
        db.collection("user_activities").find({}).sort({ timestamp: -1 }).limit(100).toArray(),
        db.collection("ml_analytics_results").find({}).sort({ timestamp: -1 }).toArray(),
      ])

    // Calculate user behavior patterns
    const userBehavior = await calculateUserBehavior(db)

    // Calculate temporal patterns
    const temporalPatterns = await calculateTemporalPatterns(db)

    // Get sentiment analysis
    const sentimentData = await calculateSentimentAnalysis(db)

    // Get top rated content
    const topRated = await getTopRatedContent(db)

    const analyticsData = {
      overview: {
        totalRecipes,
        totalRestaurants,
        totalUsers,
        activeUsers: Math.floor(totalUsers * 0.7), // Estimate active users
        totalSearches,
        avgRating: sentimentData.avgRating,
      },
      userBehavior: {
        searchTypes: userBehavior.searchTypes,
        peakHour: userBehavior.peakHour,
        avgSessionDuration: userBehavior.avgSessionDuration,
      },
      temporalPatterns: {
        hourlyPatterns: temporalPatterns.hourlyPatterns,
        dailyPatterns: temporalPatterns.dailyPatterns,
      },
      sentiment: {
        positive: sentimentData.positive,
        neutral: sentimentData.neutral,
        negative: sentimentData.negative,
        avgRating: sentimentData.avgRating,
      },
      topRated: {
        recipes: topRated.recipes,
        restaurants: topRated.restaurants,
      },
      mlResults: mlResults.reduce((acc, result) => {
        acc[result.analysisType] = result.results
        return acc
      }, {}),
      lastUpdated: new Date(),
    }

    return NextResponse.json({
      success: true,
      data: analyticsData,
    })
  } catch (error) {
    console.error("Error fetching comprehensive analytics:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch analytics data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

async function calculateUserBehavior(db: any) {
  const activities = await db.collection("user_activities").find({}).toArray()
  const searchLogs = await db.collection("search_logs").find({}).toArray()

  const searchTypes = {
    recipe: 0,
    restaurant: 0,
    grocery: 0,
  }

  const hourlyActivity = new Array(24).fill(0)

  // Analyze search logs
  searchLogs.forEach((log: any) => {
    if (log.type) {
      searchTypes[log.type as keyof typeof searchTypes] = (searchTypes[log.type as keyof typeof searchTypes] || 0) + 1
    }

    if (log.timestamp) {
      const hour = new Date(log.timestamp).getHours()
      hourlyActivity[hour]++
    }
  })

  // Analyze user activities
  activities.forEach((activity: any) => {
    if (activity.timestamp) {
      const hour = new Date(activity.timestamp).getHours()
      hourlyActivity[hour]++
    }
  })

  const peakHour = hourlyActivity.indexOf(Math.max(...hourlyActivity))

  return {
    searchTypes,
    peakHour,
    avgSessionDuration: 12.5, // minutes - could be calculated from actual session data
  }
}

async function calculateTemporalPatterns(db: any) {
  const activities = await db.collection("user_activities").find({}).toArray()

  const hourlyPatterns = new Array(24).fill(0)
  const dailyPatterns = new Array(7).fill(0)

  activities.forEach((activity: any) => {
    if (activity.timestamp) {
      const date = new Date(activity.timestamp)
      const hour = date.getHours()
      const day = date.getDay()

      hourlyPatterns[hour]++
      dailyPatterns[day]++
    }
  })

  return {
    hourlyPatterns,
    dailyPatterns,
  }
}

async function calculateSentimentAnalysis(db: any) {
  const feedback = await db.collection("feedback").find({}).toArray()

  let positive = 0
  let neutral = 0
  let negative = 0
  let totalRating = 0

  feedback.forEach((item: any) => {
    const rating = item.rating || 3
    totalRating += rating

    if (rating >= 4) {
      positive++
    } else if (rating <= 2) {
      negative++
    } else {
      neutral++
    }
  })

  return {
    positive,
    neutral,
    negative,
    avgRating: feedback.length > 0 ? totalRating / feedback.length : 0,
  }
}

async function getTopRatedContent(db: any) {
  const recipes = await db.collection("recipes").find({}).sort({ rating: -1 }).limit(10).toArray()

  const restaurants = await db.collection("restaurants").find({}).sort({ rating: -1 }).limit(10).toArray()

  return {
    recipes: recipes.map((r) => ({
      name: r.RecipeName || r.name,
      rating: r.rating || 4.5,
      cuisine: r.Cuisine || r.cuisine,
    })),
    restaurants: restaurants.map((r) => ({
      name: r.name,
      rating: r.rating || 4.2,
      cuisine: r.cuisine,
    })),
  }
}
