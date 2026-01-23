/**
 * Mock Collections API
 * Simulates fetching collection data from an internal API
 * Following e-commerce best practices for product catalogs
 */

export interface Collection {
  id: string
  name: string
  image: string
  ctaText?: string
  url: string
}

export interface ManualCollectionItem {
  id: string
  image: string
  title: string
  subtitle?: string
  ctaText?: string
  url: string
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
 * expanded with sub-categories from mock.json
 */
export const MOCK_COLLECTIONS: Collection[] = [
  // --- FURNITURE SETS ---
  {
    id: 'col_8579',
    name: 'Furniture Sets',
    url: 'https://staging.hipvan.com/new/furniture-sets',
    image: 'https://hipvan-images-staging-testing.imgix.net/taxon-images/97ede6b5-d907-4318-ac88-35139ab4912c/sets.jpeg?fit=clamp&w=900&h=540&auto=format',
  },
  {
    id: 'col_8711',
    name: 'Sofa & Armchair Sets',
    url: 'https://staging.hipvan.com/new/new-sofa-sets',
    image: 'https://hipvan-images-staging-testing.imgix.net/taxon-images/3d3e3815-84ca-4c07-9828-fbb53b915e0d/New-Sofa-Sets.png?fit=clamp&w=900&h=540&auto=format',
  },
  {
    id: 'col_8715',
    name: 'TV Console Sets',
    url: 'https://staging.hipvan.com/new/new-tv-console-sets',
    image: 'https://hipvan-images-staging-testing.imgix.net/taxon-images/aed7526a-8e17-417a-93ac-3f601788a4c1/new-tv-console-sets.jpeg?fit=clamp&w=900&h=540&auto=format',
  },
  {
    id: 'col_8723',
    name: 'Coffee Table Sets',
    url: 'https://staging.hipvan.com/new/new-coffee-table-sets',
    image: 'https://hipvan-images-staging-testing.imgix.net/taxon-images/61fd3ba8-0d55-4396-bb72-0474747bc0b2/new-coffee-table-sets.jpg?fit=clamp&w=900&h=540&auto=format',
  },
  {
    id: 'col_8713',
    name: 'Dining Table & Chair Sets',
    url: 'https://staging.hipvan.com/new/new-dining-table-chair-sets',
    image: 'https://hipvan-images-staging-testing.imgix.net/taxon-images/1952726f-bde6-4741-ab10-c33234fc7209/new-dining-table-chair-sets.jpeg?fit=clamp&w=900&h=540&auto=format',
  },
  {
    id: 'col_8709',
    name: 'Bed & Bedside Table Sets',
    url: 'https://staging.hipvan.com/new/new-bed-sets',
    image: 'https://hipvan-images-staging-testing.imgix.net/taxon-images/4d0b4624-401c-42e6-af3d-0924e1eec31d/new-bed-set.png?fit=clamp&w=900&h=540&auto=format',
  },
  {
    id: 'col_8725',
    name: 'Outdoor Sets',
    url: 'https://staging.hipvan.com/new/new-outdoor-sets',
    image: 'https://hipvan-images-staging-testing.imgix.net/taxon-images/eb6964e6-31a4-468b-84f2-a1bcfa3b4983/new-outdoor-set.png?fit=clamp&w=900&h=540&auto=format',
  },

  // --- SOLID WOOD COLLECTIONS ---
  {
    id: 'col_4773',
    name: 'Solid Wood Collections',
    url: 'https://staging.hipvan.com/new/solid-wood',
    image: 'https://hipvan-images-staging-testing.imgix.net/taxon-images/932c9786-01c2-4499-a9ea-501078e409e5/solid%20wood.png?fit=clamp&w=900&h=540&auto=format',
  },
  {
    id: 'col_5380',
    name: 'Dakota Collection',
    url: 'https://staging.hipvan.com/new/dakota-by-hipvan',
    image: 'https://hipvan-images-staging-testing.imgix.net/taxon-images/a48ffeab-472a-422c-b982-73b4a0094f6c/Collection_Featured_Image-Dakota.png?fit=clamp&w=900&h=540&auto=format',
  },
  {
    id: 'col_5723',
    name: 'Tilda Collection',
    url: 'https://staging.hipvan.com/new/tilda-by-hipvan',
    image: 'https://hipvan-images-staging-testing.imgix.net/taxon-images/13045797-3576-4dee-a89b-2e2dcb074a2d/Collection_Featured_Image-Tilda.png?fit=clamp&w=900&h=540&auto=format',
  },
  {
    id: 'col_5252',
    name: 'Cadencia Collection',
    url: 'https://staging.hipvan.com/new/cadencia-by-hipvan',
    image: 'https://hipvan-images-staging-testing.imgix.net/taxon-images/74322090-7ee0-4c7a-aa16-e08a96a6d97c/cadencia.png?fit=clamp&w=900&h=540&auto=format',
  },

  // --- SHOP BY STYLE ---
  {
    id: 'col_8553',
    name: 'Shop by Styles',
    url: 'https://staging.hipvan.com/new/shop-by-style',
    image: 'https://hipvan-images-staging-testing.imgix.net/taxon-images/8ab4a540-c2de-4df5-9e23-0b4685cd8851/shopbystyle.jpeg?fit=clamp&w=900&h=540&auto=format',
  },
  {
    id: 'col_8637',
    name: 'Adapted Scandinavian',
    url: 'https://staging.hipvan.com/new/adapted-scandinavian',
    image: 'https://hipvan-images-staging-testing.imgix.net/taxon-images/ab898fe8-2abb-4d37-a71d-8290a5173766/adaptscandi.png?fit=clamp&w=900&h=540&auto=format',
  },
  {
    id: 'col_8555',
    name: 'Japanese Minimalist',
    url: 'https://staging.hipvan.com/new/japanese-minimalist',
    image: 'https://hipvan-images-staging-testing.imgix.net/taxon-images/055dbbcc-0dab-4f0f-af63-71dc6b370ce2/japaneseminimalist.jpeg?fit=clamp&w=900&h=540&auto=format',
  },
  {
    id: 'col_4676',
    name: 'Loft & Industrial',
    url: 'https://staging.hipvan.com/new/industrial',
    image: 'https://hipvan-images-staging-testing.imgix.net/taxon-images/b069f399-54f8-4167-b7c4-80c1c994a309/044573f915a1472a9c863a2c9d6c5204.jpg?fit=clamp&w=900&h=540&auto=format',
  },

  // --- SOFAS HIERARCHY ---
  {
    id: 'col_8490',
    name: 'Sofas',
    url: 'https://staging.hipvan.com/sofas',
    image: 'https://hiptruck-files.imgix.net/cms-files/3fb17cdf-c5b8-4401-9bc4-d8838d6e54c3/Sofa.png?auto=format&w=900&h=540&fit=crop',
  },
  {
    id: 'col_40',
    name: 'L-Shaped Sofas',
    url: 'https://staging.hipvan.com/sofas/l-shaped-sofas',
    image: 'https://hipvan-images-staging-testing.imgix.net/taxon-images/df8fa49b-9b9f-4420-8e58-b5061b1abd1c-1726826582764/L-Shaped-Sofas-feature.png?fit=clamp&w=900&h=540&auto=format',
  },
  {
    id: 'col_41',
    name: '3 Seater Sofas',
    url: 'https://staging.hipvan.com/sofas/3-seater-sofas',
    image: 'https://hipvan-images-staging-testing.imgix.net/taxon-images/72f7adbc-ad94-47b2-9094-63c1d61f631e-1726827184380/3-Seater-Sofas-feature.png?fit=clamp&w=900&h=540&auto=format',
  },
  {
    id: 'col_42',
    name: '2 Seater Sofas',
    url: 'https://staging.hipvan.com/sofas/2-seater-sofas',
    image: 'https://hipvan-images-staging-testing.imgix.net/taxon-images/ee35717e-4d12-453e-b660-3c94eb04d881-1726826571388/2-Seater-Sofas-feature.png?fit=clamp&w=900&h=540&auto=format',
  },
  {
    id: 'col_45',
    name: 'Sofa Beds',
    url: 'https://staging.hipvan.com/sofas/sofa-beds',
    image: 'https://hipvan-images-staging-testing.imgix.net/taxon-images/7741bb78-475a-435c-aa84-c27763fc9d26/sofa%2520bed%2520new%2520update%25203.png?fit=clamp&w=900&h=540&auto=format',
  },
  {
    id: 'col_4806',
    name: 'Leather Sofas',
    url: 'https://staging.hipvan.com/sofas/leather-sofas',
    image: 'https://hipvan-images-staging-testing.imgix.net/taxon-images/216a2202-9c61-45d8-9f64-8ccd6aba2a84/Leather.png?fit=clamp&w=900&h=540&auto=format',
  },
  {
    id: 'col_8470',
    name: 'Fabric Sofas',
    url: 'https://staging.hipvan.com/sofas/fabric-sofas',
    image: 'https://hipvan-images-staging-testing.imgix.net/taxon-images/c724d60d-094e-4d20-a6fd-730349bbc4d9/fabricsofas.jpeg?fit=clamp&w=900&h=540&auto=format',
  },

  // --- MATTRESSES & BEDS ---
  {
    id: 'col_mattresses',
    name: 'Signature Mattresses',
    url: '/mattresses-by-hipvan?ref=salepage',
    image: 'https://hiptruck-files.imgix.net/cms-files/3fb17cdf-c5b8-4401-9bc4-d8838d6e54c3/Mattress.png?auto=format&w=900&h=540&fit=crop',
  },
  {
    id: 'col_bedframes',
    name: 'Bed Frames',
    url: '/beds/bed-frames?ref=salepage',
    image: 'https://hiptruck-files.imgix.net/cms-files/3fb17cdf-c5b8-4401-9bc4-d8838d6e54c3/Bedframe.png?auto=format&w=900&h=540&fit=crop',
  },

  // --- POPULAR BRANDS ---
  {
    id: 'col_8575',
    name: 'Popular Brands',
    url: 'https://staging.hipvan.com/new/popular-brands',
    image: 'https://hipvan-images-staging-testing.imgix.net/taxon-images/391bd107-086e-4ee3-a7d8-4ff7951d0bf5/Popularbrands.png?fit=clamp&w=900&h=540&auto=format',
  },
  {
    id: 'col_5862',
    name: 'SMEG',
    url: 'https://staging.hipvan.com/new/smeg',
    image: 'https://hipvan-images-staging-testing.imgix.net/taxon-images/e5c81eba-31a9-4bda-8de5-1fcbaee8281a/GROUP_2_6ffa0775-3cd6-4f8d-943c-3b5e1f3a0b8d.png?fit=clamp&w=900&h=540&auto=format',
  },
  {
    id: 'col_5304',
    name: 'Umbra',
    url: 'https://staging.hipvan.com/new/umbra',
    image: 'https://hipvan-images-staging-testing.imgix.net/taxon-images/f3c45df9-459e-4129-afa7-348057f2482d/Umbra%2520Lifestyle%25203.jpg?fit=clamp&w=900&h=540&auto=format',
  },

  // --- OTHER ---
  {
    id: 'col_dining_tables',
    name: 'Dining Tables',
    url: '/dining-all/dining-tables?ref=salepage',
    image: 'https://hiptruck-files.imgix.net/cms-files/3bc8f963-613e-4387-8934-c6bb8f1d7462/Dining-Table-2.png?auto=format&w=900&h=540&fit=crop',
  },
  {
    id: 'col_dining_chairs',
    name: 'Dining Chairs',
    url: '/dining-all/all-dining-chairs-stools?ref=salepage',
    image: 'https://hiptruck-files.imgix.net/cms-files/3fb17cdf-c5b8-4401-9bc4-d8838d6e54c3/Dining-Chairs-and-Benches.png?auto=format&w=900&h=540&fit=crop',
  },
  {
    id: 'col_lightings',
    name: 'Lightings',
    url: '/lighting?ref=salepage',
    image: 'https://hiptruck-files.imgix.net/cms-files/3fb17cdf-c5b8-4401-9bc4-d8838d6e54c3/Lighting.png?auto=format&w=900&h=540&fit=crop',
  },
  {
    id: 'col_rugs',
    name: 'Rugs and Carpets',
    url: '/all-rugs-carpets?ref=salepage',
    image: 'https://hiptruck-files.imgix.net/cms-files/3fb17cdf-c5b8-4401-9bc4-d8838d6e54c3/Rugs-and-Carpets.png?auto=format&w=900&h=540&fit=crop',
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
    (col) => col.name.toLowerCase() === normalizedName
  )
  if (exactMatch) return exactMatch
  
  // Partial match
  const partialMatch = MOCK_COLLECTIONS.find(
    (col) => 
      col.name.toLowerCase().includes(normalizedName) || 
      normalizedName.includes(col.name.toLowerCase())
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
    return col.name.toLowerCase().includes(normalizedQuery)
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
