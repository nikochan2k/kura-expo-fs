import { AbstractAccessor, AbstractLocalFileSystem, normalizePath } from "kura";
import { FileSystemOptions } from "kura/lib/FileSystemOptions";
import { ExpoFsAccessor } from "./ExpoFsAccessor";

export class ExpoFsLocalFileSystem extends AbstractLocalFileSystem {
  private rootDir: string;

  constructor(rootDir: string, options?: FileSystemOptions) {
    super(options);
    this.rootDir = normalizePath(rootDir);
  }

  protected createAccessor(): Promise<AbstractAccessor> {
    return new Promise<ExpoFsAccessor>((resolve) => {
      const accessor = new ExpoFsAccessor(this.rootDir, this.options);
      resolve(accessor);
    });
  }
}
