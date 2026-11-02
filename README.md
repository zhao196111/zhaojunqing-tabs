# 今日要闻 · 新闻选项卡（Tabs）实践作业

> 作者：赵俊清　　命名前缀：`zjq__`　　仓库名：`zhaojunqing-tabs`（包含姓名全拼）

## 一、作业要求对照

| 作业要求 | 实现情况 |
| --- | --- |
| 新建一个 HTML 文件，显示 tab 选项卡 | `index.html`，共 4 个选项卡 |
| 选项卡为国内新闻 / 省内新闻 / 国际新闻 / 最新新闻 | 4 个选项卡名称与要求完全一致 |
| 国内新闻为默认选项 | `data-zjq__default="0"` + 脚本初始化时默认选中第 1 项 |
| 文件单独放在 js 文件夹中，外部引用 | 脚本位于 `js/zjq__tab.js`，通过 `<script src="./js/zjq__tab.js"></script>` 外部引入 |
| CSS 单独存放并外部引用 | `css/zjq__style.css`，`<link rel="stylesheet">` 引入 |
| tab 选项卡 JS 部分可复用 | 依托 `data-zjq__tabs` 属性自动初始化，一份 JS 驱动多个实例（页面底部「组件复用演示」即第二组实例） |
| 代码中包含事件监听 | `addEventListener('click')` 点击、`addEventListener('keydown')` 键盘、`DOMContentLoaded` 自动初始化 |
| 清除所有选项卡的选中状态，再设置当前元素的选中状态 | `zjq__clearActive()` 先清全部 → `zjq__applyActive()` 再设当前，见 `zjq__activate()` 第 ① ② 步注释 |
| 所有 CSS 类名、ID、JS 变量以姓名首字母 `zjq__` 开头 | 全文件统一前缀（含自定义属性、动画名、data 属性） |
| github 仓库包含姓名全拼 | 仓库名建议 `zhaojunqing-tabs`，见下文发布步骤 |
| 提交项目并在 GitHub Pages 发布 | 见第四、五节 |

## 二、项目结构

```
zhaojunqing-tabs/
├─ index.html            # 页面结构（选项卡 + 新闻列表）
├─ css/
│  └─ zjq__style.css     # 全部样式，类名统一 zjq__ 前缀
├─ js/
│  └─ zjq__tab.js        # 选项卡组件逻辑（可复用），外部引用
└─ README.md
```

## 三、实现要点

1. **结构语义化**：选项卡容器为 `role="tablist"`，每个按钮 `role="tab"`，面板 `role="tabpanel"`，
   通过 `aria-selected` / `aria-controls` / `aria-labelledby` 建立关联，便于读屏软件识别。
2. **核心切换逻辑（老师要求的顺序）**：
   ```js
   zjq__clearActive(zjq__instance);   // ① 清除所有选项卡的选中状态
   zjq__applyActive(zjq__instance, zjq__index); // ② 再设置当前元素的选中状态
   ```
   清除时会同时移除 `zjq__tab--active` / `zjq__panel--active` 类、重置 `aria-selected` 与 `tabindex`。
3. **可复用**：任意容器只要加上 `data-zjq__tabs` 就自动成为一个选项卡组，
   `data-zjq__default="0"` 可指定默认选中项；也可手动 `zjq__initTabs(document.querySelector('.xxx'))`。
   脚本按根容器过滤元素，多组选项卡互不干扰。
4. **事件监听**：点击控制使用事件委托（绑定在根容器上，减少监听器数量）；
   额外支持键盘 ← → ↑ ↓、Home、End 切换，切换后派发 `zjq__tabchange` 自定义事件。
5. **视觉参考**：沿用课堂上「点击排行 / 评论排行」的新闻榜单风格——蓝色系选项卡、序号 + 标题 + 来源时间 + 红色热度值。

## 四、本地预览

- 直接双击 `index.html` 即可在浏览器打开（无任何依赖、无需构建）。
- 或者用 VS Code 的 Live Server 插件打开，效果一致。

## 五、GitHub 仓库与 Pages 发布

1. 在 GitHub 新建仓库，仓库名带上姓名全拼，例如 **`zhaojunqing-tabs`**（Public）。
2. 在本项目文件夹内执行：

   ```bash
   git init
   git add .
   git commit -m "feat: 新闻选项卡 tab 组件作业"
   git branch -M main
   git remote add origin https://github.com/<你的GitHub用户名>/zhaojunqing-tabs.git
   git push -u origin main
   ```

3. 仓库页面 → **Settings → Pages**：
   - Source 选择 `Deploy from a branch`
   - Branch 选择 `main`，目录选 `/ (root)`，点击 **Save**
4. 等待 1 分钟左右，访问 `https://<你的GitHub用户名>.github.io/zhaojunqing-tabs/`
   即为发布成功的在线地址（提交作业时附上该链接 + 仓库链接）。

> 注意：`index.html` 必须位于仓库根目录，且引用路径使用相对路径（本项目已全部使用 `./css/...`、`./js/...`），
> 否则部署到 Pages 后会出现样式或脚本 404。

## 六、提交清单

- [x] `index.html`（4 个选项卡，国内新闻默认选中）
- [x] `css/zjq__style.css`（外部样式，类名 `zjq__` 前缀）
- [x] `js/zjq__tab.js`（外部脚本，变量 `zjq__` 前缀，可复用、含事件监听与「先清除后设置」逻辑）
- [ ] 推送到 `zhaojunqing-tabs` 仓库并开启 GitHub Pages
- [ ] 提交仓库链接 + Pages 在线链接
