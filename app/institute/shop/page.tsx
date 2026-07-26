'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle2, ChevronLeft, ChevronRight, Eye, Search, ShoppingCart, ShoppingBag, X, MessageSquare } from 'lucide-react'

interface Product {
  id: number
  name: string
  mrp: number
  buyPrice: number
  save: number
  description: string
  features: string[]
  colors: string[]
  sizes: string[]
  minOrderQty: number
  image: string
  thumbnails: string[]
}

interface OrderHistoryItem {
  id: number
  productName: string
  quantity: number
  perPiecePrice: number
  totalPrice: number
  tax: string
  finalAmount: number
  updatedAt: string
  status: 'Payment Pending' | 'Order Generated' | 'Working' | 'Order Dispatched'
}

const ALL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Royal Brown Utility Jacket',
    mrp: 2000,
    buyPrice: 1000,
    save: 1000,
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    features: ['Premium cotton blend fabric', 'Adjustable waist cords', 'Utility side pockets', 'Classic double collar layout', 'Breathable inner lining', 'Wind resistant shell'],
    colors: ['Royal Brown', 'Light Grey', 'Classic Blue', 'Dark Navy'],
    sizes: ['30', '32', '34', '36'],
    minOrderQty: 20,
    image: '/uploaded_media_0_1785086733192.png',
    thumbnails: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
    ]
  },
  {
    id: 2,
    name: 'School Blazer Elite',
    mrp: 2000,
    buyPrice: 1000,
    save: 1000,
    description: 'Perfect formal attire designed for everyday student wear. Built with durable high-stitch count fabric for longevity.',
    features: ['Stain resistant shield', 'Two front flap pockets', 'Gold-plated accent buttons', 'Double vent styling'],
    colors: ['Dark Navy', 'Deep Maroon', 'Forest Green'],
    sizes: ['32', '34', '36', '38'],
    minOrderQty: 25,
    image: '/uploaded_media_0_1785086733192.png',
    thumbnails: []
  },
  {
    id: 3,
    name: 'Unisex Sports Tracksuit',
    mrp: 2400,
    buyPrice: 1200,
    save: 1200,
    description: 'High performance sports tracksuit designed for athletic activities and active sports training events.',
    features: ['Moisture wicking fabric', 'Zip-up front pocket safety', 'Elastic cuffs with zip expansion', 'Subtle contrast side paneling'],
    colors: ['Classic Blue', 'Midnight Black', 'Bold Red'],
    sizes: ['30', '32', '34', '36'],
    minOrderQty: 15,
    image: '/uploaded_media_0_1785086733192.png',
    thumbnails: []
  },
  {
    id: 4,
    name: 'Thermal Inner Wear Set',
    mrp: 1200,
    buyPrice: 600,
    save: 600,
    description: 'Cozy and comfortable thermal insulation sets ideal for cold seasons and freezing winter climates.',
    features: ['Ultra soft microfleece fabric', 'Ribbed collar snug fit', 'Flatlock stitching to reduce friction', 'Lightweight heat trapping tech'],
    colors: ['Light Charcoal', 'Off-White'],
    sizes: ['28', '30', '32', '34'],
    minOrderQty: 50,
    image: '/uploaded_media_0_1785086733192.png',
    thumbnails: []
  },
  {
    id: 5,
    name: 'Embroidered Woolen Sweater',
    mrp: 1800,
    buyPrice: 900,
    save: 900,
    description: 'Premium quality v-neck knitted woolen sweaters featuring state-of-the-art embroidered institutional logos.',
    features: ['100% fine acrylic yarn', 'V-neck style for shirts', 'Anti-pill fiber treatment', 'Elbow patch reinforcement'],
    colors: ['Deep Maroon', 'Navy Blue', 'Charcoal Grey'],
    sizes: ['30', '32', '34', '36'],
    minOrderQty: 30,
    image: '/uploaded_media_0_1785086733192.png',
    thumbnails: []
  },
  {
    id: 6,
    name: 'Summer Polo T-Shirt',
    mrp: 800,
    buyPrice: 400,
    save: 400,
    description: 'Lightweight, breathable summer polo t-shirts ideal for hot climates and physical education sessions.',
    features: ['100% combed ringspun cotton', 'Breathable pique knit', 'Three-button collar setup', 'Double needle hem line'],
    colors: ['Bright White', 'Lemon Yellow', 'Sky Blue'],
    sizes: ['28', '30', '32', '34'],
    minOrderQty: 40,
    image: '/uploaded_media_0_1785086733192.png',
    thumbnails: []
  }
]

const INITIAL_HISTORY: OrderHistoryItem[] = [
  { id: 1, productName: 'xyz product', quantity: 32, perPiecePrice: 100.00, totalPrice: 3200.00, tax: '18%', finalAmount: 3776.00, updatedAt: '14/09/2026', status: 'Payment Pending' },
  { id: 2, productName: 'xyz product', quantity: 25, perPiecePrice: 100.00, totalPrice: 3200.00, tax: '18%', finalAmount: 3776.00, updatedAt: '14/10/2025', status: 'Order Generated' },
  { id: 3, productName: 'xyz product', quantity: 50, perPiecePrice: 100.00, totalPrice: 3200.00, tax: '18%', finalAmount: 3776.00, updatedAt: '01/10/2025', status: 'Working' },
  { id: 4, productName: 'xyz product', quantity: 50, perPiecePrice: 100.00, totalPrice: 3200.00, tax: '18%', finalAmount: 3776.00, updatedAt: '01/10/2025', status: 'Order Dispatched' },
]

export default function ShopModulePage() {
  const [view, setView] = useState<'grid' | 'details' | 'history' | 'order_details'>('grid')
  const [selectedProduct, setSelectedProduct] = useState<Product>(ALL_PRODUCTS[0])
  const [selectedOrder, setSelectedOrder] = useState<OrderHistoryItem | null>(null)

  // Detail Config
  const [selectedColor, setSelectedColor] = useState('Royal Brown')
  const [selectedSize, setSelectedSize] = useState('32')
  const [orderQty, setOrderQty] = useState(25)

  // Modals
  const [queryModalOpen, setQueryModalOpen] = useState(false)
  const [successModalOpen, setSuccessModalOpen] = useState(false)

  // Query Form
  const [queryName, setQueryName] = useState('')
  const [queryMobile, setQueryMobile] = useState('')

  // Order History List
  const [historyList, setHistoryList] = useState<OrderHistoryItem[]>(INITIAL_HISTORY)
  const [historySearch, setHistorySearch] = useState('')
  const [historyStatusFilter, setHistoryStatusFilter] = useState('')

  // Toast
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const handleOpenProduct = (p: Product) => {
    setSelectedProduct(p)
    setSelectedColor(p.colors[0] || '')
    setSelectedSize(p.sizes[1] || p.sizes[0] || '')
    setOrderQty(p.minOrderQty + 5)
    setView('details')
  }

  const handleOpenOrderDetails = (order: OrderHistoryItem) => {
    setSelectedOrder(order)
    // Find matching product
    const p = ALL_PRODUCTS.find(prod => prod.name === order.productName) || ALL_PRODUCTS[0]
    setSelectedProduct(p)
    setView('order_details')
  }

  const handleSendQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!queryName || !queryMobile) {
      alert('Please fill in Your Name and Mobile No.')
      return
    }

    // Add to history
    const newOrder: OrderHistoryItem = {
      id: Date.now(),
      productName: selectedProduct.name,
      quantity: orderQty,
      perPiecePrice: selectedProduct.buyPrice,
      totalPrice: selectedProduct.buyPrice * orderQty,
      tax: '18%',
      finalAmount: Math.round(selectedProduct.buyPrice * orderQty * 1.18),
      updatedAt: new Date().toLocaleDateString('en-GB'),
      status: 'Payment Pending'
    }

    setHistoryList([newOrder, ...historyList])
    setQueryModalOpen(false)
    setSuccessModalOpen(true)
  }

  const handlePayNow = (id: number) => {
    setHistoryList(historyList.map(item => item.id === id ? { ...item, status: 'Order Generated' } : item))
    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder({ ...selectedOrder, status: 'Order Generated' })
    }
    setToastMsg('Payment Successful! Order Generated.')
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  const filteredHistory = historyList.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(historySearch.toLowerCase())
    const matchesStatus = historyStatusFilter ? item.status === historyStatusFilter : true
    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* View Header */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-800">
          {view === 'grid' && 'All Product'}
          {view === 'details' && 'Product Details'}
          {view === 'order_details' && 'Product Details'}
          {view === 'history' && 'Product History'}
        </h1>

        {view === 'grid' && (
          <button
            onClick={() => setView('history')}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md transition-colors text-xs"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Order History</span>
          </button>
        )}

        {(view === 'details' || view === 'history' || view === 'order_details') && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('history')}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border text-slate-700 hover:bg-slate-50 rounded-xl font-bold shadow-sm transition-colors text-xs"
            >
              <span>Order History</span>
            </button>
            <button
              onClick={() => setView('grid')}
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md transition-colors text-xs"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>All Product</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid View */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ALL_PRODUCTS.map(p => (
            <div
              key={p.id}
              onClick={() => handleOpenProduct(p)}
              className="bg-white border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              {/* Product Image Mock */}
              <div className="relative aspect-[4/3] bg-slate-100 border-b overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[#e2e8f0]/40 flex items-center justify-center font-black text-slate-400">
                  <ShoppingBag className="w-12 h-12 text-slate-300" />
                </div>
                {/* Real Mock Image overlay */}
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600')` }} />
                
                <span className="absolute top-3 right-3 bg-teal-650 bg-teal-600 text-white font-black text-[9px] px-2 py-0.5 rounded shadow">
                  Save ₹{p.save}
                </span>
              </div>

              {/* Info panel */}
              <div className="p-5 space-y-2 text-xs font-semibold text-slate-700">
                <h3 className="font-black text-slate-800 group-hover:text-teal-600 transition-colors text-sm">{p.name}</h3>
                
                <div className="flex items-center justify-between pt-1">
                  <div className="space-y-0.5">
                    <div className="text-slate-400 text-[10px]">MRP Price: <span className="line-through">₹{p.mrp}</span></div>
                    <div className="text-[#1b3a60] font-black text-sm">Buy Price: ₹{p.buyPrice}</div>
                  </div>
                  <span className="text-[10px] text-teal-600 font-black">Save: ₹{p.save}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details View */}
      {view === 'details' && (
        <div className="bg-white border rounded-3xl p-8 shadow-sm flex flex-col md:flex-row gap-8 items-start text-xs font-semibold text-slate-700">
          
          {/* Left image panel */}
          <div className="w-full md:w-1/2 space-y-4">
            <div className="relative aspect-[4/5] bg-slate-100 border rounded-2xl overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600')` }} />
              
              {/* Carousel arrows */}
              <button className="absolute left-4 w-8 h-8 rounded-full bg-white/80 border flex items-center justify-center hover:bg-white text-slate-700 shadow-sm"><ChevronLeft className="w-4 h-4" /></button>
              <button className="absolute right-4 w-8 h-8 rounded-full bg-white/80 border flex items-center justify-center hover:bg-white text-slate-700 shadow-sm"><ChevronRight className="w-4 h-4" /></button>
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-5 gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="aspect-square border rounded-lg bg-slate-50 cursor-pointer overflow-hidden relative">
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150')` }} />
                </div>
              ))}
            </div>
          </div>

          {/* Right Product form panel */}
          <div className="w-full md:w-1/2 space-y-6">
            <div className="space-y-2">
              <h2 className="text-lg font-black text-slate-800">{selectedProduct.name}</h2>
              <div className="flex items-baseline gap-3">
                <span className="text-slate-400 line-through">₹{selectedProduct.mrp}</span>
                <span className="text-xl font-black text-[#1b3a60]">₹{selectedProduct.buyPrice}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5 pt-4 border-t">
              <h3 className="font-black text-slate-800">Description</h3>
              <p className="text-slate-500 leading-relaxed font-medium text-[11px]">
                {selectedProduct.description}
              </p>
            </div>

            {/* Key features grid */}
            <div className="space-y-2">
              <h3 className="font-black text-slate-800">Key Features</h3>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 font-bold">
                {selectedProduct.features.map((f, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-2">
              <h3 className="font-black text-slate-800">Color : <span className="text-slate-500 font-bold">{selectedColor}</span></h3>
              <div className="flex items-center gap-2">
                {selectedProduct.colors.map(col => {
                  const isSel = selectedColor === col
                  return (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setSelectedColor(col)}
                      className={`px-3 py-1.5 border rounded-lg text-[10px] font-bold ${isSel ? 'border-teal-500 bg-teal-50 text-teal-600 font-black' : 'bg-white hover:bg-slate-50'}`}
                    >
                      {col}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Sizes */}
            <div className="space-y-2">
              <h3 className="font-black text-slate-800">Size : <span className="text-slate-500 font-bold">{selectedSize}</span></h3>
              <div className="flex items-center gap-2">
                {selectedProduct.sizes.map(size => {
                  const isSel = selectedSize === size
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`w-10 h-8 border rounded-lg text-[11px] font-bold flex items-center justify-center ${isSel ? 'border-teal-500 bg-teal-50 text-teal-600 font-black' : 'bg-white hover:bg-slate-50'}`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Quantity select */}
            <div className="space-y-2">
              <h3 className="font-black text-slate-800">Minimum Order Quantity : <span className="text-slate-400 font-bold"> &gt;&gt; {selectedProduct.minOrderQty}</span></h3>
              <div className="flex items-center border rounded-lg w-36 overflow-hidden bg-slate-50">
                <button
                  type="button"
                  onClick={() => setOrderQty(Math.max(selectedProduct.minOrderQty, orderQty - 1))}
                  className="w-10 py-2 text-center border-r hover:bg-slate-100 font-black text-slate-600"
                >
                  -
                </button>
                <span className="flex-1 text-center font-black text-slate-800">{orderQty}</span>
                <button
                  type="button"
                  onClick={() => setOrderQty(orderQty + 1)}
                  className="w-10 py-2 text-center border-l hover:bg-slate-100 font-black text-slate-600"
                >
                  +
                </button>
              </div>
            </div>

            {/* Send Query Button */}
            <button
              type="button"
              onClick={() => setQueryModalOpen(true)}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-black text-center rounded-xl shadow-md transition-colors"
            >
              Send Query
            </button>
          </div>

        </div>
      )}

      {/* Order Details inside History */}
      {view === 'order_details' && selectedOrder && (
        <div className="space-y-6">
          <div className="bg-white border rounded-3xl p-8 shadow-sm flex flex-col md:flex-row gap-8 items-start text-xs font-semibold text-slate-700">
            
            {/* Left image panel */}
            <div className="w-full md:w-1/2 space-y-4">
              <div className="relative aspect-[4/5] bg-slate-100 border rounded-2xl overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600')` }} />
                
                <button className="absolute left-4 w-8 h-8 rounded-full bg-white/80 border flex items-center justify-center hover:bg-white text-slate-700 shadow-sm"><ChevronLeft className="w-4 h-4" /></button>
                <button className="absolute right-4 w-8 h-8 rounded-full bg-white/80 border flex items-center justify-center hover:bg-white text-slate-700 shadow-sm"><ChevronRight className="w-4 h-4" /></button>
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-5 gap-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="aspect-square border rounded-lg bg-slate-50 cursor-pointer overflow-hidden relative">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150')` }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Invoice & Details summary panel */}
            <div className="w-full md:w-1/2 space-y-6">
              <div className="space-y-2">
                <h2 className="text-lg font-black text-slate-800">Product Name : {selectedOrder.productName}</h2>
                <div className="flex items-baseline gap-3">
                  <span className="text-slate-400 line-through">₹2,000</span>
                  <span className="text-xl font-black text-[#1b3a60]">₹1,000</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5 pt-4 border-t">
                <h3 className="font-black text-slate-800">Description</h3>
                <p className="text-slate-500 leading-relaxed font-medium text-[11px]">
                  {selectedProduct.description}
                </p>
              </div>

              {/* Key features grid */}
              <div className="space-y-2">
                <h3 className="font-black text-slate-800">Key Features</h3>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 font-bold">
                  {selectedProduct.features.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div>
                  <h3 className="font-black text-slate-800">Color</h3>
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded border text-[10px] font-black mt-1 inline-block">Royal Brown</span>
                </div>
                <div>
                  <h3 className="font-black text-slate-800">Size</h3>
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded border text-[10px] font-black mt-1 inline-block">32</span>
                </div>
              </div>

              {/* Quantity select */}
              <div className="space-y-2">
                <h3 className="font-black text-slate-800">Minimum Order Quantity : <span className="text-slate-400 font-bold"> &gt;&gt; 20</span></h3>
                <div className="flex items-center border rounded-lg w-36 overflow-hidden bg-slate-50">
                  <button type="button" disabled className="w-10 py-2 text-center border-r font-black text-slate-300">-</button>
                  <span className="flex-1 text-center font-black text-slate-800">{selectedOrder.quantity}</span>
                  <button type="button" disabled className="w-10 py-2 text-center border-l font-black text-slate-300">+</button>
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
                  <span>Tax (18% GST)</span>
                  <span className="font-bold text-slate-800">₹{(selectedOrder.totalPrice * 0.18).toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-black text-[#1b3a60]">
                  <span>Final Amount</span>
                  <span className="text-base font-black text-teal-600">₹{selectedOrder.finalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Conditional Footer Actions */}
              {selectedOrder.status === 'Payment Pending' ? (
                <button
                  type="button"
                  onClick={() => handlePayNow(selectedOrder.id)}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-black text-center rounded-xl shadow-md transition-colors"
                >
                  Pay Now
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full py-3 bg-teal-50 text-teal-600 border border-teal-100 font-black text-center rounded-xl transition-colors cursor-not-allowed"
                >
                  Payment Completed
                </button>
              )}
            </div>

          </div>

          {/* Dispatch Details Card for Order Dispatched */}
          {selectedOrder.status === 'Order Dispatched' && (
            <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
              <h2 className="text-xs font-black text-slate-800 border-b pb-2">Dispatch Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold text-slate-700">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 font-bold">Courier Name</label>
                  <input
                    type="text"
                    readOnly
                    value="Abcd Courier Company"
                    className="w-full px-4 py-2.5 border rounded-lg bg-slate-50 text-slate-600 font-bold outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 font-bold">Courier ID</label>
                  <input
                    type="text"
                    readOnly
                    value="1234567890"
                    className="w-full px-4 py-2.5 border rounded-lg bg-slate-50 text-slate-600 font-bold outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Product History View */}
      {view === 'history' && (
        <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-6 text-xs font-semibold text-slate-700">
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 border-b pb-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Product Name</label>
              <input
                type="text"
                placeholder="Enter Product Name"
                value={historySearch}
                onChange={e => setHistorySearch(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg outline-none font-bold"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">From Date</label>
              <input
                type="date"
                className="w-full px-4 py-2 border rounded-lg outline-none font-bold text-slate-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">To Date</label>
              <input
                type="date"
                className="w-full px-4 py-2 border rounded-lg outline-none font-bold text-slate-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Status</label>
              <select
                value={historyStatusFilter}
                onChange={e => setHistoryStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg bg-white outline-none font-bold"
              >
                <option value="">Select an Option</option>
                <option value="Payment Pending">Payment Pending</option>
                <option value="Order Generated">Order Generated</option>
                <option value="Working">Working</option>
                <option value="Order Dispatched">Order Dispatched</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-center border-collapse">
              <thead className="bg-slate-50 font-black text-slate-655 border-b">
                <tr>
                  <th className="px-3 py-4 w-14">S. No.</th>
                  <th className="px-3 py-4 text-left">Product Name</th>
                  <th className="px-3 py-4">Quantity</th>
                  <th className="px-3 py-4">Per Piece Price</th>
                  <th className="px-3 py-4">Total Price</th>
                  <th className="px-3 py-4">Tax</th>
                  <th className="px-3 py-4">Final Amount</th>
                  <th className="px-3 py-4 w-28">Updated At</th>
                  <th className="px-3 py-4">Status</th>
                  <th className="px-3 py-4 w-28">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item, idx) => (
                  <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold">
                    <td className="px-3 py-3.5 text-slate-500">{idx + 1}.</td>
                    <td className="px-3 py-3.5 text-left font-bold text-slate-800">{item.productName}</td>
                    <td className="px-3 py-3.5 text-slate-800">{item.quantity}</td>
                    <td className="px-3 py-3.5 font-bold text-[#1b3a60]">₹{item.perPiecePrice.toFixed(2)}</td>
                    <td className="px-3 py-3.5 font-bold text-[#1b3a60]">₹{item.totalPrice.toFixed(2)}</td>
                    <td className="px-3 py-3.5 text-slate-400">{item.tax}</td>
                    <td className="px-3 py-3.5 font-black text-teal-600">₹{item.finalAmount.toFixed(2)}</td>
                    <td className="px-3 py-3.5 text-slate-500 text-[10px] font-bold">{item.updatedAt}</td>
                    <td className="px-3 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
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
                        className="w-6 h-6 rounded bg-slate-50 hover:bg-slate-100 border text-slate-400 flex items-center justify-center mx-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredHistory.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400 font-bold">
                      No order records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Query Details Modal */}
      {queryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border rounded-3xl shadow-2xl w-full max-w-xl p-6 text-xs font-semibold text-slate-700 animate-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setQueryModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-sm font-black text-[#1b3a60] border-b pb-2 mb-4">Query Details</h2>

            <form onSubmit={handleSendQuerySubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-bold text-[10px]">School Name</label>
                  <input
                    type="text"
                    readOnly
                    value="abcd school"
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 text-slate-500 font-bold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-bold text-[10px]">User Role</label>
                  <input
                    type="text"
                    readOnly
                    value="Teacher"
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 text-slate-500 font-bold"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-bold text-[10px]">Address</label>
                <input
                  type="text"
                  readOnly
                  value="123, Location, Landmark, Street Name, City Name, Pincode"
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 text-slate-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-500 font-bold">Your Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="Enter Your Name"
                    value={queryName}
                    onChange={e => setQueryName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg outline-none font-bold bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-500 font-bold">Mobile No. <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="Enter Mobile No."
                    value={queryMobile}
                    onChange={e => setQueryMobile(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg outline-none font-bold bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setQueryModalOpen(false)}
                  className="px-6 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md"
                >
                  Send Query
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-base font-black text-slate-800">Successfully Send</h3>
            <p className="text-[11px] leading-relaxed text-slate-400 font-semibold">
              Your query has been submitted successfully. Our team will get in touch with you shortly. Thank you.
            </p>

            <button
              onClick={() => {
                setSuccessModalOpen(false)
                setView('history')
              }}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl text-xs transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}
    </div>
  )
}
