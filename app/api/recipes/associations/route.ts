import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"

function normalizeIngredient(ingredient: string): string {
  // Remove common quantity words and measurements
  const quantityWords =
    /\b(\d+\/?\d*|\d*\.?\d+)\s*(cups?|tbsp|tsp|teaspoons?|tablespoons?|oz|ounces?|lbs?|pounds?|kg|grams?|ml|liters?|cloves?|pieces?|slices?)\b/gi
  const preparationWords =
    /\b(finely|coarsely|roughly|thinly|thickly|diced|chopped|sliced|minced|crushed|ground|fresh|dried|frozen|canned|organic)\b/gi
  const articles = /\b(a|an|the|of|to|for)\b/gi
  const parenthetical = /$$[^)]*$$/g
  const measurements = /\b\d+[\s-]*[/\d]*\s*/g

  const normalized = ingredient
    .toLowerCase()
    .trim()
    // Remove parenthetical content like "(haldi)"
    .replace(parenthetical, "")
    // Remove measurements and quantities
    .replace(quantityWords, "")
    .replace(measurements, "")
    // Remove preparation methods
    .replace(preparationWords, "")
    // Remove articles
    .replace(articles, "")
    // Remove extra spaces and dashes
    .replace(/[\s-]+/g, " ")
    .trim()

  // Extract the main ingredient (usually the first meaningful word)
  const words = normalized.split(" ").filter((word) => word.length > 2)

  // Common ingredient mappings
  const ingredientMap: { [key: string]: string } = {
    "red chilli powder": "chili powder",
    "turmeric powder": "turmeric",
    "cumin seeds": "cumin",
    "coriander seeds": "coriander",
    "mustard seeds": "mustard seeds",
    "curry leaves": "curry leaves",
    "green chilies": "green chili",
    "red chilies": "red chili",
    "garam masala": "garam masala",
    "jeera": "cumin",
    "haldi": "turmeric",
  }

  // Check if the normalized ingredient matches any mapping
  for (const [key, value] of Object.entries(ingredientMap)) {
    if (normalized.includes(key)) {
      return value
    }
  }

  // Return the first meaningful word as the base ingredient
  return words[0] || normalized
}

// Simple Apriori algorithm implementation for ingredient associations
class AprioriMiner {
  private minSupport: number
  private minConfidence: number

  constructor(minSupport = 0.1, minConfidence = 0.5) {
    this.minSupport = minSupport
    this.minConfidence = minConfidence
  }

  // Generate frequent itemsets using Apriori algorithm
  generateFrequentItemsets(transactions: string[][], minSupport: number) {
    const itemCounts = new Map<string, number>()
    const totalTransactions = transactions.length

    // Count individual items
    transactions.forEach((transaction) => {
      const uniqueItems = [...new Set(transaction)]
      uniqueItems.forEach((item) => {
        itemCounts.set(item, (itemCounts.get(item) || 0) + 1)
      })
    })

    // Filter items by minimum support
    const frequentItems = Array.from(itemCounts.entries())
      .filter(([_, count]) => count / totalTransactions >= minSupport)
      .map(([item, count]) => ({ items: [item], support: count / totalTransactions }))

    // Generate 2-itemsets
    const frequentPairs: Array<{ items: string[]; support: number }> = []

    for (let i = 0; i < frequentItems.length; i++) {
      for (let j = i + 1; j < frequentItems.length; j++) {
        const item1 = frequentItems[i].items[0]
        const item2 = frequentItems[j].items[0]

        // Count co-occurrences
        let coCount = 0
        transactions.forEach((transaction) => {
          if (transaction.includes(item1) && transaction.includes(item2)) {
            coCount++
          }
        })

        const support = coCount / totalTransactions
        if (support >= minSupport) {
          frequentPairs.push({
            items: [item1, item2],
            support,
          })
        }
      }
    }

    return { frequentItems, frequentPairs }
  }

  // Generate association rules from frequent itemsets
  generateAssociationRules(frequentPairs: Array<{ items: string[]; support: number }>, transactions: string[][]) {
    const rules: Array<{
      antecedent: string
      consequent: string
      support: number
      confidence: number
      lift: number
    }> = []

    const totalTransactions = transactions.length

    frequentPairs.forEach(({ items, support }) => {
      const [item1, item2] = items

      // Calculate support for individual items
      const item1Count = transactions.filter((t) => t.includes(item1)).length
      const item2Count = transactions.filter((t) => t.includes(item2)).length

      const item1Support = item1Count / totalTransactions
      const item2Support = item2Count / totalTransactions

      // Rule: item1 -> item2
      const confidence1 = support / item1Support
      const lift1 = confidence1 / item2Support

      if (confidence1 >= this.minConfidence) {
        rules.push({
          antecedent: item1,
          consequent: item2,
          support,
          confidence: confidence1,
          lift: lift1,
        })
      }

      // Rule: item2 -> item1
      const confidence2 = support / item2Support
      const lift2 = confidence2 / item1Support

      if (confidence2 >= this.minConfidence) {
        rules.push({
          antecedent: item2,
          consequent: item1,
          support,
          confidence: confidence2,
          lift: lift2,
        })
      }
    })

    return rules.sort((a, b) => b.confidence - a.confidence)
  }

  // Main method to find associations
  findAssociations(transactions: string[][]) {
    const { frequentPairs } = this.generateFrequentItemsets(transactions, this.minSupport)
    const rules = this.generateAssociationRules(frequentPairs, transactions)
    return rules
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const currentIngredients =
      searchParams
        .get("ingredients")
        ?.split(",")
        .map((i) => normalizeIngredient(i.trim())) || [] // Apply normalization to current ingredients

    // Connect to database
    const db = await connectDB()

    // Get user search history for association mining
    const userActivitiesCollection = db.collection("userActivities")
    const recentSearches = await userActivitiesCollection
      .find({
        type: "recipe",
        action: "searched",
        "metadata.ingredients": { $exists: true, $ne: [] },
      })
      .sort({ timestamp: -1 })
      .limit(1000)
      .toArray()

    const transactions: string[][] = recentSearches
      .map((search) => search.metadata?.ingredients || [])
      .filter((ingredients) => ingredients.length > 0)
      .map((ingredients) =>
        ingredients.map((ing: string) => normalizeIngredient(ing)).filter((ing: string) => ing.length > 2),
      )

    // If no search history, use recipe data for associations
    if (transactions.length < 10) {
      const recipesCollection = db.collection("recipes")
      const recipes = await recipesCollection.find({}).limit(500).toArray()

      recipes.forEach((recipe) => {
        if (recipe.Ingredients) {
          const ingredientsList = Array.isArray(recipe.Ingredients) ? recipe.Ingredients : [recipe.Ingredients]
          const cleanIngredients = ingredientsList
            .flatMap((ing: string) => ing.split(/[,;]/))
            .map((ing: string) => normalizeIngredient(ing))
            .filter((ing: string) => ing.length > 2)
            .slice(0, 10) // Limit to prevent overly long transactions

          if (cleanIngredients.length > 1) {
            transactions.push(cleanIngredients)
          }
        }
      })
    }

    const miner = new AprioriMiner(0.05, 0.3) // Lower thresholds for more associations
    const associations = miner.findAssociations(transactions)

    // Get relevant associations for current ingredients
    let relevantAssociations = []

    if (currentIngredients.length > 0) {
      // Find ingredients commonly used with current ingredients
      relevantAssociations = associations
        .filter((rule) => currentIngredients.includes(rule.antecedent))
        .map((rule) => ({
          ingredient: rule.consequent,
          confidence: Math.min(100, Math.round(rule.confidence * 100)),
          support: Math.min(100, Math.round(rule.support * 100)),
          lift: Math.round(rule.lift * 100) / 100,
        }))
        .slice(0, 6)
    } else {
      // Show most popular ingredient combinations
      const popularPairs = associations.slice(0, 10).map((rule) => ({
        pair: `${rule.antecedent} + ${rule.consequent}`,
        confidence: Math.min(100, Math.round(rule.confidence * 100)),
        support: Math.min(100, Math.round(rule.support * 100)),
      }))

      // Extract individual popular ingredients
      const ingredientFrequency = new Map<string, number>()
      transactions.forEach((transaction) => {
        transaction.forEach((ingredient) => {
          ingredientFrequency.set(ingredient, (ingredientFrequency.get(ingredient) || 0) + 1)
        })
      })

      relevantAssociations = Array.from(ingredientFrequency.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([ingredient, count]) => ({
          ingredient,
          confidence: Math.min(100, Math.round((count / transactions.length) * 100)),
          support: Math.min(100, Math.round((count / transactions.length) * 100)),
          isPopular: true,
        }))
    }

    return NextResponse.json({
      associations: relevantAssociations,
      totalTransactions: transactions.length,
      hasCurrentIngredients: currentIngredients.length > 0,
    })
  } catch (error) {
    console.error("Error generating associations:", error)
    return NextResponse.json({
      associations: [
        { ingredient: "onion", confidence: 85, support: 70, isPopular: true },
        { ingredient: "tomato", confidence: 80, support: 65, isPopular: true },
        { ingredient: "garlic", confidence: 75, support: 60, isPopular: true },
        { ingredient: "ginger", confidence: 70, support: 55, isPopular: true },
      ],
      totalTransactions: 0,
      hasCurrentIngredients: false,
    })
  }
}
