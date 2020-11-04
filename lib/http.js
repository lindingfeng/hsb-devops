const chalk = require('chalk');
const request = require('request')
const { getData } = require('./store')
const { config } = require('../config');

const commonRequest = ({
  reqVersion = '3.0.0',
  host,
  url,
  data = {},
  method = 'post',
}) => {
  return new Promise((resolve, reject) => {
    const { login_token, user_id } = getData('loginInfo') || {}
    if (!login_token || !user_id) {
      console.log(chalk.red('未登录'))
      return
    }
    request[method](`${host || config.DEVOPS_PROD_HOST}${url}`, {
      body: {
        _head: {
          _version: reqVersion,
          _msgType: config.MSG_TYPE,
          _remark: config.REMARK,
          _timestamps: config.TIMESTAMPS
        },
        _param: {
          ...data,
          token: login_token,
          uid: user_id
        }
      },
      json: true
    }, (err, res, data) => {
      if (err) {
        return reject(err)
      }
      if (data && data._data && +data._data._errCode === 0) {
        resolve(data._data.retData)
      } else {
        reject(((data || {})._data || {})._errStr)
      }
    })
  })
}

const jkCommonRequest = ({
  url,
  data = {},
  method = 'post'
}) => {
  return new Promise((resolve, reject) => {
    request[method](`${config.JK_HOST}${url}`, {
      body: {
        ...data
      },
      json: true
    }, (err, res, data) => {
      if (err) {
        return reject(err)
      }
      if (+data.code === 0) {
        resolve(data.data)
      } else {
        reject(data.msg)
      }
    })
  })
}

const getAppInfoByKey = (key) => jkCommonRequest({
  url: 'getAppListByKey',
  method: 'get',
  data: {
    app_key: key
  }
})

/*
 * @Description: 发送钉钉消息
 * @Author: lindingfeng
 * @Date: 2020-10-14 16:38:34
*/
const sendDingTalk = ({ url, at = [], apply_info = {} }) => {
  const { phone = '' } = getData('userInfo') || {}
  const { app_type, app_name, tag, proposer, status_desc, publish_desc } = apply_info
  const apply_app_type = `\n- 应用类型: **${config.APP_TYPE_LIST[app_type] || '-'}**`
  const apply_app_name = `\n- 应用名称: **${app_name || '-'}**`
  const apply_tag = `\n- 发布tag: **${tag || '-'}**`
  const apply_name = `\n- 提交人员: **${proposer || '-'}**`
  const apply_publish_desc = `\n- 发版描述: **${publish_desc || '-'}**`
  const apply_status_desc = `\n- 工单状态: **${status_desc || '-'}**`
  const dingtalkUrl = url || config.successDing.url
  console.log(`${apply_app_type}${apply_app_name}${apply_tag}${apply_name}${apply_publish_desc}${apply_status_desc}`)
  if (!dingtalkUrl) return
  request.post(dingtalkUrl, {
    header: {
      'Content-Type': 'application/json'
    },
    json: true,
    body: {
      msgtype: 'markdown',
      markdown: {
        title: '来活了老板',
        text: `## devops-prod @${phone} ${apply_app_name}${apply_app_type}${apply_tag}${apply_name}${apply_publish_desc}${apply_status_desc}`
      },
      at: {
        atMobiles: [phone],
        isAtAll: false
      }
    }
  })
}

const sendNewDingTalk = ({ url, at = [], apply_info = {} }) => {
  const { phone = '' } = getData('userInfo') || {}
  const { app_name, tag, publish_user, status_desc, publish_desc } = apply_info
  const apply_app_name = `\n- 应用名称: **${app_name || '-'}**`
  const apply_tag = `\n- 发布tag: **${tag || '-'}**`
  const apply_name = `\n- 提交人员: **${publish_user || '-'}**`
  const apply_publish_desc = `\n- 发布描述: **${publish_desc || '-'}**`
  const apply_status_desc = `\n- 任务状态: **${status_desc || '-'}**`
  const dingtalkUrl = url || config.successDing.url
  console.log(`${apply_app_name}${apply_tag}${apply_name}${apply_publish_desc}${apply_status_desc}`)
  if (!dingtalkUrl) return
  request.post(dingtalkUrl, {
    header: {
      'Content-Type': 'application/json'
    },
    json: true,
    body: {
      msgtype: 'markdown',
      markdown: {
        title: '来活了老板',
        text: `## devops-new @${phone} ${apply_app_name}${apply_tag}${apply_name}${apply_publish_desc}${apply_status_desc}`
      },
      at: {
        atMobiles: [phone],
        isAtAll: false
      }
    }
  })
}


/*
 * @Description: 获取用户信息
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-03 17:16:06
 */
const getUserInfo = () => commonRequest({ url: 'gateway/get_user_info' })

/*
 * @Description: 获取FT列表
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-03 17:16:22
 */
const getFtList = () => commonRequest({ url: 'gateway/get_ft_list' })

/*
 * @Description: 获取FT所属迭代
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-03 18:36:29
 */
const getIterations = (ftid) => commonRequest({
  url: 'gateway/get_iteration',
  data: {
    ftid
  }
})

/*
 * @Description: 获取应用服务器信息(app_name)
 * @Author: lindingfeng
 * @Date: 2020-10-12 17:56:56
*/
const getServerInfoByAppName = (app_name) => commonRequest({
  url: 'gateway/get_server_list_by_app_name',
  data: {
    app_name
  }
})

/*
 * @Description: 获取应用服务器信息(app_uid)
 * @Author: lindingfeng
 * @Date: 2020-10-12 17:56:56
*/
const getServerInfoByAppId = (app_uid) => commonRequest({
  reqVersion: config.VERSION_2,
  host: config.DEVOPS_NEW_HOST,
  url: 'gateway/get_server_list_by_app_id',
  data: {
    app_uid
  }
})

/*
 * @Description: 获取应用对应的TL、TE、PO
 * @Author: lindingfeng
 * @Date: 2020-10-12 18:40:51
*/
const getAppNameLeader = (ftid) => commonRequest({
  url: 'gateway/get_ft_relation_users',
  data: {
    ftid
  }
})

/*
 * @Description: devpos-new获取应用列表
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-11 16:45:14
 */
const getUserAppList = () => commonRequest({
  reqVersion: config.VERSION_2,
  host: config.DEVOPS_NEW_HOST,
  url: 'gateway/get_app_list',
  data: {
    filter: 0,
    key_word: '',
    page_index: 1,
    page_size: 100,
    status: 1
  }
})

/*
 * @Description: 搜索指定应用
 * @Author: lindingfeng
 * @Date: 2020-10-13 14:23:03
*/
const getAppInfoByKeyword = (app_name) => commonRequest({
  url: 'gateway/get_app_name_list',
  data: {
    app_name
  }
})

/*
 * @Description: 获取应用发布状态
 * @Author: lindingfeng
 * @Date: 2020-10-14 18:17:10
*/
const getTaskStatus = (key_word) => commonRequest({
  url: 'gateway/get_publish_task_list',
  data: {
    key_word
  }
})

/*
 * @Description: 
 * @Author: lindingfeng
 * @Date: 2020-11-03 14:44:02
*/
const getNewTaskStatus = (key_word) => commonRequest({
  reqVersion: config.VERSION_2,
  host: config.DEVOPS_NEW_HOST,
  url: 'gateway/get_publish_task_list',
  data: {
    key_word
  }
})

/*
 * @Description: devpos-new创建任务
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-11 16:45:51
 */
const devposNewCreateTask = (params) => commonRequest({
  reqVersion: config.VERSION_2,
  host: config.DEVOPS_NEW_HOST,
  url: 'gateway/add_publish_task',
  data: {
    ...params
  }
})

/*
 * @Description: devpos-prod创建任务
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-11 16:45:51
 */
const devposProdCreateTask = (params) => commonRequest({
  url: 'gateway/add_publish_task',
  data: params
})

/*
 * @Description: devpos-new创建CDN任务
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-11 16:45:51
 */
const devposNewUploadCDN = (formData) => {
  return new Promise((resolve, reject) => {
    request.post({
      url: `${config.DEVOPS_NEW_HOST}gateway/upload_cdn`,
      formData,
      json: true
    }, (err, res, data) => {
      if (err) {
        reject(err)
        return
      }
      if (data && data.result) {
        resolve()
        return
      }
      reject(data.info)
    })
  })
}

// const test = {
//   app_uid: "app-53542e6c6b9",
//   cdn_file_name: "lindf.zip",
//   cdn_upload_dir: "/static/test",
//   cfg_file_name: "",
//   gray_publish_flag: "0",
//   publish_desc: "test",
//   publish_server_uid_set: "",
//   publish_time: "",
//   publish_type: "0",
//   rolling_flag: "0",
//   tag: "",
//   token: "8e35244c666683a12f775e40f51b1c2e",
//   uid: "1845"
// }

module.exports = {
  commonRequest,
  sendDingTalk,
  sendNewDingTalk,
  getUserInfo,
  getFtList,
  getIterations,
  getServerInfoByAppName,
  getServerInfoByAppId,
  getAppNameLeader,
  getUserAppList,
  getAppInfoByKeyword,
  getTaskStatus,
  getNewTaskStatus,
  devposNewCreateTask,
  devposProdCreateTask,
  devposNewUploadCDN,
  getAppInfoByKey
}