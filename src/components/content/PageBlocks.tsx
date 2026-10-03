import { RichText } from '@payloadcms/richtext-lexical/react'

import { toImg } from '../../lib/media'
import type { Page } from '../../payload-types'
import { Lifestyle } from '../ui/Art'

type Block = NonNullable<Page['layout']>[number]

/** Renders the content blocks of a page from the admin. */
export function PageBlocks({ blocks }: { blocks: Page['layout'] }) {
  return (
    <>
      {(blocks ?? []).map((b: Block, i) => {
        switch (b.blockType) {
          case 'text':
            return (
              <div className="rt" key={b.id ?? i}>
                {b.heading ? <h2>{b.heading}</h2> : null}
                {b.body ? <RichText data={b.body} disableContainer /> : null}
              </div>
            )
          case 'image':
            return <Lifestyle key={b.id ?? i} className="prose-img" img={toImg(b.image)} shapes={['panjabi', 'tee']} sizes="(min-width: 1024px) 760px, 100vw" />
          case 'cards':
            return b.style === 'facts' ? (
              <div className="facts" key={b.id ?? i}>
                {(b.items ?? []).map((it) => (
                  <div key={it.id ?? it.title}>
                    <b>{it.title}</b>
                    {it.text ? <span>{it.text}</span> : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="vals" key={b.id ?? i}>
                {(b.items ?? []).map((it) => (
                  <div className="val" key={it.id ?? it.title}>
                    <b>{it.title}</b>
                    {it.text ? <p>{it.text}</p> : null}
                  </div>
                ))}
              </div>
            )
          case 'steps':
            return (
              <div key={b.id ?? i} style={{ display: 'contents' }}>
                {b.heading ? <h2>{b.heading}</h2> : null}
                <ol className="steps">
                  {(b.items ?? []).map((it) => (
                    <li key={it.id ?? it.text}>
                      {it.bold ? <b>{it.bold}</b> : null} {it.text}
                    </li>
                  ))}
                </ol>
              </div>
            )
          default:
            return null
        }
      })}
    </>
  )
}
