const path = require('path')
const fs = require('fs')

let channel = ''

const args = process.argv.slice(2)
if (args.length == 0) {
  return
}
const match = args[0].match(/channel_v[0-9].[0-9].[0-9]_(.+)/)
if (match) {
  channel = match[1]
} else {
  channel = args[0]
}

if (!channel) {
  console.error('no channel arg')
}

console.info('use channel:', channel)
const sourceChannelFilePath = path.join(__dirname, `../channels/${channel}.json`)
const destChannelFilePath = path.join(__dirname, `../channel.json`)

try {
  fs.cpSync(sourceChannelFilePath, destChannelFilePath)
  console.error('copy channel success')
} catch (err) {
  console.error('copy channel falied:', err)
}