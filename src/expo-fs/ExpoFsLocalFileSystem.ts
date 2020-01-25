import { AbstractAccessor, AbstractLocalFileSystem } from "kura";
import { ExpoFsAccessor } from "./ExpoFsAccessor";

export class ExpoFsLocalFileSystem extends AbstractLocalFileSystem {
  constructor(private rootDir: string, useIndex: boolean) {
    super(useIndex);
  }

  protected createAccessor(useIndex: boolean): Promise<AbstractAccessor> {
    return new Promise<ExpoFsAccessor>(resolve => {
      const accessor = new ExpoFsAccessor(this.rootDir, useIndex);
      resolve(accessor);
    });
  }
}
