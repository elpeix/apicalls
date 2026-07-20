import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Collection from '../../../src/renderer/src/components/layout/sideBar/Collections/Collection'
import { getFolder, getRequest } from '../../data/data'

function makeCollection(name: string): Collection {
  return {
    id: 'c1',
    name,
    elements: [getFolder('f1', [getRequest('r1', 'child-request')], 'a-folder')]
  } as unknown as Collection
}

function renderCollection(collection: Collection) {
  const back = vi.fn()
  const onRemove = vi.fn()
  const utils = render(<Collection collection={collection} back={back} onRemove={onRemove} />)
  return { back, onRemove, ...utils }
}

describe('Collection', () => {
  it('renders the collection name', () => {
    renderCollection(makeCollection('My Collection'))
    expect(screen.getByText('My Collection')).toBeInTheDocument()
  })

  it('renders its elements', () => {
    renderCollection(makeCollection('My Collection'))
    expect(screen.getByText('a-folder')).toBeInTheDocument()
  })

  it('auto-enters edit mode when the collection has no name', () => {
    renderCollection(makeCollection(''))
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('does not enter edit mode when the collection has a name', () => {
    renderCollection(makeCollection('Named'))
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })
})
