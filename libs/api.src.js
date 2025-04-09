const crypto = require('crypto')
const axios = require('axios')
const qs = require('qs')
const { dialog, app } = require('electron')
const { parse: x_parse } = require('./xfuture')
const {
  set_api_rule: core_set_api_rule,
  set_subscribe: core_set_subscribe,
  fresh_subscribe: core_fresh_subscribe,
  clear_subscribe: core_clear_subscribe,
} = require('./core')
const { registryReady } = require('./hook')
const { show: window_show } = require('./window')
const { v4: uuidv4 } = require('uuid')
const { info, error } = require('./logger')
const {
  device_id,
  device_name,
  device_type,
  device_type_with_arch,
  channel_id,
} = require('./const')
const { compareVersion, executeTask } = require('./util')
const { registeIPCHandle, sendIPC } = require('./ipc')
const {
  set_authorization: set_authorization_file,
  get_authorization: get_authorization_file,
  get_api: get_api_config,
  set_api: set_api_config,
  get_language,
} = require('./config')
const { version: current_version } = require('../package.json')

// ----------constant----------
const AUTHORIZATION_TYPE_USER = 'user'

const secret_key = '778876b7d1b35adev5c640g33df44ttd'
const secret_iv = '5a6a7e361a4c8877'
// ----------constant----------

// ----------variable----------
let authorization_type = null
let authorization = null
let token = null
let password = null
let authorization_extra = null
let user = null
let version = {
  current_version: current_version,
  server_version: null,
  is_latest: true,
  is_force: false,
  describe: null,
  download_url: null,
  ignore: false,
}
// ----------variable----------

// ----------request interceptor----------
const request_interceptor = (config) => {
  if (!config.data) {
    config.data = {}
  }
  if (!config.headers) {
    config.headers = {}
  }

  const common_headers = request_common_headers()
  for (let key in common_headers) {
    config.headers[key] = common_headers[key]
  }

  const device_headers = request_device_headers()
  for (let key in device_headers) {
    config.headers[key] = device_headers[key]
  }
  const auth_headers = request_auth_headers()
  for (let key in auth_headers) {
    config.headers[key] = auth_headers[key]
  }
  switch (config.method) {
    case 'get': case 'GET':
      config.url += '?' + qs.stringify(config.data)
      break
    case 'post': case 'POST':
      config.data = qs.stringify(config.data)
      break
  }

  info('api', 'request', JSON.stringify({
    method: config.method,
    url: config.baseURL + config.url,
    headers: config.headers,
    request: config.data,
  }))

  return config
}
const request_common_headers = () => {
  // let language = 2
  // switch (get_language()) {
  //   case 'zh-CN':
  //     language = 1
  //     break
  //   case 'en-US':
  //     language = 2
  //     break
  // }
  return {
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/x-www-form-urlencoded',
    // 'language': language,
    'channel-number': channel_id,
  }
}
const request_device_headers = () => {
  let headers = {}
  headers['devicetype'] = device_type
  headers['deviceid'] = device_id
  headers['devicename'] = device_name
  return headers
}
const request_auth_headers = () => {
  let headers = {}
  if (authorization) {
    headers['token'] = authorization
  }
  if (token) {
    headers['authtoken'] = token
  }
  return headers
}
// ----------request interceptor----------

// ----------response interceptor----------
const response_data_interceptor = (resp) => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await parse_response_decrypted_data(resp)
      info('api', 'response success', JSON.stringify({
        method: resp.config.method,
        url: resp.config.baseURL + resp.config.url,
        headers: resp.config.headers,
        request: resp.config.data,
        response: data,
      }))
      switch (data.code) {
        case 0:
          // 失败
          reject(`api_failed:${data.message}`)
          return
        case 1:
          // 成功
          resolve(data.data)
          return
        case 2:
          // 登录失效
          if (authorization) {
            window_show({
              action: 'AUTHORIZATION_EXPIRED',
            })
          }
          await clear_authorization()
          reject(`api_authorization_expired`)
          return
        default:
          // 未知code
          reject(`api_unknow_code:${data.code}`)
          return
      }
    } catch (err) {
      reject(`api_exception:${err}`)
      return
    }
  })
}
const response_err_interceptor = (err) => {
  error('api', 'response failed', JSON.stringify({
    method: err.config.method,
    url: err.config.baseURL + err.config.url,
    headers: err.config.headers,
    request: err.config.data,
    err: err,
  }))
  error('api', err)
  return new Promise((resolve, reject) => {
    let err_msg = ''
    if (err.response && err.response.data && err.response.data.message) {
      err_msg = err.response.data.message
    } else {
      err_msg = err
    }
    if (err.code) {
      switch (err.code) {
        case 'ENOTFOUND':
          reject(`api_err_network`)
          return
        case 'ERR_NETWORK':
          reject(`api_err_network`)
          return
        case 'ECONNABORTED':
          reject(`api_econnaborted:${err_msg}`)
          return
        case 'ERR_BAD_REQUEST':
          reject(`api_err_bad_request:${err_msg}`)
          return
        case 'ERR_BAD_RESPONSE':
          reject(`api_err_bad_response:${err_msg}`)
          return
        default:
          reject(`api_unknow_err:${err_msg}`)
          return
      }
    } else {
      reject(`api_unknow_err:${err_msg}`)
      return
    }
  })
}
const parse_response_decrypted_data = (resp) => {
  return new Promise((resolve, reject) => {
    let data
    try {
      const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secret_key), secret_iv)
      let decrypted = decipher.update(resp.data, 'base64', 'utf-8')
      decrypted += decipher.final('utf-8')
      data = JSON.parse(decrypted)
    } catch (err) {
      reject(err)
      return
    }
    resolve(data)
  })
}
// ----------response interceptor----------

// ----------api----------
let api = null
// ----------api----------

// ----------authorization----------
const initialize_authorization = async () => {
  const tmp = get_authorization_file()
  if (tmp.authorization_type) {
    await set_authorization(tmp)
  } else {
    await clear_authorization()
  }
}
const clear_authorization = async (reason) => {
  authorization_type = null
  authorization = null
  token = null
  password = null
  set_authorization_file({ authorization_type, authorization, token, password })
  clear_user()
  clear_authorization_extra()
  await clear_subscribe()
  sync_authorization(reason)
}
const set_authorization = async (param = {
  authorization_type: null,
  authorization: null,
  token: null,
  password: null,
}) => {
  authorization_type = param.authorization_type
  authorization = param.authorization
  token = param.token
  password = param.password
  clear_user()
  await clear_subscribe()
  set_authorization_file({ authorization_type, authorization, token, password })
  sync_authorization()
  fresh_user(true)
  fresh_subscribe(true)
  // fresh_authorization_extra()
}
const get_authorization = () => {
  return {
    authorization_type: authorization_type,
    authorization: authorization,
    token: token,
    password: password,
  }
}
const get_authorization_extra = () => {
  return authorization_extra
}
const set_authorization_extra = (data) => {
  if (data.length > 0) {
    for (let i = 0; i < data.length; i++) {
      data[i].id = uuidv4()
    }
    authorization_extra = data
    window_show({
      action: 'AUTHORIZATION_EXTRA',
      data: get_authorization_extra(),
    })
  } else {
    authorization_extra = null
  }
}
const read_authorization_extra = (id) => {
  if (!authorization_extra) {
    return
  }
  authorization_extra = authorization_extra.filter(item => item.id !== id)
}
const fresh_authorization_extra = () => {
  // 3秒后请求
  setTimeout(() => {
    obtain_authorization_extra().then(data => {
      set_authorization_extra(data)
    }).catch(err => {
      error('api', 'fresh authorization extra failed:', err)
    })
  }, 3000)
}
const clear_authorization_extra = () => {
  authorization_extra = null
}
const sync_authorization = (reason) => {
  let tmp = get_authorization()
  tmp.reason = reason
  sendIPC('api.authorization.listen', tmp)
}
// ----------authorization----------

// ----------subscribe----------
let abnormal_fresh_subscribe_interval = null
const fresh_subscribe = (must) => {
  obtain_subscribe().then(data => {
    core_set_subscribe(data)
  }).catch(err => {
    error('api', 'fresh subscribe failed:', err)

    if (must) {
      abnormal_fresh_subscribe_interval = setInterval(() => {
        obtain_subscribe().then(data => {
          clearInterval(abnormal_fresh_subscribe_interval)
          core_set_subscribe(data)
        }).catch(err => {
          error('api', 'fresh subscribe failed:', err)
        })
      }, 5000)
    }
  })
}
const refresh_subscribe = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await obtain_subscribe()
      core_fresh_subscribe(data)
    } catch (err) {
      reject(err)
      return
    }
    resolve()
  })
}
const clear_subscribe = async () => {
  try {
    await core_clear_subscribe()
    clearInterval(abnormal_fresh_subscribe_interval)
  } catch (err) {
    error('api', 'clear subscribe failed:', err)
  }
}
// ----------subscribe----------

// ----------user----------
let abnormal_fresh_user_interval = null
const fresh_user = (must) => {
  if (!authorization) {
    return
  }
  obtain_user().then(data => {
    set_user({ user: data })
  }).catch(err => {
    error('api', 'fresh user failed:', err)
    if (must) {
      setTimeout(() => {
        fresh_user(must)
      }, 2000)
    }
  })
}
const clear_user = () => {
  user = null
  sync_user()
  clearInterval(abnormal_fresh_user_interval)
}
const set_user = (param = {
  user: null,
}) => {
  user = param.user
  sync_user()
}
const get_user = () => {
  return {
    id: user?.id || user?.user_id,
    account: user?.user_name,
    email: user?.email,
    phone: user?.tel,
    nickname: user?.user_name || user?.email || user?.tel,
    free_expired_at: user?.free_time,
    vip_expired_at: user?.vip_time,
    svip_expired_at: user?.svip_time,
    level: function () {
      switch (user?.plan_id) {
        case 5:
          return 'forever'
        case 4:
          return 'normal'
        case 3:
          return 'free'
        case 2:
          return 'svip'
        case 1:
          return 'vip'
      }
    }(),
    received_free: user?.is_receive_free == 2,
    recharged: user?.recharge_status == 1,
    binded_invite_code: user?.bind_invite_code,
  }
}
const set_user_received_free = (v) => {
  if (user) {
    user.is_receive_free = v ? 2 : 1
  }
  sync_user()
}
const sync_user = () => {
  sendIPC('api.user.listen', get_user())
}
// ----------user----------

// ----------version----------
const initialize_version = () => {
  const do_func = () => {
    obtain_version().then(data => {
      set_version(data)
    }).catch(err => {
      error('api', 'check version failed:', err)
    })
  }

  // 5秒后版本检查
  // setTimeout(() => {
  //   do_func()
  // }, 5 * 1000)
}
const set_version = (data = {
  version: null,
  dow_address: null,
  renew: null,
  describe: null,
}) => {
  if (!data || !data.version) {
    return
  }
  version.server_version = data.version
  version.describe = data.describe
  version.download_url = data.dow_address
  version.is_latest = compareVersion(version.current_version, version.server_version) >= 0
  version.is_force = !version.is_latest && data.renew == 1
  sync_version()
  if (!version.is_latest) {
    window_show({
      action: 'VERSION_OUTDATED',
      data: get_version()
    })
  }
}
const ignore_version = () => {
  version.ignore = true
}
const get_version = () => {
  return {
    current_version: version.current_version,
    server_version: version.server_version,
    is_latest: version.is_latest,
    is_force: version.is_force,
    describe: version.describe,
    download_url: version.download_url,
    ignore: version.ignore,
  }
}
const sync_version = () => {
  sendIPC('api.version.listen', get_version())
}
// ----------version----------

// ----------extra----------
const initialize_extra = () => {
  load_third_page_urls()
}
// ----------extra----------

// ----------init----------
const init = () => {
  registryReady('api', initialize)
}
const get_base_host_from_remote = () => {
  return new Promise((resolve, reject) => {
    axios.get('https://xyilian.oss-cn-shanghai.aliyuncs.com/b.log').then(data => {
      const host = data.data.new
      set_api_config({ host: host })
      resolve(host)
    }).catch(err => {
      reject(err)
    })
  })
}
const initialize = async () => {
  let { host } = get_api_config()
  info('api', 'host in config:', host)

  try {
    host = await get_base_host_from_remote()
    info('api', 'host in remote:', host)
  } catch (err) {
    error('api', `get host from remote failed:`, err)
    dialog.showErrorBox('加载域名失败', err + '')
  }

  if (!host) {
    app.quit()
    return
  }

  const base_url = host

  info('api', 'base url:', base_url)

  api = axios.create({
    baseURL: base_url,
    timeout: 30000,
  })
  api.interceptors.request.use(request_interceptor)
  api.interceptors.response.use(response_data_interceptor, response_err_interceptor)

  core_set_api_rule((new URL(base_url)).hostname)

  initialize_ipc()
  initialize_authorization()
  initialize_version()
  initialize_extra()
}
const initialize_ipc = () => {
  registeIPCHandle('api.authorization', (e, ...v) => {
    return get_authorization(...v)
  })
  registeIPCHandle('api.get_authorization_extra', (e, ...v) => {
    return get_authorization_extra(...v)
  })
  registeIPCHandle('api.read_authorization_extra', (e, ...v) => {
    return read_authorization_extra(...v)
  })
  registeIPCHandle('api.fresh_user', (e, ...v) => {
    return fresh_user(...v)
  })
  registeIPCHandle('api.user', (e, ...v) => {
    return get_user(...v)
  })
  registeIPCHandle('api.refresh_subscribe', (e, ...v) => {
    return refresh_subscribe(...v)
  })
  registeIPCHandle('api.ignore_version', (e, ...v) => {
    return ignore_version(...v)
  })
  registeIPCHandle('api.version', (e, ...v) => {
    return get_version(...v)
  })
  registeIPCHandle('api.list_notice', (e, ...v) => {
    return list_notice(...v)
  })
  registeIPCHandle('api.sms', (e, ...v) => {
    return sms(...v)
  })
  registeIPCHandle('api.ses', (e, ...v) => {
    return ses(...v)
  })
  registeIPCHandle('api.registe_extra_info', (e, ...v) => {
    return registe_extra_info(...v)
  })
  registeIPCHandle('api.registe', (e, ...v) => {
    return registe(...v)
  })
  registeIPCHandle('api.login', (e, ...v) => {
    return login(...v)
  })
  registeIPCHandle('api.forget_password', (e, ...v) => {
    return forget_password(...v)
  })
  registeIPCHandle('api.logout', (e, ...v) => {
    return logout(...v)
  })
  registeIPCHandle('api.receive_free', (e, ...v) => {
    return receive_free(...v)
  })
  registeIPCHandle('api.delete_account', (e, ...v) => {
    return delete_account(...v)
  })
  registeIPCHandle('api.update_password', (e, ...v) => {
    return update_password(...v)
  })
  registeIPCHandle('api.list_device', (e, ...v) => {
    return list_device(...v)
  })
  registeIPCHandle('api.disable_device', (e, ...v) => {
    return disable_device(...v)
  })
  registeIPCHandle('api.list_order', (e, ...v) => {
    return list_order(...v)
  })
  registeIPCHandle('api.list_plan', (e, ...v) => {
    return list_plan(...v)
  })
  registeIPCHandle('api.list_order_payment', (e, ...v) => {
    return list_order_payment(...v)
  })
  registeIPCHandle('api.pay_order_by_plan', (e, ...v) => {
    return pay_order_by_plan(...v)
  })
  registeIPCHandle('api.pay_order_by_order', (e, ...v) => {
    return pay_order_by_order(...v)
  })
  registeIPCHandle('api.cancel_order', (e, ...v) => {
    return cancel_order(...v)
  })
  registeIPCHandle('api.invite_info', (e, ...v) => {
    return invite_info(...v)
  })
  registeIPCHandle('api.invite_rule', (e, ...v) => {
    return invite_rule(...v)
  })
  registeIPCHandle('api.invite_history', (e, ...v) => {
    return invite_history(...v)
  })
  registeIPCHandle('api.invite_award', (e, ...v) => {
    return invite_award(...v)
  })
  registeIPCHandle('api.invite_award_item', (e, ...v) => {
    return invite_award_item(...v)
  })
  registeIPCHandle('api.invite_award_all', (e, ...v) => {
    return invite_award_all(...v)
  })
  registeIPCHandle('api.bind_invite_code', (e, ...v) => {
    return bind_invite_code(...v)
  })
  registeIPCHandle('api.question_answer', (e, ...v) => {
    return question_answer(...v)
  })
  registeIPCHandle('api.load_third_page_urls', (e, ...v) => {
    return load_third_page_urls(...v)
  })
  registeIPCHandle('api.third_page_urls', (e, ...v) => {
    return third_page_urls(...v)
  })
}
// ----------init----------

// ----------business----------
const obtain_version = () => {
  return api.request({
    method: 'POST',
    url: '/version',
    data: {
      device_type: device_type_with_arch,
    },
  })
}
const list_notice = () => {
  return new Promise((resolve, reject) => {
    reject('api_unsupport')
  })
}
const sms = (type, phone) => {
  return api.request({
    method: 'POST',
    url: '/getCode',
    data: {
      code_type: type,
      tel: phone,
    }
  })
}
const ses = (type, email) => {
  return new Promise((resolve, reject) => {
    reject('api_unsupport')
  })
}
const registe_extra_info = (ip) => {
  return new Promise((resolve, reject) => {
    resolve(null)
  })
}
const registe = (param) => {
  return new Promise(async (resolve, reject) => {
    try {
      let req = {}
      let url = null
      switch (param.method) {
        case 'phone_code':
          req = {
            tel: param?.phone,
            password: param?.password,
            code: param?.code,
          }
          url = '/register'
          break
        default:
          throw new Error('api_unsupport')
      }
      const data = await api.request({
        method: 'POST',
        url: url,
        data: req,
      })
      await set_authorization({
        authorization_type: AUTHORIZATION_TYPE_USER,
        authorization: data.auth_data,
        token: data.token,
        password: param?.password,
      })
      resolve()
    } catch (err) {
      reject(err)
    }
  })
}
const login = (param) => {
  return new Promise(async (resolve, reject) => {
    try {
      let req = {}
      let url = null
      switch (param.method) {
        case 'phone_password':
          req = {
            tel: param?.phone,
            password: param?.password,
          }
          url = '/login'
          break
        case 'phone_code':
          req = {
            tel: param?.phone,
            code: param?.code,
          }
          url = '/mobileSmsLogin'
          break
        default:
          throw new Error('api_unsupport')
      }
      const data = await api.request({
        method: 'POST',
        url: url,
        data: req,
      })

      await set_authorization({
        authorization_type: AUTHORIZATION_TYPE_USER,
        authorization: data.auth_data,
        token: data.token,
        password: password,
      })
      resolve()
    } catch (err) {
      reject(err)
    }
  })
}
const forget_password = (param) => {
  return new Promise(async (resolve, reject) => {
    try {
      let req = {}
      let url = null
      switch (param.method) {
        case 'phone':
          req = {
            tel: param?.phone,
            code: param?.code,
            password: param?.password,
          }
          url = '/forget'
          break
        default:
          throw new Error('api_unsupport')
      }
      await api.request({
        method: 'POST',
        url: '/forget',
        data: {
          tel: phone,
          code: phoneCode,
          password: password,
        },
      })
      resolve()
    } catch (err) {
      reject(err)
    }
  })
}
const logout = () => {
  return new Promise(async (resolve, reject) => {
    try {
      await logout_just_remote()
      await clear_authorization()
    } catch (err) {
      reject(err)
      return
    }
    resolve()
  })
}
const logout_just_remote = () => {
  return api.request({
    method: 'POST',
    url: '/loginOut',
  })
}
const receive_free = () => {
  return new Promise(async (resolve, reject) => {
    try {
      await api.request({
        method: 'POST',
        url: '/userReceive',
      })
      set_user_received_free(true)
    } catch (err) {
      reject(err)
      return
    }
    try {
      await fresh_user()
    } catch (err) {
      error('api', 'receive free do fresh user failed:', err)
    }
    try {
      await refresh_subscribe()
    } catch (err) {
      error('api', 'receive free do refresh subscribe failed:', err)
    }
    resolve()
  })
}
const delete_account = () => {
  return new Promise(async (resolve, reject) => {
    try {
      await api.request({
        method: 'POST',
        url: '/logout',
      })
      await clear_authorization()
    } catch (err) {
      reject(err)
      return
    }
    resolve()
  })
}
const update_password = (password) => {
  return new Promise((resolve, reject) => {
    reject('api_unsupport')
  })
}
const obtain_authorization_extra = () => {
  return new Promise((resolve, reject) => {
    reject('api_unsupport')
  })
}
const obtain_user = () => {
  return api.request({
    method: 'POST',
    url: '/info',
  })
}
const list_device = () => {
  return api.request({
    method: 'POST',
    url: '/equipmentList',
  })
}
const disable_device = (type, equipment_id) => {
  return new Promise(async (resolve, reject) => {
    try {
      await api.request({
        method: 'POST',
        url: '/unBindDevice',
        data: {
          type: type,
          equipment_id: equipment_id,
        }
      })
      if (equipment_id == device_id) {
        await clear_authorization()
      }
    } catch (err) {
      reject(err)
      return
    }
    resolve()
  })
}
const list_plan = () => {
  return new Promise(async (resolve, reject) => {
    let plans = []
    try {
      const data = await api.request({
        method: 'POST',
        url: '/planFetch',
      })
      plans = data_to_plan(data)
    } catch (err) {
      reject(err)
      return
    }
    resolve(plans)
  })
}
const list_order_payment = () => {
  return api.request({
    method: 'POST',
    url: '/getPaymentMethod',
  })
}
const list_order = () => {
  return new Promise((resolve, reject) => {
    reject('api_unsupport')
  })
}
const pay_order_by_plan = (plan_id, period, payment_id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = await api.request({
        method: 'POST',
        url: '/pay',
        data: {
          plan_id: plan_id,
          period: period,
          payment_id: payment_id,
        }
      })
      resolve(data)
      setTimeout(() => {
        linsten_order_status(data.order_id)
      }, 2000)
    } catch (err) {
      reject(err)
    }
  })
}
const pay_order_by_order = (trade_no) => {
  return new Promise((resolve, reject) => {
    reject('api_unsupport')
  })
}
const get_order = (trade_no) => {
  return api.request({
    method: 'POST',
    url: '/orderCheck',
    data: {
      order_id: trade_no,
    }
  })
}
let linsten_order_status_task = null
const linsten_order_status = (trade_no) => {
  if (linsten_order_status_task) {
    linsten_order_status_task.close()
  }
  linsten_order_status_task = executeTask({
    task: () => {
      return new Promise((resolve, reject) => {
        if (authorization) {
          get_order(trade_no).then((data) => {
            if (data.status == 3) {
              resolve(data)
            } else if (data.status == 2) {
              linsten_order_status_task.close()
            } else {
              reject('order not pay')
            }
          }).catch(err => {
            reject(err)
          })
        } else {
          reject('authorization invalid')
        }
      })
    },
    maxAttempts: 30,
    onSuccess: () => {
      sendIPC('api.order.paied', {
        trade_no: trade_no,
      })
      fresh_user()
      fresh_subscribe()
    },
  })
}
const cancel_order = (trade_no) => {
  return new Promise((resolve, reject) => {
    reject('api_unsupport')
  })
}
const obtain_subscribe = () => {
  return new Promise(async (resolve, reject) => {
    let subscribe = []
    try {
      const data = await api.request({
        method: 'POST',
        url: '/nodeList',
      })
      subscribe = data_to_subscribe(data)
    } catch (err) {
      reject(err)
      return
    }
    resolve(subscribe)
  })
}
const invite_info = () => {
  return api.request({
    method: 'POST',
    url: '/inviteSum',
  })
}
const invite_rule = () => {
  return new Promise((resolve, reject) => {
    reject('api_unsupport')
  })
}
const invite_history = () => {
  return api.request({
    method: 'POST',
    url: '/inviteDetails',
  })
}
const invite_award = () => {
  return api.request({
    method: 'POST',
    url: '/detailedLedger',
  })
}
const invite_award_item = (id) => {
  return api.request({
    method: 'POST',
    url: '/receiveAward',
    data: {
      id: id,
    }
  })
}
const invite_award_all = () => {
  return api.request({
    method: 'POST',
    url: '/detailedLedger',
  })
}
const bind_invite_code = (code) => {
  return new Promise(async (resolve, reject) => {
    try {
      await api.request({
        method: 'POST',
        url: '/bandInviteCode',
        data: {
          invite_code: code,
        },
      })
      if (user) {
        user.bind_invite_code = code
      }
      resolve()
    } catch (err) {
      reject(err)
    }
  })
}
const question_answer = () => {
  return api.request({
    method: 'POST',
    url: '/knowledgeV2',
  })
}
let third_pages = null
const load_third_page_urls = () => {
  return new Promise(async (resolve, reject) => {
    third_pages = {}
    try {
      const data = await api.request({
        method: 'POST',
        url: '/myLink',
      })
      let service = null
      if (data['kefu']) {
        service = {
          type: 'url',
          value: data['kefu'],
        }
      } else if (data['livechat']) {
        service = {
          type: 'livechat',
          value: data['livechat'],
        }
      } else if (data['crisp']) {
        service = {
          type: 'crisp',
          value: data['crisp'],
        }
      }
      third_pages['service'] = service

      third_pages['question_answer'] = data['bangzhu']
      third_pages['service_policy'] = data['xieyi']
      third_pages['privacy_policy'] = data['yinsi']
      third_pages['logout_policy'] = data['zhuxiao']
      third_pages['application_url'] = data['app_application']
    } catch (err) {
      error('api', 'get third page urls failed:', err)
    }
    sendIPC('api.third_page_urls.listen', third_pages)
    resolve(third_pages)
  })
}
const third_page_urls = () => {
  return third_pages
}
// ----------business----------

const period_day = {
  week_price: 7,
  month_price: 30,
  quarter_price: 3 * 30,
  half_year_price: 6 * 30,
  year_price: 365,
}
const data_to_plan = (data) => {
  const plan_id_types = {
    1: 'vip',
    2: 'svip',
  }
  let plans = []
  for (let plan of data) {
    let prices = []
    for (let price of plan.list) {
      if (!period_day[price.period]) {
        continue
      }
      prices.push({
        plan_id: plan.id,
        period: price.period,
        name: price.period_name,
        amount: price.price,
        originalAmount: price.break_price,
        break: price.break,
        unitPrice: price.unit_price * 100,
        recommend: price.recommend,
      })
    }
    if (prices.length == 0) {
      continue
    }
    plans.push({
      id: plan.id,
      key: plan_id_types[plan.id],
      name: plan.sort_name,
      title: plan.name,
      remark: plan.top_title,
      recommend: plan.recommend,
      prices: prices,
    })
  }
  return plans
}

const subscribe_type_sorts = {
  svip: 1,
  vip: 2,
  free: 3,
}

const data_to_subscribe = (data) => {
  let subscribe = []
  for (let item of data) {
    let children = []
    for (let url of item.node) {
      const x = x_parse(url)
      children.push({
        name: decodeURIComponent(x.remark),
        url: url,
        address: x.address,
        port: x.port,
        usable: item.use_status == 1,
        expired_at: item.expired_time,
        sort: subscribe_type_sorts[item.type] || 999,
        extra: {
          type: item.type,
        },
      })
    }
    subscribe.push({
      name: item.name,
      children: children,
      usable: item.use_status == 1,
      expired_at: item.expired_time,
      sort: subscribe_type_sorts[item.type] || 999,
      extra: {
        type: item.type,
      },
    })
  }
  return subscribe
}

module.exports = {
  init,
  logout_just_remote,
}