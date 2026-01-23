import React, { useRef } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ImageUploadDialogProps {
  isOpen: boolean
  onClose: () => void
  uploadingImage: boolean
  handleFileUpload: (file: File) => void
}

export function ImageUploadDialog({
  isOpen,
  onClose,
  uploadingImage,
  handleFileUpload,
}: ImageUploadDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !uploadingImage && !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Image</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          {uploadingImage ? (
            <div className="flex h-48 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30">
              <div className="mb-3 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm font-medium text-foreground">Compressing image...</p>
              <p className="mt-1 text-xs text-muted-foreground">This may take a moment for large files</p>
            </div>
          ) : (
            <>
              <div
                className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-primary hover:bg-muted/50"
                onClick={() => fileInputRef.current?.click()}
                onDrop={(e) => {
                  e.preventDefault()
                  const file = e.dataTransfer.files[0]
                  if (file) {
                    handleFileUpload(file)
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <Upload className="mb-2 h-12 w-12 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">Drop image here or click to browse</p>
                <p className="mt-1 text-xs text-muted-foreground">Supports JPG, PNG, GIF, WebP</p>
                <p className="mt-1 text-xs text-muted-foreground/70">Images will be automatically compressed</p>
              </div>
              <div className="rounded-lg bg-blue-500/10 p-3 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">💡 Tip:</p>
                <p className="mt-1">Images are automatically resized to max 1920x1080 and compressed to save storage space.</p>
              </div>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                handleFileUpload(file)
              }
            }}
          />
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={uploadingImage}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
