const SITE_URL = 'https://rwanda-easyrent.vercel.app'

export function organizationLD() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'EasyRent',
    url: SITE_URL,
    logo: `${SITE_URL}/images/easyrentlogo.jpeg`,
    description: "Rwanda's leading property rental management platform",
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Kigali',
      addressCountry: 'RW',
    },
    sameAs: [],
  }
}

export function websiteLD() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'EasyRent',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/properties?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function localBusinessLD() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'EasyRent',
    url: SITE_URL,
    logo: `${SITE_URL}/images/easyrentlogo.jpeg`,
    description: "Rwanda's leading property rental management platform",
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Kigali',
      addressRegion: 'Kigali',
      addressCountry: 'RW',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -1.9403,
      longitude: 29.8739,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Rwanda',
    },
  }
}

interface PropertyLDProps {
  title: string
  description?: string
  price: number
  bedrooms: number
  bathrooms: number
  district: string
  province: string
  images?: { url: string }[]
  id: string
}

export function propertyLD(property: PropertyLDProps) {
  const image = property.images?.[0]?.url
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    url: `${SITE_URL}/properties/${property.id}`,
    image: image?.startsWith('http') ? image : image ? `${SITE_URL}${image}` : undefined,
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'RWF',
      availability: 'https://schema.org/InStock',
    },
    numberOfRooms: property.bedrooms,
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.district,
      addressRegion: property.province,
      addressCountry: 'RW',
    },
  }
}

interface BreadcrumbItem {
  name: string
  url: string
}

export function breadcrumbLD(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  }
}

interface FaqItem {
  question: string
  answer: string
}

export function faqLD(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}
