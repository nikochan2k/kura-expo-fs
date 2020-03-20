import { decode } from "base-64";
import { blobToBase64, blobToArrayBuffer } from "kura";

if (navigator && navigator.product == "ReactNative") {
  global.Buffer = global.Buffer || require("buffer").Buffer;

  (process as any).browser = true;

  FileReader.prototype.readAsArrayBuffer = function(blob) {
    if (this.readyState === this.LOADING) throw new Error("InvalidStateError");
    (this as any)._setReadyState(this.LOADING);
    (this as any)._result = null;
    (this as any)._error = null;
    blobToArrayBuffer(blob).then(buffer => {
      (this as any)._result = buffer;
      (this as any)._setReadyState(this.DONE);
    });
  };
}

export * from "./ExpoFsLocalFileSystem";
export * from "./ExpoFsLocalFileSystemAsync";
