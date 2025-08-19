const os = require('os')
const path = require('path')
const { app } = require('electron')
const { machineIdSync } = require('node-machine-id')
const crypto = require('crypto')
const { name, name_cn, name_en, core_config } = require('../package.json')
const { read } = require('./util')

const page_debug = process.argv.includes('PAGE_DEBUG')
const page_url = process.argv.includes('PAGE_URL')
const updater_debug = process.argv.includes('UPDATER_DEBUG')

const get_device_id = () => {
  // return "PCTEST_20250819_001"
  return crypto.createHash('md5').update(machineIdSync()).digest('hex')
}

const device_id = get_device_id()
const device_name = `${os.platform} ${os.release()}`
const device_type = {
  darwin: 3,
  win32: 4,
}[process.platform]
const device_type_with_arch = {
  darwin: {
    x64: 3,
    arm64: 4,
  },
  win32: {
    x64: 5,
    arm64: 6,
  },
}[process.platform][process.arch]

const get_resources_path = () => {
  if (app.isPackaged) {
    return process.resourcesPath
  } else {
    return path.join(__dirname, '../')
  }
}
const resources_path = get_resources_path()
const config_path = path.join(app.getPath('appData'), `${name}/.config`)
const log_path = path.join(app.getPath('appData'), `${name}/.log`)
const xfuture_path = path.join(resources_path, 'node_modules/xfuture')
const channel_path = path.join(resources_path, 'channel.json')
const dev_updater_server_path = path.join(resources_path, 'updater.dev.json')

const get_channel_id = () => {
  let id = null
  try {
    const tmp = JSON.parse(read(path.join(resources_path, 'channel.json')))
    id = tmp?.id
  } catch (err) {
    console.error('get channel id failed:', err)
  }
  return id
}

const channel_id = get_channel_id()

module.exports = {
  name,
  name_cn,
  name_en,
  core_config,
  page_debug,
  updater_debug,
  page_url,
  resources_path,
  config_path,
  log_path,
  xfuture_path,
  channel_path,
  device_id,
  device_name,
  device_type,
  device_type_with_arch,
  channel_id,
  dev_updater_server_path,
}