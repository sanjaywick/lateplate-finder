import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any
    const userId = decoded.userId

    const body = await request.json()
    const { rating, feedback, category } = body

    const db = await connectDB()

    // Store feedback
    const feedbackDoc = {
      userId,
      rating: Number.parseInt(rating),
      feedback: feedback.trim(),
      category,
      timestamp: new Date().toISOString(),
      createdAt: new Date(),
      sentiment: analyzeSentiment(feedback), // Basic sentiment analysis
    }

    await db.collection("feedback").insertOne(feedbackDoc)

    // Log as user activity
    await db.collection("user_activities").insertOne({
      userId,
      type: "feedback",
      action: "submitted",
      details: `Gave ${rating}-star rating for ${category}`,
      metadata: { rating, category },
      timestamp: new Date().toISOString(),
      createdAt: new Date(),
    })

    // Update user feedback count
    await db.collection("users").updateOne(
      { _id: userId },
      {
        $inc: { feedbackCount: 1 },
        $set: { lastFeedback: new Date() },
      },
    )

    return NextResponse.json({ success: true, feedbackDoc })
  } catch (error) {
    console.error("Error submitting feedback:", error)
    return NextResponse.json({ message: "Failed to submit feedback" }, { status: 500 })
  }
}

// Basic sentiment analysis function
function analyzeSentiment(text: string): string {
  const positiveWords = [
    "good",
    "great",
    "excellent",
    "amazing",
    "love",
    "perfect",
    "awesome",
    "fantastic",
    "wonderful",
  ]
  const negativeWords = ["bad", "terrible", "awful", "hate", "horrible", "worst", "disappointing", "poor", "useless"]

  const words = text.toLowerCase().split(/\s+/)
  let positiveScore = 0
  let negativeScore = 0

  words.forEach((word) => {
    if (positiveWords.includes(word)) positiveScore++
    if (negativeWords.includes(word)) negativeScore++
  })

  if (positiveScore > negativeScore) return "positive"
  if (negativeScore > positiveScore) return "negative"
  return "neutral"
}
