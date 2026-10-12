export interface MasterClassWithSections {
  className: string
  sections: string[]
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

    // Map each added class with its specific sections
    return classesList.map(c => {
      const className = c.className.trim()
      
      // Find sections linked in school_masters_sections
      const linkedSections = sectionsList
        .filter(s => s.className && s.className.toLowerCase() === className.toLowerCase())
        .map(s => {
          const name = s.sectionName.trim()
          return name.toLowerCase().startsWith('sec') ? name : `Section ${name}`
        })

      // Also check if class record itself has sections array
      const classObjSections = Array.isArray(c.sections) 
        ? c.sections.map((s: string) => s.toLowerCase().startsWith('sec') ? s : `Section ${s}`)
        : []

      const mergedSections = Array.from(new Set([...linkedSections, ...classObjSections]))

      return {
        className,
        sections: mergedSections.length > 0 
          ? mergedSections 
          : ['Section A', 'Section B', 'Section C']
      }
    })
  } catch (err) {
    console.error('Error loading added classes:', err)
    return DEFAULT_INSTITUTE_CLASSES
  }
}
