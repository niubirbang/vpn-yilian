import i18n from '@/i18n'
import moment from 'moment'

const $t = i18n.global.t

export const $OS = () => {
  // return 'linux'
  // return 'windows'
  // return 'mac'
  const userAgent = navigator.userAgent
  if (userAgent.match(/Windows/i)) {
    return 'windows'
  } else if (userAgent.match(/Macintosh/i)) {
    return 'mac'
  } else if (userAgent.match(/Linux/i)) {
    return 'linux'
  } else {
    return 'windows'
  }
}

export const $UnixSecondDiff = (unix) => {
  const now = Math.floor(Date.now() / 1000)
  return unix - now
}

export const $SecondToDuration = (second) => {
  try {
    second = parseInt(second)
  } catch (err) {
    return ''
  }
  let minute = parseInt(second / 60)
  second -= minute * 60
  let hour = parseInt(minute / 60)
  minute -= hour * 60
  let day = parseInt(hour / 24)
  hour -= day * 24

  return {
    second,
    minute,
    hour,
    day,
  }
}

export const $DurationTypeA = (second) => {
  try {
    second = parseInt(second)
  } catch (err) {
    return ''
  }
  let minute = parseInt(second / 60)
  second -= minute * 60
  let hour = parseInt(minute / 60)
  minute -= hour * 60
  let day = parseInt(hour / 24)
  hour -= day * 24

  let duration = ''
  if (day > 0) {
    duration += `${day}${$t('day')}`
  }
  if (hour > 0) {
    duration += `${hour}${$t('hour')}`
  }
  if (minute > 0) {
    duration += `${minute}${$t('minute')}`
  }
  if (second > 0) {
    duration += `${second}${$t('second')}`
  }
  return duration
}

export const $DurationTypeB = (second) => {
  try {
    second = parseInt(second)
  } catch (err) {
    return ''
  }
  let minute = parseInt(second / 60)
  second -= minute * 60
  let hour = parseInt(minute / 60)
  minute -= hour * 60
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`
}

export const $DurationTypeC = (second) => {
  try {
    second = parseInt(second)
  } catch (err) {
    return ''
  }
  let minute = parseInt(second / 60)
  second -= minute * 60
  let hour = parseInt(minute / 60)
  minute -= hour * 60
  let day = parseInt(hour / 24)
  hour -= day * 24

  if (day > 0) {
    return `${day}${$t('day')}`
  }
  if (hour > 0) {
    return `${hour}${$t('hour')}`
  }
  if (minute > 0) {
    return `${minute}${$t('minute')}`
  }
  if (second > 0) {
    return `${second}${$t('second')}`
  }
  return ''
}

export const $DateFormat = (timestamp, format) => {
  return moment(timestamp * 1000).format(format || 'YYYY-MM-DD')
}

export const $DateTimeFormat = (timestamp, format) => {
  return moment(timestamp * 1000).format(format || 'YYYY-MM-DD HH:mm:ss')
}

export const $UnixSecondDiffDurationTypeA = (unix) => {
  return $DurationTypeA($UnixSecondDiff(unix))
}

export const $UnixSecondDiffDurationTypeB = (unix) => {
  return $DurationTypeB($UnixSecondDiff(unix))
}

export const $UnixSecondDiffDurationTypeC = (unix) => {
  return $DurationTypeC($UnixSecondDiff(unix))
}

export const $Money = (cent, fixed) => {
  if (!cent) {
    return 0
  }
  const precision = 1000000
  const money = Math.round(cent * precision) / Math.round(100 * precision)
  if (fixed) {
    return money.toFixed(fixed)
  }
  return money
}
export const $Flod = (flod) => {
  if (!flod) {
    return 0
  }
  const precision = 1000000
  return Math.round(flod * precision) * 10 / Math.round(precision)
}

export const $ByteSpeed = (b) => {
  if (b < 1024) {
    return b + 'B'
  }
  const kb = b / 1024
  if (kb < 1024) {
    return kb.toFixed(2) + 'KB'
  }
  const mb = kb / 1024
  if (mb < 1024) {
    return mb.toFixed(2) + 'MB'
  }
  const gb = mb / 1024
  return gb.toFixed(2) + 'GB'
}

export const ErrorFoo = (err, code) => {
  err = err.trim()
  if (err.startsWith('Error:')) {
    err = err.replace('Error:', '')
  }
  err = err.trim()
  if (err.startsWith(code + ':')) {
    return true
  }
  if (err.startsWith(code)) {
    return true
  }
  return false
}

const iceServers = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
]

// callback(type, value)
export const ListenWebRTCIP = (callback) => {
  const myPeerConnection = new RTCPeerConnection({ iceServers })
  myPeerConnection.createDataChannel("")
  myPeerConnection.createOffer().then(offer => myPeerConnection.setLocalDescription(offer))

  myPeerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      const parts = event.candidate.candidate.split(' ')
      const ip = parts[4]

      const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}(([0-9a-fA-F]{1,4}:){1,4}|((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/

      if (ipv4Regex.test(ip)) {
        if (!is_private_ipv4(ip)) {
          callback('ipv4', ip)
        }
      } else if (ipv6Regex.test(ip)) {
        callback('ipv6', ip)
      } else {
        callback('local', ip)
      }
    }
  }
}
const is_private_ipv4 = (ip) => {
  // 定义私有IP地址的范围
  let privateIPRanges = [
    ['10.0.0.0', '10.255.255.255'],
    ['172.16.0.0', '172.31.255.255'],
    ['192.168.0.0', '192.168.255.255']
  ]

  // 将IP地址转换为数值形式，方便比较
  const ip_to_number = (ip) => {
    let parts = ip.split('.')
    return (parseInt(parts[0]) << 24) |
      (parseInt(parts[1]) << 16) |
      (parseInt(parts[2]) << 8) |
      parseInt(parts[3])
  }

  // 判断IP地址是否在私有IP范围内
  let ipNum = ip_to_number(ip)
  for (let i = 0; i < privateIPRanges.length; i++) {
    let start = ip_to_number(privateIPRanges[i][0])
    let end = ip_to_number(privateIPRanges[i][1])
    if (ipNum >= start && ipNum <= end) {
      return true
    }
  }
  return false
}