import { useId } from "react"

export default function HeroSun() {
  const tintId = useId()

  return (
    <svg
      viewBox="0 0 1000 1000"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute left-1/2 top-1/2 w-[800px] max-w-none -translate-x-1/2 -translate-y-1/2 text-[#f4cb83] sm:w-[980px] lg:w-[1080px]"
    >
      <defs>
        <radialGradient id={tintId}>
          <stop offset="0" stopColor="#efb956" stopOpacity="0.06" />
          <stop offset="0.75" stopColor="#efb956" stopOpacity="0.1" />
          <stop offset="1" stopColor="#f4cb83" stopOpacity="0.18" />
        </radialGradient>
      </defs>

      <circle cx="500" cy="500" r="350" fill={`url(#${tintId})`} />
      <g stroke="currentColor">
        <circle cx="500" cy="500" r="350" strokeOpacity="0.8" strokeWidth="4" />
        <circle cx="500" cy="500" r="339" strokeOpacity="0.4" strokeWidth="2.5" />
        <circle cx="500" cy="500" r="364" strokeOpacity="0.55" strokeWidth="3" />
        <circle cx="500" cy="500" r="357" strokeOpacity="0.45" strokeWidth="2.5" strokeDasharray="1 13" strokeLinecap="round" />
      </g>

      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {Array.from({ length: 32 }, (_, index) => (
          <g key={index} transform={`rotate(${index * 11.25} 500 500)`}>
            {index % 2 === 0 ? (
              <>
                <path
                  d="M 500 124 C 477 101 482 75 500 34 C 518 75 523 101 500 124 Z"
                  fill="currentColor"
                  fillOpacity="0.06"
                  strokeOpacity="0.75"
                  strokeWidth="3.5"
                />
                <path
                  d="M 500 119 C 510 95 489 78 500 48"
                  strokeOpacity="0.55"
                  strokeWidth="2.5"
                />
              </>
            ) : (
              <path
                d="M 500 123 C 476 108 480 88 500 76 C 520 64 517 45 505 35"
                strokeOpacity="0.7"
                strokeWidth="4"
              />
            )}
            <path
              d="M 494 132 L 500 125 L 506 132 L 500 139 Z"
              fill="currentColor"
              fillOpacity="0.45"
              strokeOpacity="0.65"
              strokeWidth="2"
            />
          </g>
        ))}
      </g>
    </svg>
  )
}
