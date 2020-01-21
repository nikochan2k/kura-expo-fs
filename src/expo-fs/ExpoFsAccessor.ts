import { AbstractAccessor, FileSystem, FileSystemObject } from "kura";
import { ExpoFsFileSystem } from "./ExpoFsFileSystem";

export class ExpoFsAccessor extends AbstractAccessor {
  filesystem: FileSystem;
  name: string;

  constructor(public bucket: string, useIndex: boolean) {
    super(useIndex);
    this.filesystem = new ExpoFsFileSystem(this);
    this.name = bucket;
  }

  async getContent(fullPath: string): Promise<Blob> {
    return null;
  }

  async getObject(fullPath: string): Promise<FileSystemObject> {
    return null;
  }

  async hasChild(fullPath: string) {
    return false;
  }

  protected async doDelete(fullPath: string) {
    return;
  }

  protected async doGetObjects(fullPath: string): Promise<FileSystemObject[]> {
    return null;
  }

  protected async doPutContent(fullPath: string, content: Blob) {}

  protected async doPutObject(obj: FileSystemObject) {}
}
