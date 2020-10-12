const { getData, setData } = require('../store')
const { getFtList, getIterations, devposProdCreateTask } = require('../http');
const { inquirerHandle } = require('../utils');
const { setTagInfo } = require('../tag')
const { config } = require('../../config');
const chalk = require('chalk');

const publishInfo = {}

/*
 * @Description: 选择所属FT
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-03 18:37:29
*/
const chooseFtList = async () => {
  const loginInfo = getData('loginInfo') || {}
  const ftList = await getFtList(loginInfo)
  setData('ftList', ftList)
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
    Object.assign(publishInfo, { ftid })
    ftid && chooseFtIteration(ftid)
  })
}

/*
 * @Description: 选择FT对应的迭代
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-03 18:39:18
*/
const chooseFtIteration = async (ftid = '') => {
  const loginInfo = getData('loginInfo') || {}
  const iterations = await getIterations(loginInfo, ftid)
  setData('iterations', iterations)
  if (!iterations.length) return
  iterations.forEach(e => { e.name = e.name, e.value = e.id });
  inquirerHandle([{
    name: 'id', // answer的key
    message: '请选择所属迭代', // question标题
    type: 'list',
    choices: [...iterations],
    pageSize: config.COMMAND_LINE
  }], async ({ id }) => {
    Object.assign(publishInfo, { id })
    chooseVersionScope()
  })
}

/*
 * @Description: 选择版本影响范围
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-03 18:39:18
*/
const chooseVersionScope = async (ftid = '') => {
  inquirerHandle([
    {
      name: 'need_tag',
      message: '请选择是否需要打tag',
      type: 'list',
      choices: [...config.NEED_TAG_LIST],
      pageSize: config.COMMAND_LINE
    },
    {
      name: 'vid',
      message: '请选择版本迭代',
      type: 'list',
      choices: [...config.VERSION_SCOPE],
      pageSize: config.COMMAND_LINE,
      when: ({ need_tag }) => {
        return need_tag
      }
    },
    {
      name: 'c_tag',
      message: '请选择发版的tag',
      type: 'input',
      validate: (res) => {
        if (!res) {
          return false
        }
        return true
      },
      when: ({ need_tag }) => {
        return !need_tag
      }
    },
    {
      name: 'desc',
      message: '请输入发版描述(将用于commit和发版描述)',
      type: 'input'
    }
  ], async (answer) => {
    const { need_tag, c_tag = '', vid = 2, desc = '' } = answer
    const otherInfo = getData('otherInfo') || {}
    setData('otherInfo', { ...otherInfo, need_tag, vid, desc })
    need_tag && setTagInfo(vid, (originBranchName, tag) => {
      console.log(chalk.green('branch:', originBranchName))
      console.log(chalk.green('tag:', tag))
      // 开始创建工单
      // devposProdCreateTask()
      console.log('开始创建工单...')
    })
  })
}

const applyOrder = () => chooseFtList()

module.exports = applyOrder