import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("query") || searchParams.get("address")

    if (!address) {
      return NextResponse.json({ error: "Query or address parameter is required" }, { status: 400 })
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
    console.log("[v0] Geocoding API - API key present:", !!apiKey)

    if (!apiKey) {
      console.error("[v0] Google Maps API key not configured")
      return NextResponse.json(
        {
          error:
            "Google Maps API key not configured. Please set NEXT_PUBLIC_GOOGLE_PLACES_API_KEY environment variable.",
          success: false,
        },
        { status: 500 },
      )
    }

    console.log(`🔍 Geocoding request for: "${address}"`)

    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&region=in&key=${apiKey}`
    console.log("[v0] Making request to Google Geocoding API with India region bias...")

    const response = await fetch(geocodeUrl)
    const data = await response.json()

    console.log(`📍 Geocoding response status: ${data.status}`)

    if (data.status === "OK" && data.results.length > 0) {
      const result = data.results[0]
      const coordinates = {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      }

      console.log(`✅ Location found: ${result.formatted_address} (${coordinates.lat}, ${coordinates.lng})`)

      return NextResponse.json({
        success: true,
        coordinates,
        address: result.formatted_address,
        place_id: result.place_id,
        types: result.types,
      })
    } else {
      console.log(`❌ Geocoding failed: ${data.status} - ${data.error_message || "No results found"}`)

      let errorMessage = "Location not found"
      let statusCode = 404

      if (data.status === "REQUEST_DENIED") {
        errorMessage = "API request denied. Check API key permissions and billing."
        statusCode = 403
      } else if (data.status === "OVER_QUERY_LIMIT") {
        errorMessage = "API quota exceeded. Please try again later."
        statusCode = 429
      } else if (data.status === "INVALID_REQUEST") {
        errorMessage = "Invalid request. Please check the address format."
        statusCode = 400
      }

      return NextResponse.json(
        {
          success: false,
          error: data.error_message || errorMessage,
          status: data.status,
        },
        { status: statusCode },
      )
    }
  } catch (error) {
    console.error("❌ Geocoding error:", error)
    return NextResponse.json(
      {
        error: "Failed to geocode address. Please check your internet connection and try again.",
        success: false,
      },
      { status: 500 },
    )
  }
}
