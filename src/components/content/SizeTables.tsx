'use client'

import { useState } from 'react'

import type { SizeGuideData } from '../product/SizeGuideModal'

/** All size charts on one page, with an inches / centimetres switch. */
export function SizeTables({ guides }: { guides: SizeGuideData[] }) {
  const [unit, setUnit] = useState<'in' | 'cm'>('in')
  const show = (n: number) => (Number.isFinite(n) ? (unit === 'in' ? `${n}"` : `${Math.round(n * 2.54)} cm`) : '–')
  return (
    <>
      <div className="seg2" role="group" aria-label="Units">
        <button type="button" className={unit === 'in' ? 'on' : ''} aria-pressed={unit === 'in'} onClick={() => setUnit('in')}>
          Inches
        </button>
        <button type="button" className={unit === 'cm' ? 'on' : ''} aria-pressed={unit === 'cm'} onClick={() => setUnit('cm')}>
          Centimetres
        </button>
      </div>
      {guides.map((g) => (
        <section key={g.name} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2>{g.name}</h2>
          <div className="tbl-w">
            <table className="tbl">
              <thead>
                <tr>
                  <th scope="col">Size</th>
                  {g.columns.map((c) => (
                    <th scope="col" key={c}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {g.rows.map((r) => (
                  <tr key={r.size}>
                    <th scope="row">{r.size}</th>
                    {r.values.map((v, i) => (
                      <td key={i}>{show(v)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {g.howToMeasure.length ? (
            <ol className="steps">
              {g.howToMeasure.map((m) => (
                <li key={m.label}>
                  <b>{m.label}:</b> {m.text}
                </li>
              ))}
            </ol>
          ) : null}
          {g.tip ? <p className="muted">{g.tip}</p> : null}
        </section>
      ))}
    </>
  )
}
