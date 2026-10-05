import { toImg } from '../../lib/media'
import { getBrand } from '../../lib/settings'

/* Browsers and search engines ask for /favicon.ico whatever the page links to: send them the favicon uploaded in the admin, or the DV monogram. */
export async function GET(req: Request) {
  const brand = await getBrand().catch(() => null)
  const icon = brand ? toImg(brand.favicon) : null
  return Response.redirect(new URL(icon?.url ?? '/favicon-dv.ico', req.url), 307)
}
