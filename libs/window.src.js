const path = require('node:path')
const { BrowserWindow } = require('electron')
const { registryReady } = require('./hook')
const { registeIPCHandle } = require('./ipc')
const { page_debug, page_url } = require('./const')
const { warn } = require('./logger')

// config
const width = 390
const height = 820
const minWidth = 390
const minHeight = 700
// const maxWidth = null
// const maxHeight = null
const maxWidth = 600
const maxHeight = 1000
// const backgroundColor = 'rgb(255, 255, 255)'
// const transparent = false
const backgroundColor = '#00000000'
const transparent = true
const resizable = true
const frame = false
// const titleBarStyle = 'hidden'
const icon = path.join(__dirname, '../icons/window.png')
const preload = path.join(__dirname, '../preloads/window.js')
const to_load_file = path.join(__dirname, '../views/window/index.html')
const to_load_url = 'http://localhost:10001'

let window = null

const is_valid = () => {
  return window && !window.isDestroyed()
}

const sync_data = (data) => {
  if (data && is_valid()) {
    window.webContents.send('window.data.listen', data)
  }
}

const new_window = (data) => {
  window = new BrowserWindow({
    width,
    minWidth,
    maxWidth,
    height,
    minHeight,
    maxHeight,
    backgroundColor,
    transparent,
    resizable,
    frame,
    // titleBarStyle,
    center: true,
    webPreferences: {
      webviewTag: true,
      devTools: page_debug,
      zoomFactor: 1.0,
      preload,
    },
    icon,
  })
  window.setMenu(null)
  window.webContents.on('did-finish-load', () => {
    sync_data(data)
  })
  if (page_url) {
    window.loadURL(to_load_url).catch(err => {
      warn('window main', 'load by url failed:', err)
    })
    window.webContents.openDevTools()
  } else {
    window.loadFile(to_load_file).catch(err => [
      warn('window main', 'load by file failed:', err)
    ])
  }
  window.on('focus', (e, cmd) => {
    window.webContents.send('window.focus')
  })
  window.init_width = window.getSize()[0]
  window.init_height = window.getSize()[1]
}

const show_window = (data) => {
  if (is_valid()) {
    window.show()
    sync_data(data)
  } else {
    new_window(data)
  }
}

const init = () => {
  registryReady('window', initialize)
}

const initialize = () => {
  initialize_ipc()
  show_window()
}

const get_window = (id) => {
  let win = BrowserWindow.fromId(id)
  if (!win) {
    win = BrowserWindow.getFocusedWindow()
  }
  return win
}

const initialize_ipc = () => {
  registeIPCHandle('window.close', (e, ...v) => {
    const win = get_window(e.sender.id)
    if (win && !win.isDestroyed()) {
      win.close()
    }
  })
  registeIPCHandle('window.maximize', (e, ...v) => {
    const win = get_window(e.sender.id)
    if (win && !win.isDestroyed()) {
      if (win.isMaximized()) {
        win.restore()
      } else {
        win.maximize()
      }
    }
  })
  registeIPCHandle('window.minimize', (e, ...v) => {
    const win = get_window(e.sender.id)
    if (win && !win.isDestroyed()) {
      if (win.isMinimized()) {
        win.restore()
      } else {
        win.minimize()
      }
    }
  })
  registeIPCHandle('window.flashFrame', (e, ...v) => {
    const win = get_window(e.sender.id)
    if (win && !win.isDestroyed()) {
      return win.flashFrame(...v)
    }
  })
  registeIPCHandle('window.debug', (e, ...v) => {
    const win = get_window(e.sender.id)
    if (win && !win.isDestroyed()) {
      return win.webContents.openDevTools()
    }
  })
}

let showing = false
const show = (data) => {
  let interval = setInterval(() => {
    if (!showing) {
      show_window(data)
      showing = false
      clearInterval(interval)
    }
  }, 100)
}

module.exports = {
  init,
  show,
}