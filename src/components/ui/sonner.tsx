import { useTheme } from '@/hooks/useTheme'
import { Toaster as Sonner } from 'sonner'

export function Toaster() {
  const { theme } = useTheme()
  return (
    <Sonner
      theme={theme}
      position="top-center"
      toastOptions={{
        classNames: {
          toast: 'bg-card border border-border text-foreground shadow-lg rounded-2xl',
          title: 'text-sm font-medium',
          description: 'text-muted-foreground text-sm',
        },
      }}
    />
  )
}
