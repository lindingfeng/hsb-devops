const ora = require('ora');
const chalk = require('chalk');
const { getData } = require('./store')
const { execCommand } = require('./exec')
const { setNewVersion, getFullDate, getCurrentBranch } = require('./utils');
const { config } = require('../config');

/*
 * @Description: 拉取远程的tag
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-07 16:09:41
*/
const getAllTag = () => {
  return new Promise((resolve, reject) => {
    execCommand('git fetch --tags').then(res => {
      resolve(res.trim())
    }).catch(err => {
      reject(err)
    })
  })
}

/*
 * @Description: 获取tag列表
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-07 16:09:11
*/
const getTagList = () => {
  return new Promise((resolve, reject) => {
    execCommand('git tag -l').then(res => {
      resolve(res.trim())
    }).catch(err => {
      reject(err)
    })
  })
}

/*
 * @Description: 获取最新的tag
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-07 16:08:52
*/
const getNewestTag = () => {
  return new Promise(async (resolve, reject) => {
    try {
      // 获取最新的tag的commit
      const prevTag = await execCommand('git rev-list --tags --max-count=1')
      if (prevTag) {
        // 获取最新的commit的tag名
        const newsTag = await execCommand(`git describe --tags ${prevTag}`)
        return resolve(newsTag.trim())
      }
      return resolve(prevTag)
    } catch (err) {
      reject(err)
    }
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
    const versionName = /v\d+\.\d+\.\d+_[0-9]{8}/.exec(tag)
    const originBranchName = `dev_${versionName ? versionName[0] : tag}`
    await execCommand(`git push origin ${currentBranch}:${originBranchName}`)
    await execCommand(`git push origin ${tag}`)
    success && success(originBranchName, tag)
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

/*
 * @Description: 查找当前最新tag
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-05 19:29:23
*/
const setTagInfo = async (vid = 2, success) => {
  const spinner = ora('正在拉取最新tag, 请稍后...');
  spinner.start()
  try {
    await getAllTag()
    spinner.stop()
    const tagList = await getTagList()
    let newestTag = ''
    if (tagList) {
      newestTag = await getNewestTag()
    }
    const nextTag = getNextTag(newestTag, vid)
    nextTag && setTagForCommit(nextTag, success)
  } catch (error) {
    spinner.stop()
    console.log(chalk.red(error))
  }
}

/*
 * @Description: 写入最新的tag并push
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-06 16:26:37
*/
const setTagForCommit = async (tag, success) => {
  const { desc } = getData('otherInfo') || {}
  const spinner = ora('正在写入最新的tag并push, 请稍后...');
  spinner.start()
  setNewTagAndPush(tag, desc, (originBranchName, tag) => {
    spinner.stop()
    success && success(originBranchName, tag)
  }, (err) => {
    spinner.stop()
    console.log(chalk.red('tag更新失败: ', err))
  })
}

module.exports = {
  getAllTag,
  getTagList,
  getNewestTag,
  getNextTag,
  setNewTagAndPush,
  delRegexTags,
  setTagInfo,
  setTagForCommit
}