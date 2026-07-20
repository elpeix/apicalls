import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SimpleTable from '../../../src/renderer/src/components/base/SimpleTable/SimpleTable'

describe('SimpleTable', () => {
  it('applies the templateColumns to its rows', () => {
    render(
      <SimpleTable templateColumns="100px 200px">
        <SimpleTable.Row>
          <SimpleTable.Cell>a</SimpleTable.Cell>
          <SimpleTable.Cell>b</SimpleTable.Cell>
        </SimpleTable.Row>
      </SimpleTable>
    )
    expect(screen.getByRole('row').style.gridTemplateColumns).toBe('100px 200px')
  })

  it('re-syncs columns when the templateColumns prop changes', () => {
    const { rerender } = render(
      <SimpleTable templateColumns="100px 200px">
        <SimpleTable.Row>
          <SimpleTable.Cell>a</SimpleTable.Cell>
        </SimpleTable.Row>
      </SimpleTable>
    )
    rerender(
      <SimpleTable templateColumns="50px 60px">
        <SimpleTable.Row>
          <SimpleTable.Cell>a</SimpleTable.Cell>
        </SimpleTable.Row>
      </SimpleTable>
    )
    expect(screen.getByRole('row').style.gridTemplateColumns).toBe('50px 60px')
  })

  it('re-syncs an editable cell value when the value prop changes', () => {
    const { rerender } = render(
      <SimpleTable templateColumns="1fr">
        <SimpleTable.Row>
          <SimpleTable.Cell editable value="one" />
        </SimpleTable.Row>
      </SimpleTable>
    )
    expect(screen.getByDisplayValue('one')).toBeInTheDocument()
    rerender(
      <SimpleTable templateColumns="1fr">
        <SimpleTable.Row>
          <SimpleTable.Cell editable value="two" />
        </SimpleTable.Row>
      </SimpleTable>
    )
    expect(screen.getByDisplayValue('two')).toBeInTheDocument()
  })
})
