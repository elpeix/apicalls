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
const TOOLTIP_FAST = 1

export const useTooltip = () => {
  const [tooltip, setTooltip] = useState<TooltipType | null>(null)
  const [hasRecentTooltip, setHasRecentTooltip] = useState(false)

  // Use fast timeout if we recently had a tooltip (for quick transitions between elements)
  const debounceDelay = hasRecentTooltip ? TOOLTIP_FAST : TOOLTIP_TIMEOUT
  const debouncedTooltip = useDebounce<TooltipType | null>(tooltip, debounceDelay, 100)

  // Track if we recently showed a tooltip
  if ((debouncedTooltip !== null) !== hasRecentTooltip) {
    setHasRecentTooltip(debouncedTooltip !== null)
  }

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
        if (!target.hasAttribute('title')) {
          target.setAttribute('title', target.getAttribute('data-original-title')!)
        }
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
  }, [])

  return debouncedTooltip as TooltipType
}
