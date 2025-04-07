const fs = require('fs')
const { files } = require('./files')

files.forEach(sourceFile => {
  fs.cpSync(sourceFile, sourceFile.replace('.src.js', '.js'))
})