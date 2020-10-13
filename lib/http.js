const chalk = require('chalk');
const request = require('request')
const { getData } = require('./store')
const { config } = require('../config');

const commonRequest = ({
  reqVersion = '3.0.0',
  host,
  url,
  data = {},
  method = 'post'
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
 * @Description: 获取应用服务器信息
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
 * @Description: 描述
 * @Author: lindingfeng
 * @Date: 2020-10-13 14:23:03
*/
const getAppInfoByKeyword = (app_name) => commonRequest({
  url: 'gateway/get_app_last_publish_task',
  data: {
    app_name
  }
})

/*
 * @Description: devpos-new创建任务
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-11 16:45:51
 */
const devposNewCreateTask = () => commonRequest({
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
 * @Description: devpos-prod创建任务
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-11 16:45:51
 */
const devposProdCreateTask = (params) => commonRequest({
  url: 'gateway/add_publish_task',
  data: params
})

// const param = {
//   "app_name": "ka.huishoubao.com.dist",//
//   "iteration_id": "1121923671001001482",//
//   "iteration_name": "【免设】【免测】自有sprint 22",//
//   "TL": "羊年",//
//   "TL_ID": "1244",//
//   "publish_desc": "满加优化",//
//   "ftid": "21923671",//
//   "tag": "zy-hsbh5-auto-40",
//   "push_cdn_type": 1,
//   "cdn_upload_dir": "",
//   "test_server_uid_set": "server-53536e4c7a2",//
//   "production_server_uid_set": "server-53542129b36#server-535428567b4#server-5354287764d#server-53542bad4d0#server-53542e4cc26",//
//   "gray_publish_flag": 0,//
//   "rolling_flag": 0,//
//   "TE": {
//     "1319": "王忠宁",
//     "1845": "林定锋"
//   },//
//   "test_flag": 1,//
//   "publish_type": "",
//   "token": "3097e5962489a8227bd2d5a084e9533a",//
//   "uid": "1845",//


//   app_name: "app-test", // 应用名称
//   tag: "123456", // 	发布tag
//   iteration_id: "12345678", // 迭代id
//   test_server_uid_set: "srv-test1#srv-test2#srv-test3", // 测试环境服务器，多个已#分开
//   production_server_uid_set: "srv-prod1#srv-prod2#srv-prod3", // 生产环境服务器，多个已#分开
//   gray_publish_flag: 0, // 是否灰度
//   publish_desc: "123456", // 发版描述
//   cdn_file_name: "", // CDN文件名
//   cdn_upload_dir: "", // CDN上传路径
//   cfg_file_name: "", // 配置文件名
//   rolling_flag: 0, // 是否滚动发布
//   TE: "tester", // 测试人
//   TE_ID: 110, // 测试人ID
//   TL: "test", // TL
//   TL_ID: 110, // TL ID
//   test_flag: 1, // 是否需要测试
//   push_cdn_type: 0, // 前端发布时，cdn上传类型1: ‘不上传cdn’,2: ‘静态资源上传cdn’,3: ‘全上传cdn’
// }

module.exports = {
  commonRequest,
  getUserInfo,
  getFtList,
  getIterations,
  getServerInfoByAppName,
  getAppNameLeader,
  getUserAppList,
  getAppInfoByKeyword,
  devposNewCreateTask,
  devposProdCreateTask
}