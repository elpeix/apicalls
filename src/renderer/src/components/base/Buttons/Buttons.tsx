import React from 'react'

function ButtonOk({
  className = '',
  onClick = () => {},
  onKeyDown = () => {},
  children,
  style = {},
  autoFocus = false
}: {
  className?: string
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void
  children: React.ReactNode
  style?: React.CSSProperties
  autoFocus?: boolean
}) {
  return (
    <button
      className={`ok ${className}`}
      onClick={onClick}
      onKeyDown={onKeyDown}
      autoFocus={autoFocus}
      style={style}
    >
      {children}
    </button>
  )
}

function ButtonCancel({
  className = '',
  onClick = () => {},
  children
}: {
  className?: string
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  children: React.ReactNode
}) {
  return (
    <button className={`cancel ${className}`} onClick={onClick}>
      {children}
    </button>
  )
}

export const Button = {
  Ok: ButtonOk,
  Cancel: ButtonCancel
}
