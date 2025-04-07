const dns = require('dns')
const { registryBeforeReady } = require("./hook")

const options = {
  family: 4,
  servers: ['8.8.8.8', '114.114.114.114'],
}

const host = 'gz.guaziapp.xyz'

let listeners = []

let networkStatus = true

const registeNetworkStatusListener = (f) => {
  if (typeof f === 'function') {
    listeners.push(f)
  }
}

const syncNetworkStatusChange = (status) => {
  if (networkStatus === status) {
    return
  }
  networkStatus = status
  for (let f of listeners) {
    f(networkStatus)
  }
}

const init = () => {
  registryBeforeReady('network', initialize)
}

const initialize = () => {
  setInterval(() => {
    dns.lookup(host, options, (err, _) => {
      if (err) {
        console.error(`[network-monitor] error: ${err.message}`)
      }
      syncNetworkStatusChange(err ? false : true)
    })
  }, 1000)
}

module.exports = {
  init,
  registeNetworkStatusListener,
}