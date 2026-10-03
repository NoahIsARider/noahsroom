# AGENTS.md

## 项目概览

NoahIsARider（Noah）的个人主页。**一个房间，两层**：

- `/`（`index.html`）— Y2K/霓虹夜桌：全屏 16:9 场景，由独立图层和抠图素材拼成，每个物件是一个"门"，中控是那台 CRT。
- `/relic/`（`relic/index.html`）— 上一版的"三个灯光的房间"（写实 / 黄昏 / 梵高油画三张照片 + 手写批注 + Rough.js 手绘相框），整份归档保留，只能通过隐藏入口进入。**该页自身品牌与 `<title>` 都叫 relic**（原来是 noahsroom），目录和 URL 也已是 `relic/`；旧的 `/room/` 保留一个跳转壳（meta refresh + JS 替换），不会 404。
- `/logs.html` — 房间本身的暗黑童话《the three odd friends》（三个奇怪朋友之间的故事，整个房间的世界观），背景用紫色城市大图 `assets/comic-neon-outer-bg.webp`；**这一页不放 Noah 的个人资料**，只有故事。

## 技术栈

- 原生 HTML/CSS/JS（native-static，无构建、无依赖）
- Google Fonts：VT323（终端正文）+ Special Elite（打字机标签）
- 本地静态服务：`python -m http.server 8123`

## 目录结构

```
.
├── index.html          # 夜桌主页（每个物件一个 <button data-page>）
├── layered.css         # 全部样式，按 v1 → v17 追加，最后出现的规则生效
├── layered.js          # pages{} 文案 + 桌面地图 + 月亮暗门
├── logs.html           # 暗黑童话《the three odd friends》（独立样式 + 紫色城市背景）
├── feed.xml            # 站点索引 RSS：页面 / 账号 / 全部公开仓库（爬虫用）
├── tools/build-feed.py # 重新生成 feed.xml（gh api 拉仓库列表，改动后重跑）
├── tools/make-favicon.py # 重画图标：crt.png 母版 + 紫背光 + 绿终端 → favicon 96/48/32/16 + apple-touch
├── relic/              # 归档：上一版房间页（品牌 relic）
│   ├── index.html      #   原版（含内联样式与 Rough.js 逻辑）
│   ├── images/*.jpg    #   三张房间照片
│   ├── vendor/         #   rough.min.js
│   └── DESIGN.md       #   原版设计规范
├── room/index.html     # 跳转壳：旧 URL /room/ → /relic/（可删）
├── assets/             # 场景图层与物件（.webp，保留 alpha）
│   ├── comic-neon-outer-bg.webp   # 紫城大背景（.viewport、.desk-footer-bg、logs.html 都用它）
│   ├── desk-empty-v2.webp         # 主场景底板
│   ├── favicon.png                # 由 assets/objects/crt.png 缩到 96px
│   └── objects/*.webp
├── research-notes.md   # 版式参考研究（公开页面结构分析，非代码搬运）
├── README.md
└── .gitignore          # 忽略设计迭代图、.playwright-mcp/、skills/、PNG 母版
```

## 隐藏入口（月亮暗门）

- `index.html` 里的 `<button class="moon-door">` 是覆盖在月亮上的透明热区（`left:22.6%; top:-1.6%; width:7.8%; height:11%`）。
- 月亮本体在 `layered.css` 的 v17 段：`.moon{left:24%; top:0; width:5%}`。**两者必须同步改**，否则点不中。
- `layered.js` 末尾：10 次点击、每两次间隔 < 2.4s 才累计，超时清零；每次点击把 `--moonlit`（0–10）写到 `#desk`，`.moon` 用它做极轻微的放大/提亮。
- **第 10 次点击不跳转**：它把那个 `<button>` 就地换成真链接 `<a class="moon-door moon-door--awake" href="relic/">`，光标变 pointer，悬停时在月亮**下方**显示 `THE RELIC →`（标签必须挂 `top:100%`，挂上方会被 `.desk` 的 overflow 裁掉）。第 11 次点击才真的进 `relic/`。**改目录名时这三个地方要同步：`layered.js` 的 `link.href`、`logs.html` 的导航链接、`.gitignore` 里的母版 PNG 路径。**
- **绝对不要在 JS 里用定时器自动跳转**：那样返回时 bfcache 一恢复，未触发的定时器会再补跳一次，页面自己往前跳。让链接只由人点。
- 刷新后月亮回到沉睡状态（不写 localStorage）。

## 链接约定

- **一个物件 = 一个去处，且不重复**：lamp→个人页，media tower→Google Scholar，star chart→Skills & Tools，tapes→Blogs，radio→Portfolio，scrap wall→oblivio，plant→Codeberg，books→Goodreads，photos→Letterboxd，walkman→Record Club，floppies→GitHub，cactus→LandslideLab，lucky cat→The tale(logs.html)，envelope→邮箱，bottle→Steam，mug→itch.io，玩偶 I/II/III→X / Mastodon / Bluesky；keyboard 与 home-key 回 CRT 主屏。
- 植株（`.plant`）原先只是装饰（`pointer-events:none`）；改按钮后由 v21 段恢复 `pointer-events:auto`，并且 `>span` 的标签必须挂 `top:100%`（挂在上面会被 `.desk` 顶部裁掉，因为植株 `top:-11%`）。
- **`.object` 的基类 hover 只加 `z-index` 和 glow，不会让物件动**：位移必须逐个物件在 `:hover` 里显式写 `transform`。scrap wall 和植株都栽在这上面——加物件时要顺手给它一条 hover transform，并跑一次真光标 hover 审计（见 `retro-web-design` 技能的 `scripts/hover-check.py`）：理想结果是"全部会动、0 个不动、0 个中心被遮住"。大物件的 hover glow 要压低（植株是 `rgba(184,255,84,.14)`），否则整片叶子发绿太吵。
- 主屏（CRT 的 `home` 页）放他 profile README 顶部那组自述链接：Personal page · Google Scholar · Skills & Tools · Blogs · Portfolio · The tale。
- **页面里不放具体仓库链接、不放普通项目链接**（oblivio 例外，它本身就是作品集式个人站）；仓库清单只进 `feed.xml`。
- 任何 `example.com` 之类占位地址都不允许出现。
- 网页上**不写他的中文名**，只用 Noah / NoahIsARider。

## 标题与 RSS

- `<title>` 只写 `NOAH'S ROOM`，不要加 "— a night desk" 之类的后缀。
- `feed.xml` 由 `python tools/build-feed.py` 生成，内容是**站点索引**：22 条页面/账号 + `NoahIsARider` 全部公开仓库 + `LandslideLab` 全部公开仓库 + 1 条童话（`tale`，指 logs.html），一条一个 `<item>`，方便爬虫。私有/归档仓不进 feed。
- 新增仓库或改链接后重跑该脚本；徽章只写 `RSS / EVERYTHING INDEX`。

## 徽章

右下角三个原有徽章（CHINA / QUEER / NEOCITIES）**保持原样，不要改**；只允许新增 RSS 一个（`web-badge--rss` → `feed.xml`）。

## 尺寸与坐标

- 所有物件用百分比定位在 `16:9` 的 `.desk` 里（宽度用 `%`，高度 auto）；新增物件必须用百分比盒子。
- 桌面高度 = 宽度 ÷ 16 × 9，所以"宽 5%"的图在纵向约占 8.6% 高度。
- `.screen` 是 `overflow-y:auto`：文案变长会滚动而不是被裁掉。
- `.object--cat` 必须留在 `.computer` 内部（它的百分比是相对显示器算的）。
- **左下角不是访问计数器**。原来那个 `VISITOR 002012` 是假的（localStorage 从 1999 起自增），已删掉；现在只有一行绿字坐标 `90°00'01"N 000°00'01"E`——一个数学上不存在的位置（纬度最多到 90°、分秒最多到 59），无标签无说明，完整读法写在 `aria-label` 里。**不要在任何地方放编造的统计数字。**

## 变更记录

- 2026-10-02（九）：站点图标换成"紫背光 + 绿终端"的 CRT（`tools/make-favicon.py` 生成 96/48/32/16 + apple-touch；屏幕区域从原图暗区自动识别，紫光偏左加权当背光，机身只留轻边缘紫；每个尺寸单独绘制，16px 那版加强光线、减到 3 行文字）。四个页面都接上 `<link rel="icon">`（relic/room 用 `../assets/`）。
- 2026-10-02（八）：植株补上 hover 位移（`rotate(-0.8deg) translateY(-5px)`）并把绿辉光从 `.28` 压到 `.14`——`.object` 基类 hover 不含 transform，只加滤镜和 z-index，所以"能点但有光不动"是它的典型症状。用真光标审计全部 20 个物件：20 个会动、0 个不动、0 个中心被遮挡。
- 2026-10-02（七）：左上角植株从装饰变成链接（`.plant` → `<button data-page="codeberg">`），指向 `codeberg.org/NoahIsARider`；新增 CRT 页 `codeberg` 与桌面地图条目；植株标签挂在 `top:100%`（下方），因为 `top:-11%` 让它上方没有空间。feed 的页面清单同步加上 Codeberg。三个玩偶尺寸放大（v20）。
- 2026-10-02（六）：归档页目录 `room/` 正式改名 `relic/`（URL 也跟着变了）；`layered.js` 的月亮链接、`logs.html` 导航、`.gitignore` 的母版路径同步；旧 URL `/room/` 保留 `room/index.html` 跳转壳。之前只改了页面品牌、没改目录，导致地址栏还是 `noahsroom/room`，这一版补上。
- 2026-10-02（五）：归档页改名为 **relic**（`room/index.html` 的页内品牌与 `<title>`，目录/URL 不变）；月亮唤醒后的标签随之由 `THE OLD ROOM →` 改为 `THE RELIC →`（`logs.html` 的导航链接文案同步）；左下角坐标只保留绿字一行（去掉 `ROOM COORDINATES` 标签与说明行，读法挪到 `aria-label`）。
- 2026-10-02（四）：删掉左下角假的访客计数器（`VISITOR 002012` 只是 localStorage 从 1999 自增），换成"房间坐标" `90°00'01"N 000°00'01"E`（纬度超出 90°，数学上不存在的位置），`layered.js` 里随之去掉 localStorage 逻辑。
- 2026-10-02（三）：`logs.html` 从"房间日志"改成暗黑童话《the three odd friends》（三个奇怪朋友的来历 / 夜班 / 月亮 / 恐惧 / 如何算被欢迎），作为整个房间的世界观；该页**不含 Noah 的个人资料**（去掉 NOW、邮箱与社交链接）。月亮暗门改为"十次敲击唤醒 → 变成真链接 → 第十一次点击才进入"，**取消 JS 定时器自动跳转**（返回时 bfcache 会让定时器补跳）。lucky cat 的去处与桌面地图标签改名为 `The tale`；feed 里改为 1 条 `tale` 条目。
- 2026-10-02（二）：`<title>` 精简为 `NOAH'S ROOM`；mug 与 ODD FRIEND I 的链接互换（mug→itch.io，blob→X）；`feed.xml` 从"日志订阅"改为**站点索引**（页面/账号/全部公开仓库 + 日志），由新增的 `tools/build-feed.py` 生成；RSS 徽章副标题改为 `EVERYTHING INDEX`。
- 2026-10-02：Y2K 夜桌取代旧房间成为主页；旧房间移到 `room/` 并加月亮暗门（点 10 次）；全部占位文案与 `example.com` 链接替换为 Noah 的真实介绍与链接；改为"一个物件一个去处"；徽章只新增 RSS；新增 `logs.html` 博客页（紫色城市背景 + `feed.xml`）、`README.md`、`.gitignore`；71MB PNG → 8.8MB WebP；访客计数 key 改为 `noahsroom-layered-visits`；月亮左移至 24%。
