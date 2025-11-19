const fs = require('fs')
const path = require('path')
const axios = require('axios')
const { service_preinstall, service_version } = require('../../package.json')

const findArg = (key) => {
  const name = `--${key}=`
  const arg = process.argv.find((item) => item.startsWith(name))
  if (arg) {
    return arg.replaceAll(name, '') || undefined
  }
  return undefined
}

const TOKEN = process.env['SPACE_ENVOY_SERVICE_DOWNLOAD_TOKEN']
const REPO = 'niubirbang/space-envoy-service'

const platform = findArg('platform') || process.env.npm_config_platform || process.platform
const arch = findArg('arch') || process.env.npm_config_arch || process.arch

const download = async () => {
  console.info('Service downloading', platform, arch)
  if (!service_preinstall) {
    console.info('Service download skipped')
    return
  }
  const release = await axios.get(
    `https://api.github.com/repos/${REPO}/releases/tags/v${service_version}`,
    {
      headers: {
        Authorization: `token ${TOKEN}`
      }
    }
  )
  const asset = release.data.assets.find(
    (asset) => asset.name === `service-${platform}-${arch}.zip`
  )
  if (!asset) {
    throw new Error(`${platform} ${arch} not support`)
  }
  const res = await axios.get(asset.url, {
    headers: {
      Authorization: `token ${TOKEN}`,
      Accept: 'application/octet-stream'
    },
    responseType: 'stream'
  })

  const writer = fs.createWriteStream(path.join(__dirname, asset.name))
  res.data.pipe(writer)
  await new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
  console.info('Service downloaded')
}

download()
