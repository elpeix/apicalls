import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CookieRow from '../../../src/renderer/src/components/layout/sideBar/Cookies/Cookie'

const baseCookie = {
  name: 'session',
  value: 'abc',
  path: '/',
  domain: 'example.com',
  expires: new Date('2030-01-01T00:00:00.000Z'),
  httpOnly: false,
  sameSite: 'Lax',
  secure: false
} as unknown as Cookie

function setup(cookie: Cookie = baseCookie) {
  const update = vi.fn()
  const remove = vi.fn()
  const utils = render(<CookieRow cookie={cookie} index={2} update={update} remove={remove} />)
  return { update, remove, ...utils }
}

describe('Cookie', () => {
  it('renders the cookie fields', () => {
    setup()
    expect(screen.getByDisplayValue('session')).toBeInTheDocument()
    expect(screen.getByDisplayValue('abc')).toBeInTheDocument()
  })

  it('re-syncs when the cookie prop changes', () => {
    const { rerender } = setup()
    rerender(
      <CookieRow
        cookie={{ ...baseCookie, name: 'renamed' } as unknown as Cookie}
        index={2}
        update={vi.fn()}
        remove={vi.fn()}
      />
    )
    expect(screen.getByDisplayValue('renamed')).toBeInTheDocument()
  })

  it('calls update with the edited cookie and index on blur', () => {
    const { update } = setup()
    const nameInput = screen.getByDisplayValue('session')
    fireEvent.change(nameInput, { target: { value: 'newname' } })
    fireEvent.blur(nameInput)
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ name: 'newname' }), 2)
  })
})
