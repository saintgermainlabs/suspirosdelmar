import { getRoomByIndex } from "./roomsData"

/**
 * TidyCal booking calendars — the ONE place to map rooms to calendars.
 *
 * Keys are the `id` values from `src/data/roomsData.ts`. Values are the
 * TidyCal booking-type slug under the account path below, i.e. the last part
 * of https://tidycal.com/smc/<slug>. Any room left empty (or unknown) uses
 * TIDYCAL_FALLBACK_SLUG, so swapping in a real calendar is a one-line change.
 */
export const TIDYCAL_ACCOUNT = "smc"
export const TIDYCAL_FALLBACK_SLUG = "habitacion-doble-test"

export const tidycalSlugs: Record<string, string> = {
  "sea-breeze": "habitacion-brisa-del-mar",
  "double-sunset": "habitacion-doble-atardecer",
  "family-shore": "habitacion-familiar-orilla",
  "ocean-calm": "habitacion-calma-oceanica",
  "upstairs-apartment": "apartamento-superior",
}

export function getTidycalSlug(roomId?: string | null): string {
  return (roomId && tidycalSlugs[roomId]) || TIDYCAL_FALLBACK_SLUG
}

/** Room id for a booking-form room index ("" or invalid → undefined). */
export function roomIdFromIndex(roomIndex?: string | null): string | undefined {
  if (roomIndex === undefined || roomIndex === null || roomIndex === "") {
    return undefined
  }
  return getRoomByIndex(Number(roomIndex))?.id
}

export function getTidycalUrl(roomId?: string | null, embed = true): string {
  const base = `https://tidycal.com/${TIDYCAL_ACCOUNT}/${getTidycalSlug(roomId)}`
  return embed ? `${base}?embed=1` : base
}
