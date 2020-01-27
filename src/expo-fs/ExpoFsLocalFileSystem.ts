import { AbstractAccessor, AbstractLocalFileSystem, Permission } from "kura";
import { ExpoFsAccessor } from "./ExpoFsAccessor";

export class ExpoFsLocalFileSystem extends AbstractLocalFileSystem {
  constructor(rootDir: string);
  constructor(rootDir: string, useIndex: boolean);
  constructor(rootDir: string, permission: Permission);
  constructor(private rootDir: string, config?: any) {
    super(config);
  }

  protected createAccessor(): Promise<AbstractAccessor> {
    return new Promise<ExpoFsAccessor>(resolve => {
      const accessor = new ExpoFsAccessor(this.rootDir, this.permission);
      resolve(accessor);
    });
  }
}
