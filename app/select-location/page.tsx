"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, MapPin, Copy, Crosshair, Trash2 } from "lucide-react"

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

export default function SelectLocationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mapRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const [coordinates, setCoordinates] = useState({ lat: "", lng: "" })
  const [locationName, setLocationName] = useState("")
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [map, setMap] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)
  const [autocomplete, setAutocomplete] = useState<any>(null)

  const returnUrl = searchParams.get("returnUrl") || "/"

  useEffect(() => {
    // Get location name from URL params if provided
    const name = searchParams.get("locationName")
    if (name) {
      setLocationName(decodeURIComponent(name))
    }
  }, [searchParams])

  useEffect(() => {
    // Load Google Maps API
    const loadGoogleMaps = () => {
      if (window.google) {
        initializeMap()
        return
      }

      window.initMap = initializeMap

      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places&callback=initMap`
      script.async = true
      script.defer = true
      script.onerror = () => {
        console.error("Failed to load Google Maps API")
        setIsMapLoaded(false)
      }
      document.head.appendChild(script)
    }

    loadGoogleMaps()
  }, [])

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return

    const defaultCenter = { lat: 13.0827, lng: 80.2707 } // Chennai, Tamil Nadu
    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 6,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    })

    setMap(mapInstance)
    setIsMapLoaded(true)

    // Click to drop/move marker
    mapInstance.addListener("click", (e: any) => {
      placeOrMoveMarker(e.latLng)
    })

    // Setup autocomplete if search input exists
    if (searchInputRef.current) {
      const autocompleteInstance = new window.google.maps.places.Autocomplete(searchInputRef.current, {
        fields: ["geometry", "name", "formatted_address"],
        componentRestrictions: { country: "in" },
      })

      autocompleteInstance.addListener("place_changed", () => {
        const place = autocompleteInstance.getPlace()
        console.log("[v0] Place selected:", place)

        if (!place.geometry || !place.geometry.location) {
          console.log("[v0] No geometry found for place")
          return
        }

        const location = place.geometry.location
        console.log("[v0] Setting location to:", location.lat(), location.lng())

        mapInstance.setZoom(15)
        placeOrMoveMarker(location)
      })

      setAutocomplete(autocompleteInstance)
    }
  }

  const setLatLngFields = (latLng: any) => {
    setCoordinates({
      lat: latLng.lat().toFixed(7),
      lng: latLng.lng().toFixed(7),
    })
  }

  const placeOrMoveMarker = (latLng: any) => {
    if (!marker) {
      const newMarker = new window.google.maps.Marker({
        position: latLng,
        map,
        draggable: true,
        animation: window.google.maps.Animation.DROP,
      })

      newMarker.addListener("dragend", () => {
        setLatLngFields(newMarker.getPosition())
      })

      setMarker(newMarker)
    } else {
      marker.setPosition(latLng)
    }

    setLatLngFields(latLng)
    map.panTo(latLng)
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latLng = new window.google.maps.LatLng(pos.coords.latitude, pos.coords.longitude)
        if (map) {
          map.setZoom(16)
          placeOrMoveMarker(latLng)
        }
      },
      (err) => alert("Failed to get location: " + err.message),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const clearMarker = () => {
    if (marker) {
      marker.setMap(null)
      setMarker(null)
    }
    setCoordinates({ lat: "", lng: "" })
  }

  const copyCoordinates = async () => {
    if (!coordinates.lat || !coordinates.lng) {
      alert("Pick a location first.")
      return
    }

    try {
      await navigator.clipboard.writeText(`${coordinates.lat}, ${coordinates.lng}`)
      alert(`Copied: ${coordinates.lat}, ${coordinates.lng}`)
    } catch (err) {
      alert(`Could not copy. Coordinates: ${coordinates.lat}, ${coordinates.lng}`)
    }
  }

  const saveLocation = async () => {
    if (!coordinates.lat || !coordinates.lng || !locationName.trim()) {
      alert("Please provide a location name and select a position on the map.")
      return
    }

    // Create location object
    const location = {
      name: locationName.trim(),
      lat: Number.parseFloat(coordinates.lat),
      lng: Number.parseFloat(coordinates.lng),
      address: `${coordinates.lat}, ${coordinates.lng}`,
    }

    const token = localStorage.getItem("token")
    if (token) {
      try {
        const response = await fetch("/api/user/locations", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: location.name,
            address: location.address,
            latitude: location.lat,
            longitude: location.lng,
            source: "map_selection",
            accuracy: "high",
          }),
        })

        if (response.ok) {
          console.log("[v0] Location saved to database successfully")
        } else {
          console.log("[v0] Failed to save to database, using localStorage fallback")
        }
      } catch (error) {
        console.error("[v0] Error saving to database:", error)
      }
    }

    // Store in localStorage and redirect back
    localStorage.setItem("selectedLocation", JSON.stringify(location))
    router.push(returnUrl)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(returnUrl)}
            className="text-white hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">Pick a location on the map</h1>
        </div>
      </header>

      <div className="container mx-auto p-3 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-3 items-start">
        {/* Control Panel */}
        <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm">
          <div className="space-y-3">
            {/* Location Name */}
            <div>
              <Label htmlFor="location-name" className="text-xs text-gray-600">
                Location Name *
              </Label>
              <Input
                id="location-name"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g., My Home, Office, etc."
                className="mt-1"
              />
            </div>

            {/* Search */}
            <div>
              <Label htmlFor="search-input" className="text-xs text-gray-600">
                Search place (Autocomplete)
              </Label>
              <Input
                ref={searchInputRef}
                id="search-input"
                placeholder="Start typing a place, area, address…"
                className="mt-1"
              />
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="lat" className="text-xs text-gray-600">
                  Latitude
                </Label>
                <Input id="lat" value={coordinates.lat} placeholder="Latitude" readOnly className="mt-1 bg-gray-50" />
              </div>
              <div>
                <Label htmlFor="lng" className="text-xs text-gray-600">
                  Longitude
                </Label>
                <Input id="lng" value={coordinates.lng} placeholder="Longitude" readOnly className="mt-1 bg-gray-50" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyCoordinates}
                className="flex items-center gap-1 bg-transparent"
              >
                <Copy className="h-3 w-3" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={useCurrentLocation}
                className="flex items-center gap-1 bg-transparent"
              >
                <Crosshair className="h-3 w-3" />
                My Location
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearMarker}
                className="flex items-center gap-1 bg-transparent"
              >
                <Trash2 className="h-3 w-3" />
                Clear
              </Button>
            </div>

            {/* Save Button */}
            <Button
              onClick={saveLocation}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={!coordinates.lat || !coordinates.lng || !locationName.trim()}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Save Location
            </Button>

            <p className="text-xs text-gray-500">
              Tip: Click anywhere on the map to drop a marker and capture coordinates. Or use the search box to jump to
              a place.
            </p>
          </div>
        </div>

        {/* Map */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {!isMapLoaded && (
            <div className="h-[70vh] lg:h-[78vh] flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          )}
          <div ref={mapRef} className={`w-full h-[70vh] lg:h-[78vh] ${!isMapLoaded ? "hidden" : ""}`} />
        </div>
      </div>

      <footer className="text-xs text-gray-500 p-3 text-center">
        Works with Google Maps JavaScript API + Places. Click on the map to select a location.
      </footer>
    </div>
  )
}
