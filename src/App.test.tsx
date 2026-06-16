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
    mode: 'journey',
    projectRoom: undefined,
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

  it('activating opens the Project Room with the Concept tab populated, and the nav switches to its 7 tabs', async () => {
    const user = userEvent.setup()
    render(<App />)
    const nav = screen.getByRole('navigation', { name: /journey progress/i })

    await user.click(within(nav).getByRole('link', { name: /activate/i }))
    await user.click(screen.getByRole('button', { name: /activate this concept/i }))

    expect(screen.getByRole('heading', { name: /your activated concept/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /floor plan/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /section through/i })).toBeInTheDocument()

    const projectNav = screen.getByRole('navigation', { name: /project room navigation/i })
    for (const label of [
      'Concept',
      'Dimensioned Plan',
      'Section',
      'Schedules',
      'Refinements',
      'Handoff',
      'Packs',
    ]) {
      expect(within(projectNav).getByRole('link', { name: new RegExp(label, 'i') })).toBeInTheDocument()
    }

    expect(useConceptStore.getState().mode).toBe('project')
    expect(useConceptStore.getState().projectRoom?.baseline).toBeDefined()
  })

  it('redirects a direct visit to a Project Room route back to Activate before activation', () => {
    window.history.pushState({}, '', '/project/concept')
    render(<App />)
    expect(screen.getByRole('heading', { name: /ready when you are/i })).toBeInTheDocument()
  })

  it('prompts for the real site before showing a dimensioned plan, then re-solves onto it', async () => {
    const user = userEvent.setup()
    render(<App />)
    const nav = screen.getByRole('navigation', { name: /journey progress/i })
    await user.click(within(nav).getByRole('link', { name: /activate/i }))
    await user.click(screen.getByRole('button', { name: /activate this concept/i }))

    const projectNav = screen.getByRole('navigation', { name: /project room navigation/i })
    await user.click(within(projectNav).getByRole('link', { name: /dimensioned plan/i }))

    // No site captured yet: prompted for one, not shown a dimensioned plan.
    expect(screen.getByRole('button', { name: /re-solve onto my site/i })).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: /floor plan/i })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /re-solve onto my site/i }))

    expect(screen.getByRole('img', { name: /floor plan/i })).toBeInTheDocument()
    expect(useConceptStore.getState().projectRoom?.resolved).toBeDefined()
  })

  it('shows room, area and outdoor schedules with an assumptions list once the site is captured', async () => {
    const user = userEvent.setup()
    render(<App />)
    const nav = screen.getByRole('navigation', { name: /journey progress/i })
    await user.click(within(nav).getByRole('link', { name: /activate/i }))
    await user.click(screen.getByRole('button', { name: /activate this concept/i }))

    const projectNav = screen.getByRole('navigation', { name: /project room navigation/i })
    await user.click(within(projectNav).getByRole('link', { name: /schedules/i }))

    // No site captured yet: prompted for one, not shown schedules.
    expect(screen.getByRole('button', { name: /re-solve onto my site/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /room schedule/i })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /re-solve onto my site/i }))

    expect(screen.getByRole('heading', { name: /^room schedule$/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /^area schedule$/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /courtyard.*outdoor-room schedule/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /assumptions.*unresolved questions/i })).toBeInTheDocument()
  })
})
