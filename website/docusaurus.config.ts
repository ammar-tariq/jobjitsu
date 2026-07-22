import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import rewriteRepoRootLinks from "./src/remark/rewriteRepoRootLinks";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * JobJitsu docs site — content is the existing monorepo `/docs` directory.
 * No copies; Docusaurus reads markdown in place.
 *
 * GitHub Pages (Actions) sets DOCUSAURUS_URL / DOCUSAURUS_BASE_URL for the
 * project site at https://ammar-tariq.github.io/jobjitsu/.
 */
const config: Config = {
  title: "JobJitsu",
  tagline: "The gentle art of landing the job.",
  favicon: "img/favicon.svg",

  url: process.env.DOCUSAURUS_URL ?? "https://jobjitsu.dev",
  baseUrl: process.env.DOCUSAURUS_BASE_URL ?? "/",

  organizationName: "ammar-tariq",
  projectName: "jobjitsu",
  // Required for correct relative ../ links in /docs markdown (GitHub Pages).
  trailingSlash: true,

  headTags: [
    {
      tagName: "link",
      attributes: {
        rel: "icon",
        type: "image/svg+xml",
        href: "/img/favicon.svg",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "apple-touch-icon",
        href: "/img/logo.svg",
      },
    },
    {
      tagName: "meta",
      attributes: {
        name: "theme-color",
        content: "#0B0A1A",
      },
    },
  ],

  markdown: {
    // Keep existing .md as Markdown (not MDX) so `{placeholders}` in brand docs don't break SSG.
    format: "detect",
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: "throw",
    },
  },

  themes: ["@docusaurus/theme-mermaid"],

  onBrokenLinks: "throw",
  onBrokenAnchors: "throw",

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
          // Keep 00_/0001- filename prefixes in URLs so markdown links resolve.
          numberPrefixParser: false,
          exclude: ["**/_*.{js,jsx,ts,tsx,md,mdx}", "**/_*/**", "**/*.{csv,json}"],
          beforeDefaultRemarkPlugins: [rewriteRepoRootLinks],
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
    metadata: [
      {
        name: "description",
        content:
          "JobJitsu — the gentle art of landing the job. On-device. On-target. On your terms.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "img/social-card.svg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "img/social-card.svg" },
    ],
    colorMode: {
      defaultMode: "dark",
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: "JobJitsu",
      hideOnScroll: false,
      logo: {
        alt: "JobJitsu Leverage Belt",
        src: "img/logo.svg",
        srcDark: "img/logo.svg",
        width: 28,
        height: 28,
      },
      items: [
        // Logo/title is Home — no emoji in primary chrome (DESIGN_SYSTEM).
        { to: "/getting-started", label: "Getting Started", position: "left" },
        {
          type: "docSidebar",
          sidebarId: "docs",
          position: "left",
          label: "Documentation",
        },
        { to: "/architecture", label: "Architecture", position: "left" },
        { to: "/ai-models", label: "AI Models", position: "left" },
        { to: "/plugins", label: "Plugins", position: "left" },
        { to: "/roadmap", label: "Roadmap", position: "left" },
        { to: "/contributing", label: "Contributing", position: "right" },
        { to: "/faq", label: "FAQ", position: "right" },
        { to: "/changelog", label: "Changelog", position: "right" },
        {
          href: "https://github.com/ammar-tariq/jobjitsu/discussions",
          label: "Discussions",
          position: "right",
        },
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
            { label: "Getting Started", to: "/getting-started" },
            { label: "Installation", to: "/installation" },
            { label: "Features", to: "/features" },
            { label: "FAQ", to: "/faq" },
          ],
        },
        {
          title: "Documentation",
          items: [
            { label: "Documentation", to: "/docs/adr/" },
            { label: "Architecture", to: "/architecture" },
            { label: "AI Models", to: "/ai-models" },
            { label: "Plugins", to: "/plugins" },
          ],
        },
        {
          title: "Project",
          items: [
            { label: "Roadmap", to: "/roadmap" },
            { label: "Changelog", to: "/changelog" },
            { label: "Contributing", to: "/contributing" },
            {
              label: "Discussions",
              href: "https://github.com/ammar-tariq/jobjitsu/discussions",
            },
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
