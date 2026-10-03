'use client'

export function PrintButton() {
  return (
    <button className="pr-btn" type="button" onClick={() => window.print()}>
      Print
    </button>
  )
}
