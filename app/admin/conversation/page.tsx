'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Search, Paperclip, Send, Loader2, CheckCheck, Check } from 'lucide-react'
import { toast } from 'sonner'

interface Contact {
  contact: string
  latest_message: string
  latest_timestamp: string | null
  unread_count: number
  latest_sender: string
}

interface Message {
  id: string
  sender: string
  receiver: string
  message: string
  is_read: boolean
  created_at: string
}

const formatMsgTime = (timestampStr: string | null) => {
  if (!timestampStr) return ''
  try {
    const date = new Date(timestampStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${timeStr.toLowerCase()}`
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${timeStr.toLowerCase()}`
    } else {
      const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
      return `${dateStr}, ${timeStr.toLowerCase()}`
    }
  } catch {
    return timestampStr
  }
}

// Custom decorative SVG Avatar icons matching Manager, BDM, Admin styles
const ContactAvatar = ({ name, size = '12' }: { name: string; size?: string }) => {
  let bgColor = 'bg-teal-600'
  let textColor = 'text-teal-100'
  let initials = name.substring(0, 2).toUpperCase()

  if (name === 'Manager') {
    bgColor = 'bg-teal-500'
    textColor = 'text-teal-50'
  } else if (name === 'BDM') {
    bgColor = 'bg-blue-600'
    textColor = 'text-blue-50'
  } else if (name === 'Admin') {
    bgColor = 'bg-purple-600'
    textColor = 'text-purple-50'
  }

  return (
    <div className={`w-${size} h-${size} rounded-full ${bgColor} flex items-center justify-center font-bold text-xs shrink-0 border border-slate-100 dark:border-slate-700 shadow-sm`}>
      <span className={textColor}>{initials}</span>
    </div>
  )
}

export default function AllConversationPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loadingContacts, setLoadingContacts] = useState(true)
  const [activeContact, setActiveContact] = useState<string>('Manager')
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Message input
  const [inputMessage, setInputMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [mockFile, setMockFile] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Load Contacts list
  const fetchContacts = useCallback(async (selectDefault = false) => {
    try {
      const res = await fetch('/api/admin/conversation')
      const data = await res.json()
      if (data.success) {
        setContacts(data.data)
        if (selectDefault && data.data.length > 0) {
          // If manager is present, select it. Else choose first.
          const hasManager = data.data.some((c: Contact) => c.contact === 'Manager')
          if (hasManager) {
            setActiveContact('Manager')
          } else {
            setActiveContact(data.data[0].contact)
          }
        }
      }
    } catch {
      toast.error('Failed to load contacts list')
    } finally {
      setLoadingContacts(false)
    }
  }, [])

  // Load Messages for active contact
  const fetchMessages = useCallback(async (contactName: string) => {
    setLoadingMessages(true)
    try {
      const res = await fetch(`/api/admin/conversation/${contactName}`)
      const data = await res.json()
      if (data.success) {
        setMessages(data.data)
        setTimeout(scrollToBottom, 50)
      }
    } catch {
      toast.error('Failed to load messages feed')
    } finally {
      setLoadingMessages(false)
    }
  }, [])

  // Mark active messages as read
  const markAsRead = useCallback(async (contactName: string) => {
    try {
      await fetch(`/api/admin/conversation/${contactName}`, { method: 'PUT' })
      // Refresh contacts to update unread badge counts
      const res = await fetch('/api/admin/conversation')
      const data = await res.json()
      if (data.success) {
        setContacts(data.data)
      }
    } catch (e) {
      console.error('Failed to mark read', e)
    }
  }, [])

  // Trigger loads on mount
  useEffect(() => {
    fetchContacts(true)
  }, [fetchContacts])

  // Load messages when active contact changes
  useEffect(() => {
    if (activeContact) {
      fetchMessages(activeContact)
      markAsRead(activeContact)
    }
  }, [activeContact, fetchMessages, markAsRead])

  // Periodic polling for new messages (e.g. simulated chat freshness)
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeContact) {
        // Refresh silently
        fetch(`/api/admin/conversation/${activeContact}`)
          .then(r => r.json())
          .then(data => {
            if (data.success && data.data.length !== messages.length) {
              setMessages(data.data)
              setTimeout(scrollToBottom, 50)
            }
          })
        
        fetch('/api/admin/conversation')
          .then(r => r.json())
          .then(data => {
            if (data.success) {
              setContacts(data.data)
            }
          })
      }
    }, 4000)
    return () => clearInterval(interval)
  }, [activeContact, messages.length])

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() && !mockFile) return

    setSending(true)
    const currentMsgText = inputMessage.trim() || `[Attachment: ${mockFile}]`
    setInputMessage('')
    setMockFile('')

    try {
      const res = await fetch('/api/admin/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiver: activeContact,
          message: currentMsgText
        })
      })
      const data = await res.json()
      if (data.success) {
        // Optimistically append sent message
        setMessages(prev => [...prev, data.data])
        setTimeout(scrollToBottom, 50)
        
        // Refresh contacts list to update last message preview
        fetchContacts()
      } else {
        toast.error('Failed to send message')
      }
    } catch {
      toast.error('Error occurred sending message')
    } finally {
      setSending(false)
    }
  }

  // Handle mock attachment upload
  const handleAttachFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filename = e.target.files[0].name
      setMockFile(filename)
      toast.success(`Attached file: ${filename}. Type a message or click send.`)
    }
  }

  // Filter contacts by search input
  const filteredContacts = contacts.filter(c => 
    c.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.latest_message.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full h-[calc(100vh-120px)]">
        {/* Title Header Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl px-8 py-5 border border-slate-100 dark:border-slate-700 shadow-sm shrink-0">
          <h1 className="text-2xl font-bold text-slate-850 dark:text-slate-100 tracking-tight">All Conversation</h1>
        </div>

        {/* Messaging Layout Panel */}
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex overflow-hidden min-h-0">
          
          {/* Left contacts bar (1/3 width) */}
          <div className="w-full md:w-80 border-r border-slate-100 dark:border-slate-700 flex flex-col min-h-0 bg-slate-50/30 dark:bg-slate-800/30 shrink-0">
            {/* Search Input bar */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
                />
              </div>
            </div>

            {/* People title */}
            <div className="px-5 py-3 border-b border-slate-50 dark:border-slate-700/50 shrink-0">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">People</h2>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {loadingContacts ? (
                <div className="py-12 text-center text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-teal-600" />
                  <span className="text-xs font-semibold">Loading conversations...</span>
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-medium">
                  No conversations found
                </div>
              ) : (
                filteredContacts.map(c => {
                  const isActive = activeContact === c.contact
                  return (
                    <button
                      key={c.contact}
                      onClick={() => setActiveContact(c.contact)}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left cursor-pointer border ${
                        isActive
                          ? 'bg-white dark:bg-slate-700/60 border-slate-150 dark:border-slate-600 shadow-sm'
                          : 'bg-transparent border-transparent hover:bg-slate-100/40 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <ContactAvatar name={c.contact} size="10" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-tight truncate">
                            {c.contact}
                          </h4>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold shrink-0">
                            {c.latest_timestamp ? formatMsgTime(c.latest_timestamp).split(', ')[0] : ''}
                          </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium truncate leading-normal pr-4">
                          {c.latest_message || 'No messages yet.'}
                        </p>
                      </div>
                      
                      {/* Read status check / Badge count */}
                      <div className="shrink-0 flex flex-col items-end gap-1.5 self-center">
                        {c.unread_count > 0 ? (
                          <span className="w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center text-[10px] font-black shrink-0 shadow-sm shadow-teal-500/25">
                            {c.unread_count}
                          </span>
                        ) : c.latest_sender === 'Super Admin' ? (
                          <CheckCheck className="w-3.5 h-3.5 text-teal-500" />
                        ) : (
                          c.latest_message && <Check className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Right chat logs pane (2/3 width) */}
          <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC] dark:bg-slate-900/40">
            {activeContact ? (
              <>
                {/* Active contact header */}
                <div className="px-6 py-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3 shrink-0">
                  <ContactAvatar name={activeContact} size="10" />
                  <div>
                    <h3 className="font-bold text-slate-850 dark:text-slate-100 text-base leading-tight tracking-tight">
                      {activeContact}
                    </h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Active Session</p>
                  </div>
                </div>

                {/* Message list area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {loadingMessages && messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-slate-400 text-xs">
                      <Loader2 className="w-6 h-6 animate-spin text-teal-600 mr-2" />
                      Loading messages history...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-slate-400 text-xs font-semibold">
                      Start typing below to begin a conversation with {activeContact}.
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const isOutgoing = msg.sender === 'Super Admin'
                      return (
                        <div
                          key={msg.id || index}
                          className={`flex flex-col gap-1.5 max-w-[70%] ${
                            isOutgoing ? 'ml-auto items-end' : 'mr-auto items-start'
                          }`}
                        >
                          {/* Chat Message Bubble */}
                          <div
                            className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm font-medium ${
                              isOutgoing
                                ? 'bg-[#0B2C4F] text-white rounded-tr-none'
                                : 'bg-[#E5E9EC] text-slate-800 dark:bg-slate-750 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-700'
                            }`}
                          >
                            {msg.message}
                          </div>
                          
                          {/* Time details below bubble */}
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1">
                            {formatMsgTime(msg.created_at)}
                            {isOutgoing && (
                              msg.is_read ? (
                                <CheckCheck className="w-3 h-3 text-teal-500" />
                              ) : (
                                <Check className="w-3 h-3 text-slate-400" />
                              )
                            )}
                          </span>
                        </div>
                      )
                    })
                  )}
                  {/* Anchor point to auto-scroll */}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Bar area */}
                <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 shrink-0">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-50 dark:bg-slate-700/60 rounded-full border border-slate-200 dark:border-slate-600 px-4 py-1.5 flex items-center gap-3">
                      {/* Mock Attachment Clip */}
                      <label className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0 p-1">
                        <input
                          type="file"
                          onChange={handleAttachFile}
                          className="hidden"
                        />
                        <Paperclip className="w-4 h-4" />
                      </label>
                      
                      {/* Text Input */}
                      <input
                        type="text"
                        placeholder="Type your message here..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        className="flex-1 py-1.5 bg-transparent border-none outline-none focus:ring-0 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      />

                      {mockFile && (
                        <div className="bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 shrink-0 shadow-sm border border-teal-150">
                          <span className="max-w-[100px] truncate">{mockFile}</span>
                          <button
                            type="button"
                            onClick={() => setMockFile('')}
                            className="text-teal-700 font-black hover:text-red-500"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Send Button */}
                    <button
                      type="submit"
                      disabled={sending || (!inputMessage.trim() && !mockFile)}
                      className="w-10 h-10 rounded-full bg-[#0F9E8F] hover:bg-[#0D8E80] disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 text-white flex items-center justify-center transition-all cursor-pointer shadow-md shadow-teal-500/10 shrink-0"
                    >
                      {sending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm font-semibold">
                Select a contact on the left to begin messaging.
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
