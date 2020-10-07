const ora = require('ora');
const chalk = require('chalk')
const { inquirerHandle, compressFile } = require('../utils');
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
    const { path, dir_name, type } = answer || {}
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

const startCompress = () => checkConfig()

module.exports = {
  startCompress,
  rqCompressInfo
}