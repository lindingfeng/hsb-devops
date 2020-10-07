const { getData, setData } = require('../store')
const { getFtList, getIterations } = require('../http');
const { inquirerHandle } = require('../utils');
const { setTagInfo } = require('../tag')
const { config } = require('../../config');

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
  inquirerHandle([
    {
      name: 'vid', // answer的key
      message: '请选择版本迭代', // question标题
      type: 'list',
      choices: [...config.VERSION_SCOPE],
      pageSize: config.COMMAND_LINE
    },
    {
      name: 'desc',
      message: '请输入发版描述(将用于commit和发版描述)',
      type: 'input'
    }
  ], async (answer) => {
    const { vid, desc = '' } = answer
    const otherInfo = getData('otherInfo') || {}
    setData('otherInfo', { ...otherInfo, vid, desc })
    setTagInfo(vid)
  })
}

const applyOrder = () => chooseFtList()

module.exports = applyOrder