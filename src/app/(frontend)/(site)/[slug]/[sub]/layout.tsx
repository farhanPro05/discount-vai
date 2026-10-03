import { requireSubcategory } from '../../../../../lib/routes'

/** Answers 404 / 301 before the loading skeleton starts streaming (see lib/routes.ts). */
export default async function SubcategoryLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string; sub: string }> }) {
  const { slug, sub } = await params
  await requireSubcategory(slug, sub)
  return children
}
