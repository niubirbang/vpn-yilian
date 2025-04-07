const path = require('path')
const { app } = require('electron')
const { config_path } = require('./const')
const { exists, write, read, remove } = require('./util')
const { warn, error } = require('./logger')

const authorization_config_path = path.join(config_path, 'authorization.json')
const language_config_path = path.join(config_path, 'language.json')
const core_config_path = path.join(config_path, 'core.json')
const api_config_path = path.join(config_path, 'api.json')

const set_authorization = ({
  authorization_type,
  authorization,
  token,
  password,
}) => {
  try {
    write(authorization_config_path, JSON.stringify({
      authorization_type,
      authorization,
      token,
      password,
    }, null, 2))
  } catch (err) {
    error('config', 'write authorization config failed:', err)
  }
}

const get_authorization = () => {
  let authorization_type, authorization, token, password
  try {
    if (exists(authorization_config_path)) {
      try {
        const tmp = JSON.parse(read(authorization_config_path))
        if (tmp.authorization_type) {
          authorization_type = tmp.authorization_type
        }
        if (tmp.authorization) {
          authorization = tmp.authorization
        }
        if (tmp.token) {
          token = tmp.token
        }
        if (tmp.password) {
          password = tmp.password
        }
      } catch (err) {
        warn('config', `read config json file ${authorization_config_path} failed:`, err)
      }
    }
  } catch (err) {
    error('config', 'read authorization config failed:', err)
  }
  return {
    authorization_type,
    authorization,
    token,
    password,
  }
}

const clear_authorization = () => {
  try {
    if (exists(authorization_config_path)) {
      remove(authorization_config_path)
    }
  } catch (err) {
    error('config', 'clear authorization config failed:', err)
  }
}

const set_language = (language) => {
  try {
    if (language.startsWith('zh')) {
      language = 'zh-CN'
    } else if (language.startsWith('en')) {
      language = 'en-US'
    } else {
      language = 'en-US'
    }
    write(language_config_path, JSON.stringify({
      language,
    }, null, 2))
  } catch (err) {
    error('config', 'write language config failed:', err)
  }
}

const get_language = () => {
  let language
  try {
    if (exists(language_config_path)) {
      try {
        const tmp = JSON.parse(read(language_config_path))
        if (tmp.language) {
          language = tmp.language
        }
      } catch (err) {
        warn('config', `read config json file ${language_config_path} failed:`, err)
      }
    }
  } catch (err) {
    error('config', 'read language config failed:', err)
  }
  if (!language) {
    language = app.getLocale()
  }
  if (language.startsWith('zh')) {
    language = 'zh-CN'
  } else if (language.startsWith('en')) {
    language = 'en-US'
  } else {
    language = 'en-US'
  }
  return language
}

const clear_language = () => {
  try {
    if (exists(language_config_path)) {
      remove(language_config_path)
    }
  } catch (err) {
    error('config', 'clear language config failed:', err)
  }
}

const platform_core_mode_must = {
  darwin: 'tun'
}

const set_core = ({
  mode,
  rule,
  smart,
  names,
  rules,
}) => {
  try {
    // 系统类型强制修改
    if (platform_core_mode_must[process.platform]) {
      mode = platform_core_mode_must[process.platform]
    }
    write(core_config_path, JSON.stringify({
      mode,
      rule,
      smart,
      names,
      rules,
    }, null, 2))
  } catch (err) {
    error('config', 'write core config failed:', err)
  }
}

const get_core = () => {
  let mode = 'system'
  let rule = 'cn'
  let smart = true
  let names = []
  let rules = []
  try {
    if (exists(core_config_path)) {
      try {
        const tmp = JSON.parse(read(core_config_path))
        if (tmp.mode) {
          mode = tmp.mode
        }
        if (tmp.rule) {
          rule = tmp.rule
        }
        if (typeof tmp.smart == 'boolean') {
          smart = tmp.smart
        }
        if (tmp.names) {
          names = tmp.names
        }
        if (tmp.rules) {
          rules = tmp.rules
        }
      } catch (err) {
        warn('config', `read config json file ${core_config_path} failed:`, err)
      }
    }
  } catch (err) {
    error('config', 'read core config failed:', err)
  }
  // 系统类型强制修改
  if (platform_core_mode_must[process.platform]) {
    mode = platform_core_mode_must[process.platform]
  }
  return {
    mode,
    rule,
    smart,
    names,
    rules,
  }
}

const clear_core = () => {
  try {
    if (exists(core_config_path)) {
      remove(core_config_path)
    }
  } catch (err) {
    error('config', 'clear core config failed:', err)
  }
}

const set_api = ({
  host,
}) => {
  try {
    write(api_config_path, JSON.stringify({
      host,
    }, null, 2))
  } catch (err) {
    error('config', 'write api config failed:', err)
  }
}

const get_api = () => {
  let host
  try {
    if (exists(api_config_path)) {
      try {
        const tmp = JSON.parse(read(api_config_path))
        if (tmp.host) {
          host = tmp.host
        }
      } catch (err) {
        warn('config', `read config json file ${api_config_path} failed:`, err)
      }
    }
  } catch (err) {
    error('config', 'read api config failed:', err)
  }
  return {
    host,
  }
}

const clear_api = () => {
  try {
    if (exists(api_config_path)) {
      remove(api_config_path)
    }
  } catch (err) {
    error('config', 'clear api config failed:', err)
  }
}

const clear = () => {
  clear_authorization()
  clear_language()
  clear_core()
  clear_api()
}

module.exports = {
  set_authorization,
  get_authorization,
  clear_authorization,
  set_language,
  get_language,
  clear_language,
  set_core,
  get_core,
  clear_core,
  set_api,
  get_api,
  clear_api,
  clear,
}