import {
  AbstractAccessor,
  AbstractLocalFileSystem,
  LAST_DIR_SEPARATORS,
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
    rootDir = rootDir.replace(LAST_DIR_SEPARATORS, "");
    this.rootDir = rootDir;
  }

  protected createAccessor(): Promise<AbstractAccessor> {
    return new Promise<ExpoFsAccessor>(resolve => {
      const accessor = new ExpoFsAccessor(this.rootDir, this.permission);
      resolve(accessor);
    });
  }
}
