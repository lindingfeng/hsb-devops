const { execCommand } = require('./exec')
const { setNewVersion, getFullDate, getCurrentBranch } = require('./utils');
const config = require('../config')

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

/*
 * @Description: 更新tag
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-05 23:04:52
*/
const getNextTag = (tagName = '', vid = 2) => {
  // const tagName = 'ka.huishoubao.com.dist_v1.9.8_20200909'
  let newTag = ''
  const re = /_v\d+\.\d+\.\d+_[0-9]{8}/g;
  if (re.test(tagName)) {
    const versionRe = /\d+\.\d+\.\d+/g
    const dateRe = /_[0-9]{8}$/g
    const versionStr = tagName.match(versionRe).join(',')
    const newVersionStr = setNewVersion(versionStr, vid)
    // console.log(tagName, versionStr, vid, newVersionStr)
    newTag = tagName.replace(versionRe, newVersionStr).replace(dateRe, `_${getFullDate()}`)
  } else {
    newTag = `${config.ORDER.app_name}_v${setNewVersion('0.0.0', vid)}_${getFullDate()}`
  }
  return newTag
}

/*
 * @Description: 打入最新tag
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-06 15:20:48
*/
const setNewTagAndPush = async (tag, desc, success, fail) => {
  try {
    await execCommand('git add .')
    await execCommand(`git commit --allow-empty -m "${desc || config.DESC}"`)
    await execCommand(`git tag -a ${tag} -m "${desc || config.DESC}"`)
    const currentBranch = await getCurrentBranch()
    await execCommand(`git push origin ${currentBranch}:dev_${tag}`)
    await execCommand(`git push origin ${tag}`)
    success && success()
  } catch (error) {
    fail && fail(error)
  }
}

/*
 * @Description: 批量删除指定regex的tag
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-06 16:01:05
*/
const delRegexTags = async (regex, success, fail) => {
  try {
    const res = await execCommand(`git tag | awk '/${regex}/' | xargs git tag -d`)
    success && success('删除成功: ', res)
  } catch (error) {
    fail && fail('删除失败: ', error)
  }
}

module.exports = {
  getAllTag,
  getTagList,
  getNewestTag,
  getNextTag,
  setNewTagAndPush,
  delRegexTags
}