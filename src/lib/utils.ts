import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sumItemsSafe(items: { quantity: number; price: number }[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.price, 0)
}

export function formatInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso))
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso))
}

export function greetingForHour(hour: number): string {
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function formatSequenceId(sequence: number): string {
  return `EK-2026-${String(sequence).padStart(6, '0')}`
}

export function encodeQrPayload(input: {
  id: string
  merchant: string
  amount: number
}): string {
  return JSON.stringify({
    v: 1,
    network: 'E-KHATA',
    id: input.id,
    merchant: input.merchant,
    amount: input.amount,
  })
}
