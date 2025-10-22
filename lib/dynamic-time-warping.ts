// Dynamic Time Warping implementation for seasonal food recommendations
export interface WeatherPattern {
  temperature: number
  condition: string
  humidity: number
  season: "spring" | "summer" | "autumn" | "winter"
  timeOfDay: "morning" | "afternoon" | "evening" | "night"
}

export interface FoodRecommendation {
  id: string
  name: string
  type: "recipe" | "restaurant" | "cuisine"
  weatherScore: number
  seasonalBoost: number
  temperatureRange: [number, number]
  preferredConditions: string[]
  tags: string[]
}

// Seasonal food patterns based on weather conditions
const SEASONAL_PATTERNS: Record<string, FoodRecommendation[]> = {
  hot_sunny: [
    {
      id: "ice_cream",
      name: "Ice Cream & Cold Desserts",
      type: "recipe",
      weatherScore: 0.95,
      seasonalBoost: 1.5,
      temperatureRange: [25, 45],
      preferredConditions: ["clear", "sunny"],
      tags: ["cold", "refreshing", "dessert"],
    },
    {
      id: "smoothies",
      name: "Fresh Smoothies & Juices",
      type: "recipe",
      weatherScore: 0.9,
      seasonalBoost: 1.4,
      temperatureRange: [20, 40],
      preferredConditions: ["clear", "sunny", "partly cloudy"],
      tags: ["cold", "healthy", "refreshing"],
    },
    {
      id: "salads",
      name: "Fresh Salads & Light Meals",
      type: "recipe",
      weatherScore: 0.85,
      seasonalBoost: 1.3,
      temperatureRange: [22, 35],
      preferredConditions: ["clear", "sunny"],
      tags: ["light", "fresh", "healthy"],
    },
  ],
  cold_rainy: [
    {
      id: "hot_soup",
      name: "Hot Soups & Stews",
      type: "recipe",
      weatherScore: 0.95,
      seasonalBoost: 1.6,
      temperatureRange: [-10, 15],
      preferredConditions: ["rain", "drizzle", "snow", "cloudy"],
      tags: ["hot", "comfort", "warming"],
    },
    {
      id: "hot_beverages",
      name: "Hot Chocolate & Coffee",
      type: "recipe",
      weatherScore: 0.9,
      seasonalBoost: 1.5,
      temperatureRange: [-5, 20],
      preferredConditions: ["rain", "snow", "cloudy"],
      tags: ["hot", "beverage", "comfort"],
    },
    {
      id: "comfort_food",
      name: "Comfort Food & Hearty Meals",
      type: "recipe",
      weatherScore: 0.88,
      seasonalBoost: 1.4,
      temperatureRange: [0, 18],
      preferredConditions: ["rain", "drizzle", "overcast"],
      tags: ["hearty", "comfort", "warm"],
    },
  ],
  mild_pleasant: [
    {
      id: "grilled_food",
      name: "Grilled & BBQ Items",
      type: "recipe",
      weatherScore: 0.85,
      seasonalBoost: 1.2,
      temperatureRange: [18, 28],
      preferredConditions: ["clear", "partly cloudy"],
      tags: ["grilled", "outdoor", "social"],
    },
    {
      id: "pasta",
      name: "Pasta & Mediterranean",
      type: "recipe",
      weatherScore: 0.8,
      seasonalBoost: 1.1,
      temperatureRange: [15, 25],
      preferredConditions: ["clear", "partly cloudy"],
      tags: ["moderate", "satisfying"],
    },
  ],
}

// Dynamic Time Warping algorithm for weather-food pattern matching
export function calculateDTWDistance(currentWeather: WeatherPattern, historicalPattern: WeatherPattern[]): number {
  const n = historicalPattern.length
  if (n === 0) return Number.POSITIVE_INFINITY

  // Create DTW matrix
  const dtw: number[][] = Array(n + 1)
    .fill(null)
    .map(() => Array(2).fill(Number.POSITIVE_INFINITY))
  dtw[0][0] = 0

  for (let i = 1; i <= n; i++) {
    const cost = calculateWeatherDistance(currentWeather, historicalPattern[i - 1])
    dtw[i][1] =
      cost +
      Math.min(
        dtw[i - 1][0], // insertion
        dtw[i - 1][1], // match
        dtw[i][0], // deletion
      )
    dtw[i][0] = dtw[i - 1][1]
  }

  return dtw[n][1]
}

function calculateWeatherDistance(w1: WeatherPattern, w2: WeatherPattern): number {
  const tempDiff = Math.abs(w1.temperature - w2.temperature) / 50 // normalize by 50°C range
  const conditionMatch = w1.condition === w2.condition ? 0 : 1
  const humidityDiff = Math.abs(w1.humidity - w2.humidity) / 100 // normalize by 100% range
  const seasonMatch = w1.season === w2.season ? 0 : 0.5
  const timeMatch = w1.timeOfDay === w2.timeOfDay ? 0 : 0.3

  return tempDiff + conditionMatch + humidityDiff + seasonMatch + timeMatch
}

export function getWeatherBasedRecommendations(
  currentWeather: WeatherPattern,
  userPreferences: {
    isVegetarian?: boolean
    isVegan?: boolean
    allergies?: string[]
    favoriteCuisines?: string[]
    spiceLevel?: "mild" | "medium" | "hot"
  },
): FoodRecommendation[] {
  const { temperature, condition } = currentWeather

  // Determine weather category
  let weatherCategory: string
  if (temperature > 25 && ["clear", "sunny"].includes(condition)) {
    weatherCategory = "hot_sunny"
  } else if (temperature < 15 && ["rain", "drizzle", "snow", "overcast"].includes(condition)) {
    weatherCategory = "cold_rainy"
  } else {
    weatherCategory = "mild_pleasant"
  }

  let recommendations = [...(SEASONAL_PATTERNS[weatherCategory] || [])]

  // Apply user preferences filtering
  if (userPreferences.isVegetarian || userPreferences.isVegan) {
    recommendations = recommendations.filter((rec) => !rec.tags.includes("meat") && !rec.tags.includes("seafood"))
  }

  if (userPreferences.isVegan) {
    recommendations = recommendations.filter((rec) => !rec.tags.includes("dairy") && !rec.tags.includes("eggs"))
  }

  // Boost recommendations based on favorite cuisines
  if (userPreferences.favoriteCuisines?.length) {
    recommendations = recommendations.map((rec) => ({
      ...rec,
      weatherScore: userPreferences.favoriteCuisines!.some((cuisine) => rec.tags.includes(cuisine.toLowerCase()))
        ? rec.weatherScore * 1.2
        : rec.weatherScore,
    }))
  }

  // Apply seasonal boost based on current season
  const seasonalMultiplier = getSeasonalMultiplier(currentWeather.season, weatherCategory)
  recommendations = recommendations.map((rec) => ({
    ...rec,
    weatherScore: rec.weatherScore * seasonalMultiplier,
  }))

  // Sort by weather score
  return recommendations.sort((a, b) => b.weatherScore - a.weatherScore)
}

function getSeasonalMultiplier(season: string, weatherCategory: string): number {
  const multipliers: Record<string, Record<string, number>> = {
    summer: { hot_sunny: 1.5, mild_pleasant: 1.2, cold_rainy: 0.8 },
    winter: { cold_rainy: 1.5, mild_pleasant: 1.1, hot_sunny: 0.7 },
    spring: { mild_pleasant: 1.3, hot_sunny: 1.1, cold_rainy: 1.0 },
    autumn: { mild_pleasant: 1.2, cold_rainy: 1.3, hot_sunny: 0.9 },
  }

  return multipliers[season]?.[weatherCategory] || 1.0
}

export function getCurrentSeason(): "spring" | "summer" | "autumn" | "winter" {
  const month = new Date().getMonth() + 1 // 1-12

  if (month >= 3 && month <= 5) return "spring"
  if (month >= 6 && month <= 8) return "summer"
  if (month >= 9 && month <= 11) return "autumn"
  return "winter"
}

export function getTimeOfDay(): "morning" | "afternoon" | "evening" | "night" {
  const hour = new Date().getHours()

  if (hour >= 5 && hour < 12) return "morning"
  if (hour >= 12 && hour < 17) return "afternoon"
  if (hour >= 17 && hour < 21) return "evening"
  return "night"
}
