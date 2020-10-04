const { exec } = require('child_process')

/*
 * @Description: 执行自定义命令'git symbolic-ref --short -q HEAD'
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-03 22:53:55
*/
const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(`执行的错误: ${error}`)
      }
      resolve(stdout)
    })
  })
}

/*
 * @Description: 执行sh文件命令
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-03 22:53:55
*/
const execShell = (path) => {
  return new Promise((resolve, reject) => {
    exec(`sh ${path}`, (error, stdout, stderr) => {
      if (error) {
        return reject(`执行的错误: ${error}`)
      }
      resolve(stdout)
    })
  })
}

module.exports = {
  execCommand,
  execShell
}