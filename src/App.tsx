import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import BriefPage from './routes/BriefPage'
import ShapePage from './routes/ShapePage'
import SummaryPage from './routes/SummaryPage'
import PricingPage from './routes/PricingPage'
import ActivatePage from './routes/ActivatePage'

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
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
