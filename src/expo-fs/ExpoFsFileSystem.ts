import {
  AbstractDirectoryEntry,
  AbstractFileSystem,
  FileSystemParams
} from "kura";
import { ExpoFsAccessor } from "./ExpoFsAccessor";
import { ExpoFsDirectoryEntry } from "./ExpoFsDirectoryEntry";

export class ExpoFsFileSystem extends AbstractFileSystem<ExpoFsAccessor> {
  root: ExpoFsDirectoryEntry;

  constructor(accessor: ExpoFsAccessor) {
    super(accessor);
  }

  protected createRoot(
    params: FileSystemParams<ExpoFsAccessor>
  ): AbstractDirectoryEntry<ExpoFsAccessor> {
    return new ExpoFsDirectoryEntry(params);
  }
}
