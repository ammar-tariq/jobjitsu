import {
  exists,
  mkdir,
  readDir,
  readFile,
  readTextFile,
  remove,
  writeFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import type { LocalFsIo } from "@jobjitsu/storage";

/**
 * Tauri filesystem IO — absolute paths under the allowlisted data folder scope.
 */
export function createTauriFsIo(): LocalFsIo {
  return {
    async mkdir(path) {
      await mkdir(path, { recursive: true });
    },
    async readText(path) {
      return readTextFile(path);
    },
    async writeText(path, contents) {
      await writeTextFile(path, contents);
    },
    async readBytes(path) {
      return readFile(path);
    },
    async writeBytes(path, bytes) {
      await writeFile(path, bytes);
    },
    async readDir(path) {
      const entries = await readDir(path);
      return entries.map((entry) => entry.name).filter((name): name is string => Boolean(name));
    },
    async remove(path, options = {}) {
      await remove(path, { recursive: options.recursive ?? false });
    },
    async exists(path) {
      return exists(path);
    },
  };
}
