import type { ImgHTMLAttributes } from "react"

export default function SiteImage({
  src,
  alt,
  loading = "lazy",
  decoding = "async",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  let srcSet: string | undefined
  if (src?.startsWith("https://images.unsplash.com/")) {
    const original = new URL(src)
    const width = Number(original.searchParams.get("w")) || 1600
    const height = Number(original.searchParams.get("h"))
    srcSet = [400, 800, 1200, 1600].filter((size) => size <= width).map((size) => {
      const variant = new URL(src)
      variant.searchParams.set("w", String(size))
      if (height) variant.searchParams.set("h", String(Math.round(size * height / width)))
      variant.searchParams.set("auto", "format")
      variant.searchParams.set("q", "75")
      return `${variant.href} ${size}w`
    }).join(", ")
  }

  return <img src={src} alt={alt} loading={loading} decoding={decoding} sizes={srcSet ? sizes : undefined} srcSet={srcSet} {...props} />
}
