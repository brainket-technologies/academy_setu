'use client'

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import { 
  Search, FileText, Loader2, ChevronLeft, ChevronRight, Eye, X, Check, AlertCircle 
} from 'lucide-react'
import { toast } from 'sonner'

interface Screenshot {
  amount: number
  filename: string
  transaction_id?: string
  isLegacy?: boolean
  dataUrl?: string
}

interface RequestItem {
  id: string
  school_name: string
  plan_name: string
  payment_mode: string
  transaction_id: string
  amount: number
  transaction_amount: number
  status: string
  screenshots: Screenshot[] | string
  created_at: string
  screenshot_url?: string
  payment_screenshot?: string
  screenshot?: string
}

const formatDateOnly = (dateStr: string | null) => {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return dateStr
  }
}

// Helper to get formatted start/end dates
const getPlanDates = (createdAtStr: string) => {
  const from = new Date(createdAtStr)
  const to = new Date(createdAtStr)
  to.setDate(from.getDate() + 365) // 1 year validity

  const pad = (n: number) => String(n).padStart(2, '0')
  const format = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`

  return {
    validFrom: format(from),
    validTo: format(to)
  }
}

function RequestDashboardContent() {
  const [requests, setRequests] = useState<RequestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Search & Filter
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // View / Moderation State
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null)
  const [transactionAmountInput, setTransactionAmountInput] = useState('')
  const [statusInput, setStatusInput] = useState('Pending')
  const [submitting, setSubmitting] = useState(false)

  // Screenshot viewer modal
  const [viewingScreenshot, setViewingScreenshot] = useState<Screenshot | null>(null)

  // Fetch requests from API
  const fetchRequests = useCallback(async (page = 1, search = '', status = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize)
      })
      if (search) params.append('search', search)
      if (status) params.append('status', status)

      const res = await fetch(`/api/admin/request?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setRequests(data.data)
        setTotalCount(data.meta.totalCount)
        setTotalPages(data.meta.totalPages)
        setCurrentPage(data.meta.page)
      } else {
        toast.error('Failed to load verification requests')
      }
    } catch {
      toast.error('Something went wrong loading requests')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRequests(1, searchText, statusFilter)
  }, [fetchRequests, statusFilter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchRequests(1, searchText, statusFilter)
  }

  const handleSelectRequest = (req: RequestItem) => {
    setSelectedRequest(req)
    setTransactionAmountInput(String(req.amount || req.transaction_amount || 0))
    setStatusInput(req.status || 'Pending')
  }

  const handleModerationSubmit = async (statusToSet?: string, e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!selectedRequest) return

    const targetStatus = statusToSet || statusInput
    setStatusInput(targetStatus)
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/request/${selectedRequest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: targetStatus,
          transaction_amount: parseFloat(transactionAmountInput || '0')
        })
      })

      const data = await res.json()
      if (data.success) {
        toast.success(`Request status updated to ${targetStatus}`)
        setSelectedRequest(null)
        fetchRequests(currentPage, searchText, statusFilter)
      } else {
        toast.error(data.error || 'Failed to update request status')
      }
    } catch {
      toast.error('Something went wrong saving request details')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDownloadPDF = (req: RequestItem) => {
    toast.success(`Preparing invoice for ${req.school_name}...`)

    const amountNum = Number(req.amount) || 0
    const invoiceNum = `INV-${new Date(req.created_at || new Date()).getFullYear()}-${(req.transaction_id ? req.transaction_id.replace(/[^a-zA-Z0-9]/g, '').slice(-4) : 'REQ1').toUpperCase()}`
    const formattedDate = new Date(req.created_at || new Date()).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })

    const invoiceHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice - ${req.school_name}</title>
        <style>
          @page { size: A4 portrait; margin: 8mm; }
          * { box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; background: #f1f5f9; margin: 0; padding: 15px; }
          .invoice-card { 
            max-width: 820px; 
            margin: 0 auto; 
            background: #ffffff; 
            padding: 30px 34px; 
            border: 2px solid #0f172a; 
            border-radius: 10px; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.06); 
            min-height: 268mm; 
            display: flex; 
            flex-direction: column; 
            box-sizing: border-box;
          }
          
          /* Top Header */
          .header-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 22px; }
          .logo-box { width: 140px; height: 70px; border: 1.5px dashed #94a3b8; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #475569; font-size: 12px; font-weight: 800; background: #f8fafc; margin-bottom: 12px; }
          .from-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 12px; background: #f8fafc; font-size: 12px; }
          .from-title { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 3px; display: block; }
          .from-name { font-weight: 800; color: #0f172a; font-size: 13px; }
          .from-sub { color: #64748b; font-size: 11px; margin-top: 2px; line-height: 1.35; }
          
          .invoice-right { display: flex; flex-direction: column; align-items: flex-end; }
          .invoice-title { font-size: 34px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; margin: 0 0 10px 0; text-transform: uppercase; }
          .inv-num-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
          .inv-num-label { font-size: 14px; font-weight: 800; color: #64748b; }
          .inv-num-val { border: 1.5px solid #0f172a; border-radius: 6px; padding: 5px 12px; font-size: 12px; font-weight: 800; color: #0f172a; background: #f8fafc; font-family: monospace; }
          
          .meta-grid { display: grid; grid-template-columns: 105px 140px; gap: 6px; font-size: 11px; }
          .meta-lbl { color: #64748b; font-weight: 700; text-align: right; padding-top: 4px; }
          .meta-box { border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-weight: 700; color: #0f172a; background: #fff; }
          
          /* Bill To / Ship To */
          .address-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
          .addr-col { display: flex; flex-direction: column; gap: 4px; }
          .addr-lbl { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; }
          .addr-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 12px; min-height: 70px; background: #fff; }
          .addr-school { font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 3px; }
          .addr-text { font-size: 11px; color: #64748b; line-height: 1.35; }

          /* Line Items Table */
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border-radius: 8px; overflow: hidden; border: 1px solid #0f172a; }
          .items-table thead tr { background: #0f172a; color: #ffffff; }
          .items-table th { padding: 9px 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; border: none; }
          .items-table tbody tr { background: #ffffff; }
          .items-table tbody tr:nth-child(even) { background: #f8fafc; }
          
          /* Bottom Split */
          .bottom-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; margin-top: auto; }
          .section-lbl { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 4px; display: block; }
          .notes-box, .terms-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px 10px; font-size: 11px; color: #64748b; background: #f8fafc; margin-bottom: 10px; line-height: 1.35; }
          .pay-proof { border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px 10px; font-size: 11px; background: #f8fafc; margin-bottom: 10px; }
          .pay-proof strong { color: #0f172a; }

          /* Summary Calculations */
          .summary-card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 14px; background: #f8fafc; display: flex; flex-direction: column; gap: 6px; font-size: 12px; }
          .sum-row { display: flex; justify-content: space-between; align-items: center; color: #475569; }
          .sum-val { font-weight: 700; color: #0f172a; }
          .sum-divider { height: 1px; background: #cbd5e1; margin: 3px 0; }
          .total-row { font-size: 15px; font-weight: 900; color: #0f172a; }

          @media print {
            body { padding: 0; background: #fff; margin: 0; }
            .invoice-card { 
              box-shadow: none; 
              border: 2px solid #0f172a !important; 
              border-radius: 8px; 
              padding: 20px 24px; 
              width: 100%; 
              max-width: 100%; 
              min-height: 268mm; 
              height: 268mm;
              margin: 0;
              box-sizing: border-box;
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact; 
            }
            .items-table thead tr { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #0f172a !important; color: #fff !important; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-card">
          
          <!-- Header -->
          <div class="header-grid">
            <div>
              <div class="logo-box">
                <div style="font-size: 20px; margin-bottom: 2px;">🎓</div>
                <span>ACADEMY SETU</span>
              </div>
              <div class="from-box">
                <span class="from-title">Who is this from?</span>
                <div class="from-name">Academy Setu Technologies Pvt. Ltd.</div>
                <div class="from-sub">
                  Educational ERP &amp; Cloud Platform Solutions<br>
                  Email: support@academysetu.com | Ph: +91 98765 43210<br>
                  GSTIN: 07AAAAA0000A1Z5
                </div>
              </div>
            </div>

            <div class="invoice-right">
              <h1 class="invoice-title">INVOICE</h1>
              <div class="inv-num-row">
                <span class="inv-num-label">#</span>
                <div class="inv-num-val">${invoiceNum}</div>
              </div>

              <div class="meta-grid">
                <span class="meta-lbl">Date</span>
                <div class="meta-box">${formattedDate}</div>
                <span class="meta-lbl">Payment Terms</span>
                <div class="meta-box">Due on Receipt</div>
                <span class="meta-lbl">Due Date</span>
                <div class="meta-box">${formattedDate}</div>
                <span class="meta-lbl">PO Number</span>
                <div class="meta-box">PO-${new Date().getFullYear()}</div>
              </div>
            </div>
          </div>

          <!-- Bill To & Ship To -->
          <div class="address-grid">
            <div class="addr-col">
              <span class="addr-lbl">Bill To</span>
              <div class="addr-box">
                <div class="addr-school">${req.school_name}</div>
                <div class="addr-text">
                  Campus Software Provisioning &amp; License Subscription
                </div>
              </div>
            </div>
            
            <div class="addr-col">
              <span class="addr-lbl">Ship To <span style="font-weight: 400; color: #94a3b8;">(optional)</span></span>
              <div class="addr-box">
                <div class="addr-school">${req.school_name}</div>
                <div class="addr-text">
                  Main Institutional Campus
                </div>
              </div>
            </div>
          </div>

          <!-- Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th style="text-align: left; width: 55%;">Plan Name</th>
                <th style="text-align: center; width: 15%;">Quantity</th>
                <th style="text-align: right; width: 15%;">Rate</th>
                <th style="text-align: right; width: 15%;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 14px; border-bottom: 1px solid #e2e8f0;">
                  <strong style="color: #0f172a; font-size: 14px;">${req.plan_name || 'CRM Subscription Plan'}</strong>
                  <div style="font-size: 11px; color: #64748b; margin-top: 3px;">
                    Academy Setu ERP &amp; Cloud Management Software License
                  </div>
                </td>
                <td style="padding: 14px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #334155; font-size: 13px;">1</td>
                <td style="padding: 14px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #334155; font-size: 13px;">₹${amountNum.toFixed(2)}</td>
                <td style="padding: 14px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 700; color: #0f172a; font-size: 13px;">₹${amountNum.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <!-- Bottom Row -->
          <div class="bottom-grid">
            <div>
              <div class="pay-proof">
                <span class="section-lbl">Payment Details</span>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                  <div>
                    <div><strong>Mode:</strong> ${req.payment_mode || 'Bank Transfer'}</div>
                    <div style="font-family: monospace; font-size: 11px; margin-top: 2px;"><strong>Txn / UTR:</strong> ${req.transaction_id || 'N/A'}</div>
                  </div>
                  <span class="paid-badge">✓ ${req.status || 'PAID'}</span>
                </div>
              </div>

              <span class="section-lbl">Notes</span>
              <div class="notes-box">
                Thank you for partnering with Academy Setu CRM. All software licenses and features are provisioned for your institute.
              </div>

              <span class="section-lbl">Terms</span>
              <div class="terms-box">
                Terms and conditions - 1. All payments are non-refundable. 2. Subscription access is granted for the contracted term. 3. System-generated electronic tax invoice.
              </div>
            </div>

            <div class="summary-card">
              <div class="sum-row">
                <span>Subtotal</span>
                <span class="sum-val">₹${amountNum.toFixed(2)}</span>
              </div>
              <div class="sum-row">
                <span>Tax / GST</span>
                <span class="sum-val">₹0.00</span>
              </div>
              <div class="sum-row" style="color: #059669;">
                <span>+ Discount</span>
                <span class="sum-val" style="color: #059669;">₹0.00</span>
              </div>
              <div class="sum-divider"></div>
              <div class="sum-row total-row">
                <span>Total</span>
                <span class="sum-val" style="font-size: 16px;">₹${amountNum.toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>

        <script>
          window.onload = () => {
            window.print();
            setTimeout(() => window.close(), 250);
          }
        </script>
      </body>
      </html>
    `;

    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }

  const startEntry = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endEntry = Math.min(currentPage * pageSize, totalCount)

  const getPageNumbers = () => {
    const pages: number[] = []
    const maxVisible = 5
    let start = Math.max(1, currentPage - 2)
    const end = Math.min(totalPages, start + maxVisible - 1)
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* ================= HEADER CARD ================= */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl px-8 py-5 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Request</h1>
      </div>

      {/* ================= LIST VIEW LOG ================= */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Search By School Name, Trans. ID"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-semibold"
              >
                <option value="">All Status</option>
                <option value="Accept">Accept</option>
                <option value="Reject">Reject</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Table list log */}
          <div className="overflow-x-auto border border-slate-100 dark:border-slate-700 rounded-2xl">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#EBF6F6]/50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">S.No.</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">School Name</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Plan Name</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Payment Mode</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Trans. ID</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Amount</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Status</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 text-center">Bill</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                        Loading requests...
                      </div>
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                      No verification requests found.
                    </td>
                  </tr>
                ) : (
                  requests.map((req, idx) => {
                    const sNo = (currentPage - 1) * pageSize + idx + 1
                    const isAccept = req.status === 'Accept'
                    return (
                      <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-5 py-4 font-medium text-slate-500 dark:text-slate-400">{sNo}.</td>
                        <td className="px-5 py-4 font-semibold">{req.school_name}</td>
                        <td className="px-5 py-4">{req.plan_name}</td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-650">
                            {req.payment_mode}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-mono text-xs">{req.transaction_id || '—'}</td>
                        <td className="px-5 py-4 font-semibold">₹{Number(req.amount).toFixed(2)}</td>
                        <td className="px-5 py-4">
                          {req.status === 'Accept' ? (
                            <span className="bg-[#DCFCE7] dark:bg-green-950/20 text-[#15803D] dark:text-green-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-green-200 dark:border-green-900/30 flex items-center gap-1.5 shrink-0 shadow-sm w-fit">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                              Accept
                            </span>
                          ) : req.status === 'Reject' ? (
                            <span className="bg-[#FEE2E2] dark:bg-red-950/20 text-[#B91C1C] dark:text-red-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-red-200 dark:border-red-900/30 flex items-center gap-1.5 shrink-0 shadow-sm w-fit">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                              Reject
                            </span>
                          ) : (
                            <span className="bg-[#FEF9C3] dark:bg-yellow-950/20 text-[#A16207] dark:text-yellow-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-yellow-250 dark:border-yellow-900/30 flex items-center gap-1.5 shrink-0 shadow-sm w-fit">
                              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-center">
                          {isAccept ? (
                            <button
                              onClick={() => handleDownloadPDF(req)}
                              className="w-8 h-8 inline-flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors cursor-pointer border border-indigo-100 dark:border-indigo-900/40 shadow-sm"
                              title="Download Receipt (PDF)"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-slate-350 dark:text-slate-600">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => handleSelectRequest(req)}
                              className="w-7 h-7 flex items-center justify-center bg-[#EBF6F6] dark:bg-slate-700 hover:bg-indigo-150 dark:hover:bg-slate-650 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors cursor-pointer"
                              title="View Request Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Log */}
          {totalCount > 0 && (
            <div className="flex items-center justify-between flex-wrap gap-4 mt-2">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Showing {startEntry}-{endEntry} of {totalCount} Entries
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => fetchRequests(1, searchText, statusFilter)}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:text-slate-300 dark:disabled:text-slate-600 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  {'<<'}
                </button>
                <button
                  disabled={currentPage === 1}
                  onClick={() => fetchRequests(currentPage - 1, searchText, statusFilter)}
                  className="p-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:text-slate-300 dark:disabled:text-slate-600 rounded-lg bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {getPageNumbers().map((pg) => (
                  <button
                    key={pg}
                    onClick={() => fetchRequests(pg, searchText, statusFilter)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      pg === currentPage
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                        : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-700'
                    }`}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => fetchRequests(currentPage + 1, searchText, statusFilter)}
                  className="p-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:text-slate-300 dark:disabled:text-slate-600 rounded-lg bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => fetchRequests(totalPages, searchText, statusFilter)}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:text-slate-300 dark:disabled:text-slate-600 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  {'>>'}
                </button>
              </div>
            </div>
          )}
        </div>

      {/* ================= VERIFICATION ACTION MODAL ================= */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-2xl max-w-3xl w-full p-6 sm:p-8 relative my-8 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col gap-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-700 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Check className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Verify Request</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => handleModerationSubmit(undefined, e)} className="flex flex-col gap-6">
              
              {/* School Name input */}
              <div className="flex flex-col gap-1.5 max-w-md">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  School/College Name
                </label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={selectedRequest.school_name}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-500 dark:text-slate-400 focus:outline-none select-none font-semibold"
                />
              </div>

              {/* Plan Details Table */}
              <div className="flex flex-col gap-2">
                <div className="border-b border-slate-150 dark:border-slate-700 pb-1.5">
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Plan Details</h3>
                </div>
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-2xl">
                  <table className="w-full border-collapse text-left text-xs bg-slate-50/20 dark:bg-slate-900/10">
                    <thead className="bg-[#EBF6F6]/50 dark:bg-slate-700/50">
                      <tr>
                        <th className="px-5 py-3.5 font-bold text-slate-700 dark:text-slate-300">Plan Name</th>
                        <th className="px-5 py-3.5 font-bold text-slate-700 dark:text-slate-300">Plan Valid From</th>
                        <th className="px-5 py-3.5 font-bold text-slate-700 dark:text-slate-300">Plan Valid To</th>
                        <th className="px-5 py-3.5 font-bold text-slate-700 dark:text-slate-300 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700/80 text-slate-700 dark:text-slate-300 font-semibold">
                      <tr>
                        <td className="px-5 py-4 font-bold">{selectedRequest.plan_name}</td>
                        <td className="px-5 py-4 font-semibold">{getPlanDates(selectedRequest.created_at).validFrom}</td>
                        <td className="px-5 py-4 font-semibold">{getPlanDates(selectedRequest.created_at).validTo}</td>
                        <td className="px-5 py-4 text-right font-extrabold text-slate-900 dark:text-white">
                          ₹{Number(selectedRequest.amount).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Screenshot attachments card grid */}
              <div className="flex flex-col gap-4 border-t border-slate-100 dark:border-slate-700/80 pt-5">
                <div className="border-b border-slate-150 dark:border-slate-700 pb-1.5">
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Screenshot & Payment Proof</h3>
                </div>

                {/* Paid Amount */}
                <div className="flex flex-col gap-1.5 max-w-xs">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Paid Amount</label>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={`₹${Number(selectedRequest.amount).toLocaleString('en-IN')}/-`}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-slate-200 font-bold select-none"
                  />
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
                  {(() => {
                    let screens = selectedRequest.screenshots;
                    if (typeof screens === 'string') {
                      try { screens = JSON.parse(screens); } catch { screens = []; }
                    }
                    const fallbackImg = selectedRequest?.screenshot_url || selectedRequest?.payment_screenshot || selectedRequest?.screenshot || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80";

                    if (!Array.isArray(screens) || screens.length === 0) {
                      screens = [{ 
                        amount: selectedRequest.amount, 
                        filename: selectedRequest.transaction_id || 'Payment Receipt Screenshot', 
                        dataUrl: fallbackImg,
                        isLegacy: false 
                      }];
                    }
                    
                    return screens.map((s: any, idx: number) => {
                      const imgUrl = s.dataUrl || s.url || s.screenshot_url || fallbackImg;
                      return (
                        <div
                          key={idx}
                          className="border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-sm bg-white dark:bg-slate-900 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            {/* Thumbnail Image Preview */}
                            <div 
                              onClick={() => setViewingScreenshot({ ...s, dataUrl: imgUrl })}
                              className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 cursor-pointer relative group"
                              title="Click to view full screenshot"
                            >
                              <img 
                                src={imgUrl} 
                                alt="Screenshot Preview" 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                              />
                              <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Eye className="w-4 h-4 text-white" />
                              </div>
                            </div>

                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                Amount: ₹{Number(s.amount || selectedRequest.amount).toLocaleString('en-IN')}/-
                              </span>
                              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block truncate" title={s.filename || selectedRequest.transaction_id}>
                                {s.filename || selectedRequest.transaction_id || 'Attached Proof'}
                              </span>
                              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded w-fit">
                                Payment Screenshot
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setViewingScreenshot({ ...s, dataUrl: imgUrl })}
                            className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-xl flex items-center gap-1 border border-indigo-100 dark:border-indigo-800/50 transition-colors cursor-pointer shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                        </div>
                      )
                    })
                  })()}
                </div>

                {/* Interactive Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Enter Transaction Amount
                    </label>
                    <input
                      type="number"
                      value={transactionAmountInput}
                      onChange={e => setTransactionAmountInput(e.target.value)}
                      placeholder="Enter Amount"
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-100 font-semibold"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* BOTTOM BUTTONS */}
              <div className="flex justify-end gap-3 mt-4 border-t border-slate-100 dark:border-slate-700 pt-5">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleModerationSubmit('Reject')}
                  disabled={submitting}
                  className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-rose-500/20 cursor-pointer min-w-[110px] flex items-center justify-center gap-1.5"
                >
                  {submitting && statusInput === 'Reject' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <X className="w-4 h-4" /> Reject
                </button>
                <button
                  type="button"
                  onClick={() => handleModerationSubmit('Accept')}
                  disabled={submitting}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-emerald-500/20 cursor-pointer min-w-[110px] flex items-center justify-center gap-1.5"
                >
                  {submitting && statusInput === 'Accept' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <Check className="w-4 h-4" /> Accept
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= SCREENSHOT VIEWER MODAL ================= */}
      {viewingScreenshot && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setViewingScreenshot(null)}
              className="absolute top-6 right-6 p-1.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3 mb-4 flex items-center gap-1.5">
              <Check className="w-5 h-5 text-emerald-600" />
              Payment Attachment
            </h3>
            
            {/* Image Viewer Simulation Card */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-inner flex flex-col relative min-h-[350px]">
              {/* Overlay info */}
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-mono z-10 flex flex-col">
                <span className="font-bold text-[10px] text-white/70 uppercase">File</span>
                <span>{viewingScreenshot.filename}</span>
              </div>
              <div className="absolute top-3 right-3 bg-emerald-500/90 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-bold z-10 flex items-center gap-1.5 shadow-sm">
                <Check className="w-3.5 h-3.5" />
                ₹{viewingScreenshot.amount.toLocaleString('en-IN')}
              </div>
              
              {/* The "Photo" */}
              {viewingScreenshot.dataUrl && viewingScreenshot.dataUrl.startsWith('data:application/pdf') ? (
                <iframe src={viewingScreenshot.dataUrl} className="w-full h-[350px] rounded-b-2xl bg-white" />
              ) : (
                <img 
                  src={viewingScreenshot.dataUrl || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80"} 
                  alt="Receipt Document" 
                  className="w-full h-[350px] object-cover opacity-90 hover:opacity-100 transition-opacity"
                />
              )}
            </div>

            <button
              onClick={() => setViewingScreenshot(null)}
              className="w-full mt-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function RequestDashboardPage() {
  return (
    <>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      }>
        <RequestDashboardContent />
      </Suspense>
    </>
  )
}
