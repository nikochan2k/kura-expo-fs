import {
  AbstractAccessor,
  AbstractLocalFileSystem,
  normalizePath,
  Permission
} from "kura";
import { ExpoFsAccessor } from "./ExpoFsAccessor";

export class ExpoFsLocalFileSystem extends AbstractLocalFileSystem {
  private rootDir: string;

  constructor(rootDir: string);
  constructor(rootDir: string, useIndex: boolean);
  constructor(rootDir: string, permission: Permission);
  constructor(rootDir: string, config?: any) {
    super(config);
    this.rootDir = normalizePath(rootDir);
  }

  protected createAccessor(): Promise<AbstractAccessor> {
    return new Promise<ExpoFsAccessor>(resolve => {
      const accessor = new ExpoFsAccessor(this.rootDir, this.permission);
      resolve(accessor);
    });
  }
}
