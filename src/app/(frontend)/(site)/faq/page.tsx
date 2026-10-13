import type { Metadata } from 'next'
import Link from 'next/link'

import { FaqList } from '../../../../components/content/FaqList'
import { InfoLayout } from '../../../../components/content/InfoLayout'
import { JsonLd } from '../../../../components/ui/JsonLd'
import { faqLd } from '../../../../lib/seo'
import { getFaq } from '../../../../lib/settings'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Answers on ordering, payment, delivery charges and times across Bangladesh, and our 7-day exchange.',
  alternates: { canonical: '/faq' },
}

export default async function FaqPage() {
  const faq = await getFaq()
  const groups = (faq.groups ?? []).map((g) => ({
    title: g.title,
    questions: (g.questions ?? []).map((q) => ({ question: q.question, answer: q.answer })),
  }))
  return (
    <InfoLayout current="/faq" crumb="FAQ">
      <JsonLd data={faqLd(groups.flatMap((g) => g.questions))} />
      <h1>Frequently asked questions</h1>
      <p className="lead">
        {faq.lead || 'Quick answers on orders, delivery and exchanges.'} Can&apos;t find yours?{' '}
        <Link className="lnk" href="/contact">
          Ask us
        </Link>
        .
      </p>
      <FaqList groups={groups} />
    </InfoLayout>
  )
}
