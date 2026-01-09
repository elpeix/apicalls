import { useState, useRef, useCallback } from 'react'
import { DEFAULT_COLLAPSE_THRESHOLD, DEFAULT_MAX_SIZE, DEFAULT_MIN_SIZE } from '../constants'
import type { CollapseDirection, DragState, PanelProps, UseResizeHandlerProps } from '../types'

function calculateLimits(p1: PanelProps, p2: PanelProps, startSize1: number, startSize2: number) {
  const minPct1 = p1.minSize ?? DEFAULT_MIN_SIZE
  const minPct2 = p2.minSize ?? DEFAULT_MIN_SIZE
  const maxPct1 = p1.maxSize ?? DEFAULT_MAX_SIZE
  const maxPct2 = p2.maxSize ?? DEFAULT_MAX_SIZE

  let limitMin1 = minPct1 - startSize1
  const limitMax1 = maxPct1 - startSize1

  const limitMin2 = startSize2 - maxPct2
  let limitMax2 = startSize2 - minPct2

  if (p1.collapsible) {
    const collapseDelta = (p1.collapsedSize ?? 0) - startSize1
    limitMin1 = Math.min(limitMin1, collapseDelta)
  }
  if (p2.collapsible) {
    const collapseDelta = startSize2 - (p2.collapsedSize ?? 0)
    limitMax2 = Math.max(limitMax2, collapseDelta)
  }

  return {
    globalMin: Math.max(limitMin1, limitMin2),
    globalMax: Math.min(limitMax1, limitMax2)
  }
}

function resolvePanel1Behavior(
  p1: PanelProps,
  startSize1: number,
  currentDelta: number,
  sessionCollapsed1: boolean,
  isHorizontal: boolean
) {
  const minPct1 = p1.minSize ?? DEFAULT_MIN_SIZE
  const maxPct1 = p1.maxSize ?? DEFAULT_MAX_SIZE
  const threshold1 = DEFAULT_COLLAPSE_THRESHOLD

  let resultDelta = currentDelta
  let pendingDir: CollapseDirection = null

  if (p1.collapsible) {
    const virtualSize1 = startSize1 + currentDelta

    if (sessionCollapsed1) {
      if (virtualSize1 < minPct1) {
        resultDelta = (p1.collapsedSize ?? 0) - startSize1
      }
    } else {
      if (virtualSize1 <= threshold1) {
        resultDelta = (p1.collapsedSize ?? 0) - startSize1
        pendingDir = isHorizontal ? 'north' : 'west'
      } else if (virtualSize1 < minPct1) {
        resultDelta = minPct1 - startSize1
        pendingDir = isHorizontal ? 'north' : 'west'
      }
    }
  } else {
    if (startSize1 + resultDelta < minPct1) {
      resultDelta = minPct1 - startSize1
    } else if (startSize1 + resultDelta > maxPct1) {
      resultDelta = maxPct1 - startSize1
    }
  }

  return { delta: resultDelta, pendingDir }
}

function resolvePanel2Behavior(
  p2: PanelProps,
  startSize2: number,
  currentDelta: number,
  sessionCollapsed2: boolean,
  isHorizontal: boolean
) {
  const minPct2 = p2.minSize ?? DEFAULT_MIN_SIZE
  const maxPct2 = p2.maxSize ?? DEFAULT_MAX_SIZE
  const threshold2 = DEFAULT_COLLAPSE_THRESHOLD

  let resultDelta = currentDelta
  let pendingDir: CollapseDirection = null

  if (p2.collapsible) {
    const virtualSize2 = startSize2 - currentDelta

    if (sessionCollapsed2) {
      if (virtualSize2 < minPct2) {
        resultDelta = startSize2 - (p2.collapsedSize ?? 0)
      }
    } else {
      if (virtualSize2 <= threshold2) {
        resultDelta = startSize2 - (p2.collapsedSize ?? 0)
        pendingDir = isHorizontal ? 'south' : 'east'
      } else if (virtualSize2 < minPct2) {
        resultDelta = startSize2 - minPct2
        pendingDir = isHorizontal ? 'south' : 'east'
      }
    }
  } else {
    if (startSize2 - resultDelta < minPct2) {
      resultDelta = startSize2 - minPct2
    } else if (startSize2 - resultDelta > maxPct2) {
      resultDelta = startSize2 - maxPct2
    }
  }

  return { delta: resultDelta, pendingDir }
}

export function useResizeHandler({
  sizes,
  setSizes,
  panelPropsList,
  orientation,
  containerRef,
  collapsedStates,
  setCollapsedStates,
  preCollapseSizesRef,
  onResizeStart,
  onResizeEnd,
  lastSizesRef,
  storageId,
  storageFn
}: UseResizeHandlerProps) {
  const [draggingSeparatorIndex, setDraggingSeparatorIndex] = useState<number | null>(null)
  const [collapseDirection, setCollapseDirection] = useState<CollapseDirection>(null)
  const isHorizontal = orientation === 'horizontal'

  const dragRef = useRef<DragState | null>(null)
  const sessionCollapsedStatesRef = useRef<boolean[]>([])
  const prevCollapsedStatesRef = useRef<boolean[]>([])

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      const drag = dragRef.current
      if (!drag) return

      const currentPos = isHorizontal ? e.clientY : e.clientX
      const deltaPx = currentPos - drag.startPos
      const panels = containerRef.current?.querySelectorAll(':scope > .sp_panel')
      let effectiveSize = 0
      panels?.forEach((p) => {
        const r = p.getBoundingClientRect()
        effectiveSize += isHorizontal ? r.height : r.width
      })
      const rect = containerRef.current?.getBoundingClientRect()
      const fallbackSize = isHorizontal ? (rect?.height ?? 100) : (rect?.width ?? 100)
      const containerSizePx = effectiveSize || fallbackSize

      const virtualDeltaPct = (deltaPx / containerSizePx) * 100

      const i = drag.index
      const p1 = panelPropsList[i]
      const p2 = panelPropsList[i + 1]
      const startSize1 = drag.startSizes[i]
      const startSize2 = drag.startSizes[i + 1]

      // 1. Calculate hard limits
      const { globalMin, globalMax } = calculateLimits(p1, p2, startSize1, startSize2)

      // 2. Resolve Behaviors
      let actualDelta = virtualDeltaPct
      let pendingDirection: CollapseDirection = null

      const res1 = resolvePanel1Behavior(
        p1,
        startSize1,
        actualDelta,
        sessionCollapsedStatesRef.current[i],
        isHorizontal
      )
      actualDelta = res1.delta
      if (res1.pendingDir) {
        pendingDirection = res1.pendingDir
      }

      // Update session state for P1
      if (p1.collapsible) {
        const minPct1 = p1.minSize ?? DEFAULT_MIN_SIZE
        const threshold1 = DEFAULT_COLLAPSE_THRESHOLD
        const virtualSize1 = startSize1 + virtualDeltaPct

        if (sessionCollapsedStatesRef.current[i]) {
          if (virtualSize1 >= minPct1) {
            sessionCollapsedStatesRef.current[i] = false
            actualDelta = virtualDeltaPct
          }
        } else {
          if (virtualSize1 <= threshold1) {
            sessionCollapsedStatesRef.current[i] = true
            // Clear history so we restore to defaultSize on expand
            preCollapseSizesRef.current[i] = p1.collapsedSize ?? 0
          }
        }
      }

      // -- Logic for P2 --
      const res2 = resolvePanel2Behavior(
        p2,
        startSize2,
        actualDelta,
        sessionCollapsedStatesRef.current[i + 1],
        isHorizontal
      )
      actualDelta = res2.delta
      if (res2.pendingDir) {
        pendingDirection = res2.pendingDir
      }

      // Update session state for P2
      if (p2.collapsible) {
        const minPct2 = p2.minSize ?? DEFAULT_MIN_SIZE
        const threshold2 = DEFAULT_COLLAPSE_THRESHOLD
        const rawVirtualSize2 = startSize2 - virtualDeltaPct

        if (sessionCollapsedStatesRef.current[i + 1]) {
          if (rawVirtualSize2 >= minPct2) {
            sessionCollapsedStatesRef.current[i + 1] = false
            actualDelta = virtualDeltaPct // Snap to cursor if expanding
          }
        } else {
          if (rawVirtualSize2 <= threshold2) {
            sessionCollapsedStatesRef.current[i + 1] = true
            // Clear history so we restore to defaultSize on expand
            preCollapseSizesRef.current[i + 1] = p2.collapsedSize ?? 0
          }
        }
      }

      // 3. Final Clamp
      if (actualDelta < globalMin) {
        actualDelta = globalMin
        pendingDirection = null
      } else if (actualDelta > globalMax) {
        actualDelta = globalMax
        pendingDirection = null
      }

      const newSizes = [...drag.startSizes]
      newSizes[i] = startSize1 + actualDelta
      newSizes[i + 1] = startSize2 - actualDelta

      // Snap to collapsed size if very close (fixes floating point precision issues)
      const SNAP_EPSILON = 1e-9
      const p1CollapsedSize = p1.collapsedSize ?? 0
      if (Math.abs(newSizes[i] - p1CollapsedSize) < SNAP_EPSILON) {
        newSizes[i] = p1CollapsedSize
      }
      const p2CollapsedSize = p2.collapsedSize ?? 0
      if (Math.abs(newSizes[i + 1] - p2CollapsedSize) < SNAP_EPSILON) {
        newSizes[i + 1] = p2CollapsedSize
      }

      // 4. Update collapsed states (external)
      const nextCollapsedStates = [...sessionCollapsedStatesRef.current]
      ;[i, i + 1].forEach((idx) => {
        const collapsedSize = panelPropsList[idx].collapsedSize ?? 0
        const isCollapsed = newSizes[idx] <= collapsedSize

        // Detect transitions and call callbacks only on change
        if (isCollapsed !== prevCollapsedStatesRef.current[idx]) {
          if (isCollapsed) {
            panelPropsList[idx].onCollapse?.()
          } else {
            panelPropsList[idx].onExpand?.()
          }
          prevCollapsedStatesRef.current[idx] = isCollapsed
        }
        nextCollapsedStates[idx] = isCollapsed
      })

      setCollapsedStates(nextCollapsedStates)

      // 5. Direction
      let dir: CollapseDirection = pendingDirection
      if (!dir) {
        if (nextCollapsedStates[i]) {
          dir = isHorizontal ? 'south' : 'east'
        } else if (nextCollapsedStates[i + 1]) {
          dir = isHorizontal ? 'north' : 'west'
        }
      }
      setCollapseDirection(dir)
      setSizes(newSizes)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      isHorizontal,
      panelPropsList,
      collapsedStates,
      setCollapsedStates,
      setSizes,
      preCollapseSizesRef
    ]
  )

  const onPointerUp = useCallback(
    function handlePointerUp() {
      const drag = dragRef.current
      if (!drag) return

      dragRef.current = null
      setDraggingSeparatorIndex(null)
      setCollapseDirection(null)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', handlePointerUp)

      const finalSizes = lastSizesRef.current
      if (storageId && storageFn) {
        storageFn.setItem(`simple-panels:${storageId}`, JSON.stringify(finalSizes))
      }
      onResizeEnd?.(finalSizes)
    },
    [onPointerMove, lastSizesRef, onResizeEnd, storageId, storageFn]
  )

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, separatorIndex: number) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const panels = containerRef.current.querySelectorAll(':scope > .sp_panel')
      let effectiveSize = 0
      panels.forEach((p) => {
        const r = p.getBoundingClientRect()
        effectiveSize += isHorizontal ? r.height : r.width
      })

      const containerSizePx = effectiveSize || (isHorizontal ? rect.height : rect.width)
      const startPos = isHorizontal ? e.clientY : e.clientX

      setDraggingSeparatorIndex(separatorIndex)

      dragRef.current = {
        index: separatorIndex,
        startPos,
        startSizes: [...sizes],
        containerSizePx,
        pointerId: e.pointerId
      }

      sessionCollapsedStatesRef.current = [...collapsedStates]
      prevCollapsedStatesRef.current = [...collapsedStates]
      onResizeStart?.()

      e.currentTarget.setPointerCapture(e.pointerId)

      window.addEventListener('pointermove', onPointerMove)
      window.addEventListener('pointerup', onPointerUp)
    },
    [containerRef, isHorizontal, sizes, collapsedStates, onResizeStart, onPointerMove, onPointerUp]
  )

  return {
    draggingSeparatorIndex,
    collapseDirection,
    onPointerDown,
    setDraggingSeparatorIndex
  }
}
