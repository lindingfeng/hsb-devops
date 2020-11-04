const chalk = require('chalk')
const { baseFeatrue } = require('./lib/module/baseFeatrue');
const applyOrder = require('./lib/module/applyOrder');
const createTask = require('./lib/module/createTask');
const { compressTinify } = require('./lib/module/compress');
const { setUserInfo } = require('./lib/user')
const { getData } = require('./lib/store')
const { mergeHsbDevopsConfig, setAppOrderInfo } = require('./config');

/*
 * @Description: 开始执行
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-11-03 18:50:22
*/
const start = async (id = 1) => {
  try {
    const { user_id } = getData('userInfo') || {}
    if ([1, 2].includes(id) && !user_id) {
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

const run = (user, password, key) => {
  baseFeatrue(async ({ id }) => {
    user && password && setAppOrderInfo({ key: 'USER', value: {
      SYSTEM_ID: '44',
      USERNAME: user,
      PASSWORD: password,
    }})
    key && setAppOrderInfo({ key: 'TINIFY', value: {
      KEY: key
    }})
    await setUserInfo()
    start(id)
  })
}

module.exports = {
  run
}