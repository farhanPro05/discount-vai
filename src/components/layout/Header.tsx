import { getNav } from '../../lib/catalog'
import { toImg } from '../../lib/media'
import { getBrand, getSite } from '../../lib/settings'
import type { FeatureTile } from '../../lib/types'
import { AnnouncementBar } from './AnnouncementBar'
import { HeaderClient, type Socials } from './HeaderClient'

const tile = (t?: { eyebrow?: string | null; title?: string | null; linkLabel?: string | null; link?: string | null; image?: unknown } | null): FeatureTile | null =>
  t?.title || t?.image ? { eyebrow: t.eyebrow, title: t.title, linkLabel: t.linkLabel, link: t.link, image: toImg(t.image, t.title ?? '') } : null

export async function Header() {
  const [nav, site, brand] = await Promise.all([getNav(), getSite(), getBrand()])
  const socials: Socials = {
    facebook: site.facebook || null,
    instagram: site.instagram || null,
    tiktok: site.tiktok || null,
    whatsapp: site.whatsapp ? `https://wa.me/${site.whatsapp.replace(/\D/g, '')}` : null,
  }
  return (
    <>
      <AnnouncementBar messages={(site.announcements ?? []).map((a) => a.text).filter(Boolean)} />
      <HeaderClient
        nav={nav}
        logo={toImg(brand.logo, 'Discount Vai')}
        features={{ men: tile(site.menFeature), accessories: tile(site.accessoriesFeature) }}
        socials={socials}
      />
    </>
  )
}
