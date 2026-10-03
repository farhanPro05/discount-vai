import { Footer } from '../../../components/layout/Footer'
import { Header } from '../../../components/layout/Header'
import { CartDrawer, CartToast, WhatsAppButton } from '../../../components/shop/CartBits'
import { SearchOverlay } from '../../../components/shop/SearchOverlay'
import { SignupPopup, type PopupSettings } from '../../../components/shop/SignupPopup'
import type { IconName } from '../../../components/ui/Icon'
import { waLink } from '../../../lib/format'
import { toImg } from '../../../lib/media'
import { getCommerceInfo, getPopup, getSite } from '../../../lib/settings'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [site, popup, commerce] = await Promise.all([getSite(), getPopup(), getCommerceInfo()])
  const popupSettings: PopupSettings = {
    enabled: popup.enabled !== false,
    eyebrow: popup.eyebrow ?? '',
    heading: popup.heading || 'Join the Vai List',
    text: popup.text ?? '',
    offer: popup.offer ?? '',
    buttonLabel: popup.buttonLabel || 'Join the Vai List',
    image: toImg(popup.image),
    benefitsHeading: popup.benefitsHeading ?? '',
    benefits: (popup.benefits ?? []).map((b) => ({ icon: (b.icon ?? 'bell') as IconName, label: b.label })),
    successHeading: popup.successHeading || "You're on the list!",
    successText: popup.successText ?? '',
    code: popup.code ?? '',
    scrollPercent: popup.scrollPercent ?? 70,
    delaySeconds: popup.delaySeconds ?? 8,
    hideDays: popup.hideDays ?? 7,
  }
  const chat = waLink(site.whatsapp, 'Hi Discount Vai!') ?? '/contact'
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      {site.showWhatsAppButton !== false ? <WhatsAppButton href={chat} /> : null}
      <SearchOverlay />
      <CartDrawer freeOver={commerce.freeOver} />
      <CartToast />
      <SignupPopup s={popupSettings} />
    </>
  )
}
