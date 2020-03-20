import { decode } from "base-64";
import { dataUriToBase64, blobToSomething } from "kura";

if (navigator && navigator.product == "ReactNative") {
  global.Buffer = global.Buffer || require("buffer").Buffer;

  (process as any).browser = true;

  FileReader.prototype.readAsArrayBuffer = function(blob) {
    if (this.readyState === this.LOADING) throw new Error("InvalidStateError");
    (this as any)._setReadyState(this.LOADING);
    (this as any)._result = null;
    (this as any)._error = null;

    const buffer = new ArrayBuffer(blob.size);
    const view = new Uint8Array(buffer);
    let read = 0;
    blobToSomething(
      blob,
      (reader, sliced) => {
        reader.readAsDataURL(sliced);
      },
      reader => {
        const base64 = dataUriToBase64(reader.result as string);
        const content = decode(base64);
        view.set(
          Array.from(content).map(c => c.charCodeAt(0)),
          read
        );
        read += content.length;
      }
    ).then(() => {
      (this as any)._result = buffer;
      (this as any)._setReadyState(this.DONE);
    });
  };
}

export * from "./ExpoFsLocalFileSystem";
export * from "./ExpoFsLocalFileSystemAsync";
