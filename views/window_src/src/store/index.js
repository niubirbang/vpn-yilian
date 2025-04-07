import { createStore } from 'vuex'

export const DEVICE_TYPE_DARWIN = 3
export const DEVICE_TYPE_WIN32 = 4

export const AUTHORIZATION_TYPE_DEVICE = 'device'
export const AUTHORIZATION_TYPE_USER = 'user'

export const PROXY_STATUS_OFF = 'off'
export const PROXY_STATUS_ON = 'on'
export const PROXY_MODE_SYSTEM = 'system'
export const PROXY_MODE_TUN = 'tun'
export const PROXY_RULE_CN = 'cn'
export const PROXY_RULE_GLOBAL = 'global'

export const USER_LEVEL_NORMAL = 'normal'
export const USER_LEVEL_FREE = 'free'
export const USER_LEVEL_VIP = 'vip'
export const USER_LEVEL_SVIP = 'svip'
export const USER_LEVEL_FOREVER = 'forever'

const store = createStore({
  state: {
    timestamp: null,
    authorized_from_page: null,

    name: null,
    name_cn: null,
    name_en: null,
    device_id: null,
    device_name: null,
    device_type: null,

    version: null,
    version_server: null,
    version_is_latest: null,
    version_is_force: null,
    version_download_url: null,

    authorization_loaded: false,
    authorized: false,
    authorization_type: null,
    authorization: null,
    token: null,
    password: null,

    user_loaded: false,
    user_id: null,
    user_account: null,
    user_email: null,
    user_phone: null,
    user_nickname: null,
    user_free_expired_at: null,
    user_vip_expired_at: null,
    user_svip_expired_at: null,
    user_level: null,
    user_received_free: true,
    user_recharged: false,
    user_binded_invite_code: null,

    proxy_loaded: false,
    proxy_status: null,
    proxy_mode: null,
    proxy_rule: null,
    proxy_rules: [],
    proxy_smart: null,
    proxy_expired_at: null,
    proxy_subscribe: [],
    proxy_current_choise_names: null,
    proxy_current_names: null,
    proxy_current_node: null,
    proxy_connect_time: null,
    proxy_delaies: {},
    proxy_download_speed: 0,
    proxy_upload_speed: 0,

    third_service: null,
    third_question_answer: null,
    third_service_policy: null,
    third_privacy_policy: null,
    third_logout_policy: null,
    third_application_url: null,

    service_show: false,
    free_dialog_show: false,
  },
  mutations: {
    loadTimestamp(state) {
      state.timestamp = parseInt(new Date() / 1000)
      setInterval(() => {
        state.timestamp = parseInt(new Date() / 1000)
      }, 1000)
    },
    setAuthorizedFromPage(state, from) {
      state.authorized_from_page = from
    },
    loadSystem(state) {
      const setDevice = (state, info) => {
        state.name = info.name
        state.name_cn = info.name_cn
        state.name_en = info.name_en
        state.device_id = info.device_id
        state.device_name = info.device_name
        state.device_type = info.device_type
      }
      const setVersion = (state, info) => {
        state.version = info.current_version
        state.version_server = info.server_version
        state.version_is_latest = info.is_latest
        state.version_is_force = info.is_force
        state.version_download_url = info.download_url
      }

      try {
        window.box_system.info().then(info => {
          console.info('[store] device:', info)
          setDevice(state, info)
        })
      } catch (err) {
        console.error('[store] device:', err)
      }

      try {
        window.box_api.version().then(info => {
          console.info('[store] version:', info)
          setVersion(state, info)
        })
      } catch (err) {
        console.error('[store] version:', err)
      }
      try {
        window.box_api.listenVersion(info => {
          console.info('[store] listen version:', info)
          setVersion(state, info)
        })
      } catch (err) {
        console.error('[store] listen version:', err)
      }
    },
    loadAuthorization(state) {
      const set = (state, info) => {
        state.authorization_loaded = true
        state.authorized = info.authorization ? true : false
        state.authorization_type = info.authorization_type
        state.authorization = info.authorization
        state.token = info.token
        state.password = info.password
      }

      try {
        window.box_api.authorization().then(info => {
          console.info('[store] authorization:', info)
          set(state, info)
        })
      } catch (err) {
        console.error('[store] authorization failed:', err)
      }
      try {
        window.box_api.listenAuthorization(info => {
          console.info('[store] listen authorization:', info)
          set(state, info)
        })
      } catch (err) {
        console.error('[store] listen authorization failed:', err)
      }
    },
    loadUser(state) {
      const set = (state, info) => {
        state.user_loaded = true
        state.user_id = info.id
        state.user_account = info.account
        state.user_email = info.email
        state.user_phone = info.phone
        state.user_nickname = info.nickname
        state.user_free_expired_at = info.free_expired_at
        state.user_vip_expired_at = info.vip_expired_at
        state.user_svip_expired_at = info.svip_expired_at
        state.user_level = info.level
        state.user_received_free = info.received_free
        state.user_recharged = info.recharged
        state.user_binded_invite_code = info.binded_invite_code
      }

      try {
        window.box_api.user().then(info => {
          console.info('[store] user:', info)
          set(state, info)
        })
      } catch (err) {
        console.error('[store] user:', err)
      }
      try {
        window.box_api.listenUser(info => {
          console.info('[store] listen user:', info)
          set(state, info)
        })
      } catch (err) {
        console.error('[store] listen user:', err)
      }
    },
    loadProxy(state) {
      const setBase = (state, info) => {
        state.proxy_loaded = true
        state.proxy_status = info.status
        state.proxy_mode = info.mode
        state.proxy_rule = info.rule
        state.proxy_rules = info.rules
        state.proxy_smart = info.smart
        state.proxy_expired_at = info.expired_at
        state.proxy_subscribe = info.subscribe
        state.proxy_current_choise_names = info.current_choise_names
        state.proxy_current_names = info.current_names
        state.proxy_current_node = info.current_node
        state.proxy_connect_time = info.connect_time


      }
      const setStatistics = (state, info) => {
        state.proxy_delaies = info.delaies
        state.proxy_download_speed = info.download_speed
        state.proxy_upload_speed = info.upload_speed
      }

      try {
        window.box_core.store().then(info => {
          console.info('[store] proxy base:', info)
          setBase(state, info)
        })
      } catch (err) {
        console.error('[store] proxy base:', err)
      }
      try {
        window.box_core.listenStore(info => {
          console.info('[store] listen proxy base:', info)
          setBase(state, info)
        })
      } catch (err) {
        console.error('[store] listen proxy base:', err)
      }

      setInterval(() => {
        try {
          window.box_core.statistics().then(info => {
            // console.info('[store] proxy statistics:', info)
            setStatistics(state, info)
          })
        } catch (err) {
          console.error('[store] proxy statistics:', err)
        }
      }, 1000)
    },
    loadThirdPage(state) {
      const set = (state, info) => {
        state.third_service = info?.service
        state.third_question_answer = info?.question_answer
        // state.third_question_answer = 'https://www.baidu.com'
        state.third_service_policy = info?.service_policy
        // state.third_service_policy = 'https://www.baidu.com'
        state.third_privacy_policy = info?.privacy_policy
        // state.third_privacy_policy = 'https://www.baidu.com'
        state.third_logout_policy = info?.logout_policy
        // state.third_logout_policy = 'https://www.baidu.com'
        state.third_application_url = info?.application_url
        // state.third_application_url = 'https://www.baidu.com'
      }

      try {
        window.box_api.thirdPageURLs().then(info => {
          console.info('[store] third page:', info)
          set(state, info)
        })
      } catch (err) {
        console.error('[store] third page:', err)
      }
      try {
        window.box_api.listenThirdPageURLs(info => {
          console.info('[store] listen third page:', info)
          set(state, info)
        })
      } catch (err) {
        console.error('[store] listen third page:', err)
      }
    },
    setServiceShow(state, v) {
      state.service_show = v
    },
    setFreeDialogShow(state, v) {
      state.free_dialog_show = v
    },
  },
})

store.commit('loadTimestamp')
store.commit('loadSystem')
store.commit('loadAuthorization')
store.commit('loadThirdPage')
store.commit('loadUser')
store.commit('loadProxy')

export default store