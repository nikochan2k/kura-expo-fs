import {
  AbstractDirectoryEntry,
  DirectoryEntry,
  DirectoryReader,
  FileEntry,
  FileSystemObject,
  FileSystemParams
} from "kura";
import { ExpoFsAccessor } from "./ExpoFsAccessor";
import { ExpoFsDirectoryReader } from "./ExpoFsDirectoryReader";
import { ExpoFsFileEntry } from "./ExpoFsFileEntry";

export class ExpoFsDirectoryEntry extends AbstractDirectoryEntry<
  ExpoFsAccessor
> {
  constructor(params: FileSystemParams<ExpoFsAccessor>) {
    super(params);
  }

  createReader(): DirectoryReader {
    return new ExpoFsDirectoryReader(this);
  }

  toDirectoryEntry(obj: FileSystemObject): DirectoryEntry {
    return new ExpoFsDirectoryEntry({
      accessor: this.params.accessor,
      ...obj
    });
  }

  toFileEntry(obj: FileSystemObject): FileEntry {
    return new ExpoFsFileEntry({
      accessor: this.params.accessor,
      ...obj
    });
  }

  toURL() {
    return this.params.accessor.getUri(this.fullPath);
  }
}
