const { log } = require('./logger')

let before_ready_hooks = []
let ready_hooks = []
let before_quit_hooks = []

const registryBeforeReady = (name = '', fn = () => { }) => {
  before_ready_hooks.push({
    name,
    fn,
  })
}

const registryReady = (name = '', fn = () => { }) => {
  ready_hooks.push({
    name,
    fn,
  })
}

const registryBeforeQuit = (name = '', fn = () => { }) => {
  before_quit_hooks.push({
    name,
    fn,
  })
}

const run = async (app) => {
  for (let hook of before_ready_hooks) {
    log(`hook ${hook.name} before ready`)
    if (hook && hook.fn && typeof hook.fn == 'function') {
      await hook.fn()
    }
  }

  app.on('ready', async () => {
    for (let hook of ready_hooks) {
      log(`hook ${hook.name} ready`)
      if (hook && hook.fn && typeof hook.fn == 'function') {
        await hook.fn()
      }
    }
  })

  app.on('before-quit', async () => {
    for (let hook of before_quit_hooks) {
      log(`hook ${hook.name} before quit`)
      if (hook && hook.fn && typeof hook.fn == 'function') {
        await hook.fn()
      }
    }
  })
}

module.exports = {
  registryBeforeReady,
  registryReady,
  registryBeforeQuit,
  run,
}