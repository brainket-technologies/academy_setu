'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Edit3, Trash2, Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal'
import { ProductModal } from '@/components/ProductModal'

interface Product {
  id: string
  name: string
  description: string
  images: string[]
  mrp_price: string | number
  sell_price: string | number
  colors: string[]
  sizes: string[]
  features: string[]
}

export default function AllProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Product Add/Edit Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Delete product states
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/shop/products')
      const data = await res.json()
      if (data.success) {
        setProducts(data.data)
      } else {
        toast.error('Failed to fetch products')
      }
    } catch (error) {
      console.error(error)
      toast.error('Error loading products')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleDeleteConfirm = async () => {
    if (!deleteId) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/admin/shop/products/${deleteId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Product deleted successfully')
        setProducts(prev => prev.filter(p => p.id !== deleteId))
        setDeleteId(null)
      } else {
        toast.error(data.error || 'Failed to delete product')
      }
    } catch (error) {
      console.error(error)
      toast.error('Error deleting product')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">All Product</h1>
        </div>
        <button
          onClick={() => {
            setSelectedProduct(null)
            setIsModalOpen(true)
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-teal-600/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-700 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400">No products found. Start by adding a product!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => {
            const mrp = Number(product.mrp_price)
            const sell = Number(product.sell_price)
            const savings = mrp - sell
            const primaryImage = product.images?.[0] || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600'

            return (
              <div
                key={product.id}
                className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md group"
              >
                {/* Product Image Panel */}
                <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-900/50 overflow-hidden flex items-center justify-center">
                  <img
                    src={primaryImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() => router.push(`/admin/shop/${product.id}`)}
                  />
                  
                  {/* Edit and Delete Buttons (Absolute Overlay) */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedProduct(product)
                        setIsModalOpen(true)
                      }}
                      className="w-8 h-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center transition-colors shadow-md cursor-pointer"
                      title="Edit Product"
                    >
                      <Edit3 className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteId(product.id)
                      }}
                      className="w-8 h-8 rounded-lg bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors shadow-md cursor-pointer"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* Product Info Panel */}
                <div
                  className="p-5 flex-1 flex flex-col justify-between cursor-pointer"
                  onClick={() => router.push(`/admin/shop/${product.id}`)}
                >
                  <div>
                    <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 line-clamp-1 mb-2">
                      {product.name}
                    </h2>
                    
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-655 dark:text-slate-400">
                        <span className="font-semibold">MRP Price</span>
                        <span className="line-through font-medium">₹{mrp.toLocaleString('en-IN')}</span>
                        <span className="font-semibold ml-2">Buy Price</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">₹{sell.toLocaleString('en-IN')}</span>
                      </div>
                      
                      {savings > 0 && (
                        <div className="text-xs font-bold text-teal-600 dark:text-teal-400">
                          Save: ₹{savings.toLocaleString('en-IN')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Product Add/Edit Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProducts}
        product={selectedProduct}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        loading={deleteLoading}
      />
    </AdminLayout>
  )
}
