import { AbstractFileWriter, FileWriter } from "kura";
import { ExpoFsAccessor } from "./ExpoFsAccessor";
import { ExpoFsFileEntry } from "./ExpoFsFileEntry";

export class ExpoFsFileWriter
  extends AbstractFileWriter<ExpoFsAccessor>
  implements FileWriter {
  // #region Constructors (1)

  constructor(fileEntry: ExpoFsFileEntry, file: File) {
    super(fileEntry, file);
  }

  // #endregion Constructors (1)
}
