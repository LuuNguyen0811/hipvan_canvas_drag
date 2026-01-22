import React from 'react'
import { Search, LayoutList, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { CollectionComponentData, CollectionItemData } from '@/lib/types'
import { searchCollections, getCollectionById, type Collection } from '@/lib/mock-collections'

interface CollectionEditDialogProps {
  isOpen: boolean
  onClose: () => void
  editingCollectionData: CollectionComponentData | null
  setEditingCollectionData: (data: CollectionComponentData | null) => void
  collectionSearchQuery: string
  setCollectionSearchQuery: (query: string) => void
  collectionSearchResults: Collection[]
  setCollectionSearchResults: (results: Collection[]) => void
  handleSaveCollection: () => void
}

export function CollectionEditDialog({
  isOpen,
  onClose,
  editingCollectionData,
  setEditingCollectionData,
  collectionSearchQuery,
  setCollectionSearchQuery,
  collectionSearchResults,
  setCollectionSearchResults,
  handleSaveCollection,
}: CollectionEditDialogProps) {
  if (!editingCollectionData) return null

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Configure Collection</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Header Title</Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showHeader"
                  checked={editingCollectionData.showHeader ?? true}
                  onChange={(e) => setEditingCollectionData({ ...editingCollectionData, showHeader: e.target.checked })}
                  className="h-4 w-4 rounded border-border"
                />
                <label htmlFor="showHeader" className="text-xs text-muted-foreground cursor-pointer">Show on page</label>
              </div>
            </div>
            <Input
              placeholder="e.g. Shop Our Bestselling Collections"
              value={editingCollectionData.headerTitle || ''}
              onChange={(e) => setEditingCollectionData({ ...editingCollectionData, headerTitle: e.target.value })}
            />
          </div>
          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="search" className="gap-2">
                <Search className="h-4 w-4" />
                Search Collection
              </TabsTrigger>
              <TabsTrigger value="manual" className="gap-2">
                <LayoutList className="h-4 w-4" />
                Manual Entry
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="search" className="space-y-4 mt-4">
              {/* Selected Collections List */}
              {(editingCollectionData.collectionIds?.length ?? 0) > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Selected Collections</Label>
                  <div className="flex flex-wrap gap-2">
                    {editingCollectionData.collectionIds?.map((id) => {
                      const col = getCollectionById(id);
                      if (!col) return null;
                      return (
                        <div 
                          key={id} 
                          className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 py-1 pl-1 pr-2"
                        >
                          <div className="h-6 w-6 flex-shrink-0 overflow-hidden rounded-full bg-muted">
                            {col.image && (
                              <img src={col.image} alt={col.name} className="h-full w-full object-cover" />
                            )}
                          </div>
                          <span className="text-xs font-medium">{col.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const nextIds = editingCollectionData.collectionIds?.filter(i => i !== id) || [];
                              const selectedCollections = nextIds.map(i => getCollectionById(i)).filter(Boolean) as Collection[];
                              const items: CollectionItemData[] = selectedCollections.map(c => ({
                                id: c.id,
                                title: c.name,
                                image: c.image,
                                ctaText: c.ctaText,
                                ctaUrl: c.ctaUrl,
                              }));
                              setEditingCollectionData({
                                ...editingCollectionData,
                                collectionIds: nextIds,
                                collectionId: nextIds[0],
                                collectionName: selectedCollections.map(c => c.name).join(', '),
                                items,
                              });
                            }}
                            className="ml-1 rounded-full p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Search Input */}
              <div className="space-y-2">
                <Label>Search Collections</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Type to search collections..."
                    value={collectionSearchQuery}
                    onChange={(e) => {
                      const query = e.target.value
                      setCollectionSearchQuery(query)
                      setCollectionSearchResults(searchCollections(query))
                    }}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {/* Autocomplete Dropdown */}
              <div className="max-h-48 overflow-y-auto rounded-lg border border-border bg-card">
                {collectionSearchResults.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">No collections found</div>
                ) : (
                  collectionSearchResults.map((collection) => {
                    const isSelected = editingCollectionData.collectionIds?.includes(collection.id);
                    return (
                      <button
                        key={collection.id}
                        onClick={() => {
                          if (isSelected) return;
                          
                          const currentIds = editingCollectionData.collectionIds || [];
                          const nextIds = [...currentIds, collection.id];
                          
                          const selectedCollections = nextIds.map(id => getCollectionById(id)).filter(Boolean) as Collection[];
                          const items: CollectionItemData[] = selectedCollections.map(col => ({
                            id: col.id,
                            title: col.name,
                            image: col.image,
                            ctaText: col.ctaText,
                            ctaUrl: col.ctaUrl,
                          }));
                          
                          setEditingCollectionData({
                            ...editingCollectionData,
                            sourceType: 'api',
                            collectionIds: nextIds,
                            collectionId: nextIds[0],
                            collectionName: selectedCollections.map(c => c.name).join(', '),
                            items,
                            headerTitle: editingCollectionData.headerTitle || 'Shop Our Bestselling Collections',
                          });
                        }}
                        disabled={isSelected}
                        className={`flex w-full items-center gap-3 border-b border-border px-3 py-2 text-left transition-colors last:border-b-0 ${
                          isSelected 
                            ? 'cursor-not-allowed bg-muted/50 opacity-50' 
                            : 'hover:bg-accent'
                        }`}
                      >
                        <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded bg-muted">
                          {collection.image && (
                            <img src={collection.image} alt={collection.name} className="h-full w-full object-cover" />
                          )}
                        </div>
                        <span className="truncate text-sm">{collection.name}</span>
                        {isSelected && (
                          <span className="ml-auto text-xs text-muted-foreground">Added</span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="manual" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Collection Items</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newItem: CollectionItemData = {
                        id: `item_${Date.now()}`,
                        title: 'New Item',
                        ctaText: 'Shop',
                        ctaUrl: '#',
                      }
                      setEditingCollectionData({
                        ...editingCollectionData,
                        sourceType: 'manual',
                        items: [...(editingCollectionData.items || []), newItem],
                      })
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>
                
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {editingCollectionData.items.map((item, index) => (
                    <div key={item.id} className="flex gap-3 rounded-lg border border-border p-3">
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Item title"
                          value={item.title}
                          onChange={(e) => {
                            const newItems = [...(editingCollectionData.items || [])]
                            newItems[index] = { ...newItems[index], title: e.target.value }
                            setEditingCollectionData({ ...editingCollectionData, items: newItems })
                          }}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            placeholder="Image URL"
                            value={item.image || ''}
                            onChange={(e) => {
                              const newItems = [...(editingCollectionData.items || [])]
                              newItems[index] = { ...newItems[index], image: e.target.value }
                              setEditingCollectionData({ ...editingCollectionData, items: newItems })
                            }}
                          />
                          <Input
                            placeholder="CTA Text"
                            value={item.ctaText}
                            onChange={(e) => {
                              const newItems = [...(editingCollectionData.items || [])]
                              newItems[index] = { ...newItems[index], ctaText: e.target.value }
                              setEditingCollectionData({ ...editingCollectionData, items: newItems })
                            }}
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => {
                          const newItems = editingCollectionData.items.filter((_, i) => i !== index)
                          setEditingCollectionData({ ...editingCollectionData, items: newItems })
                        }}
                      >
                        <TrashX className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="border-t p-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSaveCollection}>
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function TrashX(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="14" y1="11" y2="17" />
      <line x1="14" x2="10" y1="11" y2="17" />
    </svg>
  )
}
