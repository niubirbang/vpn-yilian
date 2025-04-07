const fs = require('fs')
const JavaScriptObfuscator = require('javascript-obfuscator')
const { files } = require('./files')

files.forEach(sourceFile => {
  const srcFileCode = fs.readFileSync(sourceFile, 'utf-8')
  const obfuscationFileCode = JavaScriptObfuscator.obfuscate(srcFileCode, {
    compact: true,
    controlFlowFlattening: true,
    numbersToExpressions: true,
    simplify: true,
    stringArray: true,
    stringArrayThreshold: 0.75,
  })
  const obfuscationFilePath = sourceFile.replace('.src.js', '.js')
  fs.writeFileSync(obfuscationFilePath, obfuscationFileCode.getObfuscatedCode())
})