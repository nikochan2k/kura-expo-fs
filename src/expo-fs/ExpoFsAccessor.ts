import {
  deleteAsync,
  documentDirectory,
  EncodingType,
  getInfoAsync,
  makeDirectoryAsync,
  readDirectoryAsync,
  writeAsStringAsync
} from "expo-file-system";
import {
  AbstractAccessor,
  blobToBase64,
  DIR_SEPARATOR,
  FileSystem,
  FileSystemObject,
  InvalidModificationError,
  LAST_DIR_SEPARATORS,
  normalizePath,
  NotFoundError,
  NotReadableError,
  urlToBlob
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
    } catch (e) {
      this.log("deleteAsync", uri, e);
      throw new InvalidModificationError(this.name, fullPath, e);
    }
  }

  protected async doGetContent(fullPath: string): Promise<Blob> {
    const info = await this.doGetInfo(fullPath);
    try {
      return urlToBlob(info.uri);
    } catch (e) {
      this.log("readAsStringAsync", info.uri, e);
      throw new NotReadableError(this.name, fullPath, e);
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
    const dirInfo = await this.doGetInfo(dirPath);
    try {
      var names = await readDirectoryAsync(dirInfo.uri);
    } catch (e) {
      this.log("readDirectoryAsync", dirInfo.uri, e);
      throw new NotReadableError(this.name, dirPath, e);
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
    const base64 = await new Promise<string>((resolve, reject) => {
      // React Native hack
      setTimeout(async () => {
        try {
          const base64 = await blobToBase64(content);
          resolve(base64);
        } catch (e) {
          reject(new InvalidModificationError(this.name, fullPath, e));
        }
      }, 0);
    });
    try {
      await writeAsStringAsync(uri, base64, {
        encoding: EncodingType.Base64
      });
    } catch (e) {
      this.log("writeAsStringAsync", uri, e);
      throw new InvalidModificationError(this.name, fullPath, e);
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
      this.log("makeDirectoryAsync", uri, e);
      throw new InvalidModificationError(this.name, obj.fullPath, e);
    }
  }

  private async doGetInfo(fullPath: string) {
    const uri = this.toURL(fullPath);
    try {
      var info = await getInfoAsync(uri, { size: true });
    } catch (e) {
      this.log("getInfoAsync", uri, e);
      throw new NotReadableError(this.name, fullPath, e);
    }
    if (!info.exists) {
      throw new NotFoundError(this.name, fullPath);
    }
    return info;
  }

  private log(message: string, uri: string, e: any) {
    if (!this.options.verbose) {
      return;
    }

    if (!e) {
      console.log(`${message} - ${uri}`);
    } else {
      const detail = JSON.stringify(e, null, 2);
      console.log(`${message} - ${uri}: ${detail}`);
    }
  }
}
