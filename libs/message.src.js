const { v4: uuidv4 } = require('uuid')
const { registryReady } = require('./hook')
const { registeIPCHandle } = require('./ipc')

let messages = []

const push = (type, message) => {
  messages.push({
    id: uuidv4(),
    type: type,
    data: message,
  })
}

const unshift = (type, message) => {
  messages.unshift({
    id: uuidv4(),
    type: type,
    data: message,
  })
}

const one = (type) => {
  const arr = messages.filter(message => message.type === type)
  if (arr.length > 0) {
    return arr[0]
  }
  return null
}

const list = (type) => {
  return messages.filter(message => message.type === type)
}

const read = (id) => {
  messages = messages.filter(message => message.id !== id)
}

const init = () => {
  registryReady('message', initialize)
}

const initialize = () => {
  initialize_ipc()
}

const initialize_ipc = () => {
  registeIPCHandle('message.one', (e, ...v) => {
    return one(...v)
  })
  registeIPCHandle('message.list', (e, ...v) => {
    return list(...v)
  })
  registeIPCHandle('message.read', (e, ...v) => {
    return read(...v)
  })
}

module.exports = {
  init,
  push,
  unshift,
  one,
  list,
  read,
}