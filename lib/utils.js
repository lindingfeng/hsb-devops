const fs = require('fs');
const inquirer = require('inquirer');
const archiver = require('archiver');
const { execCommand } = require('./exec')
const config = require('../config')

/*
 * @Description: 创建交互式命令
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-03 18:51:05
*/
const inquirerHandle = (questions, callBack, errCallBack) => {
  inquirer.prompt(questions).then(answers => {
    callBack && callBack(answers)
  })
  .catch(error => {
    errCallBack && errCallBack(error)
  });
}

/*
 * @Description: 压缩文件
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-05 17:25:10
*/
const compressFile = (compressFilePath, compressName, compressType = 'zip') => {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(`${process.cwd()}/${compressName||'hsbCompressFile'}.${compressType}`)
    const archive = archiver(compressType, { zlib: { level: 9 } })
    const stat = true
    archive.pipe(output)
    archive.directory(`${process.cwd()}/${compressFilePath}`, compressName)

    archive.on('warning', () => {
      stat = false
    });
    
    archive.on('error', () => {
      stat = false
    });

    output.on('close', () => {
      if (!stat) {
        return reject('压缩失败')
      }
      resolve({
        status: '压缩成功',
        path: `${process.cwd()}/${compressName||'hsbCompressFile'}.${compressType}`
      })
    });

    archive.finalize();
  })
}

/*
 * @Description: 年月日
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-05 23:04:34
*/
const getFullDate = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth()+1 > 9 ? date.getMonth()+1 : `0${date.getMonth()+1}`
  const day = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`
  return `${year}${month}${day}`
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
 * @Description: update version
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-05 23:08:24
*/
const setNewVersion = (versionStr, vid) => {
  let versionArr = versionStr.split('.')
  switch (vid) {
    case 0:
      versionArr[0] = Number(versionArr[0]) + 1
      versionArr[1] = 0
      versionArr[2] = 0
      break;
    case 1:
      versionArr[1] = Number(versionArr[1]) + 1
      versionArr[2] = 0
      break;
    default:
      versionArr[2] = Number(versionArr[2]) + 1
      break;
  }
  return versionArr.join('.')
}

/*
 * @Description: 获取当前所在分支名
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-05 21:49:06
*/
const getCurrentBranch = () => {
  return new Promise((resolve, reject) => {
    execCommand('git symbolic-ref --short -q HEAD').then(res => {
      console.log(res)
      resolve(res.trim())
    }).catch(err => {
      reject(err)
    })
  })
}

/*
 * @Description: 打入最新tag
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-06 15:20:48
*/
const getGitWorkDirectory = async (tag, desc) => {
  await execCommand('git add .')
  await execCommand(`git commit -m "${desc || config.DESC}"`)
  await execCommand(`git tag -a ${tag} -m "${desc || config.DESC}"`)
  return true
}

module.exports = {
  inquirerHandle,
  compressFile,
  getNextTag,
  getCurrentBranch,
  getGitWorkDirectory
}