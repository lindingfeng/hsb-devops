const { setData } = require('./store')
const { loginByAMC } = require('./login');
const { getUserInfo } = require('./http');
const { config } = require('../config');

const setUserInfo = () => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!config.USER.USERNAME || !config.USER.PASSWORD) {
        throw new Error('缺少登录所需信息')
      }
      const loginInfo = await loginByAMC()
      setData('loginInfo', loginInfo)
      const userInfo = await getUserInfo(loginInfo)
      setData('userInfo', userInfo)
      resolve()
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = {
  setUserInfo
}