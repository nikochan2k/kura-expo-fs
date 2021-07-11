import {
  cacheDirectory,
  copyAsync,
  deleteAsync,
  downloadAsync,
  FileSystemSessionType,
  FileSystemUploadType,
  uploadAsync,
  getInfoAsync,
} from "expo-file-system";
import {
  AbstractAccessor,
  DIR_SEPARATOR,
  FileSystemObject,
  LAST_DIR_SEPARATORS,
  Transferer,
} from "kura";

interface ExpoFsTransfererOptions {
  // #region Properties (2)

  background?: boolean;
  getOnly?: boolean;
  threshold?: number;

  // #endregion Properties (2)
}
export class ExpoFsTransferer extends Transferer {
  // #region Constructors (1)

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

  // #endregion Constructors (1)

  // #region Public Methods (1)

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
            await uploadAsync(toUrl, fromUrlPut, {
              httpMethod: "PUT",
              headers: {
                "Content-Length": fromObj.size + "",
              },
              sessionType: this.options.background
                ? FileSystemSessionType.BACKGROUND
                : FileSystemSessionType.FOREGROUND,
              uploadType: FileSystemUploadType.BINARY_CONTENT,
            });
          } else {
            await super.transfer(fromAccessor, fromObj, toAccessor, toObj);
          }
        }
      } else {
        if (toUrl.startsWith("file:")) {
          await downloadAsync(fromUrl, toUrl, {
            sessionType: this.options.background
              ? FileSystemSessionType.BACKGROUND
              : FileSystemSessionType.FOREGROUND,
          });
        } else {
          const tempUri =
            cacheDirectory.replace(LAST_DIR_SEPARATORS, "") +
            DIR_SEPARATOR +
            Date.now();
          try {
            await downloadAsync(fromUrl, tempUri, {
              sessionType: this.options.background
                ? FileSystemSessionType.BACKGROUND
                : FileSystemSessionType.FOREGROUND,
            });
            const info = await getInfoAsync(tempUri);
            const toUrlPut = await toAccessor.getURL(toObj.fullPath, "PUT");
            if (toUrlPut) {
              await uploadAsync(tempUri, toUrlPut, {
                httpMethod: "PUT",
                headers: {
                  "Content-Length": info.size + "",
                },
                sessionType: this.options.background
                  ? FileSystemSessionType.BACKGROUND
                  : FileSystemSessionType.FOREGROUND,
                uploadType: FileSystemUploadType.BINARY_CONTENT,
              });
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

  // #endregion Public Methods (1)
}
