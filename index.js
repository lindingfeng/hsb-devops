// const { program } = require('commander');
// const readline = require('readline');
const chalk = require('chalk')
const ora = require('ora');
const applyOrder = require('./lib/module/applyOrder');
const { setData } = require('./lib/store')
const { loginByAMC } = require('./lib/login');
const { getUserInfo } = require('./lib/http');
const { inquirerHandle, compressFile } = require('./lib/utils');
const config = require('./config');

// console.log('cmd path1: ', path.resolve('./'))
// console.log('cmd path2: ', process.cwd())

// program.version('0.0.1', '-v, --version')
// .option('-d, --debug', 'output extra debugging')
// .option('-s, --small', 'small pizza size')
// .option('-p, --pizza-type <type>', 'flavour of pizza')
// .parse(process.argv);
// if (program.debug) console.log(program.opts());

/*
 * @Description: 执行压缩操作
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-05 20:07:59
*/
const compressHandle = async (path, dir_name, type) => {
  try {
    const spinner = ora('正在执行压缩处理, 请稍后...');
    spinner.start()
    const res = await compressFile(path, dir_name, type)
    setTimeout(() => {
      spinner.stop()
      console.log(chalk.green(`${res.status}: ${res.path}`))
    }, 1000)
  } catch (error) {
    spinner.stop()
    console.log(chalk.red('压缩失败: ', JSON.stringify(error)))
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
    compressHandle(path, dir_name, type)
  })
}

/*
 * @Description: 开始执行
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-03 18:50:22
*/
const start = async (id) => {
  try {
    if (![4].includes(id)) {
      const loginInfo = await loginByAMC()
      setData('loginInfo', loginInfo)
      const userInfo = await getUserInfo(loginInfo)
      setData('userInfo', userInfo)
    }
    switch (id) {
      case 1:
        applyOrder()
        break;
      case 2:
        // getUserAppList(store.loginInfo)
        // console.log(chalk.green('功能开发中，敬请期待...'))
        break;
      case 3:
        console.log(chalk.green('功能开发中，敬请期待...'))
        break;
      case 4:
        if (config.COMPRESS && Object.keys(config.COMPRESS).length) {
          compressHandle(
            config.COMPRESS.PATH,
            config.COMPRESS.DIR_NAME,
            config.COMPRESS.TYPE
          )
        } else {
          rqCompressInfo()
        }
        break;
      default:
        applyOrder()
        break;
    }
  } catch (error) {
    console.log(chalk.red(error))
    process.exit(1)
  }
}

const run = () => {
  inquirerHandle([{
    name: 'id',
    message: '请选择所需功能',
    type: 'list',
    choices: [...config.BASE_LIST],
    pageSize: config.COMMAND_LINE
  },{
    name: 'pass',
    message: '代码是否合了最新代码？',
    type: 'list',
    choices: [...config.TIPS_SCOPE],
    pageSize: config.COMMAND_LINE,
    when: ({ id }) => {
      if (id === 1) {
        return true
      }
      return false
    }
  }], async (answer) => {
    const { id, pass } = answer
    id && (!pass || pass === 1) && start(id)
  })
}

module.exports = {
  start,
  run
}