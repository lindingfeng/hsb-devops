const fs = require('fs')
const chalk = require('chalk')
const rm = require('rimraf')
const { setData } = require('../store')
const { getUserAppList, devposNewCreateTask, getNewTaskStatus, sendNewDingTalk, devposNewUploadCDN } = require('../http');
const { inquirerHandle, isEmpty } = require('../utils');
const { config } = require('../../config');
const { execCommand } = require('../exec')
const { setTagInfo } = require('../tag')
const { setConfigByAppKey } = require('./common')
const { rqCompressInfo, startCompress } = require('./compress')

// 当前发布状态
let nowPublishStatus = ''
let count = 1

const getUserAppListInfo = async () => {
  const res = await getUserAppList()
  if (!res.list.length) {
    return
  }
  const app_info = res.list.find(e => e.app_name === config.ORDER.app_name)
  if (config.ORDER.app_name && !app_info) {
    console.log(chalk.red('在devops-nes系统中没有当前应用的发版权限'))
    return
  }
  res.list.forEach(e => { e.name = `${e.app_name} <${e.environment}>`, e.value = e.app_uid })
  setData('userAppList', res.list)
  inquirerHandle([
    {
      name: 'app_uid',
      message: '请选择应用',
      type: 'list',
      choices: [...res.list],
      pageSize: config.COMMAND_LINE,
      when: () => {
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
      pageSize: config.COMMAND_LINE,
      when: ({ app_uid }) => {
        if (app_uid === config.CDN_ID || (app_info && app_info.app_type === 5)) {
          return false
        }
        return true
      }
    },
    {
      name: 'vid',
      message: '请选择版本迭代',
      type: 'list',
      choices: [...config.VERSION_SCOPE],
      pageSize: config.COMMAND_LINE,
      when: ({ auto_tag, app_uid }) => {
        if (app_uid === config.CDN_ID || (app_info && app_info.app_type === 5)) {
          return false
        }
        return auto_tag === 1 || auto_tag === 2
      }
    },
    {
      name: 'c_tag',
      message: '请输入发版的tag',
      type: 'input',
      validate: (res) => !!res,
      when: ({ auto_tag, app_uid }) => {
        if (app_uid === config.CDN_ID || (app_info && app_info.app_type === 5)) {
          return false
        }
        return auto_tag === 3
      }
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
      when: ({ app_uid }) => {
        if (app_uid === config.CDN_ID || (app_info && app_info.app_type === 5)) {
          return false
        }
        return ![0, 1].includes(config.ORDER.gray_publish_flag)
      }
    },
    {
      name: 'rolling_flag',
      message: '是否需要滚动发布',
      type: 'confirm',
      default: false,
      when: ({ app_uid }) => {
        if (app_uid === config.CDN_ID || (app_info && app_info.app_type === 5)) {
          return false
        }
        return ![0, 1].includes(config.ORDER.rolling_flag)
      }
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
      const params = {
        app_uid: app_uid ? app_uid : app_info.app_uid,
        publish_type,
        gray_publish_flag: isEmpty(gray_publish_flag) ? config.ORDER.gray_publish_flag || 0 : Number(gray_publish_flag),
        rolling_flag: isEmpty(rolling_flag) ? config.ORDER.rolling_flag || 0 : Number(rolling_flag),
        publish_desc,
        publish_time: '',
        cfg_file_name: '',
        cdn_file_name: '',
        cdn_upload_dir: '',
        publish_server_uid_set: ''
      }
      // CDN应用
      if (params.app_uid === config.CDN_ID) {
        params.tag = ''
        if (Object.keys(config.COMPRESS).length) {
          startCompress(config.COMPRESS.PATH, config.COMPRESS.DIR_NAME, config.COMPRESS.TYPE, (res) => {
            uploadCDN(params, res)
          })
        } else {
          rqCompressInfo((res) => {
            uploadCDN(params, res)
          })
        }
        return
      }
      if (auto_tag === 1 || auto_tag === 2) {
        if (auto_tag === 2) {
          console.log(chalk.green('构建中...'))
          await rm.sync(`${process.cwd()}/dist`)
          await execCommand(config.ORDER.build_command || 'npm run build', true)
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
  try {
    await devposNewCreateTask(params)
    await listeningStatus(params)
    console.log(chalk.green('开始监听发布状态...'))
  } catch (error) {
    console.log(chalk.red(error))
  }
}

const uploadCDN = async (param, compressInfo) => {
  try {
    const filename = `${compressInfo.fileName}.${compressInfo.type}`
    const formData = {
      cdn_files: {
        value: fs.createReadStream(compressInfo.path),
        options: {
          filename
        }
      }
    }
    const params = {
      ...param,
      cdn_file_name: filename,
      cdn_upload_dir: config.ORDER.cdn_upload_dir || param.cdn_upload_dir
    }
    inquirerHandle([
      {
        name: 'dir',
        message: '请输入CDN目录',
        type: 'input',
        when: () => !params.cdn_upload_dir
      }
    ], async ({ dir }) => {
      params.cdn_upload_dir = dir || '/'
      await devposNewUploadCDN(formData)
      await createPushTask(params)
      await rm.sync(`${process.cwd()}/${filename}`)
    })
  } catch (error) {
    console.log(chalk.red(error))
  }
}

/*
 * @Description: 轮询发布任务状态
 * @Author: lindingfeng
 * @Date: 2020-11-03 14:54:14
*/
const listeningStatus = async (params) => {
  try {
    const { list = [] } = await getNewTaskStatus(params.tag)
    const apply_publish_info = list.find(e => e.tag === params.tag);
    if (apply_publish_info) {
      const { status } = apply_publish_info
      const include_status = config.NO_LISTEN_NEW_STATUS_LIST.includes(Number(status))
      switch (Number(include_status)) {
        case 0:
          if (nowPublishStatus !== status) {
            nowPublishStatus = status
            sendNewDingTalk({ apply_info: { ...apply_publish_info } })
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
          sendNewDingTalk({ apply_info: { ...apply_publish_info } })
          break;
      }
    } else {
      throw new Error('未找到该tag的发布信息')
    }
  } catch (error) {
    console.log(chalk.red(error))
  }
}

const createTask = async (key) => {
  if (key) {
    await setConfigByAppKey(key)
  }
  getUserAppListInfo()
}

module.exports = createTask