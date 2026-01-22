/**
 * Mock Collections API
 * Simulates fetching collection data from an internal API
 * Following e-commerce best practices for product catalogs
 */

export interface Collection {
  id: string
  name: string
  slug: string
  image: string
  ctaText: string
  ctaUrl: string
}

export interface ManualCollectionItem {
  id: string
  image: string
  title: string
  subtitle?: string
  ctaText: string
  ctaUrl: string
}

// CNY Sale 2026 Content and Banners
export const CNY_SALE_CONTENT = {
  title: "New Year. New Furniture. Fresh Start. 🐎",
  subtitle: "Start the Year of the Horse with a refreshed space. Enjoy up to $500 off storewide on our bestsellers when you buy more, just in time for the festivities.",
  banners: {
    splash: {
      mobile: "https://hiptruck-files.imgix.net/cms-files/0b31b26e-a453-4862-a1e7-0b962c2983db/CNY_sale_landingpage_mobileweb_600x480px.png?fm=jpg&auto=format&cs=srgb&w=900",
      desktop: "https://hiptruck-files.imgix.net/cms-files/0b31b26e-a453-4862-a1e7-0b962c2983db/CNY_sale_landingpage_desktopweb_1200x480px.png?fm=jpg&auto=format&cs=srgb&w=2000"
    },
    delivery: {
      mobile: "https://hiptruck-files.imgix.net/cms-files/016ed5cc-63ef-4d3c-b653-56833a4a1c8a/mobile_400x180_collectionbanner_deliverybeforechuxi-1.png?fm=jpg&auto=format&cs=srgb&w=900",
      desktop: "https://hiptruck-files.imgix.net/cms-files/016ed5cc-63ef-4d3c-b653-56833a4a1c8a/desktop_1280x320_collectionbanner_deliverybeforechuxi-1.png?fm=jpg&auto=format&cs=srgb&w=2000"
    }
  }
}

/**
 * Mock collections data following HipVan's collection structure
 */
export const MOCK_COLLECTIONS: Collection[] = [
  {
    id: 'col_sofas',
    name: 'Sofas',
    slug: 'sofas',
    ctaText: 'Shop',
    ctaUrl: '/sofas/sofas-loveseats?ref=salepage',
    image: 'https://hiptruck-files.imgix.net/cms-files/3fb17cdf-c5b8-4401-9bc4-d8838d6e54c3/Sofa.png?auto=format,compress&cs=srgb&w=900&h=540&fit=crop',
  },
  {
    id: 'col_mattresses',
    name: 'Signature Mattresses',
    slug: 'mattresses',
    ctaText: 'Shop',
    ctaUrl: '/mattresses-by-hipvan?ref=salepage',
    image: 'https://hiptruck-files.imgix.net/cms-files/3fb17cdf-c5b8-4401-9bc4-d8838d6e54c3/Mattress.png?auto=format,compress&cs=srgb&w=900&h=540&fit=crop',
  },
  {
    id: 'col_bedframes',
    name: 'Bed Frames',
    slug: 'bedframes',
    ctaText: 'Shop',
    ctaUrl: '/beds/bed-frames?ref=salepage',
    image: 'https://hiptruck-files.imgix.net/cms-files/3fb17cdf-c5b8-4401-9bc4-d8838d6e54c3/Bedframe.png?auto=format,compress&cs=srgb&w=900&h=540&fit=crop',
  },
  {
    id: 'col_dining_tables',
    name: 'Dining Tables',
    slug: 'dining-tables',
    ctaText: 'Shop',
    ctaUrl: '/dining-all/dining-tables?ref=salepage',
    image: 'https://hiptruck-files.imgix.net/cms-files/3bc8f963-613e-4387-8934-c6bb8f1d7462/Dining-Table-2.png?auto=format,compress&cs=srgb&w=900&h=540&fit=crop',
  },
  {
    id: 'col_dining_chairs',
    name: 'Dining Chairs and Benches',
    slug: 'dining-chairs',
    ctaText: 'Shop',
    ctaUrl: '/dining-all/all-dining-chairs-stools?ref=salepage',
    image: 'https://hiptruck-files.imgix.net/cms-files/3fb17cdf-c5b8-4401-9bc4-d8838d6e54c3/Dining-Chairs-and-Benches.png?auto=format,compress&cs=srgb&w=900&h=540&fit=crop',
  },
  {
    id: 'col_tv_consoles',
    name: 'Tv Consoles',
    slug: 'tv-consoles',
    ctaText: 'Shop',
    ctaUrl: '/furniture-all/tv-consoles?ref=salepage',
    image: 'https://hiptruck-files.imgix.net/cms-files/3fb17cdf-c5b8-4401-9bc4-d8838d6e54c3/TV-Consoles.png?auto=format,compress&cs=srgb&w=900&h=540&fit=crop',
  },
  {
    id: 'col_coffee_tables',
    name: 'Coffee Tables',
    slug: 'coffee-tables',
    ctaText: 'Shop',
    ctaUrl: '/furniture-all/coffee-tables?ref=salepage',
    image: 'https://hiptruck-files.imgix.net/cms-files/3fb17cdf-c5b8-4401-9bc4-d8838d6e54c3/Coffee-Tables.png?auto=format,compress&cs=srgb&w=900&h=540&fit=crop',
  },
  {
    id: 'col_lightings',
    name: 'Lightings',
    slug: 'lightings',
    ctaText: 'Shop',
    ctaUrl: '/lighting?ref=salepage',
    image: 'https://hiptruck-files.imgix.net/cms-files/3fb17cdf-c5b8-4401-9bc4-d8838d6e54c3/Lighting.png?auto=format,compress&cs=srgb&w=900&h=540&fit=crop',
  },
  {
    id: 'col_rugs',
    name: 'Rugs and Carpets',
    slug: 'rugs',
    ctaText: 'Shop',
    ctaUrl: '/all-rugs-carpets?ref=salepage',
    image: 'https://hiptruck-files.imgix.net/cms-files/3fb17cdf-c5b8-4401-9bc4-d8838d6e54c3/Rugs-and-Carpets.png?auto=format,compress&cs=srgb&w=900&h=540&fit=crop',
  },
  {
    id: 'col_mirrors',
    name: 'Mirrors',
    slug: 'mirrors',
    ctaText: 'Shop',
    ctaUrl: '/decor/new-mirrors?ref=salepage',
    image: 'https://hiptruck-files.imgix.net/cms-files/3bc8f963-613e-4387-8934-c6bb8f1d7462/Mirrors-2.png?auto=format,compress&cs=srgb&w=900&h=540&fit=crop',
  },
  {
    id: 'col_home_decor',
    name: 'Home Decor',
    slug: 'home-decor',
    ctaText: 'Shop',
    ctaUrl: '/decor?ref=salepage',
    image: 'https://hiptruck-files.imgix.net/cms-files/3bc8f963-613e-4387-8934-c6bb8f1d7462/Home-decor-2.png?auto=format,compress&cs=srgb&w=900&h=540&fit=crop',
  },
  {
    id: 'col_kids',
    name: 'Kids',
    slug: 'kids',
    ctaText: 'Shop',
    ctaUrl: '/kids?ref=salepage',
    image: 'https://hiptruck-files.imgix.net/cms-files/3fb17cdf-c5b8-4401-9bc4-d8838d6e54c3/Kids.png?auto=format,compress&cs=srgb&w=900&h=540&fit=crop',
  },
]

/**
 * Get all available collection names for dropdown
 */
export function getCollectionNames(): string[] {
  return MOCK_COLLECTIONS.map((col) => col.name)
}

/**
 * Query collection by name (case-insensitive, fuzzy match)
 */
export function getCollectionByName(name: string): Collection | null {
  if (!name) return null
  
  const normalizedName = name.toLowerCase().trim()
  
  // Exact match first
  const exactMatch = MOCK_COLLECTIONS.find(
    (col) => col.name.toLowerCase() === normalizedName || col.slug === normalizedName
  )
  if (exactMatch) return exactMatch
  
  // Partial match
  const partialMatch = MOCK_COLLECTIONS.find(
    (col) => 
      col.name.toLowerCase().includes(normalizedName) || 
      normalizedName.includes(col.name.toLowerCase()) ||
      col.slug.includes(normalizedName)
  )
  return partialMatch || null
}

/**
 * Get all collections
 */
export function getAllCollections(): Collection[] {
  return MOCK_COLLECTIONS
}

/**
 * Search collections by query string for autocomplete
 * Returns all matching collections sorted by relevance
 */
export function searchCollections(query: string): Collection[] {
  if (!query || query.trim().length === 0) {
    return MOCK_COLLECTIONS
  }
  
  const normalizedQuery = query.toLowerCase().trim()
  
  const results = MOCK_COLLECTIONS.filter((col) => {
    const nameMatch = col.name.toLowerCase().includes(normalizedQuery)
    const slugMatch = col.slug.includes(normalizedQuery)
    return nameMatch || slugMatch
  })
  
  results.sort((a, b) => {
    const aExact = a.name.toLowerCase() === normalizedQuery ? 0 : 1
    const bExact = b.name.toLowerCase() === normalizedQuery ? 0 : 1
    if (aExact !== bExact) return aExact - bExact
    
    const aStarts = a.name.toLowerCase().startsWith(normalizedQuery) ? 0 : 1
    const bStarts = b.name.toLowerCase().startsWith(normalizedQuery) ? 0 : 1
    return aStarts - bStarts
  })
  
  return results
}

/**
 * Get collection by ID
 */
export function getCollectionById(id: string): Collection | null {
  return MOCK_COLLECTIONS.find((col) => col.id === id) || null
}

/**
 * Format price with currency
 */
export function formatPrice(price: number, currency: string = 'SGD'): string {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}
