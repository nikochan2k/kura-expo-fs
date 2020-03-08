import { testAll } from "kura";
import { ExpoFsLocalFileSystemAsync } from "../expo-fs";

const factory = new ExpoFsLocalFileSystemAsync("web-file-system-test", {
  useIndex: true,
  verbose: true
});
testAll(factory);
