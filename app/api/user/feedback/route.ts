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
    const feedback = await db.collection("feedback").find({ userId }).sort({ timestamp: -1 }).toArray()

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error("Error fetching user feedback:", error)
    return NextResponse.json({ message: "Failed to fetch feedback" }, { status: 500 })
  }
}
