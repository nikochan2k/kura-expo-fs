import {
  AbstractFileEntry,
  DirectoryEntry,
  FileSystemObject,
  FileSystemParams
} from "kura";
import { ExpoFsAccessor } from "./ExpoFsAccessor";
import { ExpoFsDirectoryEntry } from "./ExpoFsDirectoryEntry";
import { ExpoFsFileWriter } from "./ExpoFsFileWriter";

export interface ExpoFsFileParams extends FileSystemParams<ExpoFsAccessor> {
  size: number;
}

export class ExpoFsFileEntry extends AbstractFileEntry<ExpoFsAccessor> {
  constructor(params: FileSystemParams<ExpoFsAccessor>) {
    super(params);
  }

  protected createFileWriter(file: File): ExpoFsFileWriter {
    return new ExpoFsFileWriter(this, file);
  }

  protected toDirectoryEntry(obj: FileSystemObject): DirectoryEntry {
    return new ExpoFsDirectoryEntry({
      accessor: this.params.accessor,
      ...obj
    });
  }

  toURL() {
    return this.params.accessor.getUri(this.fullPath);
  }
}
