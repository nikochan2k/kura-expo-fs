import { AbstractAccessor, AbstractLocalFileSystem, normalizePath } from "kura";
import { FileSystemOptions } from "kura/lib/FileSystemOptions";
import { ExpoFsAccessor } from "./ExpoFsAccessor";

export class ExpoFsLocalFileSystem extends AbstractLocalFileSystem {
  // #region Properties (1)

  private rootDir: string;

  // #endregion Properties (1)

  // #region Constructors (1)

  constructor(rootDir: string, options?: FileSystemOptions) {
    super(options);
    this.rootDir = normalizePath(rootDir);
  }

  // #endregion Constructors (1)

  // #region Protected Methods (1)

  protected createAccessor(): Promise<AbstractAccessor> {
    return new Promise<ExpoFsAccessor>((resolve) => {
      const accessor = new ExpoFsAccessor(this.rootDir, this.options);
      resolve(accessor);
    });
  }

  // #endregion Protected Methods (1)
}
