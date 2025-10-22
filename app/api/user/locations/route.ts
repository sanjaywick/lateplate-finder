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
    const locations = await db.collection("user_locations").find({ userId }).toArray()

    return NextResponse.json({ locations })
  } catch (error) {
    console.error("Error fetching user locations:", error)
    return NextResponse.json({ message: "Failed to fetch locations" }, { status: 500 })
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
    const { name, address, latitude, longitude, isDefault, source, accuracy, userAgent } = body

    const db = await connectDB()

    // If this is set as default, unset other defaults
    if (isDefault) {
      await db.collection("user_locations").updateMany(
        { userId },
        { $set: { isDefault: false } }
      )
    }

    const location = {
      userId,
      name,
      address,
      latitude,
      longitude,
      isDefault: isDefault || false,
      source: source || 'manual',
      accuracy: accuracy || null,
      userAgent: userAgent || null,
      timestamp: new Date(),
      createdAt: new Date(),
    }

    const result = await db.collection("user_locations").insertOne(location)

    // Also log this location access
    const locationLog = {
      userId,
      latitude,
      longitude,
      address,
      source: source || 'manual',
      accuracy: accuracy || null,
      userAgent: userAgent || null,
      timestamp: new Date(),
      createdAt: new Date(),
    }

    await db.collection("location_logs").insertOne(locationLog)

    return NextResponse.json({ 
      success: true, 
      location: { ...location, _id: result.insertedId },
      message: "Location saved successfully"
    })
  } catch (error) {
    console.error("Error saving user location:", error)
    return NextResponse.json({ message: "Failed to save location" }, { status: 500 })
  }
}
