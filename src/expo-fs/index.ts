import { toArrayBuffer } from "kura";

if (navigator && navigator.product == "ReactNative") {
  global.Buffer = global.Buffer || require("buffer").Buffer;

  (process as any).browser = true;

  FileReader.prototype.readAsArrayBuffer = function (blob) {
    if (this.readyState === this.LOADING) throw new Error("InvalidStateError");
    const self = this as any;
    self._setReadyState(this.LOADING);
    self._result = null;
    self._error = null;
    toArrayBuffer(blob).then((buffer) => {
      self._result = buffer;
      self._setReadyState(this.DONE);
    });
  };
}

export * from "./ExpoFsLocalFileSystem";
export * from "./ExpoFsLocalFileSystemAsync";
export * from "./ExpoFsTransferer";
