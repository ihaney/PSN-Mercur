import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us"

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

async function getRegionMap(cacheId: string) {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (!BACKEND_URL) {
    // If no backend URL, use default region
    if (!regionMap.has(DEFAULT_REGION)) {
      regionMapCache.regionMap.set(DEFAULT_REGION, {
        id: DEFAULT_REGION,
        name: DEFAULT_REGION,
        countries: [{ iso_2: DEFAULT_REGION }],
      } as HttpTypes.StoreRegion)
    }
    return regionMapCache.regionMap
  }

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    try {
      // Fetch regions from Medusa. We can't use the JS client here because middleware is running on Edge and the client needs a Node environment.
      const { regions } = await fetch(`${BACKEND_URL}/store/regions`, {
        headers: {
          "x-publishable-api-key": PUBLISHABLE_API_KEY || "",
        },
        next: {
          revalidate: 3600,
          tags: [`regions-${cacheId}`],
        },
        cache: "force-cache",
      }).then(async (response) => {
        const json = await response.json()

        if (!response.ok) {
          throw new Error(json.message)
        }

        return json
      })

      if (!regions?.length) {
        throw new Error(
          "No regions found. Please set up regions in your Medusa Admin."
        )
      }

      // Create a map of country codes to regions.
      regions.forEach((region: HttpTypes.StoreRegion) => {
        region.countries?.forEach((c) => {
          regionMapCache.regionMap.set(c.iso_2 ?? "", region)
        })
      })

      regionMapCache.regionMapUpdated = Date.now()
    } catch (error) {
      // If fetch fails (backend not available), use default region
      console.warn("Failed to fetch regions from backend, using default region:", error)
      if (!regionMap.has(DEFAULT_REGION)) {
        regionMapCache.regionMap.set(DEFAULT_REGION, {
          id: DEFAULT_REGION,
          name: DEFAULT_REGION,
          countries: [{ iso_2: DEFAULT_REGION }],
        } as HttpTypes.StoreRegion)
      }
    }
  }

  return regionMapCache.regionMap
}

async function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion | number>
) {
  try {
    let countryCode

    const vercelCountryCode = request.headers
      .get("x-vercel-ip-country")
      ?.toLowerCase()

    const urlCountryCode = request.nextUrl.pathname.split("/")[1]?.toLowerCase()

    if (urlCountryCode && regionMap.has(urlCountryCode)) {
      countryCode = urlCountryCode
    } else if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
      countryCode = vercelCountryCode
    } else if (regionMap.has(DEFAULT_REGION)) {
      countryCode = DEFAULT_REGION
    } else if (regionMap.keys().next().value) {
      countryCode = regionMap.keys().next().value
    }

    return countryCode
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Middleware.ts: Error getting the country code. Did you set up regions in your Medusa Admin and define a MEDUSA_BACKEND_URL environment variable? Note that the variable is no longer named NEXT_PUBLIC_MEDUSA_BACKEND_URL."
      )
    }
    // Return default region on error
    return DEFAULT_REGION
  }
}

export async function middleware(request: NextRequest) {
  // Short-circuit static assets
  if (request.nextUrl.pathname.includes(".")) {
    return NextResponse.next()
  }

  const cacheIdCookie = request.cookies.get("_medusa_cache_id")
  const urlSegment = request.nextUrl.pathname.split("/")[1]
  const looksLikeLocale = /^[a-z]{2}$/i.test(urlSegment || "")

  // Fast path: URL already has a locale segment and cache cookie exists
  if (looksLikeLocale && cacheIdCookie) {
    return NextResponse.next()
  }

  let response = NextResponse.next()

  // Ensure cache id cookie exists (set without redirect)
  const cacheId = cacheIdCookie?.value || crypto.randomUUID()
  if (!cacheIdCookie) {
    response.cookies.set("_medusa_cache_id", cacheId, {
      maxAge: 60 * 60 * 24,
    })
  }

  try {
    const regionMap = await getRegionMap(cacheId)
    const countryCode = regionMap && (await getCountryCode(request, regionMap))

    const urlHasCountryCode =
      countryCode && request.nextUrl.pathname.split("/")[1].includes(countryCode)

    // If no country code in URL but we can resolve one, redirect to locale-prefixed path
    if (!urlHasCountryCode && countryCode) {
      const redirectPath =
        request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname
      const queryString = request.nextUrl.search ? request.nextUrl.search : ""
      const redirectUrl = `${request.nextUrl.origin}/${countryCode}${redirectPath}${queryString}`
      return NextResponse.redirect(redirectUrl, 307)
    }
  } catch (error) {
    // If middleware fails, just continue with the request
    console.warn("Middleware error (non-fatal):", error)
  }

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
