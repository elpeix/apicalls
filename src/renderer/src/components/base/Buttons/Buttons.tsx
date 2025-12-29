import React from 'react'

function ButtonOk({
  className = '',
  onClick = () => {},
  onKeyDown = () => {},
  children,
  style = {},
  autoFocus = false,
  disabled = false
}: {
  className?: string
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void
  children: React.ReactNode
  style?: React.CSSProperties
  autoFocus?: boolean
  disabled?: boolean
}) {
  return (
    <button
      className={`ok ${className} ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
      onKeyDown={onKeyDown}
      autoFocus={autoFocus}
      style={style}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

function ButtonCancel({
  className = '',
  onClick = () => {},
  children,
  disabled = false
}: {
  className?: string
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  children: React.ReactNode
  disabled?: boolean
}) {
  return (
    <button
      className={`cancel ${className} ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export const Button = {
  Ok: ButtonOk,
  Cancel: ButtonCancel
}
