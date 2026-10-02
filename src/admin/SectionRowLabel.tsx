'use client'

import { useRowLabel } from '@payloadcms/ui'

import { HOME_SECTIONS } from '../globals/homeSections'

export const SectionRowLabel = () => {
  const { data, rowNumber } = useRowLabel<{ section?: string }>()
  const label = HOME_SECTIONS.find((s) => s.value === data?.section)?.label
  return <span>{label ?? `Section ${(rowNumber ?? 0) + 1}`}</span>
}
