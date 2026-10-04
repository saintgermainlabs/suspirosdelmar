import type { Lang } from "../i18n"
import { site } from "../site"

export interface SEOConfig {
  title: string
  description: string
  url?: string
  image?: string
  lang?: Lang
}

export function updateSEO({
  title,
  description,
  url,
  image,
  lang = "es",
}: SEOConfig) {
  // 1. Update Document Title
  document.title = `${title} | ${site.name}`

  // 2. Set HTML Lang attribute
  document.documentElement.lang = lang

  // 3. Helper to set/create meta tag
  const setMeta = (nameAttr: string, attrVal: string, content: string) => {
    let element = document.querySelector(
      `meta[${nameAttr}="${attrVal}"]`,
    ) as HTMLMetaElement | null
    if (!element) {
      element = document.createElement("meta")
      element.setAttribute(nameAttr, attrVal)
      document.head.appendChild(element)
    }
    element.setAttribute("content", content)
  }

  // Standard Meta Tags
  setMeta("name", "description", description)

  // OpenGraph Meta Tags
  setMeta("property", "og:title", `${title} | ${site.name}`)
  setMeta("property", "og:description", description)
  setMeta("property", "og:type", "website")
  setMeta("property", "og:site_name", site.name)
  if (url) setMeta("property", "og:url", url)
  if (image) setMeta("property", "og:image", image)

  // Twitter Cards
  setMeta("name", "twitter:card", "summary_large_image")
  setMeta("name", "twitter:title", `${title} | ${site.name}`)
  setMeta("name", "twitter:description", description)
  if (image) setMeta("name", "twitter:image", image)

  // 4. Inject Schema.org Hotel JSON-LD Structured Data
  injectHotelSchema()
}

function injectHotelSchema() {
  const schemaId = "hotel-jsonld-schema"
  let script = document.getElementById(schemaId) as HTMLScriptElement | null

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: site.name,
    description:
      "A peaceful coastal refuge in Playa Arica, Lurín — Lima. Four cozy guest rooms and a private upstairs apartment steps from the ocean.",
    url: window.location.origin,
    telephone: site.phoneDisplay,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Jr. Los Lirios, Mz. W, Lt. 8, Playa Arica",
      addressLocality: "Lurín",
      addressRegion: "Lima",
      addressCountry: "PE",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -12.3036704,
      longitude: -76.8473174,
    },
    priceRange: "S/ 80 - S/ 180",
    currenciesAccepted: "PEN, USD",
    checkinTime: "15:00",
    checkoutTime: "11:00",
    amenityFeature: [
      {
        "@type": "LocationFeatureSpecification",
        name: "Free Wi-Fi",
        value: true,
      },
      {
        "@type": "LocationFeatureSpecification",
        name: "Beach Access",
        value: true,
      },
      {
        "@type": "LocationFeatureSpecification",
        name: "Shared Guest Kitchen",
        value: true,
      },
      {
        "@type": "LocationFeatureSpecification",
        name: "Courtyard Garden",
        value: true,
      },
    ],
  }

  if (!script) {
    script = document.createElement("script")
    script.id = schemaId
    script.type = "application/ld+json"
    document.head.appendChild(script)
  }
  script.textContent = JSON.stringify(schemaData, null, 2)
}
