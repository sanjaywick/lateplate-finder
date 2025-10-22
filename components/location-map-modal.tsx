"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Search, Loader2, Navigation, ExternalLink } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface Location {
  _id?: string
  name: string
  address: string
  latitude: number
  longitude: number
  isDefault?: boolean
}

interface LocationMapModalProps {
  isOpen: boolean
  onClose: () => void
  onLocationSelect: (location: Location) => void
  initialLocation?: Location | null
}

export default function LocationMapModal({
  isOpen,
  onClose,
  onLocationSelect,
  initialLocation,
}: LocationMapModalProps) {
  const router = useRouter()
  const [locationName, setLocationName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number }>({
    lat: 13.0827, // Changed to Chennai, Tamil Nadu coordinates
    lng: 80.2707,
  })
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [address, setAddress] = useState("")
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Initialize location on modal open
  useEffect(() => {
    if (isOpen) {
      if (initialLocation) {
        setCurrentLocation({
          lat: initialLocation.latitude,
          lng: initialLocation.longitude,
        })
        setSelectedLocation({
          lat: initialLocation.latitude,
          lng: initialLocation.longitude,
        })
        setLocationName(initialLocation.name)
        setAddress(initialLocation.address)
      } else {
        getCurrentLocation()
      }
    }
  }, [isOpen, initialLocation])

  // Listen for location selection from the dedicated page
  useEffect(() => {
    const handleStorageChange = () => {
      const savedLocation = localStorage.getItem("selectedLocation")
      if (savedLocation) {
        try {
          const location = JSON.parse(savedLocation)
          setLocationName(location.name)
          setSelectedLocation({ lat: location.lat, lng: location.lng })
          setAddress(location.address)
          localStorage.removeItem("selectedLocation") // Clean up

          // Auto-save the location
          const locationData: Location = {
            name: location.name,
            address: location.address,
            latitude: location.lat,
            longitude: location.lng,
          }
          onLocationSelect(locationData)
          onClose()

          toast({
            title: "Location Saved",
            description: `${location.name} has been saved successfully.`,
          })
        } catch (error) {
          console.error("Error parsing saved location:", error)
        }
      }
    }

    // Check immediately when modal opens
    if (isOpen) {
      handleStorageChange()
    }

    // Listen for storage changes (when user returns from location picker)
    window.addEventListener("storage", handleStorageChange)

    // Also listen for focus events (when user returns to this tab)
    window.addEventListener("focus", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("focus", handleStorageChange)
    }
  }, [isOpen, onLocationSelect, onClose])

  const getCurrentLocation = useCallback(() => {
    setIsLoadingLocation(true)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setCurrentLocation(location)
          setSelectedLocation(location)

          await getAddressFromCoordinates(location)
          setIsLoadingLocation(false)
        },
        (error) => {
          console.error("Geolocation error:", error)
          toast({
            title: "Location Access Denied",
            description: "Using default location. You can still search and select manually.",
            variant: "destructive",
          })
          setIsLoadingLocation(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        },
      )
    } else {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support location services.",
        variant: "destructive",
      })
      setIsLoadingLocation(false)
    }
  }, [])

  const getAddressFromCoordinates = async (location: { lat: number; lng: number }) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
      if (!apiKey) {
        setAddress(`${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`)
        return
      }

      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.lat},${location.lng}&key=${apiKey}`
      const response = await fetch(geocodeUrl)
      const data = await response.json()

      if (data.status === "OK" && data.results.length > 0) {
        const result = data.results[0]
        setAddress(result.formatted_address)
      } else {
        setAddress(`${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`)
      }
    } catch (error) {
      console.error("Address lookup error:", error)
      setAddress(`${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`)
    }
  }

  const searchPlaces = async (query: string) => {
    if (!query.trim()) {
      setSearchSuggestions([])
      return
    }

    setIsSearching(true)
    try {
      console.log("[v0] Searching for places:", query)
      const response = await fetch(`/api/geocode?query=${encodeURIComponent(query)}`)

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Search results:", data)

        if (data.success && data.coordinates) {
          // Single result format
          const result = {
            name: query,
            address: data.address,
            latitude: data.coordinates.lat,
            longitude: data.coordinates.lng,
          }
          setSearchSuggestions([result])
        } else if (data.results && Array.isArray(data.results)) {
          // Multiple results format
          setSearchSuggestions(data.results)
        } else {
          console.log("[v0] No results found for search")
          setSearchSuggestions([])
        }
      } else {
        const errorData = await response.json()
        console.error("[v0] Search API error:", errorData)
        setSearchSuggestions([])
      }
    } catch (error) {
      console.error("[v0] Search error:", error)
      setSearchSuggestions([])
    }
    setIsSearching(false)
  }

  const handleSearchSelect = async (place: any) => {
    const location = {
      lat: place.latitude,
      lng: place.longitude,
    }
    setSelectedLocation(location)
    setCurrentLocation(location)
    setAddress(place.address)
    setSearchQuery("")
    setSearchSuggestions([])
  }

  const handleSaveLocation = async () => {
    if (!selectedLocation) {
      toast({
        title: "No Location Selected",
        description: "Please select a location first.",
        variant: "destructive",
      })
      return
    }

    if (!locationName.trim()) {
      toast({
        title: "Location Name Required",
        description: "Please enter a name for this location.",
        variant: "destructive",
      })
      return
    }

    try {
      const token = localStorage.getItem("token")

      if (token) {
        // Save to database if user is authenticated
        const response = await fetch("/api/user/locations", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: locationName.trim(),
            address: address,
            latitude: selectedLocation.lat,
            longitude: selectedLocation.lng,
            source: "manual",
            accuracy: "high",
          }),
        })

        if (response.ok) {
          const data = await response.json()
          console.log("[v0] Location saved to database:", data)

          toast({
            title: "Location Saved",
            description: `${locationName} has been saved to your account.`,
          })
        } else {
          console.error("[v0] Failed to save location to database")
          toast({
            title: "Save Failed",
            description: "Could not save to your account, but location is selected.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("[v0] Error saving location:", error)
    }

    const location: Location = {
      name: locationName.trim(),
      address: address,
      latitude: selectedLocation.lat,
      longitude: selectedLocation.lng,
    }

    onLocationSelect(location)
    onClose()
  }

  const openLocationPicker = () => {
    const currentUrl = window.location.pathname + window.location.search
    const params = new URLSearchParams({
      returnUrl: currentUrl,
      ...(locationName && { locationName: encodeURIComponent(locationName) }),
    })

    router.push(`/select-location?${params.toString()}`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-500" />
            Pin Your Exact Location
          </DialogTitle>
          <DialogDescription>
            Search for places, use your current location, or select your exact location on an interactive map.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Location Name Input */}
          <div className="space-y-2">
            <Label htmlFor="locationName">Location Name *</Label>
            <Input
              id="locationName"
              placeholder="e.g., My Home, Office, etc."
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
            />
          </div>

          {/* Search Bar */}
          <div className="space-y-2">
            <Label>Search for places</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search for restaurants, landmarks, addresses..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  searchPlaces(e.target.value)
                }}
                className="pl-10"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin" />
              )}
            </div>

            {/* Search Suggestions */}
            {searchSuggestions.length > 0 && (
              <div className="border rounded-lg bg-white shadow-lg max-h-40 overflow-y-auto">
                {searchSuggestions.map((place, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearchSelect(place)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b last:border-b-0 flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-medium">{place.name}</div>
                      <div className="text-sm text-gray-500">{place.address}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Current Location Button */}
          <div className="flex items-center gap-2">
            <Button onClick={getCurrentLocation} disabled={isLoadingLocation} variant="outline" size="sm">
              {isLoadingLocation ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Navigation className="w-4 h-4 mr-2" />
              )}
              Use Current Location
            </Button>
            <span className="text-sm text-gray-500">Click to detect your current location</span>
          </div>

          <div className="space-y-2">
            <Label>Select location on map</Label>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gradient-to-br from-blue-50 to-green-50">
              <MapPin className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Interactive Map Selection</h3>
              <p className="text-sm text-gray-600 mb-4">
                Use our full-screen map interface to precisely select your location
              </p>
              <Button onClick={openLocationPicker} className="bg-blue-600 hover:bg-blue-700" size="lg">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Map Selector
              </Button>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">How to use:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Search for places in the search bar above</li>
                <li>• Click "Use Current Location" to detect your position</li>
                <li>• Click "Open Map Selector" for precise map-based selection</li>
                <li>• The map selector allows clicking, dragging, and searching</li>
              </ul>
            </div>
          </div>

          {/* Selected Address Display */}
          {address && (
            <div className="space-y-2">
              <Label>Selected Address</Label>
              <div className="p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{address}</span>
                </div>
                {selectedLocation && (
                  <div className="text-xs text-gray-500 mt-1">
                    Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveLocation}
              disabled={!selectedLocation || !locationName.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Save Location
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
