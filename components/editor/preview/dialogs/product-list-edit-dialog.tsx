import React, { useRef } from 'react'
import { LayoutList, Plus, Trash2, Upload, Image as ImageIcon, AlignLeft, AlignCenter, AlignRight, DollarSign, Tag, Columns, Rows, Search, X } from 'lucide-react'
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
import type { ProductListComponentData, ProductItemData } from '@/lib/types'
import { searchProducts, getProductById, type Product } from '@/lib/mock-products'

interface ProductListEditDialogProps {
  isOpen: boolean
  onClose: () => void
  editingProductListData: ProductListComponentData | null
  setEditingProductListData: (data: ProductListComponentData | null) => void
  productSearchQuery: string
  setProductSearchQuery: (query: string) => void
  productSearchResults: any[]
  setProductSearchResults: (results: any[]) => void
  handleSaveProductList: () => void
}

export function ProductListEditDialog({
  isOpen,
  onClose,
  editingProductListData,
  setEditingProductListData,
  productSearchQuery,
  setProductSearchQuery,
  productSearchResults,
  setProductSearchResults,
  handleSaveProductList,
}: ProductListEditDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingForItem, setUploadingForItem] = React.useState<number | null>(null)

  if (!editingProductListData) return null

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
              <Tag className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold tracking-tight text-[#1E1B4B]">Configure Product List</DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Manage your products and customize the grid layout.
              </p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Header Title</Label>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-muted/30 p-1 rounded-lg border border-divider/20">
                  <button
                    onClick={() => setEditingProductListData({ ...editingProductListData, headerAlignment: 'left' })}
                    className={cn(
                      "p-1.5 rounded-md transition-all",
                      (editingProductListData.headerAlignment === 'left' || !editingProductListData.headerAlignment) 
                        ? "bg-white shadow-sm text-primary" 
                        : "text-muted-foreground hover:bg-white/50"
                    )}
                  >
                    <AlignLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setEditingProductListData({ ...editingProductListData, headerAlignment: 'center' })}
                    className={cn(
                      "p-1.5 rounded-md transition-all",
                      editingProductListData.headerAlignment === 'center' 
                        ? "bg-white shadow-sm text-primary" 
                        : "text-muted-foreground hover:bg-white/50"
                    )}
                  >
                    <AlignCenter className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setEditingProductListData({ ...editingProductListData, headerAlignment: 'right' })}
                    className={cn(
                      "p-1.5 rounded-md transition-all",
                      editingProductListData.headerAlignment === 'right' 
                        ? "bg-white shadow-sm text-primary" 
                        : "text-muted-foreground hover:bg-white/50"
                    )}
                  >
                    <AlignRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showHeader"
                    checked={editingProductListData.showHeader ?? true}
                    onChange={(e) => setEditingProductListData({ ...editingProductListData, showHeader: e.target.checked })}
                    className="h-4 w-4 rounded border-border"
                  />
                  <label htmlFor="showHeader" className="text-xs text-muted-foreground cursor-pointer">Show Title</label>
                </div>
              </div>
            </div>
            <Input
              placeholder="e.g. Recently Viewed Products"
              value={editingProductListData.headerTitle || ''}
              onChange={(e) => setEditingProductListData({ ...editingProductListData, headerTitle: e.target.value })}
              className="h-11 rounded-xl"
            />
          </div>

          <Tabs defaultValue="products" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/20 p-1 rounded-2xl border border-divider">
              <TabsTrigger 
                value="products" 
                className="flex items-center justify-center gap-2 rounded-xl"
              >
                <Tag className="h-4 w-4" />
                Products
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="flex items-center justify-center gap-2 rounded-xl"
              >
                <Columns className="h-4 w-4" />
                Grid Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="products" className="space-y-6 mt-6 outline-none animate-in fade-in-50 duration-500">
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
                          placeholder="Search for products to add..."
                          value={productSearchQuery}
                          onChange={(e) => {
                            const query = e.target.value
                            setProductSearchQuery(query)
                            setProductSearchResults(searchProducts(query))
                          }}
                          className="pl-10 pr-10 h-11 rounded-xl bg-white border-none shadow-sm transition-all focus:ring-2 focus:ring-primary/20 w-full"
                        />

                        {productSearchQuery && (
                          <button
                            onClick={() => {
                              setProductSearchQuery('')
                              setProductSearchResults([])
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}

                        {/* Autocomplete Dropdown Overlay - Floating */}
                        {productSearchQuery.trim() !== '' && (
                          <div className="absolute top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto rounded-xl border border-divider bg-white p-1 shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-200">
                            {productSearchResults.length === 0 ? (
                              <div className="flex flex-col items-center justify-center py-6 text-center">
                                <p className="text-sm text-muted-foreground italic">No products found.</p>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="mt-2 text-primary hover:bg-primary/5"
                                  onClick={() => {
                                    const newItem: ProductItemData = {
                                      id: `item_${Date.now()}`,
                                      title: productSearchQuery,
                                      price: '$0',
                                      url: '#',
                                    }
                                    setEditingProductListData({
                                      ...editingProductListData,
                                      sourceType: 'manual',
                                      items: [newItem, ...(editingProductListData.items || [])],
                                    })
                                    setProductSearchQuery('')
                                  }}
                                >
                                  Add "{productSearchQuery}" as a manual item?
                                </Button>
                              </div>
                            ) : (
                              productSearchResults.map((product) => {
                                const isSelected = editingProductListData.productIds?.includes(product.id);
                                return (
                                  <button
                                    key={product.id}
                                    onClick={() => {
                                      if (isSelected) return;
                                      const currentIds = editingProductListData.productIds || [];
                                      const nextIds = [...currentIds, product.id];
                                      
                                      const newItem: ProductItemData = {
                                        id: product.id,
                                        title: product.name,
                                        price: product.price,
                                        originalPrice: product.originalPrice,
                                        image: product.image,
                                        url: product.url,
                                        badge: product.badge,
                                      };
                                      
                                      setEditingProductListData({
                                        ...editingProductListData,
                                        sourceType: 'api',
                                        productIds: nextIds,
                                        items: [newItem, ...(editingProductListData.items || [])],
                                      });
                                      setProductSearchQuery('');
                                    }}
                                    disabled={isSelected}
                                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all ${
                                      isSelected ? 'bg-muted/40 cursor-default opacity-50' : 'hover:bg-primary/5 hover:translate-x-1'
                                    }`}
                                  >
                                    <div className="h-8 w-8 rounded bg-muted overflow-hidden flex items-center justify-center">
                                      {product.image ? (
                                        <img src={product.image} className="h-full w-full object-contain" />
                                      ) : (
                                        <ImageIcon className="h-4 w-4 text-muted-foreground/20" />
                                      )}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-medium line-clamp-1">{product.name}</span>
                                      <span className="text-xs text-muted-foreground">{product.price}</span>
                                    </div>
                                    {isSelected && <span className="ml-auto text-[10px] font-bold uppercase text-primary">Added</span>}
                                  </button>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-px bg-divider mx-1 hidden sm:block" />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2 rounded-xl text-primary hover:bg-primary/5 transition-all px-4 h-11 shrink-0 font-medium"
                          onClick={() => {
                            const newItem: ProductItemData = {
                              id: `item_${Date.now()}`,
                              title: 'New Product',
                              price: '$0',
                              url: '#',
                            }
                            setEditingProductListData({
                              ...editingProductListData,
                              sourceType: 'manual',
                              items: [newItem, ...(editingProductListData.items || [])],
                            })
                          }}
                        >
                          <Plus className="h-4 w-4" />
                          Manual Product
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Items List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <Label className="text-[12px] font-bold uppercase tracking-wider text-slate-500">Product Items ({editingProductListData.items.length})</Label>
                  </div>

                  <div className="grid grid-cols-1 gap-6 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                    {editingProductListData.items.map((item, index) => (
                      <div key={item.id} className="group relative rounded-2xl border border-divider bg-white p-5 transition-all hover:border-primary/30 hover:shadow-lg">
                        <div className="flex items-start gap-6">
                          {/* Image Preview & Delete Action */}
                          <div className="flex flex-col gap-3">
                            <div className="h-20 w-24 flex-shrink-0 rounded-xl bg-muted overflow-hidden border border-divider/50 shadow-inner group-hover:scale-[1.02] transition-transform flex items-center justify-center">
                              {item.image ? (
                                <img src={item.image} alt={item.title} className="h-full w-full object-contain" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted/50 to-muted/20">
                                  <ImageIcon className="h-6 w-6 text-muted-foreground/20" />
                                </div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full text-destructive hover:bg-destructive/10 h-7 gap-2 font-bold text-[9px] uppercase"
                              onClick={() => {
                                const newItems = editingProductListData.items.filter((_, i) => i !== index)
                                const nextProductIds = editingProductListData.productIds?.filter(id => id !== item.id) || [];
                                setEditingProductListData({ 
                                  ...editingProductListData, 
                                  items: newItems,
                                  productIds: nextProductIds 
                                })
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                              Remove
                            </Button>
                          </div>
                          
                          {/* Vertical fields stack */}
                          <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="col-span-2 space-y-1.5">
                                <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Product Title</Label>
                                <Input
                                  value={item.title || ''}
                                  placeholder="Enter product title..."
                                  className="h-10 rounded-xl bg-muted/20 border-divider/50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                                  onChange={(e) => {
                                    const newItems = [...(editingProductListData.items || [])]
                                    newItems[index] = { ...newItems[index], title: e.target.value }
                                    setEditingProductListData({ ...editingProductListData, items: newItems })
                                  }}
                                />
                              </div>

                              <div className="space-y-1.5">
                                <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Price</Label>
                                <Input
                                  value={item.price || ''}
                                  placeholder="$0"
                                  className="h-10 rounded-xl bg-muted/20 border-divider/50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                                  onChange={(e) => {
                                    const newItems = [...(editingProductListData.items || [])]
                                    newItems[index] = { ...newItems[index], price: e.target.value }
                                    setEditingProductListData({ ...editingProductListData, items: newItems })
                                  }}
                                />
                              </div>

                              <div className="space-y-1.5">
                                <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Original Price</Label>
                                <Input
                                  value={item.originalPrice || ''}
                                  placeholder="e.g. $499"
                                  className="h-10 rounded-xl bg-muted/20 border-divider/50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                                  onChange={(e) => {
                                    const newItems = [...(editingProductListData.items || [])]
                                    newItems[index] = { ...newItems[index], originalPrice: e.target.value }
                                    setEditingProductListData({ ...editingProductListData, items: newItems })
                                  }}
                                />
                              </div>

                              <div className="col-span-2 space-y-1.5">
                                <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Target URL</Label>
                                <Input
                                  value={item.url || ''}
                                  placeholder="/products/..."
                                  className="h-10 rounded-xl bg-muted/20 border-divider/50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all text-xs font-mono"
                                  onChange={(e) => {
                                    const newItems = [...(editingProductListData.items || [])]
                                    newItems[index] = { ...newItems[index], url: e.target.value }
                                    setEditingProductListData({ ...editingProductListData, items: newItems })
                                  }}
                                />
                              </div>

                              <div className="col-span-2 space-y-1.5">
                                <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Image Source / Badge</Label>
                                <div className="flex gap-2">
                                  <Input
                                    value={item.image || ''}
                                    placeholder="https://..."
                                    className="h-10 rounded-xl bg-muted/20 border-divider/50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all text-xs font-mono flex-1"
                                    onChange={(e) => {
                                      const newItems = [...(editingProductListData.items || [])]
                                      newItems[index] = { ...newItems[index], image: e.target.value }
                                      setEditingProductListData({ ...editingProductListData, items: newItems })
                                    }}
                                  />
                                  <Input
                                    value={item.badge || ''}
                                    placeholder="Badge (e.g. Sale)"
                                    className="h-10 rounded-xl bg-muted/20 border-divider/50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all text-xs w-1/3"
                                    onChange={(e) => {
                                      const newItems = [...(editingProductListData.items || [])]
                                      newItems[index] = { ...newItems[index], badge: e.target.value }
                                      setEditingProductListData({ ...editingProductListData, items: newItems })
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {editingProductListData.items.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-divider bg-accent/5">
                        <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                          <Tag className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                        <h4 className="text-lg font-semibold text-[#1E1B4B]">No products yet</h4>
                        <p className="text-sm text-muted-foreground mt-1 text-center max-w-[280px]">
                          Search for products or add them manually to get started.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-0 mt-6 outline-none animate-in fade-in-50 duration-500 px-2">
              {/* Orientation Section */}
              <div className="py-4 border-b border-divider/50 grid grid-cols-[140px_1fr] items-center gap-6">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Orientation</Label>
                <div className="flex bg-muted/30 p-1 rounded-xl w-fit border border-divider/20">
                  <button
                    onClick={() => setEditingProductListData({...editingProductListData, layout: 'horizontal'})}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2",
                      editingProductListData.layout === 'horizontal' 
                        ? "bg-white shadow-sm text-primary ring-1 ring-black/5" 
                        : "text-muted-foreground hover:text-slate-600 hover:bg-white/50"
                    )}
                  >
                    <Columns className="h-3.5 w-3.5" />
                    Horizontal
                  </button>
                  <button
                    onClick={() => setEditingProductListData({...editingProductListData, layout: 'vertical'})}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2",
                      editingProductListData.layout === 'vertical' 
                        ? "bg-white shadow-sm text-primary ring-1 ring-black/5" 
                        : "text-muted-foreground hover:text-slate-600 hover:bg-white/50"
                    )}
                  >
                    <Rows className="h-3.5 w-3.5" />
                    Vertical
                  </button>
                </div>
              </div>

              {/* Layout & Spacing Section */}
              <div className="py-4 grid grid-cols-[140px_1fr] items-center gap-6">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Layout & Spacing</Label>
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 font-bold">ITEMS</span>
                    <Input 
                      type="number" min={1} max={6}
                      value={editingProductListData.itemsPerRow || 4}
                      onChange={(e) => setEditingProductListData({...editingProductListData, itemsPerRow: parseInt(e.target.value)})}
                      className="h-9 w-16 rounded-lg bg-muted/20 border-divider/50 text-center font-bold text-xs focus:bg-white transition-all underline-none"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 font-bold">GAP</span>
                    <Input 
                      placeholder="24px"
                      value={editingProductListData.gap || ''}
                      onChange={(e) => setEditingProductListData({...editingProductListData, gap: e.target.value})}
                      className="h-9 w-24 rounded-lg bg-muted/20 border-divider/50 text-center font-mono text-xs focus:bg-white transition-all underline-none"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="border-t bg-muted/30 p-4 px-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} className="hover:bg-background rounded-xl px-6">
            Cancel
          </Button>
          <Button onClick={handleSaveProductList} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 px-10 rounded-xl">
            Save Product List
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
