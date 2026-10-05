import { cookies } from 'next/headers'
import { cache } from 'react'

import type { Customer } from '../payload-types'
import { getClient } from './payload'

/** Shoppers sign in with their own cookie, separate from the admin panel's login. */
export const CUSTOMER_COOKIE = 'dv-customer'

export const getCustomer = cache(async (): Promise<Customer | null> => {
  const token = (await cookies()).get(CUSTOMER_COOKIE)?.value
  if (!token) return null
  try {
    const payload = await getClient()
    const { user } = await payload.auth({ headers: new Headers({ Authorization: `JWT ${token}` }) })
    return user?.collection === 'customers' ? (user as unknown as Customer) : null
  } catch {
    return null
  }
})

/** Bangladeshi mobile numbers: keep digits, drop a leading 88/+88, expect 01XXXXXXXXX. */
export function normalisePhone(raw: string): string {
  let d = raw.replace(/\D/g, '')
  if (d.startsWith('880')) d = d.slice(2)
  else if (d.startsWith('88') && d.length === 13) d = d.slice(2)
  return d
}

export const isBdPhone = (raw: string): boolean => /^01[3-9]\d{8}$/.test(normalisePhone(raw))
