import { NextResponse, type NextRequest } from 'next/server'

/*
 * Payload's REST API (/api/…) is for the admin panel. Shoppers never need it: the website talks to
 * Payload on the server, and a shopper's browser never sends a Payload token. But a logged-in shopper
 * could copy their token and call the API by hand, and some built-in collections (document locks,
 * for example) let any logged-in user write. So requests carrying a customer's token are refused here.
 *
 * Only the token's "collection" claim is read. Payload still verifies every token's signature itself,
 * so a forged claim can't grant access; this check can only ever turn a request away.
 */

const tokenCollection = (token: string | undefined): string | null => {
  const part = token?.split('.')[1]
  if (!part) return null
  try {
    const claims = JSON.parse(Buffer.from(part, 'base64url').toString('utf8')) as { collection?: unknown }
    return typeof claims.collection === 'string' ? claims.collection : null
  } catch {
    return null
  }
}

export function proxy(req: NextRequest) {
  const header = req.headers.get('authorization') ?? ''
  const bearer = /^(JWT|Bearer)\s+(\S+)$/i.exec(header)?.[2]
  const cookie = req.cookies.get('payload-token')?.value
  if (tokenCollection(bearer) === 'customers' || tokenCollection(cookie) === 'customers') {
    return NextResponse.json({ errors: [{ message: 'Not allowed.' }] }, { status: 403 })
  }
  return NextResponse.next()
}

export const config = { matcher: '/api/:path*' }
