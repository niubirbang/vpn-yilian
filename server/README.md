# 易链PC热更新服务端使用方式

## 构建可执行文件

```bash
CGO_ENABLED=0 GOARCH=amd64 GOOS=linux go build -o electron-updater-server main.go
```

---

## 运行
* 默认端口 8080
* 自动创建versions目录

```bash
./electron-updater-server [-p 8080]
```

---

## 发布新版本
* 将PC客户端给的压缩包解压放到versions目录
* 请保留上个版本安装包，以便回退
* win32-x64为Windows安装包及热更新内容
* darwin-x64为Intel内核的Mac安装包及热更新内容
* darwin-arm64为M系列内核的Mac安装包及热更新内容