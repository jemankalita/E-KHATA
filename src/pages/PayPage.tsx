import { Navigate } from 'react-router-dom'

/** Customer phones never open a pay/scan path. Old QR links land on the account. */
export function PayPage() {
  return <Navigate to="/customer" replace />
}
