import {
  AbstractDirectoryEntry,
  DirectoryEntry,
  FileEntry,
  FileSystemObject,
  FileSystemParams,
} from "kura";
import { ExpoFsAccessor } from "./ExpoFsAccessor";
import { ExpoFsFileEntry } from "./ExpoFsFileEntry";

export class ExpoFsDirectoryEntry extends AbstractDirectoryEntry<
  ExpoFsAccessor
> {
  constructor(params: FileSystemParams<ExpoFsAccessor>) {
    super(params);
  }

  toDirectoryEntry(obj: FileSystemObject): DirectoryEntry {
    return new ExpoFsDirectoryEntry({
      accessor: this.params.accessor,
      ...obj,
    });
  }

  protected createEntry(obj: FileSystemObject) {
    return obj.size != null
      ? new ExpoFsFileEntry({
          accessor: this.params.accessor,
          ...obj,
        })
      : new ExpoFsDirectoryEntry({
          accessor: this.params.accessor,
          ...obj,
        });
  }

  protected toFileEntry(obj: FileSystemObject): FileEntry {
    return new ExpoFsFileEntry({
      accessor: this.params.accessor,
      ...obj,
    });
  }
}
