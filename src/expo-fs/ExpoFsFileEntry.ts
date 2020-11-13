import {
  AbstractFileEntry,
  DirectoryEntry,
  FileSystemObject,
  FileSystemParams,
} from "kura";
import { ExpoFsAccessor } from "./ExpoFsAccessor";
import { ExpoFsDirectoryEntry } from "./ExpoFsDirectoryEntry";
import { ExpoFsFileWriter } from "./ExpoFsFileWriter";

export interface ExpoFsFileParams extends FileSystemParams<ExpoFsAccessor> {
  // #region Properties (1)

  size: number;

  // #endregion Properties (1)
}

export class ExpoFsFileEntry extends AbstractFileEntry<ExpoFsAccessor> {
  // #region Constructors (1)

  constructor(params: FileSystemParams<ExpoFsAccessor>) {
    super(params);
  }

  // #endregion Constructors (1)

  // #region Protected Methods (2)

  protected createFileWriter(file: File): ExpoFsFileWriter {
    return new ExpoFsFileWriter(this, file);
  }

  protected toDirectoryEntry(obj: FileSystemObject): DirectoryEntry {
    return new ExpoFsDirectoryEntry({
      accessor: this.params.accessor,
      ...obj,
    });
  }

  // #endregion Protected Methods (2)
}
