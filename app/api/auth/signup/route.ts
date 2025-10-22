import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Signup request body:", body)

    const { name, email, password, phone, hasDiabetes, foodAllergies, dietaryPreference, favoriteCuisines } = body

    // Validate required fields
    if (!name || !email || !password || !phone || !hasDiabetes || !dietaryPreference) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Connect to database
    const db = await connectDB()
    const usersCollection = db.collection("users")

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ message: "User already exists with this email" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user document
    const userData = {
      name,
      email,
      password: hashedPassword,
      phone,
      hasDiabetes: hasDiabetes === "yes",
      foodAllergies: foodAllergies || [],
      dietaryPreference,
      favoriteCuisines: favoriteCuisines || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    console.log("Creating user with data:", { ...userData, password: "[HIDDEN]" })

    // Insert user
    const result = await usersCollection.insertOne(userData)
    console.log("User created with ID:", result.insertedId)

    return NextResponse.json(
      {
        message: "User created successfully",
        userId: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
