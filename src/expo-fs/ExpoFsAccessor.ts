import {
  deleteAsync,
  documentDirectory,
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
  LAST_DIR_SEPARATORS,
  normalizePath,
  NotFoundError,
  NotReadableError
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

  toURL(fullPath: string): string {
    return `${this.rootUri}${fullPath}`;
  }

  protected async doDelete(fullPath: string, isFile: boolean) {
    const uri = this.toURL(fullPath);
    try {
      await deleteAsync(uri);
    } catch (err) {
      throw new InvalidModificationError(this.name, fullPath, err);
    }
  }

  protected async doGetContent(fullPath: string): Promise<Blob> {
    try {
      const uri = this.toURL(fullPath);
      const content = await readAsStringAsync(uri, {
        encoding: EncodingType.Base64
      });
      return base64ToBlob(content);
    } catch (err) {
      throw new NotReadableError(this.name, fullPath, err);
    }
  }

  protected async doGetObject(fullPath: string): Promise<FileSystemObject> {
    const info = await this.doGetInfo(fullPath);
    return {
      fullPath: fullPath,
      name: fullPath.split(DIR_SEPARATOR).pop(),
      lastModified: info.modificationTime,
      size: info.isDirectory ? undefined : info.size
    };
  }

  protected async doGetObjects(dirPath: string): Promise<FileSystemObject[]> {
    const uri = this.toURL(dirPath);
    try {
      var names = await readDirectoryAsync(uri);
    } catch (err) {
      throw new NotReadableError(this.name, dirPath, err);
    }
    const objects: FileSystemObject[] = [];
    for (const name of names) {
      const fullPath = normalizePath(dirPath + DIR_SEPARATOR + name);
      try {
        var info = await this.doGetInfo(fullPath);
      } catch (e) {
        if (e instanceof NotFoundError) {
          console.warn(e);
          continue;
        }
        throw e;
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
    const uri = this.toURL(fullPath);
    const base64 = await blobToBase64(content);
    try {
      await writeAsStringAsync(uri, base64, {
        encoding: EncodingType.Base64
      });
    } catch (err) {
      throw new InvalidModificationError(this.name, fullPath, err);
    }
  }

  protected async doPutObject(obj: FileSystemObject) {
    if (obj.size != null) {
      return;
    }

    const uri = this.toURL(obj.fullPath);
    try {
      await makeDirectoryAsync(uri);
    } catch (e) {
      throw new InvalidModificationError(this.name, obj.fullPath, e);
    }
  }

  private async doGetInfo(fullPath: string) {
    const fileUri = this.toURL(fullPath);
    try {
      const info = await getInfoAsync(fileUri, { size: true });
      if (!info.exists) {
        throw new NotFoundError(this.name, fullPath);
      }
      return info;
    } catch (e) {
      throw new NotReadableError(this.name, fullPath, e);
    }
  }
}
