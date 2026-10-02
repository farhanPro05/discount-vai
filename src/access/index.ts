import type { Access, PayloadRequest } from 'payload'

/** Someone logged in to the admin panel (owner or staff). */
export const isStaff = (req: PayloadRequest): boolean => req.user?.collection === 'users'

/** The shop owner: full access, including settings and admin users. */
export const isOwner = (req: PayloadRequest): boolean =>
  req.user?.collection === 'users' && (req.user as { role?: string }).role === 'owner'

export const anyone: Access = () => true
export const staffOnly: Access = ({ req }) => isStaff(req)
export const ownerOnly: Access = ({ req }) => isOwner(req)

/** Visitors only see published documents; admin users see drafts too. */
export const publishedOrStaff: Access = ({ req }) =>
  isStaff(req) ? true : { _status: { equals: 'published' } }

/** Hide owner-only collections from staff in the admin sidebar. */
export const hiddenFromStaff = ({ user }: { user: unknown }): boolean =>
  (user as { role?: string } | null)?.role !== 'owner'
