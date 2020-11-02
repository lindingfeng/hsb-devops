const chalk = require('chalk')
const rm = require('rimraf')
const { setData } = require('../store')
const { getUserAppList, getServerInfoByAppId, getAppInfoByKey } = require('../http');
const { inquirerHandle } = require('../utils');
const { config, setAppOrderInfo } = require('../../config');
const { setUserInfo } = require('../user')
const { execCommand } = require('../exec')
const { setTagInfo } = require('../tag')

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
      pageSize: config.COMMAND_LINE,
      when: () => {
        const app_info = res.list.find(e => e.app_name === config.ORDER.app_name)
        if (app_info) {
          return false
        }
        return true
      }
    },
    {
      name: 'auto_tag',
      message: '是否需要自动更新tag',
      type: 'list',
      choices: [...config.AUTO_TAG_LIST],
      pageSize: config.COMMAND_LINE
    },
    {
      name: 'vid',
      message: '请选择版本迭代',
      type: 'list',
      choices: [...config.VERSION_SCOPE],
      pageSize: config.COMMAND_LINE,
      when: ({ auto_tag }) => auto_tag === 1 || auto_tag === 2
    },
    {
      name: 'c_tag',
      message: '请输入发版的tag',
      type: 'input',
      validate: (res) => !!res,
      when: ({ auto_tag }) => auto_tag === 3
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
      default: false,
      when: () => !(config.ORDER && [0, 1].includes(config.ORDER.gray_publish_flag))
    },
    {
      name: 'rolling_flag',
      message: '是否需要滚动发布',
      type: 'confirm',
      default: false,
      when: () => !(config.ORDER && [0, 1].includes(config.ORDER.rolling_flag))
    },
    {
      name: 'publish_desc',
      message: '请输入发版描述',
      type: 'input',
      validate: (res) => !!res
    }
  ], async (answer) => {
    try {
      const { app_uid, auto_tag, c_tag, vid = 2, publish_type, gray_publish_flag, rolling_flag, publish_desc } = answer
      const app_info = res.list.find(e => e.app_name === config.ORDER.app_name)
      const params = {
        app_uid: app_uid ? app_uid : app_info.app_uid,
        publish_type,
        gray_publish_flag: gray_publish_flag ? Number(gray_publish_flag) : config.ORDER.gray_publish_flag,
        rolling_flag: rolling_flag ? Number(rolling_flag) : config.ORDER.rolling_flag,
        publish_desc,
        publish_time: '',
        cfg_file_name: '',
        cdn_file_name: '',
        cdn_upload_dir: '',
        publish_server_uid_set: ''
      }
      // const serverList = await getServerInfoByAppId(params.app_uid)
      // params.publish_server_uid_set = serverList.map(e => e.server_uid).join('#')
      // CDN应用
      // if (+app_type === 5) {
      //   return createPushTask(params)
      // }
      if (auto_tag === 1 || auto_tag === 2) {
        if (auto_tag === 2) {
          await rm.sync(`${process.cwd()}/dist`)
          await execCommand(`npm run build`, true)
        }
        setTagInfo({ vid, publish_desc }, (originBranchName, tag) => {
          Object.assign(params, { tag })
          console.log(chalk.green('branch:', originBranchName))
          console.log(chalk.green('tag:', tag))
          createPushTask(params)
        })
      } else {
        Object.assign(params, { tag: c_tag})
        createPushTask(params)
      }
    } catch (error) {
      console.log(chalk.red(error))
    }
  })
}

const createPushTask = async (params) => {
  // ...
  console.log(params)
}

const createTask = async (key) => {
  if (key) {
    try {
      const info = await getAppInfoByKey(key)
      if (info.list.length) {
        const data = {
          ...info.list[0]
        }
        const loginData = {
          SYSTEM_ID: '44',
          USERNAME: data.amc_user,
          PASSWORD: data.amc_pass,
        }
        data.TL_ID = data.ft_tl.split(',')[0]
        data.TL = data.ft_tl.split(',')[1]
        data.TE = {
          [data.ft_te.split(',')[0]]: data.ft_te.split(',')[1]
        }
        setAppOrderInfo({ key: 'ORDER', value: data })
        setAppOrderInfo({ key: 'USER', value: loginData })
        await setUserInfo()
      } else {
        console.log(chalk.red('未找到密钥对应的发版数据'))
      }
    } catch (error) {
      console.log(chalk.red(error))
    }
  }
  getUserAppListInfo()
}

module.exports = createTask