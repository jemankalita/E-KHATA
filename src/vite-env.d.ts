/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface NDEFReadingEvent extends Event {
  serialNumber?: string
}

interface NDEFReader {
  scan: (options?: { signal?: AbortSignal }) => Promise<void>
  addEventListener: (type: 'reading' | 'readingerror', listener: (event: NDEFReadingEvent) => void) => void
  removeEventListener: (type: 'reading' | 'readingerror', listener: (event: NDEFReadingEvent) => void) => void
}

interface Window {
  NDEFReader?: new () => NDEFReader
}
