import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const userId = decoded.userId

    const { db } = await connectToDatabase()
    const user = await db.collection("users").findOne({ _id: userId })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Return user preferences with defaults if not set
    const preferences = {
      dietaryRestrictions: user.dietaryRestrictions || [],
      allergies: user.allergies || [],
      favoriteCuisines: user.favoriteCuisines || [],
      spiceLevel: user.spiceLevel || "medium",
      isVegetarian: user.isVegetarian || false,
      isVegan: user.isVegan || false,
      ...user.preferences,
    }

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error("Error fetching user preferences:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const userId = decoded.userId

    const preferences = await request.json()

    const { db } = await connectToDatabase()
    await db.collection("users").updateOne(
      { _id: userId },
      {
        $set: {
          preferences,
          dietaryRestrictions: preferences.dietaryRestrictions,
          allergies: preferences.allergies,
          favoriteCuisines: preferences.favoriteCuisines,
          spiceLevel: preferences.spiceLevel,
          isVegetarian: preferences.isVegetarian,
          isVegan: preferences.isVegan,
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user preferences:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
