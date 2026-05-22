// ============================================
// 导航配置
// 统一管理所有导航菜单项
// ============================================

export interface NavItem {
  id: string;
  title: string;
  href: string;
  icon?: string; // Lucide 图标名称
  badge?: string; // 标签文字，如 "New", "Beta"
  requiresAuth?: boolean; // 是否需要登录
}

export interface NavGroup {
  id: string;
  title?: string; // 分组标题（可选）
  items: NavItem[];
}

// 左侧导航菜单 (工具页和管理页使用)
export const sidebarNavigation: NavGroup[] = [
  {
    id: "image",
    title: "IMAGE",
    items: [
      {
        id: "studio",
        title: "Studio",
        href: "/studio",
        icon: "Sparkles",
      },
    ],
  },
  {
    id: "user",
    items: [
      {
        id: "generations",
        title: "My Generations",
        href: "/generations",
        icon: "FolderOpen",
        requiresAuth: true,
      },
    ],
  },
  {
    id: "account",
    items: [
      {
        id: "credits",
        title: "Credits",
        href: "/credits",
        icon: "Gem",
      },
      {
        id: "settings",
        title: "Account",
        href: "/settings",
        icon: "User",
        requiresAuth: true,
      },
    ],
  },
];

// 落地页顶部导航 - Models 下拉菜单
// Hidden: image generation uses a single MiniMax model, no model selection dropdown
export const headerModels: typeof headerTools = [];

// 落地页顶部导航 - Tools 下拉菜单
export const headerTools = [
  {
    id: "studio",
    title: "Studio",
    href: "/studio",
    icon: "Sparkles",
  },
  {
    id: "gallery",
    title: "Gallery",
    href: "/gallery",
    icon: "Images",
  },
];

// 落地页顶部导航 - 文档链接
export const headerDocs = {
  id: "docs",
  title: "Docs",
  href: "https://docs.ai2art.net",
  external: true,
};

// 用户菜单项 (HeaderSimple 组件使用)
export const userMenuItems = [
  { id: "generations", title: "My Generations", href: "/generations", icon: "FolderOpen" },
  { id: "credits", title: "Credits", href: "/credits", icon: "Gem" },
  { id: "settings", title: "Account", href: "/settings", icon: "User" },
];
