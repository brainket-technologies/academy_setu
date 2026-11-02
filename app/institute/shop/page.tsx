'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
  ShoppingCart,
  ShoppingBag,
  X,
  MessageSquare,
  Loader2,
  Check,
  ArrowRight,
  Truck,
  CreditCard,
  MapPin,
  Phone,
  User,
  Package,
  Clock,
  RefreshCw,
  AlertCircle,
  Star,
  Heart,
  ShieldCheck,
  Tag,
  Zap,
  FileText,
  Send,
  Sparkles,
  Layers,
  Palette,
  IndianRupee,
  Share2
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
  status: 'Payment Pending' | 'Order Generated' | 'Working' | 'Order Dispatched' | string
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

interface EnquiryItem {
  id: string
  schoolName: string
  name: string
  mobile: string
  address: string
  productName: string
  quantity: number
  size?: string
  color?: string
  price: number
  totalAmount: number
  status: string
  remarks?: string
  adminRemarks?: string
  paymentStatus?: string
  enquiryDate: string
  createdAt?: string
}

export default function ShopModulePage() {
  const [view, setView] = useState<'grid' | 'details' | 'inquiries' | 'history' | 'order_details'>('grid')

  // Products from Admin
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [productsLoading, setProductsLoading] = useState(true)

  // Wishlist toggle state (aesthetic feature)
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({})

  // Orders History
  const [historyList, setHistoryList] = useState<OrderHistoryItem[]>([])
  const [selectedOrder, setSelectedOrder] = useState<OrderHistoryItem | null>(null)
  const [ordersLoading, setOrdersLoading] = useState(false)

  // Product Enquiries & Quotes
  const [enquiriesList, setEnquiriesList] = useState<EnquiryItem[]>([])
  const [enquiriesLoading, setEnquiriesLoading] = useState(false)
  const [enquirySearch, setEnquirySearch] = useState('')
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState('')

  // Product Detail Selection State
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [orderQty, setOrderQty] = useState(1)

  // Direct Buy / Order Modal
  const [buyModalOpen, setBuyModalOpen] = useState(false)
  const [orderContactName, setOrderContactName] = useState('Cosmopolitan Inter Office')
  const [orderContactMobile, setOrderContactMobile] = useState('9876543210')
  const [orderAddress, setOrderAddress] = useState('Main School Campus, Administrative Block')
  const [orderPaymentMode, setOrderPaymentMode] = useState<'pay_now' | 'invoice_later'>('pay_now')
  const [submittingOrder, setSubmittingOrder] = useState(false)

  // Product Query / Request Quote Modal
  const [queryModalOpen, setQueryModalOpen] = useState(false)
  const [queryProduct, setQueryProduct] = useState<Product | null>(null)
  const [queryQty, setQueryQty] = useState(1)
  const [querySize, setQuerySize] = useState('')
  const [queryColor, setQueryColor] = useState('')
  const [queryName, setQueryName] = useState('Cosmopolitan Inter Office')
  const [queryMobile, setQueryMobile] = useState('9876543210')
  const [queryAddress, setQueryAddress] = useState('Main School Campus, Administrative Block')
  const [queryRemarks, setQueryRemarks] = useState('')
  const [submittingQuery, setSubmittingQuery] = useState(false)

  // Pay Modal for "Ready to Pay" Enquiry
  const [payModalOpen, setPayModalOpen] = useState(false)
  const [selectedEnquiryToPay, setSelectedEnquiryToPay] = useState<EnquiryItem | null>(null)
  const [payingEnquiry, setPayingEnquiry] = useState(false)
  const [paymentMode, setPaymentMode] = useState<'online' | 'upi' | 'netbanking'>('online')

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
    setTimeout(() => setToastOpen(false), 3500)
  }

  // Fetch products from Admin API
  const fetchProducts = useCallback(async () => {
    setProductsLoading(true)
    try {
      const url = productSearch
        ? `/api/institute/shop/products?search=${encodeURIComponent(productSearch)}`
        : '/api/institute/shop/products'
      const res = await fetch(url)
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        const mapped: Product[] = data.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          images:
            Array.isArray(p.images) && p.images.length > 0
              ? p.images
              : ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80'],
          mrp_price: parseFloat(p.mrp_price || 0),
          sell_price: parseFloat(p.sell_price || 0),
          colors: Array.isArray(p.colors) && p.colors.length > 0 ? p.colors : ['Standard'],
          sizes: Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : ['Standard'],
          features:
            Array.isArray(p.features) && p.features.length > 0 ? p.features : ['Quality Assured', 'Certified Supply'],
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

  // Fetch Order History
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

  // Fetch Enquiries & Quotes
  const fetchEnquiries = useCallback(async () => {
    setEnquiriesLoading(true)
    try {
      const params = new URLSearchParams()
      if (enquirySearch) params.append('search', enquirySearch)
      if (enquiryStatusFilter) params.append('status', enquiryStatusFilter)

      const res = await fetch(`/api/institute/shop/enquiries?${params.toString()}`)
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setEnquiriesList(data.data)
      }
    } catch (err) {
      console.error('Error fetching enquiries:', err)
      triggerToast('Error loading inquiries')
    } finally {
      setEnquiriesLoading(false)
    }
  }, [enquirySearch, enquiryStatusFilter])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    if (view === 'history' || view === 'order_details') {
      fetchOrders()
    }
    if (view === 'inquiries') {
      fetchEnquiries()
    }
  }, [view, fetchOrders, fetchEnquiries])

  // Count how many queries are in 'Ready to Pay' / 'To Pay'
  const readyToPayCount = useMemo(() => {
    return enquiriesList.filter((e) => e.status === 'Ready to Pay' || e.status === 'To Pay').length
  }, [enquiriesList])

  const handleOpenProduct = (p: Product) => {
    setSelectedProduct(p)
    setSelectedImageIndex(0)
    setSelectedColor(p.colors[0] || 'Standard')
    setSelectedSize(p.sizes[0] || 'Standard')
    setOrderQty(Math.max(1, p.moq))
    setView('details')
  }

  const handleOpenQueryModal = (p: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setQueryProduct(p)
    setQueryQty(Math.max(1, p.moq))
    setQueryColor(p.colors[0] || 'Standard')
    setQuerySize(p.sizes[0] || 'Standard')
    setQueryRemarks('')
    setQueryModalOpen(true)
  }

  const handleOpenOrderDetails = (order: OrderHistoryItem) => {
    setSelectedOrder(order)
    const matched = products.find((p) => p.name.toLowerCase() === order.productName.toLowerCase())
    if (matched) setSelectedProduct(matched)
    setView('order_details')
  }

  // Toggle wishlist
  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setWishlist((prev) => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  // Submit Query to Admin
  const handleSubmitQuery = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!queryProduct) return
    if (!queryName.trim() || !queryMobile.trim()) {
      alert('Please fill in Contact Name and Mobile Number.')
      return
    }

    setSubmittingQuery(true)
    try {
      const unitPrice = parseFloat(String(queryProduct.sell_price))
      const payload = {
        productName: queryProduct.name,
        quantity: queryQty,
        size: querySize,
        color: queryColor,
        price: unitPrice,
        totalAmount: unitPrice * queryQty,
        name: queryName.trim(),
        mobile: queryMobile.trim(),
        address: queryAddress.trim(),
        remarks: queryRemarks.trim()
      }

      const res = await fetch('/api/institute/shop/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (data.success) {
        setQueryModalOpen(false)
        triggerToast(`Inquiry sent for ${queryProduct.name}! Admin will review & quote.`)
        await fetchEnquiries()
        setView('inquiries')
      } else {
        alert(data.error || 'Failed to submit inquiry')
      }
    } catch (err) {
      console.error(err)
      alert('Error submitting inquiry')
    } finally {
      setSubmittingQuery(false)
    }
  }

  // Submit Direct Order
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

  // Handle Pay for "Ready to Pay" Enquiry
  const handleOpenPayModal = (enquiry: EnquiryItem) => {
    setSelectedEnquiryToPay(enquiry)
    setPayModalOpen(true)
  }

  const handleConfirmPayEnquiry = async () => {
    if (!selectedEnquiryToPay) return
    setPayingEnquiry(true)
    try {
      const res = await fetch(`/api/institute/shop/enquiries/${selectedEnquiryToPay.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'pay',
          paymentReference: `PAY-${Date.now().toString().slice(-8)}`
        })
      })

      const data = await res.json()
      if (data.success) {
        setPayModalOpen(false)
        triggerToast('Payment Successful! Order has been generated.')
        await fetchEnquiries()
        await fetchOrders()
      } else {
        alert(data.error || 'Payment failed')
      }
    } catch (err) {
      console.error(err)
      alert('Payment processing error')
    } finally {
      setPayingEnquiry(false)
    }
  }

  // Handle pay now for Order History items that are 'Payment Pending'
  const handlePayHistoryOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/institute/shop/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Order Generated' })
      })
      const data = await res.json()
      if (data.success) {
        triggerToast('Payment Successful! Order Generated.')
        setHistoryList((prev) =>
          prev.map((item) => (item.id === orderId ? { ...item, status: 'Order Generated' } : item))
        )
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: 'Order Generated' })
        }
      }
    } catch {
      alert('Error processing payment')
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-16 animate-in fade-in duration-300">
      {/* 1. Header with Title & Tab Navigation */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-black text-slate-850">
              {view === 'grid' && 'All Products'}
              {view === 'details' && 'Product Details'}
              {view === 'inquiries' && 'Inquiries & Quotations'}
              {view === 'order_details' && 'Order Summary & Tracking'}
              {view === 'history' && 'Order History'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Cosmopolitan Inter
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-1">
            {view === 'grid' &&
              'Browse verified academic uniforms, smart tech, and hardware supplies added by Admin'}
            {view === 'details' &&
              'Detailed specifications, bulk discount tiers, instant quote inquiries, and purchase'}
            {view === 'inquiries' &&
              'Track product queries sent to Admin, review quoted amounts, and pay directly when approved'}
            {view === 'history' && 'Track confirmed orders, invoices, and logistics dispatches'}
            {view === 'order_details' && 'Complete breakdown of ordered items, payment verification, and delivery'}
          </p>
        </div>

        {/* View Toggle Tabs (Flipkart-Style Pills) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setView('grid')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              view === 'grid'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>All Products</span>
          </button>

          <button
            onClick={() => setView('inquiries')}
            className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              view === 'inquiries'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
            <span>Inquiries & Quotes</span>
            {readyToPayCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-emerald-500 text-white text-[10px] font-black rounded-full animate-pulse">
                {readyToPayCount} To Pay
              </span>
            )}
          </button>

          <button
            onClick={() => setView('history')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              view === 'history' || view === 'order_details'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5 text-amber-500" />
            <span>Order History</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. ALL PRODUCTS GRID VIEW (Flipkart Card Design)           */}
      {/* ========================================================= */}
      {view === 'grid' && (
        <div className="space-y-6">
          {/* Search bar & Filter Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products added by admin..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl outline-none font-semibold text-slate-800 placeholder-slate-400 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end text-xs font-semibold text-slate-500">
              <span>
                Showing <span className="text-slate-900 font-black">{products.length}</span> Products from Admin
              </span>
              <button
                onClick={fetchProducts}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                title="Refresh products"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${productsLoading ? 'animate-spin text-blue-600' : ''}`} />
              </button>
            </div>
          </div>

          {productsLoading ? (
            <div className="py-24 text-center flex flex-col items-center justify-center gap-3 text-slate-400 bg-white rounded-2xl border border-slate-200/80">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              <span className="text-xs font-bold text-slate-600">Loading products added by Admin...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 p-8">
              <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 mb-2 stroke-[1.5]" />
              <h3 className="text-sm font-bold text-slate-700">No products available.</h3>
              <p className="text-xs text-slate-400 mt-1">Admin has not added any products yet to the catalogue.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.map((p) => {
                const mrp = parseFloat(String(p.mrp_price || 0))
                const buy = parseFloat(String(p.sell_price || 0))
                const save = Math.max(0, mrp - buy)
                const discountPercent = mrp > 0 && buy < mrp ? Math.round(((mrp - buy) / mrp) * 100) : 0
                const mainImg =
                  p.images[0] ||
                  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80'
                const isWishlisted = !!wishlist[p.id]

                return (
                  <div
                    key={p.id}
                    onClick={() => handleOpenProduct(p)}
                    className="bg-white rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative group cursor-pointer"
                  >
                    {/* Top Section / Image with Flipkart Overlays */}
                    <div>
                      <div className="relative aspect-[4/3] bg-gradient-to-b from-slate-50 to-slate-100/60 p-4 flex items-center justify-center overflow-hidden">
                        <img
                          src={mainImg}
                          alt={p.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Top Left: Discount tag */}
                        {save > 0 && (
                          <span className="absolute top-3 left-3 bg-emerald-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                            Save ₹{save.toFixed(0)}
                            {discountPercent > 0 && <span>• {discountPercent}% off</span>}
                          </span>
                        )}

                        {/* Top Right: Wishlist Heart Button */}
                        <button
                          type="button"
                          onClick={(e) => toggleWishlist(p.id, e)}
                          className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 shadow-xs flex items-center justify-center transition-all cursor-pointer hover:scale-110 ${
                            isWishlisted ? 'text-rose-500 fill-rose-500' : 'text-slate-400 hover:text-rose-500'
                          }`}
                          title="Wishlist"
                        >
                          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                        </button>

                        {/* Bottom Left: MOQ Badge */}
                        <span className="absolute bottom-3 left-3 bg-slate-900/80 text-white font-bold text-[9px] px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
                          <Package className="w-2.5 h-2.5" />
                          Min Qty: {p.moq} pcs
                        </span>

                        {/* Bottom Right: Flipkart Assured / Setu Assured Badge */}
                        <span className="absolute bottom-3 right-3 bg-white/95 border border-blue-200 text-blue-700 font-black text-[9px] px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-blue-600" />
                          <span className="tracking-tight">Setu Assured</span>
                        </span>
                      </div>

                      {/* Middle Section: Flipkart details */}
                      <div className="p-4 space-y-2.5">
                        <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                          Institutional Supply
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-850 group-hover:text-blue-600 transition-colors text-sm line-clamp-1">
                            {p.name}
                          </h3>
                          <p className="text-[11px] text-slate-400 font-medium line-clamp-2 mt-1 leading-relaxed">
                            {p.description}
                          </p>
                        </div>

                        {/* Rating Badge */}
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-600 text-white text-[11px] font-black rounded-sm shadow-2xs">
                            4.6 <Star className="w-2.5 h-2.5 fill-white" />
                          </span>
                          <span className="text-[11px] text-slate-400 font-semibold">(84 Ratings)</span>
                        </div>

                        {/* Price Row */}
                        <div className="pt-2 border-t border-slate-100 flex items-baseline gap-2">
                          <span className="text-lg font-black text-slate-900">₹{buy.toFixed(2)}</span>
                          {mrp > buy && (
                            <>
                              <span className="text-xs text-slate-400 line-through">₹{mrp.toFixed(2)}</span>
                              <span className="text-xs font-bold text-emerald-600">{discountPercent}% off</span>
                            </>
                          )}
                        </div>

                        <div className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                          <Truck className="w-3 h-3 text-slate-400" />
                          <span>Free Institutional Delivery • 7 Days Replacement</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Buttons (Dual: Send Query & Buy Now) */}
                    <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleOpenQueryModal(p, e)}
                        className="py-2.5 px-3 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                        title="Submit query to admin"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Send Query</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenProduct(p)}
                        className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-blue-600/20"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Buy Now</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. PRODUCT DETAILS VIEW (Flipkart Style Layout)            */}
      {/* ========================================================= */}
      {view === 'details' && selectedProduct && (
        <div className="space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <button onClick={() => setView('grid')} className="hover:text-blue-600 cursor-pointer">
              Shop Catalogue
            </button>
            <span>/</span>
            <span className="text-slate-600 font-bold">Academic Supplies</span>
            <span>/</span>
            <span className="text-blue-600 font-bold truncate max-w-xs">{selectedProduct.name}</span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-xs flex flex-col md:flex-row gap-8 items-start">
            {/* Left Column: Image Gallery & Large Sticky Actions */}
            <div className="w-full md:w-1/2 space-y-4">
              <div className="relative aspect-[4/3] bg-gradient-to-b from-slate-50 to-slate-100/60 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center p-6">
                <img
                  src={selectedProduct.images[selectedImageIndex] || selectedProduct.images[0]}
                  alt={selectedProduct.name}
                  className="w-full h-full object-contain"
                />

                {/* Left / Right image navigation */}
                {selectedProduct.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedImageIndex((prev) =>
                          prev > 0 ? prev - 1 : selectedProduct.images.length - 1
                        )
                      }
                      className="absolute left-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-110"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedImageIndex((prev) =>
                          prev < selectedProduct.images.length - 1 ? prev + 1 : 0
                        )
                      }
                      className="absolute right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-110"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Setu Assured watermark */}
                <div className="absolute bottom-3 right-3 bg-white/95 border border-blue-200 text-blue-700 font-black text-[10px] px-2.5 py-1 rounded shadow-xs flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Setu Assured Verified Supply</span>
                </div>
              </div>

              {/* Thumbnails */}
              {selectedProduct.images.length > 1 && (
                <div className="grid grid-cols-5 gap-2.5">
                  {selectedProduct.images.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedImageIndex(i)}
                      className={`aspect-square border-2 rounded-xl bg-slate-50 cursor-pointer overflow-hidden p-1 relative transition-all ${
                        selectedImageIndex === i
                          ? 'border-blue-600 shadow-xs ring-2 ring-blue-500/20'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`thumb-${i}`} className="w-full h-full object-contain" />
                    </div>
                  ))}
                </div>
              )}

              {/* Flipkart Dual CTA Action Buttons Below Image */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenQueryModal(selectedProduct)}
                  className="py-3 px-4 rounded-xl border-2 border-blue-600 bg-blue-50/60 hover:bg-blue-100/80 text-blue-700 font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>SEND QUERY / QUOTE</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBuyModalOpen(true)}
                  className="py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-500/20"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>BUY NOW</span>
                </button>
              </div>
            </div>

            {/* Right Column: Title, Ratings, Pricing, Specifications */}
            <div className="w-full md:w-1/2 space-y-5 text-xs font-semibold text-slate-700">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  Academic Verified Product
                </span>
                <h2 className="text-xl font-black text-slate-850 mt-2 leading-snug">{selectedProduct.name}</h2>

                {/* Rating & Review Counter */}
                <div className="flex items-center gap-2.5 mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-600 text-white text-xs font-black rounded shadow-2xs">
                    4.6 <Star className="w-3 h-3 fill-white" />
                  </span>
                  <span className="text-slate-400 font-semibold text-xs">142 Ratings & 28 Reviews</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-blue-600 font-bold text-xs flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Setu Assured
                  </span>
                </div>
              </div>

              {/* Special Institutional Price Callout */}
              <div className="bg-slate-50/70 border border-slate-200/80 p-4 rounded-2xl space-y-1">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                  Special Institutional Price
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-slate-900">
                    ₹{parseFloat(String(selectedProduct.sell_price)).toFixed(2)}
                  </span>
                  {parseFloat(String(selectedProduct.mrp_price)) > parseFloat(String(selectedProduct.sell_price)) && (
                    <>
                      <span className="text-slate-400 line-through text-sm font-semibold">
                        ₹{parseFloat(String(selectedProduct.mrp_price)).toFixed(2)}
                      </span>
                      <span className="text-emerald-600 font-extrabold text-sm">
                        {Math.round(
                          ((parseFloat(String(selectedProduct.mrp_price)) -
                            parseFloat(String(selectedProduct.sell_price))) /
                            parseFloat(String(selectedProduct.mrp_price))) *
                            100
                        )}
                        % off
                      </span>
                    </>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  Per piece price • Exclusive of 18% GST • Institutional Invoicing with Input Tax Credit
                </p>
              </div>

              {/* Available Bulk Offers (Flipkart Box) */}
              <div className="p-4 bg-amber-50/50 border border-amber-200/70 rounded-2xl space-y-2">
                <h3 className="font-black text-amber-900 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                  <Tag className="w-3.5 h-3.5 text-amber-600" />
                  Available Institutional Offers
                </h3>
                <ul className="space-y-1.5 text-[11px] text-amber-800 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-amber-600">•</span>
                    <span>
                      <strong className="font-bold text-amber-950">Bulk Discount Query:</strong> Need 50+ units? Send a
                      query to negotiate custom pricing directly with the Admin.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-amber-600">•</span>
                    <span>
                      <strong className="font-bold text-amber-950">GST Input Credit:</strong> Full tax invoice provided
                      for institutional reimbursement & tax deductions.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-amber-600">•</span>
                    <span>
                      <strong className="font-bold text-amber-950">Flexible Terms:</strong> Admin can approve inquiry to
                      "Ready to Pay" with customized quote amounts.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Description */}
              <div className="space-y-1.5 pt-2">
                <h3 className="font-black text-slate-800 uppercase tracking-wider text-[11px]">Product Description</h3>
                <p className="text-slate-600 leading-relaxed font-medium text-[11px]">
                  {selectedProduct.description || 'Premium institutional supply certified for school operations.'}
                </p>
              </div>

              {/* Colors */}
              {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h3 className="font-black text-slate-800 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-blue-600" />
                    <span>Color:</span>
                    <span className="text-blue-600 font-bold">{selectedColor}</span>
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedProduct.colors.map((col) => {
                      const isSel = selectedColor === col
                      return (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setSelectedColor(col)}
                          className={`px-3 py-1.5 border rounded-xl text-xs font-bold cursor-pointer transition-all ${
                            isSel
                              ? 'border-blue-600 bg-blue-50 text-blue-700 font-black shadow-xs ring-2 ring-blue-500/20'
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
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
                  <h3 className="font-black text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>Size:</span>
                    <span className="text-blue-600 font-bold">{selectedSize}</span>
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedProduct.sizes.map((sz) => {
                      const isSel = selectedSize === sz
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSelectedSize(sz)}
                          className={`min-w-10 h-8 px-2.5 border rounded-xl text-xs font-bold flex items-center justify-center cursor-pointer transition-all ${
                            isSel
                              ? 'border-blue-600 bg-blue-50 text-blue-700 font-black shadow-xs ring-2 ring-blue-500/20'
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {sz}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Counter */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-800">Order Quantity (Pieces):</h3>
                  <span className="text-slate-400 font-bold text-[10px]">Min MOQ: {selectedProduct.moq} pcs</span>
                </div>
                <div className="flex items-center border border-slate-200 rounded-xl w-40 overflow-hidden bg-slate-50">
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
                    onChange={(e) =>
                      setOrderQty(Math.max(selectedProduct.moq, parseInt(e.target.value) || selectedProduct.moq))
                    }
                    className="flex-1 text-center font-black text-slate-800 bg-transparent outline-none text-xs"
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

              {/* Price Calculation Summary Box */}
              {(() => {
                const unit = parseFloat(String(selectedProduct.sell_price))
                const subtotal = unit * orderQty
                const tax = subtotal * 0.18
                const total = subtotal + tax

                return (
                  <div className="border rounded-2xl p-4 bg-slate-50/80 border-slate-200 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">
                        Subtotal ({orderQty} pcs × ₹{unit.toFixed(2)})
                      </span>
                      <span className="font-bold text-slate-800">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">GST (18%)</span>
                      <span className="font-bold text-slate-800">₹{tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-slate-900">
                      <span>Total Amount with Taxes</span>
                      <span className="text-base text-blue-600">₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                )
              })()}

              {/* Flipkart Specifications Table */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h3 className="font-black text-slate-800 uppercase tracking-wider text-xs">
                  Specifications & Highlights
                </h3>
                <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      <tr className="bg-slate-50/50">
                        <td className="py-2.5 px-4 font-bold text-slate-400 w-1/3">In The Box</td>
                        <td className="py-2.5 px-4 font-semibold text-slate-800">{selectedProduct.name} (Bulk Pack)</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-bold text-slate-400">Suitable For</td>
                        <td className="py-2.5 px-4 font-semibold text-slate-800">
                          Educational Institutes, Students & Faculty
                        </td>
                      </tr>
                      <tr className="bg-slate-50/50">
                        <td className="py-2.5 px-4 font-bold text-slate-400">Quality Standard</td>
                        <td className="py-2.5 px-4 font-semibold text-slate-800">Admin Verified Setu Assured Grade A</td>
                      </tr>
                      {selectedProduct.features &&
                        selectedProduct.features.map((feat, idx) => (
                          <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/50' : ''}>
                            <td className="py-2.5 px-4 font-bold text-slate-400">Feature {idx + 1}</td>
                            <td className="py-2.5 px-4 font-semibold text-slate-800 flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{feat}</span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Return to Catalogue */}
              <button
                type="button"
                onClick={() => setView('grid')}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer text-xs"
              >
                ← Back to All Products
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. INQUIRIES & QUOTATIONS TRACKER VIEW                    */}
      {/* ========================================================= */}
      {view === 'inquiries' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-6 text-xs font-semibold text-slate-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-slate-850">Product Inquiries & Price Quotes</h2>
                {readyToPayCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 border border-emerald-300 animate-pulse">
                    {readyToPayCount} Ready to Pay
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Admin reviews your product queries and sends custom price quotes with a "Pay Now" payment option
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setView('grid')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-bold cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>+ Query Another Product</span>
              </button>
              <button
                type="button"
                onClick={fetchEnquiries}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-bold cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${enquiriesLoading ? 'animate-spin text-blue-600' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-slate-100 pb-4">
            <div>
              <label className="text-slate-500 font-bold mb-1 block">Search Query / Product</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter inquiries..."
                  value={enquirySearch}
                  onChange={(e) => setEnquirySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl outline-none font-bold bg-white text-xs"
                />
              </div>
            </div>
            <div>
              <label className="text-slate-500 font-bold mb-1 block">Status</label>
              <select
                value={enquiryStatusFilter}
                onChange={(e) => setEnquiryStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white outline-none font-bold cursor-pointer text-xs"
              >
                <option value="">All Statuses</option>
                <option value="Enquired">Enquired (Pending Quote)</option>
                <option value="Ready to Pay">Ready to Pay (To Pay)</option>
                <option value="Order Generated">Order Generated / Paid</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {enquiriesLoading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span>Loading product inquiries...</span>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-center border-collapse">
                <thead className="bg-slate-50/80 font-black text-slate-600 border-b border-slate-200 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="px-3 py-4 w-12">S.No.</th>
                    <th className="px-3 py-4 text-left min-w-[180px]">Product & Query Details</th>
                    <th className="px-3 py-4">Quantity</th>
                    <th className="px-3 py-4">Quoted Unit Price</th>
                    <th className="px-3 py-4">Total Amount to Pay</th>
                    <th className="px-3 py-4 w-28">Date</th>
                    <th className="px-3 py-4 min-w-[150px]">Status</th>
                    <th className="px-3 py-4 min-w-[180px] text-left">Admin Quotation Notes</th>
                    <th className="px-3 py-4 min-w-[140px]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {enquiriesList.map((item, idx) => {
                    const isReadyToPay = item.status === 'Ready to Pay' || item.status === 'To Pay'
                    const isPaid = item.status === 'Order Generated'

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-3 py-4 text-slate-400 font-bold">{idx + 1}.</td>
                        <td className="px-3 py-4 text-left">
                          <div className="font-bold text-slate-850 text-sm">{item.productName}</div>
                          {(item.color || item.size) && (
                            <div className="text-[10px] text-slate-400 font-medium">
                              {item.color ? `Color: ${item.color} • ` : ''}
                              {item.size ? `Size: ${item.size}` : ''}
                            </div>
                          )}
                          {item.remarks && (
                            <div className="text-[10px] text-slate-500 italic mt-0.5 line-clamp-1">
                              Req: "{item.remarks}"
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-4 font-bold text-slate-800">{item.quantity} pcs</td>
                        <td className="px-3 py-4 font-mono text-slate-700">
                          {item.price > 0 ? `₹${item.price.toFixed(2)}` : '—'}
                        </td>
                        <td className="px-3 py-4">
                          {item.totalAmount > 0 ? (
                            <span className="font-black text-blue-700 text-sm font-mono">
                              ₹{item.totalAmount.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-amber-600 font-bold text-[11px] bg-amber-50 px-2 py-0.5 rounded">
                              Pending Quote
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-4 text-slate-400 text-[11px]">{item.enquiryDate}</td>
                        <td className="px-3 py-4">
                          {isReadyToPay ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs">
                              <CreditCard className="w-3 h-3 text-emerald-600" />
                              Ready to Pay
                            </span>
                          ) : isPaid ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                              Order Generated
                            </span>
                          ) : item.status === 'Closed' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              Closed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-500" />
                              Enquired
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-4 text-left text-[11px]">
                          {item.adminRemarks ? (
                            <span className="text-slate-700 font-medium bg-slate-50 px-2 py-1 rounded border border-slate-200 block">
                              {item.adminRemarks}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">No notes yet</span>
                          )}
                        </td>
                        <td className="px-3 py-4">
                          {isReadyToPay ? (
                            <button
                              type="button"
                              onClick={() => handleOpenPayModal(item)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer mx-auto"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Pay Now</span>
                            </button>
                          ) : isPaid ? (
                            <button
                              type="button"
                              onClick={() => setView('history')}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer mx-auto flex items-center gap-1"
                            >
                              <span>View Order</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px] font-semibold">Awaiting Quote</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  {enquiriesList.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-14 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <MessageSquare className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                          <span className="text-slate-600 text-sm font-bold">No product inquiries recorded yet</span>
                          <button
                            type="button"
                            onClick={() => setView('grid')}
                            className="mt-1 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm"
                          >
                            Browse Products to Query →
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

      {/* ========================================================= */}
      {/* 5. ORDER HISTORY VIEW (Dispatches & Confirmed Orders)     */}
      {/* ========================================================= */}
      {view === 'history' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-6 text-xs font-semibold text-slate-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-black text-slate-850">Order History for Cosmopolitan Inter</h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Track all confirmed purchased products, dispatch logistics, and payment receipts
              </p>
            </div>
            <button
              type="button"
              onClick={fetchOrders}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-bold cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${ordersLoading ? 'animate-spin text-blue-600' : ''}`} />
              <span>Refresh Orders</span>
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 border-b border-slate-100 pb-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Product Name</label>
              <input
                type="text"
                placeholder="Search by product name..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none font-bold bg-white text-xs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">From Date</label>
              <input
                type="date"
                value={historyFromDate}
                onChange={(e) => setHistoryFromDate(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none font-bold text-slate-600 bg-white text-xs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">To Date</label>
              <input
                type="date"
                value={historyToDate}
                onChange={(e) => setHistoryToDate(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none font-bold text-slate-600 bg-white text-xs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Status</label>
              <select
                value={historyStatusFilter}
                onChange={(e) => setHistoryStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white outline-none font-bold cursor-pointer text-xs"
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
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span>Loading order history...</span>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-center border-collapse">
                <thead className="bg-slate-50/80 font-black text-slate-600 border-b border-slate-200 text-[11px] uppercase tracking-wider">
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
                    <th className="px-3 py-4 min-w-[120px]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {historyList.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors font-semibold">
                      <td className="px-3 py-3.5 text-slate-500 font-bold">{idx + 1}.</td>
                      <td className="px-3 py-3.5 text-left font-bold text-slate-800">
                        <div>{item.productName}</div>
                        {item.size && <span className="text-[10px] text-slate-400">Size: {item.size}</span>}
                      </td>
                      <td className="px-3 py-3.5 text-slate-800 font-bold">{item.quantity} pcs</td>
                      <td className="px-3 py-3.5 text-slate-600">₹{item.perPiecePrice.toFixed(2)}</td>
                      <td className="px-3 py-3.5 text-slate-600">₹{item.totalPrice.toFixed(2)}</td>
                      <td className="px-3 py-3.5 text-slate-400">{item.tax}</td>
                      <td className="px-3 py-3.5 font-black text-blue-600">₹{item.finalAmount.toFixed(2)}</td>
                      <td className="px-3 py-3.5 text-slate-500 text-[10px] font-bold">{item.updatedAt}</td>
                      <td className="px-3 py-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                            item.status === 'Payment Pending'
                              ? 'bg-rose-50 text-rose-600 border-rose-200'
                              : item.status === 'Order Generated'
                              ? 'bg-purple-50 text-purple-600 border-purple-200'
                              : item.status === 'Working'
                              ? 'bg-amber-50 text-amber-600 border-amber-200'
                              : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center justify-center gap-2">
                          {item.status === 'Payment Pending' && (
                            <button
                              type="button"
                              onClick={() => handlePayHistoryOrder(item.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-xs cursor-pointer"
                              title="Complete payment for this order"
                            >
                              Pay Now
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenOrderDetails(item)}
                            className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                            title="View Order Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
                            className="mt-1 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm"
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

      {/* ========================================================= */}
      {/* 6. ORDER DETAILS BREAKDOWN (Single Order View)            */}
      {/* ========================================================= */}
      {view === 'order_details' && selectedOrder && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-xs flex flex-col md:flex-row gap-8 items-start text-xs font-semibold text-slate-700">
            {/* Left Info Panel */}
            <div className="w-full md:w-1/2 space-y-4">
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order ID</span>
                  <span className="font-mono text-slate-800 font-bold">#{selectedOrder.id.slice(0, 8)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Order Status</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                      selectedOrder.status === 'Payment Pending'
                        ? 'bg-rose-50 text-rose-600 border-rose-200'
                        : selectedOrder.status === 'Order Generated'
                        ? 'bg-purple-50 text-purple-600 border-purple-200'
                        : selectedOrder.status === 'Working'
                        ? 'bg-amber-50 text-amber-600 border-amber-200'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    }`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Order Date</span>
                  <span className="font-bold text-slate-800">{selectedOrder.updatedAt}</span>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/70 space-y-2.5">
                <h3 className="font-black text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Delivery Address</span>
                </h3>
                <div className="text-slate-800 font-bold">{selectedOrder.name || 'Cosmopolitan Inter Office'}</div>
                <div className="text-slate-500">{selectedOrder.mobile ? `+91 ${selectedOrder.mobile}` : ''}</div>
                <div className="text-slate-500 text-[11px] leading-relaxed">
                  {selectedOrder.address || 'Main Campus'}
                </div>
              </div>

              {/* Courier info if dispatched */}
              {selectedOrder.status === 'Order Dispatched' && (
                <div className="border rounded-2xl p-5 bg-emerald-50/60 border-emerald-200 space-y-2">
                  <h3 className="font-black text-emerald-800 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    <span>Courier & Logistics Details</span>
                  </h3>
                  <div className="text-xs font-bold text-slate-800">
                    Courier: {selectedOrder.courierName || 'Trackon Express'}
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    Tracking AWB: {selectedOrder.courierId || '1234567890'}
                  </div>
                </div>
              )}
            </div>

            {/* Right Invoice & Details summary panel */}
            <div className="w-full md:w-1/2 space-y-5">
              <div>
                <h2 className="text-lg font-black text-slate-850">{selectedOrder.productName}</h2>
                <div className="text-slate-500 text-[11px] font-medium mt-0.5">
                  {selectedOrder.productDescription || 'Institutional Order'}
                </div>
              </div>

              {/* Price Details Breakdown */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/60 text-xs font-semibold text-slate-600 space-y-3">
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
                <div className="border-t border-slate-200 pt-3 flex justify-between font-black text-slate-900">
                  <span>Final Amount</span>
                  <span className="text-base text-blue-600">₹{selectedOrder.finalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedOrder.status === 'Payment Pending' ? (
                <button
                  type="button"
                  onClick={() => handlePayHistoryOrder(selectedOrder.id)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-center rounded-xl shadow-md transition-colors cursor-pointer text-xs flex items-center justify-center gap-1.5"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pay Now (₹{selectedOrder.finalAmount.toFixed(2)})</span>
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

      {/* ========================================================= */}
      {/* 7. PRODUCT QUERY / REQUEST QUOTE MODAL                    */}
      {/* ========================================================= */}
      {queryModalOpen && queryProduct && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 text-xs font-semibold text-slate-700 animate-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setQueryModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 pb-3 mb-5">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <span>Send Product Inquiry / Request Quote</span>
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Admin will review your requirement, specify discounted rates, and send a payment request.
              </p>
            </div>

            <form onSubmit={handleSubmitQuery} className="space-y-4">
              {/* Product Pill */}
              <div className="bg-blue-50/60 p-3.5 rounded-2xl border border-blue-100 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{queryProduct.name}</div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Catalog Base Price: ₹{parseFloat(String(queryProduct.sell_price)).toFixed(2)} • MOQ: {queryProduct.moq} pcs
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                  Inquiry
                </span>
              </div>

              {/* Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-600 font-bold">
                    Quantity Needed <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={queryProduct.moq}
                    value={queryQty}
                    onChange={(e) => setQueryQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-bold text-xs"
                    required
                  />
                </div>

                {/* Size */}
                <div className="flex flex-col gap-1">
                  <label className="text-slate-600 font-bold">Size</label>
                  <input
                    type="text"
                    value={querySize}
                    onChange={(e) => setQuerySize(e.target.value)}
                    placeholder="e.g. 32, Standard"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-bold text-xs"
                  />
                </div>

                {/* Color */}
                <div className="flex flex-col gap-1">
                  <label className="text-slate-600 font-bold">Color</label>
                  <input
                    type="text"
                    value={queryColor}
                    onChange={(e) => setQueryColor(e.target.value)}
                    placeholder="e.g. Navy Blue"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-bold text-xs"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-600 font-bold">
                      Contact Person <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={queryName}
                      onChange={(e) => setQueryName(e.target.value)}
                      placeholder="School Principal / Incharge"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-bold text-xs"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-slate-600 font-bold">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={queryMobile}
                      onChange={(e) => setQueryMobile(e.target.value)}
                      placeholder="10-digit number"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-bold text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-slate-600 font-bold">Delivery / Campus Address</label>
                  <input
                    type="text"
                    value={queryAddress}
                    onChange={(e) => setQueryAddress(e.target.value)}
                    placeholder="Enter delivery campus address..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-bold text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-slate-600 font-bold">Requirement Notes / Quotation Request</label>
                  <textarea
                    value={queryRemarks}
                    onChange={(e) => setQueryRemarks(e.target.value)}
                    placeholder="e.g. Please provide bulk discount for 50 pieces with customized school logo embroidery..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-bold text-xs h-16 resize-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setQueryModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingQuery}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {submittingQuery ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Inquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Inquiry to Admin</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. INSTANT PAYMENT MODAL FOR "Ready to Pay" ENQUIRY        */}
      {/* ========================================================= */}
      {payModalOpen && selectedEnquiryToPay && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 text-xs font-semibold text-slate-700 animate-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setPayModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span>Pay for Approved Product Quote</span>
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Admin has reviewed and approved your inquiry with the quotation below.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-sm">{selectedEnquiryToPay.productName}</span>
                  <span className="font-bold text-slate-600 text-xs">{selectedEnquiryToPay.quantity} Pieces</span>
                </div>

                {selectedEnquiryToPay.adminRemarks && (
                  <div className="text-[11px] text-emerald-800 font-medium bg-white/80 p-2 rounded-lg border border-emerald-200">
                    <strong>Admin Note:</strong> {selectedEnquiryToPay.adminRemarks}
                  </div>
                )}

                <div className="flex items-baseline justify-between border-t border-emerald-200/80 pt-2">
                  <span className="text-xs font-bold text-emerald-900">Total Quoted Amount to Pay</span>
                  <span className="text-xl font-black text-emerald-700">
                    ₹{selectedEnquiryToPay.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment Mode Selection */}
              <div className="space-y-2 pt-1">
                <label className="font-bold text-slate-700 text-xs">Select Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMode('online')}
                    className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                      paymentMode === 'online'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMode('upi')}
                    className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                      paymentMode === 'upi'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    UPI / QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMode('netbanking')}
                    className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                      paymentMode === 'netbanking'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    NetBanking
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPayModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPayEnquiry}
                  disabled={payingEnquiry}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {payingEnquiry ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirm & Pay ₹{selectedEnquiryToPay.totalAmount.toFixed(2)}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 9. DIRECT PURCHASE MODAL (Instant Buy)                     */}
      {/* ========================================================= */}
      {buyModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 text-xs font-semibold text-slate-700 animate-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setBuyModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 pb-3 mb-5">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                <span>Confirm Purchase & Delivery Details</span>
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Placing official institutional order for {selectedProduct.name}
              </p>
            </div>

            <form onSubmit={handlePlaceOrderSubmit} className="space-y-5">
              {/* Order Summary Pill */}
              <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{selectedProduct.name}</div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {orderQty} pcs • Color: {selectedColor} • Size: {selectedSize}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-bold">Total with GST</div>
                  <div className="text-base font-black text-blue-700">
                    ₹{(parseFloat(String(selectedProduct.sell_price)) * orderQty * 1.18).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <div className="text-slate-800 font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Contact & Recipient</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-600 font-bold">
                      Recipient / Contact Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={orderContactName}
                      onChange={(e) => setOrderContactName(e.target.value)}
                      placeholder="e.g. Principal / Store Incharge"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-bold bg-white focus:border-blue-500 text-xs"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-slate-600 font-bold">
                      Mobile Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden focus-within:border-blue-500">
                      <span className="bg-slate-50 px-3 py-2 text-slate-400 border-r border-slate-200 font-bold text-xs">
                        +91
                      </span>
                      <input
                        type="text"
                        value={orderContactMobile}
                        onChange={(e) => setOrderContactMobile(e.target.value)}
                        placeholder="10-digit number"
                        className="flex-1 px-3 py-2 outline-none font-bold text-xs"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-slate-600 font-bold">
                    Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={orderAddress}
                    onChange={(e) => setOrderAddress(e.target.value)}
                    placeholder="Enter complete school campus address for dispatch..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-bold bg-white h-16 resize-none focus:border-blue-500 text-xs"
                    required
                  />
                </div>
              </div>

              {/* Payment Preference */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="text-slate-800 font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Payment Option</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOrderPaymentMode('pay_now')}
                    className={`p-3 border rounded-2xl text-left transition-all cursor-pointer ${
                      orderPaymentMode === 'pay_now'
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-2 ring-blue-500/20'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="font-black text-slate-900 text-xs">Pay Online Now</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Generates immediate confirmed order</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderPaymentMode('invoice_later')}
                    className={`p-3 border rounded-2xl text-left transition-all cursor-pointer ${
                      orderPaymentMode === 'invoice_later'
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-2 ring-blue-500/20'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="font-black text-slate-900 text-xs">Generate Invoice First</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Pay after PO verification</div>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
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
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black shadow-md cursor-pointer transition-colors flex items-center gap-2 disabled:opacity-50"
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
