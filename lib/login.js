const chalk = require('chalk')
const request = require('request')
const { config } = require('../config');

/*
 * @Description: AMC登录
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-03 15:32:13
 */
const loginByAMC = () => {
  const loginForm = {
    username: config.USER.USERNAME,
    password: config.USER.PASSWORD,
    system_id: config.USER.SYSTEM_ID || '44'
  }
  return new Promise((resolve, reject) => {
    request.post(config.AMC_LOGIN_HOST, {
      form: loginForm,
      useQuerystring: true,
      json: true,
      headers: {
        Host: config.AMC_API_HOST
      }
    }, (err, res, data) => {
      if (err) {
        return reject(err)
      }
      if (!data || !data.body || !data.body.data) {
        return reject('登录失败！')
      }
      const body = data.body
      if (+body.ret !== 0) {
        return reject(body.retinfo)
      }
      resolve(body.data)
    })
  })
}

module.exports = {
  loginByAMC
}