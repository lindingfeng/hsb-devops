const { execCommand } = require('./exec')

const getAllTag = () => {
  execCommand('git fetch --tags').then(res => {
    console.log('所有tag: ', res, res.trim().length)
  }).catch(err => {
    console.log('获取所有tag失败: ', err)
  })
}

const getNewestTag = () => {
  execCommand('git describe --tags `git rev-list --tags --max-count=1`').then(res => {
    console.log('最新tag: ', res, res.trim().length)
  }).catch(err => {
    console.log('获取最新tag失败: ', err)
  })
}

module.exports = {
  getAllTag,
  getNewestTag
}