import type { Metadata } from 'next'

import { SimpleComingSoon } from '../../../../components/content/ComingSoon'

export const metadata: Metadata = { title: 'Style Guide: coming soon', robots: { index: false, follow: true } }

export default function StyleGuidePage() {
  return (
    <SimpleComingSoon
      title="Style Guide is on its way"
      text="We're putting together outfit ideas and how-to-wear notes for every piece. Want a heads-up when it's live?"
      interest="style-guide"
    />
  )
}
