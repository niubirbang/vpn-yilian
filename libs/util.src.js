const fs = require('fs')
const path = require('path')

const exists = (p) => {
  return fs.existsSync(p)
}

const mkdir = (dirpath) => {
  if (!fs.existsSync(dirpath)) {
    mkdir(path.dirname(dirpath))
    fs.mkdirSync(dirpath)
  }
}

const remove = (p) => {
  if (!exists(p)) {
    return
  }
  const stat = fs.statSync(p)
  if (stat.isFile()) {
    fs.unlinkSync(p)
  } else if (stat.isDirectory()) {
    fs.readdirSync(p).forEach((file) => {
      const curPath = path.join(p, file)
      if (fs.lstatSync(curPath).isDirectory()) {
        remove(curPath)
      } else {
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(p)
  }
}

const copyFile = (source, target) => {
  let targetFile = target
  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isDirectory()) {
      targetFile = path.join(target, path.basename(source))
    }
  } else {
    const targetDir = path.dirname(target)
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }
  }
  fs.writeFileSync(targetFile, fs.readFileSync(source))
}

const copyDir = (source, target) => {
  if (!fs.existsSync(target)) {
    mkdir(target)
  }

  const files = fs.readdirSync(source)
  files.forEach(function (file) {
    const curSource = path.join(source, file)
    const curTarget = path.join(target, file)
    if (fs.lstatSync(curSource).isDirectory()) {
      copyDir(curSource, curTarget)
    } else {
      copyFile(curSource, curTarget)
    }
  })
}

const copy = (source, target) => {
  if (!fs.existsSync(source)) {
    throw new Error(`${source} not exists`)
  }

  if (fs.existsSync(target)) {
    throw new Error(`${target} exists`)
  }

  if (fs.lstatSync(source).isDirectory()) {
    copyDir(source, target)
  } else {
    copyFile(source, target)
  }
}

const write = (filePath, data) => {
  mkdir(path.dirname(filePath))
  fs.writeFileSync(filePath, data, 'utf-8')
}

const read = (filePath) => {
  return fs.readFileSync(filePath, 'utf-8')
}

const compareVersion = (version1, version2) => {
  const v1 = version1.split('.')
  const v2 = version2.split('.')

  const maxLength = Math.max(v1.length, v2.length)
  for (let i = 0; i < maxLength; i++) {
    const num1 = parseInt(v1[i] || 0)
    const num2 = parseInt(v2[i] || 0)
    if (num1 < num2) {
      return -1
    } else if (num1 > num2) {
      return 1
    }
  }
  return 0
}

const executeTask = ({
  task,
  delay = 3000,
  maxAttempts = 20,
  onSuccess = () => { },
  onMaxAttempted = () => { },
}) => {
  let attempts = 0
  let isStopped = false

  const executeWithDelay = () => {
    if (isStopped) {
      return
    }

    if (attempts >= maxAttempts) {
      if (onMaxAttempted) {
        onMaxAttempted()
      }
      return
    }

    task().then((data) => {
      if (onSuccess) {
        onSuccess(data)
      }
    }).catch(() => {
      attempts++
      setTimeout(executeWithDelay, delay)
    })
  }

  executeWithDelay()

  return {
    close: () => {
      isStopped = true
    }
  }
}

module.exports = {
  compareVersion,
  exists,
  mkdir,
  remove,
  copyFile,
  copyDir,
  copy,
  write,
  read,
  executeTask,
}