'use client'

import { useMemo, useState } from 'react'

import { Accordion } from '../ui/Accordion'
import { Icon } from '../ui/Icon'

type Group = { title: string; questions: { question: string; answer: string }[] }

/** FAQ groups with a quick filter box. */
export function FaqList({ groups }: { groups: Group[] }) {
  const [q, setQ] = useState('')
  const shown = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return groups
    return groups
      .map((g) => ({ ...g, questions: g.questions.filter((x) => `${x.question} ${x.answer}`.toLowerCase().includes(t)) }))
      .filter((g) => g.questions.length)
  }, [groups, q])
  return (
    <>
      <label className="field-s">
        <Icon name="search" />
        <input type="search" placeholder="Search the FAQ" aria-label="Search the FAQ" value={q} onChange={(e) => setQ(e.target.value)} />
      </label>
      {shown.length ? (
        shown.map((g, gi) => (
          <div key={g.title} style={{ display: 'contents' }}>
            <h2>{g.title}</h2>
            <Accordion
              items={g.questions.map((x) => ({ title: x.question, body: <p>{x.answer}</p> }))}
              defaultOpen={gi === 0 && !q ? 0 : q ? 0 : null}
            />
          </div>
        ))
      ) : (
        <p className="muted">No questions match “{q}”. Try another word, or ask us on the Contact page.</p>
      )}
    </>
  )
}
