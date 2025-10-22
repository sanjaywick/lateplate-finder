import { type NextRequest, NextResponse } from "next/server"

// Enhanced mock data for 24/7 grocery stores and convenience stores
const generate24HourStores = (lat: number, lng: number, radius: number) => {
  const stores = [
    {
      id: "store-1",
      placeId: "ChIJstore1234567890",
      name: "24/7 SuperMart Express",
      address: "Main Road, City Center",
      phone: "+91 98765 43210",
      distance: (Math.random() * 2 + 0.3).toFixed(1),
      rating: 4.2,
      hours: "Open 24 hours",
      isOpen: true,
      is24Hours: true,
      services: ["Grocery", "Fresh Produce", "Dairy", "Pharmacy", "ATM"],
      hasDelivery: false,
      specialFeatures: ["Self-checkout", "Organic section", "Fresh bakery", "24/7 pharmacy"],
      storeType: "supermarket",
      priceLevel: 2,
      photos: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop"],
      categories: ["Groceries", "Fresh Food", "Household Items", "Personal Care"],
      popularItems: ["Fresh Vegetables ₹50/kg", "Milk ₹60/L", "Bread ₹25", "Rice ₹80/kg"],
    },
    {
      id: "store-2",
      placeId: "ChIJstore2345678901",
      name: "Night Owl Convenience Plus",
      address: "Highway Junction, Near Petrol Pump",
      phone: "+91 87654 32109",
      distance: (Math.random() * 3 + 0.5).toFixed(1),
      rating: 3.9,
      hours: "Open 24 hours",
      isOpen: true,
      is24Hours: true,
      services: ["Convenience", "Snacks", "Beverages", "Basic Groceries", "Mobile Recharge"],
      hasDelivery: false,
      specialFeatures: ["Hot food counter", "Coffee machine", "Ice cream", "Lottery tickets"],
      storeType: "convenience",
      priceLevel: 2,
      photos: ["https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop"],
      categories: ["Snacks", "Beverages", "Quick Meals", "Essentials"],
      popularItems: ["Instant Noodles ₹20", "Cold Drinks ₹40", "Chips ₹30", "Cigarettes ₹150"],
    },
    {
      id: "store-3",
      placeId: "ChIJstore3456789012",
      name: "Always Open Market",
      address: "Residential Area, Block A",
      phone: "+91 76543 21098",
      distance: (Math.random() * 1.8 + 0.4).toFixed(1),
      rating: 4.5,
      hours: "Open 24 hours",
      isOpen: true,
      is24Hours: true,
      services: ["Grocery", "Fresh Produce", "Bakery", "Meat Counter", "Dairy"],
      hasDelivery: false,
      specialFeatures: ["Local produce", "Fresh meat", "Artisan bread", "Organic options"],
      storeType: "grocery",
      priceLevel: 2,
      photos: ["https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop"],
      categories: ["Fresh Produce", "Meat & Seafood", "Bakery", "Dairy"],
      popularItems: ["Fresh Chicken ₹200/kg", "Tomatoes ₹40/kg", "Fresh Bread ₹30", "Paneer ₹300/kg"],
    },
    {
      id: "store-4",
      placeId: "ChIJstore4567890123",
      name: "MedPlus 24x7 Pharmacy",
      address: "Hospital Road, Medical District",
      phone: "+91 65432 10987",
      distance: (Math.random() * 2.5 + 0.6).toFixed(1),
      rating: 4.3,
      hours: "Open 24 hours",
      isOpen: true,
      is24Hours: true,
      services: ["Pharmacy", "Health Products", "Baby Care", "Personal Care", "First Aid"],
      hasDelivery: false,
      specialFeatures: ["Prescription medicines", "Health checkup", "Home delivery", "Insurance accepted"],
      storeType: "pharmacy",
      priceLevel: 2,
      photos: ["https://images.unsplash.com/photo-1576602976047-174e57a47881?w=400&h=300&fit=crop"],
      categories: ["Medicines", "Health Care", "Baby Products", "Personal Care"],
      popularItems: ["Paracetamol ₹15", "Cough Syrup ₹80", "Band-Aid ₹25", "Vitamins ₹200"],
    },
    {
      id: "store-5",
      placeId: "ChIJstore5678901234",
      name: "Midnight Munchies Store",
      address: "College Street, Student Area",
      phone: "+91 54321 09876",
      distance: (Math.random() * 1.5 + 0.3).toFixed(1),
      rating: 4.0,
      hours: "8 PM - 8 AM",
      isOpen: true,
      is24Hours: false,
      services: ["Snacks", "Beverages", "Instant Food", "Study Supplies", "Phone Accessories"],
      hasDelivery: false,
      specialFeatures: ["Student discounts", "Late night snacks", "Energy drinks", "Study materials"],
      storeType: "convenience",
      priceLevel: 1,
      photos: ["https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop"],
      categories: ["Snacks", "Energy Drinks", "Instant Food", "Stationery"],
      popularItems: ["Energy Drinks ₹60", "Instant Coffee ₹25", "Biscuits ₹20", "Notebooks ₹40"],
      openLate: "8:00 AM",
    },
    {
      id: "store-6",
      placeId: "ChIJstore6789012345",
      name: "Fresh & More 24/7",
      address: "IT Park, Tech Hub Area",
      phone: "+91 43210 98765",
      distance: (Math.random() * 3.2 + 0.8).toFixed(1),
      rating: 4.1,
      hours: "Open 24 hours",
      isOpen: true,
      is24Hours: true,
      services: ["Grocery", "Ready-to-eat", "Beverages", "Personal Care", "Electronics"],
      hasDelivery: false,
      specialFeatures: ["Ready meals", "Healthy options", "Tech accessories", "Corporate discounts"],
      storeType: "supermarket",
      priceLevel: 3,
      photos: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop"],
      categories: ["Ready Meals", "Health Food", "Tech Items", "Premium Products"],
      popularItems: ["Salad Bowls ₹150", "Protein Bars ₹80", "Green Tea ₹120", "Phone Chargers ₹300"],
    },
    {
      id: "store-7",
      placeId: "ChIJstore7890123456",
      name: "Quick Stop Essentials",
      address: "Bus Stand, Transport Hub",
      phone: "+91 32109 87654",
      distance: (Math.random() * 2.8 + 0.7).toFixed(1),
      rating: 3.8,
      hours: "5 AM - 1 AM",
      isOpen: true,
      is24Hours: false,
      services: ["Travel Essentials", "Snacks", "Beverages", "Toiletries", "Magazines"],
      hasDelivery: false,
      specialFeatures: ["Travel kits", "Newspapers", "Phone cards", "Luggage accessories"],
      storeType: "convenience",
      priceLevel: 2,
      photos: ["https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop"],
      categories: ["Travel Items", "Snacks", "Reading Material", "Basic Needs"],
      popularItems: ["Travel Kit ₹100", "Water Bottles ₹20", "Newspapers ₹5", "Phone Cards ₹50"],
      openLate: "1:00 AM",
    },
    {
      id: "store-8",
      placeId: "ChIJstore8901234567",
      name: "All Hours General Store",
      address: "Market Square, Old Town",
      phone: "+91 21098 76543",
      distance: (Math.random() * 2.0 + 0.5).toFixed(1),
      rating: 4.4,
      hours: "Open 24 hours",
      isOpen: true,
      is24Hours: true,
      services: ["General Store", "Household Items", "Stationery", "Toys", "Gifts"],
      hasDelivery: false,
      specialFeatures: ["Local products", "Gift wrapping", "Bulk items", "Traditional items"],
      storeType: "general",
      priceLevel: 1,
      photos: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop"],
      categories: ["Household", "Stationery", "Gifts", "Local Products"],
      popularItems: ["Detergent ₹80", "Pens ₹10", "Candles ₹15", "Local Sweets ₹200/kg"],
    },
  ]

  // Filter based on current time and distance
  const currentHour = new Date().getHours()
  const isLateNight = currentHour >= 22 || currentHour <= 6
  const maxDistance = radius / 1609 // Convert meters to miles

  let filteredStores = stores.filter((store) => Number.parseFloat(store.distance) <= maxDistance)

  // During late night, prioritize 24-hour stores
  if (isLateNight) {
    filteredStores = filteredStores.sort((a, b) => {
      if (a.is24Hours && !b.is24Hours) return -1
      if (!a.is24Hours && b.is24Hours) return 1
      return Number.parseFloat(a.distance) - Number.parseFloat(b.distance)
    })
  }

  return filteredStores.map((store) => ({
    ...store,
    distance: Number.parseFloat(store.distance),
    geometry: {
      location: {
        lat: lat + (Math.random() - 0.5) * 0.02,
        lng: lng + (Math.random() - 0.5) * 0.02,
      },
    },
  }))
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = Number.parseFloat(searchParams.get("lat") || "0")
    const lng = Number.parseFloat(searchParams.get("lng") || "0")
    const radius = Number.parseInt(searchParams.get("radius") || "5000")
    const weatherTag = (searchParams.get("weatherTag") || "").toLowerCase()

    console.log(`🛒 Searching 24/7 stores near ${lat}, ${lng} within ${radius}m`)

    if (!lat || !lng) {
      return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
    }

    const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || process.env.GOOGLE_PLACES_API_KEY

    if (googleApiKey) {
      try {
        console.log("🔍 Using Google Places API for 24/7 stores")

        // Search for stores that are likely to be open 24/7 or late
        const searchQueries = [
          "24 hour grocery store",
          "convenience store",
          "24/7 supermarket",
          "late night store",
          "pharmacy 24 hours",
        ]

        let allResults = []

        for (const query of searchQueries) {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${lat},${lng}&radius=${radius}&key=${googleApiKey}`,
          )

          if (response.ok) {
            const data = await response.json()
            if (data.results) {
              // Filter for actual grocery/convenience stores
              const groceryStores = data.results.filter((place) => {
                const types = place.types || []
                const name = place.name.toLowerCase()

                return (
                  (types.includes("grocery_or_supermarket") ||
                    types.includes("convenience_store") ||
                    types.includes("supermarket") ||
                    types.includes("pharmacy") ||
                    types.includes("store") ||
                    name.includes("mart") ||
                    name.includes("store") ||
                    name.includes("24") ||
                    name.includes("convenience")) &&
                  !types.includes("restaurant") &&
                  !types.includes("meal_delivery")
                )
              })

              allResults = [...allResults, ...groceryStores]
            }
          }
        }

        // Remove duplicates and format results
        const uniqueResults = allResults.filter(
          (place, index, self) => index === self.findIndex((p) => p.place_id === place.place_id),
        )

        if (uniqueResults.length > 0) {
          const formattedStores = uniqueResults.slice(0, 10).map((place) => ({
            id: place.place_id,
            placeId: place.place_id,
            name: place.name,
            address: place.formatted_address || place.vicinity || "Address not available",
            phone: "Contact via Google",
            distance: calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng),
            rating: place.rating || 4.0,
            hours: "Hours may vary - Check with store",
            isOpen: place.opening_hours?.open_now !== false,
            is24Hours: isLikely24HourStore(place.name),
            services: determineStoreServices(place.name, place.types),
            hasDelivery: false,
            specialFeatures: generateStoreFeatures(place.name, place.types),
            storeType: determineStoreType(place.types),
            priceLevel: place.price_level || 2,
            photos: place.photos
              ? [
                  `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${googleApiKey}`,
                ]
              : [],
            categories: generateStoreCategories(place.types),
            geometry: place.geometry,
          }))

          console.log(`✅ Found ${formattedStores.length} stores via Google API`)

          return NextResponse.json({
            stores: formattedStores,
            source: "google_places",
            total: formattedStores.length,
          })
        }
      } catch (error) {
        console.error("Google Places API error:", error)
      }
    }

    // Fallback to enhanced mock data for 24/7 stores
    console.log("🏪 Using enhanced mock data for 24/7 stores")
    const mockStores = generate24HourStores(lat, lng, radius)

    const scoreStore = (s: any) => {
      let score = 0
      if (weatherTag === "hot") {
        if (s.services?.includes("Beverages") || s.specialFeatures?.some((f: string) => /ice cream|cold/i.test(f)))
          score += 10
      } else if (weatherTag === "cold" || weatherTag === "rainy") {
        if (
          s.specialFeatures?.some((f: string) => /hot food|coffee/i.test(f)) ||
          s.services?.some((x: string) => /pharmacy/i.test(x))
        )
          score += 10
      }
      // closer distance is better
      score += Math.max(0, 5 - Number.parseFloat(s.distance || 5))
      return score
    }

    const ranked = [...mockStores].sort((a, b) => scoreStore(b) - scoreStore(a))

    return NextResponse.json({
      stores: ranked,
      source: "mock_store_data",
      total: ranked.length,
      message: "Showing sample 24/7 stores. Add Google Places API key for real data.",
    })
  } catch (error) {
    console.error("Error fetching stores:", error)
    return NextResponse.json({ error: "Failed to fetch stores" }, { status: 500 })
  }
}

// Helper functions
function isLikely24HourStore(name: string): boolean {
  const nameLower = name.toLowerCase()
  return (
    nameLower.includes("24") ||
    nameLower.includes("24x7") ||
    nameLower.includes("24/7") ||
    nameLower.includes("all hours") ||
    nameLower.includes("always open")
  )
}

function determineStoreServices(name: string, types: string[]): string[] {
  const services = []
  const nameLower = name.toLowerCase()

  if (types.includes("grocery_or_supermarket") || nameLower.includes("grocery")) {
    services.push("Grocery", "Fresh Produce", "Dairy")
  }
  if (types.includes("convenience_store") || nameLower.includes("convenience")) {
    services.push("Convenience", "Snacks", "Beverages")
  }
  if (types.includes("pharmacy") || nameLower.includes("pharmacy") || nameLower.includes("medical")) {
    services.push("Pharmacy", "Health Products", "Personal Care")
  }
  if (nameLower.includes("mart") || nameLower.includes("super")) {
    services.push("Household Items", "Electronics", "Clothing")
  }

  if (services.length === 0) {
    services.push("General Store", "Basic Essentials")
  }

  return services
}

function generateStoreFeatures(name: string, types: string[]): string[] {
  const features = []
  const nameLower = name.toLowerCase()

  if (nameLower.includes("24") || nameLower.includes("always")) {
    features.push("24/7 Service")
  }
  if (types.includes("atm") || nameLower.includes("atm")) {
    features.push("ATM Available")
  }
  if (nameLower.includes("pharmacy")) {
    features.push("Prescription Services")
  }
  if (nameLower.includes("fresh") || nameLower.includes("organic")) {
    features.push("Fresh Products")
  }

  features.push("Self-service", "Multiple Payment Options")

  return features
}

function determineStoreType(types: string[]): string {
  if (types.includes("grocery_or_supermarket")) return "supermarket"
  if (types.includes("convenience_store")) return "convenience"
  if (types.includes("pharmacy")) return "pharmacy"
  return "general"
}

function generateStoreCategories(types: string[]): string[] {
  const categories = []

  if (types.includes("grocery_or_supermarket")) {
    categories.push("Groceries", "Fresh Food", "Household Items")
  }
  if (types.includes("convenience_store")) {
    categories.push("Snacks", "Beverages", "Quick Items")
  }
  if (types.includes("pharmacy")) {
    categories.push("Medicines", "Health Care", "Personal Care")
  }

  if (categories.length === 0) {
    categories.push("General Items", "Essentials")
  }

  return categories
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Number.parseFloat((R * c).toFixed(1))
}
