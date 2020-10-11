const fs = require('fs')
const ora = require('ora');
const chalk = require('chalk')
const tinify = require("tinify");
const { inquirerHandle, compressFile } = require('../utils');
const { uploadFiles } = require('../upload')
const { config } = require('../../config');

/*
 * @Description: 执行压缩操作
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-05 20:07:59
*/
const compress = async (path, dir_name, type) => {
  try {
    const spinner = ora('正在执行压缩处理, 请稍后...');
    spinner.start()
    const res = await compressFile(path, dir_name, type)
    setTimeout(() => {
      spinner.stop()
      console.log(chalk.green(`-- ${res.status} --`))
      console.log(chalk.green(`path: ${res.path}`))
      console.log(chalk.green(`size: ${res.size} bytes`))
    }, 1000)
  } catch (error) {
    spinner.stop()
    console.log(chalk.red('-- 压缩失败 --'))
    console.log(chalk.red(error))
  }
}

/*
 * @Description: 获取压缩文件信息
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-05 20:08:44
*/
const rqCompressInfo = () => {
  inquirerHandle([...config.COMPRESS_TEMPLATE_LIST], async (answer) => {
    const { path = process.cwd(), dir_name, type } = answer || {}
    compress(path, dir_name, type)
  })
}

const checkConfig = () => {
  if (config.COMPRESS && Object.keys(config.COMPRESS).length) {
    compress(
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
const compressByTinify = () => {
  tinify.key = config.TINIFY.KEY;
  let count = 0
  let failLen = 0
  const currentPath = process.cwd()
  const dirFiles = fs.readdirSync(`${currentPath}`)
  const filterFiles = dirFiles.filter(v => /\.(png|jpe?g)(\?.*)?$/.test(v))
  const compressDir = 'compressDir'
  if (!filterFiles.length) {
    console.log(chalk.red('未发现.jpg、.jpeg、.png文件，请检查...'))
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
    name: 'isNeed',
    message: '是否需要上传CDN',
    type: 'list',
    choices: [...config.CDN_UPLOAD_LIST],
    pageSize: config.COMMAND_LINE
  }], async (answer) => {
    if (answer.isNeed === 1) {
      uploadFiles(fileDir)
    }
  })
}

const startCompress = () => checkConfig()

module.exports = {
  startCompress,
  rqCompressInfo,
  compressByTinify
}