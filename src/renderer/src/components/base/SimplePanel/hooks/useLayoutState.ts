import { useState, useRef, useEffect, useCallback } from 'react'
import { DEFAULT_COLLAPSE_THRESHOLD, DEFAULT_MIN_SIZE } from '../constants'
import type { UseLayoutStateProps } from '../types'

export function useLayoutState({
  sizes: controlledSizes,
  onSizesChange,
  panelPropsList,
  storageId,
  storage,
  numPanels
}: UseLayoutStateProps) {
  function calculateInitialSizes() {
    // 1. Try storage
    if (storageId) {
      const saved = storage.getItem(`simple-panels:${storageId}`)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length === numPanels) {
            return parsed
          }
        } catch (e) {
          console.warn('Failed to parse saved layout sizes', e)
        }
      }
    }

    // 2. Calculate based on defaultCollapsed and size prop
    const calculatedSizes = new Array(numPanels).fill(0)
    const dynamicPanelsIndices: number[] = []
    let usedSize = 0

    for (let i = 0; i < numPanels; i++) {
      const p = panelPropsList[i]
      if (p?.defaultCollapsed) {
        const s = p.collapsedSize ?? 0
        calculatedSizes[i] = s
        usedSize += s
      } else if (p?.defaultSize !== undefined) {
        calculatedSizes[i] = p.defaultSize
        usedSize += p.defaultSize
      } else {
        dynamicPanelsIndices.push(i)
      }
    }

    if (dynamicPanelsIndices.length > 0) {
      const remainingSize = Math.max(0, 100 - usedSize)
      const sizePerDynamic = remainingSize / dynamicPanelsIndices.length
      dynamicPanelsIndices.forEach((index) => {
        calculatedSizes[index] = sizePerDynamic
      })
    }

    return calculatedSizes
  }

  const [internalSizes, setInternalSizes] = useState<number[]>(() => {
    if (controlledSizes) return []
    return calculateInitialSizes()
  })

  // Derive initial collapsed states for the first render
  const [collapsedStates, setCollapsedStates] = useState<boolean[]>(() => {
    const initialSizes =
      controlledSizes ?? (internalSizes.length > 0 ? internalSizes : calculateInitialSizes())
    return initialSizes.map((s, idx) => s <= (panelPropsList[idx]?.collapsedSize ?? 0))
  })

  // Track previous panel count to detect changes during render
  const [prevNumPanels, setPrevNumPanels] = useState(numPanels)

  // Adjust state during render if panel count changes (prevents cascading renders)
  if (numPanels !== prevNumPanels) {
    const newSizes = calculateInitialSizes()
    setPrevNumPanels(numPanels)
    setInternalSizes(newSizes)
    setCollapsedStates(newSizes.map((s, idx) => s <= (panelPropsList[idx]?.collapsedSize ?? 0)))
  }

  // We still need a ref to track if we need to notify parent about initial sizes
  const initializedRef = useRef(false)

  const stateRef = useRef({
    onSizesChange,
    controlledSizes,
    setInternalSizes,
    panelPropsList,
    setCollapsedStates
  })

  useEffect(() => {
    stateRef.current = {
      onSizesChange,
      controlledSizes,
      setInternalSizes,
      panelPropsList,
      setCollapsedStates
    }
  }, [onSizesChange, controlledSizes, panelPropsList])

  const sizes = controlledSizes ?? internalSizes
  const lastSizesRef = useRef<number[]>(sizes)

  const [initialPreCollapseSizes] = useState<number[]>(sizes)

  const preCollapseSizesRef = useRef<number[]>(initialPreCollapseSizes)

  const setSizes = useCallback((newSizes: number[]) => {
    if (stateRef.current.onSizesChange) stateRef.current.onSizesChange(newSizes)
    if (!stateRef.current.controlledSizes) stateRef.current.setInternalSizes(newSizes)

    // Derived state: update collapsed states
    const nextCollapsedStates = newSizes.map(
      (s, idx) => s <= (stateRef.current.panelPropsList[idx].collapsedSize ?? 0)
    )
    stateRef.current.setCollapsedStates(nextCollapsedStates)
  }, [])

  // Persist to storage with debounce to avoid writing on every frame during drag
  useEffect(() => {
    if (!storageId) return

    const handler = setTimeout(() => {
      storage.setItem(`simple-panels:${storageId}`, JSON.stringify(sizes))
    }, 500)

    return () => clearTimeout(handler)
  }, [sizes, storage, storageId])

  // Handle side effects: Validation, notifications, and ref updates
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true
      if (onSizesChange) {
        onSizesChange(sizes)
      }
    } else {
      if (sizes.length !== lastSizesRef.current.length) {
        preCollapseSizesRef.current = sizes
        if (onSizesChange) onSizesChange(sizes)
      }
    }

    lastSizesRef.current = sizes
  }, [sizes, onSizesChange])

  const round = (num: number) => Math.round(num * 10000000000) / 10000000000

  const collapsePanel = useCallback(
    (index: number) => {
      const currentSizes = [...lastSizesRef.current]
      const panel = panelPropsList[index]
      const collapsedSize = panel.collapsedSize ?? 0

      if (currentSizes[index] > collapsedSize) {
        preCollapseSizesRef.current[index] = currentSizes[index]
        const diff = currentSizes[index] - collapsedSize
        currentSizes[index] = collapsedSize

        const targetIndex = index === numPanels - 1 ? index - 1 : index + 1
        currentSizes[targetIndex] = round(currentSizes[targetIndex] + diff)

        setSizes(currentSizes)
        panel.onCollapse?.()
      }
    },
    [numPanels, panelPropsList, setSizes]
  )

  const expandPanel = useCallback(
    (index: number) => {
      const currentSizes = [...lastSizesRef.current]
      const panel = panelPropsList[index]
      const collapsedSize = panel.collapsedSize ?? 0

      if (currentSizes[index] <= collapsedSize) {
        const effectiveMinSize = panel.minSize ?? DEFAULT_MIN_SIZE
        const sizeFromProps = panel.defaultSize ?? DEFAULT_COLLAPSE_THRESHOLD
        const defaultRestoredSize = Math.max(sizeFromProps, effectiveMinSize)

        const restoredSize =
          preCollapseSizesRef.current[index] > collapsedSize
            ? preCollapseSizesRef.current[index]
            : defaultRestoredSize

        let diff = restoredSize - currentSizes[index]

        const targetIndex = index === numPanels - 1 ? index - 1 : index + 1
        const targetPanel = panelPropsList[targetIndex]
        const targetMinSize = targetPanel.minSize ?? DEFAULT_MIN_SIZE

        const maxYield = Math.max(0, currentSizes[targetIndex] - targetMinSize)

        if (diff > maxYield) {
          diff = maxYield
        }

        currentSizes[index] = round(currentSizes[index] + diff)
        currentSizes[targetIndex] = round(currentSizes[targetIndex] - diff)

        setSizes(currentSizes)
        panel.onExpand?.()
      }
    },
    [numPanels, panelPropsList, setSizes]
  )

  return {
    sizes,
    setSizes,
    collapsedStates,
    setCollapsedStates,
    preCollapseSizesRef,
    collapsePanel,
    expandPanel,
    lastSizesRef
  }
}
