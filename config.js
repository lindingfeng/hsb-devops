const path = require('path');
const fs = require('fs');
const chalk = require('chalk')
const config = {
  AMC_LOGIN_HOST: 'http://api-amc.huishoubao.com.cn/login',
  AMC_API_HOST: 'api-amc.huishoubao.com.cn',
  VERSION: '3.0.0',
  MSG_TYPE: 'request',
  REMARK: '',
  TIMESTAMPS: '',
  BASE_LIST: [
    { name: '提交发版工单 (devops-prod)', value: 1 },
    { name: '新建发布任务 (devops-new)', value: 2 },
    { name: '上传资源资源 (production)', value: 3 }
  ]
}

try {
  const projectRootDirConfigFile = path.resolve('./', 'hsb.devops.json')
  fs.accessSync(projectRootDirConfigFile, fs.constants.R_OK);
  let fileData = fs.readFileSync(projectRootDirConfigFile, { encoding: 'utf-8' })
  Object.assign(config, JSON.parse(fileData))
} catch (err) {
  console.log(chalk.red('缺少hsb.devops.json配置文件或文件不可读\n'));
  process.exit(1)
}

module.exports = config