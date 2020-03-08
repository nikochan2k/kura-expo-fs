import {
  deleteAsync,
  EncodingType,
  getInfoAsync,
  makeDirectoryAsync,
  readAsStringAsync,
  readDirectoryAsync,
  writeAsStringAsync
} from "expo-file-system";
import {
  AbstractAccessor,
  base64ToBlob,
  blobToBase64,
  DIR_SEPARATOR,
  FileSystem,
  FileSystemObject,
  InvalidModificationError,
  normalizePath,
  Permission
} from "kura";
import { ExpoFsFileSystem } from "./ExpoFsFileSystem";

export class ExpoFsAccessor extends AbstractAccessor {
  filesystem: FileSystem;
  name: string;

  constructor(private rootDir: string, permission: Permission) {
    super(permission);
    this.filesystem = new ExpoFsFileSystem(this);
    this.name = rootDir;
  }

  async doDelete(fullPath: string, isFile: boolean) {
    const fileUri = this.toURL(fullPath);
    const info = await getInfoAsync(fileUri);
    if (!info.exists) {
      return;
    }
    if (isFile) {
      await deleteAsync(fileUri);
    } else {
      const names = await readDirectoryAsync(fileUri);
      if (names.length === 0) {
        await deleteAsync(fileUri);
      } else {
        throw new InvalidModificationError(
          this.name,
          fullPath,
          "directory not empty"
        );
      }
    }
  }

  async doGetContent(fullPath: string): Promise<Blob> {
    const fileUri = this.toURL(fullPath);
    const info = await getInfoAsync(fileUri);
    if (!info.exists) {
      return null;
    }
    const content = await readAsStringAsync(fileUri, {
      encoding: EncodingType.Base64
    });
    return base64ToBlob(content);
  }

  async doGetObject(fullPath: string): Promise<FileSystemObject> {
    const fileUri = this.toURL(fullPath);
    const info = await getInfoAsync(fileUri, { size: true });
    return info.exists
      ? {
          fullPath: fullPath,
          name: fullPath.split(DIR_SEPARATOR).pop(),
          lastModified: info.modificationTime,
          size: info.isDirectory ? undefined : info.size
        }
      : null;
  }

  async doGetObjects(dirPath: string): Promise<FileSystemObject[]> {
    const readdirUri = this.toURL(dirPath);
    const names = await readDirectoryAsync(readdirUri);
    const objects: FileSystemObject[] = [];
    for (const name of names) {
      const infoUri = `${readdirUri}/${name}`;
      const info = await getInfoAsync(infoUri);
      const fullPath = normalizePath(dirPath + DIR_SEPARATOR + name);
      objects.push({
        fullPath: fullPath,
        name: name,
        lastModified: info.modificationTime,
        size: info.isDirectory ? undefined : info.size
      });
    }
    return objects;
  }

  async doPutContent(fullPath: string, content: Blob) {
    const fileUri = this.toURL(fullPath);
    const base64 = await blobToBase64(content);
    await writeAsStringAsync(fileUri, base64, {
      encoding: EncodingType.Base64
    });
  }

  async doPutObject(obj: FileSystemObject) {
    if (obj.size != null) {
      return;
    }

    const fileUri = this.toURL(obj.fullPath);
    const info = await getInfoAsync(fileUri);
    if (!info.exists) {
      await makeDirectoryAsync(fileUri);
    }
  }

  async resetObject(fullPath: string, size?: number) {
    const obj = await this.doGetObject(fullPath);
    if (!obj) {
      return null;
    }
    await this.putObject(obj);
    return obj;
  }

  toURL(fullPath: string): string {
    return `${this.rootDir}${fullPath}`;
  }
}
