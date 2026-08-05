# WeBaseUI 架构与迁移计划

状态：Phase 1–3 已完成；Phase 4 全站迁移与 registry 发布完成，等待 xue 迁移 PR 和生产部署收口
日期：2026-08-05
目标：把当前站点内的设计系统收敛为可独立发布的 WeBaseUI，并为未来 React 适配保留清晰边界。

## 1. 目标与成功标准

WeBaseUI 不是当前 `/design-system` 页面的复制品，而是由平台无关基础、框架适配层和文档应用组成的产品：

```text
                         ┌────────────────────┐
                         │   WeBaseUI docs app   │
                         └─────────┬──────────┘
                                   │ consumes
                    ┌──────────────┴──────────────┐
                    │                             │
          ┌─────────▼──────────┐       ┌──────────▼─────────┐
          │  @webaseui/svelte     │       │  @webaseui/react      │
          │  current adapter   │       │  future adapter    │
          └─────────┬──────────┘       └──────────┬─────────┘
                    │                             │
                    └──────────────┬──────────────┘
                                   │ consumes
                         ┌─────────▼──────────┐
                         │   @webaseui/core      │
                         │ tokens + contracts│
                         └────────────────────┘
```

第一阶段完成时必须满足：

- 当前网站通过 registry 包消费 WeBaseUI，而不是继续维护站点私有组件副本。
- `@webaseui/core` 可被任何 Web 技术栈直接消费，不依赖 Svelte。
- `@webaseui/svelte` 可独立构建、生成类型声明并打包。
- 组件的公共入口明确，消费方不依赖包内文件路径。
- 明暗主题、键盘行为、SSR 和现有视觉外观不回退。
- CI 能验证打包产物，而不只验证仓库源码。

## 2. 包与目录边界

第一阶段采用当前仓库内的 npm workspaces，先证明包边界，再迁往独立仓库：

```text
packages/
├── webaseui-core/
│   ├── package.json
│   └── src/
│       ├── tokens.css          # reference + semantic tokens
│       └── theme.css           # light/dark theme contract
└── webaseui-svelte/
    ├── package.json
    ├── svelte.config.js
    └── src/lib/
        ├── index.ts            # only supported component entry
        └── components/WeBase*.svelte

src/routes/design-system/       # remains the docs app during phase 1
examples/                       # later: packed-package consumer fixtures
```

依赖必须保持单向：

```text
website/docs -> @webaseui/svelte -> @webaseui/core
future React -> @webaseui/react  -> @webaseui/core
@webaseui/core -> no framework dependency
```

## 3. Token 与主题契约

当前 `--paper`、`--brand` 等变量属于全局短名称，迁移时改由 `@webaseui/core` 管理。第一阶段保留旧名称以避免一次改写全部组件，同时新增稳定的 `--webase-*` 名称并建立别名：

```text
--webase-color-canvas     -> --paper
--webase-color-surface    -> --surface
--webase-color-ink        -> --ink
--webase-color-brand      -> --brand
--webase-duration-fast    -> --duration-fast
```

兼容别名只用于迁移。新组件只能消费 `--webase-*`。React 适配层未来消费同一组 CSS 变量，而不是复制颜色常量。

主题状态继续由消费应用负责。WeBaseUI 提供 CSS 契约，不读取 localStorage、不决定系统主题，也不持有站点的 Svelte store。

字体拆成可选能力。字体变量属于 core；字体二进制是否进入未来发布包，必须先确认 Futura 的再分发授权。

## 4. Svelte 公共 API

`@webaseui/svelte` 使用 Svelte 5 和 `@sveltejs/package`。公共 API 只从包根导出：

```ts
import { WeBaseButton, WeBaseDialog, WeBaseSelect } from '@webaseui/svelte';
import '@webaseui/core/theme.css';
```

规则：

- 禁止文档站或消费项目深层导入 `src/lib/components/*`。
- 对外导出稳定的组件名和必要类型；内部帮助函数不进入公共入口。
- Svelte 是 peer dependency；Lucide 是明确的运行依赖，直到图标渲染器完全自有。
- 浏览器 API 只能在生命周期或事件内访问，保证 SSR import 安全。
- 本轮迁移不同时重做组件交互 API。`Snippet`、原生属性透传等库化改造单独演进，避免结构迁移和行为改写混在一次变更中。

## 5. React 兼容策略

React 支持是独立适配层，不是 Svelte-to-React 转译：

- 复用：CSS tokens、主题属性、组件命名、状态模型、ARIA 契约、键盘交互矩阵、视觉基线。
- 不复用：Svelte runes、组件实例、生命周期代码和框架事件语法。
- 复杂组件先形成框架无关行为规范，再分别实现。例如 Select 的 typeahead、Home/End、Escape 和焦点归位必须在两个适配层表现一致。
- 当 React 工作真正开始时再创建 `@webaseui/react`；本轮不增加 React 依赖或空壳包。

## 6. 测试与发布边界

```text
source checks
    ├── token completeness
    ├── public export contract
    ├── SSR-safe imports
    └── component API drift

browser checks
    ├── keyboard interaction
    ├── WCAG Axe
    ├── light/dark visual baselines
    └── reduced motion

package checks
    ├── @sveltejs/package build
    ├── npm pack contents
    └── fixture installs packed tarball
```

独立 registry 发布不在第一阶段自动执行。第一阶段交付可构建、可打包的 artifact；后续迁入独立仓库后，以 tag + CI 发布 npm 或 GitHub Packages。

## 7. 执行阶段

### Phase 1：当前仓库内证明包边界

- [x] 配置 npm workspaces。
- [x] 建立 `@webaseui/core`，迁移 token 和主题定义。
- [x] 建立 `@webaseui/svelte`，迁移组件并提供根入口。
- [x] 让 `/design-system` 和现有站点调用方通过包名消费。
- [x] 更新静态 API 测试与路径假设。
- [x] 增加 package build / pack 验证。
- [x] 运行类型、单元、E2E、视觉、性能和构建检查。

Phase 1 执行记录（2026-08-04）：

- `@webaseui/core` 已提供带 `--webase-*` 命名空间的 token、明暗主题与旧变量兼容别名。
- 26 个 Svelte 组件已迁入 `@webaseui/svelte`，只通过包根导出，并生成 JS 与 `.d.ts`。
- 当前设计系统页已通过 workspace 包消费组件；仓库内不再存在组件深层导入。
- `npm run check:webaseui` 会构建包并对 `npm pack --dry-run` 清单执行契约断言。
- 67 个单元测试、27 个设计系统/无障碍浏览器测试和 14 个视觉基线测试通过。
- ESLint、Svelte check、生产构建和性能预算通过。

### Phase 2：公共 API 库化

- [x] 为组件导出命名 Props 类型。
- [x] 为内容型组件增加 Svelte 5 Snippet 组合点。
- [x] 统一 class、style、data-*、ARIA 与原生事件透传。
- [x] 发布弃用策略和 SemVer 规则。

Phase 2 执行记录（2026-08-04）：

- `@webaseui/svelte` 升级为 0.2.0，包根导出 26 个 `WeBase*Props` 类型。
- Alert、Card 与 EmptyState 增加可选 Snippet 组合点，原字符串 Props 和默认值保持兼容。
- 所有组件的根元素支持消费方 class、style、data-*、ARIA 与原生事件属性。
- 发布物包含 README、CHANGELOG 与 VERSIONING，明确 0.x、SemVer 和弃用窗口。
- 组件 API 测试覆盖类型导出、Snippet 声明与属性透传，浏览器测试验证真实 DOM 属性。

### Phase 3：独立仓库与发布

- [x] 创建 WeBaseUI 独立仓库并迁移 `packages/*`、consumer fixture 与发布基础设施。
- [x] 将 docs app 从当前站点迁入 WeBaseUI 仓库。
- [x] 增加 Changesets 或等价版本流程。
- [x] 从打包 tarball 安装的 consumer fixture 成为发布门禁。
- [x] 发布 `@webaseui/core` 与 `@webaseui/svelte` 0.x 版本。
- [x] 当前网站从 workspace 依赖切换到 registry 版本。

Phase 3 发布准备记录（2026-08-04）：

- GitHub 仓库已创建为 `https://github.com/WeOpen/WeBaseUI`，本地仓库位于 `/Users/willxue/will/WeOpen/WeBaseUI`。
- 独立仓库包含 `@webaseui/core`、`@webaseui/svelte`、Changesets、CI 和 tarball consumer fixture；构建产物未进入版本控制。
- WeBaseUI 独立仓库现包含 `apps/docs` 作为 canonical catalogue；它只通过公开包入口消费 core 与 Svelte 包，并由 package CI 强制构建。
- 当前站点继续保留 `/design-system` 作为真实 registry 消费方和部署证明，但不再承担库文档源码职责；站点内的 workspace 包、Changesets 和 tarball fixture 已移除。
- Changesets 已配置为 public access，并约束所有用户可见的包变化附带 changeset。
- 独立 Svelte fixture 会打出真实 tarball、安装到临时项目并执行 Vite 生产构建。
- CI 已增加 tarball consumer 门禁，避免 workspace 软链接掩盖发布物缺失。
- CI 依赖审计已通过精确的已修复传递依赖版本收敛为 0 vulnerabilities。
- `@webaseui/core@0.1.0` 与 `@webaseui/svelte@0.2.0` 已公开发布，并建立对应 GitHub Releases。
- `xue` 已切换到 registry 版本；组件 API 使用 `WeBase*`，公共 token 使用 `--webase-*`。

### Phase 4：当前站点全页面迁移

- [x] 增加 `WeBaseLink` 与 `WeBaseTag`，补足站点导航和分类语义。
- [x] 将 xue 源码中的短 token 消费全部切换为 `--webase-*` canonical token。
- [x] 迁移共享导航、错误页、归档、相册、博客、标签、文章和项目详情页。
- [x] 迁移首页业务组合中的文本链接与分类标签。
- [x] 保留相册灯箱、文章目录、翻页册和拉绳开关等站点专属组合，仅复用其内部 WeBaseUI primitive。
- [x] 增加全路由行为基线和 WeBaseUI 架构边界测试。
- [x] 发布 `@webaseui/svelte@0.3.2` 并将 xue 的精确依赖更新到 0.3.2。
- [ ] 合并 xue 迁移 PR 并验证生产部署。

Phase 4 执行记录（2026-08-05）：

- 所有 10 个公开页面路由均直接或通过首页业务组合消费 `@webaseui/svelte`。
- `WeBaseLink` 与 `WeBaseTag` 已在 WeBaseUI PR #5 合并，并随 `@webaseui/svelte@0.3.0` 发布。
- 全站性能门禁发现包根入口会带入未使用组件；WeBaseUI PR #6 增加 `sideEffects: false` 和 packed-consumer tree-shaking 回归测试，并以 `@webaseui/svelte@0.3.1` 发布修复。
- 全站无障碍门禁发现 Tag 小字号对比度不足；WeBaseUI PR #7 修复明暗主题颜色并增加包契约检查，以 `@webaseui/svelte@0.3.2` 发布。
- xue 源码已不再消费 `--paper`、`--brand` 等兼容别名，也不存在组件深层导入。
- 类型检查、73 个单元测试、生产构建和 12 个全路由 Chromium 基线测试通过。
- xue 已从 npm registry 精确安装 `@webaseui/svelte@0.3.2`；源码、包构建、GitHub CI 与 registry 发布均已通过。

### Phase 5：React 适配

- [ ] 根据真实 React 项目确定最低 React 版本和构建目标。
- [ ] 建立 `@webaseui/react`，从低状态组件开始实现。
- [ ] 复用 core token、行为规范与跨框架契约测试。
- [ ] Select、Dialog 等复杂组件在独立无障碍审查后进入稳定 API。

## 8. 风险与控制

| 风险 | 控制 |
| --- | --- |
| 当前工作区已有未提交的设计系统巩固改动 | 迁移文件时保留工作树内容；不 reset、不覆盖现有变更 |
| 大规模移动导致测试路径和 import 同时失效 | 先建立包入口，再逐个迁移调用方；每一步运行 check |
| token 改名造成全站视觉变化 | 第一阶段使用兼容别名，视觉基线与性能预算作为门禁 |
| 包源码可用但发布物缺文件 | 构建后检查 pack 清单，并用 fixture 安装 tarball |
| React 预留演变成过早抽象 | 只固定 core 契约，不创建空 React 包、不引入 React 依赖 |
| 字体授权不允许再分发 | 字体包保持可选，授权确认前不随 registry 发布 |

## 9. 后续范围

- 不引入 React 或跨框架运行时。
- 不重写现有组件视觉和交互。
- React 适配继续推迟，直到出现真实 React 消费项目。
- 站点专属业务组合不下沉到 WeBaseUI；只有可跨项目复用的 primitive 才进入公共包。

## GSTACK REVIEW REPORT

| Runs | Status | Findings |
| --- | --- | --- |
| Scope | PASS | 采用 strangler 迁移；先在当前仓库证明包边界，避免复制和大爆炸迁移 |
| Architecture | PASS | core 与框架适配层单向依赖；React 不共享框架源码 |
| Code quality | PASS | 结构迁移与组件 API 重设计分阶段，避免一次变更混合两类风险 |
| Tests | PASS | 包构建、pack 内容、真实消费、浏览器与视觉门禁均有明确位置 |
| Performance | PASS | core 为纯 CSS；Svelte 包保留现有 tree-shaking 与预算检查 |
| Distribution | PASS | 独立仓库、CI、GitHub Releases、npm registry 发布与真实消费者安装均已完成 |

VERDICT: APPROVED FOR PHASE 1 EXECUTION

NO UNRESOLVED DECISIONS
