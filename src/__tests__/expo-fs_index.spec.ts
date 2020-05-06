import "kura";
import { testAll } from "kura/lib/__tests__/filesystem";
import { ExpoFsLocalFileSystemAsync } from "../expo-fs";

const factory = new ExpoFsLocalFileSystemAsync("web-file-system-test", {
  index: true,
  indexOptions: {
    writeDelayMillis: 0,
  },
  verbose: true,
});
testAll(factory);
