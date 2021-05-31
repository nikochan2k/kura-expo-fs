import {
  cacheDirectory,
  copyAsync,
  deleteAsync,
  downloadAsync,
  FileSystemSessionType,
  FileSystemUploadType,
  uploadAsync,
} from "expo-file-system";
import {
  AbstractAccessor,
  DIR_SEPARATOR,
  FileSystemObject,
  LAST_DIR_SEPARATORS,
  Transferer,
} from "kura";

export class ExpoFsTransferer extends Transferer {
  constructor(fromAccessor: AbstractAccessor, toAccessor: AbstractAccessor) {
    super(fromAccessor, toAccessor);
  }

  public async transfer(fromObj: FileSystemObject, toObj: FileSystemObject) {
    const fromUrl = fromObj.url;
    const toUrl = toObj.url;
    if (fromUrl && toUrl) {
      if (fromUrl.startsWith("file:")) {
        if (toUrl.startsWith("file:")) {
          await copyAsync({ from: fromUrl, to: toUrl });
        } else {
          await uploadAsync(toUrl, fromUrl, {
            httpMethod: "PUT",
            sessionType: FileSystemSessionType.FOREGROUND,
            uploadType: FileSystemUploadType.BINARY_CONTENT,
          });
        }
      } else {
        if (toUrl.startsWith("file:")) {
          await downloadAsync(fromUrl, toUrl, {
            sessionType: FileSystemSessionType.FOREGROUND,
          });
        } else {
          const tempUri =
            cacheDirectory.replace(LAST_DIR_SEPARATORS, "") +
            DIR_SEPARATOR +
            Date.now();
          try {
            await downloadAsync(fromUrl, tempUri, {
              sessionType: FileSystemSessionType.FOREGROUND,
            });
            await uploadAsync(toUrl, tempUri, {
              httpMethod: "PUT",
              sessionType: FileSystemSessionType.FOREGROUND,
              uploadType: FileSystemUploadType.BINARY_CONTENT,
            });
          } finally {
            try {
              deleteAsync(tempUri);
            } catch {}
          }
        }
      }
    } else {
      await super.transfer(fromObj, toObj);
    }
  }
}
