const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('box_system', {
  info: (...args) => invoke('system.info', ...args),
  openURL: (...args) => invoke('system.open_url', ...args),
  openWindow: (...args) => invoke('system.open_window', ...args),
  setLanguage: (...args) => invoke('system.set_language', ...args),
  getLanguage: (...args) => invoke('system.get_language', ...args),
})
contextBridge.exposeInMainWorld('box_message', {
  one: (...args) => invoke('message.one', ...args),
  list: (...args) => invoke('message.list', ...args),
  read: (...args) => invoke('message.read', ...args),
})
contextBridge.exposeInMainWorld('box_window', {
  maximize: (...args) => invoke('window.maximize', ...args),
  minimize: (...args) => invoke('window.minimize', ...args),
  close: (...args) => invoke('window.close', ...args),
  flashFrame: (...args) => invoke('window.flashFrame', ...args),
  debug: (...args) => invoke('window.debug', ...args),
  listenData: (cb) => on('window.data.listen', cb),
  listenFocus: (cb) => on('window.focus', cb),
})
contextBridge.exposeInMainWorld('box_core', {
  store: (...args) => invoke('core.store', ...args),
  changeMode: (...args) => invoke('core.change_mode', ...args),
  changeRule: (...args) => invoke('core.change_rule', ...args),
  addRule: (...args) => invoke('core.add_rule', ...args),
  deleteRule: (...args) => invoke('core.delete_rule', ...args),
  changeSmart: (...args) => invoke('core.change_smart', ...args),
  changeNode: (...args) => invoke('core.change_node', ...args),
  start: (...args) => invoke('core.start', ...args),
  close: (...args) => invoke('core.close', ...args),
  statistics: (...args) => invoke('core.statistics', ...args),
  listenStore: (cb) => on('core.store.listen', cb),
})
contextBridge.exposeInMainWorld('box_api', {
  authorization: (...args) => invoke('api.authorization', ...args),
  getAuthorizationExtra: (...args) => invoke('api.get_authorization_extra', ...args),
  readAuthorizationExtra: (...args) => invoke('api.read_authorization_extra', ...args),
  freshUser: (...args) => invoke('api.fresh_user', ...args),
  user: (...args) => invoke('api.user', ...args),
  refreshSubscribe: (...args) => invoke('api.refresh_subscribe', ...args),
  ignoreVersion: (...args) => invoke('api.ignore_version', ...args),
  version: (...args) => invoke('api.version', ...args),
  listNotice: (...args) => invoke('api.list_notice', ...args),
  sms: (...args) => invoke('api.sms', ...args),
  ses: (...args) => invoke('api.ses', ...args),
  registeExtraInfo: (...args) => invoke('api.registe_extra_info', ...args),
  registe: (...args) => invoke('api.registe', ...args),
  login: (...args) => invoke('api.login', ...args),
  forgetPassword: (...args) => invoke('api.forget_password', ...args),
  bind: (...args) => invoke('api.bind', ...args),
  logout: (...args) => invoke('api.logout', ...args),
  receiveFree: (...args) => invoke('api.receive_free', ...args),
  deleteAccount: (...args) => invoke('api.delete_account', ...args),
  updatePassword: (...args) => invoke('api.update_password', ...args),
  listDevice: (...args) => invoke('api.list_device', ...args),
  disableDevice: (...args) => invoke('api.disable_device', ...args),
  listOrder: (...args) => invoke('api.list_order', ...args),
  listPlan: (...args) => invoke('api.list_plan', ...args),
  listOrderPayment: (...args) => invoke('api.list_order_payment', ...args),
  payOrderByPlan: (...args) => invoke('api.pay_order_by_plan', ...args),
  payOrderByOrder: (...args) => invoke('api.pay_order_by_order', ...args),
  cancelOrder: (...args) => invoke('api.cancel_order', ...args),
  inviteInfo: (...args) => invoke('api.invite_info', ...args),
  inviteRule: (...args) => invoke('api.invite_rule', ...args),
  inviteHistory: (...args) => invoke('api.invite_history', ...args),
  inviteAward: (...args) => invoke('api.invite_award', ...args),
  inviteAwardItem: (...args) => invoke('api.invite_award_item', ...args),
  inviteAwardAll: (...args) => invoke('api.invite_award_all', ...args),
  bindInviteCode: (...args) => invoke('api.bind_invite_code', ...args),
  questionAnswer: (...args) => invoke('api.question_answer', ...args),
  thirdPageURLs: (...args) => invoke('api.third_page_urls', ...args),
  loadThirdPageURLs: (...args) => invoke('api.load_third_page_urls', ...args),

  listenVersion: (cb) => on('api.version.listen', cb),
  listenAuthorization: (cb) => on('api.authorization.listen', cb),
  listenUser: (cb) => on('api.user.listen', cb),
  listenThirdPageURLs: (cb) => on('api.third_page_urls.listen', cb),
  listenOrderPaied: (cb) => on('api.order.paied', cb),
})

contextBridge.exposeInMainWorld('box_updater', {
  check: (...args) => invoke('updater.check', ...args),
  download: (...args) => invoke('updater.download', ...args),
  install: (...args) => invoke('updater.install', ...args),

  listenDownloadProgress: (cb) => on('updater.download.listen', cb),
  listenDownloaded: (cb) => on('updater.downloaded.listen', cb),
})

const invoke = (chan, ...args) => {
  return new Promise((resolve, reject) => {
    ipcRenderer.invoke(chan, ...args).then((data) => {
      if (localStorage.getItem('OPEN_DEBUG')) {
        console.info('[ipc invoke] chan:', chan, 'args:', args, 'data:', data)
      }
      resolve(data)
    }).catch(err => {
      if (localStorage.getItem('OPEN_DEBUG')) {
        console.error('[ipc invoke] chan:', chan, 'args:', args, 'err:', err)
      }
      err = err + ''
      err = err.replace('Error: Error invoking remote method \'' + chan + '\': ', '')
      reject(err)
    })
  })
}

const on = (chan, cb) => {
  ipcRenderer.on(chan, (e, ...v) => {
    if (localStorage.getItem('OPEN_DEBUG')) {
      console.info('[ipc on] chan:', chan, 'data:', v)
    }
    cb(v[0])
  })
}
