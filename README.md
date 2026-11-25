# 游戏库 · Game Library

用 **Vite + React 18 + TypeScript** 写的一个小站：把我长期在玩的 20 款游戏做成可筛选、可搜索、可看详情的列表。没有用任何 UI 框架，样式全部手写。

做这个项目的目的是补齐前端能力：之前只会写 Canvas 式的自绘界面（UE5 / Pygame），没做过 React 组件化与状态派生，这个项目把这块补上。

## 功能

| 功能 | 说明 |
|---|---|
| 列表 | 卡片网格（`repeat(auto-fill, minmax(220px, 1fr))`），单页 12 条，「加载更多」分页 |
| 筛选 | 平台 / 类型 / 状态三类多选 chips + 评分下限（0–9.5）+ 年份区间双滑块；显示已启用条件数，可一键清空 |
| 搜索 | 匹配游戏名、英文名、开发商、发行商、标签、类型；200ms 防抖（自写 `useDebounced`） |
| 详情 | 弹层（`role="dialog"`），四格数值 + 机制拆解笔记；Esc 关闭、点遮罩关闭、打开时锁定 body 滚动、焦点落在关闭按钮 |
| 排序 | 评分 / 年份 / 时长 / 名称，四种比较器写在 `Record<SortKey, (a, b) => number>` 里 |
| 响应式 | 860px 以下侧栏折叠为单列；`prefers-reduced-motion` 时关闭卡片位移动画 |

每款游戏额外写了一条**机制拆解笔记**（例如：艾尔登法环的无敌帧窗口与韧性系统、CS2 的 Sub-tick 与延迟补偿回滚、黑神话的 Nanite 省面数但吃显存 IO），这是这个项目跟"练手 demo"的区别。

## 技术栈

- **Vite 5** —— dev server 起得快，生产构建输出单页静态资源
- **React 18** —— 组件化 + `useState` / `useMemo` / `useRef` / `useEffect`
- **TypeScript 5** —— `strict` 打开，`noUnusedLocals` / `noUnusedParameters` 也开着
- **puppeteer-core** —— 复用本机 Edge，不下载 Chromium，用于自动化验证

## 目录

```
src/
├── main.tsx                 # 挂载 + StrictMode
├── App.tsx                  # 状态与派生：filters / sortKey / selected / visible
├── types.ts                 # Game、Filters、SortKey 等类型与常量
├── data/games.ts            # 20 款游戏数据（含机制拆解笔记）
├── lib/query.ts             # 纯函数：filterGames / sortGames / collectGenres / formatHours
├── hooks/useDebounced.ts    # 通用防抖 hook
├── components/
│   ├── FilterBar.tsx        # 筛选侧栏
│   ├── SearchBox.tsx        # 搜索框
│   ├── GameCard.tsx         # 卡片
│   └── GameDetail.tsx       # 详情弹层
└── styles.css               # 手写样式（深色主题 + CSS 变量）
```

## 跑起来

```bash
npm install
npm run dev        # http://localhost:5178
npm run build      # tsc --noEmit && vite build
npm run preview    # 预览 dist
```

## 验证

`verify.mjs` 用 puppeteer-core 驱动本机 **Edge**（`puppeteer-core` 不下载浏览器），对着 `vite preview` 起的页面做真实点击与断言，覆盖 23 项：

```bash
npm run build
npx vite preview --port 4178 --strictPort   # 另开一个终端
node verify.mjs                              # 截图落在 shots/
```

覆盖点：首屏 12 张卡与总数、加载更多、搜索命中与无结果空状态、筛选变化与清空按钮、详情打开/四格数值/笔记存在/滚动锁定、Esc 关闭与滚动恢复、按年份排序、移动端单列布局。

## 几个取舍

1. **不用 UI 框架**（没有 antd / MUI）：这批组件都很小，手写反而更清楚 `aria-pressed`、焦点管理这些细节怎么处理。
2. **筛选与排序放在纯函数里**（`lib/query.ts`）：组件只负责渲染，逻辑能被单测覆盖，换 UI 不用动查询。
3. **派生状态不进 state**：`filters → result` 用 `useMemo` 算，避免两份真值不同步（这是 React 里最常见的 bug 来源）。
4. **数据写死在前端**：20 条、纯客户端筛选够用，引入请求层只会让这个项目变重。

## 已知限制

- 数据是静态的，没有后端与持久化（收藏、打分不能改）
- 没有路由，详情是弹层而不是独立 URL（刷新会回到列表）
- 没做虚拟滚动：现在 20 条无压力，上千条需要换 `react-window`
