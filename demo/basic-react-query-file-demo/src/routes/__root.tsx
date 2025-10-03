import * as React from 'react'
import {
  Link,
  Outlet,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { QueryClient } from '@tanstack/react-query'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useI18n } from '@/i18n/hooks'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: RootComponent,
  notFoundComponent: () => {
    return (
      <div>
        <p>This is the notFoundComponent configured on root route</p>
        <Link to='/'>Start Over</Link>
      </div>
    )
  },
})

function RootComponent() {
  const { t } = useI18n()

  return (
    <>
      <div className='p-2 flex gap-2 text-lg items-center justify-between'>
        <div className='flex gap-2'>
          <Link
            to='/'
            activeProps={{
              className: 'font-bold',
            }}
            activeOptions={{ exact: true }}
          >
            {t('navigation.home')}
          </Link>
          <Link
            to='/monitoring'
            activeProps={{
              className: 'font-bold',
            }}
          >
            {t('navigation.monitoring')}
          </Link>
          <Link
            to='/demo'
            activeProps={{
              className: 'font-bold',
            }}
          >
            {t('navigation.redaxios_demo')}
          </Link>
        </div>
        <LanguageSwitcher />
      </div>
      <hr />
      <Outlet />
      <ReactQueryDevtools buttonPosition='top-right' />
      <TanStackRouterDevtools position='bottom-right' />
    </>
  )
}
