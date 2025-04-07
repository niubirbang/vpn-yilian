const { app } = require('electron')
const axios = require('axios')
const { registryReady } = require('./hook')
const EAU = require('electron-asar-hot-updater')
const { show: window_show } = require('./window')
const { registeIPCHandle, sendIPC } = require('./ipc')
const { version: current_version, updater_server } = require('../package.json')
const { channel_id, dev_updater_server_path } = require('./const')
const { exists, read } = require('./util')

let dev_updater_server = null

const init = () => {
  registryReady('updater', initialize)
}

const initialize = async () => {
  load_dev_updater_server()
  await initialize_updater()
  initialize_ipc()
}

const load_dev_updater_server = () => {
  try {
    if (exists(dev_updater_server_path)) {
      const tmp = JSON.parse(read(dev_updater_server_path))
      if (tmp && tmp.server) {
        dev_updater_server = tmp.server
      }
    }
  } catch (err) {
    // 忽略错误
  }
}

const initialize_updater = async () => {
  try {
    const data = await axios.get('https://update-pc.oss-cn-beijing.aliyuncs.com/c.log')
    const remote_updater_server = data?.data?.update_server

    let api = updater_server
    if (remote_updater_server) {
      api = remote_updater_server
    }
    if (dev_updater_server) {
      api = dev_updater_server
    }

    console.info('updater', 'api use:', api)

    const apiURL = new URL(api)

    EAU.init({
      'api': api,
      'server': false,
      'debug': false,
      'headers': {
        Channel: channel_id,
        Platform: process.platform,
        Arch: process.arch,
        Version: current_version,
      },
      'formatRes': function (res) {
        if (res.asar) {
          let url = new URL(res.asar)
          url.host = apiURL.host
          url.protocol = apiURL.protocol
          res.asar = url.href
        }
        if (res.install) {
          let url = new URL(res.install)
          url.host = apiURL.host
          url.protocol = apiURL.protocol
          res.install = url.href
        }
        console.info('updater', 'response:', res)
        return res
      },
    })

    setTimeout(() => {
      check()
    }, 5000)
  } catch (err) {
    console.error('updater', 'initialize failed:', err?.message)
  }
}

const initialize_ipc = () => {
  registeIPCHandle('updater.check', (e, ...v) => {
    setTimeout(() => { check() })
    return
  })
  registeIPCHandle('updater.download', (e, ...v) => {
    setTimeout(() => { download() })
    return
  })
  registeIPCHandle('updater.install', (e, ...v) => {
    setTimeout(() => { install() })
    return
  })
}

const check = () => {
  EAU.check(function (err, last, body) {
    if (err) {
      if (err === 'no_update_available') {
        console.info('updater', 'no update available')
        return false
      }
      console.error('updater', 'check failed:', err?.message)
      return false
    }

    window_show({
      action: 'VERSION_OUTDATED',
      value: body,
    })
  })
}

const download = () => {
  EAU.progress(function (state) {
    sendIPC('updater.download.listen', state)
  })

  EAU.download(function (err) {
    if (err) {
      console.error('updater', 'download failed:', err?.message)
      return false
    }
    sendIPC('updater.downloaded.listen')
    window_show({
      action: 'VERSION_DOWNLOADED',
    })
  })
}

const install = () => {
  if (process.platform === 'darwin') {
    app.relaunch()
    app.quit()
  } else {
    app.quit()
  }
}

module.exports = {
  init,
}