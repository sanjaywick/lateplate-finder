import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import jwt from "jsonwebtoken"

function analyzeSentimentFromText(text: string): { sentiment: "positive" | "negative" | "neutral"; score: number } {
  if (!text || text.trim().length === 0) {
    return { sentiment: "neutral", score: 0.5 }
  }

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
    "magnificent",
    "exceptional",
    "marvelous",
    "satisfied",
    "happy",
    "pleased",
    "recommend",
    "favorite",
    "quality",
    "fast",
    "friendly",
    "helpful",
    "clean",
    "comfortable",
    "convenient",
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
    "overpriced",
    "bland",
    "tasteless",
    "stale",
    "burnt",
    "undercooked",
    "soggy",
    "greasy",
    "salty",
    "bitter",
    "sour",
    "unpleasant",
    "unsatisfied",
    "angry",
    "frustrated",
    "waste",
  ]

  const words = text.toLowerCase().split(/\W+/)
  let positiveScore = 0
  let negativeScore = 0

  words.forEach((word) => {
    if (positiveWords.includes(word)) {
      positiveScore++
    } else if (negativeWords.includes(word)) {
      negativeScore++
    }
  })

  const totalSentimentWords = positiveScore + negativeScore
  if (totalSentimentWords === 0) {
    return { sentiment: "neutral", score: 0.5 }
  }

  const positiveRatio = positiveScore / totalSentimentWords
  const negativeRatio = negativeScore / totalSentimentWords

  if (positiveRatio > 0.6) {
    return { sentiment: "positive", score: 0.7 + (positiveRatio - 0.6) * 0.75 }
  } else if (negativeRatio > 0.6) {
    return { sentiment: "negative", score: 0.3 - (negativeRatio - 0.6) * 0.75 }
  } else {
    return { sentiment: "neutral", score: 0.4 + positiveRatio * 0.2 }
  }
}

function analyzeSentimentFromRating(
  rating: number,
  text?: string,
): { sentiment: "positive" | "negative" | "neutral"; score: number } {
  let baseSentiment: { sentiment: "positive" | "negative" | "neutral"; score: number }

  // Base sentiment from rating
  if (rating >= 4) {
    baseSentiment = { sentiment: "positive", score: 0.6 + (rating - 4) * 0.2 }
  } else if (rating <= 2) {
    baseSentiment = { sentiment: "negative", score: 0.4 - (2 - rating) * 0.2 }
  } else {
    baseSentiment = { sentiment: "neutral", score: 0.45 + (rating - 2.5) * 0.1 }
  }

  // Adjust with text analysis if available
  if (text && text.trim().length > 0) {
    const textSentiment = analyzeSentimentFromText(text)

    // Weighted combination: 60% rating, 40% text
    const combinedScore = baseSentiment.score * 0.6 + textSentiment.score * 0.4

    let finalSentiment: "positive" | "negative" | "neutral"
    if (combinedScore > 0.6) {
      finalSentiment = "positive"
    } else if (combinedScore < 0.4) {
      finalSentiment = "negative"
    } else {
      finalSentiment = "neutral"
    }

    return { sentiment: finalSentiment, score: combinedScore }
  }

  return baseSentiment
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    jwt.verify(token, process.env.JWT_SECRET!)

    const { db } = await connectToDatabase()

    const feedback = await db.collection("feedback").find({}).toArray()
    const userActivities = await db
      .collection("user_activities")
      .find({
        action: { $in: ["reviewed", "rated", "commented"] },
      })
      .toArray()

    if (feedback.length === 0 && userActivities.length === 0) {
      return NextResponse.json({ error: "No feedback data available for analysis" }, { status: 404 })
    }

    const sentimentResults = {
      positive: 0,
      negative: 0,
      neutral: 0,
      totalAnalyzed: 0,
      averageScore: 0,
      detailedAnalysis: [] as any[],
    }

    let totalScore = 0

    // Analyze feedback collection
    feedback.forEach((item) => {
      const rating = item.rating || 3
      const text = item.message || item.comment || ""

      const analysis = analyzeSentimentFromRating(rating, text)

      sentimentResults[analysis.sentiment]++
      sentimentResults.totalAnalyzed++
      totalScore += analysis.score

      sentimentResults.detailedAnalysis.push({
        id: item._id,
        rating,
        text: text.substring(0, 100), // First 100 chars for privacy
        sentiment: analysis.sentiment,
        score: analysis.score,
        source: "feedback",
      })
    })

    // Analyze user activities with reviews/ratings
    userActivities.forEach((activity) => {
      const rating = activity.metadata?.rating || 3
      const text = activity.details || activity.metadata?.comment || ""

      const analysis = analyzeSentimentFromRating(rating, text)

      sentimentResults[analysis.sentiment]++
      sentimentResults.totalAnalyzed++
      totalScore += analysis.score

      sentimentResults.detailedAnalysis.push({
        id: activity._id,
        rating,
        text: text.substring(0, 100),
        sentiment: analysis.sentiment,
        score: analysis.score,
        source: "user_activity",
      })
    })

    sentimentResults.averageScore =
      sentimentResults.totalAnalyzed > 0 ? totalScore / sentimentResults.totalAnalyzed : 0.5

    // Calculate percentages
    const percentages = {
      positive: Math.min(100, Math.round((sentimentResults.positive / sentimentResults.totalAnalyzed) * 100)),
      negative: Math.min(100, Math.round((sentimentResults.negative / sentimentResults.totalAnalyzed) * 100)),
      neutral: Math.min(100, Math.round((sentimentResults.neutral / sentimentResults.totalAnalyzed) * 100)),
    }

    // Save results to database
    await db.collection("ml_analytics_results").insertOne({
      analysisType: "sentiment_analysis",
      timestamp: new Date(),
      results: {
        sentimentCounts: {
          positive: sentimentResults.positive,
          negative: sentimentResults.negative,
          neutral: sentimentResults.neutral,
        },
        sentimentPercentages: percentages,
        averageScore: sentimentResults.averageScore,
        totalAnalyzed: sentimentResults.totalAnalyzed,
        algorithm: "Text-Based Sentiment Analysis with Rating Correlation",
      },
    })

    return NextResponse.json({
      success: true,
      results: {
        sentimentCounts: {
          positive: sentimentResults.positive,
          negative: sentimentResults.negative,
          neutral: sentimentResults.neutral,
        },
        sentimentPercentages: percentages,
        averageScore: sentimentResults.averageScore,
        totalAnalyzed: sentimentResults.totalAnalyzed,
        topPositiveReviews: sentimentResults.detailedAnalysis
          .filter((item) => item.sentiment === "positive")
          .sort((a, b) => b.score - a.score)
          .slice(0, 5),
        topNegativeReviews: sentimentResults.detailedAnalysis
          .filter((item) => item.sentiment === "negative")
          .sort((a, b) => a.score - b.score)
          .slice(0, 5),
      },
    })
  } catch (error) {
    console.error("Sentiment analysis error:", error)
    return NextResponse.json({ error: "Failed to perform sentiment analysis" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    jwt.verify(token, process.env.JWT_SECRET!)

    const { db } = await connectToDatabase()

    // Get recent sentiment analysis results
    const recentResults = await db
      .collection("ml_analytics_results")
      .find({ analysisType: "sentiment_analysis" })
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray()

    if (recentResults.length === 0) {
      return NextResponse.json({ error: "No sentiment analysis results found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      results: recentResults[0].results,
      timestamp: recentResults[0].timestamp,
    })
  } catch (error) {
    console.error("Get sentiment analysis error:", error)
    return NextResponse.json({ error: "Failed to get sentiment analysis data" }, { status: 500 })
  }
}
