const path = require('node:path')
const { registryReady } = require('./hook')
const { registeIPCHandle } = require('./ipc')
const {
  name,
  name_cn,
  name_en,
  device_id,
  device_name,
  device_type,
  device_type_with_arch,
} = require('./const')
const {
  set_language,
  get_language,
} = require('./config')
const { shell, BrowserWindow } = require('electron')
const { warn } = require('./logger')

const init = () => {
  registryReady('system', initialize)
}

const initialize = () => {
  initialize_ipc()
}

const initialize_ipc = () => {
  registeIPCHandle('system.info', (e, ...v) => {
    return {
      name,
      name_cn,
      name_en,
      device_id,
      device_name,
      device_type,
      device_type_with_arch,
    }
  })
  registeIPCHandle('system.open_url', (e, ...v) => {
    return open_url(...v)
  })
  registeIPCHandle('system.open_window', (e, ...v) => {
    return open_window(...v)
  })
  registeIPCHandle('system.set_language', (e, ...v) => {
    return set_language(...v)
  })
  registeIPCHandle('system.get_language', (e, ...v) => {
    return get_language(...v)
  })
}

const open_url = async (url) => {
  return new Promise(async (resolve, reject) => {
    try {
      await shell.openExternal(url)
    } catch (err) {
      reject(err)
      return
    }
    resolve()
  })
}

const open_window = async (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const window = new BrowserWindow({
      icon: path.join(__dirname, '../icons/window.png'),
      ...options,
    })
    window.setMenu(null)
    window.loadURL(url).catch(err => {
      warn('window system', 'load by url failed:', err)
    })
    resolve()
  })
}

module.exports = {
  init,
}