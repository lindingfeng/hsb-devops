const fs = require('fs');

const config = {
  AMC_LOGIN_HOST: 'http://api-amc.huishoubao.com.cn/login',
  AMC_API_HOST: 'api-amc.huishoubao.com.cn',
  DEVOPS_PROD_HOST: 'http://devops-prod.huishoubao.com/',
  DEVOPS_NEW_HOST: 'http://devops-new.huishoubao.com/',
  UPLOAD_FILE_HOST: 'http://mobile.huishoubao.com/common/upload/uploadFileToTencentCould',
  VERSION_2: '2.0.0',
  VERSION_3: '3.0.0',
  MSG_TYPE: 'request',
  REMARK: '',
  TIMESTAMPS: '',
  DEFAULT_ZY_FTID: '21923671',
  COMMAND_LINE: 5,
  DESC: 'update something',
  FILTER_UPLOAD_RE: '\.(png|jpe?g|gif)(\?.*)?$',
  BASE_LIST: [
    { name: '提交发版工单 <devops-prod>', value: 1 },
    { name: '新建发布任务 <devops-new>', value: 2 },
    { name: '资源上传CDN', value: 3 },
    { name: '前端项目体检 <web-doctor>', value: 4 },
    { name: '图片无损压缩 <tinify>', value: 5 }
  ],
  VERSION_SCOPE: [
    { name: '大版本迭代', value: 0 },
    { name: '小功能迭代', value: 1 },
    { name: '优化迭代', value: 2 }
  ],
  TIPS_SCOPE: [
    { name: '已合并', value: 1 },
    { name: '还没，退出合并再来吧~', value: 2 }
  ],
  COMPRESS_TEMPLATE_LIST: [
    {
      name: 'type',
      message: '请选择压缩格式',
      type: 'list',
      choices: ['zip', 'tar']
    },
    {
      name: 'path',
      message: '请输入压缩文件路径(默认当前目录)',
      type: 'input'
    },
    {
      name: 'dir_name',
      message: '请输入压缩文件名称',
      type: 'input',
      validate: (res) => {
        if (!res) {
          return false
        }
        return true
      }
    }
  ]
}

const mergeHsbDevopsConfig = () => {
  return new Promise((resolve, reject) => {
    try {
      const projectRootDirConfigFile = `${process.cwd()}/hsb.devops.json`
      fs.accessSync(projectRootDirConfigFile, fs.constants.R_OK);
      let fileData = fs.readFileSync(projectRootDirConfigFile, { encoding: 'utf-8' })
      Object.assign(config, JSON.parse(fileData))
      resolve()
    } catch (err) {
      reject('项目更目录未发现hsb.devops.json配置文件')
    }
  })
}

module.exports = {
  config,
  mergeHsbDevopsConfig
}