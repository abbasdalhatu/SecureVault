const { app, BrowserWindow } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 850,
    minWidth: 800,
    minHeight: 600,
    title: "SecureVault",
    icon: path.join(__dirname, "public/logo.png"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, "preload.js") // Optional, but set up for security
    }
  });

  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    // Load Vite local development server
    mainWindow.loadURL("http://localhost:5173");
    // Open Chrome DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    // Load compiled static files in production
    mainWindow.loadFile(path.join(__dirname, "dist/index.html"));
  }

  // Handle window closing
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Single instance lock to prevent multiple windows opening
const additionalData = { myKey: "securevault-lock" };
const gotTheLock = app.requestSingleInstanceLock(additionalData);

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    // Someone tried to run a second instance, focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
