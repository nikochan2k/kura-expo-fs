import {
  deleteAsync,
  documentDirectory,
  EncodingType,
  FileInfo,
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
  LAST_DIR_SEPARATORS,
  normalizePath
} from "kura";
import { FileSystemOptions } from "kura/lib/FileSystemOptions";
import { ExpoFsFileSystem } from "./ExpoFsFileSystem";

export class ExpoFsAccessor extends AbstractAccessor {
  private rootUri: string;

  filesystem: FileSystem;
  name: string;

  constructor(rootDir: string, options: FileSystemOptions) {
    super(options);
    this.filesystem = new ExpoFsFileSystem(this);
    this.name = rootDir;

    this.rootUri = documentDirectory.replace(LAST_DIR_SEPARATORS, "") + rootDir;
    console.log(this.rootUri);
    this.doGetInfo("/").then(info => {
      if (!info.exists) {
        makeDirectoryAsync(this.rootUri).catch(e => {
          console.error(e);
        });
      }
    });
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
    return `${this.rootUri}${fullPath}`;
  }

  protected async doDelete(fullPath: string, isFile: boolean) {
    const info = await this.doGetInfo(fullPath);
    if (!info.exists) {
      return;
    }
    if (isFile) {
      try {
        await deleteAsync(info.uri);
      } catch (e) {
        console.warn(e);
      }
    } else {
      const names = await readDirectoryAsync(info.uri);
      if (names.length === 0) {
        try {
          await deleteAsync(info.uri);
        } catch (e) {
          console.warn(e);
        }
      } else {
        throw new InvalidModificationError(
          this.name,
          fullPath,
          "directory not empty"
        );
      }
    }
  }

  protected async doGetContent(fullPath: string): Promise<Blob> {
    const info = await this.doGetInfo(fullPath);
    if (!info.exists) {
      return null;
    }
    try {
      const content = await readAsStringAsync(info.uri, {
        encoding: EncodingType.Base64
      });
      return base64ToBlob(content);
    } catch (e) {
      console.warn(e);
      return null;
    }
  }

  protected async doGetObject(fullPath: string): Promise<FileSystemObject> {
    const info = await this.doGetInfo(fullPath);
    return info.exists
      ? {
          fullPath: fullPath,
          name: fullPath.split(DIR_SEPARATOR).pop(),
          lastModified: info.modificationTime,
          size: info.isDirectory ? undefined : info.size
        }
      : null;
  }

  protected async doGetObjects(dirPath: string): Promise<FileSystemObject[]> {
    const readdirUri = this.toURL(dirPath);
    let names: string[];
    try {
      names = await readDirectoryAsync(readdirUri);
    } catch (e) {
      console.error(e);
      return null;
    }
    const objects: FileSystemObject[] = [];
    for (const name of names) {
      const fullPath = normalizePath(dirPath + DIR_SEPARATOR + name);
      const info = await this.doGetInfo(fullPath);
      if (!info.exists) {
        continue;
      }
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
    const fileUri = this.toURL(fullPath);
    const base64 = await blobToBase64(content);
    try {
      await writeAsStringAsync(fileUri, base64, {
        encoding: EncodingType.Base64
      });
    } catch (e) {
      console.warn(e);
    }
  }

  protected async doPutObject(obj: FileSystemObject) {
    if (obj.size != null) {
      return;
    }

    const info = await this.doGetInfo(obj.fullPath);
    if (!info.exists) {
      try {
        await makeDirectoryAsync(info.uri);
      } catch (e) {
        console.warn(e);
      }
    }
  }

  private async doGetInfo(fullPath: string) {
    const fileUri = this.toURL(fullPath);
    let info: FileInfo;
    try {
      info = await getInfoAsync(fileUri, { size: true });
    } catch (e) {
      console.warn(e);
      info = { exists: false } as FileInfo;
    }
    if (!info.uri) {
      info.uri = fileUri;
    }
    return info;
  }
}
