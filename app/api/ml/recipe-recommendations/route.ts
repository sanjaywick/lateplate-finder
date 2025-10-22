import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import jwt from 'jsonwebtoken'

interface Recipe {
  _id: string
  name: string
  ingredients: string[]
  cuisine: string
  difficulty: string
  cookingTime: number
  rating: number
  tags: string[]
  nutritionalInfo: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
}

interface UserPreference {
  userId: string
  likedRecipes: string[]
  dislikedRecipes: string[]
  preferredCuisines: string[]
  dietaryRestrictions: string[]
  cookingSkillLevel: string
  preferredCookingTime: number
}

// Content-based filtering using TF-IDF similarity
function calculateTFIDF(recipes: Recipe[]) {
  const documents = recipes.map(recipe => 
    [...recipe.ingredients, recipe.cuisine, recipe.difficulty, ...recipe.tags].join(' ').toLowerCase()
  )
  
  // Calculate term frequency
  const termFreq = documents.map(doc => {
    const words = doc.split(' ')
    const freq: { [key: string]: number } = {}
    words.forEach(word => {
      freq[word] = (freq[word] || 0) + 1
    })
    return freq
  })

  // Calculate document frequency
  const allWords = new Set(documents.join(' ').split(' '))
  const docFreq: { [key: string]: number } = {}
  
  allWords.forEach(word => {
    docFreq[word] = documents.filter(doc => doc.includes(word)).length
  })

  // Calculate TF-IDF vectors
  const tfidfVectors = termFreq.map(tf => {
    const vector: { [key: string]: number } = {}
    Object.keys(tf).forEach(word => {
      const tf_score = tf[word] / Object.keys(tf).length
      const idf_score = Math.log(documents.length / (docFreq[word] || 1))
      vector[word] = tf_score * idf_score
    })
    return vector
  })

  return tfidfVectors
}

// Cosine similarity calculation
function cosineSimilarity(vecA: { [key: string]: number }, vecB: { [key: string]: number }) {
  const keysA = Object.keys(vecA)
  const keysB = Object.keys(vecB)
  const commonKeys = keysA.filter(key => keysB.includes(key))
  
  if (commonKeys.length === 0) return 0

  let dotProduct = 0
  let normA = 0
  let normB = 0

  commonKeys.forEach(key => {
    dotProduct += vecA[key] * vecB[key]
  })

  keysA.forEach(key => {
    normA += vecA[key] * vecA[key]
  })

  keysB.forEach(key => {
    normB += vecB[key] * vecB[key]
  })

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

// Collaborative filtering using user-item matrix
function collaborativeFiltering(userPreferences: UserPreference[], targetUserId: string, recipes: Recipe[]) {
  const targetUser = userPreferences.find(u => u.userId === targetUserId)
  if (!targetUser) return []

  // Find similar users based on liked recipes
  const similarUsers = userPreferences
    .filter(u => u.userId !== targetUserId)
    .map(user => {
      const commonLikes = user.likedRecipes.filter(recipe => 
        targetUser.likedRecipes.includes(recipe)
      ).length
      
      const totalLikes = new Set([...user.likedRecipes, ...targetUser.likedRecipes]).size
      const similarity = commonLikes / totalLikes
      
      return { user, similarity }
    })
    .filter(item => item.similarity > 0.1)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5)

  // Get recommendations from similar users
  const recommendations = new Map<string, number>()
  
  similarUsers.forEach(({ user, similarity }) => {
    user.likedRecipes.forEach(recipeId => {
      if (!targetUser.likedRecipes.includes(recipeId) && !targetUser.dislikedRecipes.includes(recipeId)) {
        recommendations.set(recipeId, (recommendations.get(recipeId) || 0) + similarity)
      }
    })
  })

  return Array.from(recommendations.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([recipeId]) => recipeId)
}

// Hybrid recommendation system
function hybridRecommendation(
  recipes: Recipe[], 
  userPreferences: UserPreference[], 
  targetUserId: string,
  userLocation?: { lat: number, lng: number }
) {
  const targetUser = userPreferences.find(u => u.userId === targetUserId)
  if (!targetUser) return []

  // Content-based recommendations
  const tfidfVectors = calculateTFIDF(recipes)
  const likedRecipes = recipes.filter(r => targetUser.likedRecipes.includes(r._id))
  
  let contentBasedScores: { recipeId: string, score: number }[] = []
  
  if (likedRecipes.length > 0) {
    // Create user profile vector from liked recipes
    const userProfile: { [key: string]: number } = {}
    likedRecipes.forEach((recipe, index) => {
      const recipeIndex = recipes.findIndex(r => r._id === recipe._id)
      if (recipeIndex !== -1) {
        const vector = tfidfVectors[recipeIndex]
        Object.keys(vector).forEach(word => {
          userProfile[word] = (userProfile[word] || 0) + vector[word]
        })
      }
    })

    // Calculate similarity with all recipes
    contentBasedScores = recipes
      .filter(r => !targetUser.likedRecipes.includes(r._id) && !targetUser.dislikedRecipes.includes(r._id))
      .map((recipe, index) => {
        const recipeIndex = recipes.findIndex(r => r._id === recipe._id)
        const similarity = cosineSimilarity(userProfile, tfidfVectors[recipeIndex])
        return { recipeId: recipe._id, score: similarity }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 15)
  }

  // Collaborative filtering recommendations
  const collaborativeScores = collaborativeFiltering(userPreferences, targetUserId, recipes)
    .map(recipeId => ({ recipeId, score: 1 }))

  // Combine scores (weighted hybrid)
  const combinedScores = new Map<string, number>()
  
  contentBasedScores.forEach(({ recipeId, score }) => {
    combinedScores.set(recipeId, score * 0.6) // 60% weight for content-based
  })

  collaborativeScores.forEach(({ recipeId, score }) => {
    const existing = combinedScores.get(recipeId) || 0
    combinedScores.set(recipeId, existing + score * 0.4) // 40% weight for collaborative
  })

  // Apply user preference filters
  const filteredRecommendations = Array.from(combinedScores.entries())
    .map(([recipeId, score]) => {
      const recipe = recipes.find(r => r._id === recipeId)
      if (!recipe) return null

      let adjustedScore = score

      // Boost preferred cuisines
      if (targetUser.preferredCuisines.includes(recipe.cuisine)) {
        adjustedScore *= 1.3
      }

      // Penalize recipes that don't match cooking time preference
      if (recipe.cookingTime > targetUser.preferredCookingTime * 1.5) {
        adjustedScore *= 0.7
      }

      // Boost recipes matching skill level
      if (recipe.difficulty === targetUser.cookingSkillLevel) {
        adjustedScore *= 1.2
      }

      // Apply dietary restrictions
      const hasRestrictedIngredients = targetUser.dietaryRestrictions.some(restriction =>
        recipe.ingredients.some(ingredient => 
          ingredient.toLowerCase().includes(restriction.toLowerCase())
        )
      )
      
      if (hasRestrictedIngredients) {
        adjustedScore *= 0.3
      }

      return { recipeId, score: adjustedScore, recipe }
    })
    .filter(item => item !== null)
    .sort((a, b) => b!.score - a!.score)
    .slice(0, 20)

  return filteredRecommendations.map(item => item!.recipe)
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }

    const { db } = await connectToDatabase()
    
    // Get user preferences
    const userPreferences = await db.collection('userPreferences').find({}).toArray()
    const recipes = await db.collection('recipes').find({}).toArray()

    // Get user location if available
    const user = await db.collection('users').findOne({ _id: decoded.userId })
    const userLocation = user?.currentLocation

    // Generate recommendations
    const recommendations = hybridRecommendation(
      recipes,
      userPreferences,
      decoded.userId,
      userLocation
    )

    // Log recommendation for analytics
    await db.collection('recommendationLogs').insertOne({
      userId: decoded.userId,
      timestamp: new Date(),
      recommendedRecipes: recommendations.map(r => r._id),
      algorithm: 'hybrid',
      userLocation
    })

    return NextResponse.json({
      success: true,
      recommendations,
      algorithm: 'hybrid',
      totalRecipes: recipes.length,
      recommendationCount: recommendations.length
    })

  } catch (error) {
    console.error('Recipe recommendation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }

    const { db } = await connectToDatabase()
    
    // Get recommendation analytics
    const recommendationLogs = await db.collection('recommendationLogs')
      .find({ userId: decoded.userId })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray()

    const userPreferences = await db.collection('userPreferences')
      .findOne({ userId: decoded.userId })

    return NextResponse.json({
      success: true,
      recentRecommendations: recommendationLogs,
      userPreferences,
      analytics: {
        totalRecommendations: recommendationLogs.length,
        averageRecommendationsPerSession: recommendationLogs.length > 0 
          ? recommendationLogs.reduce((sum, log) => sum + log.recommendedRecipes.length, 0) / recommendationLogs.length 
          : 0
      }
    })

  } catch (error) {
    console.error('Get recommendations error:', error)
    return NextResponse.json(
      { error: 'Failed to get recommendation data' },
      { status: 500 }
    )
  }
}
