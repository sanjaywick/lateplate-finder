"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, MapPin, Clock, Phone, Navigation, Star, Zap, Shield, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { LocationSelector } from "@/components/location-selector"
import type { Location } from "@/types/location"

// Store Image Component
function StoreImage({ store, className }: { store: any; className: string }) {
  const [imageUrl, setImageUrl] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Use actual store images based on store type and services
    const storeImages = {
      supermarket: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center",
      convenience: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop&crop=center",
      pharmacy: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=400&h=300&fit=crop&crop=center",
      grocery: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop&crop=center",
      default: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center",
    }

    // Determine store type based on services
    let storeType = "default"
    if (store.services?.includes("Pharmacy")) {
      storeType = "pharmacy"
    } else if (store.services?.includes("Convenience")) {
      storeType = "convenience"
    } else if (store.services?.includes("Grocery") || store.services?.includes("Fresh Produce")) {
      storeType = "grocery"
    } else if (store.services?.includes("Supermarket")) {
      storeType = "supermarket"
    }

    setImageUrl(storeImages[storeType])
    setLoading(false)
  }, [store])

  const handleImageError = () => {
    setImageUrl("https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center")
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {loading ? (
        <div className="w-full h-full bg-gradient-to-br from-green-200 to-blue-200 animate-pulse flex items-center justify-center">
          <ShoppingCart className="w-8 h-8 text-green-400" />
        </div>
      ) : (
        <img
          src={imageUrl || "/placeholder.svg"}
          alt={store.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={handleImageError}
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* 24/7 badge */}
      {store.is24Hours && (
        <div className="absolute top-3 right-3">
          <Badge className="bg-green-500 text-white shadow-lg animate-pulse">
            <Zap className="w-3 h-3 mr-1" />
            24/7
          </Badge>
        </div>
      )}

      {/* Store status */}
      <div className="absolute top-3 left-3">
        <Badge
          variant={store.isOpen ? "default" : "destructive"}
          className={`${store.isOpen ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"} text-white shadow-lg`}
        >
          {store.isOpen ? "Open Now" : "Closed"}
        </Badge>
      </div>
    </div>
  )
}

export default function GroceryPage() {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState("")
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState("")
  const [searchRadius, setSearchRadius] = useState("5")
  const { toast } = useToast()
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  const getCurrentLocation = () => {
    setLoading(true)
    setLocationError("")

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser")
      loadMockStores()
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })

        try {
          // Get address from coordinates
          const response = await fetch(`/api/geocode/reverse?lat=${latitude}&lng=${longitude}`)
          if (response.ok) {
            const data = await response.json()
            setLocation(data.formatted_address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
          } else {
            setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
          }

          // Fetch stores for this location
          await fetchStores(latitude, longitude)
        } catch (error) {
          console.error("Error getting location details:", error)
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
          await fetchStores(latitude, longitude)
        }
      },
      (error) => {
        console.error("Geolocation error:", error)
        let errorMessage = "Unable to get your location"

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location services."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable."
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out."
            break
        }

        setLocationError(errorMessage)
        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive",
        })

        // Use default location (New York)
        setLocation("New York, NY")
        setUserLocation({ lat: 40.7128, lng: -74.006 })
        fetchStores(40.7128, -74.006)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    )
  }

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location)
    setUserLocation({ lat: location.latitude, lng: location.longitude })
    setLocation(location.name || location.address)
    localStorage.setItem("currentLocation", JSON.stringify(location))

    // Automatically fetch stores for the new location
    fetchStores(location.latitude, location.longitude)
  }

  const fetchStores = async (lat: number, lng: number) => {
    try {
      // Fetch weather to derive weatherTag for weather-aware store ranking server-side
      let weatherTag = ""
      try {
        const wx = await fetch(`/api/weather?lat=${lat}&lon=${lng}`)
        if (wx.ok) {
          const { weather } = await wx.json()
          weatherTag =
            weather.temperature > 25
              ? "hot"
              : weather.temperature < 15
                ? "cold"
                : weather.condition?.includes("rain")
                  ? "rainy"
                  : "mild"
        }
      } catch (e) {
        // ignore weather errors
      }

      const params = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        radius: (Number.parseInt(searchRadius) * 1609).toString(), // Convert miles to meters
        ...(weatherTag && { weatherTag }),
      })

      console.log("[v0] Fetching stores with params:", params.toString())

      const response = await fetch(`/api/grocery/google?${params}`)
      const data = await response.json()

      if (response.ok && data.stores) {
        console.log(`[v0] Found ${data.stores.length} stores`)
        setStores(data.stores)

        // Log a "searched" activity so analytics Activity tab has real data
        const token = localStorage.getItem("token")
        if (token) {
          await fetch("/api/user/activities", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              type: "grocery",
              action: "searched",
              details: `Searched 24/7 stores near (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
              metadata: {
                location: { lat, lng },
                radiusMeters: Number.parseInt(searchRadius) * 1609,
                weatherTag,
                resultCount: data.stores.length,
              },
              timestamp: new Date().toISOString(),
            }),
          })
        }

        if (data.stores.length === 0) {
          toast({
            title: "No stores found",
            description: "Try expanding your search radius",
          })
        }
      } else {
        console.error("Failed to fetch stores:", data.message)
        throw new Error(data.message || "Failed to fetch stores")
      }
    } catch (error) {
      console.error("Error fetching stores:", error)
      toast({
        title: "Error loading stores",
        description: "Showing sample stores instead",
        variant: "destructive",
      })
      loadMockStores()
    } finally {
      setLoading(false)
    }
  }

  const loadMockStores = () => {
    const mockStores = [
      {
        id: "mock-store-1",
        name: "24/7 SuperMart Express",
        address: "123 Main St, Downtown",
        phone: "(555) 123-4567",
        distance: 0.8,
        rating: 4.2,
        hours: "Open 24 hours",
        isOpen: true,
        is24Hours: true,
        services: ["Grocery", "Pharmacy", "Deli", "ATM"],
        hasDelivery: true,
        specialFeatures: ["Self-checkout", "Organic section", "Fresh bakery"],
      },
      {
        id: "mock-store-2",
        name: "Night Owl Convenience Plus",
        address: "456 Oak Ave, Midtown",
        phone: "(555) 234-5678",
        distance: 1.2,
        rating: 3.9,
        hours: "Open 24 hours",
        isOpen: true,
        is24Hours: true,
        services: ["Convenience", "Snacks", "Beverages", "Gas Station"],
        hasDelivery: false,
        specialFeatures: ["Hot food", "Coffee bar", "Lottery"],
      },
      {
        id: "mock-store-3",
        name: "Always Open Market",
        address: "789 Pine St, Downtown",
        phone: "(555) 345-6789",
        distance: 0.5,
        rating: 4.5,
        hours: "Open 24 hours",
        isOpen: true,
        is24Hours: true,
        services: ["Grocery", "Fresh Produce", "Bakery", "Butcher"],
        hasDelivery: true,
        specialFeatures: ["Local produce", "Artisan bread", "Meat counter"],
      },
    ]
    setStores(mockStores)
  }

  const searchStores = async () => {
    if (userLocation) {
      setLoading(true)
      await fetchStores(userLocation.lat, userLocation.lng)
    } else {
      toast({
        title: "Please enter a location",
        description: "Enter a city, address, or zip code",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    const savedLocation = localStorage.getItem("currentLocation")
    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation)
        setSelectedLocation(parsed)
        setUserLocation({ lat: parsed.latitude, lng: parsed.longitude })
        setLocation(parsed.name || parsed.address)
        fetchStores(parsed.latitude, parsed.longitude)
      } catch (error) {
        console.error("Error parsing saved location:", error)
      }
    } else {
      getCurrentLocation()
    }

    const handleLocationChange = (event: CustomEvent) => {
      const { lat, lng, name, address } = event.detail
      console.log("[v0] Grocery page received location change:", { lat, lng, name, address })
      setUserLocation({ lat, lng })
      setLocation(name || address)
      // Automatically fetch stores for the new location
      fetchStores(lat, lng)
    }

    window.addEventListener("locationChanged", handleLocationChange as EventListener)

    return () => {
      window.removeEventListener("locationChanged", handleLocationChange as EventListener)
    }
  }, [])

  const logUserActivity = async (type: string, action: string, details: string, metadata = {}) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.log("[v0] No token found, skipping activity logging")
        return
      }

      console.log("[v0] Logging grocery activity:", { type, action, details })

      const response = await fetch("/api/user/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type,
          action,
          details,
          metadata: {
            ...metadata,
            timestamp: new Date().toISOString(),
            location: userLocation,
          },
          timestamp: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        console.log("[v0] Activity logged successfully")
        // Show success toast
        toast({
          title: "Activity Tracked",
          description: `${action} activity has been recorded`,
        })
      } else {
        console.error("[v0] Failed to log activity:", response.status)
      }
    } catch (error) {
      console.error("[v0] Failed to log user activity:", error)
    }
  }

  const handleDirections = async (store: any) => {
    console.log("[v0] Getting directions to store:", store.name)

    await logUserActivity("grocery", "directions", `Got directions to ${store.name}`, {
      storeName: store.name,
      address: store.address,
      storeType: store.services?.[0] || "grocery",
      services: store.services,
      rating: store.rating,
      distance: store.distance,
      storeId: store.id,
    })

    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(store.address)}`
    window.open(url, "_blank")
  }

  const handleCallStore = async (store: any) => {
    await logUserActivity("grocery", "called", `Called ${store.name}`, {
      storeName: store.name,
      phone: store.phone,
      storeType: store.services?.[0] || "grocery",
      storeId: store.id,
    })

    if (store.phone && store.phone !== "N/A") {
      window.open(`tel:${store.phone}`, "_self")
    } else {
      toast({
        title: "Phone not available",
        description: "Phone number not available for this store",
        variant: "destructive",
      })
    }
  }

  const handleOrderOnline = async (store: any) => {
    await logUserActivity("grocery", "order_online", `Attempted online order from ${store.name}`, {
      storeName: store.name,
      hasDelivery: store.hasDelivery,
      storeType: store.services?.[0] || "grocery",
      storeId: store.id,
    })

    toast({
      title: "Online Ordering",
      description: "Please visit the store's website or app to place an order",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50">
      {/* Enhanced Navigation */}
      <nav className="bg-white/90 backdrop-blur-md shadow-lg border-b border-green-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link
            href="/dashboard"
            className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"
          >
            LatePlate Finder
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50 bg-transparent">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4 floating-animation">
            24/7 Grocery Stores
          </h1>
          <p className="text-gray-600 text-lg">Find grocery stores and convenience stores open around the clock</p>
          <div className="flex justify-center mt-4">
            <ShoppingCart className="w-6 h-6 text-green-400 animate-bounce" />
          </div>
        </div>

        {/* Enhanced Search Section */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm shadow-xl border-0 card-hover">
          <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-xl">
              <MapPin className="w-6 h-6" />
              Smart Location & Analytics Filters
            </CardTitle>
            <CardDescription className="text-green-100">
              Select your location and customize your store search preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {locationError && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="text-yellow-800 text-sm">{locationError}</span>
              </div>
            )}

            {/* Location Selector */}
            <div className="flex gap-4">
              <div className="flex-1">
                <LocationSelector onLocationSelect={handleLocationSelect} selectedLocation={selectedLocation} />
              </div>
              <Button
                onClick={getCurrentLocation}
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-50 px-6 bg-transparent h-12 transition-all duration-300"
                disabled={loading}
              >
                <Navigation className="w-4 h-4 mr-2" />
                Current Location
              </Button>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block text-gray-700">Search Radius</label>
                <select
                  className="w-full p-3 border border-green-200 rounded-lg focus:border-green-400 focus:ring-2 focus:ring-green-200 bg-white"
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(e.target.value)}
                >
                  <option value="1">📍 Within 1 mile</option>
                  <option value="5">📍 Within 5 miles</option>
                  <option value="10">📍 Within 10 miles</option>
                  <option value="25">📍 Within 25 miles</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block text-gray-700">Store Type</label>
                <select className="w-full p-3 border border-green-200 rounded-lg focus:border-green-400 focus:ring-2 focus:ring-green-200 bg-white">
                  <option value="">🏪 All Stores</option>
                  <option value="grocery">🛒 Grocery Stores</option>
                  <option value="convenience">🏬 Convenience Stores</option>
                  <option value="pharmacy">💊 Pharmacies</option>
                </select>
              </div>
            </div>

            <Button
              onClick={searchStores}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-3 text-lg font-semibold shadow-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Searching...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Find 24/7 Stores
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Current Location Display */}
        {userLocation && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800 font-medium">Searching near: {location}</span>
              <span className="text-blue-600 text-sm">
                ({userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)})
              </span>
            </div>
          </div>
        )}

        {/* Enhanced Store Results */}
        <div className="grid md:grid-cols-2 gap-8">
          {stores.map((store, index) => (
            <Card
              key={store.id}
              className="group bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 border-0 overflow-hidden card-hover"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Store Image */}
              <div className="relative h-48">
                <StoreImage store={store} className="h-full" />

                {/* Floating rating badge */}
                <div className="absolute bottom-3 left-3">
                  <div className="bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-semibold text-gray-800">{store.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Distance badge */}
                <div className="absolute bottom-3 right-3">
                  <Badge className="bg-blue-500/90 text-white backdrop-blur-sm">📍 {store.distance} miles</Badge>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Store Header */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
                      {store.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      {store.hasDelivery && (
                        <Badge className="bg-green-100 text-green-700 text-xs">🚚 Delivery Available</Badge>
                      )}
                      {store.is24Hours && (
                        <Badge className="bg-blue-100 text-blue-700 text-xs">
                          <Zap className="w-3 h-3 mr-1" />
                          24/7 Open
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Address and Contact */}
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 mt-1 text-green-500" />
                      <span className="text-sm">{store.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600">{store.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600 font-medium">{store.hours}</span>
                    </div>
                  </div>

                  {/* Services */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Services:</p>
                    <div className="flex flex-wrap gap-1">
                      {store.services.map((service, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs border-green-200 text-green-700">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Special Features */}
                  {store.specialFeatures && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Special Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {store.specialFeatures.map((feature, idx) => (
                          <Badge key={idx} className="bg-purple-100 text-purple-700 text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-2 pt-4">
                    <Button
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white hover:text-white text-sm"
                      onClick={() => handleDirections(store)}
                    >
                      <Navigation className="w-3 h-3 mr-1" />
                      Directions
                    </Button>
                    <Button
                      variant="outline"
                      className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 text-sm bg-transparent"
                      onClick={() => handleCallStore(store)}
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      Call Store
                    </Button>
                    {store.hasDelivery && (
                      <Button
                        variant="outline"
                        className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800 text-sm bg-transparent"
                        onClick={() => handleOrderOnline(store)}
                      >
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        Order Online
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {stores.length === 0 && !loading && (
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
            <CardContent className="text-center py-16">
              <div className="animate-bounce mb-6">
                <ShoppingCart className="w-16 h-16 text-green-400 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No stores found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your location or search radius</p>
              <Button
                onClick={loadMockStores}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
              >
                Show Sample Stores
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
