"use client"

import { CartProvider } from "@/components/providers"
import { LanguageProvider } from "@/contexts/LanguageContext"
import { NavigationProvider } from "@/contexts/NavigationContext"
import { Cart } from "@/types/cart"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import type React from "react"
import { PropsWithChildren } from "react"

interface ProvidersProps extends PropsWithChildren {
  cart: Cart | null
}

export function Providers({ children, cart }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <NavigationProvider>
          <CartProvider cart={cart}>{children}</CartProvider>
        </NavigationProvider>
      </LanguageProvider>
    </QueryClientProvider>
  )
}
