export const HOME_SECTIONS = [
  { label: 'Hero slider', value: 'hero' },
  { label: 'Shop by Category', value: 'categories' },
  { label: 'New Arrivals', value: 'newArrivals' },
  { label: 'Deal banner', value: 'deal' },
  { label: 'Featured collection', value: 'featured' },
  { label: 'Best Sellers', value: 'bestSellers' },
  { label: 'Bags spotlight', value: 'bags' },
  { label: "Women's teaser", value: 'womenTeaser' },
  { label: 'Trust strip', value: 'trust' },
  { label: 'Customer reviews', value: 'reviews' },
  { label: 'About text (SEO)', value: 'seo' },
] as const

export type HomeSectionKey = (typeof HOME_SECTIONS)[number]['value']
