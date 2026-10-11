import { useEffect, useState } from "react"
import { useLang } from "../LanguageContext"

export default function HoldCountdown({ expiresAt }: { expiresAt: string }) {
  const { tr } = useLang()
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  const seconds = Math.max(0, Math.floor((Date.parse(expiresAt) - now) / 1000))
  return <p className="text-sm text-[#6b6355]">{tr.payments.countdown}: <span className="font-semibold tabular-nums">{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</span></p>
}
