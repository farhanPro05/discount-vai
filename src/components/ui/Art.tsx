import Image from 'next/image'
import Link from 'next/link'

import { SHAPES, type ShapeKey } from '../../fields/shapes'
import type { Img } from '../../lib/types'

/** Garment outline in the product colour (used until real photos are uploaded). */
export function Sil({ shape, fill, className = 'sil' }: { shape: ShapeKey; fill?: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 125" aria-hidden="true">
      <path d={SHAPES[shape] ?? SHAPES.tee} fill={fill} fillRule="evenodd" stroke="var(--photo-stroke)" strokeWidth=".7" />
    </svg>
  )
}

/** Product photo or, if none, the outline. Fills its (relative) parent. */
export function Photo({
  img,
  shape,
  fill,
  sizes,
  priority,
}: {
  img?: Img | null
  shape: ShapeKey
  fill?: string
  sizes: string
  priority?: boolean
}) {
  if (img) return <Image src={img.url} alt={img.alt} fill sizes={sizes} priority={priority} />
  return <Sil shape={shape} fill={fill} />
}

/**
 * Lifestyle / campaign image block. When the owner hasn't uploaded a photo yet, shows the
 * palette-tinted placeholder with soft outlines, exactly like the mockups (without the labels).
 */
export function Lifestyle({
  img,
  shapes = ['panjabi', 'panjabi'],
  className = '',
  sizes = '100vw',
  priority,
  children,
  as: Tag = 'div',
  href,
  ...rest
}: {
  img?: Img | null
  shapes?: [ShapeKey, ShapeKey?]
  className?: string
  sizes?: string
  priority?: boolean
  children?: React.ReactNode
  as?: 'div' | 'section' | 'a'
  href?: string
  'aria-label'?: string
}) {
  const cls = `ls ${className}${img ? ' has-img' : ''}`
  const inner = (
    <>
      {img ? (
        <Image src={img.url} alt={img.alt} fill sizes={sizes} priority={priority} />
      ) : (
        <>
          <svg className="ls-fig" viewBox="0 0 100 125" aria-hidden="true">
            <path d={SHAPES[shapes[0]]} fillRule="evenodd" />
          </svg>
          {shapes[1] ? (
            <svg className="ls-fig f2" viewBox="0 0 100 125" aria-hidden="true">
              <path d={SHAPES[shapes[1]]} fillRule="evenodd" />
            </svg>
          ) : null}
        </>
      )}
      {children}
    </>
  )
  if (Tag === 'a') {
    return (
      <Link className={cls} href={href ?? '/'} {...rest}>
        {inner}
      </Link>
    )
  }
  return (
    <Tag className={cls} {...rest}>
      {inner}
    </Tag>
  )
}

/** Text wordmark (or the uploaded logo). */
export function Wordmark({ logo, href = '/' }: { logo?: Img | null; href?: string }) {
  return (
    <Link className="wm" href={href} aria-label="Discount Vai home">
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo.url} alt="Discount Vai" width={logo.width} height={logo.height} />
      ) : (
        <>
          <span>Discount</span>
          <b>Vai</b>
        </>
      )}
    </Link>
  )
}
