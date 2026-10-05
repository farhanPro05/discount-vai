'use client'

import { useRowLabel } from '@payloadcms/ui'

/** Shows the colour name and a swatch on each row of a product's colours, instead of "Colour 01". */
export const ColourRowLabel = () => {
  const { data, rowNumber } = useRowLabel<{ name?: string; hex?: string }>()
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      {data?.hex ? (
        <span
          aria-hidden="true"
          style={{ width: 14, height: 14, borderRadius: '50%', background: data.hex, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.2)' }}
        />
      ) : null}
      {data?.name || `Colour ${String((rowNumber ?? 0) + 1).padStart(2, '0')}`}
    </span>
  )
}

/** Shows "M · 6 in stock" on each size row instead of "Size 01". */
export const SizeRowLabel = () => {
  const { data, rowNumber } = useRowLabel<{ size?: string; stock?: number }>()
  if (!data?.size) return <span>{`Size ${String((rowNumber ?? 0) + 1).padStart(2, '0')}`}</span>
  const n = Number(data.stock) || 0
  return <span>{`${data.size} · ${n > 0 ? `${n} in stock` : 'sold out'}`}</span>
}
