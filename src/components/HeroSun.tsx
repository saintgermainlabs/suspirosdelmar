export default function HeroSun() {
  return (
    <svg
      viewBox="0 0 800 800"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute left-1/2 top-1/2 w-[640px] max-w-none -translate-x-1/2 -translate-y-1/2 text-[#f4cb83] sm:w-[740px] lg:w-[800px]"
    >
      <circle cx="400" cy="400" r="310" fill="currentColor" fillOpacity="0.035" stroke="currentColor" strokeOpacity="0.65" strokeWidth="2" />
      <circle cx="400" cy="400" r="318" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
      <g stroke="currentColor" strokeOpacity="0.65" strokeWidth="2" strokeLinecap="round">
        {Array.from({ length: 40 }, (_, index) => (
          <line
            key={index}
            x1="400"
            y1="65"
            x2="400"
            y2={index % 2 === 0 ? "24" : "42"}
            transform={`rotate(${index * 9} 400 400)`}
          />
        ))}
      </g>
    </svg>
  )
}
