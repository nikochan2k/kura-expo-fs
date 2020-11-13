import { LocalFileSystemAsync } from "kura";
import { FileSystemOptions } from "kura/lib/FileSystemOptions";
import { ExpoFsLocalFileSystem } from "./ExpoFsLocalFileSystem";

export class ExpoFsLocalFileSystemAsync extends LocalFileSystemAsync {
  // #region Constructors (1)

  constructor(rootDir: string, options?: FileSystemOptions) {
    super(new ExpoFsLocalFileSystem(rootDir, options));
  }

  // #endregion Constructors (1)
}
