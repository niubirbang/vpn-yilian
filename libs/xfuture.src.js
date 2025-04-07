const path = require('node:path')
const { xfuture_path } = require('./const')
const { registryBeforeReady, registryBeforeQuit } = require('./hook')
const { error } = require('./logger')
const { exists, copyFile, read, write } = require('./util')

const xEngine = require(path.join(xfuture_path, '/index'))
const xParser = require(path.join(xfuture_path, '/parser'))

let xfuture_shell_path = ''
let xfuture_helper_path = ''
let xfuture_resource_path = path.join(xfuture_path, 'resources')
let xfuture_password = '88991238'

switch (process.platform) {
  case 'win32':
    xfuture_shell_path = 'maodou'
    xfuture_helper_path = path.join(xfuture_path, `package/win32/sysproxy.exe`)
    break
  case 'darwin':
    xfuture_shell_path = path.join(xfuture_path, 'package/darwin/install_helper.sh')
    xfuture_helper_path = path.join(xfuture_path, 'package/darwin/xsing-box-exec')
    break
}

const install = () => {
  xEngine.InstallDriver(xfuture_shell_path, xfuture_helper_path)
  xEngine.SetPassword(xfuture_password)
  make_template_config_file()
  // setInterval(() => {
  //   console.info("xfuture status:", xEngine.GetCurrentStatus())
  // }, 1000)
  // xEngine.SetEventCallback('connectionStatusDidChange', (status) => {
  //   console.info("xfuture status change:", status)
  // })
}

const xfuture_resource_ai_json_path = path.join(xfuture_resource_path, 'ai.json')
const xfuture_resource_ai_template_json_path = path.join(xfuture_resource_path, 'ai.template.json')
let xfuture_resource_ai_template = null

const xfuture_resource_global_json_path = path.join(xfuture_resource_path, 'global.json')
const xfuture_resource_global_template_json_path = path.join(xfuture_resource_path, 'global.template.json')
let xfuture_resource_global_template = null

const make_template_config_file = () => {
  try {
    if (!exists(xfuture_resource_ai_template_json_path)) {
      copyFile(xfuture_resource_ai_json_path, xfuture_resource_ai_template_json_path)
    }
    if (!exists(xfuture_resource_global_template_json_path)) {
      copyFile(xfuture_resource_global_json_path, xfuture_resource_global_template_json_path)
    }
    xfuture_resource_ai_template = JSON.parse(read(xfuture_resource_ai_template_json_path))
    xfuture_resource_global_template = JSON.parse(read(xfuture_resource_global_template_json_path))
  } catch (err) {
    error('xfuture', 'make template config file failed:', err)
  }
}

const set_rules = (mode, rules) => {
  switch (mode) {
    case 'system':
      let js_rules = []

      for (let rule of rules) {
        if (rule.ip_cidr) {
          for (let ip_cidr of rule.ip_cidr) {
            js_rules.push({
              method: rule.outbound,
              type: 'ip',
              content: ip_cidr,
            })
          }
        }
        if (rule.domain) {
          for (let domain of rule.domain) {
            js_rules.push({
              method: rule.outbound,
              type: 'domain',
              content: domain,
            })
          }
        }
      }

      xParser.setRouterConfiguration(js_rules)
      break
    case 'tun':
      xParser.setRouterConfiguration([])

      const ai = JSON.parse(JSON.stringify(xfuture_resource_ai_template))
      const global = JSON.parse(JSON.stringify(xfuture_resource_global_template))

      let ai_quic_block_index = 0
      for (let i = 0; i < ai.route.rules.length; i++) {
        if (!ai?.route?.rules[i]?.protocol || !ai?.route?.rules[i]?.outbound) {
          continue
        }
        if (ai.route.rules[i].protocol.includes('quic') && ai.route.rules[i].outbound == 'block') {
          ai_quic_block_index = i + 1
          break
        }
      }
      ai.route.rules.splice(ai_quic_block_index, 0, ...rules)

      let global_quic_block_index = 0
      for (let i = 0; i < global.route.rules.length; i++) {
        if (!global?.route?.rules[i]?.protocol || !global?.route?.rules[i]?.outbound) {
          continue
        }
        if (global.route.rules[i].protocol.includes('quic') && global.route.rules[i].outbound == 'block') {
          global_quic_block_index = i + 1
          break
        }
      }
      global.route.rules.splice(global_quic_block_index, 0, ...rules)

      write(xfuture_resource_ai_json_path, JSON.stringify(ai, null, 2))
      write(xfuture_resource_global_json_path, JSON.stringify(global, null, 2))
      break
  }
}

const start = (url, mode, rule, rules) => {
  return new Promise((resolve, reject) => {
    try {
      if (!url) {
        throw new Error(`url_invalid:${url}`)
      }
      if (!(['system', 'tun']).includes(mode)) {
        throw new Error(`mode_invalid:${mode}`)
      }
      if (!(['cn', 'global']).includes(rule)) {
        throw new Error(`rule_invalid:${rule}`)
      }
      if (!rules) {
        rules = []
      }

      xEngine.StopTunnel()

      xEngine.SetTunModeEnable(mode == 'tun', xfuture_resource_path)
      // xEngine.SetTunModeEnable(true, xfuture_resource_path)
      xEngine.SetGlobalMode(rule == 'global', xfuture_resource_path)
      set_rules(mode, rules)
      if (!xEngine.StartTunnel(url)) {
        throw new Error(`start_failed`)
      }
    } catch (err) {
      reject(err)
      return
    }
    resolve()
  })
}

const close = () => {
  return new Promise((resolve, reject) => {
    try {
      xEngine.StopTunnel()
    } catch (err) {
      reject(err)
      return
    }
    resolve()
  })
}

const statistics = () => {
  return new Promise((resolve, reject) => {
    try {
      const data = xEngine.GetStatistics()
      resolve({
        download_speed: data.downloadlink,
        upload_speed: data.uploadlink,
        download_total: data.mdownloadlink,
        upload_total: data.muploadlink,
      })
    } catch (err) {
      reject(err)
      return
    }
  })
}

const parse = (url) => {
  return xParser.parse(url)
}

const init = () => {
  registryBeforeReady('xfuture', initialize)
  registryBeforeQuit('xfuture', before_quit)
}

const initialize = () => {
  close().catch(err => {
    error('xfuture', 'xfuture close on before reqady failed:', err)
  })
}

const before_quit = () => {
  close().catch(err => {
    error('xfuture', 'xfuture close on before quit failed:', err)
  })
}

module.exports = {
  install,
  init,
  start,
  close,
  statistics,
  parse,
}