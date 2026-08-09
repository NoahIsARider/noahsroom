import fs from "node:fs";
import path from "node:path";

const rootDir = path.resolve(import.meta.dirname, "..");
const distDir = path.join(rootDir, "dist");
const inputPath = path.join(rootDir, "favorites_7_28_26.html");
const stylesPath = path.join(rootDir, "styles.css");
const iconName = "icon.png";
const backgroundName = "background.png";

const folderTranslations = {
  "Knowlegde Base": "Knowledge Base",
  "General Knowledge": "General Studies",
  "Extra-Curricular": "Culture and Criticism",
  "Technology": "Technology",
  "计算机软件": "Software Practice",
  "设计": "Design Methods",
  "人工智能": "Artificial Intelligence",
  "其他研究": "Other Research",
};

const sectionDescriptions = {
  "General Studies":
    "References on citation styles, study applications, public context, and practical academic workflows.",
  "Culture and Criticism":
    "Modern art, reading excerpts, film catalogues, and a few pieces of criticism worth returning to.",
  "Software Practice":
    "Android vision, Python tooling, virtual machines, shell workflows, and developer setup notes.",
  "Design Methods":
    "Interface-to-code workflows, Axure setup, and color references for polished academic visuals.",
  "Artificial Intelligence":
    "Graph learning, model deployment, and experiments that bridge creative tools with AI systems.",
  "Other Research":
    "Datasets, keyframe extraction, pose training, graph databases, and supporting research utilities.",
};

const layoutSpans = {
  "Software Practice": "wide",
  "Other Research": "wide",
};

const titleTranslations = {
  "关于引用网络参考文献的写法 - 知乎": "How to Cite Online References",
  "国家公派留学研究生如何申请？ - 知乎": "Applying for the CSC Graduate Scholarship",
  "学生签证申请全流程！含ID995A填写全攻略-签证攻略-香不香港": "Student Visa Guide with ID995A",
  "知青下乡：1968年至1978年，那段改变千万人命运的历史": "Down to the Countryside, 1968-1978",
  "参考文献著录格式（国标GB／T7714-2015） - 知乎": "GB/T 7714-2015 Citation Format",
  "使用Python做舆情分析（词云、情感分析、热力图） - 知乎": "Public Opinion Analysis in Python",
  "参考文献交叉引用的使用方法（word和wps）_将论文第一章正文中的所有引注与对应的参考文献-CSDN博客":
    "Cross-Referencing Citations in Word and WPS",
  "雅思考试报名流程——新手指南 - 知乎": "IELTS Registration for Beginners",
  "现代艺术150年思维导图整理": "Mind Map of 150 Years of Modern Art",
  "思想的年代 原文摘录": "Excerpts from The Age of Ideas",
  "A24电影全收录": "The A24 Film Catalogue",
  "邪恶的悲歌（反基督者）影评": "Review of Antichrist",
  "地平线上的生成（宽恕）影评": "Review of Forgiveness",
  "Tensorflowlite图像识别模型--安卓端部署教程_android tensorflow lite-CSDN博客":
    "Deploying a TensorFlow Lite Vision Model on Android",
  "安卓软件开发：如何实现机器学习部署到安卓端-腾讯云开发者社区-腾讯云":
    "Bringing Machine Learning to Android Apps",
  "玩转Android视觉识别，从零入门！ - ByteZoneX社区": "Android Vision Recognition from Scratch",
  "【Android】实战图像识别：Compose + MLKit + CameraX_android ml kit-CSDN博客":
    "Android Image Recognition with Compose, ML Kit, and CameraX",
  "Google Colab 中运行自己的py文件_colab运行本地.py文件-CSDN博客":
    "Running Local Python Files in Google Colab",
  "在 Windows 中通过 WSL 2 高效使用 Docker_windows wsl2 docker-CSDN博客":
    "Using Docker Efficiently with WSL 2 on Windows",
  "Jupyterlab在D盘打开": "Opening JupyterLab from the D Drive",
  "【2024年最新】Anaconda3的安装配置及使用教程(超详细)，从零基础入门到精通，看完这一篇就够了（附安装包）-CSDN博客":
    "Installing and Configuring Anaconda3",
  "VM 上扩展 Ubuntu 系统磁盘空间_vmware磁盘扩展会把系统重置吗-CSDN博客":
    "Expanding Ubuntu Disk Space in VMware",
  "快速入门Playwright框架：从零到自动化测试的第一步-CSDN博客": "Playwright Quick Start",
  "Ubuntu 22.04下Docker安装（最全指引）_docker安装ubuntu-CSDN博客": "Installing Docker on Ubuntu 22.04",
  "VMware 虚拟机MacOS系统安装VMware Tools_vmware tools for mac-CSDN博客":
    "Installing VMware Tools on macOS Guests",
  "ubuntu内使用vim编写C/C++程序并编译运行_ubuntn运行c++-CSDN博客":
    "Writing and Running C or C++ with Vim on Ubuntu",
  "使用Xshell生成密钥连接服务器_xshell激活密钥在线生成-CSDN博客":
    "Connecting to a Server with Xshell Keys",
  "VMware 虚拟机图文安装和配置 Ubuntu Server 22.04 LTS 教程_00-installer-config.yaml-CSDN博客":
    "Installing Ubuntu Server 22.04 LTS in VMware",
  "linux上的文件修改——vim/vi命令_linux vim修改文件命令-CSDN博客": "Editing Files with Vim or Vi on Linux",
  "VIM中的保存和退出、VIM退出命令、如何退出vim编辑、VIM命令大全_vim保存退出命令-CSDN博客":
    "Saving and Quitting in Vim",
  "如何规范你的Git commit？ - 知乎": "Writing Better Git Commits",
  "Orange：一个基于 Python 的数据挖掘和机器学习平台_python orange-CSDN博客":
    "Orange, a Python-Based Data Mining Platform",
  "最全的tmux手册 - 知乎": "The tmux Handbook",
  "MCP 教程：将 Figma 设计稿转化为前端代码 - 文档 - TRAE CN":
    "Turning Figma Designs into Frontend Code with MCP",
  "(45 封私信 / 2 条消息) Figma设计稿秒变代码！Trae MCP 深度实测：从配置到生成全流程拆解 - 知乎":
    "From Figma to Code with Trae MCP",
  "Axure10_win安装教程(安装、汉化、授权码，去弹窗）_axure10授权码-CSDN博客":
    "Installing Axure 10 on Windows",
  "高质量论文配图配色（附RGB值及16进制码）_科研配色-CSDN博客":
    "Color Palettes for Academic Figures",
  "(46 封私信 / 2 条消息) 中科院敖翔：如何用图神经网络应对互联网金融欺诈？ - 知乎":
    "Graph Neural Networks for Internet Finance Fraud",
  "3D 小白亲测：用 Trae + Blender MCP 从零开始 AI 建模（附踩坑指南） - 文章 - 开发者社区 - 火山引擎":
    "AI Modeling from Scratch with Trae and Blender MCP",
  "10分钟部署一个模型：YOLOV8从环境配置到模型部署优化_yolo模型部署-CSDN博客":
    "Deploying YOLOv8 in 10 Minutes",
  "2024 最全Fake News 虚假新闻数据集-持续更新 - 知乎":
    "A Living Fake News Dataset List for 2024",
  "关键帧提取-CSDN博客": "Keyframe Extraction",
  "【三秒上手】视频关键帧提取（三种开源方法） - 知乎":
    "Three Open-Source Methods for Video Keyframes",
  "yolov8-pose 训练自己的数据集（机械臂关键点检测） - 知乎":
    "Training YOLOv8-Pose on a Custom Dataset",
  "AutoDL清理磁盘空间": "Cleaning Disk Space on AutoDL",
  "【华南理工大学】PC客户端配置-如何在家连接学校的校园网_华南理工大学校园网客户端-CSDN博客":
    "Connecting to the SCUT Campus Network from Home",
};

function normalizeText(value) {
  return value.replace(/\s+/g, " ").trim();
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("'", "&#39;");
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseBookmarks(html) {
  const lines = html.split(/\r?\n/);
  const stack = [];
  const root = { type: "folder", title: "root", children: [] };
  stack.push(root);

  let pendingFolder = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    let match = null;

    if ((match = line.match(/<DT><H3[^>]*>(.*?)<\/H3>/i))) {
      pendingFolder = {
        type: "folder",
        title: normalizeText(match[1]),
        children: [],
      };
      stack[stack.length - 1].children.push(pendingFolder);
      continue;
    }

    if (/<DL><p>/i.test(line)) {
      if (pendingFolder) {
        stack.push(pendingFolder);
        pendingFolder = null;
      }
      continue;
    }

    if (/<\/DL>/i.test(line)) {
      if (stack.length > 1) {
        stack.pop();
      }
      continue;
    }

    if ((match = line.match(/<DT><A [^>]*HREF="([^"]+)"[^>]*>(.*?)<\/A>/i))) {
      stack[stack.length - 1].children.push({
        type: "link",
        title: normalizeText(match[2]),
        href: match[1],
      });
    }
  }

  return root;
}

function findFolder(node, title) {
  if (node.type === "folder" && node.title === title) {
    return node;
  }

  if (!node.children) {
    return null;
  }

  for (const child of node.children) {
    const found = findFolder(child, title);
    if (found) {
      return found;
    }
  }

  return null;
}

function collectLeafFolders(node, trail = []) {
  const folderChildren = (node.children || []).filter((child) => child.type === "folder");
  if (folderChildren.length === 0) {
    return [{ folder: node, trail }];
  }

  return folderChildren.flatMap((child) => collectLeafFolders(child, [...trail, node.title]));
}

function translateFolderTitle(title) {
  return folderTranslations[title] || title;
}

function translateLinkTitle(title) {
  const cleaned = normalizeText(title);
  return titleTranslations[cleaned] || cleaned;
}

function domainFromHref(href) {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return "external link";
  }
}

function cleanHref(href) {
  try {
    const url = new URL(href);
    if (url.hash.startsWith("#:~:text=")) {
      url.hash = "";
    }
    return url.toString();
  } catch {
    return href;
  }
}

function countLinks(node) {
  if (node.type === "link") {
    return 1;
  }
  return (node.children || []).reduce((total, child) => total + countLinks(child), 0);
}

function buildDataTree(bookmarkRoot) {
  const knowledgeBaseFolder = findFolder(bookmarkRoot, "Knowlegde Base");
  if (!knowledgeBaseFolder) {
    throw new Error("Could not find the 'Knowlegde Base' folder in the bookmarks export.");
  }

  const untranslated = [];
  const leafFolders = collectLeafFolders(knowledgeBaseFolder)
    .filter((entry) => entry.folder.title !== "Knowlegde Base")
    .map((entry) => {
      const translatedTitle = translateFolderTitle(entry.folder.title);
      if (/[^\u0000-\u007f]/.test(translatedTitle)) {
        untranslated.push(`Folder: ${entry.folder.title}`);
      }

      const links = (entry.folder.children || [])
        .filter((child) => child.type === "link")
        .map((link) => {
          const translatedLinkTitle = translateLinkTitle(link.title);
          if (/[^\u0000-\u007f]/.test(translatedLinkTitle)) {
            untranslated.push(`Link: ${link.title}`);
          }

          return {
            title: translatedLinkTitle,
            originalTitle: link.title,
            href: cleanHref(link.href),
            domain: domainFromHref(link.href),
          };
        });

      return {
        id: slugify(translatedTitle),
        title: translatedTitle,
        originalTitle: entry.folder.title,
        parent: entry.trail[entry.trail.length - 1]
          ? translateFolderTitle(entry.trail[entry.trail.length - 1])
          : translateFolderTitle(knowledgeBaseFolder.title),
        note: sectionDescriptions[translatedTitle] || "Selected references from the knowledge archive.",
        span: layoutSpans[translatedTitle] || "standard",
        count: links.length,
        links,
      };
    });

  return {
    site: {
      title: "Knowledge Base",
      displayTitle: "Library",
      owner: "noahisarider",
      ownerUrl: "https://github.com/NoahIsARider",
      sourceFile: path.basename(inputPath),
      updatedAt: new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(fs.statSync(inputPath).mtime),
    },
    stats: {
      totalLinks: leafFolders.reduce((sum, section) => sum + section.count, 0),
      totalSections: leafFolders.length,
      totalBranches: knowledgeBaseFolder.children.length,
    },
    sections: leafFolders,
    untranslated,
  };
}

function renderTopNav(sections) {
  return sections
    .map(
      (section) =>
        `<a href="#${escapeAttribute(section.id)}">${escapeHtml(section.title)}</a>`,
    )
    .join("\n");
}

function renderSection(section) {
  const links = section.links
    .map(
      (link) => `
        <li class="link-item">
          <a href="${escapeAttribute(link.href)}" target="_blank" rel="noreferrer" title="${escapeAttribute(link.originalTitle)}">
            <span class="link-title">${escapeHtml(link.title)}</span>
            <span class="link-meta">${escapeHtml(link.domain)}</span>
          </a>
        </li>`,
    )
    .join("\n");

  return `
    <article class="section-block" id="${escapeAttribute(section.id)}" data-span="${escapeAttribute(section.span)}">
      <div class="section-head">
        <h2>${escapeHtml(section.title)}</h2>
        <span class="section-count">${section.count} links</span>
      </div>
      <p class="section-parent">${escapeHtml(section.parent)}</p>
      <p class="section-note">${escapeHtml(section.note)}</p>
      <ul class="link-list">
        ${links}
      </ul>
    </article>`;
}

function renderHtml(data) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(data.site.owner)} | ${escapeHtml(data.site.title)}</title>
  <meta name="description" content="A translated private knowledge index built from NoahIsARider's bookmark archive.">
  <meta name="theme-color" content="#e7a1c4">
  <link rel="icon" type="image/png" href="${iconName}">
  <link rel="apple-touch-icon" href="${iconName}">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="page-shell">
    <header class="topbar" id="top">
      <a class="brand" href="${escapeAttribute(data.site.ownerUrl)}" target="_blank" rel="noreferrer">${escapeHtml(
        data.site.owner,
      )}</a>
      <nav class="topnav" aria-label="Knowledge base sections">
        ${renderTopNav(data.sections)}
      </nav>
      <p class="topbar-status">${data.stats.totalLinks} links<br>${data.stats.totalSections} sections</p>
    </header>

    <section class="intro-grid" aria-label="Site introduction">
      <article class="intro-block">
        <h2>Index</h2>
        <p>A translated reading wall built from the knowledge base branch inside the bookmarks export.</p>
      </article>
      <article class="intro-block">
        <h2>Focus</h2>
        <p>Research methods, software notes, AI experiments, and cultural references that still matter on a second read.</p>
      </article>
      <article class="intro-block">
        <h2>Source</h2>
        <p>Compiled from <span class="mono">${escapeHtml(data.site.sourceFile)}</span> and refreshed on ${escapeHtml(
          data.site.updatedAt,
        )}.</p>
      </article>
      <article class="intro-block">
        <h2>Contact</h2>
        <p><a href="${escapeAttribute(data.site.ownerUrl)}" target="_blank" rel="noreferrer">GitHub / NoahIsARider</a><br>Private archive, public doorway.</p>
      </article>
    </section>

    <section class="stage-mark" aria-hidden="true">
      <img class="stage-mark-image" src="${backgroundName}" alt="">
    </section>

    <section class="directory-grid" aria-label="Knowledge directory">
      ${data.sections.map(renderSection).join("\n")}
    </section>

    <footer class="footer">
      <p>Built for static deployment and action-based publishing.</p>
      <p><a href="#top">Back to top</a></p>
    </footer>
  </div>
</body>
</html>`;
}

function ensureBuildInputs() {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Missing source bookmarks file: ${inputPath}`);
  }

  if (!fs.existsSync(stylesPath)) {
    throw new Error(`Missing styles file: ${stylesPath}`);
  }
}

function writeOutputs(html, json) {
  fs.mkdirSync(distDir, { recursive: true });

  fs.writeFileSync(path.join(rootDir, "index.html"), html, "utf8");
  fs.writeFileSync(path.join(rootDir, "knowledge-base.json"), json, "utf8");

  fs.writeFileSync(path.join(distDir, "index.html"), html, "utf8");
  fs.writeFileSync(path.join(distDir, "knowledge-base.json"), json, "utf8");
  fs.copyFileSync(stylesPath, path.join(distDir, "styles.css"));
  fs.copyFileSync(path.join(rootDir, iconName), path.join(distDir, iconName));
  fs.copyFileSync(path.join(rootDir, backgroundName), path.join(distDir, backgroundName));
  fs.writeFileSync(path.join(distDir, ".nojekyll"), "", "utf8");
}

function main() {
  ensureBuildInputs();

  const html = fs.readFileSync(inputPath, "utf8");
  const parsed = parseBookmarks(html);
  const data = buildDataTree(parsed);
  const json = `${JSON.stringify(data, null, 2)}\n`;
  const page = renderHtml(data);

  writeOutputs(page, json);

  if (data.untranslated.length > 0) {
    console.warn("Some entries still contain non-ASCII text:");
    for (const item of data.untranslated) {
      console.warn(`  - ${item}`);
    }
  }

  console.log(`Generated index.html, knowledge-base.json, and dist output from ${path.basename(inputPath)}.`);
}

main();
