# 博客系统后续开发路线图

> 项目：Will Xue Blog
> 初版日期：2026-07-29
> 最近整理：2026-08-01
> 制定时分支：`codex/velite-yaml-migration`
> 状态规则：所有工作只归入“已完成”“待开发”“延期”中的一类

## 一、产品方向

网站已经具备稳定的页面结构、视觉语言、动效、响应式、SEO、静态部署和自动化测试。后续开发不再以增加页面或装饰性动画为目标，而是围绕以下方向持续完善：

1. 让 Markdown/YAML 内容平台保持稳定、可验证和易于发布。
2. 让 Blog、Projects、Album 和 Sketchbook 形成统一的个人创作档案。
3. 用真实访问和性能数据决定搜索、双语、Newsletter 等增长功能。
4. 保持静态优先、低维护成本和当前具有辨识度的编辑式视觉语言。

长期产品定位：

> 一个以技术、设计、艺术和旅行观察为主线的个人创作档案，而不只是文章列表或通用作品集。

## 二、长期约束

后续所有开发继续遵守：

1. **保留辨识度**：继续使用纸张、墨水、衬线正文、手绘图像和克制动效，不改成通用卡片式产品站。
2. **保留 Hero 自动播放**：桌面端和移动端进入或刷新首页时继续播放现有翻页序列；性能优化不能删除或弱化这套逻辑。
3. **尊重 reduced-motion**：减少运动时跳过物理翻页，但保留完整内容和必要的颜色反馈。
4. **静态优先**：保持无数据库、无生产 Node 服务的架构，除非未来功能有明确的服务端需求。
5. **内容源唯一**：Markdown/YAML 是唯一人工维护来源，生成目录不得手工编辑。
6. **受信任内容边界**：仓库内 Markdown/YAML 可在构建期生成 HTML；外部 CMS、用户投稿或自动同步内容接入前必须先增加清洗层。
7. **用指标验收**：每轮必须有构建、测试、包体、性能或真实用户数据，不能只凭视觉感觉判断完成。

## 三、状态总览

| 原阶段 | 当前状态 | 说明 |
| --- | --- | --- |
| Phase 0：Velite 迁移收口 | 已完成 | server-only 内容层、生成物策略、schema 失败测试和 HTML 信任边界均已落地 |
| Phase 1：图片与性能管线 | 已完成 | 响应式图片、Hero 调度、Album 分层、页面传输、构建体积和实验室性能预算均已落地 |
| Phase 2：内容模型与发布流程 | 已完成 | 内容字段、标签、Content CLI、alt 专项检查和 PR 预览均已落地 |
| Phase 3：内容发现和分享 | 部分完成 | 相关文章、系列、OG、JSON-LD、Sitemap 和 RSS 完成；搜索明确延期 |
| Phase 4：个人创作档案 | 已完成 | 跨内容关系、扩展元数据、统一 Archive 和 3 个完整 Project 过程案例均已落地 |
| Phase 5：可观测性与持续质量 | 部分完成 | 自动化质量覆盖和生产 Analytics 采集已生效；14 天数据观察仍在进行 |

## 四、已完成

### 4.1 内容平台稳定版

- [x] 将完整内容读取集中到 `$lib/server/content`。
- [x] 列表页和详情页迁移到 `+page.server.ts`，由预渲染阶段提供数据。
- [x] 为列表页提供不含正文 HTML 的 `PostSummary` / `ProjectSummary`。
- [x] 确认 `src/lib/generated/content/`、`static/generated/` 和 `site.webmanifest` 的生成物所有权。
- [x] 由 CI 校验生成的 Web Manifest 与 YAML 来源没有漂移。
- [x] 覆盖无效日期、非法 slug、空标签、未知字段、重复 ID、重复 Project order、错误图片尺寸和内容引用失败。
- [x] 明确未来日期文章必须保持 draft，静态站点不伪装定时发布。
- [x] 在 README 中记录仓库受信任 Markdown 的 HTML 边界。
- [x] 保留无 JavaScript 阅读、静态预渲染和客户端导航能力。

Milestone A 验证记录（2026-07-30）：Vitest 24/24、Playwright 16/16、`svelte-check` 0 errors / 0 warnings、生产构建及干净检出生成验证通过。

### 4.2 媒体性能版

- [x] 使用 Velite + Sharp 为 Hero、Album、封面、Portrait 和 Markdown 正文生成响应式 WebP。
- [x] 输出 `srcset`、`sizes`、固有宽高和内容哈希文件名。
- [x] 为 `/generated/*` 配置一年 immutable 缓存。
- [x] Hero 改为渐进式预取，同时保留自动播放、手动翻页、键盘控制和刷新重播。
- [x] 移动端不再一次加载全部隐藏 Hero 原图。
- [x] Album 使用缩略图和按需灯箱大图，未打开灯箱时不下载全部大图。
- [x] 保留 Album 空间连续动画、EXIF、焦点管理和键盘导航。
- [x] 为首页和 Album 建立页面传输预算 E2E。

Milestone B 验证记录（2026-07-30）：

| 页面 | 优化前 | 优化后 | 预算 |
| --- | ---: | ---: | ---: |
| 首页 Hero 自动播放完成 | 约 8.50 MB | 约 1.36 MiB | ≤ 2.5 MiB |
| Album 首屏 | 约 10.15 MB | 约 0.67 MiB | ≤ 2.0 MiB |

同时验证 Vitest 27/27、Playwright 18/18、`svelte-check` 0 errors / 0 warnings；Chrome 本地无网络限速追踪保持 CLS 0.00。

### 4.3 内容模型与内容发现版

- [x] 为文章加入 `updated`、`series`、`related`、`relatedProjects` 和 `relatedAlbum`。
- [x] 为 Project 和 Album 加入首批相关文章、项目和作品关联。
- [x] 在构建期检查未知、缺失、重复、自引用、草稿目标和 series 顺序冲突。
- [x] 建立 6 个稳定标签及 `/blog/tags`、`/blog/tags/[tag]` 页面。
- [x] 标签页具备 prerender、canonical、独立描述和 Sitemap 地址。
- [x] 文章底部显示系列、相关文章、相关项目和 Album 作品。
- [x] Project 页面显示相关文章和 Album 作品。
- [x] Album 灯箱显示相关 Blog 和 Project。
- [x] 首页输出 `Person` / `WebSite` JSON-LD。
- [x] 文章输出 `BlogPosting`，Project 输出 `CreativeWork`，Album 输出 `ImageGallery`。
- [x] 自动生成 1200×630 OG 图片，并提供站点级 fallback。
- [x] Sitemap 使用可靠的 `lastmod`，RSS 输出分类。
- [x] 发布 7 篇非示例文章，并保留 1 篇 Markdown 视觉回归文章。

Milestone C 验证记录（2026-07-30）：Vitest 32/32、Playwright 22/22、`svelte-check` 0 errors / 0 warnings；三个目标视口无横向溢出。

### 4.4 持续质量与部署保护

- [x] Chromium 运行完整 Playwright 回归。
- [x] Firefox 和 WebKit 运行核心公开流程烟雾测试。
- [x] axe 检查首页、Blog、文章、Project 和 Album 的 WCAG A/AA 自动检测规则。
- [x] 使用独立有效/无效夹具检查 YAML 和 Markdown schema。
- [x] `npm run verify` 在构建后检查内部链接、锚点和外部断链。
- [x] Cloudflare 上传后使用 Wrangler 返回的精确部署 URL 检查 Home、Blog、Album、RSS、Sitemap 和真实 404。
- [x] CSP 已允许 Cloudflare Web Analytics 官方脚本和 RUM 端点。
- [x] 已记录生产启用前的隐私边界与性能快照。

最新完整验证（2026-07-30）：

- Vitest：35/35。
- Playwright：31/31。
- `svelte-check`：0 errors，0 warnings。
- axe：5 个代表路由无可自动检测的 WCAG A/AA 违规。
- 链接：293 个内部链接和 5 个外部链接通过。
- 首页 Hero 自动播放、移动端翻页和 reduced-motion 回归通过。
- 部署后六端点巡检脚本通过本地真实 HTTP 验证。

## 五、待开发

### 5.1 启用生产访问统计

**优先级：P1；外部操作**

- [x] 在 Cloudflare Pages 项目 Metrics 中启用 Web Analytics（2026-07-30）。
- [x] 使用包含当前 CSP 和部署后烟雾检查的版本重新部署（2026-07-30）。
- [x] 确认生产 HTML 仅注入一份官方 beacon，并在真实浏览器中发出 RUM 请求。
- [x] 确认 Cloudflare Dashboard 开始显示页面访问和 Core Web Vitals 数据（2026-08-01 已出现访问、LCP 和 CLS 样本；INP 尚无样本）。
- [ ] 按 `plans/analytics-baseline.md` 连续观察 14 天。
- [ ] 记录页面访问、来源、SPA 导航和 Core Web Vitals 的 p75。
- [ ] 将 14 天观察结论写回路线图或独立分析文档。

完成标准：

- 生产 Web Analytics 能持续收到数据。
- 隐私边界仍是不使用 Cookie、`localStorage`、邮件地址或设备指纹。
- 结论明确记录哪些指标足以支持下一阶段决策，哪些仍缺少数据。

首个生产数据检查点（2026-08-01，过去 3 天、GMT+8）：Dashboard 显示 7 次访问、7 次页面浏览、页面加载时间 1,534 ms，LCP p75 为 1,180 ms，CLS 样本 100% 落在 good 区间，INP 尚无数据。7 次浏览中有 2 次来自 ChromeHeadless，且全部来源显示为直接访问，因此当前样本只证明采集链路有效，不能用于恢复搜索、双语、Newsletter、自定义事件或错误监控。完整记录见 `plans/analytics-baseline.md`。

### 5.2 补齐发布工作流

**优先级：P1**

已经完成：draft 过滤、发布前单命令验证、内容引用检查、断链检查和格式展示文章夹具。

#### 方案：仓库内专用 Content CLI

采用 CLI 是合适的：创建、检查、预览和发布准备都是可重复、适合自动化的线性流程，也能让 Blog 与 Project 共用同一套 schema 和错误提示。第一版保持为仓库内工具，通过 `npm run content -- ...` 调用，复用项目已有的 Node.js 运行时，不发布全局 npm 包，也不引入独立服务。

CLI 负责本地、可恢复的内容状态变更；Cloudflare PR 预览仍由 CI 负责。CLI 不提交 Git、不 push、不创建 PR、不持有 Cloudflare 凭据，也不把“将 `draft` 改为 `false`”描述成已经部署上线。

计划命令面：

| 命令 | 作用 |
| --- | --- |
| `npm run content -- new post` | 交互式创建 Blog 草稿；默认使用站点时区当天日期和 `draft: true` |
| `npm run content -- new project` | 交互式创建 Project 草稿，并检查必填封面和未占用的 `order` |
| `npm run content -- check [post/slug\|project/slug]` | 快速检查一个目标；省略目标时检查全部内容 |
| `npm run content -- preview <post/slug\|project/slug>` | 检查后启动包含草稿的本地预览，并输出准确路由；`--open` 才打开浏览器，`--host` 才暴露局域网地址 |
| `npm run content -- publish <post/slug\|project/slug>` | 执行发布前检查，确认后将目标改为 `draft: false` 并运行完整 `npm run verify`；失败时恢复原文件 |

`new`、`publish` 等写操作支持 `--dry-run`。交互模式之外，所有必填值都可用完整名称 flag 传入；`--no-input` 禁止提示，缺少参数时直接失败并说明应补哪个 flag，便于脚本和未来编辑器集成。

#### CLI 规范

已按 [Command Line Interface Guidelines](https://clig.dev/) 实现并测试：

- [x] 顶层和每个子命令支持 `-h` / `--help`，顶层支持 `--version`；无参数时给出简短说明、常用示例和下一步。
- [x] 使用 Node 参数解析能力统一处理 subcommand 和 flag，不自行拼接不可靠的参数解析逻辑。
- [x] 成功返回 `0`；用稳定的非零退出码区分用法错误、内容校验失败和运行失败；`Ctrl-C` 尽快退出并停止预览子进程。
- [x] 主要结果写入 `stdout`，进度、警告和可操作错误写入 `stderr`；提供 `--json` 供脚本读取。
- [x] 只在 TTY 中显示颜色或动态进度；支持 `NO_COLOR` 和 `--no-color`，非 TTY 输出不含动画和 ANSI 控制符。
- [x] 错误同时说明问题位置、原因和修复动作，例如冲突 slug、未知 tag、重复 Project order、缺失图片和无效发布日期。
- [x] 写文件前完成输入校验，使用原子写入，不覆盖已有内容；输出实际修改的文件、当前 draft 状态和建议执行的下一条命令。
- [x] 不收集 CLI 使用数据，不静默访问网络；打开浏览器、暴露局域网地址和任何未来远程操作都必须由显式 flag 触发。

#### 内容规则与发布清单

- [x] `new` 直接生成符合当前 Velite schema 的最小 frontmatter，不复制旧文章；可选字段按需要加入，不生成无意义占位值。
- [x] slug 必须是 lowercase kebab-case；文件已存在、大小写冲突或 Project `order` 已占用时，在写入前失败。
- [x] 发布日期以 `site.yaml` 的时区为准；未来日期内容必须保持 draft，CLI 不提供伪定时发布。
- [x] 对 Markdown 正文的本地和远程图片做 AST 级 alt 检查，忽略代码块里的示例语法。
- [x] 正文图片的 alt 缺失、仅空白、等于文件名/URL，或只是 `image`、`photo`、`screenshot`、`TODO` 等占位词时失败；自动规则只拦截明显问题，发布清单仍要求人工确认描述表达了图片内容或用途。
- [x] `check` 复用 Velite schema、内容引用和静态资源校验，不维护第二套会漂移的内容模型；诊断尽量包含文件、字段或行号。
- [x] `publish` 在改变 draft 状态前显示将发生的本地修改并请求确认；`--no-input` 下必须显式传入确认 flag。
- [x] 将发布清单收敛为：创建草稿 → 准备图片与 alt → 快速检查 → 本地预览 → 发布 dry-run → 标记发布并完整验证 → 推送 PR → 查看 PR 预览 → 合并后确认生产巡检。

#### Pull Request 静态预览

- [x] 在 PR 的现有质量检查通过后复用同一份 `build/` artifact，通过 Wrangler 上传 Cloudflare Pages preview，避免为预览再次构建不同产物。
- [x] 使用按 PR 编号隔离的 preview branch 和 concurrency，新的 commit 取消旧任务；把 Wrangler 返回的精确部署 URL 更新到单一 PR 评论中。
- [x] 对预览 URL 运行现有部署端点巡检，成功后评论才标记为可评审；URL 必须无需本地环境即可在手机和桌面打开。
- [x] PR 评论记录 commit、预览 URL、检查状态和预览保留/清理规则，后续 commit 更新原评论而不是重复刷屏。
- [x] Cloudflare 凭据只用于同仓库受信任分支。fork PR 不接收 secrets，也不使用 `pull_request_target` 执行未受信任代码；此类 PR 明确提示没有自动预览。

#### 实施与验证

- [x] 为 CLI 参数、TTY / 非 TTY、`--no-input`、`--json`、退出码和人类可读错误增加单元或进程级测试。
- [x] 覆盖 Blog / Project 创建、重复 slug、重复 order、未来日期、无效 tag、缺失图片、无意义 alt、dry-run、不覆盖文件和 publish 失败回滚。
- [x] 为 draft 与 published 内容增加生产面回归，确认 Blog、RSS、Sitemap、标签页和直接详情路由都不会泄露草稿。
- [x] 计时验证“创建一篇最小 Blog 草稿 → 检查 → 打开本地详情预览”不超过 5 分钟；2026-07-31 本地演练约 12 秒完成。
- [x] 同步更新中英文 README，提供最短发布流程、完整命令参考、常见错误和 PR 预览限制。

完成记录（2026-07-31）：Vitest 49/49、Playwright 33/33、`svelte-check` 0 errors / 0 warnings、`npm run verify`、生产 draft 泄露检查和 324 个内部链接全部通过；本地预览路由返回正确文章页面。Cloudflare PR 上传与评论更新将在本次变更创建同仓库 Pull Request 后完成首次线上验证。

完成标准：

- 新内容不需要复制旧文章即可获得正确 frontmatter，从创建到本地预览可在 5 分钟内完成。
- CLI 在交互式终端中易发现，在 CI 和脚本中可无提示、可解析并使用可靠退出码。
- `npm run verify` 继续覆盖内容、类型、测试、构建和断链，CLI 不绕过或复制这条质量门禁。
- 草稿不进入正式 Blog、RSS、Sitemap、标签页或可猜测的详情路由。
- 每个受信任分支 PR 都有经过部署巡检、可在手机和桌面访问的静态预览 URL。
- 发布命令只准备仓库内内容状态，不会隐式提交、推送或部署。

### 5.3 补齐构建体积和实验室性能预算

**优先级：P1**

已经完成：首页和 Album 的实际页面传输预算。

- [x] 按 Hero、Album 缩略图/灯箱、正文、封面、Logo、Portrait 和 OG 角色检查单张生成图片最大体积。
- [x] 按单资源和代表路由检查关键 JavaScript / CSS gzip 体积。
- [x] 在 Chromium 固定 4 倍 CPU / 40 ms 延迟配置下检查首页与 Album 的 LCP、CLS，并用首页真实点击延迟作为 INP 等价合成门禁。
- [x] 使用 Vite manifest 的稳定语义名称比较构建产物；增长达到 1 KiB 时输出路由、chunk、哈希文件和前后体积。
- [x] 在中英文 README 明确实验室门禁只用于可重复回归，Cloudflare 第 75 百分位 RUM 才是生产 LCP、CLS、INP 判断依据。

完成记录（2026-08-01）：当前最大生成图片为 Album lightbox 581.8 KiB、最大正文图片 538.3 KiB；首页约 52.8 KiB JS gzip + 9.5 KiB CSS gzip，Album 约 50.9 + 11.7 KiB。Chrome DevTools 本地无网络限速基线为首页 LCP 1.381 s / CLS 0.00、Album LCP 0.402 s / CLS 0.00；固定 CI 实验室配置下新增 4 个性能用例全部通过。预算保留完整图片可读性和 Hero 自动播放。

完成标准：

- 超预算时 CI 给出具体资源或 chunk，而不是只输出总分。
- 不通过降低图片可读性或删除 Hero 自动播放来满足预算。

### 5.4 扩展个人创作档案元数据

**优先级：P2**

已经完成：Blog、Project 和 Album 的首批跨内容引用与反向摘要。

已完成：

- [x] Blog 增加可选 `locations`；只填写真实内容明确支持的地点。
- [x] Project 使用 `startYear`、可选 `endYear`、`status`，并增加受控 `locations`、`roles`、`media`。
- [x] Album photo 使用 `date`、`dateKind`、受控 `locations` 和 `media`；不猜测未确认地点。
- [x] `src/content/config/metadata.yaml` 成为 taxonomy 唯一来源；Velite 与 Content CLI 拒绝未知或重复 slug，并校验年份范围。
- [x] server boundary 将 slug 转为展示摘要；有内容才显示元数据，不产生空标签或占位布局。

完成标准：

- 字段来自真实内容需要，而不是为了让 schema 看起来完整。
- Blog、Project 和 Album 可以按时间或类型汇总，为 Archive 提供稳定数据。

完成记录（2026-08-01）：真实内容、schema fixtures、CLI 和页面展示均已同步；5.5 完成后的总计为 `npm test` 54/54、`npm run check` 0 errors / 0 warnings。

### 5.5 开发第一版 Archive

**优先级：P2；依赖 5.4**

- [x] 新增 `/archive`。
- [x] 同时汇总文章、项目和 Album 作品。
- [x] 按年份时间线组织，并提供 All / Writing / Projects / Album 类型筛选。
- [x] 每个条目链接回现有详情页或 Album 锚点，不复制正文。
- [x] 使用克制的索引式编辑排版，不做 dashboard 或大型筛选面板。
- [x] 为 Archive 增加 prerender、canonical、JSON-LD、Sitemap、无 JavaScript阅读和响应式测试。

完成标准：

- 三类内容可以在一个页面中按时间浏览。
- Archive 客户端数据不包含所有文章或 Project 正文 HTML。
- 390×844、768×1024、1440×1000 无横向溢出。

完成记录（2026-08-01）：Archive 使用 server-only compact entries 汇总 8 篇文章、3 个 Project 和 10 个 Album works；`npm run verify` 通过，Playwright 35/36，唯一失败是用户保留的 `ContentRelations.svelte` 相册轨道 axe `target-size` 已知问题。后续 5.6 Project 过程案例也已完成。

### 5.6 将 Project 扩展为过程案例

**优先级：P2；内容工作**

- [x] 为 3 个现有 Project 补充真实 Context / Problem。
- [x] 补充 Constraints 和 Role。
- [x] 补充 Key decisions 和 Process。
- [x] 补充 Outcome；不虚构商业指标、客户反馈或未记录结果。
- [x] 使用现有 related posts 与 Album works 连接过程说明和视觉作品。
- [x] 保留建筑、runway 和持续艺术集合的真实差异；章节是内容指导而非强制 schema。

完成标准：

- Project 不再只是图片和一句说明。
- 至少 2 个 Project 可以作为独立、完整的设计案例阅读。

完成记录（2026-08-01）：CanopyCoffee、Fashion Design 和 Art 均已扩展为可独立阅读的过程案例；下一步进入延期项目复审，需等待完整 14 天 Analytics 数据与内容规模变化。

## 六、延期

以下项目不进入当前开发排期。只有满足触发条件后，才从“延期”移入“待开发”。

### 6.1 有明确启用门槛

- **静态搜索**：已发布文章达到 15 至 20 篇，或访问数据表明用户需要寻找旧内容，且标签和相关文章不足以覆盖主要路径时，再评估 Pagefind。
- **文章 `featured` 字段**：首页或 Blog 出现明确精选内容版位后再加入。
- **文章 `language` 字段**：出现稳定的多语言内容，而不只是个别翻译时再加入。
- **匿名自定义事件**：Cloudflare Web Analytics 的 14 天数据证明 Album 打开、内容流转或 RSS 转化值得追踪后再设计。
- **错误监控服务**：真实浏览器错误率或故障排查成本表明现有测试和部署巡检不足时，再评估 Sentry。
- **地图视图**：Archive 已有足够地点数据后再开发，避免先做空地图。
- **Newsletter 后台**：建立稳定更新频率后，再评估 Buttondown、Loops 等托管方案。

延期项目首轮复审（2026-08-01）：全部继续延期。当前只有 8 篇已发布文章，未达到静态搜索的 15 至 20 篇内容门槛；前三天 Web Analytics 只有 7 次访问且包含 2 次 ChromeHeadless，没有搜索需求、内容漏斗、错误率或 Newsletter 转化证据；当前地点词表有 6 个地点，但 Archive 数据密度尚不足以让地图优于现有时间线。`featured`、`language` 和 Newsletter 的内容运营门槛也未出现。下一次复审时间为 2026-08-13 之后，或已发布文章、地点内容、更新频率提前达到对应门槛时。

### 6.2 明确暂不开发

- 用户账号、登录、个人资料和权限系统。
- 自建评论、点赞、通知和社交关系。
- 数据库或完整 CMS。
- PWA、离线阅读和推送通知。
- 全站一比一中英双语镜像。
- 为视觉效果增加更多首屏重动画、3D 或大型动画库。
- 没有明确内容或用户需求的通用 dashboard。

## 七、推荐实施顺序

| 顺序 | 工作包 | 原因 |
| --- | --- | --- |
| 1 | 5.1 启用 Analytics 并重新部署 | 先开始 14 天数据观察，等待期间可继续开发 |
| 2 | 5.2 发布工作流 | 降低后续持续写作和内容维护成本 |
| 3 | 5.3 构建体积与实验室性能预算 | 在继续增加内容和页面前固定性能边界 |
| 4 | 5.4 扩展创作档案元数据 | 为跨内容时间线准备可靠数据 |
| 5 | 5.5 Archive 第一版 | 形成下一阶段最有辨识度的产品能力 |
| 6 | 5.6 Project 过程案例 | 用真实内容填充 Archive 和跨内容关系 |
| 7 | 延期项目复审 | 只根据访问数据、内容规模和维护成本重新排期 |

Analytics 启用需要 Cloudflare 外部操作；等待 14 天数据期间，可以并行推进发布工作流和性能门禁。

## 八、统一完成标准

每个待开发工作包完成前必须满足：

- `npm run verify` 通过。
- `npm run test:e2e` 通过。
- `git diff --check` 通过。
- 390×844、768×1024、1440×1000 三个视口无横向溢出和内容重叠。
- 浅色、暗色、键盘、触屏和 reduced-motion 关键流程通过。
- 新增内容字段、脚本和页面同步更新中英文 README。
- 性能相关变更记录变更前后数据，不只报告 Lighthouse 总分。
- 不删除或弱化首页 Hero 的现有自动播放逻辑。
- 不把延期项目作为顺手扩展混入当前工作包。

## 九、当前下一步

当前没有需要继续编码的新功能项。下一步按顺序执行：

1. 保持生产 Web Analytics 采集，完成 2026-07-30 至 2026-08-13 的 14 天观察窗口。
2. 在 2026-08-13 后记录页面访问、来源、热门路径、SPA 导航，以及 LCP / INP / CLS p75；明确区分真实访问与 ChromeHeadless 等验证流量。
3. 根据完整观察结果和届时内容规模复审延期项目，再决定是否把某一项移回“待开发”。

仓库内功能型 roadmap 已推进至 **延期项目复审**；首个生产数据检查点已证明采集链路有效，但样本仍不足以支持搜索、双语、Newsletter 或其他增长功能。

在 Analytics 数据达到决策门槛前，不提前建设搜索、自定义事件、错误监控或新的首屏重动画。
