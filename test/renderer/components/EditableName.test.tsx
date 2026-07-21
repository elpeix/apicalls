import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import EditableName from '../../../src/renderer/src/components/base/EditableName/EditableName'

function setup(props: Partial<React.ComponentProps<typeof EditableName>> = {}) {
  const update = vi.fn()
  const onBlur = vi.fn()
  const utils = render(
    <EditableName name="original" editMode={false} update={update} onBlur={onBlur} {...props} />
  )
  return { update, onBlur, ...utils }
}

describe('EditableName', () => {
  it('shows the name and no input when not editing', () => {
    setup({ name: 'my name' })
    expect(screen.getByText('my name')).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('enters edit mode when editMode prop is true, showing an input with the name', () => {
    setup({ name: 'editable', editMode: true })
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toBe('editable')
  })

  it('calls update with the edited value on Enter', () => {
    const { update } = setup({ name: 'before', editMode: true })
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'after' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(update).toHaveBeenCalledWith('after')
  })

  it('calls update and onBlur when the input loses focus', () => {
    const { update, onBlur } = setup({ name: 'before', editMode: true })
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'blurred' } })
    fireEvent.blur(input)
    expect(update).toHaveBeenCalledWith('blurred')
    expect(onBlur).toHaveBeenCalled()
  })

  it('selects the whole name text when entering edit mode via the editMode prop', async () => {
    setup({ name: 'hello', editMode: true })
    const input = screen.getByRole('textbox') as HTMLInputElement
    await waitFor(() => {
      expect(input.selectionStart).toBe(0)
      expect(input.selectionEnd).toBe('hello'.length)
    })
  })

  it('reflects a changed name prop in the edit input (prop -> state sync)', () => {
    const { rerender } = setup({ name: 'first', editMode: true })
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('first')
    rerender(
      <EditableName name="second" editMode={true} update={vi.fn()} onBlur={vi.fn()} />
    )
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('second')
  })
})
