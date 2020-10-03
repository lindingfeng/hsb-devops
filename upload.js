const request = require('request')
const path = require('path')
const fs = require('fs')
const archiver = require('archiver')

// request.debug = true
const argv = process.argv
if (!argv[2] || !argv[3] || !argv[4]) {
  console.log('缺少必要参数')
  process.exit(1);
}

const projectName = argv[2]
const zipFileName = argv[3]
const tag = argv[4]
const zipFile = path.join(__dirname, `../${zipFileName}`)

const loginAMC = () => {
  const amcURL = 'http://139.199.164.232/login'
  // const amcURL = 'http://api-amc.huishoubao.com.cn/login'
  const loginForm = {
    username: 'yangnian@huishoubao.com.cn',
    password: 'ab995f46',
    jump_url: 'http://devops-new.huishoubao.com/dist/index.html',
    system_id: '44'
  }

  return new Promise((resolve, reject) => {
    request({
      uri: amcURL,
      method: 'post',
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

const uploadZip = () => {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipFile)
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level.
    })
    const stat = true
    archive.pipe(output)
    archive.directory(path.join(__dirname, `../dist/${projectName}/`), projectName)
    archive.on('warning', (err) => {
      console.log(err)
      stat = false
    });

    output.on('close', () => {
      if (!stat) {
        reject('压缩失败')
        return
      }

      const formData = {
        cdn_files: {
          value: fs.createReadStream(zipFile),
          options: {
            filename: zipFileName
          }
        }
      }
      request.post({
        url: 'http://devops-new.huishoubao.com/gateway/upload_cdn',
        formData,
        json: true
      }, (err, res, data) => {
        if (err) {
          reject(err)
          return
        }

        if (data && data.result) {
          resolve()
          return
        }
  
        reject(data.info)
      })
    });

    archive.finalize();
  })
}

const creatTask = amcUser => {
  const jsonBody = {
    _head: {
      _version: '2.0.0',
      _msgType: 'request',
      _remark: '',
      _timestamps: ''
    },
    _param: {
      app_uid: 'app-53542e6c6b9',
      gray_publish_flag: '0',
      rolling_flag: '0',
      publish_type: '0',
      publish_desc: `auto ${projectName} cdn, tag ${tag}`,
      publish_time: '',
      publish_server_uid_set: '',
      cfg_file_name: '',
      cdn_file_name: zipFileName,
      cdn_upload_dir: '/web/',
      tag: '',
      token: amcUser.login_token,
      uid: amcUser.user_id
    }
  };

  return new Promise((resolve, reject) => {
    request.post('http://devops-new.huishoubao.com/gateway/add_publish_task', {
      body: jsonBody,
      json: true
    }, (err, res, data) => {
      if (err) {
        reject(err)
        return
      }

      const resData = data._data;
      if (resData && +resData._errCode === 0) {
        resolve()
        return
      }
      reject(resData._errStr)
    })
  })
}

const start = async () => {
  try {
    const amcUser = await loginAMC()
    await uploadZip()
    await creatTask(amcUser)
  } catch (err) {
    process.exit(1)
  }
}

start()
