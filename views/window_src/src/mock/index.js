console.info('------------ MOCK ------------')

const version = {
  version: '1.0.0',
  version_server: '1.0.0',
  version_is_latest: true,
  version_is_force: false,
  version_download_url: 'https://www.baidu.com',
}
const authorization = {
  authorization_type: 'device',
  authorization: 'AUTHORIZATION001',
  token: 'TOKEN001',
  // authorization_type: null,
  // authorization: null,
  // token: null,
}
const user = {
  id: 8888,
  account: 'ACCOUNT8888',
  email: 'ACCOUNT8888@gmail.com',
  phone: '13888888888',
  nickname: 'NICKNAME8888',
  // expired_at: parseInt((new Date() / 1000) + 24 * 60 * 60),
  expired_at: parseInt((new Date() / 1000) - 24 * 60 * 60),
  // level: 'free',
  level: 'vip',
}
const proxy = {
  status: 'off',
  mode: 'tun',
  rule: 'cn',
  connect_time: null,
  subscribe: [
    {
      name: '免费',
      nodes: [
        {
          name: '🇨🇳 中国',
          delay: 88,
          usable: true,
        },
        {
          name: '🇯🇵 日本',
          delay: 88,
          usable: true,
        },
        {
          name: '🇺🇸 美国',
          delay: 88,
          usable: true,
        },
      ],
    },
    {
      name: 'VIP',
      usable: true,
      nodes: [
        {
          name: '🇨🇳 中国',
          delay: 66,
          usable: true,
        },
        {
          name: '🇯🇵 日本',
          delay: 66,
          usable: true,
        },
        {
          name: '🇺🇸 美国',
          delay: 66,
          usable: true,
        },
      ],
    },
    {
      name: 'SVIP',
      usable: false,
      nodes: [
        {
          name: '🇨🇳 中国',
          delay: 33,
          usable: true,
        },
        {
          name: '🇯🇵 日本',
          delay: 33,
          usable: true,
        },
        {
          name: '🇺🇸 美国',
          delay: 33,
          usable: true,
        },
      ],
    },
  ],
  current_group_name: 'VIP',
  current_node_name: '🇯🇵 日本',
  current_node_url: null,
  rules: [],
}

let callVersion = null
let callAuthorization = null
let callUser = null
let callStore = null

const call = (f, value) => {
  return new Promise((resolve, reject) => {
    if (f) { f(value) }
    resolve()
  })
}

window.box_system = {
  info: () => {
    return new Promise((resolve, reject) => {
      resolve({
        device_id: 'PCTEST001',
        device_name: 'Windows 10',
        device_type: 3,
      })
    })
  },
}
window.box_api = {
  version: () => {
    return new Promise((resolve, reject) => {
      resolve(version)
    })
  },
  listenVersion: (f) => {
    if (typeof f == 'function') {
      callVersion = f
    }
  },
  authorization: () => {
    return new Promise((resolve, reject) => {
      resolve(authorization)
    })
  },
  listenAuthorization: (f) => {
    if (typeof f == 'function') {
      callAuthorization = f
    }
  },
  user: () => {
    return new Promise((resolve, reject) => {
      resolve(user)
    })
  },
  listenUser: (f) => {
    if (typeof f == 'function') {
      callUser = f
    }
  },
}
window.box_core = {
  store: () => {
    return new Promise((resolve, reject) => {
      resolve(proxy)
    })
  },
  listenStore: (f) => {
    if (typeof f == 'function') {
      callStore = f
    }
  },
  statistics: () => {
    return new Promise((resolve, reject) => {
      resolve({
        proxy_download_speed: null,
        proxy_upload_speed: null,
      })
    })
  },
  start: () => {
    return new Promise((resolve, reject) => {
      proxy.status = 'on'
      call(callStore, proxy)
      resolve()
    })
  },
  close: () => {
    return new Promise((resolve, reject) => {
      proxy.status = 'off'
      call(callStore, proxy)
      resolve()
    })
  },
  changeMode: (mode) => {
    return new Promise((resolve, reject) => {
      proxy.mode = mode
      call(callStore, proxy)
      resolve()
    })
  },
  changeRule: (rule) => {
    return new Promise((resolve, reject) => {
      proxy.rule = rule
      call(callStore, proxy)
      resolve()
    })
  },
}