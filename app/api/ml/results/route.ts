import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization")
    let token = null

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]
    }

    // Allow access without strict auth for now
    if (token) {
      try {
        jwt.verify(token, process.env.JWT_SECRET || "fallback-secret")
      } catch (error) {
        console.log("Invalid token, proceeding with limited access")
      }
    }

    const { db } = await connectToDatabase()

    // Get the latest results from each ML analysis type
    const [sentimentResults, clusteringResults, recipeResults] = await Promise.all([
      db
        .collection("ml_analytics_results")
        .findOne({ analysisType: "sentiment_analysis" }, { sort: { timestamp: -1 } }),
      db.collection("clusteringResults").findOne({}, { sort: { timestamp: -1 } }),
      db
        .collection("ml_analytics_results")
        .findOne({ analysisType: "recipe_recommendations" }, { sort: { timestamp: -1 } }),
    ])

    console.log("[v0] Clustering results from DB:", clusteringResults)
    console.log("[v0] Sentiment results from DB:", sentimentResults)

    // If we have real ML results, use them
    if (sentimentResults || clusteringResults || recipeResults) {
      const restaurantClusteringData = clusteringResults
        ? {
            clustersFound: clusteringResults.clustersFound || 0,
            totalRestaurants: clusteringResults.totalRestaurants || 0,
            clusterAnalysis: clusteringResults.results || {},
            analysisDate: clusteringResults.timestamp || new Date(),
            algorithm: clusteringResults.algorithm || "kmeans",
          }
        : await generateFallbackClusteringAnalysis(db)

      console.log("[v0] Final restaurant clustering data:", restaurantClusteringData)

      const results = {
        sentimentAnalysis: sentimentResults?.results || (await generateFallbackSentimentAnalysis(db)),
        restaurantClustering: restaurantClusteringData,
        recipeRecommendations: recipeResults?.results || (await generateFallbackRecipeAnalysis(db)),
        userBehaviorAnalysis: await generateUserBehaviorAnalysis(db),
        totalPredictions:
          (sentimentResults?.results?.totalAnalyzed || 0) + (restaurantClusteringData.totalRestaurants || 0),
        lastUpdated: new Date(),
      }

      console.log("[v0] Complete ML results being returned:", JSON.stringify(results, null, 2))

      return NextResponse.json({
        success: true,
        results,
        timestamp: new Date(),
        source: "real_ml_analysis",
      })
    }

    const fallbackResults = await generateComprehensiveFallbackData(db)

    return NextResponse.json({
      success: true,
      results: fallbackResults,
      message: "Using fallback analysis - run ML analysis for real results",
      source: "fallback_analysis",
    })
  } catch (error) {
    console.error("Error fetching ML results:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch ML results",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

async function generateFallbackSentimentAnalysis(db: any) {
  const [feedback, userActivities] = await Promise.all([
    db.collection("feedback").find({}).toArray(),
    db
      .collection("user_activities")
      .find({
        action: { $in: ["reviewed", "rated", "commented"] },
      })
      .toArray(),
  ])

  const allReviews = [
    ...feedback.map((f: any) => ({
      rating: f.rating || 3,
      text: f.message || f.comment || "",
      source: "feedback",
    })),
    ...userActivities.map((a: any) => ({
      rating: a.metadata?.rating || 3,
      text: a.details || a.metadata?.comment || "",
      source: "user_activity",
    })),
  ]

  if (allReviews.length === 0) {
    return {
      sentimentPercentages: { positive: 0, neutral: 100, negative: 0 },
      averageRating: 0,
      totalFeedback: 0,
      algorithm: "No Data Available",
    }
  }

  const sentimentCounts = { positive: 0, neutral: 0, negative: 0 }
  let totalRating = 0

  allReviews.forEach((review) => {
    totalRating += review.rating

    // Analyze actual text content for sentiment
    const textSentiment = analyzeTextSentiment(review.text)
    const combinedSentiment = getCombinedSentiment(review.rating, textSentiment)

    sentimentCounts[combinedSentiment]++
  })

  const total = allReviews.length
  return {
    sentimentCounts,
    sentimentPercentages: {
      positive: Math.min(100, Math.round((sentimentCounts.positive / total) * 100)),
      neutral: Math.min(100, Math.round((sentimentCounts.neutral / total) * 100)),
      negative: Math.min(100, Math.round((sentimentCounts.negative / total) * 100)),
    },
    averageRating: totalRating / total,
    totalFeedback: total,
    algorithm: "Real Text and Rating Analysis",
  }
}

function analyzeTextSentiment(text: string): "positive" | "negative" | "neutral" {
  if (!text || text.trim().length === 0) return "neutral"

  const positiveWords = [
    "excellent",
    "amazing",
    "great",
    "fantastic",
    "wonderful",
    "perfect",
    "outstanding",
    "delicious",
    "tasty",
    "fresh",
    "good",
    "nice",
    "love",
    "best",
    "awesome",
    "incredible",
    "superb",
    "brilliant",
    "satisfied",
    "happy",
    "recommend",
  ]

  const negativeWords = [
    "terrible",
    "awful",
    "horrible",
    "disgusting",
    "bad",
    "worst",
    "hate",
    "disappointing",
    "poor",
    "slow",
    "cold",
    "dirty",
    "rude",
    "expensive",
    "bland",
    "tasteless",
    "stale",
    "burnt",
    "unpleasant",
    "frustrated",
  ]

  const words = text.toLowerCase().split(/\W+/)
  const positiveCount = words.filter((word) => positiveWords.includes(word)).length
  const negativeCount = words.filter((word) => negativeWords.includes(word)).length

  if (positiveCount > negativeCount) return "positive"
  if (negativeCount > positiveCount) return "negative"
  return "neutral"
}

function getCombinedSentiment(
  rating: number,
  textSentiment: "positive" | "negative" | "neutral",
): "positive" | "negative" | "neutral" {
  // Weight rating more heavily, but consider text sentiment
  if (rating >= 4 && textSentiment !== "negative") return "positive"
  if (rating <= 2 && textSentiment !== "positive") return "negative"
  if (rating === 3) return textSentiment
  return rating > 3 ? "positive" : "negative"
}

async function generateFallbackClusteringAnalysis(db: any) {
  const restaurants = await db.collection("restaurants").find({}).limit(500).toArray()

  if (restaurants.length === 0) {
    return {
      clustersFound: 0,
      totalRestaurants: 0,
      clusterAnalysis: {},
      analysisDate: new Date(),
    }
  }

  // Simple location-based clustering
  const locationClusters: { [key: string]: any[] } = {}
  restaurants.forEach((restaurant: any) => {
    const lat = Math.floor((restaurant.latitude || 0) * 10) / 10
    const lng = Math.floor((restaurant.longitude || 0) * 10) / 10
    const key = `${lat},${lng}`

    if (!locationClusters[key]) locationClusters[key] = []
    locationClusters[key].push(restaurant)
  })

  const clusterAnalysis: { [key: string]: any } = {}
  Object.entries(locationClusters).forEach(([location, rests], index) => {
    clusterAnalysis[index] = {
      size: rests.length,
      avgRating: rests.reduce((sum, r) => sum + (r.rating || 0), 0) / rests.length || 0,
      cuisines: [...new Set(rests.map((r) => r.cuisine).filter(Boolean))],
      centerLat: rests.reduce((sum, r) => sum + (r.latitude || 0), 0) / rests.length,
      centerLng: rests.reduce((sum, r) => sum + (r.longitude || 0), 0) / rests.length,
    }
  })

  return {
    clustersFound: Object.keys(locationClusters).length,
    totalRestaurants: restaurants.length,
    clusterAnalysis,
    analysisDate: new Date(),
  }
}

async function generateFallbackRecipeAnalysis(db: any) {
  const recipes = await db.collection("recipes").find({}).limit(1000).toArray()

  const cuisineCount: { [key: string]: number } = {}
  let totalCookTime = 0
  let validCookTimes = 0

  recipes.forEach((recipe: any) => {
    const cuisine = recipe.Cuisine || "Unknown"
    cuisineCount[cuisine] = (cuisineCount[cuisine] || 0) + 1

    if (recipe.CookTimeInMins && recipe.CookTimeInMins > 0) {
      totalCookTime += recipe.CookTimeInMins
      validCookTimes++
    }
  })

  const topCuisines = Object.entries(cuisineCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([cuisine, count]) => ({ cuisine, count }))

  return {
    totalRecipes: recipes.length,
    avgCookingTime: validCookTimes > 0 ? Math.round(totalCookTime / validCookTimes) : 30,
    topCuisines,
    analysisDate: new Date(),
  }
}

async function generateUserBehaviorAnalysis(db: any) {
  const activities = await db.collection("user_activities").find({}).toArray()

  const hourCounts: { [key: number]: number } = {}
  const actionCounts: { [key: string]: number } = {}

  activities.forEach((activity: any) => {
    const hour = new Date(activity.timestamp).getHours()
    hourCounts[hour] = (hourCounts[hour] || 0) + 1

    const action = activity.action || "unknown"
    actionCounts[action] = (actionCounts[action] || 0) + 1
  })

  const peakHours = Object.entries(hourCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([hour]) => Number.parseInt(hour))

  const totalActions = Object.values(actionCounts).reduce((sum, count) => sum + count, 0)
  const searchPatterns = {
    recipe_search: Math.round(((actionCounts.searched || 0) / totalActions) * 100) || 0,
    restaurant_search: Math.round(((actionCounts.directions || 0) / totalActions) * 100) || 0,
    grocery_search: Math.round(((actionCounts.viewed || 0) / totalActions) * 100) || 0,
  }

  return {
    peakHours,
    userSegments: {
      active: Math.floor(activities.length * 0.3),
      moderate: Math.floor(activities.length * 0.5),
      casual: Math.floor(activities.length * 0.2),
    },
    searchPatterns,
  }
}

async function generateComprehensiveFallbackData(db: any) {
  const [sentimentAnalysis, restaurantClustering, recipeRecommendations, userBehaviorAnalysis] = await Promise.all([
    generateFallbackSentimentAnalysis(db),
    generateFallbackClusteringAnalysis(db),
    generateFallbackRecipeAnalysis(db),
    generateUserBehaviorAnalysis(db),
  ])

  return {
    sentimentAnalysis,
    restaurantClustering,
    recipeRecommendations,
    userBehaviorAnalysis,
    totalPredictions: sentimentAnalysis.totalFeedback + restaurantClustering.totalRestaurants,
    lastUpdated: new Date(),
  }
}
