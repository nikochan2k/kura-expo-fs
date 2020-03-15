import { testAll } from "kura/lib/__tests__/filesystem";
import { ExpoFsLocalFileSystemAsync } from "../expo-fs";

const factory = new ExpoFsLocalFileSystemAsync("web-file-system-test", {
  verbose: true
});
testAll(factory);
