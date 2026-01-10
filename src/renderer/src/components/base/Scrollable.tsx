import React, { useState } from 'react'

export default function Scrollable({
  className,
  onStartScroll,
  onEndScroll,
  children
}: {
  className?: string
  onStartScroll?: () => void
  onEndScroll?: () => void
  children: React.ReactNode
}) {
  const [isScrolling, setIsScrolling] = useState(false)

  const timeoutRef = React.useRef<NodeJS.Timeout>(null)

  const handleScroll = () => {
    setIsScrolling(true)
    if (onStartScroll && !isScrolling) {
      onStartScroll()
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setIsScrolling(false)
      if (onEndScroll) {
        onEndScroll()
      }
    }, 100)
  }

  return (
    <div className={className} onScroll={handleScroll}>
      {children}
    </div>
  )
}
