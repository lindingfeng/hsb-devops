[![build status](https://img.shields.io/travis/http-party/http-server.svg?style=flat-square)](https://travis-ci.org/http-party/http-server)
[![npm](https://img.shields.io/npm/v/http-server.svg?style=flat-square)](https://www.npmjs.com/package/http-server) [![homebrew](https://img.shields.io/homebrew/v/http-server?style=flat-square)](https://formulae.brew.sh/formula/http-server) [![npm downloads](https://img.shields.io/npm/dm/http-server?color=blue&label=npm%20downloads&style=flat-square)](https://www.npmjs.com/package/http-server)
[![license](https://img.shields.io/github/license/http-party/http-server.svg?style=flat-square)](https://github.com/http-party/http-server)

# hsb-tools: a command-line tools

`hsb-tools` is a simple tools...

## Installation:

#### Install By `npm`

    npm i -g hsb-tools --registry=http://129.204.136.155:4873

    or

    npm i -D hsb-tools --registry=http://129.204.136.155:4873


#### Install By `yarn`

    yarn add -D hsb-tools --registry=http://129.204.136.155:4873

#### Running on-demand:

Using `npx` you can run the script without installing it first:

    npx hsb-tools [path] [options]
     

## Usage:

     hsb-tools [path] [options]

     # 使用devops-new 和 key 发版
     hsb-tools devops --platform=new --key=xxx

     # 使用devops-prod 和 key 发版
     hsb-tools devops --platform=prod --key=xxx

     # 使用 key 压缩图片
     hsb-tools compressTinify --key=xxx


### key的获取可以通过[这里](http://jk.www.huishoubao.com/devops/)去创建并获取
