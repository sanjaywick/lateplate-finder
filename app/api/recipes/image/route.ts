import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get("url")

    if (!url) {
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
    }

    console.log("Fetching image for URL:", url)

    // Fetch the recipe page with proper headers
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        DNT: "1",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
      timeout: 10000,
    })

    if (!response.ok) {
      console.error(`Failed to fetch recipe page: ${response.status}`)
      return NextResponse.json(
        {
          error: `Failed to fetch recipe page: ${response.status}`,
          imageUrl: "/placeholder.svg?height=200&width=300&text=Page+Not+Found",
        },
        { status: response.status },
      )
    }

    const html = await response.text()
    console.log("HTML fetched, length:", html.length)

    // Simple regex-based image extraction (more reliable than cheerio in serverless)
    let imageUrl = null

    // Try to find Open Graph image
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i)
    if (ogImageMatch) {
      imageUrl = ogImageMatch[1]
      console.log("Found OG image:", imageUrl)
    }

    // Try Twitter image if no OG image
    if (!imageUrl) {
      const twitterImageMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["'][^>]*>/i)
      if (twitterImageMatch) {
        imageUrl = twitterImageMatch[1]
        console.log("Found Twitter image:", imageUrl)
      }
    }

    // Try to find recipe-specific images
    if (!imageUrl) {
      const recipeImagePatterns = [
        /<img[^>]*class=["'][^"']*recipe[^"']*["'][^>]*src=["']([^"']+)["'][^>]*>/i,
        /<img[^>]*src=["']([^"']+)["'][^>]*class=["'][^"']*recipe[^"']*["'][^>]*>/i,
        /<img[^>]*alt=["'][^"']*recipe[^"']*["'][^>]*src=["']([^"']+)["'][^>]*>/i,
      ]

      for (const pattern of recipeImagePatterns) {
        const match = html.match(pattern)
        if (match) {
          imageUrl = match[1]
          console.log("Found recipe image:", imageUrl)
          break
        }
      }
    }

    // Try to find the first reasonable image
    if (!imageUrl) {
      const imgMatches = html.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi)
      if (imgMatches) {
        for (const imgMatch of imgMatches.slice(0, 10)) {
          // Check first 10 images
          const srcMatch = imgMatch.match(/src=["']([^"']+)["']/)
          if (srcMatch) {
            const src = srcMatch[1]
            // Skip small images, icons, and common non-recipe images
            if (
              !src.includes("logo") &&
              !src.includes("icon") &&
              !src.includes("avatar") &&
              !src.includes("social") &&
              !src.endsWith(".svg") &&
              src.length > 20
            ) {
              imageUrl = src
              console.log("Found first suitable image:", imageUrl)
              break
            }
          }
        }
      }
    }

    // Make sure the URL is absolute
    if (imageUrl && !imageUrl.startsWith("http")) {
      try {
        const baseUrl = new URL(url)
        imageUrl = new URL(imageUrl, baseUrl.origin).href
        console.log("Converted to absolute URL:", imageUrl)
      } catch (error) {
        console.error("Error converting to absolute URL:", error)
        imageUrl = null
      }
    }

    if (!imageUrl) {
      console.log("No image found for URL:", url)
      return NextResponse.json(
        {
          error: "No image found",
          imageUrl: "/placeholder.svg?height=200&width=300&text=No+Image+Found",
        },
        { status: 404 },
      )
    }

    console.log("Final image URL:", imageUrl)
    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error("Error fetching recipe image:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch image",
        imageUrl: "/placeholder.svg?height=200&width=300&text=Image+Error",
      },
      { status: 500 },
    )
  }
}
