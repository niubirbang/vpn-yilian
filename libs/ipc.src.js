const { ipcMain, BrowserWindow } = require('electron')

const registeIPCHandle = (chan, handler) => {
  ipcMain.handle(chan, (e, ...v) => {
    return handler(e, ...v)
  })
}

const sendIPC = (chan, data, windowID) => {
  let windows = []
  if (windowID) {
    const window = BrowserWindow.fromId(windowID)
    if (window) {
      windows.push(window)
    }
  } else {
    windows.push(...BrowserWindow.getAllWindows())
  }
  for (const window of windows) {
    if (!window.isDestroyed()) {
      window.webContents.send(chan, data)
    }
  }
}

module.exports = {
  registeIPCHandle,
  sendIPC,
}