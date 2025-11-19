const path = require('path')
const fs = require('fs')

const findArg = (key) => {
  const name = `--${key}=`
  const arg = process.argv.find((item) => item.startsWith(name))
  if (arg) {
    return arg.replaceAll(name, '') || undefined
  }
  return undefined
}

const platform = findArg('platform') || process.env.npm_config_platform || process.platform
const arch = findArg('arch') || process.env.npm_config_arch || process.arch

let resourceDir = path.join(__dirname, '../../resources')
if (process.env['SPACE_ENVOY_SERVICE_DIR']) {
  resourceDir = process.env['SPACE_ENVOY_SERVICE_DIR']
}

const zipFile = path.join(__dirname, `/service-${platform}-${arch}.zip`)
const resourcesZipFile = path.join(resourceDir, 'service/service.zip')

console.log('Service building:', zipFile)
fs.cpSync(zipFile, resourcesZipFile)
console.log('Service builded:', resourcesZipFile)
