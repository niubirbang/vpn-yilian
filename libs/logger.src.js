const path = require('path')
const fs = require('fs')
const util = require('util')
const { mkdir } = require('./util')
const { log_path } = require('./const')

const color_map = {
  error: '\x1B[31m%s\x1B\x1B[0m',
  warn: '\x1B[33m%s\x1B\x1B[0m',
  info: '\x1B[36m%s\x1B\x1B[0m',
  log: '\x1B[30m%s\x1B\x1B[0m',
}
const color_txt = (color, text) => {
  let tmp = color_map[color]
  if (!tmp) {
    tmp = color_map[dft]
  }
  return util.format(tmp, text)
}

const log_levels = {
  NONE: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  LOG: 4,
}

const original_error = console.error
const original_warn = console.warn
const original_info = console.info
const original_log = console.log

const logger_time = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')
  const millisecond = String(date.getMilliseconds()).padStart(3, '0')
  return `${year}-${month}-${day} ${hour}:${minute}:${second}.${millisecond}`
}

let log_level = log_levels.NONE
let log_to_terminal = false
let log_to_file = false
let log_file = null

console.error = function (...args) {
  if (log_level >= log_levels.ERROR) {
    const msg = `[ERROR] ${logger_time()} ` + util.format(...args) + '\n'
    if (log_to_terminal) {
      original_error.apply(console, [color_txt('error', msg)])
    }
    if (log_to_file) {
      log_file.write(msg)
    }
  }
}
console.warn = function (...args) {
  if (log_level >= log_levels.WARN) {
    const msg = `[WARN] ${logger_time()} ` + util.format(...args) + '\n'
    if (log_to_terminal) {
      original_warn.apply(console, [color_txt('warn', msg)])
    }
    if (log_to_file) {
      log_file.write(msg)
    }
  }
}
console.info = function (...args) {
  if (log_level >= log_levels.INFO) {
    const msg = `[INFO] ${logger_time()} ` + util.format(...args) + '\n'
    if (log_to_terminal) {
      original_info.apply(console, [color_txt('info', msg)])
    }
    if (log_to_file) {
      log_file.write(msg)
    }
  }
}
console.log = function (...args) {
  if (log_level >= log_levels.LOG) {
    const msg = `[LOG] ${logger_time()} ` + util.format(...args) + '\n'
    if (log_to_terminal) {
      original_log.apply(console, [color_txt('log', msg)])
    }
    if (log_to_file) {
      log_file.write(msg)
    }
  }
}

const error_f = (title, ...args) => {
  console.error(util.format(`[${title}]`, ...args))
}
const warn_f = (title, ...args) => {
  console.warn(util.format(`[${title}]`, ...args))
}
const info_f = (title, ...args) => {
  console.info(util.format(`[${title}]`, ...args))
}
const log_f = (title, ...args) => {
  console.log(util.format(`[${title}]`, ...args))
}

const init = () => {
  let tmp_log_level = log_levels[process.argv.find(arg => arg.startsWith('LOG_LEVEL='))?.replace('LOG_LEVEL=', '')]
  if (tmp_log_level) {
    log_level = tmp_log_level
  }

  let tmp_log_to_terminal = process.argv.includes('LOG_TO_TERMINAL')
  if (tmp_log_to_terminal) {
    log_to_terminal = true
  }

  let tmp_log_to_file = process.argv.includes('LOG_TO_FILE')
  if (tmp_log_to_file) {
    log_to_file = true
  }

  if (log_to_file) {
    mkdir(log_path)
    log_file = fs.createWriteStream(path.join(log_path, `log`), { flags: 'a' })
  }
}

module.exports = {
  init,
  error: error_f,
  warn: warn_f,
  info: info_f,
  log: log_f,
}