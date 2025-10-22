export interface WeatherData {
  temperature: number
  condition: string
  description: string
  humidity: number
  windSpeed: number
  location: string
  icon: string
}

export interface WeatherRecommendations {
  recipes: string[]
  cuisines: string[]
  restaurantTypes: string[]
  message: string
}

export class WeatherService {
  private static getApiKey(): string {
    // Only available on server; read at call time to pick up Project Settings
    const env = typeof process !== "undefined" ? (process.env ?? {}) : ({} as any)
    return (
      env.OPENWEATHER_API_KEY ||
      env.WEATHER_API_KEY ||
      env.NEXT_PUBLIC_OPENWEATHER_API_KEY ||
      // common alternates
      (env as any).OPEN_WEATHER_API_KEY ||
      (env as any).OPENWEATHERMAP_API_KEY ||
      ""
    )
  }

  private static readonly BASE_URL = "https://api.openweathermap.org/data/2.5/weather"

  static async getWeatherData(lat: number, lon: number): Promise<WeatherData> {
    const API_KEY = this.getApiKey()
    if (!API_KEY) {
      throw new Error(
        "Weather API key missing. Set one of: OPENWEATHER_API_KEY, WEATHER_API_KEY, or NEXT_PUBLIC_OPENWEATHER_API_KEY in Project Settings.",
      )
    }

    try {
      const response = await fetch(`${this.BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`)
      }

      const data = await response.json()

      return {
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main.toLowerCase(),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind?.speed || 0,
        location: data.name,
        icon: data.weather[0].icon,
      }
    } catch (error) {
      console.error("Failed to fetch weather data:", error)
      throw new Error("Unable to fetch weather information")
    }
  }

  static generateRecommendations(
    weather: WeatherData,
    userPreferences: {
      dietaryPreference?: string
      favoritesCuisines?: string[]
      allergies?: string[]
      hasDiabetes?: boolean
    },
  ): WeatherRecommendations {
    const { temperature, condition } = weather
    const { dietaryPreference, favoritesCuisines = [], allergies = [], hasDiabetes } = userPreferences

    let recipes: string[] = []
    let cuisines: string[] = []
    let restaurantTypes: string[] = []
    let message = ""

    // Temperature-based recommendations
    if (temperature > 25) {
      // Hot weather recommendations
      recipes = ["Cold Salads", "Smoothie Bowls", "Gazpacho", "Ice Cream", "Fresh Fruit Bowls"]
      cuisines = ["Mediterranean", "Greek", "Vietnamese", "Thai"]
      restaurantTypes = ["Juice Bars", "Ice Cream Parlors", "Salad Bars", "Mediterranean Restaurants"]
      message = `It's ${temperature}°C and ${weather.description}! Perfect weather for light, refreshing meals.`
    } else if (temperature > 15) {
      // Moderate weather recommendations
      recipes = ["Grilled Dishes", "Pasta Salads", "Sandwiches", "Light Soups", "Stir Fries"]
      cuisines = ["Italian", "American", "Chinese", "Japanese"]
      restaurantTypes = ["Casual Dining", "Cafes", "Bistros", "Asian Restaurants"]
      message = `Nice ${temperature}°C weather! Great for balanced, comforting meals.`
    } else {
      // Cold weather recommendations
      recipes = ["Hot Soups", "Stews", "Casseroles", "Hot Chocolate", "Warm Desserts"]
      cuisines = ["Indian", "Mexican", "Korean", "French"]
      restaurantTypes = ["Comfort Food", "Indian Restaurants", "Mexican Restaurants", "Cozy Cafes"]
      message = `It's chilly at ${temperature}°C! Time for warm, hearty comfort food.`
    }

    // Weather condition adjustments
    if (condition.includes("rain")) {
      recipes.unshift("Hot Tea", "Soup", "Comfort Food")
      message += " The rain calls for something warm and cozy!"
    } else if (condition.includes("snow")) {
      recipes.unshift("Hot Chocolate", "Hearty Stews", "Warm Bread")
      message += " Snowy weather is perfect for indulgent comfort food!"
    } else if (condition.includes("clear") && temperature > 20) {
      recipes.unshift("BBQ", "Grilled Items", "Cold Beverages")
      message += " Clear skies are perfect for outdoor dining!"
    }

    // Filter based on dietary preferences
    if (dietaryPreference === "Vegetarian" || dietaryPreference === "Vegan") {
      recipes = recipes.filter(
        (recipe) =>
          !recipe.toLowerCase().includes("meat") &&
          !recipe.toLowerCase().includes("chicken") &&
          !recipe.toLowerCase().includes("beef"),
      )
      if (dietaryPreference === "Vegan") {
        recipes = recipes.filter(
          (recipe) =>
            !recipe.toLowerCase().includes("dairy") &&
            !recipe.toLowerCase().includes("cheese") &&
            !recipe.toLowerCase().includes("ice cream"),
        )
      }
    }

    // Filter based on diabetes
    if (hasDiabetes) {
      recipes = recipes.filter(
        (recipe) =>
          !recipe.toLowerCase().includes("ice cream") &&
          !recipe.toLowerCase().includes("dessert") &&
          !recipe.toLowerCase().includes("chocolate"),
      )
      recipes.push("Sugar-Free Options", "Low-Carb Meals")
    }

    // Prioritize user's favorite cuisines
    const prioritizedCuisines = [
      ...favoritesCuisines.filter((cuisine) => cuisines.includes(cuisine)),
      ...cuisines.filter((cuisine) => !favoritesCuisines.includes(cuisine)),
    ]

    return {
      recipes: [...new Set(recipes)].slice(0, 6),
      cuisines: [...new Set(prioritizedCuisines)].slice(0, 5),
      restaurantTypes: [...new Set(restaurantTypes)].slice(0, 5),
      message,
    }
  }
}

export const fetchWeatherData = WeatherService.getWeatherData

export const generateWeatherRecommendations = WeatherService.generateRecommendations
