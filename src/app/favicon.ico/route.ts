import { SITE_URL } from '../../lib/format'
import { toImg } from '../../lib/media'
import { getBrand } from '../../lib/settings'

/* Browsers and search engines ask for /favicon.ico whatever the page links to: send them the favicon uploaded in the admin, or the DV monogram. */
export async function GET() {
  const brand = await getBrand().catch(() => null)
  const icon = brand ? toImg(brand.favicon) : null
  return Response.redirect(new URL(icon?.url ?? '/favicon-dv.ico', SITE_URL), 307)
}
