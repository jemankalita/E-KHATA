import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()

  return (
    <div
      role="group"
      aria-label="Color theme"
      className={cn('inline-flex shrink-0 rounded-full bg-secondary p-0.5 sm:p-1', className)}
    >
      <button
        type="button"
        data-testid="theme-light"
        aria-label="Light"
        aria-pressed={theme === 'light'}
        onClick={() => setTheme('light')}
        className={cn(
          'inline-flex min-h-10 min-w-10 items-center justify-center gap-1.5 rounded-full px-2.5 text-[12px] font-medium transition sm:min-h-0 sm:min-w-0 sm:px-3 sm:py-1.5',
          theme === 'light' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <Sun className="size-3.5" />
        <span data-theme-label className="hidden sm:inline">
          Light
        </span>
      </button>
      <button
        type="button"
        data-testid="theme-dark"
        aria-label="Dark"
        aria-pressed={theme === 'dark'}
        onClick={() => setTheme('dark')}
        className={cn(
          'inline-flex min-h-10 min-w-10 items-center justify-center gap-1.5 rounded-full px-2.5 text-[12px] font-medium transition sm:min-h-0 sm:min-w-0 sm:px-3 sm:py-1.5',
          theme === 'dark' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <Moon className="size-3.5" />
        <span data-theme-label className="hidden sm:inline">
          Dark
        </span>
      </button>
    </div>
  )
}
