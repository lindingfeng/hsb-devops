<!-- [![build status](https://img.shields.io/travis/http-party/http-server.svg?style=flat-square)](https://travis-ci.org/http-party/http-server)
[![npm](https://img.shields.io/npm/v/http-server.svg?style=flat-square)](https://www.npmjs.com/package/http-server) [![homebrew](https://img.shields.io/homebrew/v/http-server?style=flat-square)](https://formulae.brew.sh/formula/http-server) [![npm downloads](https://img.shields.io/npm/dm/http-server?color=blue&label=npm%20downloads&style=flat-square)](https://www.npmjs.com/package/http-server)
[![license](https://img.shields.io/github/license/http-party/http-server.svg?style=flat-square)](https://github.com/http-party/http-server) -->

# hsb-tools: a command-line tools

`hsb-tools` is a simple tools...

## Installation:

#### Install By `npm`

    npm i -g hsb-tools --registry=http://132.232.35.229:4873

    or

    npm i -D hsb-tools --registry=http://132.232.35.229:4873


#### Install By `yarn`

    yarn add -D hsb-tools --registry=http://132.232.35.229:4873

#### Running on-demand:

Using `npx` you can run the script without installing it first:

    npx hsb-tools [path] [options]
     

## Usage:

     hsb-tools [path] [options]

     # 使用init命令初始化
     hsb-tools init -u lindingfeng@huishoubao.com.cn -p wsjj1994 -k Lh37kWP9W5QdMz22qChhtYkhMmgtwGLD

     # 使用devops-new命令发版
     hsb-tools devops-new -k gG1n1MVm

     # 使用devops-prod命令发版
     hsb-tools devops-prod -k gG1n1MVm

     # 使用compressTinify命令压缩图片
     hsb-tools compressTinify -k Iyxu7bNt

     # 使用upload命令压缩图片(前缀不能使用/)
     hsb-tools upload -d web/


## hsb.devops.json配置文件:
```javascript
{
  "successDing": {
    "url": "xxxxxx"  // 钉钉机器人url
  },
  "USER": {
    "SYSTEM_ID": "44",  // 发版系统ID
    "USERNAME": "lindingfeng@huishoubao.com.cn",  // AMC账号
    "PASSWORD": "wsjj1994"  // AMC密码
  },
  "ORDER": {
    "app_name": "ka.huishoubao.com.dist",  // 应用名称
    "ftid": "21923671",  // 所属FT
    "TL_ID": "1244",  // TL id
    "TL": "羊年",  // TL name
    "TE": {
      "1875": "胡育新"  // 测试人员信息
    },
    "push_cdn_type": 1,  // CDN类型 1：不上传CDN 2：静态资源上传 3：全量上传
    "test_flag": 1,  // 发布测试 0：不需要 1：需要
    "gray_publish_flag": 0,  // 灰度发布 0：不需要 1：需要
    "rolling_flag": 0,  // 滚动发布 0：不需要 1：需要
    "cdn_upload_dir": "",  // CDN目录，push_cdn_type等于2、3时需填写
    "build_command": "npm run build"  // 编译命令
  },
  "COMPRESS": {
    "PATH": "dist",  // 压缩文件目录
    "DIR_NAME": "hsbh5",  // 压缩文件名
    "TYPE": "zip"  // 压缩文件类型 zip、tar
  },
  "TINIFY": {
    "KEY": "Lh37kWP9W5QdMz22qChhtYkhMmgtwGLD"  // tinypng API KEY
  }
}
```


### key的获取可以通过[这里](http://jk.www.huishoubao.com/devops/)去创建并获取
