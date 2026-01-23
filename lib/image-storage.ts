// Image storage using IndexedDB for large file support
const DB_NAME = 'website-builder-images'
const STORE_NAME = 'images'
const DB_VERSION = 1

// Maximum image dimensions for compression
const MAX_WIDTH = 1200
const MAX_HEIGHT = 900
const JPEG_QUALITY = 0.85

let dbPromise: Promise<IDBDatabase> | null = null

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
  })

  return dbPromise
}

// Compress and resize image
async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width
        let height = img.height
        
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height)
          width = Math.floor(width * ratio)
          height = Math.floor(height * ratio)
        }
        
        // Create canvas and draw resized image
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }
        
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to compress image'))
            }
          },
          'image/jpeg',
          JPEG_QUALITY
        )
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

// Save image to IndexedDB
export async function saveImage(imageId: string, file: File): Promise<string> {
  try {
    // Compress image first
    const compressedBlob = await compressImage(file)
    
    // Save to IndexedDB
    const db = await openDB()
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put(compressedBlob, imageId)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
    
    // Return object URL for immediate display
    return URL.createObjectURL(compressedBlob)
  } catch (error) {
    console.error('Failed to save image:', error)
    throw error
  }
}

// Load image from IndexedDB
export async function loadImage(imageId: string): Promise<string | null> {
  try {
    const db = await openDB()
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    
    const blob = await new Promise<Blob | undefined>((resolve, reject) => {
      const request = store.get(imageId)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    
    if (!blob) return null
    
    return URL.createObjectURL(blob)
  } catch (error) {
    console.error('Failed to load image:', error)
    return null
  }
}

// Delete image from IndexedDB
export async function deleteImage(imageId: string): Promise<void> {
  try {
    const db = await openDB()
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    
    await new Promise<void>((resolve, reject) => {
      const request = store.delete(imageId)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('Failed to delete image:', error)
  }
}

// Get all image IDs
export async function getAllImageIds(): Promise<string[]> {
  try {
    const db = await openDB()
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    
    return new Promise((resolve, reject) => {
      const request = store.getAllKeys()
      request.onsuccess = () => resolve(request.result as string[])
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('Failed to get image IDs:', error)
    return []
  }
}

// Clear all images
export async function clearAllImages(): Promise<void> {
  try {
    const db = await openDB()
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    
    await new Promise<void>((resolve, reject) => {
      const request = store.clear()
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('Failed to clear images:', error)
  }
}

// Get image as base64 data URL for HTML export
export async function getImageAsBase64(imageId: string): Promise<string | null> {
  try {
    const db = await openDB()
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    
    const blob = await new Promise<Blob | undefined>((resolve, reject) => {
      const request = store.get(imageId)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    
    if (!blob) return null
    
    // Convert blob to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Failed to get image as base64:', error)
    return null
  }
}
