# 监控体系文档

本项目集成了完整的监控体系，包括错误追踪和性能分析功能。

## 功能特性

### 🚨 错误追踪
- **React错误边界**: 捕获组件渲染错误
- **全局错误处理**: 捕获未处理的JavaScript错误和Promise拒绝
- **网络错误监控**: 监控API请求失败和超时
- **资源加载错误**: 监控图片、脚本等资源加载失败
- **错误过滤**: 自动过滤常见的无关错误

### 📊 性能分析
- **Web Vitals**: 监控核心性能指标（LCP、FID、CLS、FCP、TTFB）
- **页面性能**: 监控页面加载时间、DOM解析时间等
- **资源性能**: 监控静态资源加载性能
- **内存使用**: 监控JavaScript内存使用情况
- **用户会话**: 跟踪用户会话时长和页面浏览量

### 📈 监控仪表板
- **实时数据**: 实时显示性能指标和错误统计
- **可视化图表**: 直观展示监控数据
- **历史记录**: 查看错误历史和性能趋势
- **导出功能**: 支持数据导出和分析

## 技术架构

### 核心组件

1. **监控配置** (`src/config/monitoring.ts`)
   - 环境配置
   - 采样率设置
   - 错误过滤规则
   - 性能阈值定义

2. **类型定义** (`src/types/monitoring.d.ts`)
   - 错误信息类型
   - 性能指标类型
   - 用户会话类型
   - 监控配置类型

3. **工具函数** (`src/utils/monitoring.ts`)
   - 会话管理
   - 错误格式化
   - 性能数据收集
   - 数据上报

4. **错误边界** (`src/components/ErrorBoundary.tsx`)
   - React组件错误捕获
   - 错误UI展示
   - 错误上报集成

5. **Web Vitals服务** (`src/services/webVitals.ts`)
   - Core Web Vitals收集
   - 性能指标评估
   - 自动上报机制

6. **错误处理服务** (`src/services/errorHandler.ts`)
   - 全局错误捕获
   - 网络错误监控
   - 错误队列管理

7. **监控服务** (`src/services/monitoring.ts`)
   - Sentry集成
   - 服务初始化
   - 统一接口

8. **监控仪表板** (`src/components/MonitoringDashboard.tsx`)
   - 数据可视化
   - 实时监控
   - 交互式界面

## 快速开始

### 1. 环境配置

复制 `.env.example` 到 `.env` 并配置监控服务：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 监控API端点（可选）
VITE_MONITORING_API_ENDPOINT=https://your-monitoring-api.com/api

# Sentry DSN（可选）
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### 2. 访问监控仪表板

启动应用后，访问 `/monitoring` 路由查看监控仪表板：

```
http://localhost:3000/monitoring
```

### 3. 自定义配置

修改 `src/config/monitoring.ts` 来调整监控配置：

```typescript
export const monitoringConfig: MonitoringConfig = {
  enableErrorTracking: true,        // 启用错误追踪
  enablePerformanceTracking: true,  // 启用性能监控
  enableWebVitals: true,           // 启用Web Vitals
  sampleRate: 0.1,                 // 采样率（生产环境建议0.1）
  environment: 'production',       // 环境标识
}
```

## API 使用

### 手动报告错误

```typescript
import { reportError } from '@/services/errorHandler'

try {
  // 可能出错的代码
} catch (error) {
  reportError(error, { context: 'user-action' })
}
```

### 记录自定义事件

```typescript
import { recordCustomEvent } from '@/utils/monitoring'

recordCustomEvent('button_click', {
  buttonId: 'submit-form',
  userId: 'user123',
  timestamp: Date.now()
})
```

### 记录性能指标

```typescript
import { recordPerformanceMetric } from '@/utils/monitoring'

const startTime = Date.now()
// 执行操作
const duration = Date.now() - startTime
recordPerformanceMetric('custom_operation', duration)
```

### 设置用户信息

```typescript
import { monitoringService } from '@/services/monitoring'

monitoringService.setUser({
  id: 'user123',
  email: 'user@example.com',
  username: 'john_doe'
})
```

## 监控指标说明

### Web Vitals 指标

- **LCP (Largest Contentful Paint)**: 最大内容绘制时间
  - 良好: ≤ 2.5s
  - 需改进: 2.5s - 4.0s
  - 较差: > 4.0s

- **FID (First Input Delay)**: 首次输入延迟
  - 良好: ≤ 100ms
  - 需改进: 100ms - 300ms
  - 较差: > 300ms

- **CLS (Cumulative Layout Shift)**: 累积布局偏移
  - 良好: ≤ 0.1
  - 需改进: 0.1 - 0.25
  - 较差: > 0.25

- **FCP (First Contentful Paint)**: 首次内容绘制
  - 良好: ≤ 1.8s
  - 需改进: 1.8s - 3.0s
  - 较差: > 3.0s

- **TTFB (Time to First Byte)**: 首字节时间
  - 良好: ≤ 800ms
  - 需改进: 800ms - 1.8s
  - 较差: > 1.8s

### 错误类型

- **JavaScript错误**: 代码执行错误
- **Promise拒绝**: 未处理的Promise错误
- **网络错误**: API请求失败
- **资源错误**: 静态资源加载失败
- **组件错误**: React组件渲染错误

## 数据上报

### 本地存储

监控数据会临时存储在浏览器的 localStorage 和 sessionStorage 中：

- 会话信息存储在 localStorage
- 会话ID存储在 sessionStorage
- 错误队列存储在内存中

### 远程上报

如果配置了 `VITE_MONITORING_API_ENDPOINT`，数据会自动上报到指定的API端点：

- **错误数据**: POST `/api/errors`
- **性能指标**: POST `/api/metrics`
- **Web Vitals**: POST `/api/web-vitals`
- **自定义事件**: POST `/api/events`

### Sentry集成

如果配置了 `VITE_SENTRY_DSN`，错误和性能数据会自动发送到Sentry：

- 错误自动上报
- 性能监控
- 用户上下文
- 面包屑记录

## 测试

运行监控系统测试：

```bash
npm run test src/test/monitoring.test.ts
```

测试覆盖：
- 配置验证
- 工具函数
- Web Vitals收集
- 错误处理
- 性能监控

## 生产环境优化

### 1. 采样率配置

在生产环境中建议设置较低的采样率以减少性能影响：

```typescript
sampleRate: import.meta.env.PROD ? 0.1 : 1.0
```

### 2. 错误过滤

配置错误过滤规则以避免无关错误的干扰：

```typescript
export const errorFilters = {
  ignoreMessages: [
    /Script error/,
    /Non-Error promise rejection captured/,
    /ResizeObserver loop limit exceeded/,
  ],
  ignoreUrls: [
    /extensions\//,
    /^chrome:\/\//,
  ]
}
```

### 3. 数据清理

系统会自动清理过期的会话数据：

- 每小时清理一次过期会话
- 页面卸载时清理临时数据
- 错误队列大小限制

## 故障排除

### 常见问题

1. **监控数据不显示**
   - 检查配置是否正确
   - 确认监控服务已初始化
   - 查看浏览器控制台错误

2. **Web Vitals数据缺失**
   - 需要用户交互才能生成某些指标
   - 确认页面已完全加载
   - 检查浏览器兼容性

3. **错误上报失败**
   - 检查网络连接
   - 验证API端点配置
   - 查看CORS设置

### 调试模式

在开发环境中，监控系统会输出详细的调试信息到控制台，包括：

- 错误详情
- 性能指标
- 上报状态
- 配置信息

## 扩展开发

### 添加自定义指标

```typescript
// 1. 在类型定义中添加新的指标类型
export interface CustomMetric {
  name: string
  value: number
  category: string
  timestamp: number
}

// 2. 在工具函数中添加收集逻辑
export const recordCustomMetric = (metric: CustomMetric) => {
  // 收集和上报逻辑
}

// 3. 在仪表板中添加显示组件
```

### 集成第三方服务

```typescript
// 添加新的监控服务集成
import { CustomMonitoringService } from 'custom-monitoring-sdk'

export class MonitoringService {
  private customService: CustomMonitoringService

  private initCustomService() {
    this.customService = new CustomMonitoringService({
      apiKey: import.meta.env.VITE_CUSTOM_API_KEY
    })
  }
}
```

## 许可证

本监控系统遵循项目的开源许可证。