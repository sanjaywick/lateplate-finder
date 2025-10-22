"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, ChevronDown, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import LocationMapModal from "./location-map-modal"
import { useToast } from "@/hooks/use-toast"

interface Location {
  _id?: string
  name: string
  address: string
  latitude: number
  longitude: number
  isDefault?: boolean
}

export function LocationSelector() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [showMapModal, setShowMapModal] = useState(false)
  const [savedLocations, setSavedLocations] = useState<Location[]>([])
  const [locationHistory, setLocationHistory] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Load saved locations from localStorage
    const saved = localStorage.getItem("savedLocations")
    if (saved) {
      setSavedLocations(JSON.parse(saved))
    }

    // Load current location from localStorage
    const current = localStorage.getItem("currentLocation")
    if (current) {
      setSelectedLocation(JSON.parse(current))
    }

    loadSavedLocations()
    loadLocationHistory()
  }, [])

  const loadSavedLocations = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      setLoading(true)
      const response = await fetch("/api/user/locations", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Loaded saved locations:", data.locations)
        setSavedLocations(data.locations || [])

        // Update localStorage cache
        localStorage.setItem("savedLocations", JSON.stringify(data.locations || []))
      }
    } catch (error) {
      console.error("[v0] Error loading saved locations:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadLocationHistory = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const response = await fetch("/api/user/location-history", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Loaded location history:", data.history)
        setLocationHistory(data.history || [])
      }
    } catch (error) {
      console.error("[v0] Error loading location history:", error)
    }
  }

  const handleLocationSelect = async (location: Location) => {
    setSelectedLocation(location)
    localStorage.setItem("currentLocation", JSON.stringify(location))

    console.log("[v0] LocationSelector dispatching location change:", {
      lat: location.latitude,
      lng: location.longitude,
      name: location.name,
      address: location.address,
    })

    // Save to location history automatically
    await saveToLocationHistory(location)

    // Trigger location change event for other components
    window.dispatchEvent(
      new CustomEvent("locationChanged", {
        detail: {
          lat: location.latitude,
          lng: location.longitude,
          name: location.name,
          address: location.address,
        },
      }),
    )
  }

  const saveToLocationHistory = async (location: Location) => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const response = await fetch("/api/user/location-history", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: location.address,
          latitude: location.latitude,
          longitude: location.longitude,
          source: "manual",
        }),
      })

      if (response.ok) {
        // Refresh location history
        loadLocationHistory()
      }
    } catch (error) {
      console.error("[v0] Error saving to location history:", error)
    }
  }

  const handleLocationSave = (location: Location) => {
    loadSavedLocations()
    setSelectedLocation(location)
    localStorage.setItem("currentLocation", JSON.stringify(location))
    setShowMapModal(false)
  }

  const deleteLocation = async (locationId: string) => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const response = await fetch(`/api/user/locations/${locationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        toast({
          title: "Location Deleted",
          description: "Location has been removed from your saved locations.",
        })
        loadSavedLocations() // Refresh the list
      } else {
        toast({
          title: "Delete Failed",
          description: "Could not delete the location.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error deleting location:", error)
      toast({
        title: "Error",
        description: "An error occurred while deleting the location.",
        variant: "destructive",
      })
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords

          try {
            // Reverse geocode to get address
            const response = await fetch(`/api/geocode/reverse?lat=${latitude}&lng=${longitude}`)
            const data = await response.json()

            if (data.success) {
              const location: Location = {
                name: "Current Location",
                address: data.address,
                latitude: latitude,
                longitude: longitude,
              }
              handleLocationSelect(location)
            }
          } catch (error) {
            console.error("Error getting current location:", error)
            // Fallback to coordinates only
            const location: Location = {
              name: "Current Location",
              address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              latitude: latitude,
              longitude: longitude,
            }
            handleLocationSelect(location)
          }
        },
        (error) => {
          console.error("Geolocation error:", error)
          setShowMapModal(true)
        },
      )
    } else {
      setShowMapModal(true)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between bg-transparent">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{selectedLocation ? selectedLocation.name : "Select location"}</span>
            </div>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80">
          <div className="p-4 space-y-3">
            <Button onClick={getCurrentLocation} variant="outline" className="w-full justify-start bg-transparent">
              <MapPin className="w-4 h-4 mr-2" />
              Use Current Location
            </Button>

            <Button onClick={() => setShowMapModal(true)} variant="outline" className="w-full justify-start">
              <MapPin className="w-4 h-4 mr-2" />
              Pin Location on Map
            </Button>

            {savedLocations.length > 0 && (
              <div className="border-t pt-3">
                <h4 className="text-sm font-medium mb-2">Saved Locations ({savedLocations.length})</h4>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {savedLocations.map((location) => (
                    <div
                      key={location._id || location.name}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                    >
                      <Button
                        onClick={() => handleLocationSelect(location)}
                        variant="ghost"
                        className="flex-1 justify-start text-left h-auto p-0"
                      >
                        <div>
                          <div className="font-medium">{location.name}</div>
                          <div className="text-xs text-gray-500 truncate">{location.address}</div>
                        </div>
                      </Button>
                      {location._id && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteLocation(location._id!)
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {locationHistory.length > 0 && (
              <div className="border-t pt-3">
                <h4 className="text-sm font-medium mb-2">Recent Searches ({locationHistory.length})</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {locationHistory.map((location, index) => (
                    <Button
                      key={`${location.address}-${index}`}
                      onClick={() => handleLocationSelect(location)}
                      variant="ghost"
                      className="w-full justify-start text-left h-auto p-2"
                    >
                      <div>
                        <div className="text-xs text-gray-500 truncate">{location.address}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {loading && <div className="text-center text-sm text-gray-500">Loading saved locations...</div>}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <LocationMapModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        onLocationSelect={handleLocationSave}
      />
    </>
  )
}
