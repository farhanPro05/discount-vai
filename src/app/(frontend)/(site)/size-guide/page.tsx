import type { Metadata } from 'next'

import { InfoLayout } from '../../../../components/content/InfoLayout'
import { SizeTables } from '../../../../components/content/SizeTables'
import { getClient } from '../../../../lib/payload'

export const metadata: Metadata = {
  title: 'Size Guide',
  description: 'Size charts for Discount Vai Panjabi, tees, jerseys, jackets, trousers, shorts and half pants, in inches and centimetres.',
  alternates: { canonical: '/size-guide' },
}

export default async function SizeGuidePage() {
  const payload = await getClient()
  const res = await payload.find({ collection: 'size-guides', limit: 30, depth: 0, sort: 'createdAt' })
  const guides = res.docs.map((g) => ({
    name: g.name,
    columns: g.columns.split(',').map((s) => s.trim()).filter(Boolean),
    rows: (g.rows ?? []).map((r) => ({ size: r.size, values: r.values.split(',').map((v) => Number(v.trim())) })),
    howToMeasure: (g.howToMeasure ?? []).map((m) => ({ label: m.label, text: m.text })),
    tip: g.tip,
  }))
  return (
    <InfoLayout current="/size-guide" crumb="Size Guide">
      <h1>Size Guide</h1>
      <p className="lead">Measurements of the garment, not your body. Between sizes? Go one up for a relaxed fit, and remember the 7-day exchange.</p>
      <SizeTables guides={guides} />
    </InfoLayout>
  )
}
