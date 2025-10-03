import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="p-2">
      <h1 className="text-2xl font-bold">欢迎使用 TanStack Router + React Query</h1>
      <p className="mt-4 text-gray-600">这是一个干净的项目模板，可以开始构建你的应用。</p>
    </div>
  )
}
