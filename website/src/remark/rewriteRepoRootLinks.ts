/**
 * Rewrites markdown links for a strict Docusaurus build:
 *
 * 1. Targets outside `/docs` (repo root, packages, …) → GitHub blob URLs
 * 2. Directory targets inside `/docs` → absolute `/docs/.../` routes
 *    (avoids broken `../folder/` URL resolution with trailingSlash)
 *
 * In-docs `.md` links are left alone so Docusaurus can map them to the
 * correct doc id / slug.
 */

import { existsSync, statSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

type MdNode = {
  type: string;
  url?: string;
  children?: MdNode[];
};

type VFileLike = {
  path?: string;
  history?: string[];
};

const HERE = dirname(fileURLToPath(import.meta.url));
const DOCS_ROOT = resolve(HERE, "../../../docs");
const REPO_ROOT = resolve(HERE, "../../..");
const GITHUB_BLOB = "https://github.com/ammar-tariq/jobjitsu/blob/main";

/** Folders under /docs with no README — map to a first useful page. */
const FOLDER_LANDING: Record<string, string> = {
  brand: "/docs/brand/BRAND_GUIDELINES/",
  product: "/docs/product/PRODUCT_VISION/",
};

function walk(node: MdNode, visit: (n: MdNode) => void): void {
  visit(node);
  if (!node.children) {
    return;
  }
  for (const child of node.children) {
    walk(child, visit);
  }
}

function sourcePath(file: VFileLike): string | undefined {
  return file.path ?? file.history?.[0];
}

function isInsideDocs(absolutePath: string): boolean {
  const rel = relative(DOCS_ROOT, absolutePath);
  return rel === "" || (!rel.startsWith(`..${sep}`) && rel !== "..");
}

function toPosix(p: string): string {
  return p.split(sep).join("/");
}

function docsRouteForDirectory(absoluteDir: string): string {
  const rel = toPosix(relative(DOCS_ROOT, absoluteDir));
  if (FOLDER_LANDING[rel]) {
    return FOLDER_LANDING[rel];
  }
  return rel ? `/docs/${rel}/` : "/docs/";
}

function rewriteUrl(url: string, mdFilePath: string): string {
  if (
    !url ||
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("mailto:") ||
    url.startsWith("#") ||
    url.startsWith("/") ||
    url.startsWith("pathname://")
  ) {
    return url;
  }

  const hashIndex = url.indexOf("#");
  const hash = hashIndex >= 0 ? url.slice(hashIndex) : "";
  const pathPart = hashIndex >= 0 ? url.slice(0, hashIndex) : url;
  if (!pathPart) {
    return url;
  }

  const absolute = resolve(dirname(mdFilePath), pathPart);

  if (!isInsideDocs(absolute)) {
    const relToRepo = toPosix(relative(REPO_ROOT, absolute));
    if (relToRepo.startsWith("..")) {
      return url;
    }
    return `${GITHUB_BLOB}/${relToRepo}${hash}`;
  }

  // File links inside /docs: leave for Docusaurus slug resolution.
  if (
    pathPart.endsWith(".md") ||
    pathPart.endsWith(".mdx") ||
    existsSync(`${absolute}.md`) ||
    existsSync(`${absolute}.mdx`)
  ) {
    return url;
  }

  if (existsSync(absolute) && statSync(absolute).isDirectory()) {
    return `${docsRouteForDirectory(absolute)}${hash}`;
  }

  // Trailing-slash directory link whose folder exists
  const trimmed = absolute.replace(/[/\\]+$/, "");
  if (existsSync(trimmed) && statSync(trimmed).isDirectory()) {
    return `${docsRouteForDirectory(trimmed)}${hash}`;
  }

  if (existsSync(resolve(absolute, "README.md"))) {
    return `${docsRouteForDirectory(absolute)}${hash}`;
  }

  return url;
}

export default function rewriteRepoRootLinks() {
  return (tree: MdNode, file: VFileLike) => {
    const mdFilePath = sourcePath(file);
    if (!mdFilePath) {
      return;
    }

    walk(tree, (node) => {
      if (node.type !== "link" || typeof node.url !== "string") {
        return;
      }
      node.url = rewriteUrl(node.url, mdFilePath);
    });
  };
}
