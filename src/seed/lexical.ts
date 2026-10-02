/** Tiny helpers to write rich-text (Lexical) content in seed data. */

type Node = Record<string, unknown>

const text = (t: string, bold = false): Node => ({
  type: 'text',
  text: t,
  format: bold ? 1 : 0,
  mode: 'normal',
  style: '',
  detail: 0,
  version: 1,
})

const block = (type: string, children: Node[], extra: Node = {}): Node => ({
  type,
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  children,
  ...extra,
})

export const p = (t: string): Node => block('paragraph', [text(t)], { textFormat: 0, textStyle: '' })
export const h = (t: string, tag: 'h2' | 'h3' = 'h2'): Node => block('heading', [text(t)], { tag })
export const ul = (items: string[]): Node =>
  block(
    'list',
    items.map((t, i) => block('listitem', [text(t)], { value: i + 1 })),
    { listType: 'bullet', start: 1, tag: 'ul' },
  )

export const doc = (...children: Node[]) => ({
  root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children },
})
