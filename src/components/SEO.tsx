import { useEffect } from "react"
import { useLang } from "../LanguageContext"
import { updateSEO, type SEOConfig } from "../utils/seo"

export default function SEO(props: Omit<SEOConfig, "lang">) {
  const { lang } = useLang()

  useEffect(() => {
    updateSEO({ ...props, lang })
  }, [props.title, props.description, props.url, props.image, props.noindex, lang])

  return null
}
