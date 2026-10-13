import { notFound } from 'next/navigation'
import { fetchPublicWebsiteBySlug } from '@/app/institute/website/actions'
import ClientWebsite from './ClientWebsite'
import type { Metadata } from 'next'

const RESERVED_SLUGS = [
  'admin',
  'institute',
  'manager',
  'bdm',
  'distributor',
  'api',
  'favicon.ico',
  'generated'
]

export async function generateMetadata({
  params
}: {
  params: Promise<{ instituteSlug: string }>
}): Promise<Metadata> {
  const { instituteSlug } = await params
  if (RESERVED_SLUGS.includes(instituteSlug)) return {}

  const res = await fetchPublicWebsiteBySlug(instituteSlug)
  if (!res.success || !res.data) {
    return {
      title: 'Institution Not Found | Academy Setu'
    }
  }

  const s = res.data.settings
  const title = s.website_title
    ? `${s.website_title} | Official Website`
    : 'Institute Website'
  const description =
    s.hero_tagline ||
    s.about_text?.substring(0, 160) ||
    'Official institution website powered by Academy Setu'

  return {
    title,
    description,
    icons: s.favicon_url ? [{ url: s.favicon_url }] : undefined,
    openGraph: {
      title,
      description,
      images: s.logo_url ? [{ url: s.logo_url }] : undefined
    }
  }
}

export default async function InstitutePublicPage({
  params
}: {
  params: Promise<{ instituteSlug: string }>
}) {
  const { instituteSlug } = await params

  if (RESERVED_SLUGS.includes(instituteSlug)) {
    notFound()
  }

  const res = await fetchPublicWebsiteBySlug(instituteSlug)
  if (!res.success || !res.data) {
    notFound()
  }

  return <ClientWebsite data={res.data} slug={instituteSlug} />
}
