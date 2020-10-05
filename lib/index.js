// const { program } = require('commander');
// const readline = require('readline');
const chalk = require('chalk')
const { loginByAMC } = require('./login');
const { getUserInfo, getFtList, getIterations } = require('./http');
const { inquirerHandle } = require('./utils');
const { getAllTag, getTagList, getNewestTag } = require('./tag');

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
const chooseFt = async () => {
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
    default: '21923671', //  默认自有平台
    pageSize: 5
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
    pageSize: 5
  }], async (answer) => {
    // console.log('answer: ', answer)
    getTagInfo()
  })
}

const getTagInfo = async () => {
  try {
    await getAllTag()
    const tagList = await getTagList()
    if (tagList) {
      const newestTag = await getNewestTag()
      console.log('最新tag: ', newestTag)
    } else {
      console.log(chalk.red('没有打过tag'))
    }
  } catch (error) {
    console.log(chalk.red(error))
    process.exit(1)
  }
}

/*
 * @Description: 开始执行
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-03 18:50:22
*/
const startTasks = async () => {
  try {
    const loginInfo = await loginByAMC()
    setGlobalData('loginInfo', loginInfo)
    const userInfo = await getUserInfo(loginInfo)
    setGlobalData('userInfo', userInfo)
    await chooseFt()
  } catch (error) {
    if (typeof error === 'string') {
      console.log(chalk.red(error))
    } else {
      console.log(chalk.red(JSON.stringify(error)))
    }
    process.exit(1)
  }
}

module.exports = {
  startTasks
}