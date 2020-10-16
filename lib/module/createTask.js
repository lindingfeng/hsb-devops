const chalk = require('chalk')
const ora = require('ora');
const { setData } = require('../store')
const { getUserAppList, getServerInfoByAppId } = require('../http');
const { inquirerHandle } = require('../utils');
const { config } = require('../../config');

const getUserAppListInfo = async () => {
  const res = await getUserAppList()
  if (!res.list.length) {
    return
  }
  setData('userAppList', res.list)
  res.list.forEach(e => { e.name = `${e.app_name} <${e.environment}>`, e.value = e.app_uid });
  inquirerHandle([
    {
      name: 'app_uid',
      message: '请选择应用',
      type: 'list',
      choices: [...res.list],
      pageSize: config.COMMAND_LINE
    },
    {
      name: 'tag',
      message: '请输入发版tag',
      type: 'input',
      validate: (res) => !!res
    },
    {
      name: 'publish_type',
      message: '请选择发布类型',
      type: 'list',
      choices: [...config.PUBLISH_TYPE_LIST],
      pageSize: config.COMMAND_LINE
    },
    {
      name: 'gray_publish_flag',
      message: '是否需要灰度发布',
      type: 'confirm',
      default: false
    },
    {
      name: 'rolling_flag',
      message: '是否需要滚动发布',
      type: 'confirm',
      default: false
    },
    {
      name: 'publish_desc',
      message: '请输入发版描述',
      type: 'input',
      validate: (res) => !!res
    }
  ], async (answer) => {
    try {
      const { app_uid, tag, publish_type, gray_publish_flag, rolling_flag, publish_desc } = answer
      const params = {
        app_uid,
        tag,
        publish_type,
        gray_publish_flag: Number(gray_publish_flag),
        rolling_flag: Number(rolling_flag),
        publish_desc
      }
      const { app_type } = res.list.find(e => app_uid === e.app_uid)
      const serverList = await getServerInfoByAppId(app_uid)
      params.publish_server_uid_set = serverList.map(e => e.server_uid).join('#')
      // CDN应用
      if (+app_type === 5) {
        return createPushTask(params)
      }
      createPushTask(params)
    } catch (error) {
      console.log(chalk.red(error))
    }
  })
}

const createPushTask = async (params) => {
  // ...
  console.log(params)
}

const createTask = () => getUserAppListInfo()

module.exports = createTask