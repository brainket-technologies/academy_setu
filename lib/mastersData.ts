'use client'

import { useState, useEffect } from 'react'

export function useMastersData<T = any>(key: string, initialValue: T[] = []) {
  const [data, setData] = useState<T[]>(initialValue)

  useEffect(() => {
    const saved = localStorage.getItem(`school_masters_${key}`)
    if (saved) {
      try {
        setData(JSON.parse(saved))
      } catch (e) {
        console.error(`Error parsing masters data for ${key}:`, e)
      }
    }
  }, [key])

  return data
}

// Helpers for specific entities
export function useClasses() {
  // Assuming classes are saved with shape: { id, className, sections: string[], ... }
  return useMastersData<any>('classes')
}

export function useSections() {
  return useMastersData<any>('sections')
}

export function useDepartments() {
  return useMastersData<any>('departments')
}

export function useSubjects() {
  return useMastersData<any>('subjects')
}

export function useSubjectGroups() {
  return useMastersData<any>('subject_groups')
}

export function useStreams() {
  return useMastersData<any>('streams')
}

export function useDocumentTypes() {
  return useMastersData<any>('document_types')
}

export function useDiscountHeads() {
  return useMastersData<any>('discount_heads')
}
