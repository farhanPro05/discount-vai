import sharp from 'sharp'

import { SHAPES, type ShapeKey } from '../fields/shapes'

/**
 * Placeholder product photos: the garment outline from the mockups, filled with the
 * product colour on a soft studio background, in the real 4:5 photo ratio.
 * Shot 0 = front, 1 = back (mirrored), 2 = close-up detail.
 */
export async function placeholderPhoto(shape: ShapeKey, hex: string, shot: 0 | 1 | 2): Promise<Buffer> {
  // Same framing as the mockups: outline at 64% of the frame, centred; back = mirrored; detail = 2.2× zoom.
  const transforms = ['', 'translate(100 2.5) scale(-1 1)', 'translate(-60 -42) scale(2.2)']
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1500" viewBox="0 0 100 125">
  <rect width="100" height="125" fill="#ECE8DF"/>
  <g transform="translate(18 22.5) scale(0.64)">
    <g transform="${transforms[shot]}">
      <path d="${SHAPES[shape]}" fill="${hex}" fill-rule="evenodd" stroke="rgba(0,0,0,0.14)" stroke-width="0.7"/>
    </g>
  </g>
</svg>`
  return sharp(Buffer.from(svg)).webp({ quality: 82 }).toBuffer()
}

/** The "DV" favicon and app icons (written to /public by the seed). */
export function monogramSvg(bg = '#3D5643', fg = '#FFFFFF'): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="${bg}"/>
  <text x="32" y="42" text-anchor="middle" font-family="Archivo, Arial, Helvetica, sans-serif" font-size="27" font-weight="800" letter-spacing="-1" fill="${fg}">DV</text>
</svg>`
}
