import React, { useMemo, useRef, forwardRef, useImperativeHandle, useEffect } from 'react'
import { DEFAULT_PROXIMITY_THRESHOLD } from '../constants'
import { useLayoutState } from '../hooks/useLayoutState'
import { useProximity } from '../hooks/useProximity'
import { useResizeHandler } from '../hooks/useResizeHandler'
import { Panel } from './Panel'
import { Separator } from './Separator'

import type { GroupHandle, GroupProps, PanelProps, SeparatorProps, StorageAdapter } from '../types'

export type { GroupHandle, GroupProps, Orientation, StorageAdapter } from '../types'

const defaultStorage: StorageAdapter = {
  getItem: (name: string) => localStorage.getItem(name),
  setItem: (name: string, value: string) => localStorage.setItem(name, value)
}

export const Group = forwardRef<GroupHandle, GroupProps>(
  (
    {
      children,
      orientation = 'horizontal',
      sizes: controlledSizes,
      onSizesChange,
      onResizeStart,
      onResizeEnd,
      storageId,
      storage = defaultStorage,
      className,
      style,
      proximityThreshold = DEFAULT_PROXIMITY_THRESHOLD
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null)

    // Extract Panel Props
    const childrenArray = React.Children.toArray(children)
    const panelPropsList = useMemo(() => {
      const props: PanelProps[] = []
      childrenArray.forEach((child) => {
        if (React.isValidElement(child) && child.type === Panel) {
          props.push(child.props as PanelProps)
        }
      })

      return props
    }, [childrenArray])

    const separatorPropsList = useMemo(() => {
      const props: SeparatorProps[] = []
      childrenArray.forEach((child) => {
        if (React.isValidElement(child) && child.type === Separator) {
          props.push(child.props as SeparatorProps)
        }
      })
      return props
    }, [childrenArray])

    const numPanels = panelPropsList.length

    useEffect(() => {
      if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
        const kids = React.Children.toArray(children)
        for (let i = 0; i < kids.length - 1; i++) {
          const current = kids[i]
          const next = kids[i + 1]
          if (
            React.isValidElement(current) &&
            current.type === Panel &&
            React.isValidElement(next) &&
            next.type === Panel
          ) {
            console.warn(
              'SimplePanels Warning: Two Panels are adjacent without a Separator. Resizing will not work correctly for these panels.'
            )
          }
        }
      }
    }, [children])

    // Hook: Layout State
    const {
      sizes,
      setSizes,
      collapsedStates,
      setCollapsedStates,
      preCollapseSizesRef,
      collapsePanel,
      expandPanel,
      lastSizesRef
    } = useLayoutState({
      sizes: controlledSizes,
      onSizesChange,
      panelPropsList,
      storageId,
      storage,
      numPanels
    })

    // Hook: Resize Logic
    const { draggingSeparatorIndex, collapseDirection, onPointerDown } = useResizeHandler({
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
      storageFn: storage
    })

    // Hook: Proximity
    const { activeSeparatorIndex, onContainerPointerMove, onContainerPointerLeave } = useProximity({
      containerRef,
      orientation,
      proximityThreshold,
      draggingSeparatorIndex,
      collapseDirection,
      collapsedStates
    })

    useImperativeHandle(ref, () => ({
      collapse: collapsePanel,
      expand: expandPanel,
      setSizes,
      getSizes: () => lastSizesRef.current,
      getCollapsedStates: () => collapsedStates,
      getOrientation: () => orientation,
      getSeparatorPositions: () => {
        if (!containerRef.current) {
          return []
        }
        const rect = containerRef.current.getBoundingClientRect()
        const positions: number[] = []
        let currentPct = 0
        const sizesSnapshot = lastSizesRef.current
        for (let i = 0; i < sizesSnapshot.length - 1; i++) {
          currentPct += sizesSnapshot[i]
          if (orientation === 'vertical') {
            positions.push(rect.left + (currentPct / 100) * rect.width)
          } else {
            positions.push(rect.top + (currentPct / 100) * rect.height)
          }
        }
        return positions
      }
    }))

    const lastClickTimeRef = useRef(0)

    function onContainerPointerDown(e: React.PointerEvent<HTMLDivElement>) {
      if (activeSeparatorIndex !== null) {
        onPointerDown(e, activeSeparatorIndex)

        const now = Date.now()
        if (now - lastClickTimeRef.current < 300) {
          const sepProps = separatorPropsList[activeSeparatorIndex]
          if (sepProps?.onDoubleClick) {
            sepProps.onDoubleClick(
              e as unknown as React.MouseEvent<HTMLDivElement>,
              activeSeparatorIndex
            )
          }
        }
        lastClickTimeRef.current = now
      }
    }

    let panelCounter = 0
    let separatorCounter = 0

    return (
      <div
        ref={containerRef}
        className={`sp_group ${className}`}
        style={{
          display: 'flex',
          flexDirection: orientation === 'horizontal' ? 'column' : 'row',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          ...style
        }}
        onPointerMove={onContainerPointerMove}
        onPointerDown={onContainerPointerDown}
        onPointerLeave={onContainerPointerLeave}
      >
        {childrenArray.map((child, index) => {
          if (React.isValidElement(child)) {
            if (child.type === Panel) {
              const size = sizes[panelCounter] ?? 100 / numPanels
              const currentIndex = panelCounter
              const panel = React.cloneElement(child as React.ReactElement<PanelProps>, {
                ...(child.props as PanelProps),
                _size: size,
                _index: currentIndex,
                _collapseProxy: collapsePanel,
                _expandProxy: expandPanel,
                _collapsed: collapsedStates[currentIndex]
              })
              panelCounter++
              return React.cloneElement(panel, { key: `panel-${index}` })
            }

            if (child.type === Separator) {
              const sep = React.cloneElement(child as React.ReactElement<SeparatorProps>, {
                index: separatorCounter,
                orientation,
                onPointerDown,
                isDragging: draggingSeparatorIndex === separatorCounter,
                isActive: activeSeparatorIndex === separatorCounter
              })
              separatorCounter++
              return React.cloneElement(sep, { key: `sep-${index}` })
            }
          }
          return child
        })}
      </div>
    )
  }
)

Group.displayName = 'Group'
