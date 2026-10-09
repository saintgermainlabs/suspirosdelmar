// ─────────────────────────────────────────────────────────────
// Site configuration — edit everything contact-related here.
// Replace the placeholder values below before going live.
// ─────────────────────────────────────────────────────────────

export const site = {
  name: "Los Suspiros del Mar",
  phoneDisplay: "+1 (210) 365-9988",
  phoneHref: "tel:+12103659988",
  whatsappNumber: "12103659988", // country code + number, digits only
  email: "info@suspriodelmar.com",
  address: "Jr. Los Lirios, Mz. W, Lt. 8, Playa Arica, Lurín, Lima",
  checkin: "3:00 PM",
  checkout: "11:00 AM",
  social: {
    instagram: "https://instagram.com/lossuspirosdelmar",
    facebook: "https://facebook.com/lossuspirosdelmar",
    tiktok: "https://tiktok.com/@lossuspirosdelmar",
    booking:
      "https://www.booking.com/searchresults.es.html?aid=356980&label=gog235jc-10CAsosQFCD3N1c3Bpcm8tZGVsLW1hckgKWANosQGIAQGYATO4ARnIAQzYAQPoAQH4AQGIAgGoAgG4AreIh9YGwAIB0gIkNTU0NTFkNTAtNDI0NS00ZTdhLThmMjctZjExMzljZmIyNmVj2AIB4AIB&redirected=1&city=-353652&highlighted_hotels=17244014&hlrd=user_sh&source=hotel&expand_sb=1&keep_landing=1&sid=a1d854c9bf07b6498c97aff35a9cda12",
  },
} as const

/** WhatsApp deep link with an optional pre-filled message. */
export function waLink(text?: string): string {
  const base = `https://wa.me/${site.whatsappNumber}`
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}

/** Google Maps search link for the property address. */
export function mapsLink(): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${site.name}, ${site.address}`,
  )}`
}

export const defaultWaMessage =
  "Hola, me gustaría reservar en Los Suspiros del Mar."
