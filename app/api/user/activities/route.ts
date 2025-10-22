import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
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

    const userId = decoded.userId
    const db = await connectDB()

    // Get user activities with proper sorting
    const activities = await db
      .collection("user_activities")
      .find({ userId: new ObjectId(userId) })
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray()

    return NextResponse.json({
      success: true,
      activities: activities.map((activity) => ({
        ...activity,
        _id: activity._id.toString(),
        userId: activity.userId.toString(),
      })),
    })
  } catch (error) {
    console.error("Error fetching user activities:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const userId = decoded.userId
    const activityData = await request.json()
    const db = await connectDB()

    // Create comprehensive activity record
    const activity = {
      userId: new ObjectId(userId),
      type: activityData.type,
      action: activityData.action,
      details: activityData.details,
      metadata: {
        ...activityData.metadata,
        userAgent: request.headers.get("user-agent"),
        ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
      },
      timestamp: new Date(activityData.timestamp || new Date()),
      createdAt: new Date(),
    }

    // Insert activity
    const result = await db.collection("user_activities").insertOne(activity)

    // If this is a recipe view, also handle favorite recipes
    if (activityData.type === "recipe" && activityData.action === "viewed" && activityData.metadata?.recipeName) {
      await handleRecipeFavorite(db, userId, activityData.metadata)
    }

    // If this is a restaurant interaction, store restaurant data
    if (activityData.type === "restaurant" && activityData.metadata?.restaurantName) {
      await handleRestaurantInteraction(db, userId, activityData.metadata)
    }

    return NextResponse.json({
      success: true,
      activityId: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("Error logging user activity:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

async function handleRecipeFavorite(db: any, userId: string, metadata: any) {
  try {
    // Check if recipe is already in user's favorites
    const existingFavorite = await db.collection("user_favorites").findOne({
      userId: new ObjectId(userId),
      type: "recipe",
      "data.recipeName": metadata.recipeName,
    })

    if (!existingFavorite) {
      // Add to favorites
      await db.collection("user_favorites").insertOne({
        userId: new ObjectId(userId),
        type: "recipe",
        data: {
          recipeName: metadata.recipeName,
          cuisine: metadata.cuisine,
          cookTime: metadata.cookTime,
          rating: metadata.rating || 4.0,
          ingredients: metadata.ingredients,
          course: metadata.course,
          diet: metadata.diet,
          url: metadata.url,
        },
        viewCount: 1,
        lastViewed: new Date(),
        createdAt: new Date(),
      })
    } else {
      // Update view count and last viewed
      await db.collection("user_favorites").updateOne(
        { _id: existingFavorite._id },
        {
          $inc: { viewCount: 1 },
          $set: { lastViewed: new Date() },
        },
      )
    }
  } catch (error) {
    console.error("Error handling recipe favorite:", error)
  }
}

async function handleRestaurantInteraction(db: any, userId: string, metadata: any) {
  try {
    // Store restaurant interaction
    const existingInteraction = await db.collection("user_restaurant_interactions").findOne({
      userId: new ObjectId(userId),
      "data.restaurantName": metadata.restaurantName,
    })

    if (!existingInteraction) {
      await db.collection("user_restaurant_interactions").insertOne({
        userId: new ObjectId(userId),
        data: {
          restaurantName: metadata.restaurantName,
          cuisine: metadata.cuisine,
          rating: metadata.rating,
          location: metadata.location,
          priceLevel: metadata.priceLevel,
        },
        interactionCount: 1,
        lastInteraction: new Date(),
        createdAt: new Date(),
      })
    } else {
      await db.collection("user_restaurant_interactions").updateOne(
        { _id: existingInteraction._id },
        {
          $inc: { interactionCount: 1 },
          $set: { lastInteraction: new Date() },
        },
      )
    }
  } catch (error) {
    console.error("Error handling restaurant interaction:", error)
  }
}
