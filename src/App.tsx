import type { ReactElement } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import BriefPage from './routes/BriefPage'
import ShapePage from './routes/ShapePage'
import SummaryPage from './routes/SummaryPage'
import PricingPage from './routes/PricingPage'
import ActivatePage from './routes/ActivatePage'
import ProjectConceptPage from './routes/project/ProjectConceptPage'
import DimensionedPlanPage from './routes/project/DimensionedPlanPage'
import ProjectSectionPage from './routes/project/ProjectSectionPage'
import SchedulesPage from './routes/project/SchedulesPage'
import RefinementsPage from './routes/project/RefinementsPage'
import HandoffPage from './routes/project/HandoffPage'
import PacksPage from './routes/project/PacksPage'
import { useConceptStore } from './store/useConceptStore'

// Project Room routes only make sense once the journey has been activated —
// visiting them directly beforehand sends the customer back to Activate.
function RequireProjectMode({ children }: { children: ReactElement }) {
  const mode = useConceptStore((s) => s.mode)
  if (mode !== 'project') return <Navigate to="/activate" replace />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/brief" replace />} />
          <Route path="/brief" element={<BriefPage />} />
          <Route path="/shape" element={<ShapePage />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/activate" element={<ActivatePage />} />

          <Route
            path="/project/concept"
            element={
              <RequireProjectMode>
                <ProjectConceptPage />
              </RequireProjectMode>
            }
          />
          <Route
            path="/project/dimensioned-plan"
            element={
              <RequireProjectMode>
                <DimensionedPlanPage />
              </RequireProjectMode>
            }
          />
          <Route
            path="/project/section"
            element={
              <RequireProjectMode>
                <ProjectSectionPage />
              </RequireProjectMode>
            }
          />
          <Route
            path="/project/schedules"
            element={
              <RequireProjectMode>
                <SchedulesPage />
              </RequireProjectMode>
            }
          />
          <Route
            path="/project/refinements"
            element={
              <RequireProjectMode>
                <RefinementsPage />
              </RequireProjectMode>
            }
          />
          <Route
            path="/project/handoff"
            element={
              <RequireProjectMode>
                <HandoffPage />
              </RequireProjectMode>
            }
          />
          <Route
            path="/project/packs"
            element={
              <RequireProjectMode>
                <PacksPage />
              </RequireProjectMode>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
