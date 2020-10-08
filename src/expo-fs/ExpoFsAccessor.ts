import {
  deleteAsync,
  documentDirectory,
  getInfoAsync,
  makeDirectoryAsync,
  readAsStringAsync,
  readDirectoryAsync,
  writeAsStringAsync,
} from "expo-file-system";
import {
  AbstractAccessor,
  DIR_SEPARATOR,
  FileSystem,
  FileSystemObject,
  InvalidModificationError,
  LAST_DIR_SEPARATORS,
  normalizePath,
  NotFoundError,
  NotReadableError,
  toBase64,
  FileNameIndex,
  INDEX_DIR,
  getName,
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
    makeDirectoryAsync(this.rootUri).catch((e) => {
      console.debug(e);
    });
    console.log(this.rootUri);
  }

  async doDelete(fullPath: string, isFile: boolean) {
    const uri = this.toURL(fullPath);

    try {
      await deleteAsync(uri);
    } catch (e) {
      try {
        const info = await getInfoAsync(uri); // Already exists
        if (!info.exists) {
          return;
        }
      } catch {}
      this.log("deleteAsync", uri, e);
      throw new InvalidModificationError(this.name, fullPath, e);
    }
  }

  async doGetObject(fullPath: string): Promise<FileSystemObject> {
    const info = await this.doGetInfo(fullPath);
    return {
      fullPath: fullPath,
      name: fullPath.split(DIR_SEPARATOR).pop(),
      lastModified: info.modificationTime,
      size: info.isDirectory ? undefined : info.size,
    };
  }

  async doGetObjects(dirPath: string): Promise<FileSystemObject[]> {
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
        size: info.isDirectory ? undefined : info.size,
      });
    }
    return objects;
  }

  async doMakeDirectory(obj: FileSystemObject) {
    const uri = this.toURL(obj.fullPath);
    try {
      await makeDirectoryAsync(uri);
    } catch (e) {
      try {
        await getInfoAsync(uri); // Already exists
        return;
      } catch {}
      this.log("makeDirectoryAsync", uri, e);
      throw new InvalidModificationError(this.name, obj.fullPath, e);
    }
  }

  async doReadContent(
    fullPath: string
  ): Promise<Blob | Uint8Array | ArrayBuffer | string> {
    const info = await this.doGetInfo(fullPath);
    return readAsStringAsync(info.uri, { encoding: "base64" });
  }

  toURL(fullPath: string): string {
    return `${this.rootUri}${fullPath}`;
  }

  protected async doSaveFileNameIndex(
    dirPath: string,
    fileNameIndex: FileNameIndex
  ) {
    const indexDir = INDEX_DIR + dirPath;
    await this.doMakeDirectory({
      fullPath: indexDir,
      name: getName(indexDir),
    });
    await super.doSaveFileNameIndex(dirPath, fileNameIndex);
  }

  protected async doWriteArrayBuffer(
    fullPath: string,
    buffer: ArrayBuffer
  ): Promise<void> {
    const base64 = await toBase64(buffer);
    await this.doWriteBase64(fullPath, base64);
  }

  protected async doWriteBase64(
    fullPath: string,
    base64: string
  ): Promise<void> {
    const uri = this.toURL(fullPath);
    await writeAsStringAsync(uri, base64, { encoding: "base64" });
  }

  protected async doWriteBlob(fullPath: string, blob: Blob): Promise<void> {
    const base64 = await toBase64(blob);
    await this.doWriteBase64(fullPath, base64);
  }

  protected async doWriteUint8Array(
    fullPath: string,
    view: Uint8Array
  ): Promise<void> {
    const base64 = await toBase64(view);
    await this.doWriteBase64(fullPath, base64);
  }

  protected initialize(options: FileSystemOptions) {
    if (options.shared == null) {
      options.shared = false;
    }
    super.initialize(options);
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
      console.trace(`${message} - ${uri}:`, e);
    }
  }
}
