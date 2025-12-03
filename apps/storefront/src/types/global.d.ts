// Global type declarations

interface Window {
  plausible?: (event: string, options?: { props?: Record<string, any> }) => void
}

