import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { DEFAULT_BRIEF, deriveInitialSelections } from './model/brief'
import { useConceptStore } from './store/useConceptStore'

beforeEach(() => {
  useConceptStore.setState({
    brief: DEFAULT_BRIEF,
    selections: deriveInitialSelections(DEFAULT_BRIEF),
    openCategory: 'archetype',
  })
  window.history.pushState({}, '', '/')
})

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

  it('runs the full journey end-to-end to a complete on-screen concept', async () => {
    const user = userEvent.setup()
    render(<App />)
    const nav = screen.getByRole('navigation', { name: /journey progress/i })

    // Shape: the board renders a complete plan and section from the start.
    await user.click(within(nav).getByRole('link', { name: /shape/i }))
    expect(screen.getAllByRole('img', { name: /floor plan/i })[0].tagName.toLowerCase()).toBe('svg')
    expect(screen.getAllByRole('img', { name: /section through/i })[0].tagName.toLowerCase()).toBe('svg')

    // Summary: the concept write-up, plan, and section all appear together.
    await user.click(within(nav).getByRole('link', { name: /summary/i }))
    expect(screen.getByRole('heading', { name: /your concept/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /floor plan/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /section through/i })).toBeInTheDocument()

    // Pricing: the concept routes to a named package with a reason.
    await user.click(within(nav).getByRole('link', { name: /pricing/i }))
    expect(screen.getByRole('heading', { name: /core or pro/i })).toBeInTheDocument()
    expect(screen.getByText(/^(Core|Pro)$/)).toBeInTheDocument()

    // Activate: the concept's title and tier carry through to the final step.
    await user.click(within(nav).getByRole('link', { name: /activate/i }))
    expect(screen.getByRole('link', { name: /talk to altira/i })).toHaveAttribute(
      'href',
      'mailto:hello@altira.com.au',
    )
  })
})
