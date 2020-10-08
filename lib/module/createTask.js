const chalk = require('chalk')
const { getData, setData } = require('../store')
const { getUserAppList } = require('../http');
const { inquirerHandle } = require('../utils');
const { config } = require('../../config');

const getUserAppListInfo = async () => {
  try {
    const loginInfo = getData('loginInfo') || {}
    const res = await getUserAppList(loginInfo)
    if (!res.list) return
    setData('userAppList', res.list)
    res.list.forEach(e => { e.name = `${e.app_name} <${e.environment}>`, e.value = e.id });
    inquirerHandle([
      {
        name: 'app_id', // answer的key
        message: '请选择应用', // question标题
        type: 'list',
        choices: [...res.list],
        pageSize: config.COMMAND_LINE
      },
      {
        name: 'gray_publish',
        message: '是否需要灰度发布？(默认false)',
        type: 'confirm',
        default: false
      },
      {
        name: 'rollback_publish',
        message: '是否需要滚动发布？(默认false)',
        type: 'confirm',
        default: false
      },
      // {
      //   name: 'app_id',
      //   message: '请选择发布类型',
      //   type: 'list',
      //   choices: [...res.list],
      //   pageSize: config.COMMAND_LINE
      // },
      {
        name: 'tag_name',
        message: '请输入发版tag',
        type: 'input',
        validate: (res) => {
          if (!res) {
            return false
          }
          return true
        }
      },
      {
        name: 'desc',
        message: '请输入发版描述',
        type: 'input',
        validate: (res) => {
          if (!res) {
            return false
          }
          return true
        }
      }
    ], async (answer) => {
      console.log(answer)
      createPushTask(answer)
    })
  } catch (error) {
    console.log(chalk.red(error))
  }
}

const createPushTask = () => {
  // ...
}

const createTask = () => getUserAppListInfo()

module.exports = createTask