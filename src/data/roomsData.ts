export interface RoomInfo {
  id: string
  slug: string
  index: number
  title: {
    en: string
    es: string
  }
  tagline: {
    en: string
    es: string
  }
  price: string
  priceNumeric: number
  capacity: {
    en: string
    es: string
  }
  bed: {
    en: string
    es: string
  }
  featured?: boolean
  images: {
    hero: string
    gallery: { src: string; alt: { en: string; es: string } }[]
  }
  amenities: {
    en: string[]
    es: string[]
  }
  desc: {
    en: string
    es: string
  }
}

export const roomsData: RoomInfo[] = [
  {
    id: "sea-breeze",
    slug: "sea-breeze",
    index: 0,
    title: {
      en: "Standard Sea Breeze Room",
      es: "Habitación Brisa del Mar",
    },
    tagline: {
      en: "Simple comfort, ocean spirit",
      es: "Comodidad sencilla, espíritu oceánico",
    },
    price: "S/ 80",
    priceNumeric: 80,
    capacity: {
      en: "1–2 guests",
      es: "1–2 huéspedes",
    },
    bed: {
      en: "Queen bed",
      es: "Cama matrimonial",
    },
    images: {
      hero: "/images/Bedroom1.jpg",
      gallery: [
        {
          src: "/images/Bedroom1.jpg",
          alt: {
            en: "Sea Breeze Room with queen bed and natural light",
            es: "Habitación Brisa del Mar con cama matrimonial y luz natural",
          },
        },
        {
          src: "/images/SharedKitchen.jpg",
          alt: {
            en: "Shared guest kitchen with clean sink and wooden shelves",
            es: "Cocina compartida para huéspedes con lavadero limpio y repisas de madera",
          },
        },
        {
          src: "/images/Appartment_Bathroom.jpg",
          alt: {
            en: "Clean and modern private bathroom with tiled finishes",
            es: "Baño privado limpio y moderno con acabados de azulejos",
          },
        },
        {
          src: "/images/Common_Room_Couches.jpg",
          alt: {
            en: "Comfortable couches in the spacious common room",
            es: "Sofás cómodos en la amplia sala común",
          },
        },
      ],
    },
    amenities: {
      en: [
        "Private bathroom",
        "Wi-Fi",
        "Coastal décor",
        "Fan / A/C",
        "Wardrobe",
        "Bedside lamps",
      ],
      es: [
        "Baño privado",
        "Wi-Fi",
        "Decoración costera",
        "Ventilador / A/C",
        "Armario",
        "Lámparas de mesita",
      ],
    },
    desc: {
      en: "A tranquil retreat for solo travelers or couples. The Sea Breeze Room blends natural wood tones with crisp white linens, giving you everything you need for a restful coastal stay. Fall asleep to the soft sound of the sea.",
      es: "Un refugio tranquilo para viajeros solos o parejas. La habitación Brisa del Mar combina tonos de madera natural con sábanas blancas, ofreciéndote todo lo necesario para una estadía costera serena y cómoda. Duerme con el suave sonido del mar.",
    },
  },
  {
    id: "double-sunset",
    slug: "double-sunset",
    index: 1,
    title: {
      en: "Double Sunset Room",
      es: "Habitación Doble Atardecer",
    },
    tagline: {
      en: "Golden hour from your window",
      es: "La hora dorada desde tu ventana",
    },
    price: "S/ 80",
    priceNumeric: 80,
    capacity: {
      en: "1–2 guests",
      es: "1–2 huéspedes",
    },
    bed: {
      en: "Queen bed",
      es: "Cama matrimonial",
    },
    images: {
      hero: "/images/Bedroom2.jpg",
      gallery: [
        {
          src: "/images/Bedroom2.jpg",
          alt: {
            en: "Double Sunset Room, styled with soft linens",
            es: "Habitación Doble Atardecer, decorada con sábanas suaves",
          },
        },
        {
          src: "/images/SharedKitchen.jpg",
          alt: {
            en: "Shared guest kitchen with clean sink and wooden shelves",
            es: "Cocina compartida para huéspedes con lavadero limpio y repisas de madera",
          },
        },
        {
          src: "/images/Appartment_Bathroom.jpg",
          alt: {
            en: "Clean and modern private bathroom with tiled finishes",
            es: "Baño privado limpio y moderno con acabados de azulejos",
          },
        },
        {
          src: "/images/Common_Room_Couches.jpg",
          alt: {
            en: "Comfortable couches in the spacious common room",
            es: "Sofás cómodos en la amplia sala común",
          },
        },
      ],
    },
    amenities: {
      en: [
        "Private bathroom",
        "Wi-Fi",
        "Partial sea view",
        "Sunrise/sunset window",
        "Fan / A/C",
        "Optional breakfast",
      ],
      es: [
        "Baño privado",
        "Wi-Fi",
        "Vista parcial al mar",
        "Ventana al amanecer/atardecer",
        "Ventilador / A/C",
        "Desayuno opcional",
      ],
    },
    desc: {
      en: "The Sunset Room offers soft evening light and a partial sea view that turns golden at dusk. Breakfast can be arranged on request. A favorite for romantic getaways and weekend escapes.",
      es: "La habitación Atardecer ofrece una suave luz vespertina y una vista parcial al mar que se vuelve dorada al anochecer. El desayuno puede coordinarse a pedido. Ideal para escapadas románticas.",
    },
  },
  {
    id: "family-shore",
    slug: "family-shore",
    index: 2,
    title: {
      en: "Family Shore Room",
      es: "Habitación Familiar Orilla",
    },
    tagline: {
      en: "Space for the whole family",
      es: "Espacio para toda la familia",
    },
    price: "S/ 80",
    priceNumeric: 80,
    capacity: {
      en: "Up to 3 guests",
      es: "Hasta 3 huéspedes",
    },
    bed: {
      en: "Queen + single bed",
      es: "Matrimonial + cama individual",
    },
    featured: true,
    images: {
      hero: "/images/Bedroom3.jpg",
      gallery: [
        {
          src: "/images/Bedroom3.jpg",
          alt: {
            en: "Family Shore Room with queen and single bed",
            es: "Habitación Familiar Orilla con cama matrimonial e individual",
          },
        },
        {
          src: "/images/SharedKitchen.jpg",
          alt: {
            en: "Shared guest kitchen with clean sink and wooden shelves",
            es: "Cocina compartida para huéspedes con lavadero limpio y repisas de madera",
          },
        },
        {
          src: "/images/Appartment_Bathroom.jpg",
          alt: {
            en: "Clean and modern private bathroom with tiled finishes",
            es: "Baño privado limpio y moderno con acabados de azulejos",
          },
        },
        {
          src: "/images/Common_Room_Couches.jpg",
          alt: {
            en: "Comfortable couches in the spacious common room",
            es: "Sofás cómodos en la amplia sala común",
          },
        },
      ],
    },
    amenities: {
      en: [
        "Private bathroom",
        "Wi-Fi",
        "Extra single bed",
        "Beach equipment storage",
        "Fan / A/C",
        "Large wardrobe",
      ],
      es: [
        "Baño privado",
        "Wi-Fi",
        "Cama individual adicional",
        "Espacio para equipo de playa",
        "Ventilador / A/C",
        "Armario grande",
      ],
    },
    desc: {
      en: "Designed with families in mind, the Shore Room has generous space, two bed options, and room to store your beach gear. The comfortable layout makes it easy to settle in for a few nights — or a whole week.",
      es: "Diseñada para familias, la habitación Orilla tiene espacio generoso, dos opciones de cama y lugar para guardar tus cosas de playa. El cómodo diseño hace que sea fácil instalarse por varios días.",
    },
  },
  {
    id: "ocean-calm",
    slug: "ocean-calm",
    index: 3,
    title: {
      en: "Ocean Calm Room",
      es: "Habitación Calma Oceánica",
    },
    tagline: {
      en: "Our premium coastal retreat",
      es: "Nuestro refugio costero premium",
    },
    price: "S/ 80",
    priceNumeric: 80,
    capacity: {
      en: "1–2 guests",
      es: "1–2 huéspedes",
    },
    bed: {
      en: "Queen bed",
      es: "Cama matrimonial",
    },
    featured: true,
    images: {
      hero: "/images/Bed.jpg",
      gallery: [
        {
          src: "/images/Bed.jpg",
          alt: {
            en: "Guest bed with a traditional textile runner",
            es: "Cama para huéspedes con un textil tradicional",
          },
        },
        {
          src: "/images/SharedKitchen.jpg",
          alt: {
            en: "Shared guest kitchen with clean sink and wooden shelves",
            es: "Cocina compartida para huéspedes con lavadero limpio y repisas de madera",
          },
        },
        {
          src: "/images/Appartment_Bathroom.jpg",
          alt: {
            en: "Clean and modern private bathroom with tiled finishes",
            es: "Baño privado limpio y moderno con acabados de azulejos",
          },
        },
        {
          src: "/images/Common_Room_Couches.jpg",
          alt: {
            en: "Comfortable couches in the spacious common room",
            es: "Sofás cómodos en la amplia sala común",
          },
        },
      ],
    },
    amenities: {
      en: [
        "Private bathroom",
        "Wi-Fi",
        "Private terrace or sitting area",
        "Ocean-inspired décor",
        "Premium linens",
        "Fan / A/C",
      ],
      es: [
        "Baño privado",
        "Wi-Fi",
        "Terraza o sala privada",
        "Decoración inspirada en el océano",
        "Ropa de cama premium",
        "Ventilador / A/C",
      ],
    },
    desc: {
      en: "The most refined room in the house. Featuring elevated design with natural materials, a private terrace or sitting area, and an atmosphere that truly reflects the sea. Wake up slowly — the view is worth it.",
      es: "La habitación más refinada de la casa. Con diseño elevado, materiales naturales, una terraza o sala privada y una atmósfera que refleja el mar. Despierta con calma — la vista lo vale.",
    },
  },
  {
    id: "upstairs-apartment",
    slug: "upstairs-apartment",
    index: 4,
    title: {
      en: "Upstairs Apartment",
      es: "Apartamento Superior",
    },
    tagline: {
      en: "Your private home by the sea",
      es: "Tu hogar privado junto al mar",
    },
    price: "S/ 180",
    priceNumeric: 180,
    capacity: {
      en: "Up to 5 guests",
      es: "Hasta 5 huéspedes",
    },
    bed: {
      en: "Multiple bedrooms",
      es: "Varias habitaciones",
    },
    featured: true,
    images: {
      hero: "/images/Appartment_Bedroom_View1.jpg",
      gallery: [
        {
          src: "/images/Appartment_Bedroom_View1.jpg",
          alt: {
            en: "Master bedroom with sea view",
            es: "Dormitorio principal con vista al mar",
          },
        },
        {
          src: "/images/Appartment_Bedroom.jpg",
          alt: {
            en: "Second bedroom in apartment",
            es: "Segundo dormitorio en el apartamento",
          },
        },
        {
          src: "/images/Appartment_Kitchen.jpg",
          alt: {
            en: "Fully equipped private kitchen",
            es: "Cocina privada completamente equipada",
          },
        },
        {
          src: "/images/Appartment_Bathroom.jpg",
          alt: {
            en: "Clean and modern private bathroom with tiled finishes",
            es: "Baño privado limpio y moderno con acabados de azulejos",
          },
        },
        {
          src: "/images/Appartment_Shower.jpg",
          alt: { en: "Spacious private shower", es: "Ducha privada amplia" },
        },
        {
          src: "/images/Upstairs_Couch.jpg",
          alt: {
            en: "Private living room with sofa",
            es: "Sala de estar privada con sofá",
          },
        },
      ],
    },
    amenities: {
      en: [
        "Private bathroom",
        "Wi-Fi",
        "Kitchen / kitchenette",
        "Living area",
        "Balcony or terrace",
        "Sea views",
        "Ideal for long stays",
      ],
      es: [
        "Baño privado",
        "Wi-Fi",
        "Cocina / kitchenette",
        "Sala de estar",
        "Balcón o terraza",
        "Vistas al mar",
        "Ideal para estadías largas",
      ],
    },
    desc: {
      en: "The entire upper floor is yours. The apartment offers multiple bedrooms, a living area, and a kitchen — perfect for families, groups of friends, or extended seaside stays. Step onto the terrace and breathe.",
      es: "Todo el piso superior es tuyo. El apartamento ofrece varias habitaciones, sala de estar y cocina — perfecto para familias, grupos de amigos o estadías largas junto al mar. Sal a la terraza y respira.",
    },
  },
]

export function getRoomBySlug(slug: string): RoomInfo | undefined {
  return roomsData.find((r) => r.slug === slug || r.id === slug)
}

export function getRoomByIndex(index: number): RoomInfo | undefined {
  return roomsData.find((r) => r.index === index)
}
