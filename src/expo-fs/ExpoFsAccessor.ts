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
  INDEX_FILE_NAME,
  InvalidModificationError
} from "kura";
import { ExpoFsFileSystem } from "./ExpoFsFileSystem";

export class ExpoFsAccessor extends AbstractAccessor {
  filesystem: FileSystem;
  name: string;

  constructor(private rootDir: string, useIndex: boolean) {
    super(useIndex);
    this.filesystem = new ExpoFsFileSystem(this);
    this.name = rootDir;
  }

  async getContent(fullPath: string): Promise<Blob> {
    const content = await readAsStringAsync(this.getFileUri(fullPath), {
      encoding: EncodingType.UTF8
    });
    return base64ToBlob(content);
  }

  async getObject(fullPath: string): Promise<FileSystemObject> {
    const info = await getInfoAsync(this.getFileUri(fullPath), { size: true });
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
    const fileUri = this.getFileUri(fullPath);
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

  protected async doGetObjects(fullPath: string): Promise<FileSystemObject[]> {
    const readdirUri = this.getFileUri(fullPath);
    const names = await readDirectoryAsync(readdirUri);
    const objects: FileSystemObject[] = [];
    for (const name of names) {
      const infoUri = `${readdirUri}/${name}`;
      const info = await getInfoAsync(infoUri);
      objects.push({
        fullPath: `${fullPath}${DIR_SEPARATOR}${name}`,
        name: name,
        lastModified: info.modificationTime,
        size: info.isDirectory ? undefined : info.size
      });
    }
    return objects;
  }

  protected async doPutContent(fullPath: string, content: Blob) {
    const fileUri = this.getFileUri(fullPath);
    const base64 = await blobToBase64(content);
    await writeAsStringAsync(fileUri, base64, {
      encoding: "base64"
    });
  }

  protected async doPutObject(obj: FileSystemObject) {
    const fileUri = this.getFileUri(obj.fullPath);
    if (obj.size != null) {
      await writeAsStringAsync(fileUri, "", {
        encoding: "base64"
      });
    } else {
      await makeDirectoryAsync(fileUri);
    }
  }

  private getFileUri(fullPath: string) {
    return `${this.rootDir}${fullPath}`;
  }
}
