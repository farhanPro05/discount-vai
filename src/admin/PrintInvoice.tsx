'use client'

import { Button, useDocumentInfo, useFormFields } from '@payloadcms/ui'

/** "Print invoice" in an order's sidebar: opens the printable invoice in a new tab. */
export const PrintInvoice = () => {
  const { id } = useDocumentInfo()
  const number = useFormFields(([fields]) => fields.orderNumber?.value as string | undefined)
  if (!id || !number) return null
  return (
    <Button el="anchor" url={`/invoice/${encodeURIComponent(number)}`} newTab buttonStyle="secondary" size="medium">
      Print invoice
    </Button>
  )
}
