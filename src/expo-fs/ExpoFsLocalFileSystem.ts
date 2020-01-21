import { AbstractAccessor, AbstractLocalFileSystem } from "kura";
import { ExpoFsAccessor } from "./ExpoFsAccessor";

export class ExpoFsLocalFileSystem extends AbstractLocalFileSystem {
  constructor(bucket: string, useIndex: boolean) {
    super(bucket, useIndex);
  }

  protected createAccessor(useIndex: boolean): Promise<AbstractAccessor> {
    return new Promise<ExpoFsAccessor>(resolve => {
      const accessor = new ExpoFsAccessor(this.bucket, useIndex);
      resolve(accessor);
    });
  }
}
