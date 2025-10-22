import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any
    const userId = decoded.userId

    const db = await connectDB()

    // Get all user activities
    const activities = await db
      .collection("user_activities")
      .find({
        userId: new ObjectId(userId),
      })
      .toArray()

    // Get user feedback
    const feedback = await db
      .collection("feedback")
      .find({
        userId: new ObjectId(userId),
      })
      .toArray()

    // Calculate stats from activities
    const restaurantsFound = activities.filter(
      (a) => a.type === "restaurant" && (a.action === "viewed" || a.action === "searched"),
    ).length

    const recipesTried = activities.filter((a) => a.type === "recipe" && a.action === "viewed").length

    const groceriesFound = activities.filter(
      (a) => a.type === "grocery" && (a.action === "directions" || a.action === "viewed"),
    ).length

    const reviewsGiven = feedback.length

    // Calculate weekly growth
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const thisWeekActivities = activities.filter((a) => new Date(a.timestamp) > oneWeekAgo).length

    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

    const lastWeekActivities = activities.filter((a) => {
      const activityDate = new Date(a.timestamp)
      return activityDate > twoWeeksAgo && activityDate <= oneWeekAgo
    }).length

    let weeklyGrowth = "+0%"
    if (lastWeekActivities > 0) {
      const growthPercent = Math.round(((thisWeekActivities - lastWeekActivities) / lastWeekActivities) * 100)
      weeklyGrowth = `${growthPercent >= 0 ? "+" : ""}${growthPercent}%`
    } else if (thisWeekActivities > 0) {
      weeklyGrowth = "+100%"
    }

    const stats = {
      restaurantsFound,
      recipesTried,
      groceriesFound, // Updated field name from grocerySearches to groceriesFound
      reviewsGiven,
      weeklyGrowth,
      totalActivities: activities.length,
      lastActivity: activities.length > 0 ? activities[activities.length - 1].timestamp : null,
    }

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return NextResponse.json({ message: "Failed to fetch stats" }, { status: 500 })
  }
}
