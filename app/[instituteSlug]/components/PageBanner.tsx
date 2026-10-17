'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface PageBannerProps {
  slug: string
  title: string
  subtitle?: string
  breadcrumbs?: Array<{ label: string; href?: string }>
}

export default function PageBanner({ slug, title, subtitle, breadcrumbs = [] }: PageBannerProps) {
  return (
    <section className="relative py-14 sm:py-20 bg-gradient-to-r from-[#132742] via-[#0f2942] to-[#0d6efd] text-white text-center overflow-hidden">
      {/* Subtle overlay decorative elements */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-8 space-y-3">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-slate-200 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}

        {/* Breadcrumb Navigation */}
        <nav aria-label="breadcrumb" className="pt-2">
          <ol className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-300">
            <li>
              <Link href={`/${slug}`} className="hover:text-white transition-colors">
                Home
              </Link>
            </li>
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={i}>
                <li>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </li>
                <li>
                  {b.href ? (
                    <Link href={b.href} className="hover:text-white transition-colors">
                      {b.label}
                    </Link>
                  ) : (
                    <span className="text-amber-400 font-bold">{b.label}</span>
                  )}
                </li>
              </React.Fragment>
            ))}
          </ol>
        </nav>
      </div>
    </section>
  )
}
