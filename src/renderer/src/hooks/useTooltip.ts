import { useState, useEffect } from 'react'
import { useDebounce } from './useDebounce'
type TooltipType = {
  text: string
  top: number
  right: number
  bottom: number
  left: number
  width: number
  height: number
}

const TOOLTIP_TIMEOUT = 400
const TOOLTIP_DATA = 'data-tooltip-timeout'

export const useTooltip = () => {
  const [tooltip, setTooltip] = useState<TooltipType | null>(null)
  const debouncedTooltip = useDebounce<TooltipType | null>(
    tooltip,
    Number(document.querySelector('body')?.getAttribute(TOOLTIP_DATA)) || TOOLTIP_TIMEOUT,
    100
  )

  useEffect(() => {
    const handleMouseOver = (event: MouseEvent) => {
      const target = (event.target as HTMLElement).closest('[title]')
      if (target instanceof HTMLElement && target.hasAttribute('title')) {
        const title = target.getAttribute('title')
        if (title) {
          target.setAttribute('data-original-title', title)
          target.removeAttribute('title')

          const rect = target.getBoundingClientRect()
          const offsetY = Number(target.getAttribute('data-tooltip-offset-y')) || 0
          const offsetX = Number(target.getAttribute('data-tooltip-offset-x')) || 0
          setTooltip({
            text: title,
            top: rect.top + window.scrollY + offsetY,
            right: rect.right + window.scrollX + offsetX,
            bottom: rect.bottom + window.scrollY + offsetY,
            left: rect.left + window.scrollX + offsetX,
            width: rect.width,
            height: rect.height
          })
        }
      }
    }

    const handleMouseOut = (event: MouseEvent) => {
      const target = (event.target as HTMLElement).closest('[data-original-title]')
      if (target instanceof HTMLElement && target.hasAttribute('data-original-title')) {
        target.setAttribute('title', target.getAttribute('data-original-title')!) // Restablim el títol original
        target.removeAttribute('data-original-title')
      }
      setTooltip(null)
    }

    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mouseout', handleMouseOut)

    return () => {
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)
    }
  }, [tooltip])

  const timeout = debouncedTooltip === null ? TOOLTIP_TIMEOUT : 1
  document.querySelector('body')?.setAttribute(TOOLTIP_DATA, timeout.toString())
  return debouncedTooltip as TooltipType
}
