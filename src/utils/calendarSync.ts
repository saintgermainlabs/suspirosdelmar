export interface DateRange {
  start: Date
  end: Date
  summary?: string
}

/**
 * Parses iCal (.ics) text format (from Airbnb/Booking.com export feeds)
 * and returns array of occupied date ranges.
 */
export function parseICSCalendar(icsData: string): DateRange[] {
  const events: DateRange[] = []
  const lines = icsData.split(/\r\n|\n|\r/)

  let inEvent = false
  let currentStart: Date | null = null
  let currentEnd: Date | null = null
  let currentSummary = ""

  for (const line of lines) {
    if (line.startsWith("BEGIN:VEVENT")) {
      inEvent = true
      currentStart = null
      currentEnd = null
      currentSummary = ""
    } else if (line.startsWith("END:VEVENT")) {
      if (inEvent && currentStart && currentEnd) {
        events.push({
          start: currentStart,
          end: currentEnd,
          summary: currentSummary,
        })
      }
      inEvent = false
    } else if (inEvent) {
      if (line.startsWith("DTSTART")) {
        const val = line.split(":")[1]
        currentStart = parseICSDate(val)
      } else if (line.startsWith("DTEND")) {
        const val = line.split(":")[1]
        currentEnd = parseICSDate(val)
      } else if (line.startsWith("SUMMARY")) {
        currentSummary = line.split(":")[1] || ""
      }
    }
  }

  return events
}

function parseICSDate(str?: string): Date | null {
  if (!str) return null
  // Format YYYYMMDD or YYYYMMDDTHHMMSSZ
  const cleaned = str.replace(/[^0-9]/g, "")
  if (cleaned.length < 8) return null

  const year = parseInt(cleaned.substring(0, 4), 10)
  const month = parseInt(cleaned.substring(4, 6), 10) - 1
  const day = parseInt(cleaned.substring(6, 8), 10)

  return new Date(year, month, day)
}

/**
 * Checks if a proposed check-in/check-out range overlaps with any occupied range.
 */
export function isRangeOccupied(
  checkinStr: string,
  checkoutStr: string,
  occupiedRanges: DateRange[],
): boolean {
  if (!checkinStr || !checkoutStr) return false
  const targetStart = new Date(checkinStr)
  const targetEnd = new Date(checkoutStr)

  if (isNaN(targetStart.getTime()) || isNaN(targetEnd.getTime())) return false

  return occupiedRanges.some((range) => {
    return targetStart < range.end && targetEnd > range.start
  })
}
