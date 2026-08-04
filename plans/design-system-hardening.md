# 设计系统巩固（迁移前）

范围：完成 #2–#7，暂不做 #1 全站迁移。所有改动限定在 `src/lib/components/design-system/`、
`src/app.css` 的 token 层、`/design-system` 页面与测试。站点路由不改。

---

## 1. 焦点环收敛为 token（#2）

**现状** `outline: 2px solid var(--brand)` 在 16 个设计系统组件里各写一遍，
`app.css:219` 还有一条全局 `button:focus-visible, a:focus-visible` 规则。
offset 取值分散：3px×13、2px×3、4px×1。

**做法**
- `app.css` 的 `:root` 增加 `--focus-ring: 2px solid var(--brand)` 与 `--focus-ring-offset: 3px`
- 全局规则（`app.css:219`）改为消费该 token
- 16 个组件的重复声明替换为 `outline: var(--focus-ring); outline-offset: var(--focus-ring-offset)`
- offset 统一到 3px；确有必要收紧的组件在自身作用域覆写 `--focus-ring-offset: 2px`，保留意图但集中定义

**不做** 站点组件（`blog-row`、`theme-toggle`、`project-card` 等）暂不接入，随迁移一并处理。

---

## 2. API 词汇统一与 props 文档（#5）

**核实后的结论**（比先前判断更窄）
- `tone` 在 `WeBaseAlert` / `WeBaseToast` / `WeBaseProgress` 里一致表示语义状态 —— 正确，不动
- `WeBaseBadge.tone` 是唯一越界者：`canonical | one-off | experiment` 是分类法而非状态
- `WeBaseButton` 与 `WeBaseIconButton` 各自定义了 ad-hoc 的 `type Icon` 别名，与既有 `WeBaseIconName` 重复

**做法**
- `WeBaseBadge` 的 `tone` 改名为 `variant`（仅 `/design-system` 页面在用，无外部调用方）
- 两处 `type Icon` 别名改为直接使用 `WeBaseIconName`
- `/design-system` 组件专区补 props 签名表：每个组件列出 prop、类型、默认值

---

## 3. 编辑向原语（#6）

**做法**
- 修复 `app.css` 中 `.section-label` 的重复定义（475 行与 810 行，后者静默覆盖前者）
- 新增 `WeBaseSectionHeader.svelte`（kicker + 标题 + 注解），收敛 `.section-label` 与页面内
  `.ds-kicker` / `.ds-section-head` 两套实现
- 新增 `WeBaseTag.svelte`，替代 `BlogRow` / `blog/tags` / `blog/tags/[tag]` 三处手写标签
- `/design-system` 新增 Typography / Prose 专区，展示已全局存在但从未文档化的 `.prose`
  （`app.css:1098+`），这是站点最重要的排版表面

**明确不做** `AlbumWall`（885 行）与 `ArticleToc`（423 行）均为单处使用，抽取属过早抽象。

**注意** 新增的两个组件在迁移前不会有站点调用方，仅在 `/design-system` 中展示。

---

## 4. 视觉回归基线（#3）

**约束** CI 为 `ubuntu-latest`；本地为 darwin。字体渲染差异会让 macOS 生成的基线在 CI 全挂。
Playwright 版本 `1.62.0` → 镜像 `mcr.microsoft.com/playwright:v1.62.0-noble`。

**做法**
- `playwright.config.ts` 新增独立 project `visual`（仅 chromium），默认 `test:e2e` 不含它，
  以免本地 macOS 运行必然失败
- 新增 `tests/e2e/visual.spec.ts`：`/design-system` 各专区在明暗两主题下的截图，
  断点取 375 / 768 / 1440
- 新增 `scripts/visual-baseline.sh`：在官方镜像内 `npm ci && npm run build &&
  npx playwright test --project=visual --update-snapshots`。容器内必须重装依赖——
  macOS 的 `node_modules` 含 sharp 原生二进制，挂载进 Linux 会失效
- `package.json` 增加 `test:visual` 与 `test:visual:update`
- `.github/workflows/check.yml` 增加在同一镜像内运行 `visual` project 的步骤；
  用容器而非 runner 原生环境，确保与基线生成环境逐像素一致
- 基线提交至 `tests/e2e/visual.spec.ts-snapshots/`

**代价（已确认接受）** 更新基线需要 Docker；基线文件进仓库。

---

## 5. 组件行为测试（#4）

**约束** 仓库无任何组件测试库（无 testing-library、无 jsdom/happy-dom），仅 vitest。
现有 `tests/unit/design-system.test.ts` 是源码静态分析式的（token 完整性、aria 契约）。

**做法** 不引入新依赖，改在 Playwright 中测真实行为——`/design-system` 页面已经把每个
组件渲染在真实状态下。扩展 `tests/e2e/design-system.spec.ts`：
- `WeBaseSelect`（315 行，复杂度最集中）：typeahead、方向键、Home/End、Escape 关闭并归位焦点
- `WeBaseSlider`：方向键步进、Home/End、越界钳制
- `WeBasePagination`：首尾边界不越界
- `WeBaseTabs`：方向键环绕、Home/End

---

## 6. 图标策略（#7）

**核实结论：不是问题，无需改动。** `WeBaseIcon` 并未按名引入 Lucide，而是把 23 个图标路径
内联为字面量 record，只从 `@lucide/svelte` 引入通用 `Icon` 渲染器。tree-shaking 无关；
`/design-system` 的 68.6 KiB JS 与图标无关。

**仅补文档** 在设计系统页 Iconography 专区注明两点权衡：23 个图标整体打包（约 1.5 KiB
gzip）、内联副本与上游 Lucide 脱钩。图标数达三位数时才需要重新评估。

---

## 验证

每个工作项完成后跑 `npm run verify` 与 `npx playwright test`。
最后一次性确认：明暗双主题 axe 无违规、53+ 个 E2E 全绿、性能预算不超硬上限。

`plans/performance-baseline.json` 按先前约定保持不动。
