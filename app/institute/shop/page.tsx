'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  CheckCircle2, ChevronLeft, ChevronRight, Eye, Search, ShoppingCart,
  ShoppingBag, X, MessageSquare, Loader2, Check, ArrowRight, Truck,
  CreditCard, MapPin, Phone, User, Package, Clock, RefreshCw, AlertCircle
} from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  images: string[]
  mrp_price: number | string
  sell_price: number | string
  colors: string[]
  sizes: string[]
  features: string[]
  moq: number
}

interface OrderHistoryItem {
  id: string
  productName: string
  quantity: number
  perPiecePrice: number
  totalPrice: number
  tax: string
  finalAmount: number
  updatedAt: string
  status: 'Payment Pending' | 'Order Generated' | 'Working' | 'Order Dispatched'
  size?: string
  color?: string
  productDescription?: string
  name?: string
  mobile?: string
  address?: string
  courierName?: string
  courierId?: string
  createdAt?: string
}

export default function ShopModulePage() {
  const [view, setView] = useState<'grid' | 'details' | 'history' | 'order_details'>('grid')
  
  // Products from Admin
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [productsLoading, setProductsLoading] = useState(true)

  // Orders History
  const [historyList, setHistoryList] = useState<OrderHistoryItem[]>([])
  const [selectedOrder, setSelectedOrder] = useState<OrderHistoryItem | null>(null)
  const [ordersLoading, setOrdersLoading] = useState(false)
  
  // Product Detail Selection State
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [orderQty, setOrderQty] = useState(1)

  // Buy / Order Modal
  const [buyModalOpen, setBuyModalOpen] = useState(false)
  const [orderContactName, setOrderContactName] = useState('Cosmopolitan Inter Office')
  const [orderContactMobile, setOrderContactMobile] = useState('9876543210')
  const [orderAddress, setOrderAddress] = useState('Main School Campus, Administrative Block')
  const [orderPaymentMode, setOrderPaymentMode] = useState<'pay_now' | 'invoice_later'>('pay_now')
  const [orderTxnId, setOrderTxnId] = useState('')
  const [submittingOrder, setSubmittingOrder] = useState(false)

  // Filter & Search states
  const [productSearch, setProductSearch] = useState('')
  const [historySearch, setHistorySearch] = useState('')
  const [historyStatusFilter, setHistoryStatusFilter] = useState('')
  const [historyFromDate, setHistoryFromDate] = useState('')
  const [historyToDate, setHistoryToDate] = useState('')

  // Toast
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const triggerToast = (msg: string) => {
    setToastMsg(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  // Fetch products from Admin API
  const fetchProducts = useCallback(async () => {
    setProductsLoading(true)
    try {
      const url = productSearch ? `/api/institute/shop/products?search=${encodeURIComponent(productSearch)}` : '/api/institute/shop/products'
      const res = await fetch(url)
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        const mapped: Product[] = data.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80'],
          mrp_price: parseFloat(p.mrp_price || 0),
          sell_price: parseFloat(p.sell_price || 0),
          colors: Array.isArray(p.colors) && p.colors.length > 0 ? p.colors : ['Standard'],
          sizes: Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : ['Standard'],
          features: Array.isArray(p.features) && p.features.length > 0 ? p.features : ['Quality Assured'],
          moq: parseInt(p.moq) || 1
        }))
        setProducts(mapped)
        if (mapped.length > 0 && !selectedProduct) {
          setSelectedProduct(mapped[0])
        }
      }
    } catch (err) {
      console.error('Error fetching products:', err)
      triggerToast('Error loading shop products from Admin')
    } finally {
      setProductsLoading(false)
    }
  }, [productSearch]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch Order History from Database
  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true)
    try {
      const params = new URLSearchParams()
      if (historySearch) params.append('search', historySearch)
      if (historyStatusFilter) params.append('status', historyStatusFilter)
      if (historyFromDate) params.append('fromDate', historyFromDate)
      if (historyToDate) params.append('toDate', historyToDate)

      const res = await fetch(`/api/institute/shop/orders?${params.toString()}`)
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setHistoryList(data.data)
      }
    } catch (err) {
      console.error('Error fetching order history:', err)
      triggerToast('Error loading order history')
    } finally {
      setOrdersLoading(false)
    }
  }, [historySearch, historyStatusFilter, historyFromDate, historyToDate])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    if (view === 'history' || view === 'order_details') {
      fetchOrders()
    }
  }, [view, fetchOrders])

  const handleOpenProduct = (p: Product) => {
    setSelectedProduct(p)
    setSelectedImageIndex(0)
    setSelectedColor(p.colors[0] || 'Standard')
    setSelectedSize(p.sizes[0] || 'Standard')
    setOrderQty(Math.max(1, p.moq))
    setView('details')
  }

  const handleOpenOrderDetails = (order: OrderHistoryItem) => {
    setSelectedOrder(order)
    // Find matching product if available
    const matched = products.find(p => p.name.toLowerCase() === order.productName.toLowerCase())
    if (matched) setSelectedProduct(matched)
    setView('order_details')
  }

  // Handle Order Placement
  const handlePlaceOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) return
    if (!orderContactName.trim() || !orderContactMobile.trim() || !orderAddress.trim()) {
      alert('Please fill in Contact Name, Mobile Number, and Delivery Address.')
      return
    }

    setSubmittingOrder(true)
    try {
      const unitPrice = parseFloat(String(selectedProduct.sell_price))
      const payload = {
        productName: selectedProduct.name,
        productDescription: selectedProduct.description,
        quantity: orderQty,
        size: selectedSize,
        color: selectedColor,
        price: unitPrice,
        taxPercent: 18,
        name: orderContactName.trim(),
        mobile: orderContactMobile.trim(),
        address: orderAddress.trim(),
        status: orderPaymentMode === 'pay_now' ? 'Order Generated' : 'Payment Pending'
      }

      const res = await fetch('/api/institute/shop/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (data.success) {
        setBuyModalOpen(false)
        triggerToast(`Order placed successfully for ${selectedProduct.name}!`)
        await fetchOrders()
        setView('history')
      } else {
        alert(data.error || 'Failed to place order')
      }
    } catch (err) {
      console.error(err)
      alert('Network error while placing order')
    } finally {
      setSubmittingOrder(false)
    }
  }

  // Handle completing payment for an existing 'Payment Pending' order
  const handlePayNow = async (orderId: string) => {
    try {
      const res = await fetch(`/api/institute/shop/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Order Generated' })
      })
      const data = await res.json()
      if (data.success) {
        triggerToast('Payment Successful! Order Generated.')
        setHistoryList(prev => prev.map(item => item.id === orderId ? { ...item, status: 'Order Generated' } : item))
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: 'Order Generated' })
        }
      }
    } catch {
      alert('Error processing payment')
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-12 animate-in fade-in duration-300">
      
      {/* View Header with Navigation */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-slate-800">
              {view === 'grid' && 'All Product'}
              {view === 'details' && 'Product Details & Purchase'}
              {view === 'order_details' && 'Order Summary & Tracking'}
              {view === 'history' && 'Order History'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
              Cosmopolitan Inter
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            {view === 'grid' && 'Browse verified academic uniforms, apparel, and hardware supplies added by Admin'}
            {view === 'details' && 'Configure quantity, size, color, and place instant institutional orders'}
            {view === 'history' && 'Track order dispatches, status, and invoices placed by Cosmopolitan Inter'}
            {view === 'order_details' && 'Complete breakdown of ordered items, payment verification, and delivery'}
          </p>
        </div>

        {/* View Toggle Buttons */}
        <div className="flex items-center gap-2">
          {view !== 'grid' && (
            <button
              onClick={() => setView('grid')}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold shadow-xs transition-colors text-xs cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-teal-600" />
              <span>All Products</span>
            </button>
          )}

          {view !== 'history' && (
            <button
              onClick={() => setView('history')}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md transition-colors text-xs cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Order History</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. ALL PRODUCTS GRID VIEW (Real products from admin) */}
      {view === 'grid' && (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="bg-white border rounded-2xl p-4 shadow-xs flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products added by admin..."
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-xl outline-none font-bold text-slate-700 placeholder-slate-400 text-xs focus:border-teal-500"
              />
            </div>
            <div className="text-xs font-bold text-slate-500">
              Showing <span className="text-slate-800 font-black">{products.length}</span> Products from Admin
            </div>
          </div>

          {productsLoading ? (
            <div className="py-24 text-center flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="w-7 h-7 animate-spin text-teal-600" />
              <span className="text-xs font-bold">Loading products added by Admin...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 p-8">
              <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 mb-2 stroke-[1.5]" />
              <h3 className="text-sm font-bold text-slate-700">No products available.</h3>
              <p className="text-xs text-slate-400 mt-1">Admin has not added any products yet to the shop catalogue.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.map(p => {
                const mrp = parseFloat(String(p.mrp_price || 0))
                const buy = parseFloat(String(p.sell_price || 0))
                const save = Math.max(0, mrp - buy)
                const mainImg = p.images[0] || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80'

                return (
                  <div
                    key={p.id}
                    onClick={() => handleOpenProduct(p)}
                    className="bg-white border rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between border-slate-200 hover:border-teal-400"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden flex items-center justify-center">
                      <img
                        src={mainImg}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {save > 0 && (
                        <span className="absolute top-3 right-3 bg-teal-600 text-white font-black text-[10px] px-2.5 py-1 rounded-lg shadow-sm">
                          Save ₹{save.toFixed(0)}
                        </span>
                      )}
                      <span className="absolute bottom-3 left-3 bg-slate-900/70 text-white font-bold text-[9px] px-2 py-0.5 rounded backdrop-blur-xs">
                        Min Qty: {p.moq} pcs
                      </span>
                    </div>

                    {/* Info panel */}
                    <div className="p-5 space-y-3 text-xs font-semibold text-slate-700">
                      <div>
                        <h3 className="font-black text-slate-800 group-hover:text-teal-600 transition-colors text-sm line-clamp-1">
                          {p.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-medium line-clamp-2 mt-1">
                          {p.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="space-y-0.5">
                          {mrp > buy && (
                            <div className="text-slate-400 text-[10px]">
                              MRP: <span className="line-through">₹{mrp.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="text-slate-900 font-black text-sm">
                            Buy Price: <span className="text-teal-700">₹{buy.toFixed(2)}</span>
                          </div>
                        </div>

                        <span className="px-3 py-1.5 bg-teal-50 group-hover:bg-teal-600 group-hover:text-white text-teal-700 rounded-xl text-[11px] font-bold transition-colors">
                          Buy Now →
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. PRODUCT DETAILS & BUY VIEW */}
      {view === 'details' && selectedProduct && (
        <div className="bg-white border rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-8 items-start text-xs font-semibold text-slate-700">
          
          {/* Left image gallery panel */}
          <div className="w-full md:w-1/2 space-y-4">
            <div className="relative aspect-[4/3] sm:aspect-[4/4] bg-slate-100 border rounded-2xl overflow-hidden flex items-center justify-center">
              <img
                src={selectedProduct.images[selectedImageIndex] || selectedProduct.images[0]}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
              {selectedProduct.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setSelectedImageIndex(prev => prev > 0 ? prev - 1 : selectedProduct.images.length - 1)}
                    className="absolute left-3 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-700 flex items-center justify-center shadow-sm cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedImageIndex(prev => prev < selectedProduct.images.length - 1 ? prev + 1 : 0)}
                    className="absolute right-3 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-700 flex items-center justify-center shadow-sm cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {selectedProduct.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {selectedProduct.images.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedImageIndex(i)}
                    className={`aspect-square border-2 rounded-xl bg-slate-50 cursor-pointer overflow-hidden relative ${
                      selectedImageIndex === i ? 'border-teal-500 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Product Buy panel */}
          <div className="w-full md:w-1/2 space-y-5">
            <div>
              <h2 className="text-lg font-black text-slate-800 leading-snug">{selectedProduct.name}</h2>
              <div className="flex items-baseline gap-3 mt-1.5">
                {parseFloat(String(selectedProduct.mrp_price)) > parseFloat(String(selectedProduct.sell_price)) && (
                  <span className="text-slate-400 line-through text-sm">₹{parseFloat(String(selectedProduct.mrp_price)).toFixed(2)}</span>
                )}
                <span className="text-2xl font-black text-teal-700">₹{parseFloat(String(selectedProduct.sell_price)).toFixed(2)}</span>
                <span className="text-[10px] text-slate-400 font-bold">(per piece • excl. 18% GST)</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5 pt-3 border-t">
              <h3 className="font-black text-slate-800 uppercase tracking-wider text-[11px]">Product Description</h3>
              <p className="text-slate-500 leading-relaxed font-medium text-[11px]">
                {selectedProduct.description || 'Premium institutional supply certified for school operations.'}
              </p>
            </div>

            {/* Key features grid */}
            {selectedProduct.features && selectedProduct.features.length > 0 && (
              <div className="space-y-2 pt-2">
                <h3 className="font-black text-slate-800 uppercase tracking-wider text-[11px]">Key Specifications</h3>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 font-bold">
                  {selectedProduct.features.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                      <span className="line-clamp-1">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {selectedProduct.colors && selectedProduct.colors.length > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <h3 className="font-black text-slate-800">
                  Select Color: <span className="text-teal-600 font-bold">{selectedColor}</span>
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedProduct.colors.map(col => {
                    const isSel = selectedColor === col
                    return (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setSelectedColor(col)}
                        className={`px-3 py-1.5 border rounded-xl text-[10px] font-bold cursor-pointer transition-all ${
                          isSel ? 'border-teal-500 bg-teal-50 text-teal-700 font-black shadow-xs' : 'bg-white hover:bg-slate-50'
                        }`}
                      >
                        {col}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Sizes */}
            {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
              <div className="space-y-2 pt-2">
                <h3 className="font-black text-slate-800">
                  Select Size: <span className="text-teal-600 font-bold">{selectedSize}</span>
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedProduct.sizes.map(sz => {
                    const isSel = selectedSize === sz
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`min-w-10 h-8 px-2 border rounded-xl text-[11px] font-bold flex items-center justify-center cursor-pointer transition-all ${
                          isSel ? 'border-teal-500 bg-teal-50 text-teal-700 font-black shadow-xs' : 'bg-white hover:bg-slate-50'
                        }`}
                      >
                        {sz}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Quantity select */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-800">Order Quantity (Pieces):</h3>
                <span className="text-slate-400 font-bold text-[10px]">Min MOQ: {selectedProduct.moq} pcs</span>
              </div>
              <div className="flex items-center border rounded-xl w-40 overflow-hidden bg-slate-50">
                <button
                  type="button"
                  onClick={() => setOrderQty(Math.max(selectedProduct.moq, orderQty - 1))}
                  className="w-10 py-2.5 text-center border-r hover:bg-slate-100 font-black text-slate-600 cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  min={selectedProduct.moq}
                  value={orderQty}
                  onChange={e => setOrderQty(Math.max(selectedProduct.moq, parseInt(e.target.value) || selectedProduct.moq))}
                  className="flex-1 text-center font-black text-slate-800 bg-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => setOrderQty(orderQty + 1)}
                  className="w-10 py-2.5 text-center border-l hover:bg-slate-100 font-black text-slate-600 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Price calculation summary box */}
            {(() => {
              const unit = parseFloat(String(selectedProduct.sell_price))
              const subtotal = unit * orderQty
              const tax = subtotal * 0.18
              const total = subtotal + tax

              return (
                <div className="border rounded-2xl p-4 bg-slate-50 border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal ({orderQty} pcs × ₹{unit.toFixed(2)})</span>
                    <span className="font-bold text-slate-800">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">GST (18%)</span>
                    <span className="font-bold text-slate-800">₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-black text-slate-900">
                    <span>Total Amount to Pay</span>
                    <span className="text-base text-teal-700">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              )
            })()}

            {/* Buy / Place Order Button */}
            <button
              type="button"
              onClick={() => setBuyModalOpen(true)}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-black text-center rounded-xl shadow-md transition-colors cursor-pointer text-xs flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Buy & Order Product</span>
            </button>
          </div>

        </div>
      )}

      {/* 3. ORDER HISTORY VIEW (Real data from product_dispatches) */}
      {view === 'history' && (
        <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-6 text-xs font-semibold text-slate-700">
          
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h2 className="text-sm font-black text-slate-800">Order History for Cosmopolitan Inter</h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Track all your purchased products, dispatch logistics, and payment receipts
              </p>
            </div>
            <button
              type="button"
              onClick={fetchOrders}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border rounded-lg text-slate-600 font-bold cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${ordersLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Orders</span>
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 border-b pb-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Product Name</label>
              <input
                type="text"
                placeholder="Search by product name..."
                value={historySearch}
                onChange={e => setHistorySearch(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl outline-none font-bold bg-white"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">From Date</label>
              <input
                type="date"
                value={historyFromDate}
                onChange={e => setHistoryFromDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl outline-none font-bold text-slate-600 bg-white"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">To Date</label>
              <input
                type="date"
                value={historyToDate}
                onChange={e => setHistoryToDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl outline-none font-bold text-slate-600 bg-white"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Status</label>
              <select
                value={historyStatusFilter}
                onChange={e => setHistoryStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl bg-white outline-none font-bold cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="Payment Pending">Payment Pending</option>
                <option value="Order Generated">Order Generated</option>
                <option value="Working">Working</option>
                <option value="Order Dispatched">Order Dispatched</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {ordersLoading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
              <span>Loading order history...</span>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-center border-collapse">
                <thead className="bg-slate-50 font-black text-slate-600 border-b">
                  <tr>
                    <th className="px-3 py-4 w-14">S. No.</th>
                    <th className="px-3 py-4 text-left">Product Name</th>
                    <th className="px-3 py-4">Quantity</th>
                    <th className="px-3 py-4">Per Piece Price</th>
                    <th className="px-3 py-4">Total Price</th>
                    <th className="px-3 py-4">Tax</th>
                    <th className="px-3 py-4">Final Amount</th>
                    <th className="px-3 py-4 w-28">Order Date</th>
                    <th className="px-3 py-4">Status</th>
                    <th className="px-3 py-4 w-24">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {historyList.map((item, idx) => (
                    <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold">
                      <td className="px-3 py-3.5 text-slate-500 font-bold">{idx + 1}.</td>
                      <td className="px-3 py-3.5 text-left font-bold text-slate-800">
                        <div>{item.productName}</div>
                        {item.size && <span className="text-[10px] text-slate-400">Size: {item.size}</span>}
                      </td>
                      <td className="px-3 py-3.5 text-slate-800 font-bold">{item.quantity} pcs</td>
                      <td className="px-3 py-3.5 text-slate-600">₹{item.perPiecePrice.toFixed(2)}</td>
                      <td className="px-3 py-3.5 text-slate-600">₹{item.totalPrice.toFixed(2)}</td>
                      <td className="px-3 py-3.5 text-slate-400">{item.tax}</td>
                      <td className="px-3 py-3.5 font-black text-teal-700">₹{item.finalAmount.toFixed(2)}</td>
                      <td className="px-3 py-3.5 text-slate-500 text-[10px] font-bold">{item.updatedAt}</td>
                      <td className="px-3 py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                          item.status === 'Payment Pending' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                          item.status === 'Order Generated' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                          item.status === 'Working' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleOpenOrderDetails(item)}
                          className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 border text-slate-500 flex items-center justify-center mx-auto transition-colors cursor-pointer"
                          title="View Order Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {historyList.length === 0 && (
                    <tr>
                      <td colSpan={10} className="py-14 text-center text-slate-400 font-bold">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <ShoppingCart className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                          <span className="text-slate-600 text-sm">No orders found in history.</span>
                          <button
                            type="button"
                            onClick={() => setView('grid')}
                            className="mt-1 px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm"
                          >
                            Browse Products to Buy →
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* 4. ORDER DETAILS MODAL / VIEW (Single Order breakdown) */}
      {view === 'order_details' && selectedOrder && (
        <div className="space-y-6">
          <div className="bg-white border rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-8 items-start text-xs font-semibold text-slate-700">
            
            {/* Left Info Panel */}
            <div className="w-full md:w-1/2 space-y-4">
              <div className="border rounded-2xl p-5 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order ID</span>
                  <span className="font-mono text-slate-800 font-bold">#{selectedOrder.id.slice(0, 8)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Order Status</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                    selectedOrder.status === 'Payment Pending' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                    selectedOrder.status === 'Order Generated' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                    selectedOrder.status === 'Working' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    'bg-emerald-50 text-emerald-600 border-emerald-100'
                  }`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Order Date</span>
                  <span className="font-bold text-slate-800">{selectedOrder.updatedAt}</span>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="border rounded-2xl p-5 bg-slate-50 space-y-2.5">
                <h3 className="font-black text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  <span>Delivery Address</span>
                </h3>
                <div className="text-slate-700 font-bold">{selectedOrder.name || 'Cosmopolitan Inter Office'}</div>
                <div className="text-slate-500">{selectedOrder.mobile ? `+91 ${selectedOrder.mobile}` : ''}</div>
                <div className="text-slate-500 text-[11px] leading-relaxed">{selectedOrder.address || 'Main Campus'}</div>
              </div>

              {/* Courier info if dispatched */}
              {selectedOrder.status === 'Order Dispatched' && (
                <div className="border rounded-2xl p-5 bg-emerald-50/60 border-emerald-200 space-y-2">
                  <h3 className="font-black text-emerald-800 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    <span>Courier & Logistics Details</span>
                  </h3>
                  <div className="text-xs font-bold text-slate-800">Courier: {selectedOrder.courierName || 'Trackon Express'}</div>
                  <div className="text-xs font-bold text-slate-800">Tracking AWB: {selectedOrder.courierId || '1234567890'}</div>
                </div>
              )}
            </div>

            {/* Right Invoice & Details summary panel */}
            <div className="w-full md:w-1/2 space-y-5">
              <div>
                <h2 className="text-lg font-black text-slate-800">{selectedOrder.productName}</h2>
                <div className="text-slate-500 text-[11px] font-medium mt-0.5">
                  {selectedOrder.productDescription || 'Institutional Order'}
                </div>
              </div>

              {/* Price Details Breakdown */}
              <div className="border rounded-2xl p-5 bg-[#f8fafc] border-slate-200 text-xs font-semibold text-slate-600 space-y-3">
                <div className="flex justify-between">
                  <span>Per Piece Price</span>
                  <span className="font-bold text-slate-800">₹{selectedOrder.perPiecePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity</span>
                  <span className="font-bold text-slate-800">{selectedOrder.quantity} Pieces</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-800">₹{selectedOrder.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({selectedOrder.tax})</span>
                  <span className="font-bold text-slate-800">₹{(selectedOrder.totalPrice * 0.18).toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-black text-slate-900">
                  <span>Final Amount</span>
                  <span className="text-base text-teal-700">₹{selectedOrder.finalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedOrder.status === 'Payment Pending' ? (
                <button
                  type="button"
                  onClick={() => handlePayNow(selectedOrder.id)}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-black text-center rounded-xl shadow-md transition-colors cursor-pointer text-xs"
                >
                  Pay Now (₹{selectedOrder.finalAmount.toFixed(2)})
                </button>
              ) : (
                <div className="w-full py-3 bg-emerald-50 text-emerald-700 border border-emerald-200 font-black text-center rounded-xl text-xs flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Order Confirmed & Processed</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => setView('history')}
                className="w-full py-2.5 bg-white border border-slate-200 text-slate-600 font-bold text-center rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-xs"
              >
                ← Back to Order History
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 5. BUY / PLACE ORDER MODAL */}
      {buyModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 text-xs font-semibold text-slate-700 animate-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setBuyModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b pb-3 mb-5">
              <h2 className="text-base font-black text-[#1b3a60] flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-teal-600" />
                <span>Confirm Purchase & Delivery Details</span>
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Placing official institutional order for {selectedProduct.name}
              </p>
            </div>

            <form onSubmit={handlePlaceOrderSubmit} className="space-y-5">
              
              {/* Order Summary Pill */}
              <div className="bg-teal-50/60 p-4 rounded-2xl border border-teal-100 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{selectedProduct.name}</div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {orderQty} pcs • Color: {selectedColor} • Size: {selectedSize}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-bold">Total with GST</div>
                  <div className="text-base font-black text-teal-700">
                    ₹{((parseFloat(String(selectedProduct.sell_price)) * orderQty) * 1.18).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <div className="text-slate-800 font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-teal-600" />
                  <span>Contact & Recipient</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-600 font-bold">Recipient / Contact Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={orderContactName}
                      onChange={e => setOrderContactName(e.target.value)}
                      placeholder="e.g. Principal / Store Incharge"
                      className="w-full px-3 py-2 border rounded-xl outline-none font-bold bg-white focus:border-teal-500"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-slate-600 font-bold">Mobile Phone Number <span className="text-red-500">*</span></label>
                    <div className="flex items-center border rounded-xl bg-white overflow-hidden focus-within:border-teal-500">
                      <span className="bg-slate-50 px-3 py-2 text-slate-400 border-r font-bold">+91</span>
                      <input
                        type="text"
                        value={orderContactMobile}
                        onChange={e => setOrderContactMobile(e.target.value)}
                        placeholder="10-digit number"
                        className="flex-1 px-3 py-2 outline-none font-bold"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-slate-600 font-bold">Delivery Address <span className="text-red-500">*</span></label>
                  <textarea
                    value={orderAddress}
                    onChange={e => setOrderAddress(e.target.value)}
                    placeholder="Enter complete school campus address for dispatch..."
                    className="w-full px-3 py-2 border rounded-xl outline-none font-bold bg-white h-16 resize-none focus:border-teal-500"
                    required
                  />
                </div>
              </div>

              {/* Payment Preference */}
              <div className="space-y-3 pt-2 border-t">
                <div className="text-slate-800 font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-teal-600" />
                  <span>Payment Option</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOrderPaymentMode('pay_now')}
                    className={`p-3 border rounded-2xl text-left transition-all cursor-pointer ${
                      orderPaymentMode === 'pay_now' ? 'border-teal-500 bg-teal-50/50 shadow-xs' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-black text-slate-900 text-xs">Pay Online Now</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Generates immediate confirmed order</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderPaymentMode('invoice_later')}
                    className={`p-3 border rounded-2xl text-left transition-all cursor-pointer ${
                      orderPaymentMode === 'invoice_later' ? 'border-teal-500 bg-teal-50/50 shadow-xs' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-black text-slate-900 text-xs">Generate Invoice First</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Pay after PO verification</div>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setBuyModalOpen(false)}
                  className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold cursor-pointer hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOrder}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black shadow-md cursor-pointer transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {submittingOrder ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting Order...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm & Place Order</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* TOAST ALERT */}
      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}
    </div>
  )
}
