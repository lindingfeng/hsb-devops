const { execCommand } = require('./exec')

const getAllTag = () => {
  return new Promise((resolve, reject) => {
    execCommand('git fetch --tags').then(res => {
      resolve(res.trim())
    }).catch(err => {
      reject(err)
    })
  })
}

const getTagList = () => {
  return new Promise((resolve, reject) => {
    execCommand('git tag -l').then(res => {
      resolve(res.trim())
    }).catch(err => {
      reject(err)
    })
  })
}

const getNewestTag = () => {
  return new Promise((resolve, reject) => {
    execCommand('git describe --tags `git rev-list --tags --max-count=1`').then(res => {
      resolve(res.trim())
    }).catch(err => {
      reject(err)
    })
  })
}

module.exports = {
  getAllTag,
  getTagList,
  getNewestTag
}