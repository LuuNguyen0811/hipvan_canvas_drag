import React, { useRef } from 'react'
import { LayoutList, Plus, Trash2, Upload, Image as ImageIcon, AlignLeft, AlignCenter, AlignRight, DollarSign, Tag, Columns, Rows } from 'lucide-react'
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

interface ProductListEditDialogProps {
  isOpen: boolean
  onClose: () => void
  editingProductListData: ProductListComponentData | null
  setEditingProductListData: (data: ProductListComponentData | null) => void
  handleSaveProductList: () => void
}

export function ProductListEditDialog({
  isOpen,
  onClose,
  editingProductListData,
  setEditingProductListData,
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
            
            <TabsContent value="products" className="space-y-6 mt-6">
              <div className="flex justify-between items-center px-1">
                <Label className="uppercase text-[11px] font-bold text-slate-500 tracking-wider">Product Items ({editingProductListData.items.length})</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newItem: ProductItemData = {
                      id: `prod_${Date.now()}`,
                      title: 'New Product',
                      price: '$0',
                      url: '#',
                    }
                    setEditingProductListData({
                      ...editingProductListData,
                      items: [...(editingProductListData.items || []), newItem],
                    })
                  }}
                  className="rounded-xl gap-2 font-bold text-xs"
                >
                  <Plus className="h-4 w-4" />
                  Add Product
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 max-h-[450px] overflow-y-auto pr-2 scrollbar-thin">
                {editingProductListData.items.map((item, index) => (
                  <div key={item.id} className="group relative rounded-2xl border border-divider bg-white p-4 transition-all hover:border-primary/30 shadow-sm">
                    <div className="flex gap-4">
                      {/* Thumbnail & Actions */}
                      <div className="flex flex-col gap-2">
                        <div className="h-20 w-20 flex-shrink-0 rounded-lg bg-[#f8f9fa] overflow-hidden border border-divider/50 flex items-center justify-center">
                          {item.image ? (
                            <img src={item.image} className="h-full w-full object-contain" />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-muted-foreground/20" />
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-destructive hover:bg-destructive/10 h-8 gap-2 font-bold text-[10px] uppercase"
                          onClick={() => {
                            const newItems = editingProductListData.items.filter((_, i) => i !== index)
                            setEditingProductListData({ ...editingProductListData, items: newItems })
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>

                      {/* Details */}
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div className="col-span-2 space-y-1.5">
                          <Label className="text-[10px] uppercase font-bold text-slate-400">Product Title</Label>
                          <Input
                            value={item.title || ''}
                            onChange={(e) => {
                              const newItems = [...editingProductListData.items]
                              newItems[index] = { ...newItems[index], title: e.target.value }
                              setEditingProductListData({ ...editingProductListData, items: newItems })
                            }}
                            className="h-9 rounded-lg text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] uppercase font-bold text-slate-400">Price</Label>
                          <Input
                            value={item.price || ''}
                            onChange={(e) => {
                              const newItems = [...editingProductListData.items]
                              newItems[index] = { ...newItems[index], price: e.target.value }
                              setEditingProductListData({ ...editingProductListData, items: newItems })
                            }}
                            className="h-9 rounded-lg text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] uppercase font-bold text-slate-400">Original Price (Optional)</Label>
                          <Input
                            value={item.originalPrice || ''}
                            placeholder="e.g. $499"
                            onChange={(e) => {
                              const newItems = [...editingProductListData.items]
                              newItems[index] = { ...newItems[index], originalPrice: e.target.value }
                              setEditingProductListData({ ...editingProductListData, items: newItems })
                            }}
                            className="h-9 rounded-lg text-sm"
                          />
                        </div>
                        <div className="col-span-2 space-y-1.5">
                          <Label className="text-[10px] uppercase font-bold text-slate-400">Target URL</Label>
                          <Input
                            value={item.url || ''}
                            onChange={(e) => {
                              const newItems = [...editingProductListData.items]
                              newItems[index] = { ...newItems[index], url: e.target.value }
                              setEditingProductListData({ ...editingProductListData, items: newItems })
                            }}
                            className="h-9 rounded-lg text-xs font-mono"
                          />
                        </div>
                        <div className="col-span-2 space-y-1.5">
                          <Label className="text-[10px] uppercase font-bold text-slate-400">Image Source / Badge</Label>
                          <div className="flex gap-2">
                            <Input
                              value={item.image || ''}
                              onChange={(e) => {
                                const newItems = [...editingProductListData.items]
                                newItems[index] = { ...newItems[index], image: e.target.value }
                                setEditingProductListData({ ...editingProductListData, items: newItems })
                              }}
                              className="h-9 rounded-lg text-xs flex-1"
                              placeholder="Image URL..."
                            />
                            <Input
                              value={item.badge || ''}
                              placeholder="Badge (e.g. Sale)"
                              onChange={(e) => {
                                const newItems = [...editingProductListData.items]
                                newItems[index] = { ...newItems[index], badge: e.target.value }
                                setEditingProductListData({ ...editingProductListData, items: newItems })
                              }}
                              className="h-9 rounded-lg text-xs w-1/3"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6 mt-6">
              <div className="grid grid-cols-2 gap-8 px-2">
                <div className="space-y-4">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Layout Style</Label>
                  <div className="flex bg-muted/30 p-1 rounded-xl w-fit border border-divider/20">
                    <button
                      onClick={() => setEditingProductListData({...editingProductListData, layout: 'horizontal'})}
                      className={cn(
                        "px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                        editingProductListData.layout === 'horizontal' 
                          ? "bg-white shadow-sm text-primary" 
                          : "text-muted-foreground hover:text-slate-600"
                      )}
                    >
                      <Columns className="h-3.5 w-3.5" />
                      Horizontal Swipe
                    </button>
                    <button
                      onClick={() => setEditingProductListData({...editingProductListData, layout: 'vertical'})}
                      className={cn(
                        "px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                        editingProductListData.layout === 'vertical' 
                          ? "bg-white shadow-sm text-primary" 
                          : "text-muted-foreground hover:text-slate-600"
                      )}
                    >
                      <Rows className="h-3.5 w-3.5" />
                      Vertical Grid
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Spacing & Columns</Label>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Grid Gap</span>
                      <Input 
                        value={editingProductListData.gap || '24px'}
                        onChange={(e) => setEditingProductListData({...editingProductListData, gap: e.target.value})}
                        className="h-9 w-24 rounded-lg text-center font-mono text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Items Per Row</span>
                      <Input 
                        type="number" min={1} max={6}
                        value={editingProductListData.itemsPerRow || 4}
                        onChange={(e) => setEditingProductListData({...editingProductListData, itemsPerRow: parseInt(e.target.value)})}
                        className="h-9 w-16 rounded-lg text-center font-bold"
                      />
                    </div>
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
