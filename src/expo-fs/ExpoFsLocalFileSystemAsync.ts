import { LocalFileSystemAsync } from "kura";
import { FileSystemOptions } from "kura/lib/FileSystemOptions";
import { ExpoFsLocalFileSystem } from "./ExpoFsLocalFileSystem";

export class ExpoFsLocalFileSystemAsync extends LocalFileSystemAsync {
  constructor(rootDir: string, options?: FileSystemOptions) {
    super(new ExpoFsLocalFileSystem(rootDir, options));
  }
}
