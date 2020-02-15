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
  createPath,
  DIR_SEPARATOR,
  FileSystem,
  FileSystemObject,
  INDEX_FILE_NAME,
  InvalidModificationError,
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

  async doGetContent(fullPath: string): Promise<Blob> {
    const fileUri = this.getUri(fullPath);
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
    const fileUri = this.getUri(fullPath);
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

  protected async doDelete(fullPath: string, isFile: boolean) {
    const fileUri = this.getUri(fullPath);
    if (isFile) {
      await deleteAsync(fileUri);
    } else {
      const names = await readDirectoryAsync(fileUri);
      if (names.length === 0) {
        await deleteAsync(fileUri);
      } else {
        const index = names.pop();
        if (names.length === 0 && index === INDEX_FILE_NAME) {
          return;
        }
        throw new InvalidModificationError(
          this.name,
          fullPath,
          "directory not empty"
        );
      }
    }
  }

  protected async doGetObjects(dirPath: string): Promise<FileSystemObject[]> {
    const readdirUri = this.getUri(dirPath);
    const names = await readDirectoryAsync(readdirUri);
    const objects: FileSystemObject[] = [];
    for (const name of names) {
      const infoUri = `${readdirUri}/${name}`;
      const info = await getInfoAsync(infoUri);
      const fullPath = createPath(dirPath, name);
      objects.push({
        fullPath: fullPath,
        name: name,
        lastModified: info.modificationTime,
        size: info.isDirectory ? undefined : info.size
      });
    }
    return objects;
  }

  protected async doPutContent(fullPath: string, content: Blob) {
    const fileUri = this.getUri(fullPath);
    const base64 = await blobToBase64(content);
    await writeAsStringAsync(fileUri, base64, {
      encoding: EncodingType.Base64
    });
  }

  protected async doPutObject(obj: FileSystemObject) {
    const fileUri = this.getUri(obj.fullPath);
    if (obj.size != null) {
      await writeAsStringAsync(fileUri, "", {
        encoding: EncodingType.Base64
      });
    } else {
      await makeDirectoryAsync(fileUri);
    }
  }

  getUri(fullPath: string) {
    return `${this.rootDir}${fullPath}`;
  }
}
