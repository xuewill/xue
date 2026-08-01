# 隐私友好访问统计基线

> 项目：Will Xue Blog
> 建立日期：2026-07-30
> 对应路线图：Phase 5.1
> 当前状态：Cloudflare Dashboard 已启用，生产已重新部署并确认 RUM 上报；2026-08-01 已出现首批访问、LCP 和 CLS 数据，14 天观察仍在进行

## 一、方案选择

首选 Cloudflare Web Analytics 的 Pages 一键接入：

- 在 Cloudflare Pages 项目的 **Metrics** 中启用。
- Cloudflare 在下一次部署时自动注入官方 beacon。
- 仓库不保存 token，也不手工插入第二份脚本。
- 现有 SvelteKit CSP 允许加载 `https://static.cloudflareinsights.com`，并允许非代理场景向 `https://cloudflareinsights.com` 上报；Cloudflare 代理场景仍优先使用同源 `/cdn-cgi/rum`。

Web Analytics 不使用 Cookie、`localStorage` 或跨站用户追踪，也不应被扩展为用户级画像。

## 二、能力边界

当前可以获取：

- 页面浏览量、热门路径和访问来源。
- SvelteKit 客户端导航产生的 SPA 页面浏览。
- LCP、INP、CLS 等真实用户体验数据。
- 国家或地区、浏览器和设备类型等聚合维度。

当前不能获取：

- Album 灯箱打开等自定义交互事件。
- Blog → Project 或 Project → Blog 的逐次导航漏斗。
- RSS 点击转化和自定义 UTM 参数。
- 可识别单个访客的会话轨迹。

Cloudflare Web Analytics 当前不支持自定义事件或查询字符串分析。本阶段不为这些指标新增 Worker、Analytics Engine、Cookie、设备指纹或第三方用户画像。积累真实页面访问数据后，再判断自定义事件是否值得引入额外运行时。

## 三、启用步骤

1. 登录 Cloudflare Dashboard，进入 **Workers & Pages**。
2. 选择 Pages 项目 `xue-blog`。
3. 打开 **Metrics**，在 Web Analytics 区域选择 **Enable**。
4. 重新部署当前生产分支；不要复制手工 token 到仓库。
5. 部署后确认页面中只出现一次 `https://static.cloudflareinsights.com/beacon.min.js`。
6. 在浏览器 Network 中确认页面隐藏或离开时产生 `/cdn-cgi/rum` 请求。
7. 检查首页客户端导航到 Blog、Project、Album 后，Dashboard 能看到对应路径。

如果启用后没有数据，优先检查：

- 生产部署是否发生在 Dashboard 启用之后。
- HTML 中是否已经注入 beacon。
- 页面 CSP 是否包含 `https://static.cloudflareinsights.com`。
- 浏览器扩展或本地网络是否拦截统计请求。
- 同一页面是否误插入多份 beacon。

## 四、启用前性能快照

2026-07-30 使用 Chrome DevTools 对 `https://willxue.com/` 做一次无 CPU、无网络限速的实验室冷加载追踪：

| 指标 | 结果 | 判断 |
| --- | ---: | --- |
| LCP | 2.183 s | 达到 ≤ 2.5 s 目标 |
| CLS | 0.00 | 达到 ≤ 0.1 目标 |
| TTFB | 0.837 s | 略高于 0.8 s 参考线 |

这只是单次实验室样本，不能代替真实用户 p75。当前 CrUX 没有该页面的可用现场数据。

## 五、首轮观察窗口

观察期：2026-07-30 至 2026-08-13。先确认 Dashboard 出现首批页面访问与 Core Web Vitals，再以完整 14 天数据形成结论。

启用后先观察 14 天，不立即根据少量访问改版。首轮记录：

- 首页、Blog、Project、Album 和标签页的访问量。
- 外部来源与直接访问比例。
- 移动端和桌面端的 LCP、INP、CLS p75。
- 最常访问的 10 个内容路径。
- 404 或明显异常路径。

首轮目标：

- p75 LCP ≤ 2.5 s。
- p75 INP ≤ 200 ms。
- p75 CLS ≤ 0.1。
- Hero 和 Album 相关路径没有因统计脚本突破既有传输预算。

完成首轮观察后，再决定优先建设统一 Archive、扩展 Project 过程记录，还是引入能支持少量匿名自定义事件的第一方方案。

## 六、首个生产数据检查点

检查时间：2026-08-01；Dashboard 区间：过去 3 天（GMT+8）。

| 指标 | 当前结果 | 判断 |
| --- | ---: | --- |
| 访问量 | 7 | 已确认生产采集持续收到数据，样本不足 |
| 页面浏览量 | 7 | 与访问量相同，尚不能确认稳定的跨页面流转 |
| 页面加载时间 | 1,534 ms | Dashboard 汇总值，不等同于 14 天 Core Web Vitals p75 |
| LCP p75 | 1,180 ms | 当前样本落在 good 区间，但数量过少 |
| CLS | 100% good | 已出现现场样本，尚不记录为稳定 p75 结论 |
| INP | 无数据 | 需要更多真实交互样本 |

当前路径分布为 `/blog/designing-canopy-coffee` 4 次、`/` 2 次、`/blog` 1 次；来源全部显示为直接访问。浏览器分布包含 Chrome 5 次和 ChromeHeadless 2 次，国家或地区分布为日本 6 次、美国 1 次，全部为桌面设备。ChromeHeadless 和部分直接访问可能来自部署后巡检、自动化验证或维护者自测，因此不能视为自然访问趋势。

这个检查点只用于确认 beacon、CSP、Cloudflare 注入和 Dashboard 聚合链路正常，不用于产品排期。观察窗口结束前保持以下结论：

- 不根据 7 次访问恢复搜索、双语、Newsletter、自定义事件或错误监控。
- 不把当前 1,180 ms LCP 当作稳定生产基线；14 天结论仍以完整窗口的 p75 为准。
- 2026-08-13 后复查真实访问与 ChromeHeadless 流量、热门路径、来源、SPA 导航和三个 Core Web Vitals 指标；INP 若仍无数据，应明确记录为样本不足，而不是记为 0。
