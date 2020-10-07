const { setData } = require('./store')
const { loginByAMC } = require('./login');
const { getUserInfo } = require('./http');

const setUserInfo = () => {
  return new Promise(async (resolve, reject) => {
    try {
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