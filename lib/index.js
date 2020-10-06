// const { program } = require('commander');
// const readline = require('readline');
const chalk = require('chalk')
const ora = require('ora');
const { loginByAMC } = require('./login');
const { getUserInfo, getFtList, getIterations } = require('./http');
const { inquirerHandle, compressFile, getNextTag, getGitWorkDirectory } = require('./utils');
const { getAllTag, getTagList, getNewestTag } = require('./tag');
const config = require('../config');

const store = {
  hsbDevopsConfig: {},
  loginInfo: {},
  userInfo: {},
  ftList: [],
  iterations: []
}

// console.log('cmd path1: ', path.resolve('./'))
// console.log('cmd path2: ', process.cwd())

// program.version('0.0.1', '-v, --version')
// .option('-d, --debug', 'output extra debugging')
// .option('-s, --small', 'small pizza size')
// .option('-p, --pizza-type <type>', 'flavour of pizza')
// .parse(process.argv);
// if (program.debug) console.log(program.opts());

const setGlobalData = (key, data) => {
  store[key] = data
}

/*
 * @Description: 选择所属FT
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-03 18:37:29
*/
const chooseFtList = async () => {
  const { loginInfo } = store
  const ftList = await getFtList(loginInfo)
  setGlobalData('ftList', ftList)
  if (!ftList.length) return
  ftList.forEach(e => { e.name = e.ftname, e.value = e.ftid });
  inquirerHandle([{
    name: 'ftid', // answer的key
    message: '请选择所属FT', // question标题
    type: 'list',
    choices: [...ftList],
    default: config.DEFAULT_ZY_FTID, //  默认自有平台
    pageSize: config.COMMAND_LINE
  }], async (answer) => {
    const { ftid } = answer || {}
    ftid && chooseFtIteration(ftid)
  })
}

/*
 * @Description: 选择FT对应的迭代
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-03 18:39:18
*/
const chooseFtIteration = async (ftid = '') => {
  const { loginInfo } = store
  const iterations = await getIterations(loginInfo, ftid)
  setGlobalData('iterations', iterations)
  if (!iterations.length) return
  iterations.forEach(e => { e.name = e.name, e.value = e.id });
  inquirerHandle([{
    name: 'id', // answer的key
    message: '请选择所属迭代', // question标题
    type: 'list',
    choices: [...iterations],
    pageSize: config.COMMAND_LINE
  }], async () => {
    chooseVersionScope()
  })
}

/*
 * @Description: 选择版本影响范围
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-03 18:39:18
*/
const chooseVersionScope = async (ftid = '') => {
  inquirerHandle([{
    name: 'vid', // answer的key
    message: '请选择版本迭代', // question标题
    type: 'list',
    choices: [...config.VERSION_SCOPE],
    pageSize: config.COMMAND_LINE
  }], async (answer) => {
    getTagInfo(answer.vid)
  })
}

/*
 * @Description: 查找当前最新tag
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-05 19:29:23
*/
const getTagInfo = async (vid = 2) => {
  try {
    const spinner = ora('正在拉取最新tag, 请稍后...');
    spinner.start()
    await getAllTag()
    spinner.stop()
    const tagList = await getTagList()
    let newestTag = ''
    if (tagList) {
      newestTag = await getNewestTag()
    }
    const nextTag = getNextTag(newestTag, vid)
    setTagForCommit(nextTag)
  } catch (error) {
    spinner.stop()
    console.log(chalk.red(error))
    process.exit(1)
  }
}

const setTagForCommit = async (tag) => {
  const workDirStatus = await getGitWorkDirectory()
  console.log(chalk.red(workDirStatus))
}

/*
 * @Description: 执行压缩操作
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-05 20:07:59
*/
const compressHandle = async (path, dir_name, type) => {
  try {
    const spinner = ora('正在执行压缩处理, 请稍后...');
    spinner.start()
    const res = await compressFile(path, dir_name, type)
    setTimeout(() => {
      spinner.stop()
      console.log(chalk.green(`${res.status}: ${res.path}`))
    }, 1000)
  } catch (error) {
    spinner.stop()
    console.log(chalk.red('压缩失败: ', JSON.stringify(error)))
  }
}

/*
 * @Description: 获取压缩文件信息
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-05 20:08:44
*/
const rqCompressInfo = () => {
  inquirerHandle([...config.COMPRESS_TEMPLATE_LIST], async (answer) => {
    const { path, dir_name, type } = answer || {}
    compressHandle(path, dir_name, type)
  })
}

/*
 * @Description: 开始执行
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-03 18:50:22
*/
const start = async (id) => {
  try {
    setTagForCommit()
    // if (![4].includes(id)) {
    //   const loginInfo = await loginByAMC()
    //   setGlobalData('loginInfo', loginInfo)
    //   const userInfo = await getUserInfo(loginInfo)
    //   setGlobalData('userInfo', userInfo)
    // }
    // switch (id) {
    //   case 1:
    //     chooseFtList()
    //     break;
    //   case 2:
    //     console.log(chalk.green('功能开发中，敬请期待...'))
    //     break;
    //   case 3:
    //     console.log(chalk.green('功能开发中，敬请期待...'))
    //     break;
    //   case 4:
    //     if (config.COMPRESS && Object.keys(config.COMPRESS).length) {
    //       compressHandle(
    //         config.COMPRESS.PATH,
    //         config.COMPRESS.DIR_NAME,
    //         config.COMPRESS.TYPE
    //       )
    //     } else {
    //       rqCompressInfo()
    //     }
    //     break;
    //   default:
    //     chooseFtList()
    //     break;
    // }
  } catch (error) {
    if (typeof error === 'string') {
      console.log(chalk.red(error))
    } else {
      console.log(chalk.red(JSON.stringify(error)))
    }
    process.exit(1)
  }
}

const run = () => {
  inquirerHandle([{
    name: 'id', // answer的key
    message: '请选择所需功能', // question标题
    type: 'list',
    choices: [...config.BASE_LIST],
    pageSize: config.COMMAND_LINE
  }], async (answer) => {
    const { id } = answer
    id && start(id)
  })
}

module.exports = {
  start,
  run
}