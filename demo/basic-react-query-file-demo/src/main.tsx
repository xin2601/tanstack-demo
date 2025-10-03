import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'
import { PWAUpdatePrompt } from './components/PWAUpdatePrompt'
import { ErrorBoundary } from './components/ErrorBoundary'
import { StoreProvider, StoreDebugger } from './components/StoreProvider'
import { NotificationContainer } from './components/NotificationContainer'
import { initMonitoring } from './services/monitoring'
import './i18n' // 初始化 i18n
import './styles.css'

// 初始化监控系统
initMonitoring()

const queryClient = new QueryClient()

// 将 i18n 实例挂载到 window 对象上，供 Store 使用
if (typeof window !== 'undefined') {
  import('./i18n').then(({ default: i18n }) => {
    window.i18n = i18n
  })
}

// Set up a Router instance
const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: 'intent',
  // Since we're using React Query, we don't want loader calls to ever be stale
  // This will ensure that the loader is always called when the route is preloaded or visited
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
})

// Register things for typesafety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('app')!

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <ErrorBoundary>
      <StoreProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <PWAUpdatePrompt />
          {/* <NotificationContainer /> */}
          <StoreDebugger />
        </QueryClientProvider>
      </StoreProvider>
    </ErrorBoundary>
  )
}
