const { contextBridge } = require("electron");

// Expose secure, restricted APIs to the renderer process
contextBridge.exposeInMainWorld("desktopAPI", {
  platform: process.platform,
  version: process.versions.chrome
});
