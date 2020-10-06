const request = require('request')
const config = require('../config');

const commonRequest = (url, data, method = 'post') => {
  return new Promise((resolve, reject) => {
    request[method](`${config.USER.HOST}${url}`, {
      body: {
        _head: {
          _version: config.VERSION_3,
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
const getUserInfo = (loginInfo) => commonRequest('gateway/get_user_info', {
  token: loginInfo.login_token,
  uid: loginInfo.user_id
})

/*
 * @Description: 获取FT列表
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-03 17:16:22
*/
const getFtList = (loginInfo) => commonRequest('gateway/get_ft_list', {
  token: loginInfo.login_token,
  uid: loginInfo.user_id
})

/*
 * @Description: 获取FT所属迭代
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-03 18:36:29
*/
const getIterations = (loginInfo, ftid) => commonRequest('gateway/get_iteration', {
  ftid,
  token: loginInfo.login_token,
  uid: loginInfo.user_id
})

module.exports = {
  commonRequest,
  getUserInfo,
  getFtList,
  getIterations
}