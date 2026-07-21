import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PredefinedHeaders from '../../../src/renderer/src/components/base/PredefinedHeaders/PredefinedHeaders'

function makeHeaders(): KeyValue[] {
  return [{ name: 'Authorization', value: 'Bearer x', enabled: true } as unknown as KeyValue]
}

function setup(headers: KeyValue[] = makeHeaders()) {
  const onSave = vi.fn()
  const onClose = vi.fn()
  const utils = render(
    <PredefinedHeaders title="Headers" headers={headers} onSave={onSave} onClose={onClose} />
  )
  return { onSave, onClose, ...utils }
}

describe('PredefinedHeaders', () => {
  it('renders the title', () => {
    setup()
    expect(screen.getByText('Headers')).toBeInTheDocument()
  })

  it('calls onClose when Cancel is clicked', () => {
    const { onClose } = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('saves the items initialized from the headers prop', () => {
    const headers = makeHeaders()
    const { onSave } = setup(headers)
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSave).toHaveBeenCalledWith(headers)
  })

  it('re-syncs and saves the items when the headers prop changes', () => {
    const { onSave, rerender } = setup()
    const next = [{ name: 'X-Custom', value: '1', enabled: true } as unknown as KeyValue]
    rerender(
      <PredefinedHeaders title="Headers" headers={next} onSave={onSave} onClose={vi.fn()} />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSave).toHaveBeenCalledWith(next)
  })
})
