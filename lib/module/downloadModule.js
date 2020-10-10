const os = require('os');
const ora = require('ora');
const chalk = require('chalk');
const { execCommand } = require('../exec')

const webDoctor = async () => {
  try {
    const spinner = ora('正在安装, 请稍后...');
    spinner.start()
    await execCommand(`${os.type() === 'Darwin' ? 'sudo' : ''} npm i -g web-doctor`, true)
    spinner.stop()
    console.log(chalk.green('-- 安装成功 --\n'))
    console.log(`在项目根目录执行命令 ${chalk.green('we check')} 即可开始体检\n`)
  } catch (error) {
    spinner.stop()
    console.log(chalk.red(error))
  }
}

module.exports = {
  webDoctor
}