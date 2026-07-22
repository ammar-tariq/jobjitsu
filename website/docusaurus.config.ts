import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * JobJitsu docs site — content is the existing monorepo `/docs` directory.
 * No copies; Docusaurus reads markdown in place.
 */
const config: Config = {
  title: "JobJitsu",
  tagline: "The gentle art of landing the job.",
  favicon: "img/favicon.svg",

  url: "https://jobjitsu.dev",
  baseUrl: "/",

  organizationName: "ammar-tariq",
  projectName: "jobjitsu",

  markdown: {
    // Keep existing .md as Markdown (not MDX) so `{placeholders}` in brand docs don't break SSG.
    format: "detect",
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },

  themes: ["@docusaurus/theme-mermaid"],

  onBrokenLinks: "warn",
  onBrokenAnchors: "warn",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          // Existing repository documentation — do not duplicate under website/
          path: resolve(__dirname, "../docs"),
          routeBasePath: "docs",
          sidebarPath: "./sidebars.ts",
          editUrl: "https://github.com/ammar-tariq/jobjitsu/tree/main/docs/",
          exclude: ["**/_*.{js,jsx,ts,tsx,md,mdx}", "**/_*/**", "**/*.{csv,json}"],
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: "img/social-card.svg",
    colorMode: {
      defaultMode: "dark",
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: "JobJitsu",
      logo: {
        alt: "JobJitsu",
        src: "img/logo.svg",
        srcDark: "img/logo.svg",
      },
      items: [
        { to: "/features", label: "Features", position: "left" },
        { to: "/quick-start", label: "Quick Start", position: "left" },
        { to: "/architecture", label: "Architecture", position: "left" },
        { to: "/roadmap", label: "Roadmap", position: "left" },
        {
          type: "docSidebar",
          sidebarId: "docs",
          position: "left",
          label: "Docs",
        },
        { to: "/contributing", label: "Contributing", position: "right" },
        {
          href: "https://github.com/ammar-tariq/jobjitsu",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Learn",
          items: [
            { label: "Features", to: "/features" },
            { label: "Installation", to: "/installation" },
            { label: "Quick Start", to: "/quick-start" },
            { label: "FAQ", to: "/faq" },
          ],
        },
        {
          title: "Documentation",
          items: [
            { label: "Product vision", to: "/docs/product/PRODUCT_VISION" },
            { label: "Architecture", to: "/docs/architecture/OVERVIEW" },
            { label: "Backlog", to: "/docs/backlog/" },
          ],
        },
        {
          title: "Project",
          items: [
            { label: "Roadmap", to: "/roadmap" },
            { label: "Contributing", to: "/contributing" },
            {
              label: "GitHub",
              href: "https://github.com/ammar-tariq/jobjitsu",
            },
          ],
        },
      ],
      copyright: `JobJitsu — the gentle art of landing the job.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: [
        "bash",
        "json",
        "typescript",
        "tsx",
        "javascript",
        "jsx",
        "rust",
        "toml",
        "yaml",
        "diff",
      ],
    },
    mermaid: {
      theme: {
        light: "neutral",
        dark: "dark",
      },
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
