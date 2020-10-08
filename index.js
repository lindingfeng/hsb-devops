// const readline = require('readline');
const chalk = require('chalk')
const { baseFeatrue } = require('./lib/module/baseFeatrue');
const applyOrder = require('./lib/module/applyOrder');
const createTask = require('./lib/module/createTask');
const { startCompress } = require('./lib/module/compress');
const { setUserInfo } = require('./lib/user')
const { uploadFiles } = require('./lib/upload')
const { mergeHsbDevopsConfig } = require('./config');

/*
 * @Description: 开始执行
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-03 18:50:22
*/
const start = async (id = 1) => {
  try {
    if (![4].includes(id)) {
      await mergeHsbDevopsConfig()
      await setUserInfo()
    }
    switch (id) {
      case 1:
        applyOrder()
        break;
      case 2:
        createTask()
        break;
      case 3:
        // console.log(chalk.green('功能开发中，敬请期待...'))
        // uploadFile()
        uploadFiles()
        break;
      case 4:
        startCompress()
        break;
      default:
        applyOrder()
        break;
    }
  } catch (error) {
    console.log(chalk.red(error))
  }
}

const run = () => baseFeatrue(({ id }) => {
  start(id)
})

module.exports = {
  run
}