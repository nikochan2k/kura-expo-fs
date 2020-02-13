import { AbstractAccessor, AbstractLocalFileSystem, Permission } from "kura";
import { ExpoFsAccessor } from "./ExpoFsAccessor";

const LAST_SLASH = /\/+$/.compile();

export class ExpoFsLocalFileSystem extends AbstractLocalFileSystem {
  private rootDir: string;

  constructor(rootDir: string);
  constructor(rootDir: string, useIndex: boolean);
  constructor(rootDir: string, permission: Permission);
  constructor(rootDir: string, config?: any) {
    super(config);
    rootDir = rootDir.replace(LAST_SLASH, "");
    this.rootDir = rootDir;
  }

  protected createAccessor(): Promise<AbstractAccessor> {
    return new Promise<ExpoFsAccessor>(resolve => {
      const accessor = new ExpoFsAccessor(this.rootDir, this.permission);
      resolve(accessor);
    });
  }
}
