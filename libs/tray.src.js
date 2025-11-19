const path = require('node:path')
const { Tray, Menu, app, clipboard } = require('electron')
const { show: window_show } = require('./window')
const { name, name_cn, name_en } = require('../package.json')
const { get_language, clear: clear_config } = require('./config')
const { logout_just_remote } = require('./api')
const { registryReady } = require('./hook')
const { error } = require('./logger')

const icon = path.join(__dirname, '../icons/tray.png')

let tray = null

const init = async () => {
  registryReady('tray', initialize)
}

const initialize = () => {
  tray = new Tray(icon)
  // tray.setTitle(tray_name())
  tray.setToolTip(tray_name())

  tray.setContextMenu(Menu.buildFromTemplate(menus()))
  tray.on('click', () => {
    window_show()
  })
}

const tray_name = () => {
  switch (get_language()) {
    case 'zh-CN':
      return name_cn
    case 'en-US':
      return name_en
    default:
      return name
  }
}

const copy_proxy = () => {
  clipboard.writeText("export http_proxy=http://socks=127.0.0.1:40008 https_proxy=http://socks=127.0.0.1:40008")
}

const menus = () => {
  let open_label = 'Open'
  let copy_proxy_label = 'Replication agent environment'
  let clear_restart_label = 'Clear and restart'
  let quit_label = 'Quit'
  switch (get_language()) {
    case 'zh-CN':
      open_label = '打开'
      copy_proxy_label = '复制代理环境'
      clear_restart_label = '清除缓存并重启'
      quit_label = '退出'
      break
    case 'en-US':
      open_label = 'Open'
      copy_proxy_label = 'Replication agent environment'
      clear_restart_label = 'Clear and restart'
      quit_label = 'Quit'
      break
  }
  let menus = [
    {
      label: open_label,
      type: 'normal',
      click: () => {
        window_show()
      },
    },
    {
      label: copy_proxy_label,
      type: 'normal',
      click: () => {
        copy_proxy()
      },
      is_ban: () => {
        return process.platform == 'darwin'
      }
    },
    {
      type: 'separator',
    },
    {
      label: clear_restart_label,
      type: 'normal',
      click: () => {
        logout_just_remote().catch(err => {
          error('clear restart do logout failed:', err)
        }).finally(() => {
          clear_config()
          app.relaunch()
          app.exit()
        })
      },
    },
    {
      label: quit_label,
      type: 'normal',
      click: () => {
        app.quit()
      },
    },
  ]

  return menus.filter(item => item.is_ban ? !item.is_ban() : true)
}

module.exports = {
  init,
}