import React from 'react'

export default function Name({
  name,
  className,
  onClick = () => {},
  onDoubleClick = () => {}
}: {
  name: string
  className?: string
  onClick?: (e: React.MouseEvent) => void
  onDoubleClick?: (e: React.MouseEvent) => void
}) {
  return (
    <div className={className} onClick={onClick} onDoubleClick={onDoubleClick}>
      {name && name.length ? name : <em>Unnamed</em>}
    </div>
  )
}
