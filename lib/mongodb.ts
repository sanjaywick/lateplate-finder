import { MongoClient, type Db, ObjectId } from "mongodb"

const MONGODB_URI = "mongodb+srv://sanjaywick:Sanjay1010@cluster0.c12pas1.mongodb.net/"
const MONGODB_DB = "lateplate_finder"

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectDB(): Promise<Db> {
  if (cachedClient && cachedDb) {
    return cachedDb
  }

  try {
    const client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })

    await client.connect()
    console.log("Connected to MongoDB successfully")

    const db = client.db(MONGODB_DB)

    cachedClient = client
    cachedDb = db

    return db
  } catch (error) {
    console.error("MongoDB connection error:", error)
    throw error
  }
}

// Alternative function name for compatibility
export async function connectToDatabase(): Promise<{ db: Db }> {
  const db = await connectDB()
  return { db }
}

// Initialize sample data if needed
export async function initializeData() {
  try {
    const db = await connectDB()

    // Check if data already exists
    const recipeCount = await db.collection("recipes").countDocuments()

    if (recipeCount === 0) {
      console.log("Initializing sample data...")

      // Insert sample recipes matching your MongoDB structure
      const sampleRecipes = [
        {
          RecipeName: "Quick Fried Rice",
          Ingredients: [
            "2 cups cooked rice",
            "2 eggs - beaten",
            "1 onion - diced",
            "2 cloves garlic - minced",
            "1 cup mixed vegetables",
            "2 tablespoons soy sauce",
            "1 tablespoon oil",
            "Salt to taste",
            "Green onions for garnish",
          ],
          PrepTimeInMins: 10,
          CookTimeInMins: 15,
          TotalTimeInMins: 25,
          Servings: 3,
          Cuisine: "Chinese",
          Course: "Lunch",
          Diet: "Vegetarian",
          Instructions: "Heat oil in wok, scramble eggs, add vegetables and rice, season with soy sauce.",
          URL: "http://www.example.com/fried-rice-recipe",
          createdAt: new Date(),
          rating: 4.5,
          reviews: 189,
        },
        {
          RecipeName: "Aloo Paratha",
          Ingredients: [
            "2 cups wheat flour",
            "3 potatoes - boiled and mashed",
            "1 onion - finely chopped",
            "2 green chillies - chopped",
            "1 teaspoon cumin seeds",
            "1 teaspoon coriander powder",
            "1/2 teaspoon turmeric powder",
            "1 teaspoon garam masala",
            "Salt to taste",
            "Oil for cooking",
          ],
          PrepTimeInMins: 20,
          CookTimeInMins: 20,
          TotalTimeInMins: 40,
          Servings: 4,
          Cuisine: "North Indian Recipes",
          Course: "Breakfast",
          Diet: "Vegetarian",
          Instructions: "Make dough with flour, prepare potato filling, stuff and roll parathas, cook on griddle.",
          URL: "http://www.example.com/aloo-paratha-recipe",
          createdAt: new Date(),
          rating: 4.3,
          reviews: 156,
        },
      ]

      await db.collection("recipes").insertMany(sampleRecipes)

      // Insert sample feedback
      const sampleFeedback = [
        {
          userId: "user1",
          type: "recipe",
          itemId: "recipe1",
          rating: 5,
          comment: "Amazing recipe! Quick and delicious.",
          sentiment: "positive",
          timestamp: new Date(),
        },
        {
          userId: "user2",
          type: "recipe",
          itemId: "recipe2",
          rating: 4,
          comment: "Good recipe but could use more seasoning.",
          sentiment: "positive",
          timestamp: new Date(),
        },
      ]

      await db.collection("feedback").insertMany(sampleFeedback)

      console.log("Sample data inserted successfully")
    }

    // Create indexes for better performance
    await db.collection("recipes").createIndex({ Ingredients: "text", RecipeName: "text" })
    await db.collection("feedback").createIndex({ timestamp: 1 })
    await db.collection("user_locations").createIndex({ userId: 1 })

    console.log("Database indexes created successfully")
  } catch (error) {
    console.error("Data initialization error:", error)
  }
}

// Export ObjectId for use in other files
export { ObjectId }
