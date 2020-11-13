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
  // #region Constructors (1)

  constructor(params: FileSystemParams<ExpoFsAccessor>) {
    super(params);
  }

  // #endregion Constructors (1)

  // #region Public Methods (1)

  public toDirectoryEntry(obj: FileSystemObject): DirectoryEntry {
    return new ExpoFsDirectoryEntry({
      accessor: this.params.accessor,
      ...obj,
    });
  }

  // #endregion Public Methods (1)

  // #region Protected Methods (2)

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

  // #endregion Protected Methods (2)
}
