import { type NextRequest, NextResponse } from "next/server"

// Enhanced Indian city database with more comprehensive coverage
const INDIAN_CITIES = {
  // Major metros
  mumbai: { lat: 19.076, lng: 72.8777, state: "Maharashtra" },
  delhi: { lat: 28.7041, lng: 77.1025, state: "Delhi" },
  bangalore: { lat: 12.9716, lng: 77.5946, state: "Karnataka" },
  bengaluru: { lat: 12.9716, lng: 77.5946, state: "Karnataka" },
  hyderabad: { lat: 17.385, lng: 78.4867, state: "Telangana" },
  chennai: { lat: 13.0827, lng: 80.2707, state: "Tamil Nadu" },
  kolkata: { lat: 22.5726, lng: 88.3639, state: "West Bengal" },
  pune: { lat: 18.5204, lng: 73.8567, state: "Maharashtra" },

  // Tamil Nadu cities
  coimbatore: { lat: 11.0168, lng: 76.9558, state: "Tamil Nadu" },
  gandhipuram: { lat: 11.0168, lng: 76.9558, state: "Tamil Nadu" },
  madurai: { lat: 9.9252, lng: 78.1198, state: "Tamil Nadu" },
  salem: { lat: 11.6643, lng: 78.146, state: "Tamil Nadu" },
  tiruchirappalli: { lat: 10.7905, lng: 78.7047, state: "Tamil Nadu" },
  tirunelveli: { lat: 8.7139, lng: 77.7567, state: "Tamil Nadu" },
  vellore: { lat: 12.9165, lng: 79.1325, state: "Tamil Nadu" },

  // Other major cities
  ahmedabad: { lat: 23.0225, lng: 72.5714, state: "Gujarat" },
  surat: { lat: 21.1702, lng: 72.8311, state: "Gujarat" },
  jaipur: { lat: 26.9124, lng: 75.7873, state: "Rajasthan" },
  lucknow: { lat: 26.8467, lng: 80.9462, state: "Uttar Pradesh" },
  kanpur: { lat: 26.4499, lng: 80.3319, state: "Uttar Pradesh" },
  nagpur: { lat: 21.1458, lng: 79.0882, state: "Maharashtra" },
  indore: { lat: 22.7196, lng: 75.8577, state: "Madhya Pradesh" },
  thane: { lat: 19.2183, lng: 72.9781, state: "Maharashtra" },
  bhopal: { lat: 23.2599, lng: 77.4126, state: "Madhya Pradesh" },
  visakhapatnam: { lat: 17.6868, lng: 83.2185, state: "Andhra Pradesh" },
  pimpri: { lat: 18.6298, lng: 73.8131, state: "Maharashtra" },
  patna: { lat: 25.5941, lng: 85.1376, state: "Bihar" },
  vadodara: { lat: 22.3072, lng: 73.1812, state: "Gujarat" },
  ludhiana: { lat: 30.901, lng: 75.8573, state: "Punjab" },
  agra: { lat: 27.1767, lng: 78.0081, state: "Uttar Pradesh" },
  nashik: { lat: 19.9975, lng: 73.7898, state: "Maharashtra" },
  faridabad: { lat: 28.4089, lng: 77.3178, state: "Haryana" },
  meerut: { lat: 28.9845, lng: 77.7064, state: "Uttar Pradesh" },
  rajkot: { lat: 22.3039, lng: 70.8022, state: "Gujarat" },
  kalyan: { lat: 19.2437, lng: 73.1355, state: "Maharashtra" },
  vasai: { lat: 19.4912, lng: 72.8054, state: "Maharashtra" },
  varanasi: { lat: 25.3176, lng: 82.9739, state: "Uttar Pradesh" },
  srinagar: { lat: 34.0837, lng: 74.7973, state: "Jammu and Kashmir" },
  aurangabad: { lat: 19.8762, lng: 75.3433, state: "Maharashtra" },
  dhanbad: { lat: 23.7957, lng: 86.4304, state: "Jharkhand" },
  amritsar: { lat: 31.634, lng: 74.8723, state: "Punjab" },
  "navi mumbai": { lat: 19.033, lng: 73.0297, state: "Maharashtra" },
  allahabad: { lat: 25.4358, lng: 81.8463, state: "Uttar Pradesh" },
  prayagraj: { lat: 25.4358, lng: 81.8463, state: "Uttar Pradesh" },
  ranchi: { lat: 23.3441, lng: 85.3096, state: "Jharkhand" },
  howrah: { lat: 22.5958, lng: 88.2636, state: "West Bengal" },
  jabalpur: { lat: 23.1815, lng: 79.9864, state: "Madhya Pradesh" },
  gwalior: { lat: 26.2183, lng: 78.1828, state: "Madhya Pradesh" },
  vijayawada: { lat: 16.5062, lng: 80.648, state: "Andhra Pradesh" },
  jodhpur: { lat: 26.2389, lng: 73.0243, state: "Rajasthan" },
  raipur: { lat: 21.2514, lng: 81.6296, state: "Chhattisgarh" },
  kota: { lat: 25.2138, lng: 75.8648, state: "Rajasthan" },
  guwahati: { lat: 26.1445, lng: 91.7362, state: "Assam" },
  chandigarh: { lat: 30.7333, lng: 76.7794, state: "Chandigarh" },
  solapur: { lat: 17.6599, lng: 75.9064, state: "Maharashtra" },
  hubli: { lat: 15.3647, lng: 75.124, state: "Karnataka" },
  dharwad: { lat: 15.4589, lng: 75.0078, state: "Karnataka" },
  bareilly: { lat: 28.367, lng: 79.4304, state: "Uttar Pradesh" },
  moradabad: { lat: 28.8386, lng: 78.7733, state: "Uttar Pradesh" },
  mysore: { lat: 12.2958, lng: 76.6394, state: "Karnataka" },
  mysuru: { lat: 12.2958, lng: 76.6394, state: "Karnataka" },
  gurgaon: { lat: 28.4595, lng: 77.0266, state: "Haryana" },
  gurugram: { lat: 28.4595, lng: 77.0266, state: "Haryana" },
  aligarh: { lat: 27.8974, lng: 78.088, state: "Uttar Pradesh" },
  jalandhar: { lat: 31.326, lng: 75.5762, state: "Punjab" },
  bhubaneswar: { lat: 20.2961, lng: 85.8245, state: "Odisha" },
  warangal: { lat: 17.9689, lng: 79.5941, state: "Telangana" },
  mira: { lat: 19.2952, lng: 72.8694, state: "Maharashtra" },
  bhiwandi: { lat: 19.3002, lng: 73.0635, state: "Maharashtra" },
  saharanpur: { lat: 29.968, lng: 77.5552, state: "Uttar Pradesh" },
  gorakhpur: { lat: 26.7606, lng: 83.3732, state: "Uttar Pradesh" },
  bikaner: { lat: 28.0229, lng: 73.3119, state: "Rajasthan" },
  amravati: { lat: 20.9374, lng: 77.7796, state: "Maharashtra" },
  noida: { lat: 28.5355, lng: 77.391, state: "Uttar Pradesh" },
  jamshedpur: { lat: 22.8046, lng: 86.2029, state: "Jharkhand" },
  bhilai: { lat: 21.1938, lng: 81.3509, state: "Chhattisgarh" },
  cuttack: { lat: 20.4625, lng: 85.8828, state: "Odisha" },
  firozabad: { lat: 27.1592, lng: 78.3957, state: "Uttar Pradesh" },
  kochi: { lat: 9.9312, lng: 76.2673, state: "Kerala" },
  cochin: { lat: 9.9312, lng: 76.2673, state: "Kerala" },
  bhavnagar: { lat: 21.7645, lng: 72.1519, state: "Gujarat" },
  dehradun: { lat: 30.3165, lng: 78.0322, state: "Uttarakhand" },
  durgapur: { lat: 23.5204, lng: 87.3119, state: "West Bengal" },
  asansol: { lat: 23.6739, lng: 86.9524, state: "West Bengal" },
  nanded: { lat: 19.1383, lng: 77.321, state: "Maharashtra" },
  kolhapur: { lat: 16.705, lng: 74.2433, state: "Maharashtra" },
  ajmer: { lat: 26.4499, lng: 74.6399, state: "Rajasthan" },
  akola: { lat: 20.7002, lng: 77.0082, state: "Maharashtra" },
  gulbarga: { lat: 17.3297, lng: 76.8343, state: "Karnataka" },
  jamnagar: { lat: 22.4707, lng: 70.0577, state: "Gujarat" },
  ujjain: { lat: 23.1765, lng: 75.7885, state: "Madhya Pradesh" },
  loni: { lat: 28.7333, lng: 77.2833, state: "Uttar Pradesh" },
  siliguri: { lat: 26.7271, lng: 88.3953, state: "West Bengal" },
  jhansi: { lat: 25.4484, lng: 78.5685, state: "Uttar Pradesh" },
  ulhasnagar: { lat: 19.2215, lng: 73.1645, state: "Maharashtra" },
  jammu: { lat: 32.7266, lng: 74.857, state: "Jammu and Kashmir" },
  sangli: { lat: 20.5579, lng: 74.5287, state: "Maharashtra" },
  mangalore: { lat: 12.9141, lng: 74.856, state: "Karnataka" },
  erode: { lat: 11.341, lng: 77.7172, state: "Tamil Nadu" },
  belgaum: { lat: 15.8497, lng: 74.4977, state: "Karnataka" },
  ambattur: { lat: 13.1143, lng: 80.1548, state: "Tamil Nadu" },
  maheshtala: { lat: 22.5049, lng: 88.2482, state: "West Bengal" },
  gaya: { lat: 24.7914, lng: 85.0002, state: "Bihar" },
  jalgaon: { lat: 21.0077, lng: 75.5626, state: "Maharashtra" },
  udaipur: { lat: 26.2389, lng: 73.0243, state: "Rajasthan" },
}

function isInIndia(lat: number, lng: number): boolean {
  // India's approximate bounding box
  return lat >= 6.0 && lat <= 37.6 && lng >= 68.7 && lng <= 97.25
}

function findNearestIndianCity(lat: number, lng: number) {
  let nearestCity = null
  let minDistance = Number.POSITIVE_INFINITY

  for (const [cityName, cityData] of Object.entries(INDIAN_CITIES)) {
    const distance = Math.sqrt(Math.pow(lat - cityData.lat, 2) + Math.pow(lng - cityData.lng, 2))

    if (distance < minDistance) {
      minDistance = distance
      nearestCity = { name: cityName, ...cityData, distance }
    }
  }

  return nearestCity
}

function formatIndianAddress(lat: number, lng: number, nearestCity: any): string {
  if (nearestCity && nearestCity.distance < 0.1) {
    // Very close to a known city
    return `${nearestCity.name.charAt(0).toUpperCase() + nearestCity.name.slice(1)}, ${nearestCity.state}, India`
  } else if (nearestCity && nearestCity.distance < 0.5) {
    // Reasonably close
    return `Near ${nearestCity.name.charAt(0).toUpperCase() + nearestCity.name.slice(1)}, ${nearestCity.state}, India`
  } else {
    // Generic Indian location
    const regions = [
      { name: "Northern India", latMin: 28, latMax: 37.6 },
      { name: "Western India", latMin: 15, latMax: 28, lngMin: 68.7, lngMax: 77 },
      { name: "Southern India", latMin: 6, latMax: 15 },
      { name: "Eastern India", latMin: 20, latMax: 28, lngMin: 85, lngMax: 97.25 },
      { name: "Central India", latMin: 15, latMax: 28, lngMin: 77, lngMax: 85 },
    ]

    for (const region of regions) {
      if (lat >= region.latMin && lat <= region.latMax) {
        if (!region.lngMin || (lng >= region.lngMin && lng <= region.lngMax)) {
          return `${region.name} (${lat.toFixed(4)}, ${lng.toFixed(4)})`
        }
      }
    }

    return `India (${lat.toFixed(4)}, ${lng.toFixed(4)})`
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = Number.parseFloat(searchParams.get("lat") || "0")
    const lng = Number.parseFloat(searchParams.get("lng") || "0")
    const precision = searchParams.get("precision") || "standard"

    if (!lat || !lng) {
      return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
    }

    console.log(`🔍 Reverse geocoding: ${lat}, ${lng} (precision: ${precision})`)

    // Check if coordinates are in India
    const inIndia = isInIndia(lat, lng)

    if (inIndia) {
      console.log("📍 Location detected in India")

      // Find nearest Indian city
      const nearestCity = findNearestIndianCity(lat, lng)
      const formattedAddress = formatIndianAddress(lat, lng, nearestCity)

      console.log(`🏙️ Formatted address: ${formattedAddress}`)

      return NextResponse.json({
        success: true,
        address: formattedAddress,
        formatted_address: formattedAddress,
        country: "India",
        region: nearestCity?.state || "India",
        city: nearestCity?.name || "Unknown",
        coordinates: { lat, lng },
        accuracy: nearestCity?.distance < 0.1 ? "high" : "medium",
      })
    }

    // For non-Indian locations, try Google Geocoding API if available
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Google Maps API key not configured",
        },
        { status: 500 },
      )
    }

    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`)

    const data = await response.json()

    if (data.status === "OK" && data.results.length > 0) {
      const result = data.results[0]
      return NextResponse.json({
        success: true,
        address: result.formatted_address,
        formatted_address: result.formatted_address,
        coordinates: {
          lat: Number.parseFloat(lat.toString()),
          lng: Number.parseFloat(lng.toString()),
        },
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Address not found",
        },
        { status: 404 },
      )
    }
  } catch (error) {
    console.error("Reverse geocoding error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to reverse geocode location",
      },
      { status: 500 },
    )
  }
}
