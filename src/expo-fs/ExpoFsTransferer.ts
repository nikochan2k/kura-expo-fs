import {
  cacheDirectory,
  copyAsync,
  deleteAsync,
  downloadAsync,
  FileSystemSessionType,
  FileSystemUploadType,
  getInfoAsync,
  uploadAsync,
} from "expo-file-system";
import {
  AbstractAccessor,
  DIR_SEPARATOR,
  FileSystemObject,
  LAST_DIR_SEPARATORS,
  Transferer,
} from "kura";

interface ExpoFsTransfererOptions {
  background?: boolean;
  getOnly?: boolean;
  threshold?: number;
}
export class ExpoFsTransferer extends Transferer {
  public constructor(private options?: ExpoFsTransfererOptions) {
    super();
    if (!options) {
      options = {};
    }
    if (options.getOnly == null) {
      options.getOnly = false;
    }
    if (options.background == null) {
      options.background = false;
    }
  }

  public async transfer(
    fromAccessor: AbstractAccessor,
    fromObj: FileSystemObject,
    toAccessor: AbstractAccessor,
    toObj: FileSystemObject
  ) {
    if (
      this.options.threshold != null &&
      fromObj.size < this.options.threshold
    ) {
      await super.transfer(fromAccessor, fromObj, toAccessor, toObj);
      return;
    }

    const toUrl = await toAccessor.getURL(toObj.fullPath, "GET");
    if (this.options.getOnly && !toUrl.startsWith("file:")) {
      await super.transfer(fromAccessor, fromObj, toAccessor, toObj);
      return;
    }

    const fromUrl = await fromAccessor.getURL(fromObj.fullPath, "GET");
    if (fromUrl && toUrl) {
      if (fromUrl.startsWith("file:")) {
        if (toUrl.startsWith("file:")) {
          await copyAsync({ from: fromUrl, to: toUrl });
        } else {
          const fromUrlPut = await fromAccessor.getURL(fromObj.fullPath, "PUT");
          if (fromUrlPut) {
            const result = await uploadAsync(toUrl, fromUrlPut, {
              httpMethod: "PUT",
              headers: {
                "Content-Length": fromObj.size + "",
              },
              sessionType: this.options.background
                ? FileSystemSessionType.BACKGROUND
                : FileSystemSessionType.FOREGROUND,
              uploadType: FileSystemUploadType.BINARY_CONTENT,
            });
            if (!(result.status + "").startsWith("2")) {
              throw result;
            }
          } else {
            await super.transfer(fromAccessor, fromObj, toAccessor, toObj);
          }
        }
      } else {
        if (toUrl.startsWith("file:")) {
          const result = await downloadAsync(fromUrl, toUrl, {
            sessionType: this.options.background
              ? FileSystemSessionType.BACKGROUND
              : FileSystemSessionType.FOREGROUND,
          });
          if (!(result.status + "").startsWith("2")) {
            throw result;
          }
        } else {
          const tempUri =
            cacheDirectory.replace(LAST_DIR_SEPARATORS, "") +
            DIR_SEPARATOR +
            Date.now();
          try {
            const result = await downloadAsync(fromUrl, tempUri, {
              sessionType: this.options.background
                ? FileSystemSessionType.BACKGROUND
                : FileSystemSessionType.FOREGROUND,
            });
            if (!(result.status + "").startsWith("2")) {
              throw result;
            }
            const info = await getInfoAsync(tempUri);
            const toUrlPut = await toAccessor.getURL(toObj.fullPath, "PUT");
            if (toUrlPut) {
              const result = await uploadAsync(toUrlPut, tempUri, {
                httpMethod: "PUT",
                headers: {
                  "Content-Length": info.size + "",
                },
                sessionType: this.options.background
                  ? FileSystemSessionType.BACKGROUND
                  : FileSystemSessionType.FOREGROUND,
                uploadType: FileSystemUploadType.BINARY_CONTENT,
              });
              if (!(result.status + "").startsWith("2")) {
                throw result;
              }
            } else {
              await super.transfer(fromAccessor, fromObj, toAccessor, toObj);
            }
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
}
