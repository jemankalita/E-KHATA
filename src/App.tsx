import { AppShell } from '@/layouts/AppShell'
import { CustomerDashboardPage } from '@/pages/CustomerDashboardPage'
import { CustomerLedgerPage } from '@/pages/CustomerLedgerPage'
import { CustomerScanPage } from '@/pages/CustomerScanPage'
import { CustomerSettlementPage } from '@/pages/CustomerSettlementPage'
import { LoginPage } from '@/pages/LoginPage'
import { ShopkeeperCreatePage } from '@/pages/ShopkeeperCreatePage'
import { ShopkeeperDashboardPage } from '@/pages/ShopkeeperDashboardPage'
import { ShopkeeperQrPage } from '@/pages/ShopkeeperQrPage'
import { TermsPage } from '@/pages/TermsPage'
import { Navigate, Route, Routes } from 'react-router-dom'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/pay" element={<Navigate to="/customer" replace />} />
      <Route path="/shop" element={<Navigate to="/shopkeeper" replace />} />
      <Route element={<AppShell />}>
        <Route path="/customer" element={<CustomerDashboardPage />} />
        <Route path="/customer/scan" element={<CustomerScanPage />} />
        <Route path="/customer/ledger" element={<CustomerLedgerPage />} />
        <Route path="/customer/settlement" element={<CustomerSettlementPage />} />
        <Route path="/shopkeeper" element={<ShopkeeperDashboardPage />} />
        <Route path="/shopkeeper/create" element={<ShopkeeperCreatePage />} />
        <Route path="/shopkeeper/qr" element={<ShopkeeperQrPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
