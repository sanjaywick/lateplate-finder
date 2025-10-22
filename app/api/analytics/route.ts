import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const db = await connectDB()

    // Get user behavior data
    const users = await db.collection("users").find({}).toArray()
    const recipes = await db.collection("recipes").find({}).toArray()
    const feedback = await db.collection("feedback").find({}).toArray()
    const searchLogs = await db.collection("search_logs").find({}).toArray()

    // Calculate analytics
    const analytics = {
      overview: {
        totalUsers: users.length,
        totalRecipes: recipes.length,
        totalFeedback: feedback.length,
        avgRating: feedback.length > 0 ? feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.length : 0,
      },

      // User behavior clustering
      userBehavior: await analyzeUserBehavior(db),

      // Sentiment analysis
      sentimentAnalysis: await analyzeSentiment(feedback),

      // Search patterns
      searchPatterns: await analyzeSearchPatterns(searchLogs),

      // Cuisine popularity
      cuisinePopularity: await analyzeCuisinePopularity(db),

      // Peak hours
      peakHours: await analyzePeakHours(searchLogs),

      // Recipe performance
      recipePerformance: await analyzeRecipePerformance(recipes, feedback),
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ message: "Failed to generate analytics" }, { status: 500 })
  }
}

async function analyzeUserBehavior(db: any) {
  try {
    const users = await db.collection("users").find({}).toArray()

    // Cluster users by preferences
    const dietaryPrefs = {}
    const cuisinePrefs = {}

    users.forEach((user) => {
      if (user.preferences?.dietary) {
        user.preferences.dietary.forEach((pref) => {
          dietaryPrefs[pref] = (dietaryPrefs[pref] || 0) + 1
        })
      }
      if (user.preferences?.cuisines) {
        user.preferences.cuisines.forEach((cuisine) => {
          cuisinePrefs[cuisine] = (cuisinePrefs[cuisine] || 0) + 1
        })
      }
    })

    return {
      dietaryPreferences: Object.entries(dietaryPrefs).map(([key, value]) => ({
        name: key,
        count: value,
        percentage: Math.min(100, Math.round(((value as number) / users.length) * 100)),
      })),
      cuisinePreferences: Object.entries(cuisinePrefs).map(([key, value]) => ({
        name: key,
        count: value,
        percentage: Math.min(100, Math.round(((value as number) / users.length) * 100)),
      })),
    }
  } catch (error) {
    console.error("User behavior analysis error:", error)
    return { dietaryPreferences: [], cuisinePreferences: [] }
  }
}

async function analyzeSentiment(feedback: any[]) {
  try {
    const sentiments = { positive: 0, neutral: 0, negative: 0 }

    feedback.forEach((item) => {
      if (item.rating >= 4) sentiments.positive++
      else if (item.rating >= 3) sentiments.neutral++
      else sentiments.negative++
    })

    const total = feedback.length
    return {
      counts: sentiments,
      percentages: {
        positive: total > 0 ? Math.min(100, Math.round((sentiments.positive / total) * 100)) : 0,
        neutral: total > 0 ? Math.min(100, Math.round((sentiments.neutral / total) * 100)) : 0,
        negative: total > 0 ? Math.min(100, Math.round((sentiments.negative / total) * 100)) : 0,
      },
      total,
    }
  } catch (error) {
    console.error("Sentiment analysis error:", error)
    return {
      counts: { positive: 0, neutral: 0, negative: 0 },
      percentages: { positive: 0, neutral: 0, negative: 0 },
      total: 0,
    }
  }
}

async function analyzeSearchPatterns(searchLogs: any[]) {
  try {
    const hourlyPatterns = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      restaurants: 0,
      recipes: 0,
      grocery: 0,
    }))

    searchLogs.forEach((log) => {
      const hour = new Date(log.timestamp).getHours()
      if (log.type === "restaurant") hourlyPatterns[hour].restaurants++
      else if (log.type === "recipe") hourlyPatterns[hour].recipes++
      else if (log.type === "grocery") hourlyPatterns[hour].grocery++
    })

    return hourlyPatterns
  } catch (error) {
    console.error("Search patterns analysis error:", error)
    return []
  }
}

async function analyzeCuisinePopularity(db: any) {
  try {
    const recipes = await db.collection("recipes").find({}).toArray()
    const cuisineCounts = {}

    recipes.forEach((recipe) => {
      const cuisine = recipe.cuisine || "Other"
      cuisineCounts[cuisine] = (cuisineCounts[cuisine] || 0) + 1
    })

    return Object.entries(cuisineCounts)
      .map(([cuisine, count]) => ({
        name: cuisine,
        count: count as number,
        percentage: Math.min(100, Math.round(((count as number) / recipes.length) * 100)),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  } catch (error) {
    console.error("Cuisine popularity analysis error:", error)
    return []
  }
}

async function analyzePeakHours(searchLogs: any[]) {
  try {
    const hourCounts = Array.from({ length: 24 }, () => 0)

    searchLogs.forEach((log) => {
      const hour = new Date(log.timestamp).getHours()
      hourCounts[hour]++
    })

    const peakHour = hourCounts.indexOf(Math.max(...hourCounts))
    const peakCount = Math.max(...hourCounts)

    return {
      peakHour,
      peakCount,
      hourlyDistribution: hourCounts.map((count, hour) => ({ hour, count })),
    }
  } catch (error) {
    console.error("Peak hours analysis error:", error)
    return { peakHour: 0, peakCount: 0, hourlyDistribution: [] }
  }
}

async function analyzeRecipePerformance(recipes: any[], feedback: any[]) {
  try {
    const recipeStats = recipes.map((recipe) => {
      const recipeFeedback = feedback.filter((f) => f.itemId === recipe._id.toString())
      const avgRating =
        recipeFeedback.length > 0 ? recipeFeedback.reduce((sum, f) => sum + f.rating, 0) / recipeFeedback.length : 0

      return {
        id: recipe._id,
        name: recipe.name,
        rating: avgRating,
        reviewCount: recipeFeedback.length,
        cookTime: recipe.cookTime,
        difficulty: recipe.difficulty,
      }
    })

    return {
      topRated: recipeStats.sort((a, b) => b.rating - a.rating).slice(0, 10),
      mostReviewed: recipeStats.sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 10),
      quickest: recipeStats.sort((a, b) => a.cookTime - b.cookTime).slice(0, 10),
    }
  } catch (error) {
    console.error("Recipe performance analysis error:", error)
    return { topRated: [], mostReviewed: [], quickest: [] }
  }
}
