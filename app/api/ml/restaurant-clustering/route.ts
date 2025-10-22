import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import jwt from "jsonwebtoken"

interface Restaurant {
  _id: string
  name: string
  latitude: number
  longitude: number
  rating: number
  priceLevel: number
  cuisine: string[]
  openingHours: string[]
  features: string[]
  reviewCount: number
}

interface ClusterCenter {
  lat: number
  lng: number
  rating: number
  priceLevel: number
}

// K-means clustering implementation
function kMeansClustering(restaurants: Restaurant[], k = 5, maxIterations = 100) {
  if (restaurants.length < k) {
    return restaurants.map((restaurant, index) => ({ ...restaurant, cluster: index }))
  }

  const features = restaurants.map((restaurant) => ({
    lat: restaurant.latitude,
    lng: restaurant.longitude,
    rating: restaurant.rating,
    priceLevel: restaurant.priceLevel,
    cuisineCount: restaurant.cuisine?.length || 0,
    reviewCount: Math.log(restaurant.reviewCount + 1), // Log transform for better scaling
    featureCount: restaurant.features?.length || 0,
    openHoursCount: restaurant.openingHours?.length || 0,
  }))

  const centroids: ClusterCenter[] = []

  // K-means++ initialization for better centroid selection
  const firstCentroid = features[Math.floor(Math.random() * features.length)]
  centroids.push({
    lat: firstCentroid.lat,
    lng: firstCentroid.lng,
    rating: firstCentroid.rating,
    priceLevel: firstCentroid.priceLevel,
  })

  for (let i = 1; i < k; i++) {
    const distances = features.map((feature) => {
      const minDistToCentroid = Math.min(...centroids.map((centroid) => calculateEnhancedDistance(feature, centroid)))
      return minDistToCentroid * minDistToCentroid
    })

    const totalDistance = distances.reduce((sum, d) => sum + d, 0)
    const randomValue = Math.random() * totalDistance

    let cumulativeDistance = 0
    for (let j = 0; j < features.length; j++) {
      cumulativeDistance += distances[j]
      if (cumulativeDistance >= randomValue) {
        centroids.push({
          lat: features[j].lat,
          lng: features[j].lng,
          rating: features[j].rating,
          priceLevel: features[j].priceLevel,
        })
        break
      }
    }
  }

  const assignments: number[] = new Array(restaurants.length).fill(0)
  let hasChanged = true
  let iteration = 0

  while (hasChanged && iteration < maxIterations) {
    hasChanged = false

    // Assign each restaurant to nearest centroid
    restaurants.forEach((restaurant, index) => {
      let minDistance = Number.POSITIVE_INFINITY
      let nearestCentroid = 0

      centroids.forEach((centroid, centroidIndex) => {
        const distance = calculateEnhancedDistance(features[index], centroid)
        if (distance < minDistance) {
          minDistance = distance
          nearestCentroid = centroidIndex
        }
      })

      if (assignments[index] !== nearestCentroid) {
        assignments[index] = nearestCentroid
        hasChanged = true
      }
    })

    // Update centroids
    for (let i = 0; i < k; i++) {
      const clusterFeatures = features.filter((_, index) => assignments[index] === i)

      if (clusterFeatures.length > 0) {
        centroids[i] = {
          lat: clusterFeatures.reduce((sum, f) => sum + f.lat, 0) / clusterFeatures.length,
          lng: clusterFeatures.reduce((sum, f) => sum + f.lng, 0) / clusterFeatures.length,
          rating: clusterFeatures.reduce((sum, f) => sum + f.rating, 0) / clusterFeatures.length,
          priceLevel: clusterFeatures.reduce((sum, f) => sum + f.priceLevel, 0) / clusterFeatures.length,
        }
      }
    }

    iteration++
  }

  // Return restaurants with cluster assignments
  return restaurants.map((restaurant, index) => ({
    ...restaurant,
    cluster: assignments[index],
    distanceToCenter: calculateEnhancedDistance(features[index], centroids[assignments[index]]),
  }))
}

function calculateEnhancedDistance(feature: any, centroid: ClusterCenter) {
  // Weighted Euclidean distance considering multiple factors
  const latDiff = (feature.lat - centroid.lat) * 111 // Convert to km
  const lngDiff = (feature.lng - centroid.lng) * 111 * Math.cos((feature.lat * Math.PI) / 180)
  const ratingDiff = (feature.rating - centroid.rating) * 2 // Scale rating difference
  const priceDiff = (feature.priceLevel - centroid.priceLevel) * 1.5 // Scale price difference

  return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff + ratingDiff * ratingDiff + priceDiff * priceDiff)
}

function calculateDistance(restaurant: Restaurant, centroid: ClusterCenter) {
  const feature = {
    lat: restaurant.latitude,
    lng: restaurant.longitude,
    rating: restaurant.rating,
    priceLevel: restaurant.priceLevel,
  }
  return calculateEnhancedDistance(feature, centroid)
}

// DBSCAN clustering for density-based clustering
function dbscanClustering(restaurants: Restaurant[], eps = 2, minPts = 3) {
  const clusters: number[] = new Array(restaurants.length).fill(-1) // -1 means unassigned
  let clusterId = 0

  for (let i = 0; i < restaurants.length; i++) {
    if (clusters[i] !== -1) continue // Already processed

    const neighbors = getNeighbors(restaurants, i, eps)

    if (neighbors.length < minPts) {
      clusters[i] = -2 // Mark as noise
      continue
    }

    // Start new cluster
    clusters[i] = clusterId
    const seedSet = [...neighbors]

    for (let j = 0; j < seedSet.length; j++) {
      const neighborIndex = seedSet[j]

      if (clusters[neighborIndex] === -2) {
        clusters[neighborIndex] = clusterId // Change noise to border point
      }

      if (clusters[neighborIndex] !== -1) continue // Already processed

      clusters[neighborIndex] = clusterId
      const neighborNeighbors = getNeighbors(restaurants, neighborIndex, eps)

      if (neighborNeighbors.length >= minPts) {
        seedSet.push(...neighborNeighbors.filter((n) => !seedSet.includes(n)))
      }
    }

    clusterId++
  }

  return restaurants.map((restaurant, index) => ({
    ...restaurant,
    cluster: clusters[index],
    isNoise: clusters[index] === -2,
  }))
}

function getNeighbors(restaurants: Restaurant[], pointIndex: number, eps: number) {
  const neighbors: number[] = []
  const point = restaurants[pointIndex]

  restaurants.forEach((restaurant, index) => {
    if (index === pointIndex) return

    const distance = haversineDistance(point.latitude, point.longitude, restaurant.latitude, restaurant.longitude)

    if (distance <= eps) {
      neighbors.push(index)
    }
  })

  return neighbors
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Analyze clusters and generate insights
function analyzeCluster(clusteredRestaurants: any[]) {
  const clusterStats = new Map()

  clusteredRestaurants.forEach((restaurant) => {
    const clusterId = restaurant.cluster
    if (clusterId === -1 || clusterId === -2) return // Skip unassigned or noise

    if (!clusterStats.has(clusterId)) {
      clusterStats.set(clusterId, {
        restaurants: [],
        avgRating: 0,
        avgPriceLevel: 0,
        cuisines: new Set(),
        features: new Set(),
        centerLat: 0,
        centerLng: 0,
      })
    }

    const stats = clusterStats.get(clusterId)
    stats.restaurants.push(restaurant)
    restaurant.cuisine.forEach((c: string) => stats.cuisines.add(c))
    restaurant.features.forEach((f: string) => stats.features.add(f))
  })

  // Calculate cluster statistics
  clusterStats.forEach((stats, clusterId) => {
    const restaurants = stats.restaurants
    stats.avgRating = restaurants.reduce((sum: number, r: any) => sum + r.rating, 0) / restaurants.length
    stats.avgPriceLevel = restaurants.reduce((sum: number, r: any) => sum + r.priceLevel, 0) / restaurants.length
    stats.centerLat = restaurants.reduce((sum: number, r: any) => sum + r.latitude, 0) / restaurants.length
    stats.centerLng = restaurants.reduce((sum: number, r: any) => sum + r.longitude, 0) / restaurants.length
    stats.cuisines = Array.from(stats.cuisines)
    stats.features = Array.from(stats.features)
    stats.size = restaurants.length
  })

  return Object.fromEntries(clusterStats)
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    jwt.verify(token, process.env.JWT_SECRET!)

    const body = await request.json()
    const { algorithm = "kmeans", k = 5, eps = 2, minPts = 3, location } = body

    const { db } = await connectToDatabase()

    // Get restaurants data
    let query = {}
    if (location) {
      // Filter restaurants within a certain radius of user location
      const radius = 50 // 50km radius
      query = {
        latitude: {
          $gte: location.lat - radius / 111,
          $lte: location.lat + radius / 111,
        },
        longitude: {
          $gte: location.lng - radius / (111 * Math.cos((location.lat * Math.PI) / 180)),
          $lte: location.lng + radius / (111 * Math.cos((location.lat * Math.PI) / 180)),
        },
      }
    }

    const restaurants = await db.collection("restaurants").find(query).toArray()

    if (restaurants.length === 0) {
      return NextResponse.json({ error: "No restaurants found" }, { status: 404 })
    }

    let clusteredRestaurants
    let algorithmUsed = algorithm

    if (algorithm === "kmeans") {
      clusteredRestaurants = kMeansClustering(restaurants, k)
    } else if (algorithm === "dbscan") {
      clusteredRestaurants = dbscanClustering(restaurants, eps, minPts)
    } else {
      // Auto-select best algorithm based on data characteristics
      if (restaurants.length > 100) {
        clusteredRestaurants = dbscanClustering(restaurants, eps, minPts)
        algorithmUsed = "dbscan"
      } else {
        clusteredRestaurants = kMeansClustering(restaurants, Math.min(k, Math.floor(restaurants.length / 2)))
        algorithmUsed = "kmeans"
      }
    }

    // Analyze clusters
    const clusterAnalysis = analyzeCluster(clusteredRestaurants)

    // Save clustering results for future analysis
    await db.collection("clusteringResults").insertOne({
      timestamp: new Date(),
      algorithm: algorithmUsed,
      parameters: { k, eps, minPts },
      totalRestaurants: restaurants.length,
      clustersFound: Object.keys(clusterAnalysis).length,
      location,
      results: clusterAnalysis,
    })

    return NextResponse.json({
      success: true,
      algorithm: algorithmUsed,
      totalRestaurants: restaurants.length,
      clustersFound: Object.keys(clusterAnalysis).length,
      clusters: clusterAnalysis,
      restaurants: clusteredRestaurants,
      parameters: { k, eps, minPts },
    })
  } catch (error) {
    console.error("Restaurant clustering error:", error)
    return NextResponse.json({ error: "Failed to perform clustering analysis" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    jwt.verify(token, process.env.JWT_SECRET!)

    const { db } = await connectToDatabase()

    // Get recent clustering results
    const recentResults = await db.collection("clusteringResults").find({}).sort({ timestamp: -1 }).limit(10).toArray()

    // Get clustering analytics
    const totalClusters = await db.collection("clusteringResults").countDocuments()
    const algorithmUsage = await db
      .collection("clusteringResults")
      .aggregate([{ $group: { _id: "$algorithm", count: { $sum: 1 } } }])
      .toArray()

    return NextResponse.json({
      success: true,
      recentResults,
      analytics: {
        totalClusteringOperations: totalClusters,
        algorithmUsage,
        averageClustersFound:
          recentResults.length > 0
            ? recentResults.reduce((sum, result) => sum + result.clustersFound, 0) / recentResults.length
            : 0,
      },
    })
  } catch (error) {
    console.error("Get clustering results error:", error)
    return NextResponse.json({ error: "Failed to get clustering data" }, { status: 500 })
  }
}
