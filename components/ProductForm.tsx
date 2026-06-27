'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Upload, Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

interface ProductFormData {
  name: string
  description: string
  images: string[]
  mrp_price: string
  sell_price: string
  colors: string[]
  sizes: string[]
  features: string[]
}

interface ProductFormProps {
  initialData?: ProductFormData & { id?: string }
  isEdit?: boolean
}

export function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [mrpPrice, setMrpPrice] = useState('')
  const [sellPrice, setSellPrice] = useState('')
  const [colors, setColors] = useState<string[]>([])
  const [sizes, setSizes] = useState<string[]>([])
  const [features, setFeatures] = useState<string[]>([''])

  // Input states for adding tags
  const [colorInput, setColorInput] = useState('')
  const [sizeInput, setSizeInput] = useState('')

  // Load initial data for editing
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '')
      setDescription(initialData.description || '')
      setImages(initialData.images || [])
      setMrpPrice(String(initialData.mrp_price || ''))
      setSellPrice(String(initialData.sell_price || ''))
      setColors(initialData.colors || [])
      setSizes(initialData.sizes || [])
      setFeatures(initialData.features?.length ? initialData.features : [''])
    }
  }, [initialData])

  // Savings computation
  const savingAmount = React.useMemo(() => {
    const mrp = parseFloat(mrpPrice)
    const sell = parseFloat(sellPrice)
    if (!isNaN(mrp) && !isNaN(sell) && mrp > sell) {
      return mrp - sell
    }
    return 0
  }, [mrpPrice, sellPrice])

  // Dynamic feature lines handlers
  const handleFeatureChange = (index: number, value: string) => {
    const updated = [...features]
    updated[index] = value
    setFeatures(updated)
  }

  const addFeatureLine = () => {
    setFeatures(prev => [...prev, ''])
  }

  const removeFeatureLine = (index: number) => {
    if (features.length === 1) {
      setFeatures([''])
      return
    }
    setFeatures(prev => prev.filter((_, i) => i !== index))
  }

  // Tags handlers
  const addColor = (e: React.FormEvent) => {
    e.preventDefault()
    if (!colorInput.trim()) return
    if (colors.includes(colorInput.trim())) {
      toast.error('Color already added')
      return
    }
    setColors(prev => [...prev, colorInput.trim()])
    setColorInput('')
  }

  const removeColor = (color: string) => {
    setColors(prev => prev.filter(c => c !== color))
  }

  const addSize = (e: React.FormEvent) => {
    e.preventDefault()
    if (!sizeInput.trim()) return
    if (sizes.includes(sizeInput.trim())) {
      toast.error('Size already added')
      return
    }
    setSizes(prev => [...prev, sizeInput.trim()])
    setSizeInput('')
  }

  const removeSize = (size: string) => {
    setSizes(prev => prev.filter(s => s !== size))
  }

  // Image Upload handler (Base64 Reader)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImages(prev => [...prev, reader.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return toast.error('Product Name is required')
    if (!description) return toast.error('Product Description is required')
    if (!mrpPrice || isNaN(parseFloat(mrpPrice))) return toast.error('Valid MRP Price is required')
    if (!sellPrice || isNaN(parseFloat(sellPrice))) return toast.error('Valid Sell Price is required')

    const cleanFeatures = features.filter(f => f.trim() !== '')
    if (cleanFeatures.length === 0) return toast.error('At least one Key Feature is required')

    setSubmitting(true)
    try {
      const url = isEdit ? `/api/admin/shop/products/${initialData?.id}` : '/api/admin/shop/products'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          images,
          mrp_price: parseFloat(mrpPrice),
          sell_price: parseFloat(sellPrice),
          colors,
          sizes,
          features: cleanFeatures
        })
      })

      const data = await res.json()
      if (data.success) {
        toast.success(isEdit ? 'Product updated successfully' : 'Product created successfully')
        router.push('/admin/shop')
        router.refresh()
      } else {
        toast.error(data.error || 'Failed to save product')
      }
    } catch (error) {
      console.error(error)
      toast.error('An error occurred while saving')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
      {/* Header card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/shop')}
            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {isEdit ? 'Edit Product' : 'Add Product'}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Product Details Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <h2 className="text-sm uppercase font-bold text-slate-400 tracking-wider mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
            Product Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-655 dark:text-slate-400 mb-1.5">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Product Name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-655 dark:text-slate-400 mb-1.5">
                Product Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Enter Product Description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Product Images section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <h2 className="text-sm uppercase font-bold text-slate-400 tracking-wider mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
            Product Images
          </h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Upload Panel */}
              <label className="w-40 h-40 border-2 border-dashed border-slate-300 dark:border-slate-655 hover:border-teal-500 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50">
                <Upload className="w-6 h-6 text-slate-400" />
                <span className="text-xs font-medium text-slate-500 text-center px-2">Browser or Desktop</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {/* Uploaded Previews */}
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative w-40 h-40 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 group"
                >
                  <img src={img} alt="Product image preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Colors and Sizes Sections in Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Colors Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <h2 className="text-sm uppercase font-bold text-slate-400 tracking-wider mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
              Color
            </h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Color Name"
                  value={colorInput}
                  onChange={e => setColorInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-slate-200"
                />
                <button
                  type="button"
                  onClick={addColor}
                  className="px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer"
                >
                  + Add New Color
                </button>
              </div>

              {/* Colors List */}
              <div className="flex flex-wrap gap-2 pt-2">
                {colors.map(color => (
                  <span
                    key={color}
                    className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-full text-xs font-bold"
                  >
                    {color}
                    <button
                      type="button"
                      onClick={() => removeColor(color)}
                      className="hover:text-red-500 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sizes Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <h2 className="text-sm uppercase font-bold text-slate-400 tracking-wider mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
              Size
            </h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Size"
                  value={sizeInput}
                  onChange={e => setSizeInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-slate-200"
                />
                <button
                  type="button"
                  onClick={addSize}
                  className="px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer"
                >
                  + Add Size
                </button>
              </div>

              {/* Sizes List */}
              <div className="flex flex-wrap gap-2 pt-2">
                {sizes.map(size => (
                  <span
                    key={size}
                    className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-full text-xs font-bold"
                  >
                    {size}
                    <button
                      type="button"
                      onClick={() => removeSize(size)}
                      className="hover:text-red-500 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product Key Features */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <h2 className="text-sm uppercase font-bold text-slate-400 tracking-wider mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
            Product Key Features
          </h2>
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-2 items-center">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    Key Features <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Features"
                    value={feature}
                    onChange={e => handleFeatureChange(index, e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-slate-200"
                  />
                </div>
                
                {/* Actions */}
                <div className="flex gap-1.5 self-end pb-1">
                  <button
                    type="button"
                    onClick={addFeatureLine}
                    className="w-10 h-10 bg-teal-600 hover:bg-teal-700 text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFeatureLine(index)}
                    className="w-10 h-10 bg-red-500 hover:bg-red-655 text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Price */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <h2 className="text-sm uppercase font-bold text-slate-400 tracking-wider mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
            Product Price
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-655 dark:text-slate-400 mb-1.5">
                Product MRP Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="Enter Amount"
                value={mrpPrice}
                onChange={e => setMrpPrice(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-655 dark:text-slate-400 mb-1.5">
                Product Sell Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="Enter Amount"
                value={sellPrice}
                onChange={e => setSellPrice(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-655 dark:text-slate-400 mb-1.5">
                Saving Amount
              </label>
              <input
                type="text"
                disabled
                placeholder="Autofill"
                value={savingAmount > 0 ? `₹${savingAmount.toLocaleString('en-IN')}` : ''}
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Buttons Panel */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => router.push('/admin/shop')}
            className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-750 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-teal-600/10 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Save
          </button>
        </div>
      </div>
    </form>
  )
}
