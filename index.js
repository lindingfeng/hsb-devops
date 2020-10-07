// const { program } = require('commander');
// const readline = require('readline');
const chalk = require('chalk')
const { baseFeatrue } = require('./lib/module/baseFeatrue');
const applyOrder = require('./lib/module/applyOrder');
const { startCompress } = require('./lib/module/compress');
const { setUserInfo } = require('./lib/user')
const { mergeHsbDevopsConfig } = require('./config');

// console.log('cmd path1: ', path.resolve('./'))
// console.log('cmd path2: ', process.cwd())

// program.version('0.0.1', '-v, --version')
// .option('-d, --debug', 'output extra debugging')
// .option('-s, --small', 'small pizza size')
// .option('-p, --pizza-type <type>', 'flavour of pizza')
// .parse(process.argv);
// if (program.debug) console.log(program.opts());

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
        console.log(chalk.green('功能开发中，敬请期待...'))
        break;
      case 3:
        console.log(chalk.green('功能开发中，敬请期待...'))
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