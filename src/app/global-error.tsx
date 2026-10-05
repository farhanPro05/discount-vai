'use client'

/* Last-resort error page if the whole layout fails. Plain and self-contained, Discount Vai branded. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#F6F4EE', color: '#21261F' }}>
        <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, textAlign: 'center' }}>
          <p style={{ fontSize: 22, margin: 0 }}>
            <span style={{ fontWeight: 500 }}>Discount</span> <b style={{ fontWeight: 800 }}>Vai</b>
          </p>
          <h1 style={{ fontSize: 30, margin: 0 }}>Something went wrong, vai</h1>
          <p style={{ margin: 0, color: '#585E54' }}>Please try again in a moment.</p>
          <button
            type="button"
            onClick={reset}
            style={{ height: 48, padding: '0 24px', borderRadius: 6, border: 0, background: '#3D5643', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
