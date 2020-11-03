const fs = require('fs');

const config = {
  AMC_LOGIN_HOST: 'http://api-amc.huishoubao.com.cn/login',
  AMC_API_HOST: 'api-amc.huishoubao.com.cn',
  DEVOPS_PROD_HOST: 'http://devops-prod.huishoubao.com/',
  DEVOPS_NEW_HOST: 'http://devops-new.huishoubao.com/',
  JK_HOST: 'http://jk.www.huishoubao.com/api/',
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
    // { name: '资源上传CDN', value: 3 },
    { name: '图片无损压缩 <tinify>', value: 3 }
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
  CDN_UPLOAD_LIST: [
    { name: '上传', value: true },
    { name: '不上传', value: false }
  ],
  DEVOPS_CDN_UPLOAD_LIST: [
    { name: '不上传CDN', value: 1 },
    { name: '静态资源上传CDN', value: 2 },
    { name: '全量上传CDN', value: 3 }
  ],
  PUBLISH_TYPE_LIST: [
    { name: '手动发版', value: 0 },
    { name: '现在发布', value: 1 }
  ],
  AUTO_TAG_LIST: [
    { name: '自动更新tag', value: 1 },
    { name: '构建后更新tag', value: 2 },
    { name: '已有tag, 不需要更新', value: 3 }
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
      validate: (res) => !!res
    }
  ],
  NO_LISTEN_PUBLISH_STATUS_LIST: [-1, 1, 4, 5, 8, 10, 11, 13, 14],
  PUBLISH_TAG_APPLY_STATUS_MAP: {
    '-1': '取消发布',
    '0': '编译中',
    '1': '编译失败',
    '2': '待检查',
    '3': '测试发版中',
    '4': '测试发版成功',
    '5': '测试发版失败',
    '6': '待测试',
    '7': '待发布',
    '8': '已退回',
    '9': '发布中',
    '10': '发布失败',
    '11': '已发布',
    '12': '回滚中',
    '13': '回滚失败',
    '14': '回滚成功'
  },
  APP_TYPE_LIST: {
    '1': 'C++',
    '2': 'PHP',
    '3': 'Python',
    '4': 'Others',
    '5': 'CDN',
    '6': 'Config',
    '7': 'thrift C++',
    '8': 'thrift PHP',
    '9': 'Andriod',
    '10': 'Front',
    '11': 'IOS'
  },
  NO_LISTEN_NEW_STATUS_LIST: [2, 3],
  DEVOPS_NEW_STATUS_MAP: {
    '0': '未发布',
    '1': '发布中',
    '2': '发布失败',
    '3': '发布成功'
  }
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
      reject('项目根目录未发现hsb.devops.json配置文件')
    }
  })
}

const setAppOrderInfo = (data) => {
  config[data.key] = data.value
}

module.exports = {
  config,
  mergeHsbDevopsConfig,
  setAppOrderInfo
}