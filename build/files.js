const path = require('path')
const fs = require('fs')

const dirs = [
  path.join(__dirname, '../'),
  path.join(__dirname, '../libs'),
  path.join(__dirname, '../preloads'),
]

let files = []

for (let dir of dirs) {
  for (let filePath of fs.readdirSync(dir).filter(file => file.endsWith('.src.js'))) {
    files.push(path.join(dir, filePath))
  }
}

module.exports = {
  dirs: dirs,
  files: files,
}