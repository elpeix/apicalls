import React from 'react'
import type { PanelHandle, PanelProps } from '../types'

export type { PanelHandle, PanelProps } from '../types'

export const Panel = React.memo(
  React.forwardRef<PanelHandle, PanelProps>(
    (
      {
        children,
        defaultSize,
        onCollapse,
        className,
        style,
        _onExpand,
        _collapsed,
        _index,
        _collapseProxy,
        _expandProxy,
        defaultCollapsed,
        _size
      },
      ref
    ) => {
      React.useImperativeHandle(
        ref,
        () => ({
          collapse: () => {
            if (_collapseProxy && _index !== undefined) {
              _collapseProxy(_index)
            } else {
              onCollapse?.() // Changed from _onCollapse to onCollapse
            }
          },
          expand: () => {
            if (_expandProxy && _index !== undefined) {
              _expandProxy(_index)
            } else {
              _onExpand?.()
            }
          },
          getSize: () => {
            return _size ?? defaultSize ?? 0
          },
          isCollapsed: () => !!_collapsed
        }),
        [
          onCollapse,
          defaultSize,
          _collapsed,
          _index,
          _collapseProxy,
          _expandProxy,
          _size,
          _onExpand
        ]
      )

      const isPanelCollapsed = _collapsed ?? defaultCollapsed ?? false

      const flexBasis = _size !== undefined ? `${_size} ${_size} 0%` : '1 1 0%'

      const panelStyle: React.CSSProperties = {
        flex: flexBasis,
        minWidth: 0,
        minHeight: 0,
        ...style
      }

      return (
        <div
          className={`sp_panel ${isPanelCollapsed ? 'sp_panel-collapsed' : ''} ${className}`}
          style={panelStyle}
        >
          {children}
        </div>
      )
    }
  )
)
