import type { ReactNode } from 'react'

/* Line icons used across the site (shapes from the mockups, Lucide style). */
const P = (d: string) => <path d={d} />

const ICONS = {
  search: (
    <>
      <circle cx="11" cy="11" r="7.5" />
      {P('m20.5 20.5-4.2-4.2')}
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4.5" />
      {P('M20 21a8 8 0 0 0-16 0')}
    </>
  ),
  bag: (
    <>
      {P('M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z')}
      {P('M3 6h18')}
      {P('M16 10a4 4 0 0 1-8 0')}
    </>
  ),
  chevDown: P('m6 9 6 6 6-6'),
  chevRight: P('m9 18 6-6-6-6'),
  chevLeft: P('m15 18-6-6 6-6'),
  x: P('M18 6 6 18M6 6l12 12'),
  menu: P('M4 6h16M4 12h16M4 18h16'),
  truck: (
    <>
      {P('M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2')}
      {P('M15 18H9')}
      {P('M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14')}
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="10" />
      {P('M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3')}
      {P('M12 17h.01')}
    </>
  ),
  facebook: P('M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z'),
  instagram: (
    <>
      <rect width="20" height="20" x="2" y="2" rx="5" />
      <circle cx="12" cy="12" r="4" />
      {P('M17.5 6.5h.01')}
    </>
  ),
  tiktok: (
    <>
      {P('M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5')}
      {P('M14 3c.6 2.6 2.4 4.4 5 4.6')}
    </>
  ),
  whatsapp: (
    <>
      {P('M7.9 20A9 9 0 1 0 4 16.1L2 22Z')}
      {P('M9 9.5c.4 2.3 2.3 4.4 5 5l1.2-1.2 1.6.8-.4 1.4c-3.3.4-7.2-3.3-7-6.8l1.4-.4.8 1.6Z')}
    </>
  ),
  messenger: (
    <>
      {P('M12 2C6.5 2 2 6.1 2 11.2c0 2.9 1.5 5.5 3.8 7.2V22l3.5-1.9c.9.3 1.8.4 2.7.4 5.5 0 10-4.1 10-9.2S17.5 2 12 2Z')}
      {P('m7 13.5 3.5-3.7 2.3 2.3 3.7-2.3-3.5 3.7-2.3-2.3Z')}
    </>
  ),
  bell: (
    <>
      {P('M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9')}
      {P('M10.3 21a1.94 1.94 0 0 0 3.4 0')}
    </>
  ),
  tag: (
    <>
      {P('M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z')}
      <circle cx="7.5" cy="7.5" r=".5" />
    </>
  ),
  zap: P('M13 2 3 14h9l-1 8 10-12h-9l1-8z'),
  exchange: (
    <>
      {P('m17 2 4 4-4 4')}
      {P('M3 11v-1a4 4 0 0 1 4-4h14')}
      {P('m7 22-4-4 4-4')}
      {P('M21 13v1a4 4 0 0 1-4 4H3')}
    </>
  ),
  wallet: (
    <>
      {P('M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1')}
      {P('M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4')}
    </>
  ),
  shirt: P(
    'M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z',
  ),
  arrowRight: P('M5 12h14M13 6l6 6-6 6'),
  arrowLeft: P('m12 19-7-7 7-7M19 12H5'),
  sliders: P('M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4'),
  sort: P('m21 16-4 4-4-4M17 20V4M3 8l4-4 4 4M7 4v16'),
  noResult: (
    <>
      {P('m13.5 8.5-5 5M8.5 8.5l5 5')}
      <circle cx="11" cy="11" r="8" />
      {P('m21 21-4.3-4.3')}
    </>
  ),
  lock: (
    <>
      <rect width="18" height="11" x="3" y="11" rx="2" />
      {P('M7 11V7a5 5 0 0 1 10 0v4')}
    </>
  ),
  phone: P(
    'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z',
  ),
  mobile: (
    <>
      <rect width="14" height="20" x="5" y="2" rx="2" />
      {P('M12 18h.01')}
    </>
  ),
  mail: (
    <>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      {P('m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7')}
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      {P('M12 6v6l4 2')}
    </>
  ),
  check: P('M20 6 9 17l-5-5'),
  alert: (
    <>
      <circle cx="12" cy="12" r="10" />
      {P('M12 8v4M12 16h.01')}
    </>
  ),
  link: (
    <>
      {P('M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71')}
      {P('M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71')}
    </>
  ),
  ruler: (
    <>
      {P('M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z')}
      {P('m14.5 12.5 2-2M11.5 9.5l2-2M8.5 6.5l2-2M17.5 15.5l2-2')}
    </>
  ),
  cash: (
    <>
      <rect width="20" height="12" x="2" y="6" rx="2" />
      <circle cx="12" cy="12" r="2" />
      {P('M6 12h.01M18 12h.01')}
    </>
  ),
  minus: P('M5 12h14'),
  plus: P('M5 12h14M12 5v14'),
  dot: P('M5 12h.01'),
  camera: (
    <>
      {P('M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z')}
      <circle cx="12" cy="13" r="3" />
    </>
  ),
  star: P('M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'),
  logout: P('M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9'),
  home: P('m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10'),
} satisfies Record<string, ReactNode>

export type IconName = keyof typeof ICONS

export function Icon({ name, small, className = '' }: { name: IconName; small?: boolean; className?: string }) {
  return (
    <svg className={`ic${small ? ' ic-s' : ''}${className ? ` ${className}` : ''}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {ICONS[name] ?? null}
    </svg>
  )
}

export function Stars({ rating = 5 }: { rating?: number }) {
  return (
    <span className="stars" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" aria-hidden="true" className={i > rating ? 'off' : ''}>
          {ICONS.star}
        </svg>
      ))}
    </span>
  )
}
