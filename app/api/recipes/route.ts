import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    // Get search parameters
    const { searchParams } = new URL(request.url)
    const ingredientsParam = searchParams.get("ingredients")
    const cookTime = searchParams.get("cookTime")
    const difficulty = searchParams.get("difficulty")
    const dietary = searchParams.get("dietary")

    console.log("Recipe search params:", { ingredientsParam, cookTime, difficulty, dietary })

    // Connect to database
    const db = await connectDB()
    const recipesCollection = db.collection("recipes")

    // Build query
    const query: any = {}
    let searchTerms: string[] = []

    // Handle ingredients search with partial matching
    if (ingredientsParam) {
      const ingredients = ingredientsParam.split(",").map((ing) => ing.trim().toLowerCase())
      searchTerms = ingredients

      // Create regex patterns for partial matching within ingredients
      const ingredientRegexes = ingredients.map((ingredient) => ({
        Ingredients: { $regex: ingredient, $options: "i" },
      }))

      query.$or = ingredientRegexes
    }

    // Add time filter
    if (cookTime) {
      query.CookTimeInMins = { $lte: Number.parseInt(cookTime) }
    }

    // Add dietary filter
    if (dietary) {
      query.Diet = { $regex: dietary, $options: "i" }
    }

    console.log("MongoDB query:", JSON.stringify(query, null, 2))

    // Execute search
    const recipes = await recipesCollection.find(query).limit(50).toArray()

    console.log(`Found ${recipes.length} recipes`)

    // Process results for ingredient matching
    const processedRecipes = recipes.map((recipe) => {
      let matchedIngredients = 0
      const highlightedIngredients: string[] = []
      const matchedIngredientSet = new Set<string>() // Track unique matched ingredients

      if (searchTerms.length > 0 && recipe.Ingredients) {
        // Convert ingredients to array if it's a string
        const ingredientsList = Array.isArray(recipe.Ingredients) ? recipe.Ingredients : [recipe.Ingredients]

        // Check each user ingredient against recipe ingredients
        searchTerms.forEach((searchTerm) => {
          let foundMatch = false // Track if this search term found any match
          ingredientsList.forEach((ingredient: string) => {
            if (ingredient && ingredient.toLowerCase().includes(searchTerm.toLowerCase())) {
              if (!foundMatch) {
                matchedIngredients++
                foundMatch = true // Only count one match per search term
              }
              // Highlight the matching term in the ingredient
              const highlighted = ingredient.replace(
                new RegExp(`(${searchTerm})`, "gi"),
                "<mark style='background-color: yellow; padding: 1px 2px;'>$1</mark>",
              )
              if (!highlightedIngredients.includes(highlighted)) {
                highlightedIngredients.push(highlighted)
              }
            }
          })
        })

        const matchPercentage = Math.min(100, Math.round((matchedIngredients / searchTerms.length) * 100))

        return {
          ...recipe,
          matchedIngredients,
          userIngredientsCount: searchTerms.length,
          matchPercentage,
          highlightedIngredients,
        }
      }

      return {
        ...recipe,
        matchedIngredients: 0,
        userIngredientsCount: searchTerms.length,
        matchPercentage: 0,
        highlightedIngredients: [],
      }
    })

    // Sort by match percentage if ingredients were provided
    if (searchTerms.length > 0) {
      processedRecipes.sort((a, b) => b.matchPercentage - a.matchPercentage)
    }

    return NextResponse.json({
      recipes: processedRecipes,
      searchTerms,
      total: processedRecipes.length,
    })
  } catch (error) {
    console.error("Error fetching recipes:", error)
    return NextResponse.json({ error: "Failed to fetch recipes", recipes: [] }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const recipe = await request.json()
    const db = await connectDB()

    const newRecipe = {
      ...recipe,
      createdAt: new Date(),
      rating: 0,
      reviews: 0,
    }

    const result = await db.collection("recipes").insertOne(newRecipe)

    return NextResponse.json(
      {
        message: "Recipe created successfully",
        recipeId: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Recipe creation error:", error)
    return NextResponse.json({ message: "Failed to create recipe" }, { status: 500 })
  }
}
