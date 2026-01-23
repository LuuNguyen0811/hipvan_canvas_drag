/**
 * Mock Products API
 * Simulates fetching product data from an internal API
 */

export interface Product {
  id: string
  name: string
  price: string
  originalPrice?: string
  image: string
  url: string
  badge?: string
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '110322',
    name: 'Noel Sofa Bed - Oatmeal',
    price: '$279',
    image: 'https://hipvan-images-production.imgix.net/product-images/a8ca11b6-835a-4f1c-b125-e89408cfb8a2/Noel-by-HipVan--Noel-Sofa-Bed--Oatmeal-31.png?w=400&h=400&fit=fill&bg=ffffff&auto=format&cs=srgb',
    url: 'https://www.hipvan.com/products/noel-sofa-bed-oatmeal',
    badge: 'Bestseller'
  },
  {
    id: '91984',
    name: 'Noel Sofa Bed - Harbour Grey',
    price: '$279',
    image: 'https://hipvan-images-production.imgix.net/product-images/5371c733-0b6d-430f-9bbb-f893f62dca23/Noel-by-HipVan--Noel-Sofa-Bed--Harbour-Grey-23.png?w=400&h=400&fit=fill&bg=ffffff&auto=format&cs=srgb',
    url: 'https://www.hipvan.com/products/noel-sofa-bed-harbour-grey',
    badge: 'Bestseller'
  },
  {
    id: '95374',
    name: 'Noel Sofa Bed - Ebony',
    price: '$279',
    image: 'https://hipvan-images-production.imgix.net/product-images/cbc7f311-d202-439c-a961-1b5eaa75dd36/Noel-by-HipVan--Noel-Sofa-Bed--Ebony-24.png?w=400&h=400&fit=fill&bg=ffffff&auto=format&cs=srgb',
    url: 'https://www.hipvan.com/products/noel-sofa-bed-ebony',
  },
  {
    id: '110450',
    name: 'Luisa 2-Seater Sofa Bed - Orion',
    price: '$499',
    image: 'https://hipvan-images-production.imgix.net/product-images/31afb4aa-d28d-4680-830b-05afa6d1c899/Luisa-by-HipVan--Luisa-Sofa-Bed--Orion-12.png?w=400&h=400&fit=fill&bg=ffffff&auto=format&cs=srgb',
    url: 'https://www.hipvan.com/products/luisa-2-seater-sofa-bed-orion',
    badge: 'New'
  },
  {
    id: '110449',
    name: 'Luisa 2-Seater Sofa Bed - Siberian Grey',
    price: '$499',
    image: 'https://hipvan-images-production.imgix.net/product-images/69c5a0ae-4b77-45f2-bd3d-35e4562dae39/Luisa-by-HipVan--Luisa-Sofa-Bed--Siberian-Grey-15.png?w=400&h=400&fit=fill&bg=ffffff&auto=format&cs=srgb',
    url: 'https://www.hipvan.com/products/luisa-2-seater-sofa-bed-siberian-grey'
  },
  {
    id: '117835',
    name: 'Luisa 2-Seater Sofa Bed - Sand',
    price: '$499',
    image: 'https://hipvan-images-production.imgix.net/product-images/79e2324d-b558-4c44-83af-6e438916c671/Luisa-by-HipVan--Luisa-Sofa-Bed--Sand-18.png?w=400&h=400&fit=fill&bg=ffffff&auto=format&cs=srgb',
    url: 'https://www.hipvan.com/products/luisa-2-seater-sofa-bed-sand'
  },
  {
    id: '78716',
    name: 'Abner Lounge Chair and Ottoman - Black',
    price: '$1,499',
    image: 'https://hipvan-images-production.imgix.net/product-images/0d1a597a-e4f4-4013-b1b2-a42f66669e5a/converted/Modern-Classics--Eames-Lounge-Chair-and-Ottoman--Black-_Genuine-Cowhide_-1.png?w=400&h=400&fit=fill&bg=ffffff&auto=format&cs=srgb',
    url: 'https://www.hipvan.com/products/abner-lounge-chair-and-ottoman-black-genuine-cowhide',
    badge: 'Premium'
  },
  {
    id: '117808',
    name: 'Tessa 3-Seater Storage Sofa Bed - Beige',
    price: '$499',
    image: 'https://hipvan-images-production.imgix.net/product-images/7d30fb08-23fc-43e9-bb36-5b42baf12a06/converted/Tessa-by-HipVan--Tessa-3-Seater-Storage-Sofa-Bed--Beige-_Eco-Clean-Fabric_-58.png?w=400&h=400&fit=fill&bg=ffffff&auto=format&cs=srgb',
    url: 'https://www.hipvan.com/products/tessa-3-seater-storage-sofa-bed-beige-eco-clean-fabric'
  },
  {
    id: '135344',
    name: 'Borris Bean Bag with Ottoman Set - Antique Brown',
    price: '$199',
    image: 'https://hipvan-images-production.imgix.net/product-images/a2d41483-c46f-4a36-ac43-169ad749262b/Small-Sofas-by-HipVan--Borris-Bean-Bag-with-Ottoman-Set--Antique-Brown-_Pet-Friendly_-5.png?w=400&h=400&fit=fill&bg=ffffff&auto=format&cs=srgb',
    url: 'https://www.hipvan.com/products/borris-bean-bag-with-ottoman-set-antique-brown-pet-friendly'
  },
  {
    id: '129931',
    name: 'Julia 3 Seater Sofa Bed - Hailstorm (Fabric)',
    price: '$179',
    image: 'https://hipvan-images-production.imgix.net/product-images/cf513188-a3dc-40fb-879b-b8c00d9bb02f/Julia-by-HipVan--Julia-Sofa-Bed--Hailstorm-_Fabric_-31.png?w=400&h=400&fit=fill&bg=ffffff&auto=format&cs=srgb',
    url: 'https://www.hipvan.com/products/julia-3-seater-sofa-bed-hailstorm-fabric'
  },
  {
    id: '119762',
    name: 'Julia 3 Seater Sofa Bed - Slate Grey (Faux Leather)',
    price: '$179',
    image: 'https://hipvan-images-production.imgix.net/product-images/d150573a-fdfe-4d6a-8422-2b18be136512/Julia-by-HipVan--Julia-Sofa-Bed--Slate-Grey__Faux-Leather_-24.png?w=400&h=400&fit=fill&bg=ffffff&auto=format&cs=srgb',
    url: 'https://www.hipvan.com/products/julia-3-seater-sofa-bed-slate-grey-faux-leather'
  },
  {
    id: '182947',
    name: 'Bobo Bean Bag with Ottoman Set - Beige (Pet Friendly)',
    price: '$149',
    image: 'https://hipvan-images-production.imgix.net/product-images/3e407746-c038-4c2e-9fb8-05150d30c347/Small-Sofas-by-HipVan--Bobo-Bean-Bag-with-Ottoman-Set--Beige-_Pet-Friendly_-13.png?w=400&h=400&fit=fill&bg=ffffff&auto=format&cs=srgb',
    url: 'https://www.hipvan.com/products/bobo-bean-bag-with-ottoman-set-beige-pet-friendly'
  },
  {
    id: '166228',
    name: 'Aria Swivel Lounge Chair',
    price: '$399',
    image: 'https://hipvan-images-production.imgix.net/product-images/5f663d08-479c-4f88-9461-283fba3a7e90/Aria-by-HipVan--Aria-Swivel-Lounge-Chair-14.png?w=400&h=400&fit=fill&bg=ffffff&auto=format&cs=srgb',
    url: 'https://www.hipvan.com/products/aria-swivel-lounge-chair'
  },
  {
    id: '175138',
    name: 'Holly 3 Seater Swivel Sofa - Beige',
    price: '$1399',
    image: 'https://hipvan-images-production.imgix.net/product-images/147afa36-385f-4df4-9027-eea5486445d5/Holly-by-HipVan--Holly-3-Seater-Swivel-Sofa--Beige-4.png?w=400&h=400&fit=fill&bg=ffffff&auto=format&cs=srgb',
    url: 'https://www.hipvan.com/products/holly-3-seater-swivel-sofa-beige'
  },
  {
    id: '168543',
    name: 'Tessa Storage Lounge Sofa Bed - Pewter Grey (Eco Clean Fabric)',
    price: '$399',
    image: 'https://hipvan-images-production.imgix.net/product-images/2cc32d89-01e9-46ca-9043-126122f2d93e/Tessa-by-HipVan--Tessa-Storage-Lounge-Sofa-Bed--Pewter-Grey-_Eco-Clean-Fabric_-16.png?w=400&h=400&fit=fill&bg=ffffff&auto=format&cs=srgb',
    url: 'https://www.hipvan.com/products/tessa-storage-lounge-sofa-bed-pewter-grey-eco-clean-fabric'
  }
]

/**
 * Search products by query string
 */
export function searchProducts(query: string): Product[] {
  if (!query || query.trim().length === 0) {
    return MOCK_PRODUCTS
  }
  
  const normalizedQuery = query.toLowerCase().trim()
  
  const results = MOCK_PRODUCTS.filter((prod) => {
    return prod.name.toLowerCase().includes(normalizedQuery)
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
 * Get product by ID
 */
export function getProductById(id: string): Product | null {
  return MOCK_PRODUCTS.find((prod) => prod.id === id) || null
}
