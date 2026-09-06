import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { CustomerHomePage } from './pages/CustomerHomePage'
import { DashboardPage } from './pages/DashboardPage'
import { LandingPage } from './pages/LandingPage'
import { LedgerPage } from './pages/LedgerPage'
import { MatchPage } from './pages/MatchPage'
import { PayPage } from './pages/PayPage'
import { QrPage } from './pages/QrPage'
import { QuickQrPage } from './pages/QuickQrPage'
import { SettlementPage } from './pages/SettlementPage'
import { SuccessPage } from './pages/SuccessPage'
import { UploadPage } from './pages/UploadPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/customer" element={<CustomerHomePage />} />
        <Route path="/pay" element={<PayPage />} />
        <Route path="/shop" element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="match" element={<MatchPage />} />
          <Route path="qr" element={<QrPage />} />
          <Route path="quick-qr" element={<QuickQrPage />} />
          <Route path="success" element={<SuccessPage />} />
          <Route path="ledger" element={<LedgerPage />} />
          <Route path="settlement" element={<SettlementPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
