import {
  AbstractDirectoryEntry,
  AbstractFileSystem,
  FileSystemParams,
} from "kura";
import { ExpoFsAccessor } from "./ExpoFsAccessor";
import { ExpoFsDirectoryEntry } from "./ExpoFsDirectoryEntry";

export class ExpoFsFileSystem extends AbstractFileSystem<ExpoFsAccessor> {
  // #region Properties (1)

  public root: ExpoFsDirectoryEntry;

  // #endregion Properties (1)

  // #region Constructors (1)

  constructor(accessor: ExpoFsAccessor) {
    super(accessor);
  }

  // #endregion Constructors (1)

  // #region Protected Methods (1)

  protected createRoot(
    params: FileSystemParams<ExpoFsAccessor>
  ): AbstractDirectoryEntry<ExpoFsAccessor> {
    return new ExpoFsDirectoryEntry(params);
  }

  // #endregion Protected Methods (1)
}
