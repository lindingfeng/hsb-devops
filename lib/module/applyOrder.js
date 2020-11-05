const chalk = require('chalk');
const rm = require('rimraf')
const { getData, setData } = require('../store')
const {
  getFtList,
  getIterations,
  getServerInfoByAppName,
  getAppNameLeader,
  getAppInfoByKeyword,
  getTaskStatus,
  devposProdCreateTask,
  sendDingTalk
} = require('../http');
const { inquirerHandle, isEmpty, gitPublishApplyStatus } = require('../utils');
const { setTagInfo } = require('../tag')
const { config } = require('../../config');
const { execCommand } = require('../exec')
const { setConfigByAppKey } = require('./common')

// 发版信息
const publishInfo = {
  publish_type: ''
}

// 当前发布状态
let nowPublishStatus = ''
let count = 1

/*
 * @Description: 选择所属FT
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-03 18:37:29
*/
const chooseFtList = async () => {
  const ftList = await getFtList()
  setData('ftList', ftList)
  if (!ftList.length) return
  ftList.forEach(e => { e.name = e.ftname, e.value = e.ftid });
  inquirerHandle([{
    name: 'ftid',
    message: '请选择所属FT',
    type: 'list',
    choices: [...ftList],
    default: config.DEFAULT_ZY_FTID,
    pageSize: config.COMMAND_LINE,
    when: () => !(config.ORDER.ftid)
  }], async (answer) => {
    const ftid = answer.ftid || config.ORDER.ftid
    ftid && chooseFtIteration(ftid)
  })
}

/*
 * @Description: 选择FT对应的迭代
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-03 18:39:18
*/
const chooseFtIteration = async (ftid) => {
  const iterations = await getIterations(ftid)
  setData('iterations', iterations)
  if (!iterations.length) return
  iterations.forEach(e => { e.name = e.name, e.value = e.id });
  inquirerHandle([{
    name: 'iteration_id',
    message: '请选择所属迭代',
    type: 'list',
    choices: [...iterations],
    pageSize: config.COMMAND_LINE
  },
  {
    name: 'app_name',
    message: '请输入应用名',
    type: 'input',
    validate: (res) => !!res,
    when: () => !config.ORDER.app_name
  }], async ({ iteration_id, app_name }) => {
    try {
      // const { user_id, real_name } = getData('userInfo') || {}
      const iteration_name = iterations.find(e => e.id === iteration_id).name
      const name = app_name || config.ORDER.app_name
      const { pro_server_uid_set = [], test_server_uid_set = [] } = await getServerInfo(name)
      const [{ TE, TL }] = await getLeaderInfo(ftid)
      const [ appInfo ] = await getAppNameInfo(name)
      if (!appInfo) {
        throw new Error(`未检索到该应用 <${name}>，请检查！`)
      }
      setData('appInfo', appInfo)
      Object.assign(publishInfo, {
        ftid,
        iteration_id, iteration_name, app_name: name,
        TL_ID: config.ORDER.TL_ID || Object.keys(TL)[0],
        TL: config.ORDER.TL || Object.values(TL)[0],
        TE: config.ORDER.TE || { ...TE },
        production_server_uid_set: pro_server_uid_set.map(e => e.server_uid).join('#'),
        test_server_uid_set: test_server_uid_set.map(e => e.server_uid).join('#')
      })
      chooseVersionScope()
    } catch (error) {
      console.log(chalk.red(error))
    }
  })
}

/*
 * @Description: 获取应用服务器信息
 * @Author: lindingfeng
 * @Date: 2020-10-12 18:28:42
*/
const getServerInfo = (appName) => {
  return new Promise((resolve, reject) => {
    getServerInfoByAppName(appName).then(data => resolve(data)).catch(err => reject(err))
  })
}

/*
 * @Description: 获取应用对应的TL、TE、PO
 * @Author: lindingfeng
 * @Date: 2020-10-12 18:43:04
*/
const getLeaderInfo = (ftid) => {
  return new Promise((resolve, reject) => {
    getAppNameLeader(ftid).then(data => resolve(data)).catch(err => reject(err))
  })
}

/*
 * @Description: 搜索应用信息
 * @Author: lindingfeng
 * @Date: 2020-10-13 14:22:01
*/
const getAppNameInfo = (app_name) => {
  return new Promise((resolve, reject) => {
    getAppInfoByKeyword(app_name).then(data => resolve(data)).catch(err => reject(err))
  })
}

/*
 * @Description: 选择版本影响范围
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-03 18:39:18
*/
const chooseVersionScope = async () => {
  inquirerHandle([
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
      name: 'push_cdn_type',
      message: '是否上传CDN',
      type: 'list',
      choices: [...config.DEVOPS_CDN_UPLOAD_LIST],
      pageSize: config.COMMAND_LINE,
      when: () => !config.ORDER.push_cdn_type
    },
    {
      name: 'cdn_upload_dir',
      message: '请输入上传CDN目录',
      type: 'input',
      validate: (res) => !!res,
      when: ({ push_cdn_type }) => [2, 3].includes(push_cdn_type) && !config.ORDER.cdn_upload_dir
    },
    {
      name: 'test_flag',
      message: '是否需要测试',
      type: 'confirm',
      default: true,
      when: () => ![0, 1].includes(config.ORDER.test_flag)
    },
    {
      name: 'gray_publish_flag',
      message: '是否需要灰度发布',
      type: 'confirm',
      default: false,
      when: () => ![0, 1].includes(config.ORDER.gray_publish_flag)
    },
    {
      name: 'rolling_flag',
      message: '是否需要滚动发布',
      type: 'confirm',
      default: false,
      when: () => ![0, 1].includes(config.ORDER.rolling_flag)
    },
    {
      name: 'publish_desc',
      message: '请输入发版描述(将用于commit和发版描述)',
      type: 'input',
      validate: (res) => !!res
    }
  ], async (answer) => {
    const { auto_tag, c_tag, vid = 2, test_flag, push_cdn_type, cdn_upload_dir, gray_publish_flag, rolling_flag, publish_desc } = answer
    Object.assign(publishInfo, {
      test_flag: isEmpty(test_flag) ? config.ORDER.test_flag : Number(test_flag),
      push_cdn_type: isEmpty(push_cdn_type) ? config.ORDER.push_cdn_type : Number(push_cdn_type),
      cdn_upload_dir: isEmpty(cdn_upload_dir) ? (config.ORDER.cdn_upload_dir || '') : cdn_upload_dir,
      gray_publish_flag: isEmpty(gray_publish_flag) ? config.ORDER.gray_publish_flag : Number(gray_publish_flag),
      rolling_flag: isEmpty(rolling_flag) ? config.ORDER.rolling_flag : Number(rolling_flag),
      publish_desc
    })
    if (auto_tag === 1 || auto_tag === 2) {
      if (auto_tag === 2) {
        console.log(chalk.green('构建中...'))
        await rm.sync(`${process.cwd()}/dist`)
        await execCommand(config.ORDER.build_command || 'npm run build', true)
      }
      setTagInfo({ vid, publish_desc }, (originBranchName, tag) => {
        setData('publishInfo', Object.assign(publishInfo, { tag }))
        console.log(chalk.green('branch:', originBranchName))
        console.log(chalk.green('tag:', tag))
        startCreatePublishTask(publishInfo)
      })
    } else {
      setData('publishInfo', Object.assign(publishInfo, { tag: c_tag}))
      startCreatePublishTask(publishInfo)
    }
  })
}

/*
 * @Description: 开始提交工单
 * @Author: lindingfeng
 * @Date: 2020-10-15 10:13:10
*/
const startCreatePublishTask = async (params) => {
  try {
    await devposProdCreateTask(params)
    await listeningStatus(params)
    console.log(chalk.green('开始监听发布状态...'))
  } catch (error) {
    console.log(chalk.red(error))
  }
}

/*
 * @Description: 轮询发布任务状态
 * @Author: lindingfeng
 * @Date: 2020-10-15 17:29:32
*/
const listeningStatus = async (params) => {
  try {
    const { publish_iterations = [] } = await getTaskStatus(params.tag)
    const apply_publish_info = publish_iterations.find(e => e.tag === params.tag);
    if (apply_publish_info) {
      const { apply_status } = apply_publish_info
      const status_desc = gitPublishApplyStatus(apply_status)
      const include_status = config.NO_LISTEN_PUBLISH_STATUS_LIST.includes(Number(apply_status))
      switch (Number(include_status)) {
        case 0:
          if (nowPublishStatus !== apply_status) {
            nowPublishStatus = apply_status
            sendDingTalk({ apply_info: { ...apply_publish_info, status_desc } })
          }
          // 需要轮询发布状态
          setTimeout(() => {
            count++
            if (count < 120) {
              listeningStatus(params)
            }
          }, 5000)
          break;
        case 1:
          sendDingTalk({ apply_info: { ...apply_publish_info, status_desc } })
          break;
      }
    } else {
      throw new Error('未找到该tag的发布信息')
    }
  } catch (error) {
    console.log(chalk.red(error))
  }
}

const applyOrder = async (key) => {
  if (key) {
    await setConfigByAppKey(key)
  }
  chooseFtList()
}

module.exports = applyOrder