import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { KhataProvider } from '@/hooks/useKhata.tsx'
import { ThemeProvider } from '@/hooks/useTheme.tsx'
import { ClickRipple } from '@/components/ClickRipple'
import { Toaster } from './components/ui/sonner.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <KhataProvider>
          <App />
          <ClickRipple />
          <Toaster />
        </KhataProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
