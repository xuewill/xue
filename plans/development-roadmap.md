# 博客系统后续开发路线图

> 项目：Will Xue Blog
> 初版日期：2026-07-29
> 最近整理：2026-07-30
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
| Phase 1：图片与性能管线 | 部分完成 | 响应式图片、Hero 调度、Album 分层和页面传输预算完成；更细的构建体积门禁仍待开发 |
| Phase 2：内容模型与发布流程 | 部分完成 | 内容字段、标签和首批内容完成；发布模板、alt 专项检查和 PR 预览仍待开发 |
| Phase 3：内容发现和分享 | 部分完成 | 相关文章、系列、OG、JSON-LD、Sitemap 和 RSS 完成；搜索明确延期 |
| Phase 4：个人创作档案 | 部分完成 | 首批跨内容关系完成；扩展元数据、Archive 和完整 Project 案例仍待开发 |
| Phase 5：可观测性与持续质量 | 部分完成 | 仓库侧 Analytics 准备和自动化质量覆盖完成；生产启用与 14 天数据观察仍待完成 |

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
- [ ] 确认 Cloudflare Dashboard 开始显示页面访问和 Core Web Vitals 数据。
- [ ] 按 `plans/analytics-baseline.md` 连续观察 14 天。
- [ ] 记录页面访问、来源、SPA 导航和 Core Web Vitals 的 p75。
- [ ] 将 14 天观察结论写回路线图或独立分析文档。

完成标准：

- 生产 Web Analytics 能持续收到数据。
- 隐私边界仍是不使用 Cookie、`localStorage`、邮件地址或设备指纹。
- 结论明确记录哪些指标足以支持下一阶段决策，哪些仍缺少数据。

### 5.2 补齐发布工作流

**优先级：P1**

已经完成：draft 过滤、发布前单命令验证、内容引用检查、断链检查和格式展示文章夹具。

仍需开发：

- [ ] 提供 Blog 和 Project 模板，或实现 `npm run content:new`。
- [ ] 将 draft、预览、发布日期、图片准备和发布检查整理成简短发布清单。
- [ ] 对 Markdown 正文图片增加非空且有意义的 alt 专项检查。
- [ ] 为 Pull Request 提供可在手机和桌面打开的静态预览 URL。
- [ ] 验证从创建文章到本地预览的流程可以在 5 分钟内完成。

完成标准：

- 新内容不需要复制旧文章才能获得正确 frontmatter。
- `npm run verify` 继续覆盖内容、类型、测试、构建和断链。
- 草稿不进入正式 Blog、RSS、Sitemap 或标签页。

### 5.3 补齐构建体积和实验室性能预算

**优先级：P1**

已经完成：首页和 Album 的实际页面传输预算。

仍需开发：

- [ ] 增加单张生成图片的最大体积检查。
- [ ] 增加关键 JavaScript / CSS gzip 体积预算。
- [ ] 增加 Lighthouse 或等价的实验室 LCP、CLS、INP 检查。
- [ ] 比较构建产物体积，超出阈值时指出增长来源。
- [ ] 明确实验室指标与 Cloudflare 真实用户数据之间的使用边界。

完成标准：

- 超预算时 CI 给出具体资源或 chunk，而不是只输出总分。
- 不通过降低图片可读性或删除 Hero 自动播放来满足预算。

### 5.4 扩展个人创作档案元数据

**优先级：P2**

已经完成：Blog、Project 和 Album 的首批跨内容引用与反向摘要。

仍需开发：

- [ ] 为 Blog 评估并加入地点字段。
- [ ] 为 Project 评估并加入角色、媒介和更明确的年份字段。
- [ ] 为 Album photo 评估并加入创作/拍摄日期、地点和媒介。
- [ ] 在 Velite 中验证新引用和枚举，避免自由文本逐渐失控。
- [ ] 只在有内容时显示这些元数据，不产生空标签或占位布局。

完成标准：

- 字段来自真实内容需要，而不是为了让 schema 看起来完整。
- Blog、Project 和 Album 可以按时间或类型汇总，为 Archive 提供稳定数据。

### 5.5 开发第一版 Archive

**优先级：P2；依赖 5.4**

- [ ] 新增 `/archive`。
- [ ] 同时汇总文章、项目和 Album 作品。
- [ ] 按年份或时间线组织，并提供简单的类型筛选。
- [ ] 每个条目链接回现有详情页，不复制正文。
- [ ] 保持编辑式排版，不做 dashboard 或大型筛选面板。
- [ ] 为 Archive 增加 prerender、canonical、Sitemap、无 JavaScript 阅读和响应式测试。

完成标准：

- 三类内容可以在一个页面中按时间浏览。
- Archive 客户端数据不包含所有文章或 Project 正文 HTML。
- 390×844、768×1024、1440×1000 无横向溢出。

### 5.6 将 Project 扩展为过程案例

**优先级：P2；内容工作**

- [ ] 为每个主要 Project 补充 Context / Problem。
- [ ] 补充 Constraints 和 Role。
- [ ] 补充 Key decisions 和 Process。
- [ ] 补充 Outcome。
- [ ] 使用 Related notes and works 连接现有文章和 Album。
- [ ] 保留不同项目的真实差异，不强制每篇显示所有标题。

完成标准：

- Project 不再只是图片和一句说明。
- 至少 2 个 Project 可以作为独立、完整的设计案例阅读。

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

当前唯一需要先执行的外部操作：

1. 在 Cloudflare Pages 项目 Metrics 中启用 Web Analytics。
2. 重新部署当前版本。
3. 确认部署后烟雾检查和 Analytics beacon 均正常。
4. 开始 14 天观察窗口。

仓库内下一项开发工作为 **5.2 补齐发布工作流**。在 Analytics 数据达到决策门槛前，不提前建设搜索、自定义事件、错误监控或新的首屏重动画。
