// if(and)else Blog Config

export const siteConfig = {
  title: "if(and)else",
  description: "AI, code, leadership, and the occasional broader take",
  author: "Jim Cowart",
  siteUrl: "https://ifandelse.com",

  header: {
    coreNav: [
      { text: "Blog", href: "/blog" },
    ],
    showThemeSwitcher: false,
  },

  hero: {
    title: "if(and)else",
    typewriterLines: [
      "AI, code, leadership, and the occasional broader take",
      "by Jim Cowart"
    ],
    description: "A blog about **human agency**, **building products**, and **not surrendering your mental model**.",
    terminalTitle: "~/ifandelse",
    ctaButtons: [
      { text: "[blog]", href: "/blog", primary: true },
      { text: "[about]", href: "/about", primary: false }
    ],
  },

  theme: {
    defaultTheme: "catppuccin-mocha",
  },

  social: {
    github: "https://github.com/ifandelse",
    twitter: "https://twitter.com/ifandelse",
    linkedin: "",
    bluesky: "",
    mastodon: "",
    email: "",
    rss: "/rss.xml",
  },

  blog: {
    postsOnHomepage: 5,
    postsPerPage: 10,
    showReadingTime: true,
    showTableOfContents: true,
    showPostNavigation: true,
    showTags: true,
    showFeaturedPost: true,
    dateFormat: "MMMM d, yyyy",
  },

  projects: {
    gridColumns: 3,
    showStatus: true,
    items: [],
  },

  footer: {
    statusMessage: "All systems operational",
    copyright: "© %YEAR% Jim Cowart",
    showSocialLinks: true,
  },

  seo: {
    ogImage: "/og-image.svg",
    twitterCard: "summary_large_image" as const,
    twitterHandle: "@ifandelse",
    googleSiteVerification: "",
  },

  pages: {
    blog: true,
    projects: false,
    search: true,
    archives: true,
    rss: true,
  },

  advanced: {
    commandPalette: true,
    showCopyCode: true,
    showLineNumbers: false,
    showBreadcrumbs: true,
    pageTransitions: true,
  },

  demo: {
    enabled: import.meta.env.PUBLIC_ENABLE_DEMO === 'true' || false,
  },
};

export type SiteConfig = typeof siteConfig;
