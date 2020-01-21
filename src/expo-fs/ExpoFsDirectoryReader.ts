import { AbstractDirectoryReader, FileSystemObject } from "kura";
import { ExpoFsAccessor } from "./ExpoFsAccessor";
import { ExpoFsDirectoryEntry } from "./ExpoFsDirectoryEntry";
import { ExpoFsFileEntry } from "./ExpoFsFileEntry";

export class ExpoFsDirectoryReader extends AbstractDirectoryReader<
  ExpoFsAccessor
> {
  constructor(public dirEntry: ExpoFsDirectoryEntry) {
    super(dirEntry);
  }

  protected createEntry(obj: FileSystemObject) {
    return obj.size != null
      ? new ExpoFsFileEntry({
          accessor: this.dirEntry.params.accessor,
          ...obj
        })
      : new ExpoFsDirectoryEntry({
          accessor: this.dirEntry.params.accessor,
          ...obj
        });
  }
}
