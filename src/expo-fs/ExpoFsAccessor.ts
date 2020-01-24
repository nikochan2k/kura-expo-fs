import { ExpoFsFileSystem } from "./ExpoFsFileSystem";
import {
  AbstractAccessor,
  base64ToBlob,
  blobToBase64,
  DIR_SEPARATOR,
  FileSystem,
  FileSystemObject
} from "kura";
import {
  deleteAsync,
  documentDirectory,
  EncodingType,
  getInfoAsync,
  readAsStringAsync,
  readDirectoryAsync,
  writeAsStringAsync
} from "expo-file-system";

export class ExpoFsAccessor extends AbstractAccessor {
  filesystem: FileSystem;
  name: string;

  constructor(public bucket: string, useIndex: boolean) {
    super(useIndex);
    this.filesystem = new ExpoFsFileSystem(this);
    this.name = bucket;
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

  async hasChild(fullPath: string) {
    const entries = await readDirectoryAsync(this.getFileUri(fullPath));
    return 0 < entries.length;
  }

  protected async doDelete(fullPath: string) {
    await deleteAsync(this.getFileUri(fullPath));
  }

  protected async doGetObjects(fullPath: string): Promise<FileSystemObject[]> {
    const fileUri = this.getFileUri(fullPath);
    const entries = await readDirectoryAsync(fileUri);
    const objects: FileSystemObject[] = [];
    for (const entry of entries) {
      const childUri = `${fileUri}/${entry}`;
      const info = await getInfoAsync(childUri);
      objects.push({
        fullPath: childUri,
        name: entry,
        lastModified: info.modificationTime,
        size: info.isDirectory ? undefined : info.size
      });
    }
    return objects;
  }

  protected async doPutContent(fullPath: string, content: Blob) {
    const base64 = await blobToBase64(content);
    await writeAsStringAsync(this.getFileUri(fullPath), base64, {
      encoding: "base64"
    });
  }

  protected async doPutObject(obj: FileSystemObject) {
    await writeAsStringAsync(this.getFileUri(obj.fullPath), "", {
      encoding: "base64"
    });
  }

  private getFileUri(fullPath: string) {
    return `${documentDirectory}${this.bucket}${fullPath}`;
  }
}
