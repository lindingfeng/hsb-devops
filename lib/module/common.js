const { getAppInfoByKey } = require('../http');
const { setAppOrderInfo } = require('../../config');
const { setUserInfo } = require('../user')

const setConfigByAppKey = async (key) => {
  return new Promise(async (resolve, reject) => {
    try {
      const info = await getAppInfoByKey(key)
      if (info.list.length) {
        const data = {
          ...info.list[0]
        }
        const loginData = {
          SYSTEM_ID: '44',
          USERNAME: data.amc_user || '',
          PASSWORD: data.amc_pass || ''
        }
        const dingTalk = {
          url: data.dingTalk_url || ''
        }
        const tinify = {
          KEY: data.third_key || ''
        }
        if (data.ft_tl && data.ft_te) {
          data.TL_ID = data.ft_tl.split(',')[0]
          data.TL = data.ft_tl.split(',')[1]
          data.TE = {
            [data.ft_te.split(',')[0]]: data.ft_te.split(',')[1]
          }
        }
        setAppOrderInfo({ key: 'ORDER', value: data })
        setAppOrderInfo({ key: 'USER', value: loginData })
        setAppOrderInfo({ key: 'successDing', value: dingTalk })
        setAppOrderInfo({ key: 'TINIFY', value: tinify })
        if (loginData.USERNAME && loginData.PASSWORD) {
          await setUserInfo()
          resolve()
        } else {
          reject('登录失败')
        }
      } else {
        reject('未找到密钥对应的数据')
      }
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = {
  setConfigByAppKey
}