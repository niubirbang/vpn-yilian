const tcpping = require('tcp-ping')
const { v4: uuidv4 } = require('uuid')
const { registryReady } = require('./hook')
const { registeIPCHandle, sendIPC } = require('./ipc')
const { show: window_show } = require('./window')
const { log, error, warn } = require('./logger')
const { get_core: get_core_config, set_core: set_core_config } = require('./config')
const { start: x_start, close: x_close, statistics: x_statistics } = require('./xfuture')
const { core_config } = require('./const')

const PROXY_STATUS_OFF = 'off'
const PROXY_STATUS_ON = 'on'
const PROXY_MODE_SYSTEM = 'system'
const PROXY_MODE_TUN = 'tun'
const PROXY_RULE_CN = 'cn'
const PROXY_RULE_GLOBAL = 'global'

let store = {
  status: PROXY_STATUS_OFF,
  mode: PROXY_MODE_SYSTEM,
  rule: PROXY_RULE_CN,
  api_rule: null,
  rules: [],
  smart: true,
  subscribe: [],
  current_choise_names: [],
  current_names: [],
  current_node: null,
  connect_time: null,
  delaies: {},
}

// 基础
const set_api_rule = (api) => {
  store.api_rule = {
    outbound: 'direct',
    domain: [api],
  }
}

// subscribe相关
const set_subscribe = (subscribe) => {
  log('core', 'set subscribe', JSON.stringify(subscribe))
  store.subscribe = subscribe
  const picked = pick(
    subscribe,
    {
      names: store.current_choise_names,
      unpick_use_default: core_config.unpick_use_default,
    },
  )
  if (picked) {
    store.current_names = picked.names
    store.current_node = picked.node
  }
  sync_store()
  fresh_delay()
}
const fresh_subscribe = (subscribe) => {
  log('core', 'fresh subscribe', JSON.stringify(subscribe))
  store.subscribe = subscribe
  if (!store.current_node) {
    const picked = pick(
      subscribe,
      {
        names: store.current_choise_names,
        unpick_use_default: core_config.unpick_use_default,
      },
    )
    if (picked) {
      store.current_names = picked.names
      store.current_node = picked.node
    }
  }
  sync_store()
  fresh_delay()
}
const clear_subscribe = async () => {
  log('core', 'clear subscribe')
  store.subscribe = []
  store.current_names = []
  store.current_node = null
  clear_delay()
  sync_store()

  try {
    await close()
  } catch (err) {
    error('core', 'clear subscribe do close failed:', err)
  }
}
const clear_current = async () => {
  log('core', 'clear current')
  store.current_names = []
  store.current_node = null
  sync_store()
}

// 过期时间相关
let check_expired_interval = null
const run_sync_check_expired = () => {
  clear_sync_check_expired()
  check_expired_interval = setInterval(() => {
    // 开启状态下 如果过期了 则关闭代理 并提示
    if (store.status != PROXY_STATUS_ON) {
      return
    }
    if (!store.current_node) {
      return
    }
    if (!store.current_node.usable || store.current_node.expired_at <= Math.floor(Date.now() / 1000)) {
      close().then(() => {
        window_show({
          action: 'CORE_EXPIRED',
        })
        clear_current()
      }).catch(err => {
        error('core', 'sync check expired do close failed:', err)
      })
    }
  }, 5000)
}
const clear_sync_check_expired = () => {
  clearInterval(check_expired_interval)
  check_expired_interval = null
}

// delay相关
let delay_fresher = null
const fresh_delay = () => {
  if (delay_fresher) {
    clearInterval(delay_fresher)
  }

  run_delay()
  delay_fresher = setInterval(() => {
    run_delay()
  }, 10000)
}
const clear_delay = () => {
  store.delaies = {}
  clearInterval(delay_fresher)
}
const run_delay = () => {
  for (let _node of subscribe_to_nodes(store.subscribe)) {
    const node = _node.info
    test_node_delay(node.address, node.port).then(delay => {
      log('core', `test node delay success: ${node.name}, ${node.address}:${node.port}, ${delay}`)
      const old_delay = store.delaies[node.url]
      if (old_delay === null || (delay > 0 && old_delay > 0 && old_delay > delay)) {
        store.delaies[node.url] = delay
        sync_store()
      }
    }).catch(err => {
      warn('core', `test node delay failed: ${node.name}, ${node.address}:${node.port}`, err)
    })
  }
}
const test_node_delay = (address, port) => {
  const effective_delay = (s) => {
    let n = parseFloat(s)
    if (n.toString() === 'NaN') {
      return null
    }
    return n
  }
  const parse_data = (data) => {
    if (!data) {
      return null
    }
    let fields = ['avg', 'min', 'max']
    for (let field of fields) {
      if (field in data) {
        let delay = effective_delay(data[field])
        if (delay) {
          return parseFloat(delay.toFixed(2))
        }
      }
    }
    return null
  }
  return new Promise(async (resolve, reject) => {
    if (!address) {
      resolve(null)
      return
    }
    let options = {
      address: address,
      timeout: 2000,
      attempts: 1,
    }
    if (port) {
      options.port = port
    }
    tcpping.ping(options, (err, data) => {
      if (err) {
        reject(err)
        return
      }
      resolve(parse_data(data))
    })
  })
}

// 操作相关
const change_mode = (mode) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (mode != PROXY_MODE_SYSTEM && mode != PROXY_MODE_TUN) {
        throw new Error('core_param_invalid')
      }
      store.mode = mode
      if (store.status == PROXY_STATUS_ON) {
        await start()
      }
      set_config()
    } catch (err) {
      sync_store()
      reject(err)
      return
    }
    sync_store()
    resolve()
  })
}
const change_rule = (rule) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (rule != PROXY_RULE_CN && rule != PROXY_RULE_GLOBAL) {
        throw new Error('core_param_invalid')
      }
      store.rule = rule
      if (store.status == PROXY_STATUS_ON) {
        await start()
      }
      set_config()
    } catch (err) {
      sync_store()
      reject(err)
      return
    }
    sync_store()
    resolve()
  })
}
const add_rule = (rule) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (rule.mode != 'proxy' && rule.mode != 'direct' && rule.mode != 'block') {
        throw new Error('core_param_invalid')
      }
      if (rule.type != 'ip' && rule.type != 'domain') {
        throw new Error('core_param_invalid')
      }
      if (!rule.value) {
        throw new Error('core_param_invalid')
      }
      rule.id = uuidv4()
      store.rules.push(rule)
      if (store.status == PROXY_STATUS_ON) {
        await start()
      }
      set_config()
    } catch (err) {
      sync_store()
      reject(err)
      return
    }
    sync_store()
    resolve()
  })
}
const delete_rule = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      store.rules = store.rules.filter(item => item.id !== id)
      if (store.status == PROXY_STATUS_ON) {
        await start()
      }
      set_config()
    } catch (err) {
      sync_store()
      reject(err)
      return
    }
    sync_store()
    resolve()
  })
}
const change_smart = (smart) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (typeof smart != 'boolean') {
        throw new Error('core_param_invalid')
      }
      store.smart = smart
      if (store.status == PROXY_STATUS_ON) {
        await start()
      }
      set_config()
    } catch (err) {
      sync_store()
      reject(err)
      return
    }
    sync_store()
    resolve()
  })
}
const change_node = (names, do_start) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!(names instanceof Array)) {
        throw new Error('core_param_invalid')
      }
      const picked = pick(store.subscribe, { names: names })
      if (!picked) {
        throw new Error('core_node_disabled')
      }
      store.smart = false
      store.current_choise_names = names
      store.current_names = picked.names
      store.current_node = picked.node
      if (store.status == PROXY_STATUS_ON || do_start) {
        await start()
      }
      set_config()
    } catch (err) {
      sync_store()
      reject(err)
      return
    }
    sync_store()
    resolve()
  })
}
const start = () => {
  return new Promise(async (resolve, reject) => {
    const started = store.status == PROXY_STATUS_ON
    try {
      if (store.smart) {
        const picked = pick(store.subscribe)
        if (!picked) {
          if (subscribe_to_nodes(store.subscribe)?.length) {
            throw new Error('core_no_usable')
          } else {
            throw new Error('core_node_empty')
          }
        }
        store.current_names = picked.names
        store.current_node = picked.node
      } else {
        if (!store.current_node) {
          throw new Error('core_current_node_empty')
        }
        if (!store.current_node.usable || store.current_node.expired_at <= Math.floor(Date.now() / 1000)) {
          throw new Error('core_current_node_disabled')
        }
      }

      let rules = []
      if (store.api_rule) {
        rules.push(store.api_rule)
      }
      for (let rule of store.rules) {
        let real = {
          outbound: rule.mode,
        }
        switch (rule.type) {
          case 'ip':
            real.ip_cidr = [rule.value]
            break
          case 'domain':
            real.domain = [rule.value]
            break
        }
        rules.push(real)
      }

      await x_start(store.current_node.url, store.mode, store.rule, rules)
      set_config()
    } catch (err) {
      reject(err)
      return
    }
    if (!started) {
      store.connect_time = Date.now()
    }
    store.status = PROXY_STATUS_ON
    run_sync_check_expired()
    sync_store()
    resolve()
  })
}
const close = () => {
  return new Promise(async (resolve, reject) => {
    try {
      await x_close()
    } catch (err) {
      reject(err)
      return
    }
    store.connect_time = null
    store.status = PROXY_STATUS_OFF
    clear_sync_check_expired()
    sync_store()
    resolve()
  })
}

// 匹配相关
const pick = (subscribe, param = {
  names: [],
  parent_names: [],
  unpick_use_default: false,
}) => {
  if (!param.names) param.names = []
  if (!param.parent_names) param.parent_names = []
  if (!param.unpick_use_default) param.unpick_use_default = false

  if (param.names.length == 0) {
    return pick_default(subscribe, param.parent_names)
  }

  let picked = null

  for (let child of subscribe) {
    if (!child.usable || child.expired_at <= Math.floor(Date.now() / 1000)) {
      continue
    }
    if (child.name == param.names[0]) {
      picked = child
      break
    }
  }

  if (!picked) {
    if (param.unpick_use_default) {
      return pick_default(subscribe, param.parent_names)
    }
    return null
  }

  if (picked.url) {
    return {
      names: param.parent_names.concat(picked.name),
      node: picked,
    }
  }

  return pick(picked.children, {
    names: param.names.slice(1),
    parent_names: param.parent_names.concat(picked.name),
    unpick_use_default: param.unpick_use_default,
  })
}
const pick_default = (subscribe = [], parent_names = []) => {
  if (subscribe.length == 0) {
    return null
  }
  let nodes = []
  for (let node of subscribe_to_nodes(subscribe)) {
    if (!node.info.usable || node.info.expired_at <= Math.floor(Date.now() / 1000)) {
      continue
    }
    nodes.push(node)
  }
  if (nodes.length == 0) {
    return null
  }
  nodes.sort((a, b) => {
    const a_sort = a.info.sort
    const b_sort = b.info.sort
    const a_delay = a.delay
    const b_delay = b.delay

    if (a_sort != b_sort) {
      return a_sort - b_sort
    }

    if (a_delay && b_delay && a_delay != b_delay) {
      return a_delay - b_delay
    }
    if (a_delay && !b_delay) {
      return -1
    }
    if (!a_delay && b_delay) {
      return 1
    }
    return 0
  })
  return {
    names: parent_names.concat(...nodes[0].names),
    node: nodes[0].info,
  }
}

// 工具函数
const subscribe_to_nodes = (subscribe = [], parent_names = []) => {
  let nodes = []
  for (let child of subscribe) {
    let names = parent_names.concat(child.name)
    if (child.url) {
      nodes.push({
        names: names,
        delay: store.delaies[child.url],
        info: child,
      })
    } else {
      nodes.push(...subscribe_to_nodes(child.children, names))
    }
  }
  return nodes
}

// 统计相关
const statistics = () => {
  return get_statistics()
}
const get_statistics = () => {
  return new Promise(async (resolve, reject) => {
    let resp = {
      delaies: store.delaies
    }
    if (store.status == PROXY_STATUS_ON) {
      try {
        const tmp = await x_statistics()
        resp.download_speed = tmp.download_speed
        resp.upload_speed = tmp.upload_speed
        resp.download_total = tmp.download_total
        resp.upload_total = tmp.upload_total
      } catch (err) {
        error('core', 'get statistics failed:', err)
      }
    } else {
      resp.download_speed = 0
      resp.upload_speed = 0
      resp.download_total = 0
      resp.upload_total = 0
    }
    resp.delaies = store.delaies
    resolve(resp)
  })
}

// 异步通知
const get_store = () => {
  return {
    status: store.status,
    mode: store.mode,
    rule: store.rule,
    rules: store.rules,
    smart: store.smart,
    subscribe: store.subscribe,
    current_choise_names: store.current_choise_names,
    current_names: store.current_names,
    current_node: store.current_node,
    connect_time: store.connect_time,
  }
}
const sync_store = () => {
  sendIPC('core.store.listen', get_store())
}

const init = () => {
  registryReady('core', initialize)
}
const initialize = () => {
  initialize_config()
  initialize_ipc()
}
const initialize_config = () => {
  const { mode, rule, smart, names, rules } = get_core_config()
  store.mode = mode
  store.rule = rule
  store.smart = smart
  store.rules = rules
  if (core_config.use_last_choise) {
    store.current_choise_names = names
  }
}
const set_config = () => {
  let to_set = {
    mode: store.mode,
    rule: store.rule,
    smart: store.smart,
    rules: store.rules,
  }
  if (core_config.use_last_choise) {
    to_set.names = store.current_choise_names
  }
  set_core_config(to_set)
}

const initialize_ipc = () => {
  registeIPCHandle('core.store', (e, ...v) => {
    return get_store()
  })
  registeIPCHandle('core.change_mode', (e, ...v) => {
    return change_mode(...v)
  })
  registeIPCHandle('core.change_rule', (e, ...v) => {
    return change_rule(...v)
  })
  registeIPCHandle('core.change_smart', (e, ...v) => {
    return change_smart(...v)
  })
  registeIPCHandle('core.change_node', (e, ...v) => {
    return change_node(...v)
  })
  registeIPCHandle('core.add_rule', (e, ...v) => {
    return add_rule(...v)
  })
  registeIPCHandle('core.delete_rule', (e, ...v) => {
    return delete_rule(...v)
  })
  registeIPCHandle('core.statistics', (e, ...v) => {
    return statistics(...v)
  })
  registeIPCHandle('core.start', (e, ...v) => {
    return start(...v)
  })
  registeIPCHandle('core.close', (e, ...v) => {
    return close(...v)
  })
}

module.exports = {
  init,
  set_api_rule,
  set_subscribe,
  fresh_subscribe,
  clear_subscribe,
}