import React from 'react'

export default function Name({
  name,
  className,
  onClick = () => {}
}: {
  name: string
  className?: string
  onClick?: (e: React.MouseEvent) => void
}) {
  return (
    <div className={className} onClick={onClick}>
      {name.length ? name : <em>Unnamed</em>}
    </div>
  )
}
