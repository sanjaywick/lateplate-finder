import { type NextRequest, NextResponse } from "next/server";

const GOOGLE_PLACES_API_KEY =
  process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

const FALLBACK_IMAGE = "https://via.placeholder.com/400x300?text=No+Image+Available";

const getGooglePhotoUrl = (photoReference: string, apiKey: string) => {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${apiKey}`;
};

const generateNightRestaurants = (lat: number, lng: number, radius: number) => {
  const restaurants = [
    {
      id: "night-rest-1",
      placeId: "ChIJ1234567890",
      name: "Midnight Biryani House",
      cuisine: "Indian",
      rating: 4.3,
      distance: (Math.random() * 2 + 0.3).toFixed(1),
      address: "MG Road, Near City Center",
      phone: "+91 98765 43210",
      hours: "Open 24 hours",
      isOpen: true,
      is24Hours: true,
      deliveryTime: "25-35 min",
      priceLevel: 2,
      photos: ["https://images.unsplash.com/photo-1563379091339-03246963d51a?w=400&h=300&fit=crop"],
      specialties: ["Hyderabadi Biryani", "Kebabs", "Late Night Specials"],
      reviews: 1247,
      hasDelivery: false,
      hasTakeout: true,
      nightSpecial: true,
      openLate: "2:00 AM",
      menuHighlights: ["Chicken Biryani ₹280", "Mutton Kebab ₹320", "Veg Biryani ₹220"],
    },
    {
      id: "night-rest-2",
      placeId: "ChIJ2345678901",
      name: "24/7 Dosa Corner",
      cuisine: "South Indian",
      rating: 4.1,
      distance: (Math.random() * 3 + 0.5).toFixed(1),
      address: "Gandhi Street, Old City",
      phone: "+91 87654 32109",
      hours: "Open 24 hours",
      isOpen: true,
      is24Hours: true,
      deliveryTime: "20-30 min",
      priceLevel: 1,
      photos: ["https://images.unsplash.com/photo-1630383249896-03246963d51a?w=400&h=300&fit=crop"],
      specialties: ["Masala Dosa", "Filter Coffee", "Night Tiffin"],
      reviews: 892,
      hasDelivery: false,
      hasTakeout: true,
      nightSpecial: true,
      openLate: "24 hours",
      menuHighlights: ["Masala Dosa ₹80", "Idli Sambar ₹60", "Filter Coffee ₹25"],
    },
    {
      id: "night-rest-3",
      placeId: "ChIJ3456789012",
      name: "Night Owl Chinese",
      cuisine: "Chinese",
      rating: 4.0,
      distance: (Math.random() * 2.5 + 0.8).toFixed(1),
      address: "Commercial Street, Downtown",
      phone: "+91 76543 21098",
      hours: "Open until 3:00 AM",
      isOpen: true,
      is24Hours: false,
      deliveryTime: "30-40 min",
      priceLevel: 2,
      photos: ["https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=400&h=300&fit=crop"],
      specialties: ["Hakka Noodles", "Manchurian", "Fried Rice"],
      reviews: 654,
      hasDelivery: false,
      hasTakeout: true,
      nightSpecial: true,
      openLate: "3:00 AM",
      menuHighlights: ["Chicken Hakka Noodles ₹180", "Veg Manchurian ₹140", "Fried Rice ₹160"],
    },
    {
      id: "night-rest-4",
      placeId: "ChIJ4567890123",
      name: "Late Night Paratha Junction",
      cuisine: "North Indian",
      rating: 4.4,
      distance: (Math.random() * 1.8 + 0.4).toFixed(1),
      address: "Station Road, Near Railway Station",
      phone: "+91 65432 10987",
      hours: "10 PM - 6 AM",
      isOpen: true,
      is24Hours: false,
      deliveryTime: "15-25 min",
      priceLevel: 1,
      photos: ["https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop"],
      specialties: ["Stuffed Parathas", "Lassi", "Chole Bhature"],
      reviews: 1156,
      hasDelivery: false,
      hasTakeout: true,
      nightSpecial: true,
      openLate: "6:00 AM",
      menuHighlights: ["Aloo Paratha ₹60", "Paneer Paratha ₹80", "Chole Bhature ₹90"],
    },
    {
      id: "night-rest-5",
      placeId: "ChIJ5678901234",
      name: "Midnight Momos Hub",
      cuisine: "Tibetan",
      rating: 4.2,
      distance: (Math.random() * 2.2 + 0.6).toFixed(1),
      address: "College Road, Student Area",
      phone: "+91 54321 09876",
      hours: "Open until 2:30 AM",
      isOpen: true,
      is24Hours: false,
      deliveryTime: "20-30 min",
      priceLevel: 1,
      photos: ["https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400&h=300&fit=crop"],
      specialties: ["Steamed Momos", "Fried Momos", "Thukpa"],
      reviews: 743,
      hasDelivery: false,
      hasTakeout: true,
      nightSpecial: true,
      openLate: "2:30 AM",
      menuHighlights: ["Chicken Momos ₹120", "Veg Momos ₹100", "Thukpa ₹140"],
    },
    {
      id: "night-rest-6",
      placeId: "ChIJ6789012345",
      name: "All Night Cafe & Grill",
      cuisine: "Continental",
      rating: 3.9,
      distance: (Math.random() * 3.5 + 1.0).toFixed(1),
      address: "IT Park, Tech Hub",
      phone: "+91 43210 98765",
      hours: "Open 24 hours",
      isOpen: true,
      is24Hours: true,
      deliveryTime: "35-45 min",
      priceLevel: 3,
      photos: ["https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop"],
      specialties: ["Grilled Sandwiches", "Pasta", "Coffee"],
      reviews: 567,
      hasDelivery: false,
      hasTakeout: true,
      nightSpecial: true,
      openLate: "24 hours",
      menuHighlights: ["Grilled Chicken Sandwich ₹220", "Pasta Arrabiata ₹280", "Cappuccino ₹120"],
    },
    {
      id: "night-rest-7",
      placeId: "ChIJ7890123456",
      name: "Night Street Food Corner",
      cuisine: "Street Food",
      rating: 4.5,
      distance: (Math.random() * 1.5 + 0.3).toFixed(1),
      address: "Main Market, Food Street",
      phone: "+91 32109 87654",
      hours: "8 PM - 4 AM",
      isOpen: true,
      is24Hours: false,
      deliveryTime: "15-20 min",
      priceLevel: 1,
      photos: ["https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop"],
      specialties: ["Pani Puri", "Bhel Puri", "Vada Pav"],
      reviews: 2134,
      hasDelivery: false,
      hasTakeout: true,
      nightSpecial: true,
      openLate: "4:00 AM",
      menuHighlights: ["Pani Puri ₹40", "Bhel Puri ₹50", "Vada Pav ₹30"],
    },
    {
      id: "night-rest-8",
      placeId: "ChIJ8901234567",
      name: "24x7 Pizza Palace",
      cuisine: "Italian",
      rating: 4.0,
      distance: (Math.random() * 2.8 + 0.7).toFixed(1),
      address: "Ring Road, Shopping Complex",
      phone: "+91 21098 76543",
      hours: "Open 24 hours",
      isOpen: true,
      is24Hours: true,
      deliveryTime: "30-40 min",
      priceLevel: 2,
      photos: ["https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop"],
      specialties: ["Wood Fired Pizza", "Garlic Bread", "Pasta"],
      reviews: 876,
      hasDelivery: false,
      hasTakeout: true,
      nightSpecial: true,
      openLate: "24 hours",
      menuHighlights: ["Margherita Pizza ₹280", "Chicken Pizza ₹380", "Garlic Bread ₹120"],
    },
  ]

  // Filter based on current time - show more options during typical late night hours
  const currentHour = new Date().getHours();
  const isLateNight = currentHour >= 22 || currentHour <= 6;

  let filteredRestaurants = restaurants;
  if (!isLateNight) {
    filteredRestaurants = restaurants.filter(
      (r) => r.is24Hours || Math.random() > 0.3
    );
  }

  const maxDistance = radius / 1609;
  return filteredRestaurants
    .filter((r) => Number.parseFloat(r.distance) <= maxDistance)
    .map((restaurant) => ({
      ...restaurant,
      distance: Number.parseFloat(restaurant.distance),
      photos: restaurant.photos?.length ? restaurant.photos : [FALLBACK_IMAGE],
      geometry: {
        location: {
          lat: lat + (Math.random() - 0.5) * 0.02,
          lng: lng + (Math.random() - 0.5) * 0.02,
        },
      },
    }))
    .sort((a, b) => a.distance - b.distance);
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = Number.parseFloat(searchParams.get("lat") || "0");
    const lng = Number.parseFloat(searchParams.get("lng") || "0");
    const radius = Number.parseInt(searchParams.get("radius") || "5000");

    console.log(
      `🍽️ Searching night restaurants near ${lat}, ${lng} within ${radius}m`
    );

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    const googleApiKey =
      process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY ||
      process.env.GOOGLE_PLACES_API_KEY;

    if (googleApiKey) {
      try {
        console.log("🔍 Using Google Places API for night restaurants");

        const searchQueries = [
          "24 hour restaurant",
          "restaurant open late",
          "midnight food",
        ];

        let allResults = [];

        for (const query of searchQueries) {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
              query
            )}&location=${lat},${lng}&radius=${radius}&type=restaurant&key=${googleApiKey}`
          );

          if (response.ok) {
            const data = await response.json();
            if (data.results) {
              const nightRestaurants = data.results.filter((place) => {
                const name = place.name.toLowerCase();
                const types = place.types || [];

                return (
                  (types.includes("restaurant") ||
                    types.includes("meal_takeaway") ||
                    types.includes("food") ||
                    name.includes("24") ||
                    name.includes("night") ||
                    name.includes("late") ||
                    name.includes("midnight")) &&
                  !types.includes("grocery_or_supermarket") &&
                  !types.includes("store")
                );
              });

              allResults = [...allResults, ...nightRestaurants];
            }
          }
        }

        const uniqueResults = allResults.filter(
          (place, index, self) =>
            index === self.findIndex((p) => p.place_id === place.place_id)
        );

        if (uniqueResults.length > 0) {
          const formattedRestaurants = uniqueResults.slice(0, 12).map((place) => ({
            id: place.place_id,
            placeId: place.place_id,
            name: place.name,
            cuisine: determineCuisineType(place.name, place.types),
            rating: place.rating || 4.0,
            distance: calculateDistance(
              lat,
              lng,
              place.geometry.location.lat,
              place.geometry.location.lng
            ),
            address: place.formatted_address || place.vicinity || "Address not available",
            phone: "Contact via Google",
            hours: "Hours may vary - Check with restaurant",
            isOpen: place.opening_hours?.open_now !== false,
            is24Hours: isLikely24Hours(place.name),
            deliveryTime: "30-45 min",
            priceLevel: place.price_level || 2,
            photos:
              place.photos?.length > 0
                ? [getGooglePhotoUrl(place.photos[0].photo_reference, googleApiKey)]
                : [FALLBACK_IMAGE],
            specialties: generateSpecialties(place.name, place.types),
            reviews: place.user_ratings_total || 0,
            hasDelivery: false,
            hasTakeout: true,
            nightSpecial: true,
            geometry: place.geometry,
          }));

          console.log(
            `✅ Found ${formattedRestaurants.length} night restaurants via Google API`
          );

          return NextResponse.json({
            restaurants: formattedRestaurants,
            source: "google_places",
            total: formattedRestaurants.length,
          });
        }
      } catch (error) {
        console.error("Google Places API error:", error);
      }
    }

    console.log("🌙 Using enhanced mock data for night restaurants");
    const mockRestaurants = generateNightRestaurants(lat, lng, radius);

    return NextResponse.json({
      restaurants: mockRestaurants,
      source: "mock_night_data",
      total: mockRestaurants.length,
      message:
        "Showing sample night restaurants. Add Google Places API key for real data.",
    });
  } catch (error) {
    console.error("Error fetching night restaurants:", error);
    return NextResponse.json(
      { error: "Failed to fetch restaurants" },
      { status: 500 }
    );
  }
}

// Helper functions
function determineCuisineType(name: string, types: string[]): string {
  const nameLower = name.toLowerCase();
  if (nameLower.includes("biryani") || nameLower.includes("indian")) return "Indian";
  if (nameLower.includes("dosa") || nameLower.includes("south indian")) return "South Indian";
  if (nameLower.includes("chinese") || nameLower.includes("noodles")) return "Chinese";
  if (nameLower.includes("pizza") || nameLower.includes("italian")) return "Italian";
  if (nameLower.includes("paratha") || nameLower.includes("north indian")) return "North Indian";
  if (nameLower.includes("momos") || nameLower.includes("tibetan")) return "Tibetan";
  if (nameLower.includes("street") || nameLower.includes("chaat")) return "Street Food";
  if (nameLower.includes("cafe") || nameLower.includes("continental")) return "Continental";
  return "Restaurant";
}

function isLikely24Hours(name: string): boolean {
  const nameLower = name.toLowerCase();
  return (
    nameLower.includes("24") ||
    nameLower.includes("24x7") ||
    nameLower.includes("24/7") ||
    nameLower.includes("all night")
  );
}

function generateSpecialties(name: string, types: string[]): string[] {
  const nameLower = name.toLowerCase();
  const specialties = [];
  if (nameLower.includes("biryani")) specialties.push("Biryani", "Kebabs");
  if (nameLower.includes("dosa")) specialties.push("Dosa", "Idli", "Filter Coffee");
  if (nameLower.includes("chinese")) specialties.push("Noodles", "Fried Rice", "Manchurian");
  if (nameLower.includes("pizza")) specialties.push("Pizza", "Pasta", "Garlic Bread");
  if (nameLower.includes("paratha")) specialties.push("Stuffed Parathas", "Lassi");
  if (nameLower.includes("momos")) specialties.push("Steamed Momos", "Fried Momos");
  if (nameLower.includes("street")) specialties.push("Chaat", "Pani Puri");
  if (nameLower.includes("cafe")) specialties.push("Coffee", "Sandwiches");
  if (specialties.length === 0) specialties.push("Late Night Food", "Takeaway");
  return specialties;
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number.parseFloat((R * c).toFixed(1));
}
