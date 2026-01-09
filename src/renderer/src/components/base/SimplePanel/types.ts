import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode, RefObject } from 'react'

export type Orientation = 'horizontal' | 'vertical'

export type CollapseDirection = 'north' | 'south' | 'east' | 'west' | null

export interface GroupHandle {
  collapse: (index: number) => void
  expand: (index: number) => void
  setSizes: (sizes: number[]) => void
  getSizes: () => number[]
  getCollapsedStates: () => boolean[]
  getOrientation: () => Orientation
  getSeparatorPositions: () => number[]
}

export interface StorageAdapter {
  getItem: (name: string) => string | null
  setItem: (name: string, value: string) => void
}

export type StorageSetter = Pick<StorageAdapter, 'setItem'>

export interface GroupProps {
  children: ReactNode
  orientation?: Orientation
  sizes?: number[]
  onSizesChange?: (sizes: number[]) => void
  onResizeStart?: () => void
  onResizeEnd?: (sizes: number[]) => void
  storageId?: string
  storage?: StorageAdapter
  className?: string
  style?: CSSProperties
  proximityThreshold?: number
}

export interface PanelHandle {
  collapse: () => void
  expand: () => void
  getSize: () => number
  isCollapsed: () => boolean
}

export interface PanelProps {
  children: ReactNode
  defaultSize?: number
  minSize?: number
  maxSize?: number
  collapsible?: boolean
  onCollapse?: () => void
  onExpand?: () => void
  collapsedSize?: number
  className?: string
  style?: CSSProperties
  _onCollapse?: () => void
  _onExpand?: () => void
  _collapsed?: boolean
  _index?: number
  defaultCollapsed?: boolean
  _collapseProxy?: (index: number) => void
  _expandProxy?: (index: number) => void
  _size?: number
}

export interface SeparatorProps {
  index?: number
  orientation?: Orientation
  onPointerDown?: (e: ReactPointerEvent<HTMLDivElement>, index: number) => void
  onDoubleClick?: (e: React.MouseEvent<HTMLDivElement>, index: number) => void
  style?: CSSProperties
  className?: string
  isDragging?: boolean
  isActive?: boolean
}

export interface UseLayoutStateProps {
  sizes?: number[]
  onSizesChange?: (sizes: number[]) => void
  panelPropsList: PanelProps[]
  storageId?: string
  storage: StorageAdapter
  numPanels: number
}

export interface UseProximityProps {
  containerRef: RefObject<HTMLDivElement | null>
  orientation: Orientation
  proximityThreshold: number
  draggingSeparatorIndex: number | null
  collapseDirection: CollapseDirection
  collapsedStates: boolean[]
}

export interface UseResizeHandlerProps {
  sizes: number[]
  setSizes: (sizes: number[]) => void
  panelPropsList: PanelProps[]
  orientation: Orientation
  containerRef: RefObject<HTMLDivElement | null>
  collapsedStates: boolean[]
  setCollapsedStates: (states: boolean[]) => void
  preCollapseSizesRef: RefObject<number[]>
  onResizeStart?: () => void
  onResizeEnd?: (sizes: number[]) => void
  lastSizesRef: RefObject<number[]>
  storageId?: string
  storageFn?: StorageSetter
}

export interface DragState {
  index: number
  startPos: number
  startSizes: number[]
  containerSizePx: number
  pointerId: number
}
