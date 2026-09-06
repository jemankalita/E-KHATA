import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div
      role="group"
      aria-label="Color theme"
      className="inline-flex rounded-full bg-secondary p-1"
    >
      <button
        type="button"
        data-testid="theme-light"
        aria-pressed={theme === 'light'}
        onClick={() => setTheme('light')}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition',
          theme === 'light' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <Sun className="size-3.5" />
        Light
      </button>
      <button
        type="button"
        data-testid="theme-dark"
        aria-pressed={theme === 'dark'}
        onClick={() => setTheme('dark')}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition',
          theme === 'dark' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <Moon className="size-3.5" />
        Dark
      </button>
    </div>
  )
}
