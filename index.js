const chalk = require('chalk')
const { baseFeatrue } = require('./lib/module/baseFeatrue');
const applyOrder = require('./lib/module/applyOrder');
const createTask = require('./lib/module/createTask');
const { compressTinify } = require('./lib/module/compress');
const { setUserInfo } = require('./lib/user')
const { mergeHsbDevopsConfig } = require('./config');

/*
 * @Description: 开始执行
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-03 18:50:22
*/
const start = async (id = 1) => {
  try {
    await mergeHsbDevopsConfig()
    if ([1, 2].includes(id)) {
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
        compressTinify()
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