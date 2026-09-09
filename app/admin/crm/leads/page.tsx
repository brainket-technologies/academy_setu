'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Search, Edit3, Trash2, Calendar, Clock, Loader2, 
  ChevronLeft, ChevronRight, Share2, Upload, AlertCircle, Users, Activity, X,
  Download, FileUp, Save, Check
} from 'lucide-react'
import { toast } from 'sonner'
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal'


const SOURCE_OPTIONS = ['Offline Meeting', 'YouTube', 'Facebook', 'Other']

interface Lead {
  id: string
  lead_source: string
  mobile_no: string
  email_id: string
  contact_person: string
  school_name: string
  state: string
  district: string
  no_of_students: number
  status: string
  assigned_to?: string
  assigned_user_name?: string
  assigned_user_role?: string
  created_at: string
  updated_at: string
  latest_remarks?: string
  latest_follow_up?: string
}

interface LeadHistory {
  id: string
  lead_id: string
  communication_option: 'Call' | 'Message'
  call_duration: string
  remarks: string
  follow_up_date: string | null
  status: string
  status_name?: string
  created_at: string
}

interface LeadStatus {
  id: string
  name: string
  text_color: string
  bg_color: string
  show_on_bdm: boolean
}

export default function AllLeadsPage() {
  const [view, setView] = useState<'list' | 'edit'>('list')
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [statuses, setStatuses] = useState<LeadStatus[]>([])
  const [assignableUsers, setAssignableUsers] = useState<any[]>([])

  // Add/Edit Lead Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false)
  const [addEditSubmitting, setAddEditSubmitting] = useState(false)
  const [addEditId, setAddEditId] = useState<string | null>(null)

  // Add/Edit Lead Form states
  const [leadSource, setLeadSource] = useState('')
  const [mobileNo, setMobileNo] = useState('')
  const [emailId, setEmailId] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [stateName, setStateName] = useState('')
  const [district, setDistrict] = useState('')
  const [noOfStudents, setNoOfStudents] = useState('')
  const [baseStatus, setBaseStatus] = useState('Created')
  const [baseFollowUpDate, setBaseFollowUpDate] = useState('') // previous/existing follow-up date (read-only in edit)
  const [newEditFollowUpDate, setNewEditFollowUpDate] = useState('') // new date input in edit mode

  // Dynamic State & District states
  const [statesData, setStatesData] = useState<any[]>([])
  const [districtsList, setDistrictsList] = useState<any[]>([])

  // Bulk Assignment States
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [selectedAssignee, setSelectedAssignee] = useState('')
  const [isAssigning, setIsAssigning] = useState(false)

  // Search & Filter
  const [searchText, setSearchText] = useState('')
  const [filterSource, setFilterSource] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterAssignedTo, setFilterAssignedTo] = useState('')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 10

  // Delete lead states
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // --- Inline EDIT lead states ---
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [leadHistory, setLeadHistory] = useState<LeadHistory[]>([])
  const [loadingDetails, setLoadingDetails] = useState(false)

  // Edit Lead Form states
  const [communicationOption, setCommunicationOption] = useState<'Call' | 'Message'>('Call')
  const [callDuration, setCallDuration] = useState('')
  const [remarks, setRemarks] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')
  const [editStatus, setEditStatus] = useState('')
  const [submittingUpdate, setSubmittingUpdate] = useState(false)

  // Modal-specific history (for Edit Lead modal)
  const [modalLeadHistory, setModalLeadHistory] = useState<LeadHistory[]>([])
  const [modalHistoryLoading, setModalHistoryLoading] = useState(false)

  // Inline editable Lead Details states
  const [inlineLeadSource, setInlineLeadSource] = useState('')
  const [inlineSchoolName, setInlineSchoolName] = useState('')
  const [inlineMobileNo, setInlineMobileNo] = useState('')
  const [inlineContactPerson, setInlineContactPerson] = useState('')
  const [inlineEmailId, setInlineEmailId] = useState('')
  const [inlineStateName, setInlineStateName] = useState('')
  const [inlineDistrict, setInlineDistrict] = useState('')
  const [inlineNoOfStudents, setInlineNoOfStudents] = useState('')
  const [savingLeadDetails, setSavingLeadDetails] = useState(false)

  // Import/Export states
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importLoading, setImportLoading] = useState(false)

  // Lead Logs popup modal
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false)
  const [logsModalLead, setLogsModalLead] = useState<Lead | null>(null)
  const [logsModalHistory, setLogsModalHistory] = useState<LeadHistory[]>([])
  const [logsModalLoading, setLogsModalLoading] = useState(false)

  const fetchLeads = useCallback(async (page = 1, search = '', source = '', status = '', assignedTo = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize)
      })
      if (search) params.append('search', search)
      if (source) params.append('source', source)
      if (status) params.append('status', status)
      if (assignedTo) params.append('assigned_to', assignedTo)

      const res = await fetch(`/api/admin/crm/leads?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setLeads(data.data)
        setTotalCount(data.meta.totalCount)
        setTotalPages(data.meta.totalPages)
        setCurrentPage(data.meta.page)
      } else {
        toast.error(data.error || 'Failed to load leads')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error occurred loading leads')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchStatuses = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/crm/status')
      const data = await res.json()
      if (data.success) {
        setStatuses(data.data)
      }
    } catch {
      console.error('Failed to load statuses')
    }
  }, [])

  const fetchAssignableUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users/assignable')
      const data = await res.json()
      if (data.success) {
        setAssignableUsers(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch assignable users', err)
    }
  }, [])

  const fetchStates = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings/state-city')
      const data = await res.json()
      if (data.success) {
        setStatesData(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch states', err)
    }
  }, [])

  useEffect(() => {
    fetchLeads(1, searchText, filterSource, filterStatus, filterAssignedTo)
    fetchStatuses()
    fetchAssignableUsers()
    fetchStates()
  }, [fetchLeads, fetchStatuses, fetchAssignableUsers, fetchStates])

  // Update districts when state changes
  useEffect(() => {
    const selectedState = statesData.find(s => (s.state_name || s.name) === stateName)
    if (selectedState) {
      const rawDistricts = selectedState.districts || []
      setDistrictsList(rawDistricts)
    } else {
      setDistrictsList([])
    }
  }, [stateName, statesData])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchLeads(1, searchText, filterSource, filterStatus, filterAssignedTo)
  }

  // Handle staff assignment inline update
  const handleAssignStaff = async (leadId: string, staffId: string) => {
    try {
      const res = await fetch(`/api/admin/crm/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigned_to: staffId })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Assigned lead successfully`)
        // Refresh leads to get updated name/role
        fetchLeads(currentPage, searchText, filterSource, filterStatus, filterAssignedTo)
      } else {
        toast.error(data.error || 'Failed to assign staff')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error assigning staff')
    }
  }

  const handleBulkAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedLeads.length === 0) {
      toast.error('No leads selected')
      return
    }

    setIsAssigning(true)
    try {
      const res = await fetch('/api/admin/crm/leads/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_ids: selectedLeads,
          assigned_to: selectedAssignee || null
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(data.message)
        setIsAssignModalOpen(false)
        setSelectedLeads([])
        setSelectedAssignee('')
        fetchLeads(currentPage, searchText, filterSource, filterStatus, filterAssignedTo)
      } else {
        toast.error(data.error || 'Failed to assign leads')
      }
    } catch (err) {
      console.error('Assign error:', err)
      toast.error('Error during assignment')
    } finally {
      setIsAssigning(false)
    }
  }

  const resetAddEditModal = () => {
    setAddEditId(null)
    setLeadSource('')
    setMobileNo('')
    setEmailId('')
    setContactPerson('')
    setSchoolName('')
    setStateName('')
    setDistrict('')
    setNoOfStudents('')
    setBaseStatus('Created')
    setBaseFollowUpDate('')
    setNewEditFollowUpDate('')
    setModalLeadHistory([])
    setModalHistoryLoading(false)
    setIsAddEditModalOpen(false)
  }

  const handleOpenAddModal = () => {
    resetAddEditModal()
    setIsAddEditModalOpen(true)
  }

  const handleOpenEditBaseModal = async (lead: Lead) => {
    setAddEditId(lead.id)
    setLeadSource(lead.lead_source)
    setMobileNo(lead.mobile_no)
    setEmailId(lead.email_id || '')
    setContactPerson(lead.contact_person || '')
    setSchoolName(lead.school_name)
    setStateName(lead.state)
    setDistrict(lead.district)
    setNoOfStudents(lead.no_of_students?.toString() || '')
    setBaseStatus(lead.status)
    setBaseFollowUpDate(lead.latest_follow_up ? lead.latest_follow_up.split('T')[0] : '')
    setIsAddEditModalOpen(true)

    // Fetch history for this lead to show in modal
    setModalHistoryLoading(true)
    try {
      const res = await fetch(`/api/admin/crm/leads/${lead.id}`)
      const data = await res.json()
      if (data.success) {
        setModalLeadHistory(data.data.history || [])
      }
    } catch {
      // silently fail
    } finally {
      setModalHistoryLoading(false)
    }
  }

  // Helper to determine if a status requires follow-up (checks if show_on_bdm is true)
  const requiresFollowUp = (statusName: string) => {
    if (!statusName) return false
    const matched = statuses.find(s => s.name.toLowerCase() === statusName.toLowerCase())
    return matched ? Boolean(matched.show_on_bdm) : false
  }

  const handleAddEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanMobile = mobileNo.trim().replace(/\D/g, '')
    if (!leadSource || !cleanMobile || !schoolName.trim() || !baseStatus) {
      toast.error('Please fill required fields (Source, Mobile, School, Status)')
      return
    }

    if (cleanMobile.length !== 10) {
      toast.error('Mobile Number must be exactly 10 digits')
      return
    }

    if (requiresFollowUp(baseStatus)) {
      const dateToUse = addEditId ? newEditFollowUpDate : baseFollowUpDate
      if (!dateToUse) {
        toast.error('Next Follow Up Date is required for this status')
        return
      }
    }

    setAddEditSubmitting(true)
    try {
      const url = addEditId ? `/api/admin/crm/leads/${addEditId}` : '/api/admin/crm/leads'
      const method = addEditId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_source: leadSource,
          mobile_no: mobileNo.trim(),
          email_id: emailId.trim(),
          contact_person: contactPerson.trim(),
          school_name: schoolName.trim(),
          state: stateName,
          district,
          no_of_students: parseInt(noOfStudents || '0'),
          status: baseStatus,
          follow_up_date: addEditId ? newEditFollowUpDate : baseFollowUpDate
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(addEditId ? 'Lead updated successfully!' : 'Lead created successfully!')
        resetAddEditModal()
        fetchLeads(currentPage, searchText, filterSource, filterStatus, filterAssignedTo)
      } else {
        toast.error(data.error || `Failed to ${addEditId ? 'update' : 'create'} lead`)
      }
    } catch {
      toast.error('Something went wrong saving lead')
    } finally {
      setAddEditSubmitting(false)
    }
  }

  // Switch to Edit View (inline page — no modal)
  const handleStartEdit = async (lead: Lead) => {
    setView('edit')
    setEditingLead(lead)
    setLoadingDetails(true)
    
    // Set form defaults
    setCommunicationOption('Call')
    setCallDuration('')
    setRemarks('')
    setFollowUpDate('')
    setEditStatus(lead.status)

    // Pre-fill inline editable fields
    setInlineLeadSource(lead.lead_source)
    setInlineSchoolName(lead.school_name)
    setInlineMobileNo(lead.mobile_no)
    setInlineContactPerson(lead.contact_person || '')
    setInlineEmailId(lead.email_id || '')
    setInlineStateName(lead.state || '')
    setInlineDistrict(lead.district || '')
    setInlineNoOfStudents(lead.no_of_students?.toString() || '')

    try {
      const res = await fetch(`/api/admin/crm/leads/${lead.id}`)
      const data = await res.json()
      if (data.success) {
        setEditingLead(data.data)
        setLeadHistory(data.data.history || [])
      }
    } catch {
      toast.error('Failed to load lead timeline details')
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleCancelEdit = () => {
    setView('list')
    setEditingLead(null)
    setLeadHistory([])
    fetchLeads(currentPage, searchText, filterSource, filterStatus, filterAssignedTo)
  }

  // Open Lead Logs popup modal
  const handleOpenLogsModal = async (lead: Lead) => {
    setLogsModalLead(lead)
    setIsLogsModalOpen(true)
    setLogsModalLoading(true)
    setLogsModalHistory([])
    try {
      const res = await fetch(`/api/admin/crm/leads/${lead.id}`)
      const data = await res.json()
      if (data.success) {
        setLogsModalHistory(data.data.history || [])
      }
    } catch {
      toast.error('Failed to load lead logs')
    } finally {
      setLogsModalLoading(false)
    }
  }

  // Save editable lead details (inline Card 1)
  const handleSaveLeadDetails = async () => {
    if (!editingLead) return
    const clean = inlineMobileNo.trim().replace(/\D/g, '')
    if (clean.length !== 10) {
      toast.error('Mobile number must be exactly 10 digits')
      return
    }
    setSavingLeadDetails(true)
    try {
      const res = await fetch(`/api/admin/crm/leads/${editingLead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_source: inlineLeadSource,
          school_name: inlineSchoolName.trim(),
          mobile_no: clean,
          contact_person: inlineContactPerson.trim(),
          email_id: inlineEmailId.trim(),
          state: inlineStateName,
          district: inlineDistrict,
          no_of_students: parseInt(inlineNoOfStudents || '0'),
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Lead details updated!')
        setEditingLead(prev => prev ? {
          ...prev,
          lead_source: inlineLeadSource,
          school_name: inlineSchoolName.trim(),
          mobile_no: clean,
          contact_person: inlineContactPerson.trim(),
          email_id: inlineEmailId.trim(),
          state: inlineStateName,
          district: inlineDistrict,
          no_of_students: parseInt(inlineNoOfStudents || '0'),
        } : null)
        fetchLeads(currentPage, searchText, filterSource, filterStatus, filterAssignedTo)
      } else {
        toast.error(data.error || 'Failed to update lead details')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSavingLeadDetails(false)
    }
  }

  // Export leads to CSV
  const handleExportCSV = async () => {
    try {
      toast.loading('Preparing export...')
      const params = new URLSearchParams({ page: '1', pageSize: '10000' })
      if (filterSource) params.append('source', filterSource)
      if (filterStatus) params.append('status', filterStatus)
      if (filterAssignedTo) params.append('assigned_to', filterAssignedTo)
      if (searchText) params.append('search', searchText)
      const res = await fetch(`/api/admin/crm/leads?${params.toString()}`)
      const data = await res.json()
      toast.dismiss()
      if (!data.success) { toast.error('Export failed'); return }
      const rows: Lead[] = data.data
      const headers = ['S.No','Lead Source','School Name','Contact Person','Mobile No','Email','State','District','No of Students','Status','Assigned To','Latest Follow Up','Remarks','Created At']
      const csvRows = [headers.join(',')]
      rows.forEach((r, i) => {
        const cols = [
          i + 1,
          `"${r.lead_source || ''}"`   ,
          `"${r.school_name || ''}"`,
          `"${r.contact_person || ''}"`,
          r.mobile_no || '',
          `"${r.email_id || ''}"`,
          `"${r.state || ''}"`,
          `"${r.district || ''}"`,
          r.no_of_students || 0,
          `"${r.status || ''}"`,
          `"${(r as any).assigned_to_name || ''}"`,
          r.latest_follow_up ? new Date(r.latest_follow_up).toLocaleDateString('en-GB') : '',
          `"${(r as any).remarks || ''}"`,
          r.created_at ? new Date(r.created_at).toLocaleDateString('en-GB') : ''
        ]
        csvRows.push(cols.join(','))
      })
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`Exported ${rows.length} leads`)
    } catch {
      toast.dismiss()
      toast.error('Export failed')
    }
  }

  // Download CSV template for import
  const handleDownloadTemplate = () => {
    const headers = ['lead_source','school_name','contact_person','mobile_no','email_id','state','district','no_of_students','status']
    const example = ['Facebook','Example School','John Doe','9876543210','john@school.com','Maharashtra','Pune','500','NEW']
    const csv = [headers.join(','), example.join(',')].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'leads_import_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Import leads from CSV
  const handleImportCSV = async () => {
    if (!importFile) { toast.error('Please select a CSV file'); return }
    setImportLoading(true)
    try {
      const text = await importFile.text()
      const lines = text.trim().split('\n')
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      const leads = lines.slice(1).map(line => {
        const vals = line.split(',').map(v => v.trim().replace(/"/g, ''))
        const obj: any = {}
        headers.forEach((h, i) => { obj[h] = vals[i] || '' })
        return obj
      }).filter(r => r.school_name && r.mobile_no)

      let successCount = 0, errorCount = 0
      for (const lead of leads) {
        const res = await fetch('/api/admin/crm/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lead_source: lead.lead_source || 'Other',
            school_name: lead.school_name,
            contact_person: lead.contact_person || '',
            mobile_no: lead.mobile_no,
            email_id: lead.email_id || '',
            state: lead.state || '',
            district: lead.district || '',
            no_of_students: parseInt(lead.no_of_students || '0'),
            status: lead.status || 'NEW',
          })
        })
        const data = await res.json()
        if (data.success) successCount++
        else errorCount++
      }
      toast.success(`Import complete: ${successCount} added, ${errorCount} failed`)
      setIsImportModalOpen(false)
      setImportFile(null)
      fetchLeads(currentPage, searchText, filterSource, filterStatus, filterAssignedTo)
    } catch {
      toast.error('Import failed — check your CSV format')
    } finally {
      setImportLoading(false)
    }
  }

  // Submit follow-up event
  const handleUpdateFollowUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingLead) return
    if (!remarks.trim()) {
      toast.error('Remarks are required')
      return
    }
    if (!editStatus) {
      toast.error('Status is required')
      return
    }
    if (requiresFollowUp(editStatus) && !followUpDate) {
      toast.error('Follow Up Date is required for this status')
      return
    }

    setSubmittingUpdate(true)
    try {
      const res = await fetch(`/api/admin/crm/leads/${editingLead.id}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communication_option: communicationOption,
          call_duration: communicationOption === 'Call' ? callDuration : '',
          remarks: remarks.trim(),
          follow_up_date: followUpDate,
          status: editStatus
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Lead updated and logged successfully!')
        
        // Refresh details & history
        const detailRes = await fetch(`/api/admin/crm/leads/${editingLead.id}`)
        const detailData = await detailRes.json()
        if (detailData.success) {
          setEditingLead(detailData.data)
          setLeadHistory(detailData.data.history || [])
        }

        // Reset form
        setRemarks('')
        setCallDuration('')
        setFollowUpDate('')

        // Refresh leads list
        fetchLeads(currentPage, searchText, filterSource, filterStatus, filterAssignedTo)
      } else {
        toast.error(data.error || 'Failed to submit update')
      }
    } catch {
      toast.error('Something went wrong submitting follow-up')
    } finally {
      setSubmittingUpdate(false)
    }
  }

  // Delete
  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/admin/crm/leads/${deleteTargetId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Lead deleted successfully')
        fetchLeads(currentPage, searchText, filterSource, filterStatus, filterAssignedTo)
      } else {
        toast.error(data.error || 'Failed to delete lead')
      }
    } catch {
      toast.error('Error occurred deleting lead')
    } finally {
      setDeleteLoading(false)
      setDeleteTargetId(null)
    }
  }

  // Helper date parsing
  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
      const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      return { date, time }
    } catch {
      return { date: dateStr, time: '' }
    }
  }

  // Helper to draw status badge with colors
  const renderStatusBadge = (statusName: string | null | undefined) => {
    if (!statusName) return null
    const matched = statuses.find(s => s.name.toLowerCase() === statusName.toLowerCase())
    if (matched) {
      return (
        <span 
          className="px-3 py-1 rounded-full text-xs font-extrabold shadow-sm bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700 uppercase tracking-wider inline-block"
          style={{ color: matched.text_color }}
        >
          {statusName}
        </span>
      )
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 uppercase tracking-wider">
        {statusName}
      </span>
    )
  }

  // Pagination bounds
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
    <>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* Title Header Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl px-8 py-5 border border-slate-100 dark:border-slate-700 shadow-sm shrink-0 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-850 dark:text-slate-100 tracking-tight">
              {view === 'edit' ? 'Edit Lead Logs' : 'All Leads'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {view === 'edit' ? 'Update follow up timeline and lead logs' : 'Monitor sales pipelines, leads logs, and assignments'}
            </p>
          </div>
          {view === 'list' && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="px-4 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 cursor-pointer"
              >
                <FileUp className="w-4 h-4" />
                Import
              </button>
              <button
                onClick={handleExportCSV}
                className="px-4 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md transition-colors flex items-center gap-2 cursor-pointer"
              >
                Create Lead
              </button>
            </div>
          )}
        </div>

        {view === 'edit' && editingLead ? (
          /* Inline EDIT Lead Details View */
          <div className="flex flex-col gap-6">
            
            {/* Card 1: Lead Details (Editable) */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-700/50 pb-2">
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Lead Details
                </h3>
                <button
                  type="button"
                  onClick={handleSaveLeadDetails}
                  disabled={savingLeadDetails}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {savingLeadDetails ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  Save Details
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Lead Source</label>
                  <select
                    value={inlineLeadSource}
                    onChange={(e) => setInlineLeadSource(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                  >
                    {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">School Name</label>
                  <input
                    type="text"
                    value={inlineSchoolName}
                    onChange={(e) => setInlineSchoolName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Contact Person</label>
                  <input
                    type="text"
                    value={inlineContactPerson}
                    onChange={(e) => setInlineContactPerson(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Mobile No.</label>
                  <input
                    type="text"
                    value={inlineMobileNo}
                    onChange={(e) => setInlineMobileNo(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    maxLength={10}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Email Id</label>
                  <input
                    type="email"
                    value={inlineEmailId}
                    onChange={(e) => setInlineEmailId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">State</label>
                  <input
                    type="text"
                    value={inlineStateName}
                    onChange={(e) => setInlineStateName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">District</label>
                  <input
                    type="text"
                    value={inlineDistrict}
                    onChange={(e) => setInlineDistrict(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">No. of Students</label>
                  <input
                    type="number"
                    value={inlineNoOfStudents}
                    onChange={(e) => setInlineNoOfStudents(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Update Lead (Form) */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-5">
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-50 dark:border-slate-700/50 pb-2">
                Update Lead
              </h3>
              <form onSubmit={handleUpdateFollowUp} className="flex flex-col gap-5">
                {/* Communication Option Radio */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                    Communication Option<span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-6 mt-1.5">
                    {(['Call', 'Message'] as const).map(opt => (
                      <label key={opt} className="flex items-center gap-2 text-sm text-slate-750 dark:text-slate-300 font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="comm_option"
                          value={opt}
                          checked={communicationOption === opt}
                          onChange={() => setCommunicationOption(opt)}
                          className="text-[#0E9485] focus:ring-[#0E9485] w-4 h-4"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Conditional Call Duration Input */}
                {communicationOption === 'Call' && (
                  <div className="flex flex-col gap-1.5 animate-in slide-in-from-top-2 duration-150">
                    <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider">Call Duration</label>
                    <input
                      type="text"
                      placeholder="Enter Call Duration (e.g. 5 min)"
                      value={callDuration}
                      onChange={(e) => setCallDuration(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                )}

                {/* Remarks */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                    Remarks<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                    required
                  />
                </div>

                {/* Status Dropdown & Conditional Follow Up Date */}
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                      Status<span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                      required
                    >
                      <option value="">Select Status</option>
                      {statuses.map(st => (
                        <option key={st.id} value={st.name}>{st.name}</option>
                      ))}
                    </select>
                  </div>

                  {requiresFollowUp(editStatus) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
                      {/* Previous Follow-Up Date (read-only) */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider">
                          Previous Follow-Up Date
                        </label>
                        <div className="w-full px-4 py-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl text-sm text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                          {editingLead?.latest_follow_up
                            ? new Date(editingLead.latest_follow_up).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
                            : <span className="text-slate-400 font-normal italic">Not set</span>
                          }
                        </div>
                      </div>

                      {/* New Follow-Up Date */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                          Next Follow-Up Date<span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={followUpDate}
                          onChange={(e) => setFollowUpDate(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                          required={requiresFollowUp(editStatus)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Buttons */}
                <div className="flex justify-end gap-3 mt-2">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-755 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingUpdate}
                    className="px-10 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-500/10 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {submittingUpdate && <Loader2 className="w-4 h-4 animate-spin" />}
                    Update
                  </button>
                </div>
              </form>
            </div>

            {/* Card 3: Lead Activity Timeline */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 pb-3">
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Activity Timeline
                </h3>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700/50 px-2.5 py-1 rounded-full">
                  {leadHistory.length} log{leadHistory.length !== 1 ? 's' : ''}
                </span>
              </div>

              {loadingDetails ? (
                <div className="flex items-center justify-center gap-2 py-12 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin text-[#0E9485]" />
                  <span className="text-sm">Loading activity logs...</span>
                </div>
              ) : leadHistory.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">No activity logs yet.</p>
                  <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">Submit an update above to start tracking.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-0 relative">
                  {/* Vertical timeline line */}
                  <div className="absolute left-6 top-3 bottom-3 w-0.5 bg-slate-200 dark:bg-slate-700 z-0" />

                  {leadHistory.map((hist, idx) => {
                    const { date: logDate, time: logTime } = formatDateTime(hist.created_at)
                    const histStatus = hist.status_name || hist.status
                    const matchedHistStatus = statuses.find(s => s.name?.toLowerCase() === histStatus?.toLowerCase())
                    const followUpFormatted = hist.follow_up_date
                      ? new Date(hist.follow_up_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
                      : null

                    return (
                      <div key={hist.id} className="relative flex gap-5 pb-6 last:pb-0">
                        {/* Timeline dot */}
                        <div className="relative z-10 flex-shrink-0">
                          <div
                            className="w-5 h-5 mt-1 rounded-full border-2 border-white dark:border-slate-800 shadow-md flex items-center justify-center"
                            style={{ backgroundColor: matchedHistStatus?.text_color || '#94a3b8' }}
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
                          </div>
                        </div>

                        {/* Log card */}
                        <div className="flex-1 bg-slate-50 dark:bg-slate-700/40 rounded-xl border border-slate-100 dark:border-slate-700 p-4 hover:shadow-sm transition-shadow">
                          {/* Header row: status + date */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              {renderStatusBadge(histStatus)}
                              {hist.communication_option && (
                                <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-indigo-100 dark:border-indigo-800">
                                  {hist.communication_option}
                                </span>
                              )}
                              {hist.communication_option === 'Call' && hist.call_duration && (
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                                  ⏱ {hist.call_duration}
                                </span>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 justify-end">
                                <Calendar className="w-3 h-3" />
                                {logDate}
                              </div>
                              <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5 justify-end">
                                <Clock className="w-3 h-3" />
                                {logTime}
                              </div>
                            </div>
                          </div>

                          {/* Remarks */}
                          {hist.remarks && (
                            <p className="text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed mb-3">
                              {hist.remarks}
                            </p>
                          )}

                          {/* Follow-up date */}
                          {followUpFormatted && (
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
                              <Calendar className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                Next Follow-Up: {followUpFormatted}
                              </span>
                            </div>
                          )}

                          {/* Serial number badge */}
                          <div className="absolute -top-1.5 -left-1 hidden">{idx + 1}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* List Leads Log View */
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-5">
            
            {/* Filter controls row */}
            <div className="flex items-center justify-between flex-wrap gap-5">
              <div className="flex items-center flex-wrap gap-4 flex-1">
                <div className="flex gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">Lead Source</label>
                    <select
                      value={filterSource}
                      onChange={(e) => {
                        setFilterSource(e.target.value)
                        fetchLeads(1, searchText, e.target.value, filterStatus, filterAssignedTo)
                      }}
                      className="px-3.5 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200 cursor-pointer"
                    >
                      <option value="">Select an Option</option>
                      {SOURCE_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">Status</label>
                    <select
                      value={filterStatus}
                      onChange={e => {
                        setFilterStatus(e.target.value)
                        fetchLeads(1, searchText, filterSource, e.target.value, filterAssignedTo)
                      }}
                      className="bg-white dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer shadow-sm min-w-[150px]"
                    >
                      <option value="">Select an Option</option>
                      {statuses.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">Assigned To</label>
                    <select
                      value={filterAssignedTo}
                      onChange={e => {
                        setFilterAssignedTo(e.target.value)
                        fetchLeads(1, searchText, filterSource, filterStatus, e.target.value)
                      }}
                      className="bg-white dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer shadow-sm min-w-[150px]"
                    >
                      <option value="">Select an Option</option>
                      <option value="unassigned">Unassigned</option>
                      {assignableUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Search Bar & Export button */}
              <div className="flex items-center gap-3 ml-auto">
                {selectedLeads.length > 0 && (
                  <button
                    onClick={() => setIsAssignModalOpen(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Assign Selected ({selectedLeads.length})
                  </button>
                )}
                <form onSubmit={handleSearchSubmit} className="relative w-72">
                  <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by School Name, Address, Mb no."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full pl-11 pr-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                  />
                </form>
              </div>
            </div>

            {/* Desktop Leads Log Table */}
            <div className="hidden md:block overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm bg-white dark:bg-slate-800">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3.5 w-12 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                      <input 
                        type="checkbox"
                        checked={leads.length > 0 && selectedLeads.length === leads.length}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedLeads(leads.map(l => l.id))
                          else setSelectedLeads([])
                        }}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3.5 font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700 w-16">S. No.</th>
                    <th className="px-4 py-3.5 font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700 text-center w-28">Action</th>
                    <th className="px-4 py-3.5 font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700 w-44">Assigned To</th>
                    <th className="px-4 py-3.5 font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">School Name</th>
                    <th className="px-4 py-3.5 font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">Name</th>
                    <th className="px-4 py-3.5 font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">Mobile No.</th>
                    <th className="px-4 py-3.5 font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700 max-w-xs">Remarks</th>
                    <th className="px-4 py-3.5 font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">Status</th>
                    <th className="px-4 py-3.5 font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">Created At</th>
                    <th className="px-4 py-3.5 font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">Updated At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={11} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin text-[#0E9485]" />
                          Loading leads log...
                        </div>
                      </td>
                    </tr>
                  ) : leads.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                        No leads found matching filters.
                      </td>
                    </tr>
                  ) : (
                    leads.map((l, idx) => {
                      const sNo = (currentPage - 1) * pageSize + idx + 1
                      const { date: cDate, time: cTime } = formatDateTime(l.created_at)
                      const { date: uDate, time: uTime } = formatDateTime(l.updated_at)
                      const matchedStatus = statuses.find(s => s.name.toLowerCase() === l.status?.toLowerCase())
                      return (
                        <tr 
                          key={l.id} 
                          className="hover:brightness-95 transition-all border-b border-slate-200/50 dark:border-slate-700/50"
                          style={{ 
                            backgroundColor: matchedStatus?.bg_color || undefined,
                            borderLeft: matchedStatus ? `6px solid ${matchedStatus.text_color || matchedStatus.bg_color}` : undefined
                          }}
                        >
                          <td className="px-4 py-3.5">
                            <input 
                              type="checkbox"
                              checked={selectedLeads.includes(l.id)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedLeads(prev => [...prev, l.id])
                                else setSelectedLeads(prev => prev.filter(id => id !== l.id))
                              }}
                              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-3.5 font-medium text-slate-550 dark:text-slate-400">{sNo}.</td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleStartEdit(l)}
                                className="w-7 h-7 flex items-center justify-center bg-indigo-50/80 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors cursor-pointer"
                                title="Edit Lead Details"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenLogsModal(l)}
                                className="w-7 h-7 flex items-center justify-center bg-emerald-50/80 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors cursor-pointer"
                                title="View Lead Logs"
                              >
                                <Activity className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(l.id)}
                                className="w-7 h-7 flex items-center justify-center bg-red-50/80 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 text-red-550 dark:text-red-400 rounded-lg transition-colors cursor-pointer"
                                title="Delete Lead"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            {l.assigned_user_name ? (
                              <div className="flex flex-col items-start gap-1.5 mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                                    <Users className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                                  </div>
                                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    {l.assigned_user_name}
                                  </span>
                                  {l.assigned_user_role && (
                                    <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                      {l.assigned_user_role}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : null}
                            <select
                              value={l.assigned_to || ''}
                              onChange={(e) => handleAssignStaff(l.id, e.target.value)}
                              className="px-2.5 py-1.5 bg-white/80 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-755 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                            >
                              <option value="">Assign Staff</option>
                              {assignableUsers.map(staff => (
                                <option key={staff.id} value={staff.id}>{staff.name} ({staff.role})</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3.5 text-slate-800 dark:text-slate-100 font-semibold">{l.school_name}</td>
                          <td className="px-4 py-3.5 text-slate-700 dark:text-slate-205 text-sm font-semibold">
                            {l.contact_person}
                          </td>
                          <td className="px-4 py-3.5 text-slate-650 dark:text-slate-300 text-sm font-semibold">{l.mobile_no}</td>
                          <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 text-xs font-medium max-w-xs truncate leading-normal" title={l.latest_remarks}>
                            {l.latest_remarks || '—'}
                          </td>
                          <td className="px-4 py-3.5">
                            {renderStatusBadge(l.status)}
                          </td>
                          <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                              {cDate}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                              {cTime}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                              {uDate}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                              {uTime}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/10">
              {loading ? (
                <div className="py-12 text-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#0E9485]" />
                  <span className="text-xs font-semibold mt-2 block">Loading leads...</span>
                </div>
              ) : leads.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No leads found matching filters.
                </div>
              ) : (
                leads.map((l, idx) => {
                  const sNo = (currentPage - 1) * pageSize + idx + 1
                  const matchedStatus = statuses.find(s => s.name.toLowerCase() === l.status?.toLowerCase())
                  return (
                    <div 
                      key={l.id} 
                      className="p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700 shadow-xs space-y-3 relative transition-all"
                      style={{ 
                        backgroundColor: matchedStatus?.bg_color || undefined,
                        borderLeft: matchedStatus ? `6px solid ${matchedStatus.text_color || matchedStatus.bg_color}` : undefined
                      }}
                    >
                      <div className="absolute top-4 right-4">
                        <input 
                          type="checkbox"
                          checked={selectedLeads.includes(l.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedLeads(prev => [...prev, l.id])
                            else setSelectedLeads(prev => prev.filter(id => id !== l.id))
                          }}
                          className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </div>
                      <div className="flex justify-between items-start pr-8">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">#{sNo} Lead • {l.lead_source}</span>
                          <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200 mt-0.5">{l.school_name}</h4>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleStartEdit(l)}
                            className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors cursor-pointer"
                            title="Edit Lead Details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenLogsModal(l)}
                            className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors cursor-pointer"
                            title="View Lead Logs"
                          >
                            <Activity className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(l.id)}
                            className="p-1.5 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 dark:text-red-400 rounded-lg transition-colors cursor-pointer"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                        <div>
                          <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Contact</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{l.contact_person}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Mobile</span>
                          <span>{l.mobile_no}</span>
                        </div>
                        <div className="mt-1 col-span-2">
                          <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Email</span>
                          <span className="block truncate">{l.email_id || '—'}</span>
                        </div>
                        <div className="mt-1 col-span-2">
                          <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Remarks</span>
                          <p className="text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{l.latest_remarks || '—'}</p>
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex flex-col gap-1 w-full sm:w-auto">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assign Staff:</span>
                          <select
                            value={l.assigned_to || ''}
                            onChange={(e) => handleAssignStaff(l.id, e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                          >
                            <option value="">Assign Staff</option>
                            {assignableUsers.map(staff => (
                              <option key={staff.id} value={staff.id}>{staff.name} ({staff.role})</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="flex flex-col gap-1 items-end w-full sm:w-auto">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                          <div className="mt-0.5">
                            {renderStatusBadge(l.status)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Pagination Controls */}
            {totalCount > 0 && (
              <div className="flex items-center justify-between flex-wrap gap-4 mt-2">
                <p className="text-xs font-semibold text-slate-550 dark:text-slate-400">
                  Showing {startEntry}-{endEntry} of {totalCount} Entries
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => fetchLeads(1, searchText, filterSource, filterStatus, filterAssignedTo)}
                    className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:text-slate-305 dark:disabled:text-slate-600 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                  >
                    {'<<'}
                  </button>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => fetchLeads(currentPage - 1, searchText, filterSource, filterStatus, filterAssignedTo)}
                    className="p-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:text-slate-305 dark:disabled:text-slate-600 rounded-lg bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {getPageNumbers().map((pg) => (
                    <button
                      key={pg}
                      onClick={() => fetchLeads(pg, searchText, filterSource, filterStatus, filterAssignedTo)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        pg === currentPage
                          ? 'bg-[#0E9485] text-white shadow-sm'
                          : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-700'
                      }`}
                    >
                      {pg}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => fetchLeads(currentPage + 1, searchText, filterSource, filterStatus, filterAssignedTo)}
                    className="p-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:text-slate-305 dark:disabled:text-slate-600 rounded-lg bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => fetchLeads(totalPages, searchText, filterSource, filterStatus, filterAssignedTo)}
                    className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:text-slate-355 dark:disabled:text-slate-600 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                  >
                    {'>>'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Lead Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {addEditId ? 'Edit Lead Details' : 'Create New Lead'}
              </h2>
              <button 
                onClick={resetAddEditModal}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddEditSubmit} className="p-6 overflow-y-auto flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Lead Source <span className="text-red-500">*</span></label>
                  <select
                    value={leadSource}
                    onChange={(e) => setLeadSource(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                  >
                    <option value="">Select Lead Source</option>
                    {SOURCE_OPTIONS.map(src => (
                      <option key={src} value={src}>{src}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Mobile No. <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={mobileNo}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                      setMobileNo(val)
                    }}
                    placeholder="Enter 10-digit Mobile No."
                    maxLength={10}
                    required
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200 font-mono tracking-wide"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Email Id</label>
                  <input
                    type="email"
                    value={emailId}
                    onChange={(e) => setEmailId(e.target.value)}
                    placeholder="Enter Email Id"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Contact Person</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Enter Contact Person"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">School Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="Enter School Name"
                  required
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">State</label>
                  <select
                    value={stateName}
                    onChange={(e) => {
                      setStateName(e.target.value)
                      setDistrict('')
                    }}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                  >
                    <option value="">Select State</option>
                    {statesData.map((st: any) => {
                      const sName = st.state_name || st.name;
                      return (
                        <option key={st.id || sName} value={sName}>{sName}</option>
                      );
                    })}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">District</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                    disabled={!stateName}
                  >
                    <option value="">Select District</option>
                    {districtsList.map((dist: any) => {
                      const dName = typeof dist === 'string' ? dist : (dist.name || dist.district_name || String(dist));
                      return (
                        <option key={dName} value={dName}>{dName}</option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">No of Students</label>
                  <input
                    type="number"
                    value={noOfStudents}
                    onChange={(e) => setNoOfStudents(e.target.value)}
                    placeholder="Enter No of Students"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Status <span className="text-red-500">*</span></label>
                  <select
                    value={baseStatus}
                    onChange={(e) => setBaseStatus(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                  >
                    <option value="">Select Status</option>
                    {statuses.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {requiresFollowUp(baseStatus) && (
                <div className="flex flex-col gap-3 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Previous Follow-Up Date (read-only, shown in edit mode) */}
                    {addEditId && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Previous Follow-Up Date</label>
                        <div className="w-full px-4 py-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl text-sm text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                          {baseFollowUpDate
                            ? new Date(baseFollowUpDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
                            : <span className="text-slate-400 font-normal italic">Not set</span>
                          }
                        </div>
                      </div>
                    )}

                    {/* New / Next Follow-Up Date */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                        {addEditId ? 'New Next Follow-Up Date' : 'Next Follow-Up Date'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={addEditId ? newEditFollowUpDate : baseFollowUpDate}
                        onChange={(e) => addEditId ? setNewEditFollowUpDate(e.target.value) : setBaseFollowUpDate(e.target.value)}
                        required={requiresFollowUp(baseStatus)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3 mt-auto">
                <button
                  type="button"
                  onClick={resetAddEditModal}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addEditSubmitting}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {addEditSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {addEditId ? 'Save Changes' : 'Create Lead'}
                </button>
              </div>
            </form>

            {/* Activity Timeline — only in edit mode */}
            {addEditId && (
              <div className="px-6 pb-6 flex flex-col gap-4 border-t border-slate-100 dark:border-slate-700 overflow-y-auto max-h-72">
                <div className="flex items-center justify-between pt-4">
                  <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Activity Timeline
                  </h3>
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700/50 px-2.5 py-1 rounded-full">
                    {modalLeadHistory.length} log{modalLeadHistory.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {modalHistoryLoading ? (
                  <div className="flex items-center justify-center gap-2 py-6 text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin text-[#0E9485]" />
                    <span className="text-sm">Loading logs...</span>
                  </div>
                ) : modalLeadHistory.length === 0 ? (
                  <div className="flex items-center gap-2 py-4 text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">No activity logs yet.</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-0 relative">
                    <div className="absolute left-[9px] top-3 bottom-3 w-0.5 bg-slate-200 dark:bg-slate-700 z-0" />
                    {modalLeadHistory.map((hist) => {
                      const { date: logDate, time: logTime } = formatDateTime(hist.created_at)
                      const histStatus = hist.status_name || hist.status
                      const matchedStatus = statuses.find(s => s.name?.toLowerCase() === histStatus?.toLowerCase())
                      const followUpFormatted = hist.follow_up_date
                        ? new Date(hist.follow_up_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
                        : null
                      return (
                        <div key={hist.id} className="relative flex gap-4 pb-4 last:pb-0">
                          <div className="relative z-10 flex-shrink-0 mt-1">
                            <div
                              className="w-[18px] h-[18px] rounded-full border-2 border-white dark:border-slate-800 shadow-md"
                              style={{ backgroundColor: matchedStatus?.text_color || '#94a3b8' }}
                            />
                          </div>
                          <div className="flex-1 bg-slate-50 dark:bg-slate-700/40 rounded-xl border border-slate-100 dark:border-slate-700 p-3">
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                {renderStatusBadge(histStatus)}
                                {hist.communication_option && (
                                  <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-bold uppercase border border-indigo-100 dark:border-indigo-800">
                                    {hist.communication_option}
                                  </span>
                                )}
                                {hist.communication_option === 'Call' && hist.call_duration && (
                                  <span className="text-[10px] text-slate-500 font-semibold">⏱ {hist.call_duration}</span>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                <div className="text-[10px] font-semibold text-slate-400">{logDate}</div>
                                <div className="text-[10px] text-slate-400">{logTime}</div>
                              </div>
                            </div>
                            {hist.remarks && (
                              <p className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed">{hist.remarks}</p>
                            )}
                            {followUpFormatted && (
                              <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
                                <Calendar className="w-3 h-3 text-emerald-500" />
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Next Follow-Up: {followUpFormatted}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Lead confirmation */}
      <DeleteConfirmationModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Delete Lead"
        description="Are you sure you want to delete this lead? This action cannot be undone."
      />

      {/* Bulk Assign Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsAssignModalOpen(false)}
          />
          <div className="relative bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Assign Lead{selectedLeads.length > 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                You are assigning {selectedLeads.length} lead(s).
              </p>
            </div>
            
            <form onSubmit={handleBulkAssign} className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Select Assignee
                </label>
                <select
                  required
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                >
                  <option value="">Select a user...</option>
                  <option value="unassigned">Unassigned (Remove assignment)</option>
                  {assignableUsers.map(user => (
                    <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigning || !selectedAssignee}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-500/20 flex items-center gap-2 cursor-pointer"
                >
                  {isAssigning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    'Confirm Assignment'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lead Logs Popup Modal */}
      {isLogsModalOpen && logsModalLead && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/30 shrink-0">
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  Lead Activity Logs
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{logsModalLead.school_name}</span>
                  {logsModalLead.district || logsModalLead.state ? ` · ${[logsModalLead.district, logsModalLead.state].filter(Boolean).join(', ')}` : ''}
                </p>
              </div>
              <button
                onClick={() => { setIsLogsModalOpen(false); setLogsModalLead(null); setLogsModalHistory([]) }}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lead summary strip */}
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-700 flex items-center gap-6 shrink-0 flex-wrap text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-slate-400">Mobile:</span>
                <span className="font-bold">{logsModalLead.mobile_no}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-slate-400">Source:</span>
                <span className="font-bold">{logsModalLead.lead_source}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {renderStatusBadge(logsModalLead.status)}
              </div>
              {logsModalLead.latest_follow_up && (
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <Calendar className="w-3 h-3" />
                  Follow-up: {new Date(logsModalLead.latest_follow_up).toLocaleDateString('en-GB')}
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto p-6">
              {logsModalLoading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                  <span className="text-sm">Loading activity logs...</span>
                </div>
              ) : logsModalHistory.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">No activity logs yet.</p>
                  <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">Use the ✏️ Edit button to add logs.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-0 relative">
                  <div className="absolute left-[9px] top-3 bottom-3 w-0.5 bg-slate-200 dark:bg-slate-700 z-0" />
                  {logsModalHistory.map((hist, idx) => {
                    const { date: logDate, time: logTime } = formatDateTime(hist.created_at)
                    const histStatus = hist.status_name || hist.status
                    const matchedStatus = statuses.find(s => s.name?.toLowerCase() === histStatus?.toLowerCase())
                    const followUpFormatted = hist.follow_up_date
                      ? new Date(hist.follow_up_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
                      : null
                    return (
                      <div key={hist.id} className="relative flex gap-4 pb-5 last:pb-0">
                        {/* Dot */}
                        <div className="relative z-10 flex-shrink-0 mt-1">
                          <div
                            className="w-[18px] h-[18px] rounded-full border-2 border-white dark:border-slate-800 shadow-md"
                            style={{ backgroundColor: matchedStatus?.text_color || '#94a3b8' }}
                          />
                        </div>
                        {/* Card */}
                        <div className="flex-1 bg-slate-50 dark:bg-slate-700/40 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              {renderStatusBadge(histStatus)}
                              {hist.communication_option && (
                                <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-bold uppercase border border-indigo-100 dark:border-indigo-800">
                                  {hist.communication_option}
                                </span>
                              )}
                              {hist.communication_option === 'Call' && hist.call_duration && (
                                <span className="text-[10px] text-slate-500 font-semibold">⏱ {hist.call_duration}</span>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-[10px] font-semibold text-slate-400">{logDate}</div>
                              <div className="text-[10px] text-slate-400">{logTime}</div>
                            </div>
                          </div>
                          {hist.remarks && (
                            <p className="text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed">{hist.remarks}</p>
                          )}
                          {followUpFormatted && (
                            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
                              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Next Follow-Up: {followUpFormatted}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/20">
              <span className="text-xs text-slate-400 font-semibold">
                {logsModalHistory.length} log{logsModalHistory.length !== 1 ? 's' : ''}
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setIsLogsModalOpen(false); setLogsModalLead(null); setLogsModalHistory([]) }}
                  className="px-5 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => { setIsLogsModalOpen(false); handleStartEdit(logsModalLead) }}
                  className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit & Update Lead
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <FileUp className="w-5 h-5 text-indigo-500" />
                  Import Leads
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Upload a CSV file to bulk-create leads</p>
              </div>
              <button
                onClick={() => { setIsImportModalOpen(false); setImportFile(null) }}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5">
              {/* Download Template */}
              <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                <div>
                  <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Download Template</p>
                  <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-0.5">Get the CSV format to fill in your leads</p>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Template
                </button>
              </div>

              {/* Required columns hint */}
              <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/40 rounded-xl p-3 leading-relaxed">
                <span className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Required columns:</span>
                <code className="text-[10px] text-indigo-600 dark:text-indigo-400 break-all">
                  school_name, mobile_no
                </code>
                <span className="font-bold text-slate-600 dark:text-slate-300 block mt-2 mb-1">Optional:</span>
                <code className="text-[10px] text-slate-500 break-all">
                  lead_source, contact_person, email_id, state, district, no_of_students, status
                </code>
              </div>

              {/* File Picker */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Select CSV File
                </label>
                <label className="flex flex-col items-center justify-center gap-2 w-full h-24 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors">
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {importFile ? (
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{importFile.name}</span>
                    ) : (
                      'Click to select a .csv file'
                    )}
                  </span>
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setIsImportModalOpen(false); setImportFile(null) }}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImportCSV}
                  disabled={!importFile || importLoading}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {importLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {importLoading ? 'Importing...' : 'Import Leads'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
