/**
 * Mock Collections API
 * Simulates fetching collection data from an internal API
 * Following e-commerce best practices for product catalogs
 */

export interface CollectionProduct {
  id: string
  title: string
  image: string
  price: number
  originalPrice?: number
  discount?: number
  currency: string
  ctaText: string
  ctaUrl: string
  badge?: string // e.g., "Best Seller", "New", "Sale"
  rating?: number
  reviewCount?: number
}

export interface Collection {
  id: string
  name: string
  slug: string
  description?: string
  heroImage?: string
  products: CollectionProduct[]
  ctaText?: string
  ctaUrl?: string
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

// Placeholder images using picsum for demo purposes
const PLACEHOLDER_IMAGES = {
  sofas: [
    'https://hipvan-images-production.imgix.net/product-images/a8ca11b6-835a-4f1c-b125-e89408cfb8a2/Noel-by-HipVan--Noel-Sofa-Bed--Oatmeal-31.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=1%3A1&fit=fill&w=400&bg=fff&ixlib=react-9.10.0',
    'https://hipvan-images-production.imgix.net/product-images/2b3100bd-2bcf-4715-b029-25a8f1eb3d62/Modern-Classics--Eames-Lounge-Chair-and-Ottoman--Black-(Genuine-Cowhide)-12.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=1%3A1&fit=fill&w=400&bg=fff&ixlib=react-9.10.0',
    'https://hipvan-images-production.imgix.net/product-images/7d30fb08-23fc-43e9-bb36-5b42baf12a06/Tessa-by-HipVan--Tessa-3-Seater-Storage-Sofa-Bed--Beige-_Eco-Clean-Fabric_-58.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=1%3A1&fit=fill&w=400&bg=fff&ixlib=react-9.10.0',
    'https://hipvan-images-production.imgix.net/product-images/698fccec-ca6f-40f1-82b9-f4a8b4666e84/Small-Sofas-by-HipVan--Versa-Floor-Sofa-Bed-with-Adjustable-Table--_Grey-_Fabric_-8.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=1%3A1&fit=fill&w=400&bg=fff&ixlib=react-9.10.0',
    'https://hipvan-images-production.imgix.net/product-images/31afb4aa-d28d-4680-830b-05afa6d1c899/Luisa-by-HipVan--Luisa-Sofa-Bed--Orion-12.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=1%3A1&fit=fill&w=400&bg=fff&ixlib=react-9.10.0',
    'https://hipvan-images-production.imgix.net/product-images/694f60a1-ee68-453f-8375-1af525594075/HV-Modern-Sofas---Lounge-Chairs--Mia-L-Shaped-Storage-Sofa-Bed--Dove-Grey-21.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=1%3A1&fit=fill&w=400&bg=fff&ixlib=react-9.10.0',
  ],
  mattresses: [
    'https://hiptruck-files.imgix.net/cms-files/b6f56669-6dce-4c59-ae32-0644c6e61a51/1.png?auto=format,compress&cs=srgb&w=320',
    'https://hiptruck-files.imgix.net/cms-files/b6f56669-6dce-4c59-ae32-0644c6e61a51/2.png?auto=format,compress&cs=srgb&w=320',
    'https://hiptruck-files.imgix.net/cms-files/b6f56669-6dce-4c59-ae32-0644c6e61a51/3.png?auto=format,compress&cs=srgb&w=320',
    'https://hiptruck-files.imgix.net/cms-files/b6f56669-6dce-4c59-ae32-0644c6e61a51/4.png?auto=format,compress&cs=srgb&w=320',
    'https://hiptruck-files.imgix.net/cms-files/b6f56669-6dce-4c59-ae32-0644c6e61a51/5.png?auto=format,compress&cs=srgb&w=320',
    'https://hipvan-images-production.imgix.net/product-images/dca4469d-8682-4b2e-8cd2-4a71998f2a31/Bedding-Essentials-by-HipVan--EVERYDAY-Pillow-5.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=1%3A1&fit=fill&w=400&bg=fff&ixlib=react-9.10.0',
  ],
  beds: [
    'https://hipvan-images-production.imgix.net/product-images/2beac240-706c-429d-bf9e-90068cb8f4db/Nara-by-HipVan--Katana-Single-Bed-10.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=1%3A1&fit=fill&w=400&bg=fff&ixlib=react-9.10.0',
    'https://hipvan-images-production.imgix.net/product-images/4d1926b4-5703-4fcb-bf5d-b5e2c573e0af/Minimalist-Bed-Frames-by-HipVan--Aiko-Super-Single-Wooden-Bed-8.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=1%3A1&fit=fill&w=400&bg=fff&ixlib=react-9.10.0',
    'https://hipvan-images-production.imgix.net/product-images/78b81c37-884f-4eff-8438-a2040f7bc78a/Minimalist-Bed-Frames-by-HipVan--Aiko-Queen-Bed-11.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=1%3A1&fit=fill&w=400&bg=fff&ixlib=react-9.10.0',
    'https://hipvan-images-production.imgix.net/product-images/68d44205-f362-4ece-8d03-787514a62d05/Beds-by-HipVan--Katana-Super-Single-Bed-3.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=1%3A1&fit=fill&w=400&bg=fff&ixlib=react-9.10.0',
    'https://hipvan-images-production.imgix.net/product-images/deba6fd3-c4f4-49ef-986b-f93afcfa74d1/HV-Basic-Beds---Bedroom-Storage--Nolan-Super-Single-Storage-Bed--Hailstorm-35.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=1%3A1&fit=fill&w=400&bg=fff&ixlib=react-9.10.0',
    'https://hipvan-images-production.imgix.net/product-images/4d382ee5-f62f-47c4-9968-35d53d659478/Aiko-by-HipVan--Aiko-Super-Single-Bed-1.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=1%3A1&fit=fill&w=400&bg=fff&ixlib=react-9.10.0',
  ],
  dining: [
    'https://hipvan-images-production.imgix.net/product-images/7f51d845-66bf-4486-82ce-a8491bf64d8c/HV-Modern-Dining-Tables---Chairs--Macy-Dining-Chair--Cocoa-Grey-_Fabric_-6.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=1%3A1&fit=fill&w=400&bg=fff&ixlib=react-9.10.0',
    'https://hipvan-images-production.imgix.net/product-images/fd03d0af-410f-40b1-90a8-568f9bf3e75a/Harold-by-HipVan--Harold-Dining-Chair--Cocoa-Dark-Grey-15.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=1%3A1&fit=fill&w=400&bg=fff&ixlib=react-9.10.0',
    'https://hipvan-images-production.imgix.net/product-images/93efc60f-fe2e-402c-b988-10d1989e5dda/Dining-Chairs-by-HipVan--Apollo-Dining-Armchair--Beige-Oak-16.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=1%3A1&fit=fill&w=400&bg=fff&ixlib=react-9.10.0',
    'https://hipvan-images-production.imgix.net/product-images/d87a3cec-4b67-442b-bbd1-47d3cc62f6c2/Kate-by-HipVan--Kate-Dining-Chair--Oak-Beige-9.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=1%3A1&fit=fill&w=400&bg=fff&ixlib=react-9.10.0',
    'https://hipvan-images-production.imgix.net/product-images/669bc559-accd-4b43-b9b4-f819b08fd2cf/Mercy-dining-chair-walnut-darkgrey-front.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=1%3A1&fit=fill&w=400&bg=fff&ixlib=react-9.10.0',
    'https://hipvan-images-production.imgix.net/product-images/1957a08b-fa0e-4937-b0a9-65c75d70f9e7/Dining-Chairs-by-HipVan--Riley-Dining-Chair--Walnut-Dark-Grey-9.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=1%3A1&fit=fill&w=400&bg=fff&ixlib=react-9.10.0',
  ],
  tv: [
    'https://hipvan-images-production.imgix.net/product-images/b38600b8-177a-465e-b2bc-baf796beb4f0/Leland-by-HipVan--Leland-TV-Console-2m-17.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=100%3A74&fit=crop&w=400&bg=fff&ixlib=react-9.10.0',
    'https://hipvan-images-production.imgix.net/product-images/c0a2f52c-c580-4a81-871b-c5bff18a5530/Belig-by-HipVan--Belig-Rattan-TV-Console-2m--Oak-2.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=100%3A74&fit=crop&w=400&bg=fff&ixlib=react-9.10.0',
    'https://hipvan-images-production.imgix.net/product-images/18a97d65-309f-4fd5-b388-099d5d9a724e/Jael-by-HipVan--Jael-TV-Console-1-2m--Walnut-1.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=100%3A74&fit=crop&w=400&bg=fff&ixlib=react-9.10.0',
    'https://hipvan-images-production.imgix.net/product-images/f6745893-87b2-4e2d-810b-6508b325dea1/Nola-by-HipVan--Nola-TV-Console-1-8m--Oak-8.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=100%3A74&fit=crop&w=400&bg=fff&ixlib=react-9.10.0',
    'https://hipvan-images-production.imgix.net/product-images/1e942638-064d-4253-9bd1-b1b1c7c6fd0d/Lucia-by-HipVan--Lucia-TV-Console-1-8m-1.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=100%3A74&fit=crop&w=400&bg=fff&ixlib=react-9.10.0',
    'https://hipvan-images-production.imgix.net/product-images/60c32de3-46cc-4281-8f70-c130bb1bba4d/Devin-by-HipVan--Devin-TV-Console-2m-1.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=100%3A74&fit=crop&w=400&bg=fff&ixlib=react-9.10.0',
  ],
  coffee: [
    'https://hipvan-images-production.imgix.net/product-images/6a82e40c-fddb-4ef0-a8bf-565814136d83/Acapulco-by-HipVan--Acapulco-Coffee-Table--White-12.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=100%3A74&fit=crop&w=400&bg=fff&ixlib=react-9.10.0',
    'https://hipvan-images-production.imgix.net/product-images/05076f0b-53cf-4910-a430-57d1e2e1d4c2/Oval-Coffee-Tables-by-HipVan--Rei_Coffee-Table--Walnut-12.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=100%3A74&fit=crop&w=400&bg=fff&ixlib=react-9.10.0',
    'https://hipvan-images-production.imgix.net/product-images/52389487-cb67-4f6a-97ac-25443d83d054/Maribo-by-HipVan--Maribo-Coffee-Table--Oak-11.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=100%3A74&fit=crop&w=400&bg=fff&ixlib=react-9.10.0',
    'https://hipvan-images-production.imgix.net/product-images/addc7880-283f-476c-9857-e6260163e5c9/Concrete-Essence-by-HipVan--Ellie-Round-Concrete-Coffee-Table-8.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=100%3A74&fit=crop&w=400&bg=fff&ixlib=react-9.10.0',
    'https://hipvan-images-production.imgix.net/product-images/0a0594f1-2691-48ae-97df-dd2c231747eb/Catania-by-HipVan--Catania-Coffee-Table-20.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=100%3A74&fit=crop&w=400&bg=fff&ixlib=react-9.10.0',
    'https://hipvan-images-production.imgix.net/product-images/85e63731-60a3-4015-b635-a9f4c757b587/Howe-by-HipVan--Howe-Rattan-Side-Table-9.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=100%3A74&fit=crop&w=400&bg=fff&ixlib=react-9.10.0',
  ],
  lighting: [
    'https://hipvan-images-production.imgix.net/product-images/d26503d5-2065-422b-8d85-47d97e7c2a6d/converted/Lights-By-HipVan--Fairy-Lights-10m--Warm-1.jpg?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=1%3A1&fit=fill&w=400&bg=fff&ixlib=react-9.10.0',
    'https://hipvan-images-production.imgix.net/product-images/f6561f42-7fdb-45ea-b972-d811e3542a25/Essentials-by-HipVan--Orla-Ombre-Floor-Lamp-7.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=1%3A1&fit=fill&w=400&bg=fff&ixlib=react-9.10.0',
    'https://hipvan-images-production.imgix.net/product-images/a87680c4-5dcc-461e-978d-ce8e6e2715ef/Lights-By-HipVan--Ins-Flaming-Table-Night-Light-Lamp-3.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=1%3A1&fit=fill&w=400&bg=fff&ixlib=react-9.10.0',
    'https://hipvan-images-production.imgix.net/product-images/e66d2d15-442b-456f-8767-20f45d399296/Lights-By-HipVan--Norman-Floor-Lamp-8.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=1%3A1&fit=fill&w=400&bg=fff&ixlib=react-9.10.0',
    'https://hipvan-images-production.imgix.net/product-images/d4d70b22-986f-47df-bcb9-17b3f6f467cf/Essentials-by-HipVan--Tavian-Pleated-Table-Lamp--Walnut-2.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=1%3A1&fit=fill&w=400&bg=fff&ixlib=react-9.10.0',
    'https://hipvan-images-production.imgix.net/product-images/20a497ee-aee0-4433-b237-423323575ff3/Lights-By-HipVan--Olivia-Arched-Floor-Lamp--Brass-Black-Marble-9.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=1%3A1&fit=fill&w=400&bg=fff&ixlib=react-9.10.0',
  ],
  rugs: [
    'https://hipvan-images-production.imgix.net/product-images/9122b2b5-f01f-4978-b9dd-f44767239b65/Bath-Essentials-by-HipVan--EVERYDAY-Bath-Mat--White-7.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=1%3A1&fit=fill&w=400&bg=fff&ixlib=react-9.10.0',
    'https://hipvan-images-production.imgix.net/product-images/a8e7525a-29f4-486f-8cca-45283555e8dc/Floor-Mats-by-HipVan--Toby-Bath-Mat--Bathtub-5.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=1%3A1&fit=fill&w=400&bg=fff&ixlib=react-9.10.0',
    'https://hipvan-images-production.imgix.net/product-images/16b3bba8-64f4-4d96-878c-23b27e80d138/Floor-Mats-by-HipVan--Tropical-Floor-Mat--Coastline-3.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=1%3A1&fit=fill&w=400&bg=fff&ixlib=react-9.10.0',
    'https://hipvan-images-production.imgix.net/product-images/2438939f-8d84-4323-baf8-d51962f6257b/Floor-Mats-by-HipVan--Daisy-Bloom-Floor-Mat-2.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=1%3A1&fit=fill&w=400&bg=fff&ixlib=react-9.10.0',
    'https://hipvan-images-production.imgix.net/product-images/736eeeaa-b91b-4cac-9a64-7b2c580bc827/Floor-Mats-by-HipVan--Della-Bloom-Floor-Mat-2.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=1%3A1&fit=fill&w=400&bg=fff&ixlib=react-9.10.0',
    'https://hipvan-images-production.imgix.net/product-images/6e8fd534-2c35-416e-a85c-68a33b758f5e/Rugs-by-HipVan--Ophelie-Low-Pile-Water-Resistant-Rug-_3-Sizes_-8.png?auto=format%2Ccompress&fm=jpg&cs=srgb&ar=1%3A1&fit=fill&w=400&bg=fff&ixlib=react-9.10.0',
  ],
}

/**
 * Mock collections data following HipVan's collection structure
 */
export const MOCK_COLLECTIONS: Collection[] = [
  {
    id: 'col_sofas',
    name: 'Sofas',
    slug: 'sofas',
    products: [
      {
        id: 'p_sofa1',
        title: 'Noel Sofa Bed - Oatmeal',
        image: PLACEHOLDER_IMAGES.sofas[0],
        price: 599,
        originalPrice: 799,
        discount: 25,
        currency: 'SGD',
        ctaText: 'Shop',
        ctaUrl: '/products/noel-sofa-bed',
      },
      {
        id: 'p_sofa2',
        title: 'Eames Lounge Chair and Ottoman',
        image: PLACEHOLDER_IMAGES.sofas[1],
        price: 1299,
        currency: 'SGD',
        ctaText: 'Shop',
        ctaUrl: '/products/eames-lounge-chair',
      },
      {
        id: 'p_sofa3',
        title: 'Tessa 3 Seater Storage Sofa Bed',
        image: PLACEHOLDER_IMAGES.sofas[2],
        price: 899,
        originalPrice: 1099,
        discount: 18,
        currency: 'SGD',
        ctaText: 'Shop',
        ctaUrl: '/products/tessa-sofa-bed',
      },
      {
        id: 'p_sofa4',
        title: 'Versa Floor Sofa Bed with Adjustable Table',
        image: PLACEHOLDER_IMAGES.sofas[3],
        price: 349,
        currency: 'SGD',
        ctaText: 'Shop',
        ctaUrl: '/products/versa-floor-sofa',
      },
    ],
    ctaText: 'Shop',
    ctaUrl: '/sofas/sofas-loveseats?ref=salepage',
    heroImage: 'https://hiptruck-files.imgix.net/cms-files/3fb17cdf-c5b8-4401-9bc4-d8838d6e54c3/Sofa.png?auto=format,compress&cs=srgb&w=900&h=540&fit=crop',
  },
  {
    id: 'col_mattresses',
    name: 'Signature Mattresses',
    slug: 'mattresses',
    products: [
      {
        id: 'p_matt1',
        title: 'LEVITATE Mattress',
        image: PLACEHOLDER_IMAGES.mattresses[0],
        price: 899,
        currency: 'SGD',
        ctaText: 'Shop',
        ctaUrl: '/products/levitate-mattress',
      },
      {
        id: 'p_matt2',
        title: 'DREAM Mattress',
        image: PLACEHOLDER_IMAGES.mattresses[1],
        price: 699,
        currency: 'SGD',
        ctaText: 'Shop',
        ctaUrl: '/products/dream-mattress',
      },
    ],
    ctaText: 'Shop',
    ctaUrl: '/mattresses-by-hipvan?ref=salepage',
    heroImage: 'https://hiptruck-files.imgix.net/cms-files/3fb17cdf-c5b8-4401-9bc4-d8838d6e54c3/Mattress.png?auto=format,compress&cs=srgb&w=900&h=540&fit=crop',
  },
  {
    id: 'col_bedframes',
    name: 'Bed Frames',
    slug: 'bedframes',
    products: [
      {
        id: 'p_bed1',
        title: 'Katana Single Bed',
        image: PLACEHOLDER_IMAGES.beds[0],
        price: 399,
        currency: 'SGD',
        ctaText: 'Shop',
        ctaUrl: '/products/katana-single-bed',
      },
      {
        id: 'p_bed2',
        title: 'Aiko Super Single Wooden Bed',
        image: PLACEHOLDER_IMAGES.beds[1],
        price: 499,
        currency: 'SGD',
        ctaText: 'Shop',
        ctaUrl: '/products/aiko-super-single',
      },
    ],
    ctaText: 'Shop',
    ctaUrl: '/beds/bed-frames?ref=salepage',
    heroImage: 'https://hiptruck-files.imgix.net/cms-files/3fb17cdf-c5b8-4401-9bc4-d8838d6e54c3/Bedframe.png?auto=format,compress&cs=srgb&w=900&h=540&fit=crop',
  },
  {
    id: 'col_dining_tables',
    name: 'Dining Tables',
    slug: 'dining-tables',
    products: [
      {
        id: 'p_dining1',
        title: 'Macy Dining Chair - Cocoa Grey',
        image: PLACEHOLDER_IMAGES.dining[0],
        price: 149,
        currency: 'SGD',
        ctaText: 'Shop',
        ctaUrl: '/products/macy-dining-chair',
      },
      {
        id: 'p_dining2',
        title: 'Harold Dining Chair',
        image: PLACEHOLDER_IMAGES.dining[1],
        price: 179,
        originalPrice: 229,
        discount: 22,
        currency: 'SGD',
        ctaText: 'Shop',
        ctaUrl: '/products/harold-dining-chair',
      },
    ],
    ctaText: 'Shop',
    ctaUrl: '/dining-all/dining-tables?ref=salepage',
    heroImage: 'https://hiptruck-files.imgix.net/cms-files/3bc8f963-613e-4387-8934-c6bb8f1d7462/Dining-Table-2.png?auto=format,compress&cs=srgb&w=900&h=540&fit=crop',
  },
  {
    id: 'col_dining_chairs',
    name: 'Dining Chairs and Benches',
    slug: 'dining-chairs',
    products: [],
    ctaText: 'Shop',
    ctaUrl: '/dining-all/all-dining-chairs-stools?ref=salepage',
    heroImage: 'https://hiptruck-files.imgix.net/cms-files/3fb17cdf-c5b8-4401-9bc4-d8838d6e54c3/Dining-Chairs-and-Benches.png?auto=format,compress&cs=srgb&w=900&h=540&fit=crop',
  },
  {
    id: 'col_tv_consoles',
    name: 'Tv Consoles',
    slug: 'tv-consoles',
    products: [
      {
        id: 'p_tv1',
        title: 'Leland TV Console 2m',
        image: PLACEHOLDER_IMAGES.tv[0],
        price: 699,
        currency: 'SGD',
        ctaText: 'Shop',
        ctaUrl: '/products/leland-tv-console',
      },
      {
        id: 'p_tv2',
        title: 'Belig Rattan TV Console 2m',
        image: PLACEHOLDER_IMAGES.tv[1],
        price: 849,
        originalPrice: 999,
        discount: 15,
        currency: 'SGD',
        ctaText: 'Shop',
        ctaUrl: '/products/belig-rattan-tv',
      },
    ],
    ctaText: 'Shop',
    ctaUrl: '/furniture-all/tv-consoles?ref=salepage',
    heroImage: 'https://hiptruck-files.imgix.net/cms-files/3fb17cdf-c5b8-4401-9bc4-d8838d6e54c3/TV-Consoles.png?auto=format,compress&cs=srgb&w=900&h=540&fit=crop',
  },
  {
    id: 'col_coffee_tables',
    name: 'Coffee Tables',
    slug: 'coffee-tables',
    products: [
      {
        id: 'p_coffee1',
        title: 'Acapulco Coffee Table',
        image: PLACEHOLDER_IMAGES.coffee[0],
        price: 249,
        currency: 'SGD',
        ctaText: 'Shop',
        ctaUrl: '/products/acapulco-coffee-table',
      },
      {
        id: 'p_coffee2',
        title: 'Rei Coffee Table - Walnut',
        image: PLACEHOLDER_IMAGES.coffee[1],
        price: 329,
        currency: 'SGD',
        ctaText: 'Shop',
        ctaUrl: '/products/rei-coffee-table',
      },
    ],
    ctaText: 'Shop',
    ctaUrl: '/furniture-all/coffee-tables?ref=salepage',
    heroImage: 'https://hiptruck-files.imgix.net/cms-files/3fb17cdf-c5b8-4401-9bc4-d8838d6e54c3/Coffee-Tables.png?auto=format,compress&cs=srgb&w=900&h=540&fit=crop',
  },
  {
    id: 'col_lightings',
    name: 'Lightings',
    slug: 'lightings',
    products: [
      {
        id: 'p_light1',
        title: 'Fairy Lights 10m',
        image: PLACEHOLDER_IMAGES.lighting[0],
        price: 19,
        currency: 'SGD',
        ctaText: 'Shop',
        ctaUrl: '/products/fairy-lights',
      },
      {
        id: 'p_light2',
        title: 'Orla Ombre Floor Lamp',
        image: PLACEHOLDER_IMAGES.lighting[1],
        price: 129,
        currency: 'SGD',
        ctaText: 'Shop',
        ctaUrl: '/products/orla-floor-lamp',
      },
    ],
    ctaText: 'Shop',
    ctaUrl: '/lighting?ref=salepage',
    heroImage: 'https://hiptruck-files.imgix.net/cms-files/3fb17cdf-c5b8-4401-9bc4-d8838d6e54c3/Lighting.png?auto=format,compress&cs=srgb&w=900&h=540&fit=crop',
  },
  {
    id: 'col_rugs',
    name: 'Rugs and Carpets',
    slug: 'rugs',
    products: [
      {
        id: 'p_rug1',
        title: 'EVERYDAY Bath Mat',
        image: PLACEHOLDER_IMAGES.rugs[0],
        price: 15,
        currency: 'SGD',
        ctaText: 'Shop',
        ctaUrl: '/products/everyday-bath-mat',
      },
      {
        id: 'p_rug2',
        title: 'Ophelie Low Pile Rug',
        image: PLACEHOLDER_IMAGES.rugs[5],
        price: 199,
        currency: 'SGD',
        ctaText: 'Shop',
        ctaUrl: '/products/ophelie-rug',
      },
    ],
    ctaText: 'Shop',
    ctaUrl: '/all-rugs-carpets?ref=salepage',
    heroImage: 'https://hiptruck-files.imgix.net/cms-files/3fb17cdf-c5b8-4401-9bc4-d8838d6e54c3/Rugs-and-Carpets.png?auto=format,compress&cs=srgb&w=900&h=540&fit=crop',
  },
  {
    id: 'col_mirrors',
    name: 'Mirrors',
    slug: 'mirrors',
    products: [],
    ctaText: 'Shop',
    ctaUrl: '/decor/new-mirrors?ref=salepage',
    heroImage: 'https://hiptruck-files.imgix.net/cms-files/3bc8f963-613e-4387-8934-c6bb8f1d7462/Mirrors-2.png?auto=format,compress&cs=srgb&w=900&h=540&fit=crop',
  },
  {
    id: 'col_home_decor',
    name: 'Home Decor',
    slug: 'home-decor',
    products: [],
    ctaText: 'Shop',
    ctaUrl: '/decor?ref=salepage',
    heroImage: 'https://hiptruck-files.imgix.net/cms-files/3bc8f963-613e-4387-8934-c6bb8f1d7462/Home-decor-2.png?auto=format,compress&cs=srgb&w=900&h=540&fit=crop',
  },
  {
    id: 'col_kids',
    name: 'Kids',
    slug: 'kids',
    products: [],
    ctaText: 'Shop',
    ctaUrl: '/kids?ref=salepage',
    heroImage: 'https://hiptruck-files.imgix.net/cms-files/3fb17cdf-c5b8-4401-9bc4-d8838d6e54c3/Kids.png?auto=format,compress&cs=srgb&w=900&h=540&fit=crop',
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
    const descMatch = col.description?.toLowerCase().includes(normalizedQuery)
    return nameMatch || slugMatch || descMatch
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
