'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import AddTeacherModal from '../components/AddTeacherModal'
import AllTeachersPage from '../page'

export default function AddTeacherPage() {
  const router = useRouter()

  const handleClose = () => {
    router.push('/institute/teachers')
  }

  const handleSuccess = () => {
    router.push('/institute/teachers')
  }

  return (
    <div className="relative min-h-[calc(100vh-100px)]">
      {/* Background Page Content */}
      <div className="opacity-40 pointer-events-none filter blur-[1px]">
        <AllTeachersPage />
      </div>

      {/* Add Teacher Modal Popup */}
      <AddTeacherModal
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
