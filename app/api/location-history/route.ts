import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import jwt from "jsonwebtoken"

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

    // Get unique addresses from location history, sorted by most recent
    const pipeline = [
      { $match: { userId } },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$address",
          address: { $first: "$address" },
          latitude: { $first: "$latitude" },
          longitude: { $first: "$longitude" },
          lastUsed: { $first: "$timestamp" },
        },
      },
      { $sort: { lastUsed: -1 } },
      { $limit: 10 }, // Limit to 10 most recent unique addresses
      {
        $project: {
          _id: 0,
          name: "$address",
          address: "$address",
          latitude: 1,
          longitude: 1,
        },
      },
    ]

    const history = await db.collection("location_logs").aggregate(pipeline).toArray()

    return NextResponse.json({ history })
  } catch (error) {
    console.error("Error fetching location history:", error)
    return NextResponse.json({ message: "Failed to fetch location history" }, { status: 500 })
  }
}

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
    const { address, latitude, longitude, source, accuracy, userAgent } = body

    const db = await connectDB()

    // Check if this exact address was used recently (within last hour) to avoid duplicates
    const recentLog = await db.collection("location_logs").findOne({
      userId,
      address,
      timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) }, // Last hour
    })

    if (!recentLog) {
      // Add to location history
      const locationLog = {
        userId,
        latitude,
        longitude,
        address,
        source: source || "manual",
        accuracy: accuracy || null,
        userAgent: userAgent || null,
        timestamp: new Date(),
        createdAt: new Date(),
      }

      await db.collection("location_logs").insertOne(locationLog)
    }

    return NextResponse.json({
      success: true,
      message: "Location added to history",
    })
  } catch (error) {
    console.error("Error saving location history:", error)
    return NextResponse.json({ message: "Failed to save location history" }, { status: 500 })
  }
}
