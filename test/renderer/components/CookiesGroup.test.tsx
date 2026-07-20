import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CookiesGroup from '../../../src/renderer/src/components/layout/sideBar/Cookies/CookiesGroup'

function makeCookie(name: string): Cookie {
  return {
    name,
    value: `${name}-value`,
    path: '/',
    domain: 'example.com',
    expires: new Date('2030-01-01T00:00:00.000Z'),
    httpOnly: false,
    sameSite: 'Lax',
    secure: false
  } as unknown as Cookie
}

function setup(cookies: Cookie[] = [makeCookie('a'), makeCookie('b')]) {
  const update = vi.fn()
  const remove = vi.fn()
  const back = vi.fn()
  const utils = render(
    <CookiesGroup
      group="example.com"
      cookies={cookies}
      back={back}
      update={update}
      remove={remove}
    />
  )
  return { update, remove, back, ...utils }
}

describe('CookiesGroup', () => {
  it('renders a row per cookie', () => {
    setup()
    expect(screen.getByDisplayValue('a')).toBeInTheDocument()
    expect(screen.getByDisplayValue('b')).toBeInTheDocument()
  })

  it('re-syncs when the cookies prop changes', () => {
    const { rerender } = setup()
    rerender(
      <CookiesGroup
        group="example.com"
        cookies={[makeCookie('c')]}
        back={vi.fn()}
        update={vi.fn()}
        remove={vi.fn()}
      />
    )
    expect(screen.getByDisplayValue('c')).toBeInTheDocument()
    expect(screen.queryByDisplayValue('a')).not.toBeInTheDocument()
  })

  it('adds a cookie and notifies with the new list', () => {
    const { update } = setup()
    fireEvent.click(screen.getByTitle('Add cookie'))
    expect(update).toHaveBeenCalledWith(
      'example.com',
      expect.arrayContaining([expect.objectContaining({ name: 'a' })])
    )
    const lastCall = update.mock.calls[update.mock.calls.length - 1]
    expect(lastCall[1]).toHaveLength(3)
  })
})
