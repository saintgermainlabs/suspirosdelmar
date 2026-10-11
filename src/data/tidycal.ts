import { getRoomByIndex } from "./roomsData"

export const TIDYCAL_PATH = "smc/meeting"

/** Room id for a booking-form room index ("" or invalid → undefined). */
export function roomIdFromIndex(roomIndex?: string | null): string | undefined {
  if (roomIndex === undefined || roomIndex === null || roomIndex === "") {
    return undefined
  }
  return getRoomByIndex(Number(roomIndex))?.id
}

export function getTidycalUrl(embed = true): string {
  const base = `https://tidycal.com/${TIDYCAL_PATH}`
  return embed ? `${base}?embed=1` : base
}
