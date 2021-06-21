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
  // #region Public Methods (1)

  public async transfer(
    fromAccessor: AbstractAccessor,
    fromObj: FileSystemObject,
    toAccessor: AbstractAccessor,
    toObj: FileSystemObject
  ) {
    const fromUrl = await fromAccessor.getURL(fromObj.fullPath, "GET");
    const toUrl = await toAccessor.getURL(toObj.fullPath, "GET");
    if (fromUrl && toUrl) {
      if (fromUrl.startsWith("file:")) {
        if (toUrl.startsWith("file:")) {
          await copyAsync({ from: fromUrl, to: toUrl });
        } else {
          const fromUrlPut = await fromAccessor.getURL(fromObj.fullPath, "PUT");
          await uploadAsync(toUrl, fromUrlPut, {
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
            const toUrlPut = await toAccessor.getURL(toObj.fullPath, "PUT");
            await uploadAsync(tempUri, toUrlPut, {
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
      await super.transfer(fromAccessor, fromObj, toAccessor, toObj);
    }
  }

  // #endregion Public Methods (1)
}
