const { execCommand } = require('./exec')

const getNewestTag = () => {
  execCommand('git describe --tags `git rev-list --tags --max-count=1`').then(res => {
    console.log('最新tag: ', res, res.trim().length)
  }).catch(err => {
    console.log('获取最新tag失败: ', err)
  })
}

module.exports = {
  getNewestTag
}