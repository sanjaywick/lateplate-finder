"use client"

import type React from "react"
import type { Location } from "@/components/location-selector"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ChefHat, Clock, Users, Star, Plus, X, Search, ExternalLink, RefreshCw, Sparkles, Heart } from "lucide-react"
import Link from "next/link"
import { LocationSelector } from "@/components/location-selector"

// Enhanced Recipe Image Component
function RecipeImage({ recipe, className }: { recipe: any; className: string }) {
  const [imageUrl, setImageUrl] = useState("/placeholder.svg?height=300&width=400&text=Loading...")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const fetchImage = async () => {
    if (!recipe.URL) {
      setImageUrl("/placeholder.svg?height=300&width=400&text=🍽️+Recipe+Image")
      setLoading(false)
      return
    }

    setLoading(true)
    setError(false)

    try {
      const response = await fetch(`/api/recipes/image?url=${encodeURIComponent(recipe.URL)}`)
      const data = await response.json()

      if (response.ok && data.imageUrl) {
        setImageUrl(data.imageUrl)
      } else {
        setImageUrl("/placeholder.svg?height=300&width=400&text=🍳+Delicious+Recipe")
        setError(true)
      }
    } catch (error) {
      setImageUrl("/placeholder.svg?height=300&width=400&text=🥘+Tasty+Food")
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchImage()
  }, [recipe.URL, retryCount])

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={imageUrl || "/placeholder.svg"}
        alt={recipe.RecipeName}
        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
        onError={() => !error && setError(true)}
      />

      {loading && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-200 to-pink-200 animate-pulse flex items-center justify-center">
          <div className="text-center">
            <ChefHat className="w-8 h-8 text-purple-400 animate-bounce mb-2" />
            <span className="text-purple-600 text-sm font-medium">Loading recipe...</span>
          </div>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Floating elements */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
        <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
          <Heart className="w-4 h-4 text-red-500" />
        </div>
      </div>

      {error && !loading && (
        <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button size="sm" variant="outline" onClick={handleRetry} className="bg-white/90 backdrop-blur-sm text-xs">
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        </div>
      )}
    </div>
  )
}

export default function RecipesPage() {
  const [ingredients, setIngredients] = useState<string[]>([])
  const [currentIngredient, setCurrentIngredient] = useState("")
  const [recipes, setRecipes] = useState<any[]>([])
  const [filters, setFilters] = useState({
    cookTime: "",
    difficulty: "",
    dietary: "",
  })
  const [loading, setLoading] = useState(false)
  const [searchTerms, setSearchTerms] = useState<string[]>([])
  const [weatherTag, setWeatherTag] = useState<string>("")
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [suggestedIngredients, setSuggestedIngredients] = useState<any[]>([])
  const [loadingAssociations, setLoadingAssociations] = useState(false)

  useEffect(() => {
    const savedLocation = localStorage.getItem("currentLocation")
    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation)
        setSelectedLocation(parsed)
      } catch (error) {
        console.error("Error parsing saved location:", error)
      }
    }
  }, [])

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location)
    localStorage.setItem("currentLocation", JSON.stringify(location))
  }

  const logUserActivity = async (payload: any) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return
      await fetch("/api/user/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
    } catch (e) {
      console.log("[v0] recipe activity log skipped:", e)
    }
  }

  const addIngredient = () => {
    if (currentIngredient.trim() && !ingredients.includes(currentIngredient.trim().toLowerCase())) {
      setIngredients([...ingredients, currentIngredient.trim().toLowerCase()])
      setCurrentIngredient("")
    }
  }

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter((i) => i !== ingredient))
  }

  const searchRecipes = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (ingredients.length > 0) {
        params.append("ingredients", ingredients.join(","))
      }
      if (filters.cookTime) params.append("cookTime", filters.cookTime)
      if (filters.difficulty) params.append("difficulty", filters.difficulty)
      if (filters.dietary) params.append("dietary", filters.dietary)

      try {
        let lat: number | null = null
        let lng: number | null = null
        if (selectedLocation) {
          lat = selectedLocation.latitude
          lng = selectedLocation.longitude
        } else {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 }),
          )
          lat = pos.coords.latitude
          lng = pos.coords.longitude
        }
        if (lat != null && lng != null) {
          const wxRes = await fetch(`/api/weather?lat=${lat}&lon=${lng}`)
          if (wxRes.ok) {
            const { weather } = await wxRes.json()
            const tag =
              weather.temperature > 25
                ? "hot"
                : weather.temperature < 15
                  ? "cold"
                  : weather.condition?.includes("rain")
                    ? "rainy"
                    : "mild"
            setWeatherTag(tag)
            params.append("weatherTag", tag)
          }
        }
      } catch {}

      const response = await fetch(`/api/recipes?${params.toString()}`, {
        headers: {
          Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
      })
      const data = await response.json()

      if (response.ok) {
        setRecipes(data.recipes || [])
        setSearchTerms(data.searchTerms || [])

        await logUserActivity({
          type: "recipe",
          action: "searched",
          details: `Searched recipes with ${ingredients.join(", ") || "no specific ingredients"}`,
          metadata: {
            ingredients,
            filters,
            weatherTag,
            resultCount: (data.recipes || []).length,
          },
          timestamp: new Date().toISOString(),
        })
      } else {
        setRecipes([])
      }
    } catch (error) {
      setRecipes([])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addIngredient()
    }
  }

  const renderHighlightedIngredients = (highlightedIngredients: string[]) => {
    return highlightedIngredients
      .slice(0, 4)
      .map((ingredient, index) => (
        <div key={index} className="text-xs text-gray-600 mb-1" dangerouslySetInnerHTML={{ __html: ingredient }} />
      ))
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-700 border-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "hard":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-blue-100 text-blue-700 border-blue-200"
    }
  }

  const fetchIngredientAssociations = async () => {
    setLoadingAssociations(true)
    try {
      const params = new URLSearchParams()
      if (ingredients.length > 0) {
        params.append("ingredients", ingredients.join(","))
      }

      const response = await fetch(`/api/recipes/associations?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setSuggestedIngredients(data.associations || [])
      }
    } catch (error) {
      console.error("Error fetching associations:", error)
      // Fallback to default suggestions
      setSuggestedIngredients([
        { ingredient: "onion", confidence: 85, isPopular: true },
        { ingredient: "tomato", confidence: 80, isPopular: true },
        { ingredient: "garlic", confidence: 75, isPopular: true },
        { ingredient: "ginger", confidence: 70, isPopular: true },
      ])
    } finally {
      setLoadingAssociations(false)
    }
  }

  useEffect(() => {
    fetchIngredientAssociations()
  }, [ingredients])

  const addSuggestedIngredient = (ingredient: string) => {
    if (!ingredients.includes(ingredient.toLowerCase())) {
      setIngredients([...ingredients, ingredient.toLowerCase()])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Enhanced Navigation */}
      <nav className="bg-white/90 backdrop-blur-md shadow-lg border-b border-purple-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link
            href="/dashboard"
            className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
          >
            LatePlate Finder
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <LocationSelector onLocationSelect={handleLocationSelect} selectedLocation={selectedLocation} />
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50 bg-transparent">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 floating-animation">
            Recipe Recommendations
          </h1>
          <p className="text-gray-600 text-lg">Find delicious recipes based on ingredients you have</p>
          <div className="flex justify-center mt-4">
            <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
          </div>
        </div>

        {/* Enhanced Ingredient Input */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm shadow-xl border-0 card-hover">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-xl">
              <ChefHat className="w-6 h-6" />
              Your Ingredients
            </CardTitle>
            <CardDescription className="text-purple-100">
              Add ingredients you have available to get personalized recipe suggestions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex gap-3">
              <Input
                placeholder="Enter an ingredient (e.g., chana, potatoes, onion)"
                value={currentIngredient}
                onChange={(e) => setCurrentIngredient(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
              />
              <Button
                onClick={addIngredient}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>

            {ingredients.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ingredient, index) => (
                  <Badge
                    key={index}
                    className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200 px-3 py-1 flex items-center gap-2 hover:from-purple-200 hover:to-pink-200 transition-all duration-200"
                  >
                    {ingredient}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-red-500 transition-colors"
                      onClick={() => removeIngredient(ingredient)}
                    />
                  </Badge>
                ))}
              </div>
            )}

            {/* Enhanced Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-purple-100">
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Max Cook Time</label>
                <select
                  className="w-full p-3 border border-purple-200 rounded-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-200 bg-white"
                  value={filters.cookTime}
                  onChange={(e) => setFilters({ ...filters, cookTime: e.target.value })}
                >
                  <option value="">⏰ Any time</option>
                  <option value="15">⚡ Under 15 min</option>
                  <option value="30">🕐 Under 30 min</option>
                  <option value="60">🕑 Under 1 hour</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Difficulty</label>
                <select
                  className="w-full p-3 border border-purple-200 rounded-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-200 bg-white"
                  value={filters.difficulty}
                  onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                >
                  <option value="">🎯 Any difficulty</option>
                  <option value="easy">🟢 Easy</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="hard">🔴 Hard</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Dietary</label>
                <select
                  className="w-full p-3 border border-purple-200 rounded-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-200 bg-white"
                  value={filters.dietary}
                  onChange={(e) => setFilters({ ...filters, dietary: e.target.value })}
                >
                  <option value="">🍽️ No restrictions</option>
                  <option value="vegetarian">🥬 Vegetarian</option>
                  <option value="vegan">🌱 Vegan</option>
                  <option value="gluten-free">🌾 Gluten Free</option>
                  <option value="low-carb">🥩 Low Carb</option>
                </select>
              </div>
            </div>

            <Button
              onClick={searchRecipes}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 text-lg font-semibold shadow-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Finding Recipes...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Find Recipes
                </>
              )}
            </Button>
          </CardContent>
        </Card>


        {/* Search Results Info */}
        {searchTerms.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg shadow-sm">
            <p className="text-blue-800 font-medium">
              🔍 <strong>Searching for:</strong> {searchTerms.join(", ")} • <strong>Found:</strong> {recipes.length}{" "}
              recipe{recipes.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}

        {/* Enhanced Recipe Results */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recipes.map((recipe, index) => (
            <Card
              key={recipe._id}
              className="group bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 border-0 overflow-hidden card-hover"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Recipe Image */}
              <div className="relative h-48">
                <RecipeImage recipe={recipe} className="h-full" />

                {/* Floating rating */}
                <div className="absolute top-3 left-3">
                  <div className="bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-semibold text-gray-800">{recipe.rating || 4.0}</span>
                    </div>
                  </div>
                </div>

                {/* Difficulty badge */}
                <div className="absolute top-3 right-3">
                  <Badge className={`${getDifficultyColor(recipe.difficulty || "Easy")} backdrop-blur-sm`}>
                    {recipe.difficulty || "Easy"}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Recipe Header */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
                      {recipe.RecipeName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {recipe.Cuisine} - {recipe.Course}
                    </p>
                  </div>

                  {/* Time and Servings */}
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-1 text-orange-600">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{recipe.CookTimeInMins} min</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-600">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">{recipe.Servings} servings</span>
                    </div>
                  </div>

                  {/* Total Time Display */}
                  {recipe.TotalTimeInMins && (
                    <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                      <span className="font-medium">⏱️ Total Time:</span> {recipe.TotalTimeInMins} min
                      {recipe.PrepTimeInMins && <span className="ml-2">(Prep: {recipe.PrepTimeInMins} min)</span>}
                    </div>
                  )}

                  {/* Ingredient Match Info */}
                  {ingredients.length > 0 && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium text-green-800">
                          🎯 Match: {recipe.matchedIngredients}/{recipe.userIngredientsCount}
                        </p>
                        <Badge className="bg-green-500 text-white text-xs">{recipe.matchPercentage}% match</Badge>
                      </div>
                      <div className="w-full bg-green-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${recipe.matchPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Highlighted Ingredients Preview */}
                  {recipe.highlightedIngredients && recipe.highlightedIngredients.length > 0 && (
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-sm font-medium mb-2 text-purple-800">🥘 Key Ingredients:</p>
                      <div className="max-h-16 overflow-y-auto">
                        {renderHighlightedIngredients(recipe.highlightedIngredients)}
                      </div>
                    </div>
                  )}

                  {/* Dietary Tags */}
                  <div className="flex flex-wrap gap-1">
                    {recipe.Diet && (
                      <Badge className="bg-blue-100 text-blue-700 text-xs border-blue-200">{recipe.Diet}</Badge>
                    )}
                    {recipe.Cuisine && (
                      <Badge variant="outline" className="text-xs border-purple-200 text-purple-700">
                        {recipe.Cuisine}
                      </Badge>
                    )}
                    {recipe.Course && (
                      <Badge variant="outline" className="text-xs border-pink-200 text-pink-700">
                        {recipe.Course}
                      </Badge>
                    )}
                    {weatherTag && (
                      <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                        {weatherTag}
                      </Badge>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm"
                      onClick={() => window.open(recipe.URL, "_blank")}
                      disabled={!recipe.URL}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View Recipe
                    </Button>
                    <Button
                      variant="outline"
                      className="border-purple-200 text-purple-700 hover:bg-purple-50 bg-transparent"
                    >
                      <Heart className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {ingredients.length > 0 && suggestedIngredients.length > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <p className="text-sm font-medium mb-3 text-blue-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              Frequently searched together with your ingredients:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedIngredients
                .filter((suggestion) => !ingredients.includes(suggestion.ingredient))
                .slice(0, 4)
                .map((suggestion, index) => (
                  <Button
                    key={suggestion.ingredient}
                    variant="outline"
                    size="sm"
                    onClick={() => addSuggestedIngredient(suggestion.ingredient)}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 transition-all duration-200 hover:scale-105 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {suggestion.ingredient}
                    <Badge className="ml-2 bg-blue-100 text-blue-600 text-xs px-1 py-0">
                      {suggestion.confidence}% match
                    </Badge>
                  </Button>
                ))}
            </div>
          </div>
        )}

        {/* Enhanced Empty States */}
        {recipes.length === 0 && !loading && ingredients.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
            <CardContent className="text-center py-16">
              <div className="animate-bounce mb-6">
                <ChefHat className="w-16 h-16 text-purple-400 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No recipes found</h3>
              <p className="text-gray-600 mb-6">Try different ingredients or adjust your filters.</p>

              {suggestedIngredients.length > 0 && (
                <div className="mb-6">
                  <p className="text-purple-600 font-medium mb-3">Try adding these popular ingredients:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {suggestedIngredients
                      .filter((suggestion) => !ingredients.includes(suggestion.ingredient))
                      .slice(0, 4)
                      .map((suggestion) => (
                        <Button
                          key={suggestion.ingredient}
                          variant="outline"
                          size="sm"
                          onClick={() => addSuggestedIngredient(suggestion.ingredient)}
                          className="border-purple-200 text-purple-700 hover:bg-purple-50 transition-all duration-200 hover:scale-105"
                        >
                          + {suggestion.ingredient}
                          <Badge className="ml-2 bg-purple-100 text-purple-600 text-xs px-1 py-0">
                            {suggestion.confidence}%
                          </Badge>
                        </Button>
                      ))}
                  </div>
                </div>
              )}

              <Button
                onClick={() => {
                  setIngredients([])
                  setRecipes([])
                  setSearchTerms([])
                  setWeatherTag("")
                }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                Clear Search
              </Button>
            </CardContent>
          </Card>
        )}

        {ingredients.length === 0 && (
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
            <CardContent className="text-center py-16">
              <div className="animate-pulse mb-6">
                <ChefHat className="w-16 h-16 text-purple-400 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Add some ingredients to get started</h3>
              <p className="text-gray-600 mb-6">
                Tell us what you have in your kitchen and we'll suggest great recipes
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {loadingAssociations ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                    <span>Loading popular ingredients...</span>
                  </div>
                ) : (
                  suggestedIngredients.slice(0, 6).map((suggestion) => (
                    <Button
                      key={suggestion.ingredient}
                      variant="outline"
                      size="sm"
                      onClick={() => addSuggestedIngredient(suggestion.ingredient)}
                      className="border-purple-200 text-purple-700 hover:bg-purple-50 transition-all duration-200 hover:scale-105"
                    >
                      + {suggestion.ingredient}
                      {suggestion.confidence && (
                        <Badge className="ml-2 bg-purple-100 text-purple-600 text-xs px-1 py-0">
                          {suggestion.confidence}%
                        </Badge>
                      )}
                    </Button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
