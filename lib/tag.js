const { execCommand } = require('./exec')

const getAllTag = () => {
  return new Promise((resolve, reject) => {
    execCommand('git fetch --tags').then(res => {
      console.log('所有tag: ', res, res.trim().length)
      resolve(res.trim())
    }).catch(err => {
      console.log('获取所有tag失败: ', err)
      reject('拉取所有tag失败: ', err)
    })
  })
}

const getTagList = () => {
  return new Promise((resolve, reject) => {
    execCommand('git tag -l').then(res => {
      console.log('tag列表: ', res, res.trim().length)
      resolve(res.trim())
    }).catch(err => {
      console.log('获取tag列表失败: ', err)
      reject('获取tag列表失败: ', err)
    })
  })
}

const getNewestTag = () => {
  return new Promise((resolve, reject) => {
    execCommand('git describe --tags `git rev-list --tags --max-count=1`').then(res => {
      console.log('最新tag: ', res, res.trim().length)
      resolve(res.trim())
    }).catch(err => {
      console.log('获取最新tag失败: ', err)
      reject('获取最新tag失败: ', err)
    })
  })
}

module.exports = {
  getAllTag,
  getTagList,
  getNewestTag
}