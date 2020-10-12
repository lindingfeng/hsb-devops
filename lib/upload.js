const fs = require('fs')
const ora = require('ora');
const chalk = require('chalk')
const request = require('request')
const { inquirerHandle } = require('./utils');
const { config } = require('../config');

const loadSuccessFiles = []
const loadFailFiles = []

const uploadHandle = (filename, dir) => {
  return new Promise((resolve, reject) => {
    const formData = {
      user_file: {
        value: fs.createReadStream(`${process.cwd()}/${filename}`),
        options: {
          filename
        }
      }
    }
    request.post(`${config.UPLOAD_FILE_HOST}?dir=${dir}`, {
      formData,
      json: true
    }, (err, res, data) => {
      if (err) {
        return reject(err)
      }
      if (data && +data.errcode === 0) {
        resolve(data.data)
      } else {
        reject((data || {}).errmsg || '上传失败')
      }
    })
  })
}

const batchUploadFiles = async (cdnDir = '/', fileDir) => {
  const dirFiles = fs.readdirSync(`${process.cwd()}/${fileDir}`)
  const filterFiles = dirFiles.filter(v => /\.(html|css|js|png|jpe?g|gif|svg|mp4|webm|ogg|mp3|wav|flac|aac|woff2?|eot|ttf|otf)(\?.*)?$/.test(v))
  if (!filterFiles.length) {
    console.log(chalk.red('未发现可上传文件，请检查...'))
    console.log(chalk.green('html|css|js|png|jpe?g|gif|svg|mp4|webm|ogg|mp3|wav|flac|aac|woff2?|eot|ttf|otf'))
    return
  }
  const spinner = ora('正在上传CDN, 请稍后...');
  spinner.start()
  // 遍历上传文件
  for (let i = 0; i < filterFiles.length; i++) {
    try {
      const res = await uploadHandle(filterFiles[i], cdnDir)
      const url = res.access_url.replace(/s1-1251010403.file.myqcloud.com/, 's1.huishoubao.com').replace(/http:\/\//, 'https://');
      loadSuccessFiles.push(url)
    } catch (error) {
      loadFailFiles.push(url)
    }
  }
  spinner.stop()
  console.log(chalk.green('-- 上传成功列表 --'))
  console.log(chalk.green(loadSuccessFiles.join('\n')))
  if (loadFailFiles.length) {
    console.log(chalk.red('-- 上传失败列表 --'))
    console.log(chalk.red(loadFailFiles.join('\n')))
  }
}

const uploadFiles = (fileDir = '') => {
  inquirerHandle([{
    name: 'dir',
    message: '请输入上传目录(default: "/")',
    type: 'input'
  }], async (answer) => {
    batchUploadFiles(answer.dir || '/', fileDir)
  })
}

module.exports = {
  uploadFiles,
  batchUploadFiles
}