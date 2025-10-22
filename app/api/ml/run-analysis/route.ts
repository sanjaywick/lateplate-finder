import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import jwt from "jsonwebtoken"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret')
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Log the analysis start
    await db.collection("ml_analysis_logs").insertOne({
      status: "started",
      timestamp: new Date(),
      type: "comprehensive"
    })

    try {
      // Try to run the ML script with timeout
      const { stdout, stderr } = await execAsync("node scripts/advanced-ml-analytics.js", {
        cwd: process.cwd(),
        timeout: 120000, // 2 minutes timeout
      })

      if (stderr) {
        console.warn("ML script warnings:", stderr)
      }

      console.log("ML script output:", stdout)

      // Log successful completion
      await db.collection("ml_analysis_logs").insertOne({
        status: "completed",
        timestamp: new Date(),
        type: "comprehensive",
        output: stdout
      })

      return NextResponse.json({
        success: true,
        message: "ML analysis completed successfully",
        output: stdout,
        timestamp: new Date()
      })

    } catch (scriptError) {
      console.error("ML script execution error:", scriptError)
      
      // Log the error
      await db.collection("ml_analysis_logs").insertOne({
        status: "error",
        timestamp: new Date(),
        type: "comprehensive",
        error: scriptError instanceof Error ? scriptError.message : 'Unknown error'
      })

      // Generate fallback results
      const fallbackResults = await generateFallbackResults(db)
      
      return NextResponse.json({
        success: true,
        message: "ML analysis completed with fallback data",
        results: fallbackResults,
        timestamp: new Date(),
        note: "Used fallback analysis due to script execution issues"
      })
    }

  } catch (error) {
    console.error("Error running ML analysis:", error)
    return NextResponse.json(
      { 
        error: "Failed to run ML analysis",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function generateFallbackResults(db: any) {
  try {
    const [recipes, restaurants, feedback] = await Promise.all([
      db.collection("recipes").find({}).limit(100).toArray(),
      db.collection("restaurants").find({}).limit(50).toArray(),
      db.collection("feedback").find({}).limit(100).toArray()
    ])

    const results = {
      recipeAnalysis: {
        totalRecipes: recipes.length,
        avgCookingTime: recipes.reduce((sum: number, r: any) => sum + (r.CookTimeInMins || 30), 0) / recipes.length,
        topCuisines: getTopCuisines(recipes)
      },
      restaurantAnalysis: {
        totalRestaurants: restaurants.length,
        avgRating: restaurants.reduce((sum: number, r: any) => sum + (r.rating || 4), 0) / restaurants.length,
        clusters: Math.ceil(restaurants.length / 10)
      },
      sentimentAnalysis: {
        positive: feedback.filter((f: any) => (f.rating || 0) >= 4).length,
        neutral: feedback.filter((f: any) => (f.rating || 0) === 3).length,
        negative: feedback.filter((f: any) => (f.rating || 0) <= 2).length,
        total: feedback.length
      },
      timestamp: new Date()
    }

    // Store fallback results
    await db.collection("ml_analytics_results").insertOne({
      type: "comprehensive",
      results,
      timestamp: new Date(),
      fallback: true
    })

    return results
  } catch (error) {
    console.error("Error generating fallback results:", error)
    return {
      error: "Failed to generate fallback results",
      timestamp: new Date()
    }
  }
}

function getTopCuisines(recipes: any[]) {
  const cuisineCount: { [key: string]: number } = {}
  
  recipes.forEach(recipe => {
    const cuisine = recipe.Cuisine || 'Unknown'
    cuisineCount[cuisine] = (cuisineCount[cuisine] || 0) + 1
  })

  return Object.entries(cuisineCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([cuisine, count]) => ({ cuisine, count }))
}
