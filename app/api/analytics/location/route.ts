import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { latitude, longitude, address, timestamp, source, accuracy } = body

    // Get user from token
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    let userId = null

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any
        userId = decoded.userId
      } catch (error) {
        console.log("Invalid token, logging as anonymous")
      }
    }

    // Validate required fields
    if (!latitude || !longitude) {
      return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Store location log
    const locationLog = {
      user_id: userId,
      latitude: Number.parseFloat(latitude),
      longitude: Number.parseFloat(longitude),
      address: address || `${latitude}, ${longitude}`,
      timestamp: new Date(timestamp) || new Date(),
      source: source || "unknown",
      accuracy: accuracy || "medium",
      userAgent: request.headers.get("user-agent") || "",
      ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
    }

    await db.collection("location_logs").insertOne(locationLog)

    // Also log as search activity if user is authenticated
    if (userId) {
      const searchLog = {
        user_id: userId,
        type: "location_search",
        query: address,
        timestamp: new Date(),
        metadata: {
          latitude: Number.parseFloat(latitude),
          longitude: Number.parseFloat(longitude),
          source,
          accuracy,
        },
      }

      await db.collection("search_logs").insertOne(searchLog)
    }

    return NextResponse.json({
      success: true,
      message: "Location logged successfully",
    })
  } catch (error) {
    console.error("Error logging location:", error)
    return NextResponse.json({ error: "Failed to log location" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const { db } = await connectToDatabase()

    let query = {}
    if (userId) {
      query = { user_id: userId }
    }

    const locationLogs = await db.collection("location_logs").find(query).sort({ timestamp: -1 }).limit(limit).toArray()

    return NextResponse.json({
      success: true,
      data: locationLogs,
      total: locationLogs.length,
    })
  } catch (error) {
    console.error("Error fetching location logs:", error)
    return NextResponse.json({ error: "Failed to fetch location logs" }, { status: 500 })
  }
}
