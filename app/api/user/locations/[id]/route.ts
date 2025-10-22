import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const result = await db.collection("user_locations").deleteOne({
      _id: new ObjectId(params.id),
      userId: new ObjectId(userId),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Location not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Location deleted successfully" })
  } catch (error) {
    console.error("Location deletion error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
