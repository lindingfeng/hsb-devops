const path = require('path');
const fs = require('fs');
const request = require('request')
const { program } = require('commander');
const readline = require('readline');
const inquirer = require('inquirer');
const config = require('../config');

const store = {
  loginInfo: {},
  userInfo: {},
  ftList: [],
  iterations: []
}

console.log('dir path: ', path.resolve(__dirname))

// let fileData = fs.readFileSync(path.resolve(__dirname, 'package.json'), {
//   encoding: 'utf-8'
// })

// fileData = JSON.parse(fileData)
// console.log(path.resolve(__dirname), fileData)
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
 * @Description: AMC登录
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-03 15:32:13
 */
const loginByAMC = () => {
  const loginForm = {
    username: 'lindingfeng@huishoubao.com.cn',
    password: 'wsjj1994',
    jump_url: 'http://devops-prod.huishoubao.com/dist/index.html',
    system_id: '44'
  }
  return new Promise((resolve, reject) => {
    request.post(config.loginUrl, {
      form: loginForm,
      useQuerystring: true,
      json: true,
      headers: {
        Host: 'api-amc.huishoubao.com.cn'
      }
    }, (err, res, data) => {
      if (err) {
        reject(err)
        return
      }
      if (!data || !data.body || !data.body.data) {
        reject('Login fail . \nNo data')
        return
      }
      const body = data.body
      if (+body.ret !== 0) {
        reject(body.retinfo)
        return
      }
      resolve(body.data)
    })
  })
}

/*
 * @Description: 获取用户信息
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-03 17:16:06
*/
const getUserInfo = () => {
  const { login_token = '', user_id = '' } = store.loginInfo || {}
  const body = {
    _head: {
      _version: '3.0.0',
      _msgType: 'request',
      _remark: '',
      _timestamps: ''
    },
    _param: {
      token: login_token,
      uid: user_id
    }
  }
  if (!login_token || !user_id) return
  return new Promise((resolve, reject) => {
    request.post(config.userInfoUrl, {
      body,
      json: true
    }, (err, res, data) => {
      if (err) {
        reject(err)
        return
      }
      if (data && data._data && +data._data._errCode === 0) {
        resolve(data._data.retData || {})
      } else {
        reject(((data || {})._data || {})._errStr || '获取用户信息失败！')
      }
    })
  })
}

/*
 * @Description: 获取FT列表
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-03 17:16:22
*/
const getFtList = () => {
  const { login_token = '', user_id = '' } = store.loginInfo || {}
  const body = {
    _head: {
      _version: '3.0.0',
      _msgType: 'request',
      _remark: '',
      _timestamps: ''
    },
    _param: {
      token: login_token,
      uid: user_id
    }
  }
  if (!login_token || !user_id) return
  return new Promise((resolve, reject) => {
    request.post(config.ftListUrl, {
      body,
      json: true
    }, (err, res, data) => {
      if (err) {
        reject(err)
        return
      }
      if (data && data._data && +data._data._errCode === 0) {
        resolve(data._data.retData || {})
      } else {
        reject(((data || {})._data || {})._errStr || '获取FT列表失败！')
      }
    })
  })
}

/*
 * @Description: 获取FT所属迭代
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-03 18:36:29
*/
const getIterations = (ftid = '') => {
  const { login_token = '', user_id = '' } = store.loginInfo || {}
  const body = {
    _head: {
      _version: '3.0.0',
      _msgType: 'request',
      _remark: '',
      _timestamps: ''
    },
    _param: {
      ftid,
      token: login_token,
      uid: user_id
    }
  }
  if (!login_token || !user_id) return
  return new Promise((resolve, reject) => {
    request.post(config.iterationsUrl, {
      body,
      json: true
    }, (err, res, data) => {
      if (err) {
        reject(err)
        return
      }
      if (data && data._data && +data._data._errCode === 0) {
        resolve(data._data.retData || [])
      } else {
        reject(((data || {})._data || {})._errStr || '获取迭代列表失败！')
      }
    })
  })
}

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
 * @Description: 选择所属FT
 * @MethodAuthor:  lindingfeng
 * @Date: 2020-10-03 18:37:29
*/
const chooseFt = async () => {
  const ftList = await getFtList()
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
  const iterations = await getIterations(ftid)
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
    console.log('answer: ', answer)
  })
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
    const userInfo = await getUserInfo()
    setGlobalData('userInfo', userInfo)
    chooseFt()
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  startTasks
}