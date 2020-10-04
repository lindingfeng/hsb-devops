const { execCommand } = require('./exec')

const getAllTag = () => {
  return new Promise((resolve, reject) => {
    execCommand('git fetch --tags').then(res => {
      resolve(res)
    }).catch(err => {
      reject('拉取远程tag失败: ', err)
    })
  })
}

const getTagList = () => {
  execCommand('git tag -l').then(res => {
    console.log('tag列表: ', res, typeof res)
  }).catch(err => {
    console.log('获取tag列表失败: ', err)
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
  getTagList,
  getNewestTag
}