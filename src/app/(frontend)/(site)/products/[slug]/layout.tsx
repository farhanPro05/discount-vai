import { requireProduct } from '../../../../../lib/routes'

/** Answers 404 / 301 before the loading skeleton starts streaming (see lib/routes.ts). */
export default async function ProductLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  await requireProduct((await params).slug)
  return children
}
