import { BookOpen, LayoutDashboard, QrCode, Scale, Upload, type LucideIcon } from 'lucide-react'

export interface ShopLink {
  to: string
  label: string
  short: string
  icon: LucideIcon
}

export const SHOP_LINKS: ShopLink[] = [
  { to: '/shop', label: 'Dashboard', short: 'Khata', icon: LayoutDashboard },
  { to: '/shop/upload', label: 'Upload Bill', short: 'Upload', icon: Upload },
  { to: '/shop/quick-qr', label: 'Quick QR', short: 'Quick QR', icon: QrCode },
  { to: '/shop/ledger', label: 'Ledger', short: 'Ledger', icon: BookOpen },
  { to: '/shop/settlement', label: 'Settlement', short: 'Settle', icon: Scale },
]
