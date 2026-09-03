<div align="center">

**中文** · [English](./README.md)

# Sketchbook

**为首页固定书本翻页组件生成带日期、地点印章的透明画面层。**

[![Skill](https://img.shields.io/badge/SKILL-Sketchbook-174c35?style=flat-square&labelColor=333)](./SKILL.md)
[![Canvas](https://img.shields.io/badge/CANVAS-1280%C3%97720-2148b8?style=flat-square&labelColor=333)](./references/style-system.md)
[![Styles](https://img.shields.io/badge/STYLES-8-c83232?style=flat-square&labelColor=333)](./references/extended-styles.md)

</div>

输入日期、地点和可选参考照片，生成一张透明 Sketchbook 画面层。首页只保留一个固定书壳；每次翻页仅翻动画面、日期和印章，不再重复生成或翻动封皮、书脊、纸边与阴影。

Skill 支持传统绘画、编辑印刷、精细点阵和照片场景提炼，同时保持统一契约：准确尺寸、透明安全区、按日期排序、固定右上角印章、手写日期和随机外形的崇羲篆体地点印章。

## 风格参考图

| 水彩 | 油画 | 中国水墨 | 极简杂志 |
|:---:|:---:|:---:|:---:|
| <img src="./assets/references/watercolor-reference.png" alt="无书壳水彩灯塔参考图" width="220"> | <img src="./assets/references/oil-reference.png" alt="无书壳油画铁路站台参考图" width="220"> | <img src="./assets/references/ink-reference.png" alt="无书壳中国水墨山水参考图" width="220"> | <img src="./assets/references/minimal-zine-reference.png" alt="无书壳极简渡船 Zine 参考图" width="220"> |

| 单 / 双色孔版 | 点阵日记 | 场景提纯 | 旅行记忆拼贴 |
|:---:|:---:|:---:|:---:|
| <img src="./assets/references/mono-riso-reference.png" alt="无书壳双色骑行孔版参考图" width="220"> | <img src="./assets/references/pixel-diary-reference.png" alt="无书壳精细点阵天文台参考图" width="220"> | <img src="./assets/references/distilled-scene-reference.png" alt="无书壳雨夜过街场景提纯参考图" width="220"> | <img src="./assets/references/gathered-memory-reference.png" alt="无书壳电车旅行记忆参考图" width="220"> |

这些原创图片用于说明构图、密度与媒介语法，不是供复刻的主体或模板。

## 它能做什么

| 系统 | 方向 |
|---|---|
| **必需输入** | 真实日期与地点 / 景点 |
| **可选输入** | 参考照片与明确风格 |
| **画布** | `1280x720` RGBA，真实透明 |
| **书壳** | 首页只渲染一次，不进入任何翻页图片 |
| **标记** | 固定原始右上印章、手写日期、随机外形崇羲篆体地点印章 |
| **顺序** | ISO 日期升序，同日按 id 排序 |
| **输出** | 透明画面 PNG、完整 Prompt、风格配方、印章元数据、首页条目与验证结果 |

## 为什么把书壳分离

```text
首页固定层        book-shell.png
                     ↓
翻页内容层        透明画面 + 日期 + 两枚印章
                     ↓
浏览器结果        一本稳定的书，多张只翻内容的画页
```

最终页面 PNG 不含纸张、封皮、书脊、中缝线、纸页边缘、叠层、接触阴影或桌面。书壳合成图只用于临时视觉检查，绝不能保存为页面源图。

## 八种风格

- **水彩**：湿画法晕染、宽阔色块、无轮廓线
- **油画**：厚涂、破色、扫擦与少量调色刀痕
- **中国水墨**：墨色层次、笔势、渗化与空气感
- **极简杂志**：一个紧凑关系，55%–75% 透明留白
- **单 / 双色孔版**：一至两块职责明确的印版、网点与受控套印偏移
- **点阵日记**：细密点阵结构，不做游戏像素风
- **场景提纯**：必须提供照片，提炼语义但不保留照片像素
- **旅行记忆拼贴**：必须提供照片，保留真实锚点与不等尺寸的来源片段

## 工作方式

```text
1  校验输入      →  必须有日期与地点，再选择风格
2  编译场景      →  记录地点主体或照片保真约束
3  生成画面      →  透明图层，不含书壳、纸张、印章与文字
4  生成标记      →  独立生成准确日期与崇羲篆体地点印章
5  归一化与合成  →  固定安全区和三处确定性位置
6  检查并注册    →  检查透明图、书壳预览、缩略图与时间顺序
```

## 试一试

```text
使用 $sketchbook 生成 2026-09-18 杭州西湖的水彩 sketchbook。
```

```text
使用 $sketchbook 生成 2027-05-12 青岛栈桥的蓝橙双色孔版印刷版本。
```

```text
使用这张照片做 2027-09-10 阿里山的 Gathered Memory sketchbook。
```

日期或地点缺失时，Skill 会在调用工具前只询问缺少的字段；需要照片的风格若没有照片，也会停止并索取照片。

## 稳定印章与日期系统

- `assets/seal.png` 直接合成，imagegen 不重绘。
- `assets/handwriting-latin-glyph-sheet.png` 只用于生成独立透明日期层。
- `assets/chongxi_seal.otf` 控制地点印章每个字的字形与绝对位置。
- 四字地点印章默认使用真正的回文路径：`右上 → 左上 → 左下 → 右下`。
- 地点印章外形每次从符合字数的候选中重新随机。

## 验证

```bash
python3 "${CODEX_HOME:-$HOME/.codex}/skills/.system/skill-creator/scripts/quick_validate.py" \
  .agents/skills/sketchbook

node .agents/skills/sketchbook/scripts/normalize-artwork-layer.mjs \
  --input GENERATED.png \
  --output NORMALIZED.png

npm run check
git diff --check
```

页面校验器会拒绝错误尺寸、缺少 Alpha、全不透明图片、烘焙书壳的边界，以及超出固定页面安全区的像素。

图片生成与注册使用项目已经安装的 `sharp`。字形控制图、画面归一化和标记合成三个作者工具使用 ImageMagick 7 的 `magick` 命令；集成测试只在该命令存在时运行，在仅负责网站构建的 CI 环境中会正常跳过。

## 目录结构

```text
sketchbook/
├── agents/openai.yaml       # UI 名称与默认调用
├── assets/                  # 布局清单、固定书壳、印章、字体、手写字形与参考图
│   └── references/          # 八张无书壳原创风格参考图
├── evals/evals.json         # 典型行为评测
├── references/              # 风格、Prompt/生成记录、印章、照片、质检与接入规则
├── scripts/                 # 归一化、标记合成、印章辅助与首页注册
├── SKILL.md                 # Skill 入口与工作流
├── README.md                # English documentation
└── README.zh.md             # 中文说明
```

## 原创性

参考图定义的是媒介、留白、复制工艺和细节压缩规则。每次结果都根据用户提供的地点、日期与照片重新构图，不复制参考图的主体或排列。

## 资产许可

`assets/chongxi_seal.otf` 按 CC BY-ND 3.0 台湾及其后版本原样再分发。署名、来源、校验值和官方许可地址记录在 [`ASSET-LICENSE.md`](./ASSET-LICENSE.md)；该字体不适用本仓库的 MIT License。
