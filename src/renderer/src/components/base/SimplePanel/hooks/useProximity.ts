import { useState, useEffect, useCallback, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { UseProximityProps } from '../types'

export function useProximity({
  containerRef,
  orientation,
  proximityThreshold,
  draggingSeparatorIndex,
  collapseDirection,
  collapsedStates
}: UseProximityProps) {
  const [activeSeparatorIndex, setActiveSeparatorIndex] = useState<number | null>(null)
  const isHorizontal = orientation === 'horizontal'

  // eslint-disable-next-line react-hooks/purity
  const ownerIdRef = useRef(`sep-owner-${Math.random().toString(36).slice(2)}`)

  const axisAttr = isHorizontal ? 'data-active-sep-y' : 'data-active-sep-x'
  const ownerAttr = isHorizontal ? 'data-active-sep-y-owner' : 'data-active-sep-x-owner'

  const onContainerPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      // If we are dragging, we don't need proximity detection
      if (draggingSeparatorIndex !== null || !containerRef.current) {
        if (activeSeparatorIndex !== null) {
          setActiveSeparatorIndex(null)
        }
        return
      }

      const currentOwner = document.body.getAttribute(ownerAttr)
      if (currentOwner && currentOwner !== ownerIdRef.current) {
        if (activeSeparatorIndex !== null) {
          setActiveSeparatorIndex(null)
        }
        return
      }

      const rect = containerRef.current.getBoundingClientRect()
      const pointerPos = isHorizontal ? e.clientY : e.clientX
      const containerPos = isHorizontal ? rect.top : rect.left
      const relativePos = pointerPos - containerPos

      // Iterate through DOM children to find separators and measure their actual position
      const children = Array.from(containerRef.current.children)
      let foundIndex: number | null = null

      for (const child of children) {
        const indexStr = (child as HTMLElement).getAttribute('data-index')
        if (indexStr !== null) {
          const index = parseInt(indexStr, 10)
          const rect = child.getBoundingClientRect()

          let sepPos = 0
          if (isHorizontal) {
            sepPos = rect.top + rect.height / 2 - containerPos
          } else {
            sepPos = rect.left + rect.width / 2 - containerPos
          }

          if (Math.abs(relativePos - sepPos) <= proximityThreshold) {
            foundIndex = index
            break
          }
        }
      }

      if (foundIndex !== activeSeparatorIndex) {
        setActiveSeparatorIndex(foundIndex)
      }
    },
    [
      containerRef,
      isHorizontal,
      activeSeparatorIndex,
      proximityThreshold,
      ownerAttr,
      draggingSeparatorIndex
    ]
  )

  const onContainerPointerLeave = useCallback(() => {
    setActiveSeparatorIndex(null)
  }, [])

  // Sync active state with global cursor
  useEffect(() => {
    const currentOwnerId = ownerIdRef.current
    let hoverDirection = collapseDirection
    if (!hoverDirection && activeSeparatorIndex !== null && !draggingSeparatorIndex) {
      // If not dragging, check if we are simply hovering over a collapsed panel separator
      const i = activeSeparatorIndex
      if (collapsedStates[i]) {
        hoverDirection = isHorizontal ? 'south' : 'east'
      } else if (collapsedStates[i + 1]) {
        hoverDirection = isHorizontal ? 'north' : 'west'
      }
    }

    const value = hoverDirection || 'true'
    if (
      (activeSeparatorIndex !== null && !draggingSeparatorIndex) ||
      draggingSeparatorIndex !== null
    ) {
      document.body.setAttribute(axisAttr, value)
      document.body.setAttribute(ownerAttr, currentOwnerId)
    } else {
      if (document.body.getAttribute(ownerAttr) === currentOwnerId) {
        document.body.removeAttribute(axisAttr)
        document.body.removeAttribute(ownerAttr)
      }
    }
    return () => {
      if (document.body.getAttribute(ownerAttr) === currentOwnerId) {
        document.body.removeAttribute(axisAttr)
        document.body.removeAttribute(ownerAttr)
      }
    }
  }, [
    activeSeparatorIndex,
    isHorizontal,
    draggingSeparatorIndex,
    collapseDirection,
    collapsedStates,
    axisAttr,
    ownerAttr
  ])

  return {
    activeSeparatorIndex,
    setActiveSeparatorIndex,
    onContainerPointerMove,
    onContainerPointerLeave
  }
}
