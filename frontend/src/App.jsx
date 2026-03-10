import './App.css'
import { Routes, Route } from 'react-router-dom'
import { AuthGuard } from './auth/AuthGuard'
import { LoginPage } from './pages/LoginPage'
import { HomeRedirect } from './pages/HomeRedirect'
import { ClientPortal, ClientOverview } from './pages/ClientPortal'
import { OperationsLayout, OperationsOverview } from './pages/OperationsLayout'
import { ServicePointsPage } from './pages/client/ServicePointsPage'
import { UsagePage } from './pages/client/UsagePage'
import { BillsPage } from './pages/client/BillsPage'
import { BillDetailPage } from './pages/client/BillDetailPage'
import { ServiceRequestForm } from './pages/client/ServiceRequestForm'
import { ServicePointAdminPage } from './pages/admin/ServicePointAdminPage'
import { UsageIngestPage } from './pages/admin/UsageIngestPage'
import { BillingRunPage } from './pages/admin/BillingRunPage'
import { AnomaliesPage } from './pages/admin/AnomaliesPage'
import { ContractsPage } from './pages/trading/ContractsPage'
import { MarketBidsPage } from './pages/trading/MarketBidsPage'
import { GridStatusPage } from './pages/trading/GridStatusPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<AuthGuard />}>
        <Route path="/" element={<HomeRedirect />} />

        <Route element={<AuthGuard roles={['client']} />}>
          <Route path="/client" element={<ClientPortal />}>
            <Route index element={<ClientOverview />} />
            <Route path="service-points" element={<ServicePointsPage />} />
            <Route path="usage" element={<UsagePage />} />
            <Route path="bills" element={<BillsPage />} />
            <Route path="bills/:id" element={<BillDetailPage />} />
            <Route path="service-request" element={<ServiceRequestForm />} />
          </Route>
        </Route>

        <Route element={<AuthGuard roles={['admin']} />}>
          <Route path="/admin" element={<OperationsLayout />}>
            <Route index element={<OperationsOverview />} />
            <Route path="service-points" element={<ServicePointAdminPage />} />
            <Route path="usage-ingest" element={<UsageIngestPage />} />
            <Route path="billing" element={<BillingRunPage />} />
            <Route path="anomalies" element={<AnomaliesPage />} />
            <Route path="contracts" element={<ContractsPage />} />
            <Route path="bids" element={<MarketBidsPage />} />
            <Route path="grid" element={<GridStatusPage />} />
          </Route>
        </Route>

        <Route element={<AuthGuard roles={['personnel']} />}>
          <Route path="/personnel" element={<OperationsLayout />}>
            <Route index element={<OperationsOverview />} />
            <Route path="service-points" element={<ServicePointAdminPage />} />
            <Route path="usage-ingest" element={<UsageIngestPage />} />
            <Route path="billing" element={<BillingRunPage />} />
            <Route path="anomalies" element={<AnomaliesPage />} />
            <Route path="contracts" element={<ContractsPage />} />
            <Route path="bids" element={<MarketBidsPage />} />
            <Route path="grid" element={<GridStatusPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}

export default App
