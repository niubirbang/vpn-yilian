const { init: loggerInit, info } = require('./libs/logger')
const { app } = require('electron')
const { app_id } = require('./package.json')
const { install: xfutureInstall, init: xfutureInit } = require('./libs/xfuture')
const { init: systemInit } = require('./libs/system')
const { init: messageInit } = require('./libs/message')
const { init: apiInit } = require('./libs/api')
const { init: coreInit } = require('./libs/core')
const { init: trayInit } = require('./libs/tray')
const { init: windowInit, show: windowShow } = require('./libs/window')
const { init: updaterInit } = require('./libs/updater')
const { run: hookRun, registryReady } = require('./libs/hook')

loggerInit()

// main
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'
const app_protocol = app_id
app.commandLine.appendSwitch('no-sandbox')

if (!app.requestSingleInstanceLock()) {
  info('main', '***SINGLE INSTANCE LOCK***')
  app.quit()
} else {
  xfutureInstall()
  xfutureInit()
  systemInit()
  messageInit()
  apiInit()
  coreInit()
  trayInit()
  windowInit()
  updaterInit()
  registryReady('main', () => {
    app.on('activate', () => {
      info('main', '***ACTIVATE***')
      windowShow()
    })
    app.on('second-instance', () => {
      info('main', '***SECOND INSTANCE***')
      windowShow()
    })
    app.on('window-all-closed', () => {
      info('main', '***WINDOW ALL CLOSED***')
      if (process.platform === 'darwin') {
        app.dock.hide()
      }
    })
    app.setAsDefaultProtocolClient(app_protocol)
  })
  hookRun(app)
}
