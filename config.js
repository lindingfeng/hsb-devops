const path = require('path');
const fs = require('fs');
const chalk = require('chalk')
const config = {
  AMC_LOGIN_HOST: 'http://api-amc.huishoubao.com.cn/login',
  AMC_API_HOST: 'api-amc.huishoubao.com.cn',
  version: '3.0.0',
  msgType: 'request',
  remark: '',
  timestamps: '',
  loginUrl: 'http://api-amc.huishoubao.com.cn/login',
  userInfoUrl: 'http://devops-prod.huishoubao.com/gateway/get_user_info',
  ftListUrl: 'http://devops-prod.huishoubao.com/gateway/get_ft_list',
  iterationsUrl: 'http://devops-prod.huishoubao.com/gateway/get_iteration'
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