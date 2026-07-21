import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Autocompleter from '../../../src/renderer/src/components/base/Autocompleter/Autocompleter'

function setup(value = 'hello', onChange = vi.fn()) {
  const inputRef = React.createRef<HTMLInputElement>()
  const utils = render(
    <Autocompleter inputRef={inputRef} value={value} options={['alpha', 'beta']} onChange={onChange} />
  )
  return { onChange, inputRef, ...utils }
}

describe('Autocompleter', () => {
  it('renders the input with the value prop', () => {
    setup('hello')
    expect(screen.getByDisplayValue('hello')).toBeInTheDocument()
  })

  it('re-syncs the input when the value prop changes', () => {
    const { rerender } = setup('first')
    expect(screen.getByDisplayValue('first')).toBeInTheDocument()
    const inputRef = React.createRef<HTMLInputElement>()
    rerender(
      <Autocompleter inputRef={inputRef} value="second" options={['alpha', 'beta']} onChange={vi.fn()} />
    )
    expect(screen.getByDisplayValue('second')).toBeInTheDocument()
  })

  it('calls onChange when the user types', () => {
    const { onChange } = setup('')
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'abc' } })
    expect(onChange).toHaveBeenCalledWith('abc')
  })
})
