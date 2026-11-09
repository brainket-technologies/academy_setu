export interface MasterClassWithSections {
  className: string
  sections: string[]
}

const ROMAN_TO_ARABIC: Record<string, string> = {
  'xii': '12',
  'xi': '11',
  'x': '10',
  'ix': '9',
  'viii': '8',
  'vii': '7',
  'vi': '6',
  'v': '5',
  'iv': '4',
  'iii': '3',
  'ii': '2',
  'i': '1'
}

export function normalizeClassName(name: string): string {
  if (!name) return ''
  const trimmed = name.trim().replace(/\s+/g, ' ')

  // Convert roman numerals like "Class I", "Class IV", "Class X" -> "Class 1", "Class 4", "Class 10"
  const romanMatch = trimmed.match(/^(.+?)\s*[-:]?\s*(xii|xi|x|ix|viii|vii|vi|v|iv|iii|ii|i)$/i)
  if (romanMatch) {
    const prefix = romanMatch[1].trim()
    const roman = romanMatch[2].toLowerCase()
    if (ROMAN_TO_ARABIC[roman]) {
      return `${prefix} ${ROMAN_TO_ARABIC[roman]}`
    }
  }

  const singleRoman = trimmed.toLowerCase()
  if (ROMAN_TO_ARABIC[singleRoman]) {
    return `Class ${ROMAN_TO_ARABIC[singleRoman]}`
  }

  return trimmed
}

export function normalizeSectionName(name: string): string {
  if (!name) return 'Section A'
  const trimmed = name.trim().replace(/\s+/g, ' ')
  if (/^sec(tion)?\s*/i.test(trimmed)) {
    const letter = trimmed.replace(/^sec(tion)?\s*/i, '').trim()
    return letter ? `Section ${letter.toUpperCase()}` : trimmed
  }
  if (/^[a-zA-Z0-9]$/.test(trimmed)) {
    return `Section ${trimmed.toUpperCase()}`
  }
  return trimmed
}

const DEFAULT_INSTITUTE_CLASSES: MasterClassWithSections[] = [
  { className: 'Class 8', sections: ['Section A', 'Section B', 'Section C'] },
  { className: 'Class 9', sections: ['Section A', 'Section B', 'Section C'] },
  { className: 'Class 10', sections: ['Section A', 'Section B', 'Section C', 'Section D'] },
  { className: 'Class 11 - Science', sections: ['Section A', 'Section B'] },
  { className: 'Class 11 - Commerce', sections: ['Section A', 'Section B'] },
  { className: 'Class 12 - Science', sections: ['Section A', 'Section B'] },
  { className: 'Class 12 - Commerce', sections: ['Section A', 'Section B'] },
]

export function getInstituteAddedClasses(): MasterClassWithSections[] {
  if (typeof window === 'undefined') {
    return DEFAULT_INSTITUTE_CLASSES
  }

  try {
    let classesList: any[] = []
    let sectionsList: any[] = []

    // 1. Load classes from school_masters_classes
    const savedClasses = localStorage.getItem('school_masters_classes')
    if (savedClasses) {
      try {
        const parsed = JSON.parse(savedClasses)
        if (Array.isArray(parsed)) {
          classesList = parsed.filter((c: any) => !c.deleted && c.className)
        }
      } catch (e) {}
    }

    // 2. Load sections from school_masters_sections
    const savedSections = localStorage.getItem('school_masters_sections')
    if (savedSections) {
      try {
        const parsed = JSON.parse(savedSections)
        if (Array.isArray(parsed)) {
          sectionsList = parsed.filter((s: any) => !s.deleted && s.sectionName)
        }
      } catch (e) {}
    }

    // If no classes have been added in masters yet, return standard default classes
    if (classesList.length === 0) {
      return DEFAULT_INSTITUTE_CLASSES
    }

    // Deduplicate and unify classes by normalized name (e.g. Class I and Class 1 become Class 1)
    const map = new Map<string, MasterClassWithSections>()

    classesList.forEach(c => {
      const canonicalName = normalizeClassName(c.className)
      const key = canonicalName.toLowerCase().trim()

      // Find sections linked in school_masters_sections
      const linkedSections = sectionsList
        .filter(s => s.className && (
          normalizeClassName(s.className).toLowerCase() === key ||
          s.className.toLowerCase() === c.className.toLowerCase()
        ))
        .map(s => {
          const name = s.sectionName.trim()
          return name.toLowerCase().startsWith('sec') ? name : `Section ${name}`
        })

      // Also check if class record itself has sections array
      const classObjSections = Array.isArray(c.sections) 
        ? c.sections.map((s: string) => s.toLowerCase().startsWith('sec') ? s : `Section ${s}`)
        : []

      const mergedSections = Array.from(new Set([...linkedSections, ...classObjSections]))

      if (map.has(key)) {
        const existing = map.get(key)!
        const combined = Array.from(new Set([...existing.sections, ...mergedSections]))
        existing.sections = combined.length > 0 ? combined : ['Section A', 'Section B', 'Section C']
      } else {
        map.set(key, {
          className: canonicalName,
          sections: mergedSections.length > 0 
            ? mergedSections 
            : ['Section A', 'Section B', 'Section C']
        })
      }
    })

    // Sort naturally
    return Array.from(map.values()).sort((a, b) => {
      const numA = parseInt(a.className.replace(/\D/g, ''), 10)
      const numB = parseInt(b.className.replace(/\D/g, ''), 10)
      if (!isNaN(numA) && !isNaN(numB) && numA !== numB) {
        return numA - numB
      }
      return a.className.localeCompare(b.className, undefined, { numeric: true, sensitivity: 'base' })
    })
  } catch (err) {
    console.error('Error loading added classes:', err)
    return DEFAULT_INSTITUTE_CLASSES
  }
}
