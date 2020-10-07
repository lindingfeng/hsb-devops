const { inquirerHandle } = require('../utils');
const { config } = require('../../config');

const baseFeatrue = (callBack) => {
  inquirerHandle([{
    name: 'id',
    message: '请选择所需功能',
    type: 'list',
    choices: [...config.BASE_LIST],
    pageSize: config.COMMAND_LINE
  }], async (answer) => {
    callBack && callBack(answer)
  })
}

module.exports = {
  baseFeatrue
}