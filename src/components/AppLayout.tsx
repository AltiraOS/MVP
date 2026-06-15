import { NavLink, Outlet } from 'react-router-dom'
import { JOURNEY_STEPS } from '../routes/journey'

export default function AppLayout() {
  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-line bg-panel">
        <div className="mx-auto max-w-5xl px-4 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-lg font-semibold tracking-tight">Altira</div>
          <nav aria-label="Journey progress">
            <ol className="flex items-center gap-2 text-sm">
              {JOURNEY_STEPS.map((step) => (
                <li key={step.path}>
                  <NavLink
                    to={step.path}
                    className={({ isActive }) =>
                      [
                        'flex items-center gap-1.5 rounded-full px-3 py-1 transition-colors',
                        isActive
                          ? 'bg-accent text-white'
                          : 'text-ink-soft hover:text-ink',
                      ].join(' ')
                    }
                  >
                    <span className="font-medium">{step.number}</span>
                    <span>{step.label}</span>
                  </NavLink>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
