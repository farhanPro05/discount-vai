'use client'

import { useState } from 'react'

import { SHAPES, type ShapeKey } from '../../fields/shapes'
import { useEscape } from '../shop/ShopProvider'
import { Icon } from '../ui/Icon'

export type SizeGuideData = {
  name: string
  columns: string[]
  rows: { size: string; values: number[] }[]
  howToMeasure: { label: string; text: string }[]
  tip?: string | null
}

/** Size chart with inches / centimetres switch. A modal on desktop, a bottom sheet on mobile. */
export function SizeGuideModal({ guide, selected, shape, onClose }: { guide: SizeGuideData; selected?: string | null; shape: ShapeKey; onClose: () => void }) {
  const [unit, setUnit] = useState<'in' | 'cm'>('in')
  useEscape(true, onClose)
  const show = (n: number) => (unit === 'in' ? `${n}"` : `${Math.round(n * 2.54)} cm`)
  return (
    <>
      <button className="scrim" type="button" aria-label="Close size guide" onClick={onClose} />
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="sg-title">
        <div className="sheet-h">
          <span className="grab show-m" aria-hidden="true" />
          <h2 id="sg-title">Size Guide · {guide.name}</h2>
          <button className="ib" type="button" aria-label="Close" onClick={onClose} autoFocus>
            <Icon name="x" />
          </button>
        </div>
        <div className="sg-b">
          <div className="seg2" role="group" aria-label="Units">
            <button type="button" className={unit === 'in' ? 'on' : ''} aria-pressed={unit === 'in'} onClick={() => setUnit('in')}>
              Inches
            </button>
            <button type="button" className={unit === 'cm' ? 'on' : ''} aria-pressed={unit === 'cm'} onClick={() => setUnit('cm')}>
              Centimetres
            </button>
          </div>
          <div className="tbl-w">
            <table className="tbl">
              <thead>
                <tr>
                  <th scope="col">Size</th>
                  {guide.columns.map((c) => (
                    <th scope="col" key={c}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {guide.rows.map((r) => (
                  <tr key={r.size} className={r.size === selected ? 'hl' : ''}>
                    <th scope="row">{r.size}</th>
                    {r.values.map((v, i) => (
                      <td key={i}>{Number.isFinite(v) ? show(v) : '–'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {guide.howToMeasure.length ? (
            <div className="htm">
              <div aria-hidden="true">
                <svg viewBox="0 0 100 125">
                  <path d={SHAPES[shape]} fill="var(--sunk)" stroke="var(--text2)" strokeWidth=".8" fillRule="evenodd" />
                  <path d="M30 44 H70" stroke="var(--accent)" strokeWidth="1.4" strokeDasharray="2 2" />
                  <path d="M74 21 V116" stroke="var(--accent)" strokeWidth="1.4" strokeDasharray="2 2" />
                </svg>
              </div>
              <div>
                <p className="htm-h">How to measure</p>
                <ol className="steps">
                  {guide.howToMeasure.map((m) => (
                    <li key={m.label}>
                      <b>{m.label}:</b> {m.text}
                    </li>
                  ))}
                </ol>
                {guide.tip ? <p className="muted">{guide.tip}</p> : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  )
}
