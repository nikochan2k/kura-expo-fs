import { LocalFileSystemAsync, Permission } from "kura";
import { ExpoFsLocalFileSystem } from "./ExpoFsLocalFileSystem";

export class ExpoFsLocalFileSystemAsync extends LocalFileSystemAsync {
  constructor(rootDir: string);
  constructor(rootDir: string, useIndex: boolean);
  constructor(rootDir: string, permission: Permission);
  constructor(private rootDir: string, config?: any) {
    super(new ExpoFsLocalFileSystem(rootDir, config));
  }
}
