const chalk = require('chalk');
const { getData, setData } = require('../store')
const {
  getFtList,
  getIterations,
  getServerInfoByAppName,
  getAppNameLeader,
  getAppInfoByKeyword,
  devposProdCreateTask
} = require('../http');
const { inquirerHandle, isEmpty } = require('../utils');
const { setTagInfo } = require('../tag')
const { config } = require('../../config');

const publishInfo = {
  publish_type: ''
}

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
    name: 'ftid', // answer的key
    message: '请选择所属FT', // question标题
    type: 'list',
    choices: [...ftList],
    default: config.DEFAULT_ZY_FTID, //  默认自有平台
    pageSize: config.COMMAND_LINE
  }], async (answer) => {
    const { ftid } = answer || {}
    Object.assign(publishInfo, { ftid })
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
    name: 'iteration_id', // answer的key
    message: '请选择所属迭代', // question标题
    type: 'list',
    choices: [...iterations],
    pageSize: config.COMMAND_LINE
  },
  {
    name: 'app_name',
    message: '请输入应用名',
    type: 'input',
    validate: (res) => !!res,
    when: () => !(config.ORDER && config.ORDER.app_name)
  }], async ({ iteration_id, app_name }) => {
    try {
      const { user_id, real_name } = getData('userInfo') || {}
      const iteration_name = iterations.find(e => e.id === iteration_id).name
      const name = app_name || config.ORDER.app_name
      const { pro_server_uid_set = [], test_server_uid_set = [] } = await getServerInfo(name)
      const [{ TE, TL }] = await getLeaderInfo(publishInfo.ftid)
      const [ appInfo ] = await getAppNameInfo(name)
      if (!appInfo) {
        throw new Error(`未检索到该应用 <${name}>，请检查！`);
      }
      setData('appInfo', appInfo)
      Object.assign(publishInfo, {
        iteration_id, iteration_name, app_name: name,
        TL_ID: config.ORDER ? config.ORDER.TL_ID : Object.keys(TL)[0],
        TL: config.ORDER ? config.ORDER.TL : Object.values(TL)[0],
        TE: config.ORDER ? config.ORDER.TE : { ...TE, [user_id]: real_name },
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
      message: '请选择是否需要打tag',
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
      when: ({ auto_tag }) => auto_tag
    },
    {
      name: 'c_tag',
      message: '请输入发版的tag',
      type: 'input',
      validate: (res) => !!res,
      when: ({ auto_tag }) => !auto_tag
    },
    {
      name: 'push_cdn_type',
      message: '是否上传CDN',
      type: 'list',
      choices: [...config.DEVOPS_CDN_UPLOAD_LIST],
      pageSize: config.COMMAND_LINE,
      when: () => !(config.ORDER && config.ORDER.push_cdn_type)
    },
    {
      name: 'cdn_upload_dir',
      message: '请输入上传CDN目录',
      type: 'input',
      validate: (res) => !!res,
      when: ({ push_cdn_type }) => [2, 3].includes(push_cdn_type) && !(config.ORDER && config.ORDER.cdn_upload_dir)
    },
    {
      name: 'test_flag',
      message: '是否需要测试',
      type: 'confirm',
      default: true,
      when: () => !(config.ORDER && [0, 1].includes(config.ORDER.test_flag))
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
      message: '请输入发版描述(将用于commit和发版描述)',
      type: 'input',
      validate: (res) => !!res
    }
  ], async (answer) => {
    const { auto_tag, c_tag, vid = 2, test_flag, push_cdn_type, cdn_upload_dir, gray_publish_flag, rolling_flag, publish_desc } = answer
    Object.assign(publishInfo, {
      test_flag: isEmpty(test_flag) ? config.ORDER.test_flag : Number(test_flag),
      push_cdn_type: isEmpty(push_cdn_type) ? config.ORDER.push_cdn_type : Number(push_cdn_type),
      cdn_upload_dir: isEmpty(cdn_upload_dir) ? (config.ORDER ? config.ORDER.cdn_upload_dir : '') : cdn_upload_dir,
      gray_publish_flag: isEmpty(gray_publish_flag) ? config.ORDER.gray_publish_flag : Number(gray_publish_flag),
      rolling_flag: isEmpty(rolling_flag) ? config.ORDER.rolling_flag : Number(rolling_flag),
      publish_desc
    })
    if (auto_tag) {
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

const startCreatePublishTask = async (params) => {
  try {
    console.log('开始创建工单...')
    console.log(params)
    // const res = devposProdCreateTask(params)
    // console.log(res)
  } catch (error) {
    console.log(chalk.red(error))
  }
}

const applyOrder = () => chooseFtList()

module.exports = applyOrder