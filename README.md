# 禧安堂 · Xiantang.life

安妍老师的命理之家。紫微斗数、八字、风水。

## 技术栈

纯静态网站 — HTML + CSS + 一点 JavaScript。
- **内容**：Markdown 文件（`/journal/data/*.md`、`/courses/data/*.md`）
- **元数据**：JSON 索引（`/journal/data/index.json`、`/courses/data/teachers.json`）
- **渲染**：客户端用 `marked.js` 解析 markdown
- **部署**：Vercel（自动从 GitHub 同步）

## 目录结构

```
.
├── index.html              主页
├── about.html              关于安妍老师
├── services.html           命理服务（论命、择日、取名、风水、符箓）
├── courses.html            课程列表
├── journal.html            文章列表
├── contact.html            联系方式
├── admin-article.html      ⚙️ 文章管理后台（写新文章用）
│
├── assets/
│   ├── site.css            全站共享样式
│   ├── site.js             全站共享脚本
│   └── logo-recolored.png  Logo
│
├── courses/
│   ├── course.html         课程详情模板（通用）
│   └── data/
│       ├── teachers.json   老师信息
│       └── *.md            每门课一个 markdown 文件
│
├── journal/
│   ├── article.html        文章详情模板（通用）
│   └── data/
│       ├── index.json      文章索引
│       └── *.md            每篇文章一个 markdown 文件
│
├── uploads/                用户上传的图片
└── vercel.json             Vercel 部署配置
```

## 内容更新流程

### 写新文章

1. 打开 `/admin-article.html`
2. 填写标题、分类、正文（markdown）
3. 点 **"📦 下载发布包"** — 一次性下载 `.md` 文件和更新后的 `index.json`
4. 把两个文件上传到 GitHub `journal/data/`
5. Vercel 自动 deploy

### 加新课程

1. 在 `courses/data/` 新建 `<slug>.md` 文件（参考已有的格式）
2. 在 `courses.html` 加一张课程卡片，链接 `courses/course.html?slug=<slug>`
3. 推到 GitHub

## URL 规则

- `/journal/<slug>` → 文章详情（被 vercel 重写为 `/journal/article.html?slug=<slug>`）
- `/courses/<slug>` → 课程详情（被 vercel 重写为 `/courses/course.html?slug=<slug>`）

## 本地预览

需要本地服务器（不能直接 `file://` 打开，因为有 fetch）：

```bash
# Python
python3 -m http.server 8000

# Node
npx serve

# 然后浏览器打开 http://localhost:8000
```

## 部署到 Vercel

1. Push 这个 repo 到 GitHub
2. 在 [vercel.com](https://vercel.com) 点 "Import Git Repository"
3. Framework Preset 选 **Other**，其他都留空
4. Deploy

绑定自定义域名：在 Vercel 项目 Settings → Domains 加 `xiantang.life`。
