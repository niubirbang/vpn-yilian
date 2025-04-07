import { ElMessage } from 'element-plus'
import i18n from '@/i18n'

const $t = i18n.global.t

const default_duration = 2000

export const Success = (msg, afterDo) => {
  Notify(msg, 'success', afterDo)
}
export const Warning = (msg, afterDo) => {
  Notify(msg, 'warning', afterDo)
}
export const Info = (msg, afterDo) => {
  Notify(msg, 'info', afterDo)
}
export const Error = (err, afterDo) => {
  console.error(err)
  Notify(err, 'error', afterDo)
}

export const Notify = (msg, _type, afterDo) => {
  ElMessage({
    message: exchange_msg(msg),
    type: _type,
    duration: default_duration,
    grouping: true,
    plain: true,
    // customClass: 'notification-message center',
    customClass: 'notification-message bottom',
  })
  if (afterDo && typeof afterDo === 'function') {
    setTimeout(() => {
      afterDo()
    }, default_duration - 300)
  }
}

const specials = [
  'api_failed',
  'api_authorization_expired',
  'api_unknow_code',
  'api_exception',
  'api_err_network',
  'api_econnaborted',
  'api_err_bad_request',
  'api_err_bad_response',
  'api_unknow_err',

  'core_param_invalid',
  'core_node_disabled',
  'core_node_empty',
  'core_no_usable',
  'core_current_node_empty',
  'core_current_node_disabled',

  'url_invalid',
  'mode_invalid',
  'rule_invalid',
  'core_expired_at_is_empty',
  'core_expired',
  'start_failed',
]

const exchange_msg = (msg) => {
  msg += ''
  msg = msg.trim()
  if (msg.startsWith('Error:')) {
    msg = msg.replace('Error:', '')
  }
  msg = msg.trim()
  for (let special of specials) {
    if (msg.startsWith(special + ':')) {
      msg = msg.replace(special + ':', $t(special))
      break
    }
    if (msg.startsWith(special)) {
      msg = msg.replace(special, $t(special))
      break
    }
  }
  return msg
}