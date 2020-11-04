const fs = require('fs')
const ora = require('ora');
const chalk = require('chalk')
const tinify = require("tinify");
const { inquirerHandle, compressFile } = require('../utils');
const { uploadFiles } = require('../upload')
const { config } = require('../../config');
const { setConfigByAppKey } = require('./common')

/*
 * @Description: 执行压缩操作
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-05 20:07:59
*/
const startCompress = async (path, dir_name, type, callBack) => {
  try {
    console.log(chalk.green('正在执行压缩处理, 请稍后...'))
    const res = await compressFile(path, dir_name, type)
    console.log(chalk.green(`-- ${res.status} --`))
    console.log(chalk.green(`path: ${res.path}`))
    console.log(chalk.green(`size: ${res.size} bytes`))
    callBack && callBack(res)
  } catch (error) {
    console.log(chalk.red('-- 压缩失败 --'))
    console.log(chalk.red(error))
  }
}

/*
 * @Description: 获取压缩文件信息
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-05 20:08:44
*/
const rqCompressInfo = (callBack) => {
  inquirerHandle([...config.COMPRESS_TEMPLATE_LIST], async (answer) => {
    const { path = process.cwd(), dir_name, type } = answer || {}
    startCompress(path, dir_name, type, callBack)
  })
}

const checkConfig = () => {
  if (config.COMPRESS && Object.keys(config.COMPRESS).length) {
    startCompress(
      config.COMPRESS.PATH,
      config.COMPRESS.DIR_NAME,
      config.COMPRESS.TYPE
    )
  } else {
    rqCompressInfo()
  }
}

/*
 * @Description: 使用tinify接口压缩图片
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-10 18:08:07
*/
const compressTinify = async (key) => {
  if (key) {
    await setConfigByAppKey(key)
  }
  if (!config.TINIFY.KEY) {
    console.log(chalk.red('未发现tinypng的key，可前往官网进行申请'))
    console.log(chalk.green('https://tinypng.com/developers'))
    return
  }
  tinify.key = config.TINIFY.KEY;
  let count = 0
  let failLen = 0
  const currentPath = process.cwd()
  const dirFiles = fs.readdirSync(`${currentPath}`)
  const filterFiles = dirFiles.filter(v => /\.(png|jpe?g)(\?.*)?$/.test(v))
  const compressDir = 'compressDir'
  if (!filterFiles.length) {
    console.log(chalk.red('未发现当前目录下存在.jpg、.jpeg、.png文件，请检查...'))
    return
  }
  if (!fs.existsSync(`${currentPath}/${compressDir}/`)) {
    fs.mkdirSync(`${currentPath}/${compressDir}/`)
  }
  const spinner = ora('正在无损压缩, 请稍后...');
  spinner.start()
  for (let i = 0; i < filterFiles.length; i++) {
    tinify.fromFile(`${currentPath}/${filterFiles[i]}`).toFile(`${currentPath}/${compressDir}/${filterFiles[i]}`, (err) => {
      count++
      if (err) {
        failLen = failLen + 1
      }
      if (count === filterFiles.length) {
        spinner.stop()
        console.log(chalk.green('成功:',count - failLen), chalk.red('失败:',failLen))
        if (failLen === 0) {
          needUploadCDN(compressDir)
        }
      }
    });
  }
}

const needUploadCDN = (fileDir) => {
  inquirerHandle([{
    name: 'is_need',
    message: '是否需要上传CDN',
    type: 'list',
    choices: [...config.CDN_UPLOAD_LIST],
    pageSize: config.COMMAND_LINE
  }], async (answer) => {
    if (answer.is_need) {
      uploadFiles(fileDir)
    }
  })
}

const compress = () => checkConfig()

module.exports = {
  compress,
  startCompress,
  rqCompressInfo,
  compressTinify
}