import React, { useEffect, useMemo, useState } from 'react'

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

  const handleEndScroll = useMemo(() => {
    let timeout: NodeJS.Timeout
    return () => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        setIsScrolling(false)
        if (onEndScroll) {
          onEndScroll()
        }
      }, 100)
    }
  }, [onEndScroll])

  const handleScroll = () => {
    setIsScrolling(true)
    handleEndScroll()
  }

  useEffect(() => {
    if (!isScrolling) {
      return
    }
    if (onStartScroll) {
      onStartScroll()
    }
  }, [isScrolling, onStartScroll])

  return (
    <div className={className} onScroll={handleScroll}>
      {children}
    </div>
  )
}
