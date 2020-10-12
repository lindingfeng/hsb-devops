const request = require('request')
const { config } = require('../config');

const commonRequest = ({ reqVersion = '3.0.0', host, url, data, method = 'post' }) => {
  return new Promise((resolve, reject) => {
    request[method](`${host || config.DEVOPS_PROD_HOST}${url}`, {
      body: {
        _head: {
          _version: reqVersion,
          _msgType: config.MSG_TYPE,
          _remark: config.REMARK,
          _timestamps: config.TIMESTAMPS
        },
        _param: {
          ...data
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
const getUserInfo = (loginInfo) => commonRequest({ url: 'gateway/get_user_info', data: {
  token: loginInfo.login_token,
  uid: loginInfo.user_id
}})

/*
 * @Description: 获取FT列表
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-03 17:16:22
*/
const getFtList = (loginInfo) => commonRequest({ url: 'gateway/get_ft_list', data: {
  token: loginInfo.login_token,
  uid: loginInfo.user_id
}})

/*
 * @Description: 获取FT所属迭代
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-03 18:36:29
*/
const getIterations = (loginInfo, ftid) => commonRequest({ url: 'gateway/get_iteration', data: {
  ftid,
  token: loginInfo.login_token,
  uid: loginInfo.user_id
}})

/*
 * @Description: devpos-new获取应用列表
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-11 16:45:14
*/
const getUserAppList = (loginInfo) => commonRequest({
  reqVersion: config.VERSION_2,
  host: config.DEVOPS_NEW_HOST,
  url: 'gateway/get_app_list',
  data: {
    filter: 0,
    key_word: '',
    page_index: 1,
    page_size: 100,
    status: 1,
    token: loginInfo.login_token,
    uid: loginInfo.user_id
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
    status: 1,
    token: loginInfo.login_token,
    uid: loginInfo.user_id
  }
})

/*
 * @Description: devpos-prod创建任务
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-11 16:45:51
*/
const devposProdCreateTask = () => commonRequest({ url: 'gateway/get_iteration', data: {
  ftid,
  token: loginInfo.login_token,
  uid: loginInfo.user_id
}})

module.exports = {
  commonRequest,
  getUserInfo,
  getFtList,
  getIterations,
  getUserAppList,
  devposNewCreateTask,
  devposProdCreateTask
}