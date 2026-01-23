import React from 'react'
import { Search, LayoutList, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
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
import { Palette, Trash2, Columns, Rows, Grid2X2, Maximize2, MoveHorizontal } from 'lucide-react'

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm hover:scale-110 transition-transform">
              <LayoutList className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold tracking-tight text-[#1E1B4B]">Configure Collection</DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Manage your items and customize the visual appearance.
              </p>
            </div>
          </div>
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
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/20 p-1 rounded-2xl border border-divider">
              <TabsTrigger value="content" className="gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
                <LayoutList className="h-4 w-4" />
                Items & Content
              </TabsTrigger>
              <TabsTrigger value="style" className="gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
                <Palette className="h-4 w-4" />
                Style & Appearance
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="space-y-6 mt-6 outline-none animate-in fade-in-50 duration-500">
              <div className="space-y-6">
                {/* Search and Selection Area */}
                <div className="space-y-4 rounded-2xl border border-divider bg-accent/5 p-6 transition-all focus-within:ring-2 focus-within:ring-primary/10">
                  <div className="space-y-4">
                    <Label className="text-[12px] font-bold uppercase tracking-wider text-primary/70 block">Source & Selection</Label>
                    
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      {/* Search Input Inlined */}
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search for collections to add..."
                          value={collectionSearchQuery}
                          onChange={(e) => {
                            const query = e.target.value
                            setCollectionSearchQuery(query)
                            setCollectionSearchResults(searchCollections(query))
                          }}
                          className="pl-10 h-11 rounded-xl bg-white border-none shadow-sm transition-all focus:ring-2 focus:ring-primary/20 w-full"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-px bg-divider mx-1 hidden sm:block" />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2 rounded-xl text-primary hover:bg-primary/5 transition-all px-4 h-11 shrink-0 font-medium"
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
                              items: [newItem, ...(editingCollectionData.items || [])],
                            })
                          }}
                        >
                          <Plus className="h-4 w-4" />
                          Manual Item
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Autocomplete Dropdown Overlay (Simplified) */}
                  {collectionSearchQuery.trim() !== '' && (
                    <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-divider bg-white p-1 shadow-xl">
                      {collectionSearchResults.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                          <p className="text-sm text-muted-foreground italic">No collections found.</p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-2 text-primary hover:bg-primary/5"
                            onClick={() => {
                              const newItem: CollectionItemData = {
                                id: `item_${Date.now()}`,
                                title: collectionSearchQuery,
                                ctaText: 'Shop',
                                ctaUrl: '#',
                              }
                              setEditingCollectionData({
                                ...editingCollectionData,
                                sourceType: 'manual',
                                items: [newItem, ...(editingCollectionData.items || [])],
                              })
                              setCollectionSearchQuery('')
                            }}
                          >
                            Add "{collectionSearchQuery}" as a manual item?
                          </Button>
                        </div>
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
                                });
                                setCollectionSearchQuery('');
                              }}
                              disabled={isSelected}
                              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all ${
                                isSelected ? 'bg-muted/40 cursor-default opacity-50' : 'hover:bg-primary/5 hover:translate-x-1'
                              }`}
                            >
                              <div className="h-8 w-8 rounded bg-muted overflow-hidden">
                                {collection.image && <img src={collection.image} className="h-full w-full object-cover" />}
                              </div>
                              <span className="text-sm font-medium">{collection.name}</span>
                              {isSelected && <span className="ml-auto text-[10px] font-bold uppercase text-primary">Added</span>}
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* Active Items List - Combined API & Manual */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <Label className="text-[12px] font-bold uppercase tracking-wider text-[#1E1B4B]/70">Collection Items ({editingCollectionData.items.length})</Label>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Drag to reorder items (coming soon)</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 max-h-[450px] overflow-y-auto pr-2 scrollbar-thin">
                    {editingCollectionData.items.map((item, index) => (
                      <div key={item.id} className="group relative rounded-2xl border border-divider bg-white p-4 transition-all hover:bg-accent/5 hover:shadow-md hover:border-primary/20">
                        <div className="flex gap-4">
                          <div className="h-16 w-20 flex-shrink-0 rounded-lg bg-muted overflow-hidden border border-border/50 shadow-inner group-hover:scale-105 transition-transform">
                            {item.image ? (
                              <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted/50 to-muted/20">
                                <Plus className="h-5 w-5 text-muted-foreground/30" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground/70">Title</span>
                              <Input
                                value={item.title}
                                className="h-8 rounded-lg bg-muted/30 border-none shadow-none focus:bg-white focus:ring-1"
                                onChange={(e) => {
                                  const newItems = [...(editingCollectionData.items || [])]
                                  newItems[index] = { ...newItems[index], title: e.target.value }
                                  setEditingCollectionData({ ...editingCollectionData, items: newItems })
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground/70">Button Label</span>
                              <Input
                                value={item.ctaText}
                                className="h-8 rounded-lg bg-muted/30 border-none shadow-none focus:bg-white focus:ring-1"
                                onChange={(e) => {
                                  const newItems = [...(editingCollectionData.items || [])]
                                  newItems[index] = { ...newItems[index], ctaText: e.target.value }
                                  setEditingCollectionData({ ...editingCollectionData, items: newItems })
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground/70">Link URL</span>
                              <Input
                                value={item.ctaUrl}
                                className="h-8 rounded-lg bg-muted/30 border-none shadow-none focus:bg-white focus:ring-1 text-xs font-mono"
                                onChange={(e) => {
                                  const newItems = [...(editingCollectionData.items || [])]
                                  newItems[index] = { ...newItems[index], ctaUrl: e.target.value }
                                  setEditingCollectionData({ ...editingCollectionData, items: newItems })
                                }}
                              />
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
                            onClick={() => {
                              const newItems = editingCollectionData.items.filter((_, i) => i !== index)
                              // Also remove from collectionIds if it was an API item
                              const nextCollectionIds = editingCollectionData.collectionIds?.filter(id => id !== item.id) || [];
                              setEditingCollectionData({ 
                                ...editingCollectionData, 
                                items: newItems,
                                collectionIds: nextCollectionIds 
                              })
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {editingCollectionData.items.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-divider bg-accent/5">
                        <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                          <LayoutList className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                        <h4 className="text-lg font-semibold text-[#1E1B4B]">No items yet</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Search for a collection or create items manually to get started.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="style" className="mt-6 outline-none animate-in fade-in-50 duration-500">
              <div className="flex flex-col gap-8">
                {/* High-Fidelity Preview (based on actual design) */}
                <div className="flex justify-center py-6 bg-muted/5 rounded-2xl border border-divider/50">
                  <div 
                    className="w-[220px] overflow-hidden rounded-xl shadow-xl transition-all border border-divider"
                    style={{ backgroundColor: editingCollectionData.itemBgColor || '#ffffff' }}
                  >
                    {/* Image Area from Item 1 */}
                    <div className="w-full aspect-[16/10] bg-muted relative">
                      {editingCollectionData.items?.[0]?.image ? (
                        <img 
                          src={editingCollectionData.items[0].image} 
                          className="h-full w-full object-cover" 
                          alt="preview"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/30">
                          <Grid2X2 className="h-8 w-8 text-muted-foreground/20" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content area matching screenshot layout */}
                    <div className="p-4 flex items-center justify-between gap-3">
                      <span className="text-[13px] font-bold text-[#1E1B4B] truncate pr-1">
                        {editingCollectionData.items?.[0]?.title || 'Dining Tables'}
                      </span>
                      <div 
                        className="px-4 py-1.5 rounded-lg text-[11px] font-bold shadow-sm transition-all"
                        style={{ 
                          backgroundColor: editingCollectionData.itemCtaBgColor || '#ff4d5f',
                          color: editingCollectionData.itemCtaTextColor || '#ffffff'
                        }}
                      >
                        {editingCollectionData.items?.[0]?.ctaText || 'Shop'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Minimalist Line-based Settings */}
                <div className="space-y-0 px-2">
                  {/* Layout Section */}
                  <div className="py-4 border-b border-divider/50 grid grid-cols-[140px_1fr] items-center gap-6">
                    <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Orientation</Label>
                    <div className="flex bg-muted/30 p-1 rounded-xl w-fit border border-divider/20">
                      <button
                        onClick={() => setEditingCollectionData({...editingCollectionData, layout: 'horizontal'})}
                        className={cn(
                          "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2",
                          editingCollectionData.layout === 'horizontal' 
                            ? "bg-white shadow-sm text-primary ring-1 ring-black/5" 
                            : "text-muted-foreground hover:text-slate-600 hover:bg-white/50"
                        )}
                      >
                        <Columns className="h-3.5 w-3.5" />
                        Horizontal
                      </button>
                      <button
                        onClick={() => setEditingCollectionData({...editingCollectionData, layout: 'vertical'})}
                        className={cn(
                          "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2",
                          editingCollectionData.layout === 'vertical' 
                            ? "bg-white shadow-sm text-primary ring-1 ring-black/5" 
                            : "text-muted-foreground hover:text-slate-600 hover:bg-white/50"
                        )}
                      >
                        <Rows className="h-3.5 w-3.5" />
                        Vertical
                      </button>
                    </div>
                  </div>

                  <div className="py-4 border-b border-divider/50 grid grid-cols-[140px_1fr] items-center gap-6">
                    <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Layout & Spacing</Label>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-400 font-bold">ITEMS</span>
                        <Input 
                          type="number" min={1} max={6}
                          value={editingCollectionData.itemsPerRow || 4}
                          className="h-9 w-16 rounded-lg bg-muted/20 border-divider/50 text-center text-xs font-bold focus:bg-white transition-colors"
                          onChange={(e) => setEditingCollectionData({...editingCollectionData, itemsPerRow: parseInt(e.target.value)})}
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-400 font-bold">GAP</span>
                        <Input 
                          placeholder="24px"
                          value={editingCollectionData.gap || ''}
                          className="h-9 w-24 rounded-lg bg-muted/20 border-divider/50 text-center text-xs font-mono focus:bg-white transition-colors"
                          onChange={(e) => setEditingCollectionData({...editingCollectionData, gap: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Aesthetic Section */}
                  <div className="py-4 border-b border-divider/50 grid grid-cols-[140px_1fr] items-center gap-6">
                    <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Action Button</Label>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-400 font-bold">BG</span>
                        <div className="flex items-center gap-2 bg-muted/20 px-2 py-1 rounded-lg border border-divider/50">
                          <Input type="color" value={editingCollectionData.itemCtaBgColor || '#ff4d5f'} className="w-5 h-5 p-0 border-none bg-transparent cursor-pointer rounded-full overflow-hidden" onChange={(e) => setEditingCollectionData({...editingCollectionData, itemCtaBgColor: e.target.value})} />
                          <span className="text-[10px] font-mono font-bold text-slate-600 uppercase">{editingCollectionData.itemCtaBgColor || '#ff4d5f'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-400 font-bold">TEXT</span>
                        <div className="flex items-center gap-2 bg-muted/20 px-2 py-1 rounded-lg border border-divider/50">
                          <Input type="color" value={editingCollectionData.itemCtaTextColor || '#ffffff'} className="w-5 h-5 p-0 border-none bg-transparent cursor-pointer rounded-full overflow-hidden" onChange={(e) => setEditingCollectionData({...editingCollectionData, itemCtaTextColor: e.target.value})} />
                          <span className="text-[10px] font-mono font-bold text-slate-600 uppercase">{editingCollectionData.itemCtaTextColor || '#ffffff'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="py-4 grid grid-cols-[140px_1fr] items-center gap-6">
                    <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Card Container</Label>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400 font-bold">BG</span>
                      <div className="flex items-center gap-2 bg-muted/20 px-2 py-1 rounded-lg border border-divider/50">
                        <Input type="color" value={editingCollectionData.itemBgColor || '#ffffff'} className="w-5 h-5 p-0 border-none bg-transparent cursor-pointer rounded-full overflow-hidden" onChange={(e) => setEditingCollectionData({...editingCollectionData, itemBgColor: e.target.value})} />
                        <span className="text-[10px] font-mono font-bold text-slate-600 uppercase">{editingCollectionData.itemBgColor || '#ffffff'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="border-t bg-muted/30 p-4 px-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} className="hover:bg-background">
            Cancel
          </Button>
          <Button onClick={handleSaveCollection} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 px-8">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
