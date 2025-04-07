package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

var (
	portFlag = flag.Int("p", 8080, "Server port")
)

const (
	versions_bash_path = "./versions"
)

func init() {
	if _, err := os.Stat(versions_bash_path); err != nil {
		if os.IsNotExist(err) {
			if err := os.Mkdir(versions_bash_path, os.ModePerm); err != nil {
				log.Fatalln("make versions dir failed", err)
				panic("make versions dir failed")
			}
		} else {
			log.Fatalln("check versions dir failed", err)
			panic("check versions dir failed")
		}
	}
}

func newCors() gin.HandlerFunc {
	return cors.New(cors.Config{
		//准许跨域请求网站,多个使用,分开,限制使用*
		AllowOrigins: []string{"*"},
		//准许使用的请求方式
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "PATCH"},
		//准许使用的请求表头
		AllowHeaders: []string{"Origin", "Authorization", "Content-Type", "Platform", "Arch", "Version"},
		//显示的请求表头
		ExposeHeaders: []string{"Content-Type"},
		//凭证共享,确定共享
		AllowCredentials: true,
		//容许跨域的原点网站,可以直接return true就万事大吉了
		AllowOriginFunc: func(origin string) bool {
			return true
		},
		//超时时间设定
		MaxAge: 24 * time.Hour,
	})
}

func main() {
	flag.Parse()
	log.Println("server start on", *portFlag)

	gin.SetMode(gin.ReleaseMode)

	r := gin.Default()
	r.Use(newCors())

	r.Any("/", func(ctx *gin.Context) {
		channel := ctx.Request.Header.Get("Channel")
		platform := ctx.Request.Header.Get("Platform")
		arch := ctx.Request.Header.Get("Arch")

		data, err := os.ReadFile(fmt.Sprintf("./versions/%s-%s-%s/version.json", channel, platform, arch))
		if err != nil {
			ctx.JSON(http.StatusBadRequest, err.Error())
			return
		}

		var latest struct {
			Version   string   `json:"version"`
			Asar      string   `json:"asar"`
			Install   string   `json:"install"`
			Force     bool     `json:"force"`
			Reinstall bool     `json:"reinstall"`
			Logs      []string `json:"logs"`
		}
		if err := json.Unmarshal(data, &latest); err != nil {
			ctx.JSON(http.StatusBadRequest, err.Error())
			return
		}

		ctx.JSON(http.StatusOK, latest)
	})

	r.Any("/versions/:Dir/:Name", func(ctx *gin.Context) {
		dir := ctx.Param("Dir")
		name := ctx.Param("Name")
		ctx.File(fmt.Sprintf("./versions/%s/%s", dir, name))
	})

	if err := r.Run(fmt.Sprintf(":%d", *portFlag)); err != nil {
		log.Fatalln("server start falied", err)
		panic(err)
	}
}
