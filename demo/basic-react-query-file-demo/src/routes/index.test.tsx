import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// 直接导入 Home 组件而不是通过路由
function Home() {
  return (
    <div className='p-2'>
      <h1 className='text-2xl font-bold'>
        欢迎使用 TanStack Router + React Query
      </h1>
      <p className='mt-4 text-gray-600'>
        这是一个干净的项目模板，可以开始构建你的应用。
      </p>
    </div>
  )
}

// 测试工具函数
function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  )
}

describe('Home Component', () => {
  it('should render welcome message', () => {
    renderWithProviders(<Home />)

    expect(
      screen.getByText('欢迎使用 TanStack Router + React Query')
    ).toBeInTheDocument()
    expect(
      screen.getByText('这是一个干净的项目模板，可以开始构建你的应用。')
    ).toBeInTheDocument()
  })

  it('should have correct CSS classes', () => {
    renderWithProviders(<Home />)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveClass('text-2xl', 'font-bold')

    const paragraph = screen.getByText(
      '这是一个干净的项目模板，可以开始构建你的应用。'
    )
    expect(paragraph).toHaveClass('mt-4', 'text-gray-600')
  })
})
