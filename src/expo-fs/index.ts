import { decode } from "base-64";
import { dataUriToBase64 } from "kura";

global.Buffer = global.Buffer || require("buffer").Buffer;

(process as any).browser = true;

FileReader.prototype.readAsArrayBuffer = function(blob) {
  if (this.readyState === this.LOADING) throw new Error("InvalidStateError");
  (this as any)._setReadyState(this.LOADING);
  (this as any)._result = null;
  (this as any)._error = null;
  const reader = new FileReader();
  reader.onloadend = () => {
    const base64 = dataUriToBase64(reader.result as string);
    const content = decode(base64);
    const buffer = new ArrayBuffer(content.length);
    const view = new Uint8Array(buffer);
    view.set(Array.from(content).map(c => c.charCodeAt(0)));
    (this as any)._result = buffer;
    (this as any)._setReadyState(this.DONE);
  };
  setTimeout(() => {
    reader.readAsDataURL(blob);
  }, 0);
};

export * from "./ExpoFsLocalFileSystem";
export * from "./ExpoFsLocalFileSystemAsync";
