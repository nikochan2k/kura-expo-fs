import { LocalFileSystemAsync } from "kura";
import { ExpoFsLocalFileSystem } from "./ExpoFsLocalFileSystem";

export class ExpoFsLocalFileSystemAsync extends LocalFileSystemAsync {
  constructor(bucket: string, useIndex?: boolean) {
    super(new ExpoFsLocalFileSystem(bucket, useIndex));
  }
}
