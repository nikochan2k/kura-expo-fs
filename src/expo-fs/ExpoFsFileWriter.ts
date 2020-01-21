import { AbstractFileWriter, FileWriter } from "kura";
import { ExpoFsAccessor } from "./ExpoFsAccessor";
import { ExpoFsFileEntry } from "./ExpoFsFileEntry";

export class ExpoFsFileWriter extends AbstractFileWriter<ExpoFsAccessor>
  implements FileWriter {
  constructor(fileEntry: ExpoFsFileEntry, file: File) {
    super(fileEntry, file);
  }
}
