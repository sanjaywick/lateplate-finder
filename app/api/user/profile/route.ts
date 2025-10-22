import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    // Get token from Authorization header
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
    const profileData = await request.json()
    const db = await connectDB()

    // Update user profile
    const updateResult = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          name: profileData.name,
          phone: profileData.phone,
          email: profileData.email,
          hasDiabetes: profileData.hasDiabetes === "yes",
          dietaryPreference: profileData.dietaryPreference,
          allergies: profileData.allergies || [],
          favoritesCuisines: profileData.favoritesCuisines || [],
          profileComplete: true,
          updatedAt: new Date(),
        },
      },
    )

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Get updated user data
    const updatedUser = await db.collection("users").findOne({ _id: new ObjectId(userId) })

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        hasDiabetes: updatedUser.hasDiabetes,
        dietaryPreference: updatedUser.dietaryPreference,
        allergies: updatedUser.allergies,
        favoritesCuisines: updatedUser.favoritesCuisines,
        profileComplete: updatedUser.profileComplete,
      },
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
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
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        hasDiabetes: user.hasDiabetes,
        dietaryPreference: user.dietaryPreference,
        allergies: user.allergies || [],
        favoritesCuisines: user.favoritesCuisines || [],
        profileComplete: user.profileComplete || false,
      },
    })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
