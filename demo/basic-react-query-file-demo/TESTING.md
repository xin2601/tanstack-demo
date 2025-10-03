# 测试指南

本项目已配置 Vitest 和 Testing Library 用于单元测试和组件测试。

## 已安装的测试依赖

- **vitest** - 快速的单元测试框架
- **@testing-library/react** - React 组件测试工具
- **@testing-library/jest-dom** - 额外的 DOM 断言
- **@testing-library/user-event** - 用户交互模拟
- **jsdom** - DOM 环境模拟

## 测试脚本

```bash
# 运行测试（监听模式）
npm test

# 运行测试（单次运行）
npm run test:run

# 运行测试 UI 界面
npm run test:ui

# 运行测试并生成覆盖率报告
npm run test:coverage
```

## 配置文件

### Vite 配置 (vite.config.js)
```javascript
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: ['./src/test/setup.ts'],
  css: true,
}
```

### TypeScript 配置 (tsconfig.json)
```json
{
  "compilerOptions": {
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  }
}
```

### 测试设置文件 (src/test/setup.ts)
- 导入 `@testing-library/jest-dom` 扩展断言
- Mock `matchMedia`、`IntersectionObserver`、`ResizeObserver`

## 示例测试

### 工具函数测试 (src/lib/utils.test.ts)
测试 `cn` 函数的各种用例：
- 基本类名合并
- 条件类名
- Tailwind 冲突处理
- 空值处理

### 组件测试 (src/components/Button.test.tsx)
测试 Button 组件的：
- 默认渲染
- 不同变体和尺寸
- 点击事件处理
- 禁用状态
- 自定义类名
- 属性传递

### 页面组件测试 (src/routes/index.test.tsx)
测试 Home 页面组件的：
- 内容渲染
- CSS 类名应用

## 测试最佳实践

1. **文件命名**: 测试文件使用 `.test.ts` 或 `.test.tsx` 后缀
2. **测试结构**: 使用 `describe` 分组，`it` 描述具体测试用例
3. **断言**: 使用 `expect` 进行断言，利用 `@testing-library/jest-dom` 的扩展断言
4. **用户交互**: 使用 `@testing-library/user-event` 模拟用户操作
5. **Mock**: 使用 `vi.fn()` 创建 mock 函数

## 运行结果

当前项目包含 14 个测试用例，全部通过：
- 5 个工具函数测试
- 7 个 Button 组件测试  
- 2 个 Home 页面测试

```
Test Files  3 passed (3)
Tests       14 passed (14)
```

## 添加新测试

1. 在相应目录创建 `.test.ts` 或 `.test.tsx` 文件
2. 导入需要测试的函数/组件
3. 编写测试用例
4. 运行 `npm test` 验证

测试环境已完全配置，可以开始编写更多测试用例！