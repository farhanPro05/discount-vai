import { requireTopLevel } from '../../../../lib/routes'

/** Answers 404 / 301 before the loading skeleton starts streaming (see lib/routes.ts). */
export default async function TopLevelLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  await requireTopLevel((await params).slug)
  return children
}
