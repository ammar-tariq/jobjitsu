import { mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import type { LocalFsIo } from "./local-fs-io.js";

/** Node.js filesystem IO for host tests and Node composition roots. */
export function createNodeFsIo(): LocalFsIo {
  return {
    async mkdir(path) {
      await mkdir(path, { recursive: true });
    },
    async readText(path) {
      return readFile(path, "utf8");
    },
    async writeText(path, contents) {
      await writeFile(path, contents, "utf8");
    },
    async readBytes(path) {
      const buf = await readFile(path);
      return new Uint8Array(buf);
    },
    async writeBytes(path, bytes) {
      await writeFile(path, bytes);
    },
    async readDir(path) {
      return readdir(path);
    },
    async remove(path, options = {}) {
      await rm(path, { recursive: options.recursive ?? false, force: true });
    },
    async exists(path) {
      try {
        await stat(path);
        return true;
      } catch (cause) {
        const code = (cause as NodeJS.ErrnoException | undefined)?.code;
        if (code === "ENOENT") {
          return false;
        }
        throw cause;
      }
    },
  };
}
