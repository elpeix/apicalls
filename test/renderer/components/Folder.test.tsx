import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Folder from '../../../src/renderer/src/components/layout/sideBar/Collections/Folder'
import { getFolder, getRequest } from '../../data/data'

function makeFolder(expanded: boolean): CollectionFolder {
  return {
    ...getFolder('f1', [getRequest('r1', 'child-request')], 'my-folder'),
    expanded
  }
}

function renderFolder(folder: CollectionFolder) {
  const update = vi.fn()
  const onMove = vi.fn()
  const remove = vi.fn()
  const utils = render(
    <Folder
      folder={folder}
      collectionId="c1"
      path={[]}
      update={update}
      onMove={onMove}
      remove={remove}
      scrolling={false}
    />
  )
  return { update, onMove, remove, ...utils }
}

describe('Folder', () => {
  it('renders the folder name', () => {
    renderFolder(makeFolder(false))
    expect(screen.getByText('my-folder')).toBeInTheDocument()
  })

  it('hides children when collapsed and shows them when the expanded prop turns on', () => {
    const { rerender } = renderFolder(makeFolder(false))
    expect(screen.queryByText('child-request')).not.toBeInTheDocument()

    rerender(
      <Folder
        folder={makeFolder(true)}
        collectionId="c1"
        path={[]}
        update={vi.fn()}
        onMove={vi.fn()}
        remove={vi.fn()}
        scrolling={false}
      />
    )
    expect(screen.getByText('child-request')).toBeInTheDocument()
  })
})
