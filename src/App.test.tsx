import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App routing', () => {
  it('redirects to the Brief step by default', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: /tell us about your home/i }),
    ).toBeInTheDocument()
  })

  it('shows all five journey steps in the nav', () => {
    render(<App />)
    const nav = screen.getByRole('navigation', { name: /journey progress/i })
    for (const label of ['Brief', 'Shape', 'Summary', 'Pricing', 'Activate']) {
      expect(within(nav).getByRole('link', { name: new RegExp(label, 'i') })).toBeInTheDocument()
    }
  })
})
